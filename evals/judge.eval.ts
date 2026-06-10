import { describe, expect, it } from "vitest";
import { allScenarios } from "./datasets";
import { JUDGE_DIMENSIONS, judgeRecording, saveJudgment } from "./runner/judge";
import { loadRecording } from "./runner/recordings";

// LLM-as-judge suite — calls the real Bedrock model to score each recorded
// run against its scenario. NEVER run this automatically; it requires AWS
// Bedrock credentials and incurs real cost. Invoke explicitly via
// `bun run eval:judge`.
describe.skipIf(!process.env.EVALS_JUDGE)("judge scenarios", () => {
  for (const scenario of allScenarios) {
    const record = loadRecording(scenario.id);

    if (!record) {
      console.warn(
        `[evals] No recording found for scenario "${scenario.id}" — skipping judge. ` +
          "Run `bun run eval:live` to generate recordings.",
      );
      continue;
    }

    it(`${scenario.id}: scores >= 3 on every dimension`, async () => {
      const judgment = await judgeRecording(record, scenario);
      saveJudgment(judgment);

      for (const dimension of JUDGE_DIMENSIONS) {
        const score = judgment.scores[dimension];
        expect(score, `${dimension}: ${judgment.scores.rationale}`).toBeGreaterThanOrEqual(3);
      }
    }, 120_000);
  }
});
