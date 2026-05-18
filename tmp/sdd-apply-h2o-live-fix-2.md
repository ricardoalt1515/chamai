# SDD Apply — H2O Live Artifact Fix Slice

Status: completed

## Summary

Implemented the focused H2O live-fix slice approved as `auto-chain` / `stacked-to-main`:

- Hid visible internal/generic `tool-loadSkill` cards again.
- Added a single high-level artifact heartbeat: “Generating artifact package… this can take a few minutes.” while artifact tools are active.
- Extended reconciliation to use a 300s budget with capped backoff and to wait for persisted terminal artifact tool states before applying snapshots for active artifact turns.
- Preserved stale-overwrite protections for persisted-behind snapshots, missing assistant tails, superseded requests, and non-terminal artifact snapshots.

## Files Changed

- `src/components/chat-interface.tsx`
- `src/lib/chat-reconciliation.ts`
- `src/components/chat-interface.test.tsx`
- `openspec/changes/port-chat-streaming-to-lambda/apply-progress.md`

## Verification

- `bun run test src/components/chat-interface.test.tsx` — passed, 23 tests.
- `bunx tsc --noEmit` — passed.
- `git diff --check` — passed.

## TDD Evidence

- Safety net: focused test file passed 18/18 before edits.
- RED: new tests failed for loadSkill hiding, heartbeat helper, long reconciliation config, and terminal artifact wait behavior.
- GREEN/REFACTOR: focused test file passed 23/23 after implementation and refactor.

## Risks / Notes

- No Lambda/backpressure, server timeout, or artifact-generation implementation changes were made.
- Long terminal-artifact waiting is opt-in via `waitForTerminalArtifactTools`; `ChatInterface` uses it for post-stream/error reconciliation.
- Current working-tree diff includes earlier uncommitted telemetry/reconciliation work in the same files; total worktree diff currently reports 4 files, 850 insertions / 59 deletions against HEAD, including pre-existing changes from before this slice.
