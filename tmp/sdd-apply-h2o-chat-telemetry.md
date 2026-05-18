# SDD Apply — H2O Chat Telemetry / Tool Visibility

## status

completed

## executive_summary

Implemented the focused AI SDK / AI Elements best-practice gaps without changing Lambda streaming/backpressure code. The chat UI now surfaces non-artifact tool activity, opens terminal artifact tools by default, logs low-noise client lifecycle telemetry, and emits reconciliation decision telemetry.

## artifacts

### Files changed

- `src/components/chat-interface.tsx`
- `src/lib/chat-reconciliation.ts`
- `src/components/chat-interface.test.tsx`
- `openspec/changes/port-chat-streaming-to-lambda/apply-progress.md`

### Behavior added

- Non-artifact AI SDK tool parts such as `tool-loadSkill` get a compact generic `Tool` card instead of being hidden.
- Artifact tools use `defaultOpen={part.state === "output-available" || part.state === "output-error"}`.
- `useChat.onFinish` logs structured browser telemetry for `isAbort`, `isDisconnect`, `isError`, and `finishReason`.
- Chat status transitions log compact summaries: message count, last message, visible/generic/artifact/hidden part counts.
- Reconciliation emits structured decisions: `attempt`, `applied`, `persisted_behind`, `assistant_tail_missing`, `superseded`, `exhausted`, and `error`.

## TDD Cycle Evidence

| Task                                    | Test File                                            | Layer     | Safety Net               | RED                                       | GREEN                         | TRIANGULATE                                                   | REFACTOR                   |
| --------------------------------------- | ---------------------------------------------------- | --------- | ------------------------ | ----------------------------------------- | ----------------------------- | ------------------------------------------------------------- | -------------------------- |
| Tool visibility + terminal open helpers | `src/components/chat-interface.test.tsx`             | Unit      | ✅ 13/13 baseline passed | ✅ Missing helper tests failed            | ✅ 16/16 focused tests passed | ✅ Generic `tool-loadSkill`, terminal artifact, mixed summary | ✅ Extracted pure helpers  |
| Reconciliation telemetry                | `src/components/chat-interface.test.tsx`             | Unit      | ✅ 13/13 baseline passed | ✅ Telemetry assertions failed            | ✅ 16/16 focused tests passed | ✅ `applied`, `persisted_behind`, `exhausted`                 | ✅ Safe telemetry emitter  |
| Client lifecycle telemetry wiring       | `src/components/chat-interface.test.tsx` + typecheck | Unit/type | ✅ baseline passed       | ✅ Summary contract written before wiring | ✅ tests + typecheck passed   | ✅ onFinish/status reuse tested summary helper                | ✅ concise structured logs |

## Test commands run

- `bun run test src/components/chat-interface.test.tsx` — baseline ✅ 13 tests passed.
- `bun run test src/components/chat-interface.test.tsx` — RED ❌ expected failures before helpers/telemetry existed.
- `bun run test src/components/chat-interface.test.tsx` — GREEN ✅ 16 tests passed.
- `bunx tsc --noEmit` — ✅ passed.

## deviations

- Generic/internal tool cards intentionally do not render successful output payloads to avoid dumping large hidden internals. They show state, title, input when available, and error text if terminal error.
- Browser telemetry uses `console.info`/`console.warn` only; no server dependency or durable logging was added.
- Engram memory save was requested if available, but this subagent tool session does not expose Engram tools.

## remaining_tasks

- Deploy/test latest client slice against the H2O repro.
- If still failing, use the new browser logs to decide between longer reconciliation polling, stream resume, or preliminary/data tool progress for long artifact executions.

## risks

- Diff size is above the 400-line review target when combined with the pre-existing guarded reconciliation dirty diff; review as this focused client/reconciliation slice.
- Console telemetry is diagnostic and should be revisited once root cause is confirmed.

## skill_resolution

- `ai-sdk`: applied `useChat.onFinish` lifecycle flags and catch-all tool rendering guidance.
- `ai-elements`: aligned tool visibility and terminal default-open behavior.
- `vercel-react-best-practices`: used pure helpers and refs to avoid callback-only state subscriptions.
- `logging-best-practices`: kept logs structured, concise, and free of message content/JWTs.
