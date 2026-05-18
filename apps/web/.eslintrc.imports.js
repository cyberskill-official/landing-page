module.exports = {
  rules: {
    'no-namespace-three': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require named imports for Three and React Three packages.',
        },
        messages: {
          namespaceImport:
            'Namespace imports break tree-shake; use named imports from "{{ source }}".',
          requireImport:
            'CommonJS Three imports break tree-shake; use named ESM imports from "{{ source }}".',
        },
      },
      create(context) {
        function isThreeFamily(source) {
          return source === 'three' || source.startsWith('@react-three/');
        }

        return {
          ImportDeclaration(node) {
            if (typeof node.source.value !== 'string') return;
            const source = node.source.value;
            if (!isThreeFamily(source)) return;

            const hasNamespace = node.specifiers.some(
              (specifier) => specifier.type === 'ImportNamespaceSpecifier',
            );
            if (hasNamespace) {
              context.report({ node, messageId: 'namespaceImport', data: { source } });
            }
          },
          CallExpression(node) {
            const callee = node.callee;
            const firstArg = node.arguments[0];
            if (callee.type !== 'Identifier' || callee.name !== 'require') return;
            if (!firstArg || firstArg.type !== 'Literal' || typeof firstArg.value !== 'string') return;
            const source = firstArg.value;
            if (isThreeFamily(source)) {
              context.report({ node, messageId: 'requireImport', data: { source } });
            }
          },
        };
      },
    },
  },
};
