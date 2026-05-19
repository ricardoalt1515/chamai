# Focused AI SDK tool-card flow verification

## Scope

No edits were made. I read `/Users/ricardoaltamirano/.pi/agent/skills/ai-sdk/SKILL.md` first, verified the installed SDK locally (`ai@6.0.182`; `node_modules/ai/docs/` present), then mapped the SDK stream contract to this repo's chat/card implementation.

## AI SDK v6 stream contract, verified from local docs/source

### Wire chunks vs UI message parts

The AI SDK stream wire format includes tool chunks:

- `tool-input-start`
- `tool-input-delta`
- `tool-input-available`
- `tool-output-available`
- `tool-output-error`

Verified in `node_modules/ai/src/ui-message-stream/ui-message-chunks.ts`.

`processUIMessageStream` converts those chunks into `message.parts` tool parts:

- `tool-input-start` creates/updates a `tool-<toolName>` UI part with `state: "input-streaming"`, `input: undefined`, then calls `write()`.
- `tool-input-delta` appends to the partial JSON text, parses partial JSON, updates the same tool part with `state: "input-streaming"` and partial `input`, then calls `write()`.
- `tool-input-available` updates the same tool part with `state: "input-available"`, full `input`, then calls `write()`; `onToolCall` runs after this write and is blocking.
- `tool-output-available` updates the same tool part with `state: "output-available"`, `output`, optional `preliminary`, then calls `write()`.

Verified in `node_modules/ai/src/ui/process-ui-message-stream.ts`.

The SDK docs explicitly show rendering `part.state === "input-streaming"`, `"input-available"`, `"output-available"`, and `"output-error"` inside `message.parts.map(...)` for `useChat` tool parts. See `node_modules/ai/docs/04-ai-sdk-ui/03-chatbot-tool-usage.mdx`.

### React update path

`useChat` uses `useSyncExternalStore` over a `Chat` instance. React state is notified whenever the SDK `write()` path replaces/pushes a message.

Verified in:

- `node_modules/ai/src/ui/chat.ts`: `write()` sets status to `streaming` and pushes/replaces the assistant message.
- `node_modules/@ai-sdk/react/src/chat.react.ts`: `replaceMessage` deep-clones the updated message and calls registered callbacks.
- `node_modules/@ai-sdk/react/src/use-chat.ts`: `useSyncExternalStore` subscribes to messages/status.

Conclusion: SDK-level `useChat` does support per-tool UI part updates as soon as `tool-input-start` arrives, and supports subsequent in-place state transitions for the same `toolCallId`.

### Async-generator preliminary yields

For tools whose `execute` is an async generator, AI SDK executes the tool through `executeToolCall`:

- each preliminary generator yield is emitted via `onPreliminaryToolResult` as a `tool-result` with `preliminary: true`;
- the final output is returned as a normal `tool-result` without `preliminary`.

Verified in `node_modules/ai/src/generate-text/execute-tool-call.ts` and conversion to UI chunks in `node_modules/ai/src/generate-text/stream-text.ts` (`tool-result` => `tool-output-available`, preserving `preliminary`).

This repo already has an empirical guard test: `src/ai/tools/preliminary-output.test.ts`. It verifies an async-generator tool with four yields produces five `tool-output-available` UI chunks: four preliminary chunks plus a final duplicate of the last ready output.

Conclusion: AI SDK supports the desired `Preparing… -> Ready/downloadable` progress flow from async-generator tool outputs.

## Bedrock streaming behavior and possible buffering

The installed Bedrock provider maps Bedrock Converse Stream events as follows:

- Bedrock `contentBlockStart.start.toolUse` => SDK `tool-input-start`
- Bedrock `contentBlockDelta.delta.toolUse.input` => SDK `tool-input-delta`
- Bedrock `contentBlockStop` for the tool block => SDK `tool-input-end` followed by SDK `tool-call`, which later becomes UI `tool-input-available`

Verified in `node_modules/@ai-sdk/amazon-bedrock/src/bedrock-chat-language-model.ts`.

Important implication: AI SDK can only create the `input-streaming` card after Bedrock has actually emitted `contentBlockStart` for the tool use. If Claude/Bedrock spends time reasoning/composing before emitting that event, or if Bedrock buffers tool-use start/delta events until a larger part of the tool JSON is ready, the SDK/client cannot display an SDK tool part yet. This is real upstream/model/provider latency, not a React issue.

This repo already accounts for that silent window with `prepareStep`/`onNextArtifact`: `src/ai/agents/agent.ts` announces the next artifact before the model composes the artifact tool input, and `src/lib/chat-handler.ts` writes `data-agent-status` chunks like `preparing-artifact`.

## Mapping to SecondstreamAI implementation

### Server path

`src/lib/chat-handler.ts`:

1. Builds artifact tools with `createH2oArtifactTools(...)`.
2. Creates/uses a `ToolLoopAgent`.
3. Writes `data-agent-status` chunks before/around agent streaming.
4. Merges `result.toUIMessageStream({ originalMessages, generateMessageId, onFinish, ... })` into `createUIMessageStream`.
5. Persists the final assistant message in `onFinish` after sanitizing aborted incomplete tool parts.

This is compatible with AI SDK v6's UI stream contract.

### Artifact tool outputs

`src/ai/tools/h2o-artifacts.ts`:

- artifact tools are `tool({ inputSchema, execute })`;
- `execute` returns `runArtifactTool(...)`, an async generator;
- `persistArtifact(...)` yields progress outputs: `rendering`, `storing`, `persisting`, then `ready` with PDF `downloadUrl`.

Those yields become `tool-output-available` UI updates. The final `ready` output remains in the final assistant message, so the download card can remain available after completion and after history persistence.

### Client rendering

`src/components/chat-interface.tsx` maps known artifact tool parts:

- `tool-generateFieldBrief`
- `tool-generatePlaybook`
- `tool-generateAnalyticalRead`
- `tool-generateProposalShell`

It passes `state`, `output`, and `errorText` into `ArtifactToolCard`.

However, `src/components/ai-elements/artifact-tool-card.tsx` intentionally returns `null` for:

- `state === "input-streaming"`
- `state === "input-available"`

The comment says the global `AgentStatusProgress` handles this phase to avoid duplicate shimmer.

Therefore, in this repo as currently written, a per-tool artifact card does **not** appear as soon as the SDK tool call starts. The SDK does create/update a tool part at `input-streaming`, but the artifact card suppresses itself for that state. The visible UI during input composition is instead:

- `AgentStatusProgress` from `data-agent-status`, and/or
- `ArtifactPackageHeartbeat` if an artifact tool part exists but is not terminal.

Once the tool yields its first progress output (`tool-output-available` with `status !== "ready"`), `ArtifactToolCard` renders a per-tool progress card. Once the tool yields `ready`, the same card becomes the downloadable ready card. When the next artifact tool starts, the next `tool-...` part can appear in `message.parts`; whether its card appears immediately depends on the same suppression rule.

### Does the expected UX work?

Expected: "per-tool card appears as soon as the tool/tool-call starts, ready card remains downloadable when done, next tool card appears."

AI SDK support:

- Supported by SDK: yes. `tool-input-start` produces a `tool-<name>` part with `state: "input-streaming"` and triggers a React update.
- Supported by async-generator outputs: yes. Preliminary `tool-output-available` chunks can update the card before final ready.
- Ready/downloadable persistence: yes, if final assistant message contains `output-available` ready output; this repo's artifact tool does that.

Current repo behavior:

- Card at tool start: no, intentionally suppressed in `ArtifactToolCard` for `input-streaming`/`input-available`.
- Card during tool execution after first generator yield: yes, `output-available` progress output renders.
- Ready card remains downloadable: yes, when `output.status === "ready"` and `formats[0].downloadUrl` exists.
- Next tool card appears: yes after its first visible `output-available`; not at `input-streaming` unless the card suppression changes.

## Instrumentation to distinguish provider buffering from React rendering suppression

No edits made; this is the recommended diagnostic plan.

### 1. Server-side raw UI chunk timing

Wrap/log the stream returned by `result.toUIMessageStream(...)` before `writer.merge(...)` in `src/lib/chat-handler.ts`.

Log timestamps for these chunk types:

- `tool-input-start`
- `tool-input-delta`
- `tool-input-available`
- `tool-output-available` including `preliminary` and `output.status`
- `tool-output-error`
- `data-agent-status`

If `data-agent-status: preparing-artifact` is logged early but `tool-input-start` is not logged for many seconds, the delay is upstream/model/provider: Bedrock/Claude has not emitted the tool-use start yet, or provider events are buffered.

If `tool-input-start` is logged on the server promptly, the SDK/provider path is not the bottleneck.

### 2. Network/SSE timing

Inspect browser devtools or `curl -N` against the chat endpoint and record when serialized chunks arrive. Compare against server timestamps.

- Server logs chunk early, network receives late: HTTP/Lambda/proxy buffering.
- Network receives `tool-input-start` early: client has enough data to render an input-state card.

### 3. Client message-part timing

Add temporary client logging in `ChatInterface` when `messages` changes, extracting tool parts and states:

- `part.type`
- `part.toolCallId`
- `part.state`
- `part.preliminary`
- `part.output?.status`
- `performance.now()`

Interpretation:

- Client messages contain `tool-generateX` with `state: "input-streaming"`, but no visible card: React is updating correctly; `ArtifactToolCard` suppression is responsible.
- Client messages do not contain tool parts until much later, but server/network does: investigate `DefaultChatTransport`/stream parsing or React subscription throttling. Note: this repo does not pass `experimental_throttle`, so throttling is unlikely.
- Client messages and server both receive tool parts late: provider/model buffering or delayed tool-use generation.

### 4. Render-level instrumentation

Temporarily log from `ArtifactToolCard` render with `title`, `state`, `output?.status`.

- If it logs `input-streaming` and returns `null`, that confirms intentional render suppression.
- If it does not log until `output-available`, but message-part logs show input states, inspect parent rendering/`getToolRenderingMetadata`/`isArtifactToolPart` path.

## Bottom line

The AI SDK v6 supports the target flow, including early `input-streaming` tool parts and async-generator preliminary output cards. Bedrock can still delay the first SDK-visible tool part if it does not emit `contentBlockStart`/tool input deltas promptly. In this repo, the larger immediate reason a per-tool card does not appear at tool start is local UI behavior: `ArtifactToolCard` deliberately returns `null` for `input-streaming` and `input-available`; the UI uses global agent status/heartbeat instead until the first `output-available` progress yield.
