export type OutlineNoneViolation = {
  index: number;
  line: number;
  column: number;
  match: string;
};

const outlineNonePattern = /outline\s*:\s*(none|0)\b/gi;

export function findOutlineNoneViolations(source: string): OutlineNoneViolation[] {
  const violations: OutlineNoneViolation[] = [];

  for (const match of source.matchAll(outlineNonePattern)) {
    const index = match.index ?? 0;
    if (hasAccessibleReplacement(source, index)) continue;
    const position = lineAndColumn(source, index);
    violations.push({
      index,
      line: position.line,
      column: position.column,
      match: match[0],
    });
  }

  return violations;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Forbid outline:none without an accessible focus-visible replacement.',
    },
    messages: {
      outlineNone:
        'Avoid outline:none unless the same focus-visible rule provides a visible replacement such as a gold box-shadow ring.',
    },
  },
  create(context: {
    getSourceCode: () => { text: string };
    report: (descriptor: { loc: { line: number; column: number }; messageId: 'outlineNone' }) => void;
  }) {
    return {
      Program() {
        for (const violation of findOutlineNoneViolations(context.getSourceCode().text)) {
          context.report({
            loc: { line: violation.line, column: violation.column - 1 },
            messageId: 'outlineNone',
          });
        }
      },
    };
  },
};

export default rule;

function hasAccessibleReplacement(source: string, index: number) {
  const block = source.slice(Math.max(0, index - 120), Math.min(source.length, index + 180));
  return /:focus-visible/.test(block) && /box-shadow\s*:/.test(block);
}

function lineAndColumn(source: string, index: number) {
  const lines = source.slice(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}
