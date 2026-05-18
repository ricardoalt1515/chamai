I couldn’t write `/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/sdd-explore-live-artifact-still-stuck.md` because this subagent runtime has no file-write tool (read/grep-only).  
Below is the exact SDD explore envelope content to save there.

---

# SDD Explore Envelope — live artifact UI “stuck on Field Brief Pending”

## status
`explore_complete (read-only, no file-write tool)`

## executive_summary
1. **Why live shows only “Field Brief Pending”**: this is mostly explained by AI SDK stream semantics + model behavior, not just UI rendering. A tool card appears when that tool’s `tool-input-start` arrives; if only `generateFieldBrief` input has started, only that card exists live.
2. **Why refresh later shows terminal states**: server persists assistant tool states in `onFinish` (end/abort), and your request is hitting the 240s timeout path. Persisted snapshot can therefore be much later than the initial live phase.
3. **Is it a bug?**  
   - **Primary symptom**: largely expected under long-running/late tool-call emission.  
   - **Secondary UX gap**: if client disconnects/errors, reconciliation window (~24s) is far shorter than observed 240s server completion, so UI can remain stale until manual refresh.
4. **“Parallel” nuance**: runtime executes tool calls concurrently **after each call is fully parsed**, but the model can still emit tool calls/inputs sequentially.
5. **Simplest fix direction**: hide internal `loadSkill` again, show one package-level progress heartbeat, and harden post-stream reconciliation for long-latency completion.

## evidence
- **Observed runtime behavior (AWS evidence you provided):**
  - Request runs ~240s (`REPORT 240454ms`), `onFinish` logs `isAborted:true`.
  - Final persisted parts include multiple terminal tool states (`tool-generateFieldBrief:output-available`, `tool-generatePlaybook:output-available`, `tool-generateAnalyticalRead:output-error`), saved near stream end.
  - High stream-write count (thousands) indicates ongoing stream activity even while UI appears sparse.

- **Tool parts appear only when stream emits tool input start**:
  - AI SDK message processing creates tool UI parts at `tool-input-start` and updates states later (`tool-input-available`, `tool-output-available`):  
    `node_modules/ai/src/ui/process-ui-message-stream.ts:510, 594, 689`

- **Runtime parallelism is after parse/availability, not guaranteed simultaneous start in UI**:
  - Tool execution is intentionally not awaited per call (`executeToolCall` fire-and-continue), enabling parallel execution for already-emitted calls:  
    `node_modules/ai/src/generate-text/run-tools-transformation.ts:346-349`
  - But calls only execute as they are emitted/parsing-complete (`case 'tool-call'`):  
    `.../run-tools-transformation.ts:276, 287, 349`

- **Your UI badge mapping confirms “Pending” means input still streaming**:
  - `input-streaming -> Pending`, `input-available -> Running`:  
    `src/components/ai-elements/tool.tsx:46-47`

- **Server persistence happens at finish/abort boundary**:
  - Tool timeout budget 240s: `src/lib/chat-handler.ts:418`
  - Persist in `onFinish` callback: `src/lib/chat-handler.ts:431, 475`
  - Abort sanitization path before persist: `src/lib/chat-handler.ts:444`
  - Uses `consumeSseStream` for abort-safe finish handling: `src/lib/chat-handler.ts:583`

- **Reconciliation window is short relative to 240s streams**:
  - `maxAttempts=12`, `retryMs=2000`, `settleMs=500` (~24.5s):  
    `src/lib/chat-reconciliation.ts:82, 86, 88`
  - Reconcile on error trigger: `src/components/chat-interface.tsx:417`

- **AI SDK docs align with this behavior**:
  - Tool-call streaming/partial tool input semantics:  
    `node_modules/ai/docs/04-ai-sdk-ui/03-chatbot-tool-usage.mdx:520, 537`
  - Streaming status can start before visible text/tool output (metadata/stream establishment):  
    `node_modules/ai/docs/09-troubleshooting/16-streaming-status-delay.mdx:10, 14`

## recommended_fix_order
1. **Immediate UX cleanup (smallest)**
   - Hide `loadSkill` from live cards again (keep in logs).
   - Add one high-level “Generating artifact package…” heartbeat with elapsed time and expectation copy (“can take several minutes”).
   - Rationale: removes noisy internal steps and matches user preference quickly.

2. **Reliability fix for stale live view (small-medium)**
   - Extend error/disconnect reconciliation window from ~24s to cover real stream durations (e.g., up to 300s with backoff).
   - Keep polling persisted messages until terminal assistant state or cap.
   - Rationale: closes “stuck until manual refresh” gap when stream drops but server keeps working.

3. **Progress fidelity (medium)**
   - Add artifact tool progress milestones via **preliminary tool results** (async generator `execute`) and render `preliminary` states.
   - Optionally emit `data-*` status events for package-level stage transitions.
   - Rationale: makes long tool execution legible without waiting for terminal outputs.

4. **Optional stronger UX certainty (medium)**
   - Pre-seed 4 placeholder artifact cards when a turn is classified as opportunity-advancing; replace as real tool parts arrive.
   - Rationale: user always sees expected package structure immediately.

5. **Longer-term latency reduction (larger)**
   - Reduce single-turn work (fewer artifacts by default or split durable/background workflow).
   - Consider resumable stream architecture if disconnect resilience must be first-class beyond polling.

## risks
- **False expectation risk** with pre-seeded placeholders if model fails to emit all 4 tool calls.
- **Higher backend read load** if reconciliation polling window is extended aggressively.
- **Type/schema churn** if adding preliminary outputs to existing typed artifact tool result contracts.
- **Scope creep** with full resumable-stream implementation (likely exceeds quick-fix size/review budget).

## skill_resolution
- **ai-sdk SKILL**: used local AI SDK source/docs to verify stream/tool semantics (`process-ui-message-stream`, `run-tools-transformation`, `useChat` behavior).
- **ai-elements SKILL**: validated UI state mapping for tool badges (`Pending` vs `Running`).
- **logging-best-practices SKILL**: interpreted CloudWatch structured events (`request_start`, `handler_result`, `stream_write`, `stream_event`) with correlation context.

--- 

If you want, I can next produce a **tight implementation-ready checklist** (no code) mapped to PR slices and estimated diff size.