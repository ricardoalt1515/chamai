# Apply Progress — ai-agent-tool-orchestration

## Status

completed — minimal orchestration experiment applied

## Completed Tasks

- [x] Read OpenSpec config, explore artifacts, AI SDK skill, prompt-engineering skill, existing agent/prompt/skill code, and tests.
- [x] Followed strict TDD with a safety-net run before production edits.
- [x] Replaced per-step named artifact forcing with a minimal `prepareStep` policy:
  - before artifact mode / field-brief skill load: no override;
  - after artifact mode starts or field-brief skill loads: keep `loadSkill` plus incomplete artifact tools active;
  - completed artifact tools are removed from `activeTools` to prevent duplicate calls;
  - after all four artifact tools complete: `toolChoice: "none"` prevents duplicates.
- [x] Added AI SDK `experimental_repairToolCall` support using the documented re-ask strategy for invalid tool input repair.
- [x] Simplified prompt contradictions into a decision table for Direct Q&A, Explicit single artifact, Full opportunity package/new evidence, recoverable errors, and non-recoverable errors.
- [x] Updated `h2o-field-brief` skill to match the one-artifact-at-a-time / single-artifact-vs-full-package contract.
- [x] Regenerated `src/ai/prompts/h2o-allegiant.ts` from markdown.
- [x] Removed accidental untracked root file `false`.

## Files Changed

- `src/ai/agents/agent.ts`
- `src/ai/agents/agent.test.ts`
- `src/ai/prompts/h2o-allegiant.md`
- `src/ai/prompts/h2o-allegiant.ts`
- `src/ai/skills/h2o-field-brief/SKILL.md`
- removed root `false` artifact file

## Test Commands Run

- `bun run test src/ai/agents/agent.test.ts` — safety net: 11/11 passing before edits.
- `bun run test src/ai/agents/agent.test.ts` — RED: 4 expected failures after tests were changed first.
- `bun run prompts:generate`
- `bun run test src/ai/agents/agent.test.ts` — GREEN: 10/10 passing after implementation and prompt updates.
- `bun run test src/ai/agents/agent.test.ts` — TRIANGULATE: 1 expected failure in new repair no-such-tool test due mock call history, then fixed test hygiene.
- `bun run test src/ai/agents/agent.test.ts` — TRIANGULATE/GREEN: 12/12 passing.
- `bunx tsc --noEmit` — passing.
- `bun run prompts:check` — passing.
- `bun run test src/ai/agents/agent.test.ts` — final focused verification: 12/12 passing.

## TDD Cycle Evidence

| Task                             | Test File                     | Layer         | Safety Net | RED                                                                                                | GREEN                                 | TRIANGULATE                                                                          | REFACTOR                                                                                            |
| -------------------------------- | ----------------------------- | ------------- | ---------- | -------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Simplify artifact prepareStep    | `src/ai/agents/agent.test.ts` | Unit          | ✅ 11/11   | ✅ 4 failing assertions for no named forcing / duplicate filtering / repair hook / prompt contract | ✅ 10/10 after implementation         | ✅ Added completed-artifact variants: field brief only and field brief+playbook      | ✅ Renamed policy to `minimalArtifactPrepareStep`, extracted `activeToolsWithoutCompletedArtifacts` |
| Add AI SDK tool-call repair hook | `src/ai/agents/agent.test.ts` | Unit          | ✅ 11/11   | ✅ Hook expected in settings before implementation                                                 | ✅ Hook wired and tests passing       | ✅ Added repair-success and no-such-tool no-repair cases                             | ✅ Reset mocks in `beforeEach` for test isolation                                                   |
| Simplify prompt/skill contract   | `src/ai/agents/agent.test.ts` | Unit/approval | ✅ 11/11   | ✅ Prompt assertions expected decision-table/retry wording before prompt update                    | ✅ Prompt generated and tests passing | ✅ Existing trigger phrase test preserved file attachment + explicit phrase behavior | ✅ Regenerated TS mirror and checked with `prompts:check`                                           |

## Deviations From Design

- Did not add structured tool execution retry in `h2o-artifacts.ts`; current scope implemented AI SDK schema/input repair and prompt-level retry policy. Tool-level retryable/non-retryable result contracts should be a follow-up if runtime failures still need model-visible classification.
- Did not add a server-side intent gate; this apply intentionally keeps the experiment minimal and prompt/tool-loop native.

## Remaining Tasks

- Add broader orchestration evals or integration tests for real model behavior: direct Q&A no artifacts, explicit single artifact, full package one-by-one, tool failure recovery.
- Consider tool-level retryable/non-retryable error result shapes if artifact render/storage failures need better model recovery.
- Run full suite/check in verify phase if requested; `bun run check` has known pre-existing UI lint issues per config.

## Workload / PR Boundary

- Single reviewable slice under the 400-line review budget for application code/tests.
- Recommended PR boundary: minimal AI SDK-native orchestration experiment only. Do not combine with server-side intent gate or workflow engine changes.
