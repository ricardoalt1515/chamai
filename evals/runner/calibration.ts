import { JUDGE_DIMENSIONS, type Judgment } from "./judge";
import { type HumanLabel, isLabelFilled } from "./labels";

export type DimensionAgreement = {
  n: number;
  exactPct: number;
  withinOnePct: number;
  meanAbsoluteError: number;
};

export type AgreementReport = {
  perDimension: Record<(typeof JUDGE_DIMENSIONS)[number], DimensionAgreement>;
  overall: DimensionAgreement;
};

const summarize = (diffs: number[]): DimensionAgreement => {
  const n = diffs.length;
  if (n === 0) {
    return { n: 0, exactPct: 0, withinOnePct: 0, meanAbsoluteError: 0 };
  }

  const exact = diffs.filter((diff) => diff === 0).length;
  const withinOne = diffs.filter((diff) => diff <= 1).length;
  const sum = diffs.reduce((total, diff) => total + diff, 0);

  return {
    n,
    exactPct: (exact / n) * 100,
    withinOnePct: (withinOne / n) * 100,
    meanAbsoluteError: sum / n,
  };
};

// Computes judge/human agreement, per dimension and pooled across all
// dimensions ("overall"), over scenarios that have BOTH a judgment and a
// fully-filled human label.
//
// N=12 caveat: with only 12 scenarios (and only as many filled labels as a
// human has provided), Cohen's kappa is unstable and easily swings on a
// single disagreement. We report mean absolute error and "within one point"
// agreement instead, which degrade gracefully at small sample sizes.
export const computeAgreement = (
  judgments: Record<string, Judgment>,
  labels: Record<string, HumanLabel>,
): AgreementReport => {
  const perDimensionDiffs: Record<(typeof JUDGE_DIMENSIONS)[number], number[]> = {
    groundedness: [],
    stageAppropriateness: [],
    actionability: [],
  };

  for (const [scenarioId, judgment] of Object.entries(judgments)) {
    const label = labels[scenarioId];
    if (!label || !isLabelFilled(label)) {
      continue;
    }

    for (const dimension of JUDGE_DIMENSIONS) {
      const judgeScore = judgment.scores[dimension];
      const humanScore = label[dimension];
      if (humanScore === null) {
        continue;
      }
      perDimensionDiffs[dimension].push(Math.abs(judgeScore - humanScore));
    }
  }

  const perDimension = {
    groundedness: summarize(perDimensionDiffs.groundedness),
    stageAppropriateness: summarize(perDimensionDiffs.stageAppropriateness),
    actionability: summarize(perDimensionDiffs.actionability),
  };

  const allDiffs = JUDGE_DIMENSIONS.flatMap((dimension) => perDimensionDiffs[dimension]);

  return {
    perDimension,
    overall: summarize(allDiffs),
  };
};
