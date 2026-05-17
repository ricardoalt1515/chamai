// Regenerates src/ai/prompts/h2o-allegiant.ts from the Markdown source.
// `bun run prompts:generate` writes; `bun run prompts:check` fails on drift.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = resolve(__dirname, "..", "src", "ai", "prompts");
const mdPath = join(PROMPTS_DIR, "h2o-allegiant.md");
const tsPath = join(PROMPTS_DIR, "h2o-allegiant.ts");
const exportName = "h2oAllegiantPrompt";

const content = readFileSync(mdPath, "utf8");
const sourceBaseName = mdPath.split("/").pop();
const generated = [
  `// Generated from ./${sourceBaseName}. Keep the Markdown source as the editing surface.`,
  "// biome-ignore format: generated prompt string",
  `export const ${exportName} = ${JSON.stringify(content)}`,
  ";",
  "",
].join("\n");

if (process.argv[2] === "--check") {
  if (readFileSync(tsPath, "utf8") !== generated) {
    console.error(`[prompts] DRIFT: ${tsPath} out of sync. Run \`bun run prompts:generate\`.`);
    process.exit(1);
  }
} else {
  writeFileSync(tsPath, generated);
  console.log(`[prompts] wrote ${tsPath}`);
}
