import { AGENT_MAX_STEPS, ARTIFACT_TOOL_SEQUENCE, type ArtifactKind } from "@/ai/agents/agent";
import { ARTIFACT_INPUT_SCHEMAS } from "@/ai/tools/h2o-artifacts";
import type { AssertResult, RunRecord, Scenario } from "./types";

const ARTIFACT_TOOL_TO_KIND: Record<(typeof ARTIFACT_TOOL_SEQUENCE)[number], ArtifactKind> = {
  generateFieldBrief: "field-brief",
  generatePlaybook: "playbook",
  generateAnalyticalRead: "analytical-read",
  generateProposalShell: "proposal-shell",
};

const ARTIFACT_TOOL_NAMES = new Set<string>(ARTIFACT_TOOL_SEQUENCE);

// Validates each recorded artifact payload against the live zod schema for
// its kind. A schema drift between the agent's tool calls and the renderer
// input contract surfaces here as a parse failure.
export const assertArtifactSchemas = (record: RunRecord, _scenario: Scenario): AssertResult => {
  const failures: string[] = [];

  record.artifacts.forEach((artifact, index) => {
    const schema = ARTIFACT_INPUT_SCHEMAS[artifact.kind];
    const result = schema.safeParse(artifact.payload);
    if (!result.success) {
      const issues = result.error.issues
        .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
        .join("; ");
      failures.push(`artifacts[${index}] (${artifact.kind}): ${issues}`);
    }
  });

  if (failures.length > 0) {
    return { pass: false, detail: `schema validation failed — ${failures.join(" | ")}` };
  }

  return { pass: true, detail: `all ${record.artifacts.length} artifact payload(s) valid` };
};

// Verifies the order of artifact tool calls matches the scenario's
// expectation, or that no artifact tool was called when forbidden.
export const assertToolSequence = (record: RunRecord, scenario: Scenario): AssertResult => {
  const actualSequence = record.toolCalls
    .filter((call) => ARTIFACT_TOOL_NAMES.has(call.toolName))
    .map((call) => ARTIFACT_TOOL_TO_KIND[call.toolName as (typeof ARTIFACT_TOOL_SEQUENCE)[number]]);

  const { artifactSequence, forbidArtifactTools } = scenario.expectations;

  if (forbidArtifactTools) {
    if (actualSequence.length === 0) {
      return { pass: true, detail: "no artifact tools called, as expected" };
    }
    return {
      pass: false,
      detail: `expected no artifact tool calls but got [${actualSequence.join(", ")}]`,
    };
  }

  if (artifactSequence) {
    const expectedStr = `[${artifactSequence.join(", ")}]`;
    const actualStr = `[${actualSequence.join(", ")}]`;
    if (
      actualSequence.length === artifactSequence.length &&
      actualSequence.every((kind, index) => kind === artifactSequence[index])
    ) {
      return { pass: true, detail: `tool sequence matched ${expectedStr}` };
    }
    return {
      pass: false,
      detail: `expected tool sequence ${expectedStr} but got ${actualStr}`,
    };
  }

  return { pass: true, detail: "no artifact sequence expectation set" };
};

// Verifies the agent loop terminated within the allowed step budget.
export const assertStepBudget = (record: RunRecord, scenario: Scenario): AssertResult => {
  const maxSteps = scenario.expectations.maxSteps ?? AGENT_MAX_STEPS;
  if (record.stepCount <= maxSteps) {
    return { pass: true, detail: `stepCount ${record.stepCount} <= maxSteps ${maxSteps}` };
  }
  return {
    pass: false,
    detail: `stepCount ${record.stepCount} exceeds maxSteps ${maxSteps}`,
  };
};

// Verifies the estimated token cost stayed within the scenario's budget.
export const assertCostBudget = (record: RunRecord, scenario: Scenario): AssertResult => {
  const { maxCostUsd } = scenario.expectations;
  const actual = record.usage.costUsd;
  if (actual <= maxCostUsd) {
    return {
      pass: true,
      detail: `costUsd ${actual.toFixed(4)} <= maxCostUsd ${maxCostUsd.toFixed(4)}`,
    };
  }
  return {
    pass: false,
    detail: `costUsd ${actual.toFixed(4)} exceeds maxCostUsd ${maxCostUsd.toFixed(4)}`,
  };
};
