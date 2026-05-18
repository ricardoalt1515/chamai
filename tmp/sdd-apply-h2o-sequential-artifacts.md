# SDD Apply — H2O Sequential Artifact Tool Orchestration

Status: completed

## Summary
Implemented the approved focused slice for H2O artifact runtime hardening:

- Replaced prompt/skill instructions that asked the model to emit all artifact tools together with sequential generation: `generateFieldBrief` → `generatePlaybook` → `generateAnalyticalRead` → `generateProposalShell`.
- Added an AI SDK v6 `prepareStep` guardrail so once artifact generation has started, only the next artifact tool in order is active and forced via `toolChoice`.
- Changed chat stream timeout from `{ totalMs: 240_000 }` to `{ totalMs: 240_000, stepMs: 120_000 }`.
- Removed stale runtime instructions from `h2o-field-brief/SKILL.md` (`present_files`, local output paths, Python/reportlab renderer references).
- Added structured, payload-safe artifact lifecycle logs for tool execute, render, PDF storage, DB persist, and failure paths.
- Added/updated focused tests and updated OpenSpec apply progress.

## Files Changed

- `src/ai/agents/agent.ts`
- `src/ai/agents/agent.test.ts`
- `src/ai/prompts/h2o-allegiant.md`
- `src/ai/prompts/h2o-allegiant.ts`
- `src/ai/skills/h2o-field-brief/SKILL.md`
- `src/ai/tools/h2o-artifacts.ts`
- `src/ai/tools/h2o-artifacts.test.ts`
- `src/lib/chat-handler.ts`
- `src/lib/chat-handler.test.ts`
- `openspec/changes/port-chat-streaming-to-lambda/apply-progress.md`

## Verification

- `bun run test src/ai/agents/agent.test.ts` — passed, 9 tests.
- `bun run test src/lib/chat-handler.test.ts src/lib/chat-handler.artifacts.test.ts` — passed, 9 tests.
- `bun run test src/ai/tools/h2o-artifacts.test.ts` — passed, 11 tests.
- `bun run prompts:check` — passed.
- `bunx tsc --noEmit` — passed.
- `git diff --check` — passed.

## TDD Evidence

| Task | Safety Net | RED | GREEN / Refactor |
| --- | --- | --- | --- |
| Sequential artifact guardrail + prompt/skill contract | `agent.test.ts` 6/6 baseline passed | Failed for missing `prepareStep`, old prompt wording, stale skill text, missing step log fields | `agent.test.ts` 9/9 passed |
| Step timeout contract | `chat-handler.test.ts` 8/8 + `chat-handler.artifacts.test.ts` 1/1 baseline passed | Failed because `stepMs` was missing | Handler focused tests 9/9 passed |
| Artifact lifecycle observability | `h2o-artifacts.test.ts` 9/9 baseline passed | Failed because lifecycle logs were missing | `h2o-artifacts.test.ts` 11/11 passed |

## Review Budget

Focused slice stat for touched files (including apply-progress): 10 files, 571 insertions / 63 deletions. This is within the requested ~700-line budget. The working tree still contains prior uncommitted H2O reconciliation changes in chat UI/reconciliation files; those were preserved and not reverted.

## Risks / Notes

- Sequential policy may increase wall-clock time, but avoids relying on one huge four-tool emission.
- `prepareStep` intentionally leaves pre-artifact conversational turns unrestricted; it enforces order after artifact generation starts.
- Did not implement unrelated hardening items: transport env config, regenerate contract, modelId plumbing, attachment validation.
- Engram memory tools were unavailable in this delegated runtime, so discoveries could not be saved to Engram from this session.
