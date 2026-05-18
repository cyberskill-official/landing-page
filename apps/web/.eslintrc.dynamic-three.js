module.exports = {
  rules: {
    'no-scattered-dynamic-three': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require heavy Three/R3F dynamic imports to live in lib/dynamic-three.ts.',
        },
        messages: {
          scatteredDynamicImport:
            'Move this Three/R3F dynamic import to apps/web/lib/dynamic-three.ts.',
        },
      },
      create(context) {
        const filename = context.getFilename().replace(/\\/g, '/');
        const allowed = filename.endsWith('/lib/dynamic-three.ts');

        return {
          CallExpression(node) {
            if (allowed) return;
            const source = context.getSourceCode().getText(node);
            if (/dynamic\s*\(\s*\(\)\s*=>\s*import\(['"](@react-three|three|@14islands)/.test(source)) {
              context.report({ node, messageId: 'scatteredDynamicImport' });
            }
          },
        };
      },
    },
  },
};
