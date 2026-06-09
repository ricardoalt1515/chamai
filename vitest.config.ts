import { fileURLToPath, URL } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@app": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  test: {
    // .amplify holds CDK bundling output containing stale copies of the
    // whole repo (including *.test.ts files), so vitest must never collect
    // test files from it.
    exclude: [...configDefaults.exclude, "**/.amplify/**", "**/.next/**"],
  },
});
