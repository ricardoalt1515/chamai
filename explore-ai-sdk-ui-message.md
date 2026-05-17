Read-only completed. I did **not** write `/Users/ricardoaltamirano/Developer/SecondstreamAI/explore-ai-sdk-ui-message.md` because the task also said **Do not edit files**; I treated that as higher priority.

Findings saved to Engram project `secondstreamai`.

## Likely mismatch

The Lambda stream path is mostly aligned with AI SDK v6, but the **persisted UI render path can silently render nothing for valid AI SDK parts that the UI does not handle**.

### App-side evidence

- `src/components/chat-interface.tsx`
  - Uses `useChat<MyUIMessage>({ id: threadId, messages: initialMessages, transport: new DefaultChatTransport(...) })`.
  - Renders only these part types:
    - `file`
    - `reasoning`
    - `text`
    - `tool-webSearch`
    - `tool-updateWorkingMemory`
    - default: `null`

- `src/ai/agents/agent.ts`
  - Actual `ToolLoopAgent` tools only include:
    - `loadSkill`

- `src/types/ui-message.ts`
  - `MyUIMessage` declares tools:
    - `webSearch`
    - `updateWorkingMemory`
  - It does **not** declare/render actual agent tool:
    - `loadSkill`

So persisted assistant messages containing `tool-loadSkill`, `step-start`, `source-url`, `source-document`, or other valid AI SDK v6 parts may hydrate correctly but render as blank/partial after reload.

## AI SDK v6 citations

- `node_modules/ai/src/ui/ui-messages.ts`
  - `UIMessage` requires:
    - `id`
    - `role: "system" | "user" | "assistant"`
    - `parts`
  - Assistant parts can include text, reasoning, tool invocation, file, data, source, and step-start parts.

- `node_modules/ai/docs/04-ai-sdk-ui/03-chatbot-message-persistence.mdx`
  - Recommends storing messages in `useChat`/`UIMessage` format.
  - Shows loading stored messages into `useChat({ messages: initialMessages })`.
  - Recommends validating stored messages when tools/data/metadata are involved.

- `node_modules/ai/docs/03-agents/02-building-agents.mdx`
  - Recommends `InferAgentUIMessage<typeof agent>` for ToolLoopAgent/useChat type safety.

- `node_modules/ai/src/ui/http-chat-transport.ts`
  - `DefaultChatTransport` sends `messages`, `trigger`, `messageId`, and body fields; current `prepareSendMessagesRequest` matches this shape.

- `node_modules/ai/src/ui-message-stream/handle-ui-message-stream-finish.ts`
  - `onFinish` receives `responseMessage` and full `messages`; persistence mode uses `originalMessages`.

## Persistence shape

- `src/lib/storage/lambda-chat-store.ts`
  - Writes `payloadJson: message` as native JSON object.
  - Reads object or JSON string.

- `src/lib/storage/amplify-chat-store.ts`
  - Writes `payloadJson: JSON.stringify(message)`.
  - Reads object or JSON string.

This object-vs-string difference is handled by both readers, so it is less likely the primary issue.

## Most likely cause

Persisted assistant messages are valid AI SDK v6 `UIMessage`s, but after reload/click the UI drops unhandled parts. The strongest mismatch is:

```txt
actual agent emits: tool-loadSkill
UI type/rendering expects: tool-webSearch, tool-updateWorkingMemory
```

## Recommended fix direction

Derive the UI message type from the actual agent:

```ts
InferAgentUIMessage<typeof agent>
```

Then add render handling/fallback for `tool-loadSkill`, `step-start`, and unknown valid parts so persisted messages cannot appear blank silently.