import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': appRoot,
    },
  },
  test: {
    environment: 'node',
    include: [
      'app/**/*.test.ts',
      'app/**/*.test.tsx',
      'components/**/*.test.ts',
      'components/**/*.test.tsx',
      'components/**/*.spec.ts',
      'components/**/*.spec.tsx',
      'tests/**/*.test.ts',
      'lib/**/*.test.ts',
      'sanity/**/*.test.ts',
      'scripts/**/*.test.mjs',
    ],
  },
});
