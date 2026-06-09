import { describe, expect, it } from "vitest";
import { allScenarios } from "./datasets";
import {
  assertArtifactSchemas,
  assertCostBudget,
  assertStepBudget,
  assertToolSequence,
} from "./runner/asserts";
import { hasAnyRecordings, loadRecording } from "./runner/recordings";
import type { RunRecord, Scenario } from "./runner/types";

// Synthetic fixtures for the assert-function unit tests below. These are
// hand-crafted and never replayed against recordings.

const baseScenario: Scenario = {
  id: "synthetic-scenario",
  title: "Synthetic scenario for assert-function tests",
  motivation: "Synthetic fixture — not a real BD scenario.",
  prompt: "synthetic prompt",
  expectations: {
    artifactSequence: ["field-brief", "playbook", "analytical-read", "proposal-shell"],
    maxSteps: 10,
    maxCostUsd: 0.75,
  },
};

const validFieldBriefPayload = {
  customer: { name: "Synthetic Co", slug: "synthetic-co" },
  stage: "Qualify",
  confidence: "MEDIUM",
  stopFlags: [],
  sections: {
    whatThisIs: { insight: "Synthetic insight.", body: "Synthetic body." },
    whatWeWouldPropose: {
      insight: "Synthetic insight.",
      recommendedApproach: "Synthetic approach.",
      winWinArguments: [{ lead: "Synthetic lead", body: "Synthetic body." }],
      costOfAlternativeRows: [
        { component: "Component", theirPath: "Their path", ourProposal: "Our proposal" },
      ],
    },
    whatCouldKillIt: {
      insight: "Synthetic insight.",
      risks: [{ name: "Risk", mechanism: "Mechanism", mitigation: "Mitigation" }],
    },
    doThisNext: {
      insight: "Synthetic insight.",
      actions: [
        { title: "Action 1", timeframe: "7 days", body: "Body." },
        { title: "Action 2", timeframe: "14 days", body: "Body." },
        { title: "Action 3", timeframe: "21 days", body: "Body." },
      ],
    },
  },
};

const validPlaybookPayload = {
  customer: { name: "Synthetic Co", slug: "synthetic-co" },
  themes: [{ title: "Theme", questions: ["Question?"] }],
};

const validAnalyticalReadPayload = {
  customer: { name: "Synthetic Co", slug: "synthetic-co" },
  summary: "Synthetic summary.",
  sections: [{ heading: "Evidence", body: "Synthetic body." }],
};

const validProposalShellPayload = {
  customer: { name: "Synthetic Co", slug: "synthetic-co" },
  executiveSummary: "Synthetic summary.",
  proposedScope: ["Synthetic scope item"],
  sizingAndPricing: "Synthetic sizing.",
  schedule: "Synthetic schedule.",
  commitments: [{ label: "Commit to", text: "Synthetic commitment" }],
};

const buildRecord = (overrides: Partial<RunRecord> = {}): RunRecord => ({
  scenarioId: "synthetic-scenario",
  modelId: "claude-sonnet-4-6",
  recordedAt: "2026-01-01T00:00:00.000Z",
  toolCalls: [
    { step: 0, toolName: "generateFieldBrief", input: validFieldBriefPayload },
    { step: 1, toolName: "generatePlaybook", input: validPlaybookPayload },
    { step: 2, toolName: "generateAnalyticalRead", input: validAnalyticalReadPayload },
    { step: 3, toolName: "generateProposalShell", input: validProposalShellPayload },
  ],
  artifacts: [
    { kind: "field-brief", payload: validFieldBriefPayload },
    { kind: "playbook", payload: validPlaybookPayload },
    { kind: "analytical-read", payload: validAnalyticalReadPayload },
    { kind: "proposal-shell", payload: validProposalShellPayload },
  ],
  usage: { inputTokens: 10_000, outputTokens: 4_000, costUsd: 0.09 },
  stepCount: 5,
  finalText: "Synthetic closing text.",
  ...overrides,
});

describe("assert functions", () => {
  describe("assertArtifactSchemas", () => {
    it("passes when every artifact payload matches its schema", () => {
      const record = buildRecord();
      const result = assertArtifactSchemas(record, baseScenario);
      expect(result.pass, result.detail).toBe(true);
    });

    it("fails when an artifact payload is missing required fields", () => {
      const record = buildRecord({
        artifacts: [{ kind: "field-brief", payload: { customer: { name: "Synthetic Co" } } }],
      });
      const result = assertArtifactSchemas(record, baseScenario);
      expect(result.pass).toBe(false);
      expect(result.detail).toContain("field-brief");
    });
  });

  describe("assertToolSequence", () => {
    it("passes when the artifact tool sequence matches expectations exactly", () => {
      const record = buildRecord();
      const result = assertToolSequence(record, baseScenario);
      expect(result.pass, result.detail).toBe(true);
    });

    it("fails when the artifact tool sequence is out of order", () => {
      const record = buildRecord({
        toolCalls: [
          { step: 0, toolName: "generatePlaybook", input: validPlaybookPayload },
          { step: 1, toolName: "generateFieldBrief", input: validFieldBriefPayload },
          { step: 2, toolName: "generateAnalyticalRead", input: validAnalyticalReadPayload },
          { step: 3, toolName: "generateProposalShell", input: validProposalShellPayload },
        ],
      });
      const result = assertToolSequence(record, baseScenario);
      expect(result.pass).toBe(false);
      expect(result.detail).toContain("expected tool sequence");
      expect(result.detail).toContain("but got");
    });

    it("passes when forbidArtifactTools is set and no artifact tool was called", () => {
      const record = buildRecord({ toolCalls: [], artifacts: [] });
      const scenario: Scenario = {
        ...baseScenario,
        expectations: { forbidArtifactTools: true, maxCostUsd: 0.15 },
      };
      const result = assertToolSequence(record, scenario);
      expect(result.pass, result.detail).toBe(true);
    });

    it("fails when forbidArtifactTools is set but an artifact tool was called", () => {
      const record = buildRecord({
        toolCalls: [{ step: 0, toolName: "generateFieldBrief", input: validFieldBriefPayload }],
        artifacts: [{ kind: "field-brief", payload: validFieldBriefPayload }],
      });
      const scenario: Scenario = {
        ...baseScenario,
        expectations: { forbidArtifactTools: true, maxCostUsd: 0.15 },
      };
      const result = assertToolSequence(record, scenario);
      expect(result.pass).toBe(false);
      expect(result.detail).toContain("expected no artifact tool calls");
    });
  });

  describe("assertStepBudget", () => {
    it("passes when stepCount is within the default AGENT_MAX_STEPS budget", () => {
      const record = buildRecord({ stepCount: 8 });
      const scenario: Scenario = { ...baseScenario, expectations: { maxCostUsd: 0.75 } };
      const result = assertStepBudget(record, scenario);
      expect(result.pass, result.detail).toBe(true);
    });

    it("fails when stepCount exceeds the scenario's maxSteps", () => {
      const record = buildRecord({ stepCount: 11 });
      const scenario: Scenario = {
        ...baseScenario,
        expectations: { maxSteps: 10, maxCostUsd: 0.75 },
      };
      const result = assertStepBudget(record, scenario);
      expect(result.pass).toBe(false);
      expect(result.detail).toContain("exceeds maxSteps");
    });
  });

  describe("assertCostBudget", () => {
    it("passes when costUsd is within maxCostUsd", () => {
      const record = buildRecord({ usage: { inputTokens: 1000, outputTokens: 500, costUsd: 0.1 } });
      const scenario: Scenario = { ...baseScenario, expectations: { maxCostUsd: 0.75 } };
      const result = assertCostBudget(record, scenario);
      expect(result.pass, result.detail).toBe(true);
      expect(result.detail).toContain("0.1000");
      expect(result.detail).toContain("0.7500");
    });

    it("fails when costUsd exceeds maxCostUsd", () => {
      const record = buildRecord({
        usage: { inputTokens: 1_000_000, outputTokens: 500_000, costUsd: 1.5 },
      });
      const scenario: Scenario = { ...baseScenario, expectations: { maxCostUsd: 0.75 } };
      const result = assertCostBudget(record, scenario);
      expect(result.pass).toBe(false);
      expect(result.detail).toContain("exceeds maxCostUsd");
    });
  });
});

describe.skipIf(!hasAnyRecordings())("recorded scenarios", () => {
  for (const scenario of allScenarios) {
    it(`${scenario.id}: replays within budget and produces valid artifacts`, () => {
      const record = loadRecording(scenario.id);
      if (!record) {
        expect.fail(
          `No recording found for scenario "${scenario.id}". Run \`bun run eval:live\` to generate recordings.`,
        );
        return;
      }

      const schemaResult = assertArtifactSchemas(record, scenario);
      expect(schemaResult.pass, schemaResult.detail).toBe(true);

      const sequenceResult = assertToolSequence(record, scenario);
      expect(sequenceResult.pass, sequenceResult.detail).toBe(true);

      const stepResult = assertStepBudget(record, scenario);
      expect(stepResult.pass, stepResult.detail).toBe(true);

      const costResult = assertCostBudget(record, scenario);
      expect(costResult.pass, costResult.detail).toBe(true);
    });
  }
});

if (!hasAnyRecordings()) {
  console.warn(
    "[evals] No recordings found in evals/recordings/ — recorded-scenario assertions are " +
      "skipped. Run `bun run eval:live` (requires AWS Bedrock credentials) to generate recordings.",
  );
}
