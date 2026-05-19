I’m unable to write files in this runtime (read/grep tools only).  
Please save the following to:

`/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/subagent-compare-secondstream-reference.md`

---

# Comparative exploration: SecondStream (reference) vs SecondstreamAI (current)

## Scope
Read-only comparison of PDF tool UI/streaming lifecycle and why reference shows per-tool progress while current appears frozen until end.

## Key files compared

### Reference (`/Users/ricardoaltamirano/Developer/SecondStream`)
- `frontend/components/chat-ui/chat-interface.tsx`
- `frontend/components/chat-ui/message-parts-renderer.tsx`
- `frontend/lib/chat-bridge/transport.ts`
- `frontend/lib/chat-runtime/chat-utils.ts`
- `frontend/lib/api/chat.ts`

### Current (`/Users/ricardoaltamirano/Developer/SecondstreamAI`)
- `src/components/chat-interface.tsx`
- `src/components/ai-elements/artifact-tool-card.tsx`
- `src/lib/chat-handler.ts`
- `src/lib/chat-runtime.ts`
- `src/lib/chat-utils.ts`
- `src/ai/tools/h2o-artifacts.ts`
- `src/types/ui-message.ts`

---

## 1) Tool-call lifecycle differences

## Reference
- UI renders tool cards during active phases:
  - `message-parts-renderer.tsx` renders PDF tool parts for non-terminal states with `Tool` + `PdfDocumentCard`.
- Stable keying for tool parts:
  - `partKey = tool-${toolCallId}` (prevents remount/flicker/reconciliation weirdness).
- Also rehydrates persisted PDF artifacts as `data-pdf-artifact` parts (`lib/api/chat.ts`) so cards remain visible after reload.

## Current
- `ArtifactToolCard` **suppresses rendering** for:
  - `state === "input-streaming"` or `"input-available"` (`artifact-tool-card.tsx`).
- So during early/active tool phases, card is intentionally hidden; only global status is shown.
- Abort handling sanitizes incomplete tool parts to `output-error` at persist time (`sanitizeAbortedToolParts` in `chat-runtime.ts`), so refresh can suddenly show terminal states.

**Impact:** reference shows per-tool “live activity” cards earlier; current intentionally hides them until output phase.

---

## 2) PDF artifact generation/tool output behavior

## Current
- Tool `execute` is async-generator and yields progress (`rendering` → `storing` → `persisting` → `ready`) in `src/ai/tools/h2o-artifacts.ts`.
- But UI only shows that once tool state is `output-available` (because input states are hidden by card).

## Reference
- PDF tool UI path is oriented around visibly rendering tool cards for active phases and persisted artifact parts (`data-pdf-artifact`) for completed history.

**Impact:** current has backend progress signals, but frontend gating hides most of perceived per-tool progress.

---

## 3) Transport / streaming path differences

## Reference transport
- `createChatBridgeTransport` sets explicit SSE headers:
  - `Accept: text/event-stream`
  - `x-vercel-ai-ui-message-stream: v1`
- Implements both `prepareSendMessagesRequest` and `prepareReconnectToStreamRequest`.
- Uses `experimental_throttle: 50` in `useChat` for smoother incremental UI updates.

## Current transport
- `DefaultChatTransport` to hardcoded Lambda URL in `src/components/chat-interface.tsx`.
- Uses `prepareSendMessagesRequest` (auth/body shaping), but no custom reconnect handler shown.
- No explicit throttle configured.
- Server streams via `createUIMessageStreamResponse({ stream, consumeSseStream: consumeStream })` in `chat-handler.ts` (good for persistence/finalization).

**Impact:** reference transport is more explicitly tuned for UI streaming/reconnect behavior.

---

## 4) UI progress model differences

## Reference
- Per-tool cards rendered in active states.
- Global shimmer only when no visible content/tool activity (`chat-utils.ts` + renderer behavior).
- `message-parts-renderer` memoization + stable toolCallId keys reduce update glitches.

## Current
- Progress UX split:
  - global `AgentStatusProgress` for “preparing/still-working”
  - tool cards hidden until output phase (`ArtifactToolCard` input states return null)
- Heartbeat exists server-side (`AGENT_STATUS_HEARTBEAT_MS = 3000` in `chat-handler.ts`), but that appears as global status, not per-tool card progression.

**Impact:** users perceive “freeze then jump” even though stream may be alive.

---

## 5) Telemetry/logging differences

## Current
- Strong structured logs in server and UI:
  - `[chat] agent_stream_started/ready/finished/error`
  - `onFinish` save logs, part summaries, duration
  - UI `use_chat_status_changed`, reconciliation logs
- This is good for diagnosing end-state jumps/timeouts.

## Reference
- Much lighter logging visible in frontend files; behavior relies more on immediate UI tool-part rendering.

---

## Why reference appears correct while current appears frozen

Primary reasons (code-level):
1. **Current intentionally hides tool cards during input states** (`artifact-tool-card.tsx`), unlike reference renderer.
2. **Current leans on global agent-status heartbeat**, not per-tool active card rendering.
3. **Terminal persistence/reconciliation makes updates appear at end** (especially after long stream/abort/sanitize paths).
4. Transport/reconnect/throttle in reference is more explicitly tuned for incremental UX.

---

## Actionable differences to port

1. **Render artifact tool cards in input states** (at least minimal “starting/running” card)  
   - Current file: `src/components/ai-elements/artifact-tool-card.tsx`  
   - Remove/relax `return null` for `input-streaming` / `input-available`.

2. **Use stable tool keys by toolCallId** (reference pattern)  
   - Current mapping in `src/components/chat-interface.tsx` uses index-derived keys for tool card nodes.
   - Port `tool-${toolCallId}` key strategy to avoid remount-induced end-jump perception.

3. **Add/verify reconnect stream request behavior** like reference transport  
   - Reference: `frontend/lib/chat-bridge/transport.ts` (`prepareReconnectToStreamRequest`).

4. **Consider throttle for smoother UI cadence**  
   - Reference uses `experimental_throttle: 50`.

5. **Keep global heartbeat, but don’t make it the only progress UI**  
   - Current heartbeat is good; combine with visible per-tool active cards for clarity.

---