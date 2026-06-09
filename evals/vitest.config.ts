import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../src", import.meta.url)),
      "@app": fileURLToPath(new URL("../app", import.meta.url)),
    },
  },
  test: {
    // The `.eval.ts` suffix keeps these out of the root `vitest run` default
    // include, so `bun run test` never collects eval files.
    include: ["evals/**/*.eval.ts"],
    testTimeout: 240_000,
  },
});
