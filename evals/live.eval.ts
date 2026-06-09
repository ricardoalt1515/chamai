import { describe, expect, it } from "vitest";
import { allScenarios } from "./datasets";
import {
  assertArtifactSchemas,
  assertCostBudget,
  assertStepBudget,
  assertToolSequence,
} from "./runner/asserts";
import { saveRecording } from "./runner/recordings";
import { runScenario } from "./runner/run-scenario";

// Live eval suite — calls the real Bedrock model for every scenario and
// records the result. NEVER run this automatically; it requires AWS Bedrock
// credentials and incurs real cost. Invoke explicitly via `bun run eval:live`.
describe.skipIf(!process.env.EVALS_LIVE)("live scenarios", () => {
  for (const scenario of allScenarios) {
    it(`${scenario.id}: ${scenario.title}`, async () => {
      const record = await runScenario(scenario);
      saveRecording(record);

      const schemaResult = assertArtifactSchemas(record, scenario);
      expect(schemaResult.pass, schemaResult.detail).toBe(true);

      const sequenceResult = assertToolSequence(record, scenario);
      expect(sequenceResult.pass, sequenceResult.detail).toBe(true);

      const stepResult = assertStepBudget(record, scenario);
      expect(stepResult.pass, stepResult.detail).toBe(true);

      const costResult = assertCostBudget(record, scenario);
      expect(costResult.pass, costResult.detail).toBe(true);
    }, 240_000);
  }
});
