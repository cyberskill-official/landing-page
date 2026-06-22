import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Components use the automatic JSX runtime (no `import React`), matching the
  // Next build. Transform test-imported JSX the same way so rendering components
  // in tests (e.g. the axe check) does not need a React global in scope.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
