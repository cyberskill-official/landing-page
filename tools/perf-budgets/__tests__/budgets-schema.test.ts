import { describe, expect, test } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const BUDGETS_PATH = resolve('tools/perf-budgets/budgets.json');
const SCHEMA_PATH = resolve('tools/perf-budgets/budgets.schema.json');

type BudgetMetric = {
  target: number;
  fail: number;
  _unit: string;
};

const budgets = JSON.parse(readFileSync(BUDGETS_PATH, 'utf8'));
const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));

function lowerIsBetterMetrics(): BudgetMetric[] {
  return [
    budgets.cwv.lcp_ms_p75,
    budgets.cwv.inp_ms_p75,
    budgets.cwv.cls,
    budgets.js_bundle.main_chunk_kb_gz,
    budgets.page_weight.first_scene_mb,
    budgets.page_weight.all_scenes_mb,
    budgets.assets.lumi_glb_mb,
    budgets.assets.nonla_glb_kb,
    budgets.assets.hero_scene_props_mb,
    budgets.assets.each_scene_props_mb,
    budgets.draw_calls_per_scene_max,
  ];
}

describe('FR-OPS-002 budgets.json', () => {
  test('has schema pointer and semver version', () => {
    expect(budgets.$schema).toBe('./budgets.schema.json');
    expect(budgets.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('has all FR-PERF-001 budget paths and canonical values', () => {
    expect(budgets.cwv.lcp_ms_p75.target).toBe(2500);
    expect(budgets.cwv.inp_ms_p75.target).toBe(200);
    expect(budgets.cwv.cls.target).toBe(0.1);
    expect(budgets.cwv.fps_desktop.target).toBe(60);
    expect(budgets.cwv.fps_mobile.target).toBe(30);
    expect(budgets.js_bundle.main_chunk_kb_gz.target).toBe(200);
    expect(budgets.page_weight.first_scene_mb.fail).toBe(3.5);
    expect(budgets.assets.lumi_glb_mb.fail).toBe(3.5);
    expect(budgets.draw_calls_per_scene_max.target).toBe(100);
  });

  test('keeps target/fail invariants for lower-is-better metrics', () => {
    for (const metric of lowerIsBetterMetrics()) {
      expect(metric.target).toBeLessThan(metric.fail);
    }
  });

  test('keeps FPS target above fail floors', () => {
    expect(budgets.cwv.fps_desktop.target).toBeGreaterThan(budgets.cwv.fps_desktop.fail);
    expect(budgets.cwv.fps_mobile.target).toBeGreaterThan(budgets.cwv.fps_mobile.fail);
  });

  test('validates budgets.json against Draft 2020-12 schema', () => {
    const ajv = new Ajv2020({ allErrors: true });
    const validate = ajv.compile(schema);

    expect(validate(budgets), JSON.stringify(validate.errors, null, 2)).toBe(true);
  });
});
