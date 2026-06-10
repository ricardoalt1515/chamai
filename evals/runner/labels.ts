import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const LABELS_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "labels",
  "human-labels.json",
);

const dimensionScoreSchema = z.union([z.number().int().min(1).max(5), z.null()]);

const humanLabelSchema = z.object({
  groundedness: dimensionScoreSchema,
  stageAppropriateness: dimensionScoreSchema,
  actionability: dimensionScoreSchema,
  notes: z.string(),
});

export type HumanLabel = z.infer<typeof humanLabelSchema>;

const humanLabelsFileSchema = z.record(z.string(), humanLabelSchema);

// Loads and validates evals/labels/human-labels.json. A label "counts" for
// calibration only once a human has filled in all three dimensions.
export const loadHumanLabels = (): Record<string, HumanLabel> => {
  const raw = JSON.parse(readFileSync(LABELS_PATH, "utf-8"));
  return humanLabelsFileSchema.parse(raw);
};

// A label is "filled" when every scored dimension is a non-null integer
// 1-5 (notes are optional and do not affect fill status).
export const isLabelFilled = (label: HumanLabel): boolean =>
  label.groundedness !== null &&
  label.stageAppropriateness !== null &&
  label.actionability !== null;
