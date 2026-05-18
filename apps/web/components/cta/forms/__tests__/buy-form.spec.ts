import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { buyFormSchema, buyLeadUseCase } from '../BuyFormSchema';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

async function source(relativePath: string) {
  return readFile(path.join(appRoot, relativePath), 'utf8');
}

describe('FR-CTA-002 Buy form', () => {
  test('BuyFormSchema validates the expected 3-step payload', () => {
    const result = buyFormSchema.safeParse({
      company: 'Acme Studio',
      description: 'We need a launch-grade R3F product configurator.',
      email: 'buyer+test@acme.example',
      fullName: 'Buyer Person',
      helpType: 'ai-rag',
      role: 'CTO',
      timezone: 'Asia/Ho_Chi_Minh',
    });

    expect(result.success).toBe(true);
  });

  test('BuyFormSchema rejects invalid email, missing help type, and long descriptions', () => {
    const result = buyFormSchema.safeParse({
      company: 'A',
      description: 'x'.repeat(281),
      email: 'not-an-email',
      fullName: 'B',
      role: 'C',
      timezone: 'UTC',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(
        expect.arrayContaining(['company', 'description', 'email', 'fullName', 'helpType', 'role']),
      );
    }
  });

  test('lead use case includes the selected help type, timezone, and scheduled Calendly slot', () => {
    const useCase = buyLeadUseCase(
      {
        company: 'Acme Studio',
        description: 'Launch an AI-assisted configurator.',
        email: 'buyer@acme.example',
        fullName: 'Buyer Person',
        helpType: 'ai-rag',
        role: 'CTO',
        timezone: 'Asia/Ho_Chi_Minh',
      },
      'https://api.calendly.com/scheduled_events/test',
    );

    expect(useCase).toContain('AI / RAG integration');
    expect(useCase).toContain('Asia/Ho_Chi_Minh');
    expect(useCase).toContain('scheduled_events/test');
  });

  test('BuyForm is lazy-compatible, posts to /api/lead, and keeps Calendly in a separate embed wrapper', async () => {
    const [buyForm, embed] = await Promise.all([
      source('components/cta/forms/BuyForm.tsx'),
      source('components/cta/forms/CalendlyEmbed.tsx'),
    ]);

    expect(buyForm).toContain("fetch('/api/lead'");
    expect(buyForm).toContain('scheduledSlot');
    expect(buyForm).toContain("scene_id: 'scene-6'");
    expect(buyForm).toContain("track: 'buy'");
    expect(buyForm).toContain('setCurrentAnim');
    expect(embed).toContain("from 'react-calendly'");
    expect(embed).toContain('<InlineWidget');
    expect(embed).not.toContain('<iframe');
  });
});
