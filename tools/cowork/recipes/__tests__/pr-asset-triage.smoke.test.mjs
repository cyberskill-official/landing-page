import { describe, expect, test } from 'vitest';
import { readFile } from 'node:fs/promises';

const RECIPE = 'tools/cowork/recipes/pr-asset-triage.md';
const PROMPT = 'tools/cowork/recipes/pr-asset-triage.prompt.md';
const TOOLS = 'tools/cowork/recipes/pr-asset-triage.tools.json';

describe('PR asset triage recipe', () => {
  test('recipe frontmatter has required fields', async () => {
    const content = await readFile(RECIPE, 'utf8');

    expect(content).toMatch(/recipe_id: A/);
    expect(content).toMatch(/trigger:/);
    expect(content).toMatch(/labels: \[assets, lumi, scenes\]/);
    expect(content).toMatch(/assets-built\/optimized\/\*\*\.glb/);
    expect(content).toMatch(/apps\/web\/public\/\*\*\.ktx2/);
    expect(content).toMatch(/manual: '@cowork triage'/);
    expect(content).toMatch(/agent_prompt: pr-asset-triage\.prompt\.md/);
    expect(content).toMatch(/tools: pr-asset-triage\.tools\.json/);
    expect(content).toMatch(/slack_channel: '#assets-prs'/);
    expect(content).toMatch(/github_threaded_reply/);
    expect(content).toMatch(/hard_gate: false/);
    expect(content).toMatch(/max_session_seconds: 90/);
    expect(content).toMatch(/Screenshot-diff summary artifacts/);
  });

  test('prompt forbids hard-gate decisions and requires confidence', async () => {
    const prompt = await readFile(PROMPT, 'utf8');

    expect(prompt).toMatch(/Never decide PASS\/FAIL/);
    expect(prompt).toMatch(/FR-OPS-003 is the hard gate/);
    expect(prompt).toMatch(/Confidence/);
    expect(prompt).toMatch(/I cannot determine/);
    expect(prompt).toMatch(/under 1000 characters/);
    expect(prompt).toMatch(/\*\.private\.glb/);
    expect(prompt).toMatch(/assets-source\/internal\/\*\*/);
    expect(prompt).toMatch(/All Green/);
    expect(prompt).toMatch(/Regression Detected/);
    expect(prompt).toMatch(/Unavailable Or Insufficient Evidence/);
    expect(prompt).toMatch(/screenshot-diff summaries/);
    expect(prompt).toMatch(/screenshot-diff deltas/);
  });

  test('tools manifest restricts operations', async () => {
    const manifest = JSON.parse(await readFile(TOOLS, 'utf8'));
    const bash = manifest.tools.find((tool) => tool.id === 'bash');
    const reader = manifest.tools.find((tool) => tool.id === 'read_file');
    const github = manifest.tools.find((tool) => tool.id === 'github_comment');

    expect(bash.scope).toBe('read-only');
    expect(bash.allowed_commands).toContain('gltf-transform inspect');
    expect(bash.allowed_commands).not.toContain('rm');
    expect(bash.allowed_commands).not.toContain('git push');
    expect(reader.scope).not.toMatch(/internal/);
    expect(reader.scope).toMatch(/docs\/qa\//);
    expect(github.scope).toBe('reply_to_existing_thread');
    expect(github.sentinel).toBe('<!-- pr-asset-delta -->');
    expect(manifest.context_window_kb).toBeLessThanOrEqual(32);
    expect(manifest.max_tool_calls).toBeLessThanOrEqual(8);
  });

  test('declares soft GitHub and Slack outputs only', async () => {
    const recipe = await readFile(RECIPE, 'utf8');
    const manifest = JSON.parse(await readFile(TOOLS, 'utf8'));
    const slack = manifest.tools.find((tool) => tool.id === 'slack_post');

    expect(recipe).toMatch(/- github_threaded_reply/);
    expect(recipe).toMatch(/- slack_post/);
    expect(recipe).not.toMatch(/status_check:/);
    expect(recipe).not.toMatch(/required_check:/);
    expect(recipe).not.toMatch(/hard_gate: true/);
    expect(slack.scope).toBe('channel:#assets-prs');
  });
});
