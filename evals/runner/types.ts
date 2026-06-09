import type { ArtifactKind } from "@/ai/agents/agent";

export type ScenarioExpectations = {
  /** Exact order of artifact tool calls expected for this scenario. */
  artifactSequence?: ArtifactKind[];
  /** When true, no generate* artifact tool may be called. */
  forbidArtifactTools?: boolean;
  /** Maximum agent steps allowed. Defaults to AGENT_MAX_STEPS. */
  maxSteps?: number;
  /** Maximum estimated cost in USD for this scenario's run. */
  maxCostUsd: number;
};

export type Scenario = {
  id: string;
  title: string;
  /** One concrete sentence describing the bug or risk this scenario guards against. */
  motivation: string;
  prompt: string;
  expectations: ScenarioExpectations;
};

export type RunRecordToolCall = {
  step: number;
  toolName: string;
  input: unknown;
};

export type RunRecord = {
  scenarioId: string;
  modelId: string;
  recordedAt: string;
  toolCalls: RunRecordToolCall[];
  artifacts: Array<{ kind: ArtifactKind; payload: unknown }>;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
  stepCount: number;
  finalText: string;
};

export type AssertResult = {
  pass: boolean;
  detail: string;
};
