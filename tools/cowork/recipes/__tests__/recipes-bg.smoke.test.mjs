import { describe, expect, test } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = 'tools/cowork/recipes';
const RECIPES = ['b', 'c', 'd', 'e', 'f', 'g'];

async function recipeFile(id) {
  const files = await readdir(DIR);
  return join(DIR, files.find((file) => file.startsWith(`recipe-${id}-`) && file.endsWith('.md') && !file.endsWith('.prompt.md')));
}

async function promptFile(id) {
  const files = await readdir(DIR);
  return join(DIR, files.find((file) => file.startsWith(`recipe-${id}-`) && file.endsWith('.prompt.md')));
}

describe('Cowork Recipes B-G', () => {
  test.each(RECIPES)('recipe %s has required soft-gate frontmatter', async (id) => {
    const content = await readFile(await recipeFile(id), 'utf8');

    expect(content).toMatch(new RegExp(`recipe_id: ${id.toUpperCase()}`));
    expect(content).toMatch(/trigger:/);
    expect(content).toMatch(/inputs:/);
    expect(content).toMatch(/outputs:/);
    expect(content).toMatch(/agent_prompt: recipe-.*\.prompt\.md/);
    expect(content).toMatch(/success_criteria:/);
    expect(content).toMatch(/priority: (SHOULD|COULD)/);
    expect(content).toMatch(/hard_gate: false/);
    expect(content).not.toMatch(/priority: MUST/);
  });

  test.each(RECIPES)('recipe %s prompt exists and avoids hard-gate semantics', async (id) => {
    const prompt = await readFile(await promptFile(id), 'utf8');

    expect(prompt.length).toBeGreaterThan(80);
    expect(prompt).toMatch(/not a hard gate|Founder signoff is required/i);
  });

  test('index lists all six recipes', async () => {
    const index = await readFile(join(DIR, 'RECIPES-BG-INDEX.md'), 'utf8');

    for (const id of RECIPES) {
      expect(index.toLowerCase()).toContain(`recipe ${id}`);
    }
  });

  test('Recipe G preserves cultural allowlist and founder gate', async () => {
    const recipe = await readFile(join(DIR, 'recipe-g-nonla-variants.md'), 'utf8');
    const prompt = await readFile(join(DIR, 'recipe-g-nonla-variants.prompt.md'), 'utf8');

    expect(recipe).toMatch(/variants: \[tet, midautumn, sunset\]/);
    expect(recipe).toMatch(/founder_signoff_required: true/);
    expect(prompt).toMatch(/casual nón lá/);
    expect(prompt).toMatch(/Do NOT add dragons/);
    expect(prompt).toMatch(/mooncake/);
  });
});
