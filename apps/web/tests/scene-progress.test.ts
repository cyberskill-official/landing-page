import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import {
  SceneProgressProvider,
  useSceneProgress,
  useSceneProgressState,
} from '../lib/use-scene-progress';

function ProgressProbe() {
  const progress = useSceneProgress();
  const state = useSceneProgressState();
  return createElement('span', {
    'data-progress': progress,
    'data-culled': String(state.culled),
    'data-scene-id': state.sceneId ?? '',
  });
}

describe('FR-WEB-003 scene progress context', () => {
  test('defaults to zero progress outside a tunnel', () => {
    const html = renderToStaticMarkup(createElement(ProgressProbe));

    expect(html).toContain('data-progress="0"');
    expect(html).toContain('data-culled="true"');
  });

  test('provides tunnel progress to descendants', () => {
    const html = renderToStaticMarkup(
      createElement(
        SceneProgressProvider,
        { value: { progress: 0.42, culled: false, sceneId: 'scene-3' } },
        createElement(ProgressProbe),
      ),
    );

    expect(html).toContain('data-progress="0.42"');
    expect(html).toContain('data-culled="false"');
    expect(html).toContain('data-scene-id="scene-3"');
  });
});
