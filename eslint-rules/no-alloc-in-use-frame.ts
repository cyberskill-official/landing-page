import ts from 'typescript';

export const ALLOC_CLASSES = [
  'Vector2',
  'Vector3',
  'Vector4',
  'Quaternion',
  'Matrix3',
  'Matrix4',
  'Color',
  'Euler',
  'Box3',
  'Sphere',
] as const;

const allocationClassSet = new Set<string>(ALLOC_CLASSES);

export type UseFrameAllocationViolation = {
  kind: 'alloc-in-use-frame' | 'missing-use-memo';
  className: string;
  line: number;
  column: number;
  message: string;
  fix?: string;
};

export function findUseFrameAllocationViolations(
  source: string,
  filename = 'source.tsx',
): UseFrameAllocationViolation[] {
  if (isIgnoredFile(filename)) return [];

  const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations: UseFrameAllocationViolation[] = [];

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && isUseFrameCall(node)) {
      const callback = node.arguments[0];
      if (callback) {
        findAllocationsInsideUseFrame(callback, sourceFile, violations);
      }
    }

    if (isFunctionLikeWithBody(node)) {
      findRenderAllocationsUsedInUseFrame(node.body, sourceFile, violations);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return dedupeViolations(violations);
}

export function buildUseMemoReplacement(expression: string): string {
  return `useMemo(() => ${expression}, [])`;
}

export const rule = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Forbid Three.js allocations inside @react-three/fiber useFrame callbacks.',
    },
    messages: {
      alloc:
        'Avoid new {{ className }}() inside useFrame. Lift to a module constant or useMemo. Per-frame allocations cause GC pressure.',
      missingMemo:
        '{{ className }} is created during render and used inside useFrame. Wrap it with useMemo or lift it to a module constant to avoid GC pressure.',
    },
  },
  create(context: {
    getFilename: () => string;
    getSourceCode: () => { text: string; getText: (node: unknown) => string };
    report: (descriptor: {
      loc: { line: number; column: number };
      messageId: 'alloc' | 'missingMemo';
      data: Record<string, string>;
    }) => void;
  }) {
    return {
      Program() {
        const filename = context.getFilename();
        const source = context.getSourceCode().text;

        for (const violation of findUseFrameAllocationViolations(source, filename)) {
          context.report({
            loc: { line: violation.line, column: violation.column - 1 },
            messageId: violation.kind === 'alloc-in-use-frame' ? 'alloc' : 'missingMemo',
            data: { className: violation.className },
          });
        }
      },
    };
  },
};

export default rule;

function findAllocationsInsideUseFrame(
  root: ts.Node,
  sourceFile: ts.SourceFile,
  violations: UseFrameAllocationViolation[],
) {
  function visit(node: ts.Node) {
    if (ts.isNewExpression(node)) {
      const className = getAllocationClassName(node.expression);
      if (className) {
        const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        const expression = node.getText(sourceFile);
        violations.push({
          kind: 'alloc-in-use-frame',
          className,
          line: position.line + 1,
          column: position.character + 1,
          message: `Avoid new ${className}() inside useFrame. Lift to a module constant or useMemo. Per-frame allocations cause GC pressure.`,
          fix: buildUseMemoReplacement(expression),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(root);
}

function findRenderAllocationsUsedInUseFrame(
  body: ts.ConciseBody,
  sourceFile: ts.SourceFile,
  violations: UseFrameAllocationViolation[],
) {
  if (!ts.isBlock(body)) return;

  const renderAllocations = new Map<string, { className: string; line: number; column: number; expression: string }>();
  const useFrameIdentifiers = new Set<string>();

  function visitRenderBody(node: ts.Node, insideUseFrame = false) {
    if (ts.isCallExpression(node) && isUseFrameCall(node)) {
      const callback = node.arguments[0];
      if (callback) collectIdentifiers(callback, useFrameIdentifiers);
      ts.forEachChild(node, (child) => visitRenderBody(child, true));
      return;
    }

    if (!insideUseFrame && ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const initializer = node.initializer;
      const newExpression = unwrapUseMemoInitializer(initializer);
      if (initializer && ts.isNewExpression(initializer)) {
        const className = getAllocationClassName(initializer.expression);
        if (className) {
          const position = sourceFile.getLineAndCharacterOfPosition(initializer.getStart(sourceFile));
          renderAllocations.set(node.name.text, {
            className,
            line: position.line + 1,
            column: position.character + 1,
            expression: initializer.getText(sourceFile),
          });
        }
      } else if (newExpression) {
        const className = getAllocationClassName(newExpression.expression);
        if (className) renderAllocations.delete(node.name.text);
      }
    }

    ts.forEachChild(node, (child) => visitRenderBody(child, insideUseFrame));
  }

  visitRenderBody(body);

  for (const [name, allocation] of renderAllocations) {
    if (!useFrameIdentifiers.has(name)) continue;
    violations.push({
      kind: 'missing-use-memo',
      className: allocation.className,
      line: allocation.line,
      column: allocation.column,
      message: `${allocation.className} is created during render and used inside useFrame. Wrap it with useMemo or lift it to a module constant to avoid GC pressure.`,
      fix: buildUseMemoReplacement(allocation.expression),
    });
  }
}

function collectIdentifiers(root: ts.Node, names: Set<string>) {
  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) names.add(node.text);
    ts.forEachChild(node, visit);
  }

  visit(root);
}

function unwrapUseMemoInitializer(node: ts.Expression | undefined): ts.NewExpression | null {
  if (!node || !ts.isCallExpression(node) || node.expression.getText() !== 'useMemo') return null;
  const callback = node.arguments[0];
  if (!callback) return null;

  if ((ts.isArrowFunction(callback) || ts.isFunctionExpression(callback)) && ts.isNewExpression(callback.body)) {
    return callback.body;
  }

  return null;
}

function isUseFrameCall(node: ts.CallExpression) {
  return ts.isIdentifier(node.expression) && node.expression.text === 'useFrame';
}

function getAllocationClassName(expression: ts.Expression) {
  if (ts.isIdentifier(expression) && allocationClassSet.has(expression.text)) return expression.text;
  if (ts.isPropertyAccessExpression(expression) && allocationClassSet.has(expression.name.text)) {
    return expression.name.text;
  }
  return null;
}

function isIgnoredFile(filename: string) {
  const normalized = filename.replace(/\\/g, '/');
  return (
    normalized.includes('/__tests__/') ||
    /\.test\.[cm]?[tj]sx?$/.test(normalized) ||
    /\.stories\.[cm]?[tj]sx?$/.test(normalized)
  );
}

function isFunctionLikeWithBody(node: ts.Node): node is ts.FunctionLikeDeclaration & { body: ts.ConciseBody } {
  return (
    (ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)) &&
    Boolean(node.body)
  );
}

function dedupeViolations(violations: UseFrameAllocationViolation[]) {
  const seen = new Set<string>();
  return violations.filter((violation) => {
    const key = `${violation.kind}:${violation.className}:${violation.line}:${violation.column}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
