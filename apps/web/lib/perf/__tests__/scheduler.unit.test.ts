import { afterEach, describe, expect, test, vi } from 'vitest';
import { observeLongTasks, onIdle, postTask, yieldIfNeeded, yieldNow } from '../scheduler';

type MutableGlobal = typeof globalThis & {
  scheduler?: {
    yield?: () => Promise<void>;
    postTask?: <T>(task: () => T | Promise<T>, options?: { priority?: string }) => Promise<T>;
  };
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (id: number) => void;
  PerformanceObserver?: typeof PerformanceObserver;
};

const root = globalThis as MutableGlobal;

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(root, 'scheduler');
  Reflect.deleteProperty(root, 'requestIdleCallback');
  Reflect.deleteProperty(root, 'cancelIdleCallback');
  vi.restoreAllMocks();
});

describe('FR-PERF-007 scheduler helpers', () => {
  test('yieldNow uses scheduler.yield when available', async () => {
    const yieldMock = vi.fn().mockResolvedValue(undefined);
    root.scheduler = { yield: yieldMock };

    await yieldNow();

    expect(yieldMock).toHaveBeenCalledTimes(1);
  });

  test('yieldNow falls back to setTimeout when scheduler is missing', async () => {
    vi.useFakeTimers();
    const promise = yieldNow();
    await vi.runOnlyPendingTimersAsync();

    await expect(promise).resolves.toBeUndefined();
  });

  test('yieldIfNeeded yields only when the budget is exceeded', async () => {
    const yieldMock = vi.fn().mockResolvedValue(undefined);
    root.scheduler = { yield: yieldMock };

    expect(await yieldIfNeeded(performance.now(), 50)).toBe(false);
    expect(await yieldIfNeeded(performance.now() - 60, 50)).toBe(true);
    expect(yieldMock).toHaveBeenCalledTimes(1);
  });

  test('postTask forwards priority to scheduler.postTask', async () => {
    const postTaskMock = vi.fn(async <T,>(task: () => T | Promise<T>) => task());
    root.scheduler = { postTask: postTaskMock as NonNullable<MutableGlobal['scheduler']>['postTask'] };

    await expect(postTask(() => 'done', 'user-blocking')).resolves.toBe('done');
    expect(postTaskMock).toHaveBeenCalledWith(expect.any(Function), { priority: 'user-blocking' });
  });

  test('onIdle uses requestIdleCallback with timeout and can cancel', () => {
    const idleMock = vi.fn(() => 42);
    const cancelMock = vi.fn();
    root.requestIdleCallback = idleMock;
    root.cancelIdleCallback = cancelMock;

    const cancel = onIdle(() => {}, 1000);
    cancel();

    expect(idleMock).toHaveBeenCalledWith(expect.any(Function), { timeout: 1000 });
    expect(cancelMock).toHaveBeenCalledWith(42);
  });

  test('observeLongTasks reports entries above threshold and no-ops when unavailable', () => {
    const disconnect = vi.fn();
    const entry = { duration: 250 } as PerformanceEntry;
    const onLongTask = vi.fn();
    const OriginalObserver = root.PerformanceObserver;

    root.PerformanceObserver = vi.fn().mockImplementation((callback: PerformanceObserverCallback) => ({
      observe: vi.fn(() => callback({ getEntries: () => [entry] } as PerformanceObserverEntryList, {} as PerformanceObserver)),
      disconnect,
    })) as unknown as typeof PerformanceObserver;

    const cleanup = observeLongTasks({ onLongTask });
    cleanup();

    expect(onLongTask).toHaveBeenCalledWith(entry);
    expect(disconnect).toHaveBeenCalledTimes(1);

    root.PerformanceObserver = OriginalObserver;
  });
});
