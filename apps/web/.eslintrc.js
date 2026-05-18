module.exports = {
  plugins: ['cyberskill-rules'],
  rules: {
    'cyberskill-rules/no-alloc-in-use-frame': 'error',
    'cyberskill-rules/no-long-title': 'error',
    'cyberskill-rules/no-outline-none': 'error',
    'cyberskill-rules/no-undisposed-three-ref': 'error',
  },
  overrides: [
    {
      files: ['**/__tests__/**', '*.test.{ts,tsx}', '*.stories.{ts,tsx}'],
      rules: {
        'cyberskill-rules/no-alloc-in-use-frame': 'off',
        'cyberskill-rules/no-long-title': 'off',
        'cyberskill-rules/no-outline-none': 'off',
        'cyberskill-rules/no-undisposed-three-ref': 'off',
      },
    },
  ],
};
