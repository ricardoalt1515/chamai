import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

// Dynamically imported after setup so we can control the skills dir
let discoverSkills: (skillsDir?: string) => { name: string; description: string }[];
let buildSkillsXmlBlock: (skillsDir?: string) => string;
let SkillSpecError: new (message: string) => Error;

describe("discoverSkills", () => {
  beforeAll(async () => {
    const mod = await import("./discover");
    discoverSkills = mod.discoverSkills;
    buildSkillsXmlBlock = mod.buildSkillsXmlBlock;
    SkillSpecError = mod.SkillSpecError;
  });

  it("returns exactly 5 H2O skills from the default skills directory", () => {
    const skills = discoverSkills();
    expect(skills).toHaveLength(5);
  });

  it("each result has name matching the directory name and a non-empty description", () => {
    const skills = discoverSkills();
    const expectedNames = [
      "h2o-allegiant-brand",
      "h2o-evidence-and-context",
      "h2o-field-brief",
      "h2o-positioning",
      "h2o-stage-and-gaps",
    ];
    const actualNames = skills.map((s) => s.name).sort();
    expect(actualNames).toEqual(expectedNames.sort());
    for (const skill of skills) {
      expect(skill.description.length).toBeGreaterThan(0);
    }
  });

  it("buildSkillsXmlBlock includes all 5 skill names and the intro paragraph", () => {
    const block = buildSkillsXmlBlock();
    expect(block).toContain("<available_skills>");
    expect(block).toContain("</available_skills>");
    expect(block).toContain("loadSkill");
    expect(block).toContain("h2o-evidence-and-context");
    expect(block).toContain("h2o-stage-and-gaps");
    expect(block).toContain("h2o-positioning");
    expect(block).toContain("h2o-field-brief");
    expect(block).toContain("h2o-allegiant-brand");
  });

  it("buildSkillsXmlBlock canonical format (Bedrock cache-key stability)", () => {
    const block = buildSkillsXmlBlock();
    expect(block).toMatchInlineSnapshot(`
      "<available_skills>
      The \`loadSkill\` tool returns the body of one of these skills. Each skill is a self-contained reasoning pass — call \`loadSkill({ name: "..." })\` with the exact directory name.

      - \`h2o-allegiant-brand\` — H2O Allegiant visual identity system — colour palettes (primary brand, functional accents, chart tertiary), typography (Inter / Inter Tight / JetBrains Mono with Helvetica fallback), callout components (gate callout, flag callout, strategic insight, why-it-matters, theme header), cover block templates (Field Brief, Playbook, Analytical Read, Proposal Shell), and table styles (comparison, decision-maker matrix, solution fit). Consumed by h2o-field-brief to render the four-artefact opportunity package (Field Brief, Playbook, Analytical Read, Proposal Shell — PDFs only, no Markdown mirrors). Not a primary user-facing skill — never triggered by user intent; only loaded by h2o-field-brief when rendering PDFs. Read SKILL.md first for rationale and usage; then import primitives from brand.py.
      - \`h2o-evidence-and-context\` — Read the case file in a single integrated pass and produce the contextual picture the downstream skills need — sub-stream decomposition, lens classification, evidence extraction, customer behaviour read, and the active flag inventory. Replaces v2's separate segmentation-router, water-evidence-interpretation, solution-lens-light, and compliance-and-safety-flagging skills. One pass, one integrated output, depth scaled to deal stage. Trigger at the start of every substantive turn that involves new evidence (case file upload, new document, customer email, call recap) or any opportunity-advancing request. Skip for focused conversational questions that don't reference new evidence. Always produces the integrated context record; never blocks downstream skills. Lean — depth scales with stage (Lead/Qualify run light, Position/Propose run deep).
      - \`h2o-field-brief\` — Render the four-artefact opportunity package — Field Brief, Playbook, Analytical Read, Proposal Shell — for any opportunity-advancing turn. Produced in priority order (Field Brief first, presented immediately, then the other three) so the field agent sees value within seconds. Content depth scales with deal stage — at Lead/Qualify the Proposal Shell is thin or "too early to draft"; at Position/Propose it's full. Also produces three lightweight non-PDF outputs on demand: follow-up email drafts, site-visit prep checklists, and objection responses. Uses brand kit primitives. Compose, don't re-reason — consume the upstream positioning record verbatim. Trigger after h2o-positioning. Does not produce markdown mirrors. Does not run on focused conversational questions (those use the fast path in the system prompt).
      - \`h2o-positioning\` — Commit to a defended commercial position on a US wastewater opportunity at the current deal stage — proposed solution architecture (named treatment-stage capabilities), customer-side win-win argument (what changes for them, why they should want it), fully-priced cost of their alternative (BATNA over 5 years including surcharges, forced retrofits, enforcement exposure), deal-size range with confidence, deal anchor and phase-2 prize, primary win frame, and 2-3 ranked kill risks with mitigations. Trigger after h2o-stage-and-gaps has classified the stage and h2o-evidence-and-context has produced the integrated context record. Also trigger when the field agent asks for sizing, positioning, "what would we propose", "what should I open with", "how do I win this", "what's the customer's alternative", or "why should they want this". Lean-forward — always commit to a position with confidence labels; never defer because evidence is incomplete. Produces the content h2o-field-brief renders into all four artefacts.
      - \`h2o-stage-and-gaps\` — Classify the current deal stage (Lead → Qualify → Scope → Position → Propose → Close) and produce the stage-conditional gap list — what's Required to advance to the next stage and what's Nice-to-have. Replaces v2's separate h2o-deal-stager and h2o-discovery-gap-analysis skills. Always returns a stage and always advances; never blocks downstream skills. Handles regression as a first-class case. Surfaces stage tension when evidence is ambiguous. Trigger after h2o-evidence-and-context. Also trigger when the field agent asks "what stage is this", "what do we need to advance", "did this deal stall", or "what's missing". Confidence-labelled output (HIGH / MEDIUM / LOW). Feeds the stage badge on the Field Brief and the advance criteria that calibrate Section 4's actions.
      </available_skills>"
    `);
  });
});

describe("SkillSpecError — validation", () => {
  let tmpDir: string;

  beforeAll(async () => {
    const mod = await import("./discover");
    discoverSkills = mod.discoverSkills;
    SkillSpecError = mod.SkillSpecError;
  });

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "discover-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("throws SkillSpecError when name is invalid (contains uppercase)", () => {
    const skillDir = path.join(tmpDir, "BadName");
    fs.mkdirSync(skillDir);
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: BadName\ndescription: A valid description\n---\n\n# Content",
    );

    expect(() => discoverSkills(tmpDir)).toThrow(SkillSpecError);
  });

  it("throws SkillSpecError when description is missing", () => {
    const skillDir = path.join(tmpDir, "no-description");
    fs.mkdirSync(skillDir);
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: no-description\n---\n\n# Content",
    );

    expect(() => discoverSkills(tmpDir)).toThrow(SkillSpecError);
  });

  it("throws SkillSpecError when description is empty", () => {
    const skillDir = path.join(tmpDir, "empty-desc");
    fs.mkdirSync(skillDir);
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: empty-desc\ndescription: \n---\n\n# Content",
    );

    expect(() => discoverSkills(tmpDir)).toThrow(SkillSpecError);
  });

  it("throws SkillSpecError when description exceeds 1024 chars", () => {
    const longDesc = "x".repeat(1025);
    const skillDir = path.join(tmpDir, "long-desc");
    fs.mkdirSync(skillDir);
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      `---\nname: long-desc\ndescription: ${longDesc}\n---\n\n# Content`,
    );

    expect(() => discoverSkills(tmpDir)).toThrow(SkillSpecError);
  });
});
