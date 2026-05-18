export type LongTitleViolation = {
  title: string;
  length: number;
  index: number;
};

const titleLiteralPattern = /\btitle\s*:\s*['"`]([^'"`]+)['"`]/g;

export function findLongTitleLiterals(source: string, budget = 60): LongTitleViolation[] {
  const violations: LongTitleViolation[] = [];

  for (const match of source.matchAll(titleLiteralPattern)) {
    const title = match[1] ?? '';
    if (title.length > budget) {
      violations.push({ title, length: title.length, index: match.index ?? 0 });
    }
  }

  return violations;
}

const rule = {
  meta: {
    type: 'problem',
    docs: { description: 'Title literals in metadata must stay within the SEO budget.' },
    messages: {
      tooLong: 'metadata title exceeds 60 chars ({{ length }})',
    },
  },
  create(context: {
    getSourceCode: () => { text: string };
    report: (descriptor: { loc: { line: number; column: number }; messageId: 'tooLong'; data: { length: string } }) => void;
  }) {
    return {
      Program() {
        const source = context.getSourceCode().text;
        for (const violation of findLongTitleLiterals(source)) {
          const lines = source.slice(0, violation.index).split(/\r?\n/);
          context.report({
            loc: { line: lines.length, column: lines.at(-1)?.length ?? 0 },
            messageId: 'tooLong',
            data: { length: String(violation.length) },
          });
        }
      },
    };
  },
};

export default rule;
