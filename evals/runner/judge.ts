import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateObject } from "ai";
import { z } from "zod";
import { estimateTokenCostUsd } from "@/ai/agents/agent";
import { MODELS } from "@/config/models";
import { bedrockProvider } from "@/lib/bedrock-provider";
import type { RunRecord, Scenario } from "./types";

const JUDGMENTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "judgments");

export const JUDGE_DIMENSIONS = ["groundedness", "stageAppropriateness", "actionability"] as const;

export const judgeScoreSchema = z.object({
  groundedness: z.number().int().min(1).max(5),
  stageAppropriateness: z.number().int().min(1).max(5),
  actionability: z.number().int().min(1).max(5),
  rationale: z.string(),
});

export type JudgeScore = z.infer<typeof judgeScoreSchema>;

export type Judgment = {
  scenarioId: string;
  modelId: string;
  judgedAt: string;
  scores: JudgeScore;
  judgeCostUsd: number;
};

const JUDGE_SYSTEM_PROMPT = `You are a strict reviewer of AI-generated wastewater business-development \
(BD) sales artifacts. Score ONLY against the evidence present in the user prompt — do not reward \
content that "sounds right" if it is not traceable to the supplied evidence.

Score three dimensions, each on a 1-5 integer scale:

## groundedness
Every factual claim in the artifact(s) must be traceable to the scenario prompt or clearly \
labeled as an assumption/placeholder.
- 5: Every factual claim is traceable to the scenario prompt, or is explicitly flagged as an \
assumption, placeholder, or open question.
- 4: Nearly all claims are traceable; at most one minor inference is stated as fact without a \
flag, but it is a reasonable extrapolation from the evidence.
- 3: Mostly grounded, but several inferences are stated as fact without being flagged as \
assumptions, though none materially change the recommendation.
- 2: Multiple invented or unsupported facts are presented as evidence, or numbers/specifics \
appear that have no basis in the prompt.
- 1: The artifact fabricates significant facts, figures, or context not present in or \
inconsistent with the scenario prompt, presented as established evidence.

## stageAppropriateness
Does the artifact's depth and tone match the deal stage implied by the evidence in the scenario \
prompt? Thin or "too early" content at an early stage (e.g. Lead) is CORRECT, not a flaw — do \
NOT penalize an artifact for being appropriately conservative or for explicitly noting that \
deeper analysis requires more evidence.
- 5: Depth, confidence, and recommendations precisely match the deal stage; early-stage \
artifacts are appropriately conservative and explicitly call out what evidence is missing.
- 4: Depth mostly matches the stage, with minor over- or under-reach that does not mislead the \
reader about how advanced the opportunity is.
- 3: Some mismatch — e.g. moderate over-confidence for the evidence available — but the overall \
read of the deal stage is still recognizable and not actively misleading.
- 2: Noticeable mismatch — the artifact reads as more (or less) advanced than the evidence \
supports, risking a field agent over- or under-investing relative to the real opportunity.
- 1: Severe mismatch — e.g. a Lead-stage opportunity is presented with proposal-level certainty, \
or a near-close opportunity is treated as a cold lead, materially misleading the reader.

## actionability
Would a field agent reading this artifact know exactly what to do next?
- 5: Concrete, sequenced next actions with clear owners/timeframes that a field agent could \
execute immediately without further interpretation.
- 4: Clear next actions are present and mostly concrete, with at most minor ambiguity about \
sequencing or ownership.
- 3: Next steps are present but somewhat generic or require the field agent to fill in \
significant detail before acting.
- 2: Next steps are vague, only implied, or buried — a field agent would need to do substantial \
extra work to know what to do.
- 1: No actionable next steps are provided, or the artifact is purely descriptive with nothing \
for the field agent to act on.

Respond with integer scores for groundedness, stageAppropriateness, and actionability, plus a \
rationale of 2-4 sentences justifying each score with specific references to the artifact(s) and \
the scenario prompt.`;

const buildJudgeUserPrompt = (record: RunRecord, scenario: Scenario): string => {
  const sections = [`# Scenario prompt\n\n${scenario.prompt}`];

  if (record.artifacts.length > 0) {
    sections.push(`# Generated artifacts\n\n${JSON.stringify(record.artifacts, null, 2)}`);
  } else {
    sections.push(
      "# Generated artifacts\n\nNone — this scenario produced no artifacts. Judge the final " +
        "text response alone.",
    );
  }

  sections.push(`# Final text response\n\n${record.finalText || "(empty)"}`);

  return sections.join("\n\n");
};

// Scores a single recorded run against its scenario using the judge model.
// Costs a real Bedrock call — only invoked from evals/judge.eval.ts behind
// the EVALS_JUDGE flag.
export const judgeRecording = async (record: RunRecord, scenario: Scenario): Promise<Judgment> => {
  const model = bedrockProvider(MODELS[0].runtimeModelId);

  const { object, usage } = await generateObject({
    model,
    schema: judgeScoreSchema,
    system: JUDGE_SYSTEM_PROMPT,
    prompt: buildJudgeUserPrompt(record, scenario),
  });

  const judgeCostUsd = estimateTokenCostUsd({
    model: MODELS[0],
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
  });

  return {
    scenarioId: scenario.id,
    modelId: MODELS[0].id,
    judgedAt: new Date().toISOString(),
    scores: object,
    judgeCostUsd,
  };
};

export const judgmentPath = (id: string): string => join(JUDGMENTS_DIR, `${id}.json`);

export const saveJudgment = (judgment: Judgment): void => {
  mkdirSync(JUDGMENTS_DIR, { recursive: true });
  writeFileSync(judgmentPath(judgment.scenarioId), `${JSON.stringify(judgment, null, 2)}\n`);
};

export const loadJudgment = (id: string): Judgment | null => {
  const path = judgmentPath(id);
  if (!existsSync(path)) {
    return null;
  }
  return JSON.parse(readFileSync(path, "utf-8")) as Judgment;
};
