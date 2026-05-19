# READ-ONLY audit: AI SDK v6 tool stream path and card flashing

## Scope / constraints

Read-only audit only. I did not edit source files. I inspected AI SDK v6 bundled docs/source under `node_modules/ai/` and this repo's chat/Lambda/UI paths.

Repo was already dirty before this audit, including changes in `src/components/ai-elements/artifact-tool-card.tsx`, `src/components/chat-interface.tsx`, `src/lib/chat-utils.ts`, and tests. Treat those as pre-existing.

## Expected AI SDK v6 flow, with exact source evidence

### 1. `ToolLoopAgent.stream()` is a thin wrapper over `streamText()`

Evidence: `node_modules/ai/src/agent/tool-loop-agent.ts`

- `ToolLoopAgent.stream(...)` returns `streamText({ ...(await this.prepareCall(options)), ... })`.
- It does not run tools itself; it delegates to AI SDK Core stream processing.

Implication: once the returned `StreamTextResult` is consumed via `toUIMessageStream()`, tool-call and tool-result chunks should be streamed according to `streamText`/UI-message rules.

### 2. Model tool-call input chunks map to UI chunks

Evidence: `node_modules/ai/src/generate-text/stream-text.ts` around the `toUIMessageStream` mapping:

- `tool-input-start` text-stream part enqueues UI chunk:
  - `{ type: 'tool-input-start', toolCallId: part.id, toolName: part.toolName, ... }`
- `tool-call` text-stream part enqueues either:
  - invalid: `{ type: 'tool-input-error', ... }`
  - valid: `{ type: 'tool-input-available', toolCallId, toolName, input, ... }`
- `tool-result` text-stream part enqueues:
  - `{ type: 'tool-output-available', toolCallId, output, preliminary?, ... }`

Evidence: AI SDK stream protocol docs `node_modules/ai/docs/04-ai-sdk-ui/50-stream-protocol.mdx` document the same SSE events:

- `tool-input-start` = beginning of tool input streaming.
- `tool-input-available` = input complete and ready for execution.
- `tool-output-available` = tool execution result.

### 3. AI SDK preliminary tool outputs are real streamed chunks, not final-only

Evidence: `node_modules/ai/src/generate-text/run-tools-transformation.ts`

- For each valid tool call, AI SDK starts `executeToolCall(...)` without awaiting it.
- It passes `onPreliminaryToolResult: result => { toolResultsStreamController!.enqueue(result); }`.
- Final result is enqueued later in `.then(result => toolResultsStreamController!.enqueue(result))`.

Evidence: `node_modules/ai/src/generate-text/execute-tool-call.ts`

- `executeTool(...)` is iterated.
- For each `part.type === 'preliminary'`, AI SDK calls `onPreliminaryToolResult` with a `tool-result` carrying `preliminary: true`.
- The non-preliminary final output is returned afterward as a final `tool-result`.

Evidence: repo guard test `src/ai/tools/preliminary-output.test.ts`

- Confirms an async-generator tool yielding `rendering`, `storing`, `persisting`, `ready` produces UI `tool-output-available` chunks:
  - four preliminary chunks with `preliminary === true`
  - then a final duplicate `ready` chunk without `preliminary`.

### 4. `processUIMessageStream()` updates a single tool part in place

Evidence: `node_modules/ai/src/ui/process-ui-message-stream.ts`

- On `tool-input-start`, AI SDK creates/updates the static tool part with state `input-streaming`, then calls `write()`.
- On `tool-input-available`, it updates that part to `input-available`, then calls `write()`.
- On `tool-output-available`, it finds the existing tool invocation by `toolCallId`, updates it to `output-available`, attaches `output` and `preliminary`, then calls `write()`.

Important detail: this is keyed by `toolCallId`, so the SDK is designed to mutate one part through states rather than append duplicate parts.

### 5. `DefaultChatTransport` parses SSE progressively

Evidence: `node_modules/ai/src/ui/default-chat-transport.ts`

- `DefaultChatTransport.processResponseStream(response.body)` calls `parseJsonEventStream(...)` with `uiMessageChunkSchema` and pipes parsed chunks through a transform.

Evidence: `node_modules/ai/src/ui/http-chat-transport.ts`

- It `fetch()`es the configured API, requires `response.body`, and returns `this.processResponseStream(response.body)`.

Implication: if bytes arrive progressively from the network, `DefaultChatTransport` should parse and deliver UI chunks progressively. It is not designed to wait for the full response body.

### 6. `useChat` reconciliation replaces/pushes the assistant message on each chunk write

Evidence: `node_modules/ai/src/ui/chat.ts`

- The active response owns a streaming message state.
- For every processed chunk, `write()` sets status to `streaming` and either:
  - replaces the last message when the streaming message id equals `lastMessage?.id`, or
  - pushes the streaming assistant message otherwise.
- `onFinish` fires in `finally` after the stream is fully consumed or errors/aborts.

Implication: `useChat` should show `input-streaming`, then `input-available`, then preliminary `output-available`, then final `output-available` as chunks arrive. `onFinish` should not run until the HTTP stream completes/fails.

## This repo's server path

### Chat handler construction

Evidence: `src/lib/chat-handler.ts`

- The server creates a `createUIMessageStream<MyUIMessage>({ execute })`.
- It writes transient `data-agent-status` chunks before and during agent setup.
- It calls `await requestAgent.stream({ messages: modelMessages, timeout: { totalMs: 570_000, stepMs: 180_000 } })`.
- It then merges `result.toUIMessageStream({ originalMessages: persistedHistory, generateMessageId: nanoid, onFinish, onError })`.
- Response is `createUIMessageStreamResponse({ stream, consumeSseStream: consumeStream })`.

`originalMessages` evidence:

- On normal submit, the handler saves the current user message, then sets `persistedHistory = [...persistedHistory, persistedUserMessage]`.
- Since the last original message is a user message, AI SDK `handleUIMessageStreamFinish` will not treat the assistant response as a continuation of a prior assistant message.
- Evidence: `node_modules/ai/src/ui-message-stream/handle-ui-message-stream-finish.ts` only reuses the last message id if `lastMessage.role === 'assistant'`.

Conclusion: on normal submit, `originalMessages: persistedHistory` is correct and should not replace an in-progress assistant with the original history. A bad continuation could happen only if `persistedHistory` incorrectly ends with an assistant in a submit path, or on regenerate if the sliced history unexpectedly ends on an assistant.

### Lambda Function URL path

Evidence: `src/components/chat-interface.tsx`

- Production client uses the Lambda Function URL directly: `CHAT_LAMBDA_URL = "https://i2bquluu4ttmvzpuxva665dlye0tnunw.lambda-url.us-east-1.on.aws/"`.
- `DefaultChatTransport` uses `api: getChatTransportApi()` and `prepareSendMessagesRequest` adds Cognito bearer auth and required body fields.

Evidence: `amplify/backend.ts`

- `chatStreamingFunction.addFunctionUrl({ ..., invokeMode: InvokeMode.RESPONSE_STREAM })`.

Evidence: `amplify/functions/chat-streaming/handler.ts`

- Export is `lambdaRuntime ? lambdaRuntime.streamifyResponse(handleChatStreamingRequest) : handleChatStreamingRequest`.
- Handler calls `createChatPostHandler(...)`, gets a `Response`, then `pipeResponseToStream(response, responseStream, { decorateResponseStream, onChunkWritten })`.

Evidence: `amplify/functions/chat-streaming/runtime-adapter.ts`

- `pipeResponseToStream` decorates the Lambda response stream with `awslambda.HttpResponseStream.from` metadata.
- It reads `response.body.getReader()` in a loop and writes each chunk immediately to the Lambda response stream.
- It awaits `drain` when `stream.write()` returns false.
- For `text/event-stream`, it writes SSE comment keepalives every 10s by default.
- It adds default `cache-control: no-cache, no-transform` if absent.

Conclusion: the checked-in AWS path is configured for streaming, not buffered invocation, assuming the deployed Function URL matches current CDK and the runtime exposes `awslambda.streamifyResponse`.

## This repo's client rendering path

Evidence: `src/types/ui-message.ts`

- Artifact tools are statically typed as `generateFieldBrief`, `generatePlaybook`, `generateAnalyticalRead`, `generateProposalShell` outputs.
- UI comments correctly document AI SDK v6 states: `input-streaming`, `input-available`, `output-available`, `output-error`.

Evidence: `src/components/chat-interface.tsx`

- Tool parts are rendered only when `getToolRenderingMetadata(part)` recognizes an artifact tool type.
- Artifact tool types are exactly:
  - `tool-generateFieldBrief`
  - `tool-generatePlaybook`
  - `tool-generateAnalyticalRead`
  - `tool-generateProposalShell`
- Each artifact card gets key `toolRenderKey(message.id, i, toolMetadata.defaultOpen)`.
- `defaultOpen` is false for live/input states, true for terminal states `output-available` or `output-error`.

Evidence: `src/components/ai-elements/artifact-tool-card.tsx`

- `input-streaming` / `input-available` render only when `isLive === true`.
- `input-streaming` shows `Preparing ...`; `input-available` shows `Generating ...`.
- preliminary outputs are rendered as `state === 'output-available' && output.status !== 'ready'` with the output message (`Rendering PDF…`, `Storing PDF…`, etc.).
- final ready output renders download links.

Evidence: `src/lib/chat-utils.ts`

- Global `AgentStatusProgress` hides once the latest assistant message has a visible artifact card.
- Loading shimmer hides as soon as any tool activity exists in the last assistant message, even if no visible card is rendered.

## Likely causes of "tool starts, card flashes, then no visible progress; after minutes all tool outputs arrive at once"

### A. Most likely: network/server stream delivery is still buffering or stalling after early chunks

Why this matches symptoms:

- AI SDK source proves preliminary tool outputs are enqueued as chunks when the generator yields.
- This repo's artifact tool `persistArtifact` yields progress before expensive stages: `rendering` before `renderArtifactPdf`, `storing` before S3 put, `persisting` before DB save, then `ready`.
- If the user receives all preliminary/final outputs at once after minutes, the missing piece is likely byte delivery between Lambda and browser, not AI SDK state generation.

Specific places to verify operationally:

1. CloudWatch logs from `pipeResponseToStream` `stream_write` telemetry:
   - If `stream_write` entries appear throughout the minutes, Lambda is writing progressively; buffering is downstream/browser/network.
   - If `stream_write` entries are also delayed until the end, the upstream AI SDK/tool stream is not producing chunks until then.
2. `curl -N --no-buffer` against the exact production Lambda URL with auth, per `docs/lambda-chat-smoke.md`.
3. Confirm deployed Function URL has `InvokeMode=RESPONSE_STREAM`, not just source/CDK. Source is correct, but deployment drift can still produce buffered behavior.
4. Confirm no CDN/proxy/browser extension is transforming `text/event-stream`; headers should include `content-type: text/event-stream` and `cache-control: no-cache, no-transform`.

### B. `requestAgent.stream()` await is not the likely minutes-long buffer

`ToolLoopAgent.stream()` awaits `prepareCall()` then calls `streamText()`. That should be fast unless project `prepareStep`/`prepareCall` does unexpected async work. The model/tool work happens when the stream is consumed after `writer.merge(result.toUIMessageStream(...))`.

The handler does emit `data-agent-status` before this, then `streaming-results` before merge. If users see early status/card but not ongoing chunks, the bottleneck is later than `requestAgent.stream()` setup.

### C. `originalMessages` is probably not the cause on normal submit

AI SDK uses `originalMessages` for persistence/finish state and continuation detection. It only continues/replaces an existing assistant if `originalMessages.at(-1).role === 'assistant'`.

This repo appends the just-saved user message to `persistedHistory` before passing it as `originalMessages`, so normal submit ends with a user message. That means no assistant continuation/replacement from original history.

Edge case to check: regenerate. If the sliced persisted history in regenerate ends with an assistant, AI SDK will treat the response as continuation of that assistant id. That could cause replacement/remount behavior, but it does not explain normal new-message reports unless the submitted history is malformed.

### D. Tool part key remount can cause a flash/remount at terminal transition, but not minutes of invisibility

`toolRenderKey(message.id, i, defaultOpen)` changes when state enters terminal states (`output-available` / `output-error`) because `defaultOpen` flips from `false` to `true`.

Effect: React will unmount/remount the card when the first output arrives. This can look like a flash at the exact transition from input card to output/progress card.

But it should not make progress disappear for minutes, because:

- `input-streaming` and `input-available` both use the same `active` key.
- preliminary `output-available` should render immediately as an output progress card after the remount.

So key remount is a secondary visual contributor, not the primary "all outputs arrive at once" cause.

### E. `isLive` gating can hide live input cards if message/status identity is lost

`ArtifactToolCard` hides `input-streaming` / `input-available` unless `isLive === true`.

`isLive` is computed from:

- `status === 'submitted' || status === 'streaming'`
- latest message is assistant
- rendered message id equals latest assistant id

If `useChat` status flips to `ready`/`error`, or a reconciliation/setMessages replaces the latest message while a tool input part is still incomplete, live input cards disappear. Terminal `output-available` cards still render historically.

This could explain "card flashes then disappears" if the HTTP stream errors/disconnects while server continues to completion elsewhere. However it does not explain final outputs arriving in the same client stream unless the client later receives/sets persisted final messages via reconciliation.

Telemetry to verify:

- Browser console `[chat-ui] use_chat_status_changed` around the disappearance.
- Browser console `[chat-ui] use_chat_finish` timing.
- Reconciliation logs `[chat-ui] reconciliation_decision`.

### F. `onFinish` / reconciliation should only affect after stream end/error

This repo calls `reconcileAfterStreamRef.current('on_finish')` inside `useChat.onFinish`, and also reconciles on `error`.

Because AI SDK client `onFinish` fires after `consumeStream` completes/fails, this should not remove cards mid-stream unless the client believes the stream ended/errored early.

If the card disappears while the server is still generating, look for:

- client status `streaming -> ready` or `streaming -> error` before server `agent_stream_finished`
- network disconnect/idle timeout
- reconciliation applying persisted messages that do not include incomplete tool parts

### G. Global status/shimmer logic can create a visible gap if an unrendered tool part exists

`shouldShowLoadingShimmer` suppresses generic `Thinking…` as soon as any tool activity exists in the last assistant message.

`shouldShowAgentStatusProgress` hides global status once a visible artifact card exists.

If a tool part exists but `ArtifactToolCard` returns `null` (e.g. not live, type mismatch, or status not streaming), both generic progress and card progress can be absent. This is a plausible UI-only reason for "no visible progress" after a brief card, especially if `isLive` becomes false.

## Bottom-line diagnosis

Based on verified AI SDK v6 source, the SDK path should stream:

1. `tool-input-start` -> client part `input-streaming`
2. `tool-input-available` -> same part `input-available`
3. each async-generator yield -> `tool-output-available` with `preliminary: true`
4. final tool result -> `tool-output-available` without `preliminary`

This repo's tool, server, Lambda adapter, transport, and UI are broadly aligned with that contract.

The observed "after minutes all tool outputs arrive at once" most strongly indicates a stream-delivery/buffering problem in the deployed Lambda/network path, or that the server-side AI SDK/tool stream is not producing `stream_write` chunks until the end. The fastest discriminator is CloudWatch `stream_write` timing and `curl -N --no-buffer` against the production Lambda URL.

The observed "card flashes then disappears" is likely a UI side-effect layered on top of that delivery issue:

- input cards are hidden when `isLive` becomes false;
- generic shimmer is suppressed by any tool activity;
- global agent status hides once an artifact card exists;
- terminal key remount can flash at `output-available` transition.

But those UI factors alone do not explain final chunks arriving all at once; they explain the disappearance/gap once the client has stale/incomplete stream state.

## Recommended next verification, still read-only

1. In browser devtools, capture exact event order:
   - `use_chat_status_changed`
   - `use_chat_finish`
   - `reconciliation_decision`
   - network response chunk timing
2. In CloudWatch, compare:
   - `agent_stream_started`
   - `agent_stream_ready`
   - `stream_write` chunk indexes/timestamps
   - `artifact_render_started/finished`, `artifact_pdf_storage_started/finished`, `artifact_db_persist_started/finished`
   - `agent_stream_finished`
3. Run production `curl -N --no-buffer` with auth and watch whether `data:` lines appear progressively or only at end.
4. If CloudWatch writes progressively but browser does not receive progressively, investigate deployed Function URL/proxy/browser buffering despite `RESPONSE_STREAM`.
5. If CloudWatch writes only at end, inspect upstream AI SDK/provider/tool execution timing around `run-tools-transformation` and the artifact generator yields.
