module.exports = {
  rules: {
    'no-setstate-in-useframe': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Ban Zustand store writes inside @react-three/fiber useFrame callbacks.',
        },
        messages: {
          storeWriteInUseFrame: 'Do not write to Zustand stores inside useFrame; mutate Object3D refs instead.',
        },
      },
      create(context) {
        function source(node) {
          return context.getSourceCode().getText(node);
        }

        return {
          CallExpression(node) {
            const callee = node.callee;
            if (callee.type !== 'Identifier' || callee.name !== 'useFrame') return;
            const callback = node.arguments[0];
            if (!callback || !('body' in callback)) return;

            const body = source(callback.body);
            if (
              /use[A-Z][A-Za-z]+Store\.setState\s*\(/.test(body) ||
              /\bset[A-Z][A-Za-z]*\s*\(/.test(body)
            ) {
              context.report({ node: callback, messageId: 'storeWriteInUseFrame' });
            }
          },
        };
      },
    },
  },
};
