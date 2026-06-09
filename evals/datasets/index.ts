import { edgeCaseScenarios } from "./edge-cases";
import { happyPathScenarios } from "./happy-path";
import { toolSelectionScenarios } from "./tool-selection";

export const allScenarios = [
  ...happyPathScenarios,
  ...toolSelectionScenarios,
  ...edgeCaseScenarios,
];
