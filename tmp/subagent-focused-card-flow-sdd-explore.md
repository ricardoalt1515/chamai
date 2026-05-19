I couldn’t write the file directly (no write tool in this session), so here are the findings content you can save to:

`/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/subagent-focused-card-flow-sdd-explore.md`

---

# Focused exploration: live tool-card flow regression

## 1) Exact code path now preventing the previous per-tool live card flow

Primary blocker is frontend rendering policy:

- `src/components/ai-elements/artifact-tool-card.tsx`
  - Explicitly returns `null` for:
    - `state === "input-streaming"`
    - `state === "input-available"`
  - This suppresses card visibility exactly when a tool starts / is active.

- `src/components/chat-interface.tsx`
  - `shouldShowArtifactPackageHeartbeat(message)` shows one generic package heartbeat while any artifact tool is non-terminal.
  - So instead of “Field Brief active card → done card → Playbook active card…”, UI shows generic package progress during active phases.

Supporting logic:

- `src/lib/chat-utils.ts`
  - `shouldShowAgentStatusProgress(...)` intentionally keeps global status visible during tool input states because cards are hidden there.
  - This codifies replacement of per-tool active cards with global status + package heartbeat.

So this is not accidental: current UI intentionally hides active tool cards.

---

## 2) Purely frontend hiding vs actual stream-delivery issue?

**Not purely frontend**, but frontend is the main direct cause of “no active card while tool is running.”

- Backend/tool stream path appears capable of incremental tool output:
  - `src/ai/tools/h2o-artifacts.ts` uses async-generator `yield` for `rendering`/`storing`/`persisting`/`ready`.
  - `src/lib/chat-handler.ts` merges `result.toUIMessageStream(...)` into SSE.
  - `src/ai/tools/preliminary-output.test.ts` validates AI SDK preliminary tool-output behavior.

Given that, expected behavior with a healthy client stream is:
- No card during `input-*` (by design), then card appears at first `output-available` preliminary yield.

If users see **zero tool cards until refresh**, that suggests a second issue can still happen: stream/chunk delivery or client disconnect during long silent model phases (before tool execute starts), then persisted terminal cards appear on refresh.

So:
- **Frontend policy definitely suppresses “tool started” cards.**
- **A residual streaming continuity issue likely explains “nothing live, only after refresh” in some runs.**

---

## 3) What is still missing to fix “appears paused then dumps at once”

Still missing:

1. **Per-tool active card at tool-start**
   - Need visible card during `input-streaming` / `input-available` (currently hard-hidden).

2. **True step-level liveness during model composition gaps**
   - Current `data-agent-status` is generic and heartbeat-like.
   - It does not fully restore previous semantic phase fidelity for each tool lifecycle transition.

3. **Transport observability for drop/stall cases**
   - Need definitive telemetry for:
     - client disconnect timing
     - first tool chunk latency
     - chunk cadence through Lambda URL to browser
   - Without this, “dump at once” cannot be conclusively separated between UX policy and delivery interruptions.

4. **E2E verification on real Lambda URL streaming**
   - Unit tests prove intent, not live browser/Lambda behavior under long turns.

---

## 4) Minimal implementation plan (no edits done)

1. **Restore active per-tool card rendering**
   - In `artifact-tool-card.tsx`, stop returning `null` for `input-*`.
   - Render “Preparing {title}…” active card for `input-streaming`/`input-available`.

2. **Adjust conversation rendering priority**
   - In `chat-interface.tsx`, remove or demote generic package heartbeat when a concrete artifact tool part exists.
   - Keep heartbeat only for truly no-tool-part windows.

3. **Keep preliminary/final output behavior**
   - Preserve async-generator yields in `h2o-artifacts.ts` (already good).
   - Ensure UI card transitions: active → rendering/storing/persisting → ready download.

4. **Add focused tests**
   - `artifact-tool-card` test: `input-available` renders active card (not null).
   - `chat-interface` test: sequential artifact parts show per-tool cards while active.
   - `chat-utils` test updates for status visibility once active tool cards are visible.
   - Optional integration test around streamed tool chunks arriving before onFinish.

5. **Add stream diagnostics (minimal)**
   - Log/tool telemetry around first `tool-output-available` chunk and client disconnect.
   - Use to confirm whether “dump at once” is UX-only or transport intermittency.

---

## Commit-history context tie-in

- Recent progress docs (`openspec/changes/ai-agent-tool-orchestration/apply-progress.md`) explicitly mention preserving ArtifactToolCard path and semantic status overlay.
- Current code reflects that design choice: hide input-state cards and rely on global status/heartbeat.
- That design diverges from the user’s expected previous flow (per-tool active card progression).

---

## Engram

Engram memory tools were not available in this session, so I could not save findings there.