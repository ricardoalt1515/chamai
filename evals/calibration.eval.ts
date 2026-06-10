import { describe, expect, it } from "vitest";
import { allScenarios } from "./datasets";
import { computeAgreement } from "./runner/calibration";
import { type Judgment, loadJudgment } from "./runner/judge";
import { isLabelFilled, loadHumanLabels } from "./runner/labels";

const judgments: Record<string, Judgment> = {};
for (const scenario of allScenarios) {
  const judgment = loadJudgment(scenario.id);
  if (judgment) {
    judgments[scenario.id] = judgment;
  }
}

const labels = loadHumanLabels();
const filledLabels = Object.fromEntries(
  Object.entries(labels).filter(([, label]) => isLabelFilled(label)),
);

const hasFilledLabels = Object.keys(filledLabels).length > 0;
const hasJudgments = Object.keys(judgments).length > 0;

describe.skipIf(!hasFilledLabels || !hasJudgments)("judge calibration", () => {
  it("agrees with human labels within one point on average", () => {
    const report = computeAgreement(judgments, filledLabels);

    console.table(
      Object.entries(report.perDimension).map(([dimension, agreement]) => ({
        dimension,
        ...agreement,
      })),
    );
    console.table([{ dimension: "overall", ...report.overall }]);

    expect(
      report.overall.withinOnePct,
      `overall agreement (n=${report.overall.n}, MAE=${report.overall.meanAbsoluteError.toFixed(2)})`,
    ).toBeGreaterThanOrEqual(70);
  });
});

if (!hasFilledLabels || !hasJudgments) {
  console.warn(
    "[evals] Calibration suite skipped — fill in evals/labels/human-labels.json with human " +
      "scores and run `bun run eval:judge` to generate judgments, then re-run " +
      "`bun run eval:calibration`.",
  );
}
