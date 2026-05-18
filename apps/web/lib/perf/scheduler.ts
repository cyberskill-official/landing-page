export type SchedulerPriority = 'user-blocking' | 'user-visible' | 'background';

type SchedulerLike = {
  yield?: () => Promise<void>;
  postTask?: <T>(task: () => T | Promise<T>, options?: { priority?: SchedulerPriority }) => Promise<T>;
};

type IdleCallback = (deadline?: IdleDeadline) => void;

export async function yieldNow(): Promise<void> {
  const scheduler = getScheduler();
  if (scheduler?.yield) {
    await scheduler.yield();
    return;
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export async function yieldIfNeeded(startTime: number, budgetMs = 50): Promise<boolean> {
  if (now() - startTime <= budgetMs) return false;
  await yieldNow();
  return true;
}

export function postTask<T>(
  task: () => T | Promise<T>,
  priority: SchedulerPriority = 'user-visible',
): Promise<T> {
  const scheduler = getScheduler();
  if (scheduler?.postTask) return scheduler.postTask(task, { priority });

  return new Promise<T>((resolve, reject) => {
    queueMicrotask(() => {
      try {
        resolve(task());
      } catch (error) {
        reject(error);
      }
    });
  });
}

export function onIdle(callback: IdleCallback, timeoutMs = 1000): () => void {
  const root = globalThis as typeof globalThis & {
    requestIdleCallback?: (callback: IdleCallback, options?: { timeout?: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof root.requestIdleCallback === 'function') {
    const id = root.requestIdleCallback(callback, { timeout: timeoutMs });
    return () => root.cancelIdleCallback?.(id);
  }

  const id = setTimeout(() => callback(), 1);
  return () => clearTimeout(id);
}

export type LongTaskObserverOptions = {
  thresholdMs?: number;
  onLongTask?: (entry: PerformanceEntry) => void;
};

export function observeLongTasks({
  thresholdMs = 200,
  onLongTask = defaultLongTaskLogger,
}: LongTaskObserverOptions = {}): () => void {
  if (typeof PerformanceObserver === 'undefined') return () => {};

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > thresholdMs) onLongTask(entry);
      }
    });
    observer.observe({ type: 'longtask', buffered: true });
    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

function getScheduler() {
  return (globalThis as typeof globalThis & { scheduler?: SchedulerLike }).scheduler;
}

function now() {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function defaultLongTaskLogger(entry: PerformanceEntry) {
  console.warn(`Long task: ${entry.duration.toFixed(0)}ms`, entry);
}
