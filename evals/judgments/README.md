# Eval judgments

This directory holds one JSON `Judgment` per scenario in `evals/datasets/`,
produced by the LLM-as-judge suite (`evals/judge.eval.ts`) scoring the
recordings in `evals/recordings/`.

## Refreshing judgments

Run `bun run eval:judge` (requires AWS Bedrock credentials configured in your
environment). This calls `judgeRecording` for every scenario with an existing
recording and overwrites the matching `<scenario-id>.json` file.

Judgments are committed like recordings so `bun run eval:calibration` can
compare them against `evals/labels/human-labels.json` without making model
calls.
