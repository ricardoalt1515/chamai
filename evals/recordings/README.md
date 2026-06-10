# Eval recordings

This directory holds one JSON `RunRecord` per scenario in `evals/datasets/`,
captured by running the live eval suite against the real Bedrock model.

Recordings are committed so `bun run eval` (the PR gate) can replay
`evals/deterministic.eval.ts` against them token-free, with zero model calls.

## Refreshing recordings

Run `bun run eval:live` (requires AWS Bedrock credentials configured in your
environment). This calls `runScenario` for every scenario in
`evals/datasets/index.ts`, overwrites the matching `<scenario-id>.json` file,
and re-runs the deterministic asserts against the fresh recording.

Never run `bun run eval:live` automatically — it makes real network calls and
incurs real cost.
