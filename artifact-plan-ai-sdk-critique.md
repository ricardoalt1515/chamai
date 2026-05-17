# AI SDK v6 Critique: `docs/agent-audit-and-artifact-plan.md`

Reviewed against local `ai@6.0.77` / `@ai-sdk/react@3.0.79` docs and source in `node_modules/ai`.

## Hard findings

### 1. `InferAgentUIMessage<typeof agent, MyDataParts>` is wrong: second generic is metadata, not data parts

**Plan refs:** `docs/agent-audit-and-artifact-plan.md:61-78`

The proposed type:

```ts
export type MyUIMessage = InferAgentUIMessage<typeof agent, MyDataParts>;
```

does **not** add data parts. In AI SDK v6.0.77, `InferAgentUIMessage<AGENT, MESSAGE_METADATA>` maps the second type argument to message metadata and hard-codes data parts to `never`.

**Evidence:**

- `node_modules/ai/src/agent/infer-agent-ui-message.ts:7-11`:
  - `InferAgentUIMessage<AGENT, MESSAGE_METADATA = unknown> = UIMessage<MESSAGE_METADATA, never, InferUITools<...>>`
- `node_modules/ai/docs/07-reference/01-ai-sdk-core/16-tool-loop-agent.mdx:380-407` documents the second generic as message metadata.
- `node_modules/ai/src/ui/ui-messages.ts:42-46` shows `UIMessage<METADATA, DATA_PARTS, TOOLS>` generic order.

**Impact:** Step 3 would erase typed data parts like `data-conversation-title`, `data-new-thread-created`, and the planned `data-artifact-update` instead of adding them.

**Correction direction:** Use `InferAgentUIMessage` only when no custom data parts are needed, or define `UIMessage<metadata, dataParts, InferUITools<typeof agent.tools>>`. Data part keys should omit the `data-` prefix (e.g. key `"artifact-update"` produces part type `"data-artifact-update"`). See `node_modules/ai/src/ui/ui-messages.ts:193-199`.

---

### 2. The proposed tool `execute` cannot receive `{ writer }` from AI SDK tool execution options

**Plan refs:** `docs/agent-audit-and-artifact-plan.md:127-151`, especially `:143-148`

The plan proposes:

```ts
execute: async (input, { writer }) => {
  writer.write({ type: "data-artifact-update", data: input, transient: true });
  return { ok: true };
};
```

AI SDK v6 tool execution options do **not** include `writer`. The typed `ToolExecutionOptions` include `toolCallId`, `messages`, `abortSignal`, and `experimental_context` only.

**Evidence:**

- `node_modules/ai/node_modules/@ai-sdk/provider-utils/src/types/tool.ts:10-39` defines `ToolExecutionOptions` and has no `writer`.
- `node_modules/ai/node_modules/@ai-sdk/provider-utils/src/types/tool.ts:61-64` defines `ToolExecuteFunction<INPUT, OUTPUT> = (input, options: ToolExecutionOptions) => ...`.
- The documented way to write custom stream data from a tool is to close over the `writer` from `createUIMessageStream`, not receive it as a tool option: `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:563-587`.

**Impact:** The planned `proposeArtifactTool` will not typecheck as written. Because the project currently exports a static singleton agent in `src/ai/agents/agent.ts:9-15`, the tool also cannot naturally close over the per-request stream writer unless the agent/tool is created per request or another side channel is introduced.

---

### 3. Transient data parts are not in `responseMessage.parts`; the persistence plan contradicts itself

**Plan refs:**

- Transient streaming choice: `docs/agent-audit-and-artifact-plan.md:100`
- Tool writes transient data: `docs/agent-audit-and-artifact-plan.md:143-148`
- Persistence by walking `responseMessage.parts`: `docs/agent-audit-and-artifact-plan.md:158-161`
- Anti-pattern: `docs/agent-audit-and-artifact-plan.md:222-223`

AI SDK v6 transient data parts are sent to the client and `onData`, but are **not added to message history** and therefore are **not present in `responseMessage.parts`**.

**Evidence:**

- Docs: `node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx:160-181` says transient parts are only accessible via `useChat` `onData`.
- Docs: `node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx:224` explicitly says transient data parts will not appear in `message.parts`.
- Source: `node_modules/ai/src/ui/process-ui-message-stream.ts:744-748` calls `onData` and breaks without adding transient chunks to message state.
- Source: `node_modules/ai/src/ui-message-stream/handle-ui-message-stream-finish.ts:100-109` builds `responseMessage` from message state.

**Impact:** If persistence relies on transient `data-artifact-update`, `onFinish({ responseMessage })` cannot recover those data parts. If persistence instead walks `tool-proposeArtifact` parts, the full section markdown will be in tool inputs and persisted chat history unless explicitly stripped, contradicting the plan’s “Doesn't bloat message history” rationale and “Storing artifact inside `message.parts`” anti-pattern.

---

### 4. Tool calls with full section markdown will likely bloat saved chat history unless stripped

**Plan refs:** `docs/agent-audit-and-artifact-plan.md:124-154`, `:158-161`, `:222-223`

Even if `responseMessage.parts` is used to extract `tool-proposeArtifact` inputs, those tool parts are part of the assistant UI message history when saved. In the current handler, `responseMessage` is saved directly.

**Code refs:**

- `src/lib/chat-handler.ts:349-353` installs `toUIMessageStream({ onFinish })`.
- `src/lib/chat-handler.ts:353-368` saves `responseMessage` / `persistedResponseMessage` directly.

**Evidence:**

- `toUIMessageStream` `onFinish` exposes `responseMessage` as the response UI message: `node_modules/ai/docs/07-reference/01-ai-sdk-core/02-stream-text.mdx:3041-3044`.
- `createUIMessageStream` docs say `responseMessage` is the message sent to the client, including continuation behavior: `node_modules/ai/docs/07-reference/02-ai-sdk-ui/40-create-ui-message-stream.mdx:133-138`.
- Tool UI parts carry input/output states in `node_modules/ai/src/ui/ui-messages.ts:220-280`.

**Impact:** A section-by-section artifact tool with markdown in `input.section.markdown` can duplicate artifact content into chat storage and future model history unless the handler strips or summarizes those tool parts before saving/converting.

---

### 5. `validateUIMessages` and `convertToModelMessages` should be called with tools for tool-bearing messages

**Plan/code refs:**

- Plan claims persistence via `validateUIMessages`: `docs/agent-audit-and-artifact-plan.md:19`
- Current code validates without tools: `src/lib/chat-handler.ts:257-259`
- Current code converts without tools: `src/lib/chat-handler.ts:325-327`

AI SDK v6 supports and documents passing tools to both validation and conversion.

**Evidence:**

- `validateUIMessages` validates metadata, data parts, and tools: `node_modules/ai/docs/07-reference/01-ai-sdk-core/32-validate-ui-messages.mdx:6-8`.
- Advanced validation passes `tools`: `node_modules/ai/docs/07-reference/01-ai-sdk-core/32-validate-ui-messages.mdx:94-100`.
- Source signature includes `tools`: `node_modules/ai/src/ui/validate-ui-messages.ts:476-495`.
- `convertToModelMessages` options include `tools`: `node_modules/ai/docs/07-reference/02-ai-sdk-ui/31-convert-to-model-messages.mdx:42-47`.
- Source uses `options.tools` to construct tool model output: `node_modules/ai/src/ui/convert-to-model-messages.ts:199-219` and `:300-317`.
- `createAgentUIStream` does this automatically with `agent.tools`: `node_modules/ai/src/agent/create-agent-ui-stream.ts:58-67`.

**Impact:** Future artifact/tool history will not be fully validated, and any tool with `toModelOutput` or stricter conversion needs will not be converted correctly unless `tools: deps.agent.tools` is supplied or `createAgentUIStream` is used.

---

### 6. `useChat onData` is correct for live transient UI, but it is not persistence or hydration

**Plan refs:** `docs/agent-audit-and-artifact-plan.md:179-185`

Using `onData` for live artifact updates is v6-correct for transient parts. However, transient data is ephemeral. Hydration must come from the planned `ArtifactDraft` read, and persistence must happen server-side from a non-transient source or side channel.

**Evidence:**

- `useChat` has `onData: (dataPart: DataUIPart) => void`: `node_modules/ai/docs/07-reference/02-ai-sdk-ui/01-use-chat.mdx:329-335`.
- Transient data is only available through `onData`: `node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx:160-181`, `:197-224`.

**Code refs:**

- Current `onData` lives in `ChatInterface`: `src/components/chat-interface.tsx:121-157`.

**Impact:** `ArtifactPanel` cannot independently “subscribe to `useChat` data parts” unless `ChatInterface` lifts/passes artifact stream state or a shared client store is introduced. Existing artifact hydration from `ArtifactDraft` is still required after reload/navigation.

---

## Confirmed-correct points

- `ToolLoopAgent` is the current v6 agent class. Docs: `node_modules/ai/docs/07-reference/01-ai-sdk-core/16-tool-loop-agent.mdx:6-23`; migration guide: `node_modules/ai/docs/08-migration-guides/24-migration-guide-6-0.mdx:85-114`.
- `stopWhen` default is `stepCountIs(20)`, so the plan’s H3 note is correct. Docs: `node_modules/ai/docs/07-reference/01-ai-sdk-core/16-tool-loop-agent.mdx:73-78`.
- Tool definitions should use `inputSchema`, and the planned `proposeArtifactTool` does. Example: `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:527-535`.
- `toUIMessageStream({ onFinish })` with `responseMessage` is valid. Docs: `node_modules/ai/docs/07-reference/01-ai-sdk-core/02-stream-text.mdx:3041-3044`.
