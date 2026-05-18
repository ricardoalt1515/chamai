I couldn’t write to `/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/sdd-explore-final-chunks-abort.md` because this subagent session has no file-write tool (read/grep-only).  
Below is the exact SDD explore envelope content to save there.

---

# SDD Explore Envelope — final tool chunks vs abort/live UI staleness

## status
`explore_complete (read-only; no file write available)`

## scope
Investigated server + AI SDK stream mechanics for abort/timeouts and why live browser can stay on `Pending` while Lambda persistence shows terminal tool states after refresh.

## direct answers

### 1) Do terminal tool states appear only in `onFinish` after `isAborted` sanitization?
**Mostly yes for sanitized terminal states; no for naturally completed tool outputs.**

- `chat-handler` merges raw UI stream directly: `writer.merge(result.toUIMessageStream(...))` (`src/lib/chat-handler.ts:421-423`).
- Abort sanitization happens only inside `toUIMessageStream.onFinish` before persistence:
  - `const sanitized = isAborted ? sanitizeAbortedToolParts(responseMessage) : responseMessage` (`src/lib/chat-handler.ts:443-445`).
- `sanitizeAbortedToolParts` converts incomplete states to `output-error` (`src/lib/chat-runtime.ts:78-93`).

So:
- **`output-error` synthesized by sanitization is persist-only unless you explicitly re-emit it.**
- **`output-available` still comes from actual streamed `tool-result` chunks** (not from sanitization).

---

### 2) Does `sanitizeAbortedToolParts(responseMessage)` affect only persisted message, not already-merged live stream?
**Yes.**

- The live stream has already been merged from `result.toUIMessageStream(...)` (`src/lib/chat-handler.ts:421-423`).
- Sanitization is applied in callback logic before save (`src/lib/chat-handler.ts:443-446`) and then stored (`src/lib/chat-handler.ts:475-478`).
- No corresponding `writer.write(...)` emits sanitized replacements back to client.

---

### 3) Could live client be correctly stuck because terminal states are synthesized/persisted server-side after abort but not emitted as UI chunks?
**Yes — this is consistent with current AI SDK behavior.**

Key mechanics:

1. **Abort path emits `abort` and closes stream** (`node_modules/ai/src/generate-text/stream-text.ts:1213-1216`).
2. In pull loop, if abort is set after `reader.read()`, SDK checks `abortSignal.aborted` before enqueueing value, so that read value can be dropped (`stream-text.ts:1235-1240`).
3. `toUIMessageStream` forwards abort as UI chunk (`stream-text.ts:2715-2716`).
4. `handleUIMessageStreamFinish` only marks `isAborted` when abort chunk appears (`.../handle-ui-message-stream-finish.ts:70-71`), then calls `onFinish` with accumulated state (`...:109-112`).
5. `processUIMessageStream` has **no** `case 'abort'` (no state mutation on abort; grep returns no matches), while it *does* mutate state for `tool-output-available`/`tool-output-error` (`.../process-ui-message-stream.ts:689-754`).
6. Server-side tee consumption can still finish/persist even if browser misses tail:
   - `createUIMessageStreamResponse` tees and consumes second branch (`.../create-ui-message-stream-response.ts:33-36`),
   - and your handler passes `consumeSseStream: consumeStream` (`src/lib/chat-handler.ts:583`).

So yes: persistence can reflect final/sanitized tool states that never updated live browser state before close/disconnect.

---

### 4) Simplest fix recommendation
**Recommended order:**

1. **Primary correctness fix (server): emit abort reconciliation chunks before close.**  
   On `isAborted` in `chat-handler` `onFinish`, synthesize and emit terminal tool chunks (at least `tool-output-error` for incomplete tool calls) before stream ends, not only in persistence.

2. **Keep/strengthen post-finish reconciliation fallback (client).**  
   Needed for true disconnect/tail-loss scenarios where final SSE is never received.

3. **Preliminary/data progress is useful UX, not a core correctness fix.**  
   AI SDK supports preliminary tool results via AsyncIterable/yields (`node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:525-530`, and implementation in `.../execute-tool-call.ts:115-121`), but this mainly improves visibility during long tool execution.

## additional notes on Lambda adapter timing
- Adapter writes response body chunks in loop (`runtime-adapter.ts:251-253`) and always `stream.end()` in `finally` (`runtime-adapter.ts:262-265`).
- This means tail events + close can cluster at timeout boundary; if client transport is already degraded, final UI deltas are easy to miss even though server persistence succeeded.

## confidence
`high` for Q1–Q3 behavior (direct source-confirmed), `medium-high` for fix ordering (tradeoff-based, but aligned with current mechanics).

---