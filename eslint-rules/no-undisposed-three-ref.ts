import ts from 'typescript';

const disposableThreeTypes = [
  'BufferGeometry',
  'Material',
  'MeshBasicMaterial',
  'MeshPhysicalMaterial',
  'MeshStandardMaterial',
  'Object3D',
  'Group',
  'Mesh',
  'RawShaderMaterial',
  'ShaderMaterial',
  'Texture',
  'WebGLRenderTarget',
];

export type UndisposedThreeRefViolation = {
  refName: string;
  typeName: string;
  line: number;
  column: number;
};

export function findUndisposedThreeRefs(source: string, filename = 'source.tsx'): UndisposedThreeRefViolation[] {
  if (filename.includes('/__tests__/') || filename.includes('\\__tests__\\')) return [];

  const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const refs = new Map<string, UndisposedThreeRefViolation>();
  const disposedRefNames = new Set<string>();

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && isUseRefCall(node.initializer)) {
      const typeName = node.initializer.typeArguments?.[0]?.getText(sourceFile) ?? '';
      const disposableType = disposableThreeTypes.find((name) => typeName.includes(name));
      if (disposableType) {
        const position = sourceFile.getLineAndCharacterOfPosition(node.name.getStart(sourceFile));
        refs.set(node.name.text, {
          refName: node.name.text,
          typeName: disposableType,
          line: position.line + 1,
          column: position.character + 1,
        });
      }
    }

    if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === 'useDisposeOnUnmount') {
      for (const argument of node.arguments) {
        collectDisposedRefNames(argument, sourceFile, disposedRefNames);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return [...refs.values()].filter((violation) => !disposedRefNames.has(violation.refName));
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require Three.js refs to be cleaned with useDisposeOnUnmount.',
    },
    messages: {
      missingDispose:
        'Three.js ref "{{ refName }}" stores {{ typeName }} and must be passed to useDisposeOnUnmount().',
    },
  },
  create(context: {
    getFilename: () => string;
    getSourceCode: () => { text: string };
    report: (descriptor: { loc: { line: number; column: number }; messageId: string; data: Record<string, string> }) => void;
  }) {
    return {
      Program() {
        const filename = context.getFilename();
        const source = context.getSourceCode().text;

        for (const violation of findUndisposedThreeRefs(source, filename)) {
          context.report({
            loc: { line: violation.line, column: violation.column - 1 },
            messageId: 'missingDispose',
            data: { refName: violation.refName, typeName: violation.typeName },
          });
        }
      },
    };
  },
};

export default rule;

function isUseRefCall(node: ts.Expression | undefined): node is ts.CallExpression {
  return Boolean(
    node &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'useRef',
  );
}

function collectDisposedRefNames(node: ts.Node, sourceFile: ts.SourceFile, names: Set<string>) {
  if (ts.isIdentifier(node)) {
    names.add(node.text);
    return;
  }

  if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) collectDisposedRefNames(element, sourceFile, names);
    return;
  }

  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (ts.isShorthandPropertyAssignment(property)) names.add(property.name.text);
      if (ts.isPropertyAssignment(property)) collectDisposedRefNames(property.initializer, sourceFile, names);
    }
  }
}
