# AI SDK v6 streaming diagnosis: ToolLoopAgent/useChat tool parts

## Scope

Read-only diagnosis for why live artifact/tool cards are not visible until page refresh. No code edits were made outside this report artifact.

## Verified AI SDK v6 behavior

### `useChat` should show tool parts live

Current bundled AI SDK docs and source say tool calls/results are integrated into assistant `message.parts` as typed tool parts:

- `node_modules/ai/docs/04-ai-sdk-ui/03-chatbot-tool-usage.mdx`: server-side tool calls/results are forwarded to the client; assistant message parts contain typed tool parts like `tool-getWeatherInformation`; UIs should render `message.parts`.
- `node_modules/ai/docs/03-agents/06-subagents.mdx`: streaming progress is read from the tool part `state` and `preliminary` flag.
- `node_modules/ai/src/ui/process-ui-message-stream.ts`: `tool-input-start`, `tool-input-delta`, `tool-input-available`, `tool-output-available`, and `tool-output-error` all call `write()`, which updates the active assistant message.
- `node_modules/ai/src/ui/chat.ts`: the first `write()` flips status to `streaming`, then pushes/replaces the assistant message in React state. `onFinish` fires in `finally` after the stream is consumed.

So, if `tool-output-available` chunks reach the browser, `useChat` should update `messages` live before refresh and before `onFinish` reconciliation replaces state from persistence.

### `onData` is not a tool-chunk hook

`onData` only receives `data-*` parts. It will observe this repo's `data-agent-status`, `data-new-thread-created`, and `data-conversation-title` events, but not `tool-input-*` or `tool-output-*` chunks.

Sources:

- `node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx`: transient data parts are only available through `onData`; persistent data parts can be rendered from message parts.
- `node_modules/ai/src/ui/process-ui-message-stream.ts`: `onData` is called in the data-part branch; tool branches update message parts and call `write()`.

Implication: instrumenting only `onData` cannot prove whether tool-output chunks arrived. Tool arrival must be instrumented from `messages` changes on the client and/or by teeing/logging UI message chunks on the server before `writer.merge()`.

### Async-generator preliminary output contract remains valid

The repo already has an empirical guard in `src/ai/tools/preliminary-output.test.ts`: async-generator tool yields are emitted as `tool-output-available` chunks with `preliminary: true`, and the last yield is emitted again as final without `preliminary`.

The current artifact tools in `src/ai/tools/h2o-artifacts.ts` yield:

1. `{ status: "rendering" }`
2. `{ status: "storing" }`
3. `{ status: "persisting" }`
4. `{ status: "ready", formats: [...] }`

Therefore the UI should be able to render progress cards for preliminary `output-available` states, then the ready card.

## Repo rendering path

### Artifact cards intentionally hide input states

`src/components/ai-elements/artifact-tool-card.tsx` returns `null` for:

- `input-streaming`
- `input-available`

It renders cards for:

- `output-error`
- `output-available` with progress output (`rendering`, `storing`, `persisting`)
- `output-available` with ready output (`ready` + PDF download URL)
- fallback preparing card only for states that are not currently filtered out

This means there will be no actual tool card during model tool-input composition. That is intentional per comments, but it also means the user depends entirely on global status/heartbeat UI during potentially long `input-*` windows.

### Global progress is supposed to cover hidden input states

`src/lib/chat-utils.ts` keeps `AgentStatusProgress` visible while the last assistant has only `input-streaming` / `input-available` tool activity, because `ArtifactToolCard` is null there.

`src/components/chat-interface.tsx` also renders `ArtifactPackageHeartbeat` when a message has artifact tool parts and at least one is non-terminal.

Caveat: these are not “tool cards”. A user expecting live per-artifact cards will see no card until the first `output-available` chunk. If tool input composition is long, or if preliminary `output-available` chunks are not arriving live, the page appears blank/stuck except for global status.

## Most likely failure modes

### 1. `ArtifactToolCard` returning null does hide necessary per-tool progress during `input-*`

Per AI SDK docs, `input-streaming` and `input-available` are legitimate visible states. The docs examples render loading/preparing content for both. This repo suppresses those states and relies on global status instead.

That is acceptable only if global `data-agent-status` is reliably visible and semantically enough. It does not satisfy “live tool cards” during input composition.

### 2. Final/preliminary `tool-output-available` may be persisted but not rendered live if stream chunks are not reaching `useChat`

If refresh shows completed cards, the persisted assistant message likely contains terminal `output-available` parts. That does not prove the browser received live `tool-output-available` chunks.

Server persistence occurs inside the `toUIMessageStream({ onFinish })` callback in `src/lib/chat-handler.ts`. Client reconciliation after `useChat.onFinish` calls `getThreadMessages` and `setMessages(freshMessages)`. Therefore a card appearing only after refresh/reconciliation can be explained by:

1. tool results were generated and persisted on server;
2. live UI message chunks were delayed, dropped, buffered, or not observed by client state;
3. the persisted snapshot later hydrates terminal tool parts.

### 3. Existing telemetry does not prove live tool timing

Current client logs:

- `use_chat_status_changed` only when status changes; it has `messages` in the dependency array but immediately returns if status is unchanged, so it does **not** log each message/tool-part mutation.
- `use_chat_finish` logs only final state.
- `onData` handles data parts but does not log every agent-status timing and cannot see tool chunks anyway.

Current server logs:

- artifact tool lifecycle (`artifact_render_started`, etc.) proves the async generator reached phases;
- `agent_stream_finished` / `onFinish:before-save` / `onFinish:saved` proves final persisted message parts;
- it does not log each UI message stream chunk emitted to the HTTP response.

## Instrumentation that would prove timing

### Client-side proof

Add temporary development-only telemetry driven by `messages`, not status:

- keep a ref of last seen `toolCallId:state:preliminary:output.status`;
- on every `messages` update, log only transitions for artifact tool parts;
- include `performance.now()`, `threadId`, message id, part index, part type, `toolCallId`, `state`, `preliminary`, `output?.status`, and whether `ArtifactToolCard` would render null.

This proves whether `useChat` receives `input-*`, preliminary `output-available`, and final `output-available` live.

Also log `onData` agent-status events with timestamps. That proves the global progress channel is active, but not tool chunks.

### Server-side proof

Wrap the stream passed to `writer.merge(result.toUIMessageStream(...))` with a temporary `TransformStream` that logs chunk timing before enqueue:

- `tool-input-start`
- `tool-input-delta`
- `tool-input-available`
- `tool-output-available` with `preliminary` and `output.status`
- `finish`

Include elapsed time from request start and `toolCallId`. This proves the server generated UI chunks before `toUIMessageStream` `onFinish` persistence.

Expected timing if healthy:

1. server logs `tool-input-*` chunks;
2. client `messages` transition logs matching `input-*` states;
3. server logs preliminary `tool-output-available` (`rendering`, `storing`, `persisting`, `ready`, `preliminary: true`);
4. client logs matching output transitions and renders card;
5. server logs final `tool-output-available` (`ready`, no preliminary);
6. client logs final transition;
7. server `onFinish:before-save` / `onFinish:saved`;
8. client `use_chat_finish`;
9. reconciliation either no-ops or replaces with equivalent persisted message.

## Conclusions

- AI SDK v6 `useChat` should show tool parts live in `message.parts`; this repo is already using the correct `parts` rendering pattern.
- `ArtifactToolCard` returning null absolutely hides per-tool progress during `input-streaming` and `input-available`. The repo intentionally replaces that with global `AgentStatusProgress` and `ArtifactPackageHeartbeat`, but users will not see live tool cards until `output-available`.
- Progress yields (`rendering`, `storing`, `persisting`, `ready`) should render as `output-available` cards if those chunks reach the browser.
- If completed cards appear only after page refresh, the leading hypothesis is not the async-generator contract; it is a stream delivery/client-state/rendering observation gap between server `tool-output-available` chunks and client `messages` updates, or the UI suppressing visible states before first output.
- Existing telemetry is insufficient: `onData` cannot observe tool chunks, status-change logs skip message-only changes, and server logs do not currently log UI message chunks before merge.
