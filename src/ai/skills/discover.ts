import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export class SkillSpecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkillSpecError";
  }
}

export type Skill = {
  name: string;
  description: string;
};

// Default skills directory: src/ai/skills (this file's own directory)
const DEFAULT_SKILLS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)));

/**
 * Parse minimal YAML frontmatter — extracts `name` and `description` keys only.
 * Handles simple single-line values AND multi-line folded/block scalars for
 * description (by collecting continuation lines until the next key or the closing `---`).
 */
const parseFrontmatter = (content: string): Record<string, string> => {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (!match) {
    return {};
  }

  const yamlBlock = match[1];
  const lines = yamlBlock.split("\n");
  const result: Record<string, string> = {};
  let currentKey: string | null = null;
  const valueLines: string[] = [];

  const flush = () => {
    if (currentKey !== null) {
      result[currentKey] = valueLines.join(" ").trim();
    }
  };

  for (const line of lines) {
    const keyMatch = /^([a-zA-Z_-]+):\s*(.*)$/.exec(line);
    if (keyMatch) {
      flush();
      currentKey = keyMatch[1];
      valueLines.length = 0;
      const val = keyMatch[2].trim();
      if (val) {
        valueLines.push(val);
      }
    } else if (currentKey !== null && /^\s+/.test(line)) {
      // Continuation of a multi-line value
      valueLines.push(line.trim());
    }
  }

  flush();
  return result;
};

const NAME_RE = /^[a-z0-9-]{1,64}$/;

const validateSkill = (
  name: string,
  frontmatter: Record<string, string>,
  filePath: string,
): Skill => {
  const fmName = frontmatter.name?.trim() ?? "";
  const description = frontmatter.description?.trim() ?? "";

  if (!NAME_RE.test(fmName)) {
    throw new SkillSpecError(
      `SKILL.md at "${filePath}": name "${fmName}" does not match /^[a-z0-9-]{1,64}$/`,
    );
  }

  if (fmName !== name) {
    throw new SkillSpecError(
      `SKILL.md at "${filePath}": frontmatter name "${fmName}" does not match directory name "${name}"`,
    );
  }

  if (!description) {
    throw new SkillSpecError(
      `SKILL.md at "${filePath}": description is required and must be non-empty`,
    );
  }

  if (description.length > 1024) {
    throw new SkillSpecError(
      `SKILL.md at "${filePath}": description exceeds 1024 characters (got ${description.length})`,
    );
  }

  return { name: fmName, description };
};

/**
 * Discover all skills in the given directory (defaults to the skills directory
 * this file lives in). Each subdirectory that contains a SKILL.md is treated
 * as a skill. Returns an array sorted by name.
 *
 * Throws `SkillSpecError` if any SKILL.md fails Anthropic Agent Skills spec
 * validation (name format, description required/length).
 */
export const discoverSkills = (skillsDir: string = DEFAULT_SKILLS_DIR): Skill[] => {
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const skills: Skill[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillPath = path.join(skillsDir, entry.name, "SKILL.md");
    if (!fs.existsSync(skillPath)) {
      continue;
    }

    const content = fs.readFileSync(skillPath, "utf-8");
    const frontmatter = parseFrontmatter(content);
    const skill = validateSkill(entry.name, frontmatter, skillPath);
    skills.push(skill);
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Build the `<available_skills>` XML block from the filesystem, identical in
 * structure to the handwritten block that was previously in h2o-allegiant.md.
 * Called once at module load in agent.ts — result is cached in the exported
 * constant.
 */
export const buildSkillsXmlBlock = (skillsDir?: string): string => {
  const skills = discoverSkills(skillsDir);

  const intro =
    'The `loadSkill` tool returns the body of one of these skills. Each skill is a self-contained reasoning pass — call `loadSkill({ name: "..." })` with the exact directory name.';

  const items = skills.map((s) => `- \`${s.name}\` — ${s.description}`).join("\n");

  return `<available_skills>\n${intro}\n\n${items}\n</available_skills>`;
};
