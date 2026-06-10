import { nanoid } from "nanoid";
import { type ArtifactKind, createAgent, estimateTokenCostUsd } from "@/ai/agents/agent";
import { createH2oArtifactTools } from "@/ai/tools/h2o-artifacts";
import { MODELS } from "@/config/models";
import { createFakeArtifactContext, fakeOwner } from "./fakes";
import type { RunRecord, RunRecordToolCall, Scenario } from "./types";

const ARTIFACT_TOOL_TO_KIND: Record<string, ArtifactKind> = {
  generateFieldBrief: "field-brief",
  generatePlaybook: "playbook",
  generateAnalyticalRead: "analytical-read",
  generateProposalShell: "proposal-shell",
};

const isArtifactToolName = (toolName: string): toolName is keyof typeof ARTIFACT_TOOL_TO_KIND =>
  toolName in ARTIFACT_TOOL_TO_KIND;

// Runs a single scenario against the real agent loop with in-memory
// artifact persistence. PDF rendering inside the artifact tools stays REAL —
// only the artifact store and PDF storage are faked.
export const runScenario = async (scenario: Scenario): Promise<RunRecord> => {
  const threadId = `eval-${scenario.id}-${nanoid()}`;
  const tools = createH2oArtifactTools(createFakeArtifactContext(threadId));
  const agent = createAgent({
    tools,
    usageContext: { threadId, userId: fakeOwner.userId },
  });

  const result = await agent.generate({ prompt: scenario.prompt });

  const toolCalls: RunRecordToolCall[] = [];
  const artifacts: Array<{ kind: ArtifactKind; payload: unknown }> = [];

  for (const step of result.steps) {
    for (const toolCall of step.toolCalls) {
      toolCalls.push({
        step: step.stepNumber,
        toolName: toolCall.toolName,
        input: toolCall.input,
      });

      if (isArtifactToolName(toolCall.toolName)) {
        artifacts.push({
          kind: ARTIFACT_TOOL_TO_KIND[toolCall.toolName],
          payload: toolCall.input,
        });
      }
    }
  }

  const inputTokens = result.totalUsage.inputTokens ?? 0;
  const outputTokens = result.totalUsage.outputTokens ?? 0;
  const costUsd = estimateTokenCostUsd({
    model: MODELS[0],
    inputTokens,
    outputTokens,
  });

  return {
    scenarioId: scenario.id,
    modelId: MODELS[0].id,
    recordedAt: new Date().toISOString(),
    toolCalls,
    artifacts,
    usage: { inputTokens, outputTokens, costUsd },
    stepCount: result.steps.length,
    finalText: result.text,
  };
};
