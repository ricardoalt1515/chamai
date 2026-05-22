# Code Context

## Files Retrieved
1. `src/components/chat-interface.tsx` (lines 129-180, 270-378) - client-side AI SDK transport setup, request body shape, auth header, and stream lifecycle hooks.
2. `app/api/chat/route.ts` (lines 1-8) - Next.js API route entry point for local/server chat POST.
3. `src/lib/chat-handler-next.ts` (lines 1-45) - Next runtime dependency wiring for the shared chat handler.
4. `amplify/functions/chat-streaming/handler.ts` (lines 1-23, 92-213) - Lambda Function URL streaming entry point and production dependency wiring.
5. `src/lib/chat-helpers.ts` (lines 38-55, 61-215) - request schema and parsed `ChatRequest` including thread/message/model fields.
6. `src/lib/chat-handler.ts` (lines 255-395, 395-640, 660-690) - main per-request flow: validate, persist user message, build model messages, stream agent, persist assistant message, title generation.
7. `src/ai/agents/agent.ts` (lines 1-80, 177-270) - AI SDK `ToolLoopAgent`/Bedrock configuration, prompt cache options, tool repair call, and existing step-level usage logging.
8. `src/lib/bedrock-provider.ts` (lines 1-10) - Bedrock provider construction via `@ai-sdk/amazon-bedrock`.
9. `src/lib/storage/chat-store-types.ts` (lines 1-29) - chat persistence interface; currently message payload only, no explicit usage fields.
10. `src/lib/storage/amplify-chat-store.ts` (lines 75-109, 150-187, 234-248) - Amplify chat store writes `Message.payloadJson` as the whole UI message.
11. `src/lib/storage/lambda-chat-store.ts` (lines 180-287) - Lambda DynamoDB chat store persists full UI message in `payloadJson`.
12. `amplify/data/resource.ts` (lines 21-43) - Amplify data schema for `Session` and `Message`; no token usage columns/models today.

## Key Code

### Client request surface

`src/components/chat-interface.tsx` sends all chat requests to the Lambda Function URL from `amplify_outputs.json`, not `/api/chat`, in the active UI path:

```ts
export const getChatTransportApi = (): string => CHAT_LAMBDA_URL;

export const prepareChatSendMessagesRequest = ({ body, messageId, messages, trigger }) => {
  const preparedBody = {
    threadId: requestBody.threadId,
    messages,
    trigger,
    messageId,
    modelId: requestBody.modelId,
    webSearchEnabled: typeof requestBody.webSearchEnabled === "boolean" ? requestBody.webSearchEnabled : false,
  };

  return getAccessToken().then((token) => ({
    body: preparedBody,
    headers: { authorization: `Bearer ${token}` },
  }));
};
```

`useChat<MyUIMessage>` uses `DefaultChatTransport`, receives data parts in `onData`, and reconciles persisted messages after finish/error. Request-scoped usage could be returned as a custom data part here, but nothing currently handles usage data.

### Server/Lambda entry points

`app/api/chat/route.ts` is a thin Next route:

```ts
export async function POST(request: Request): Promise<Response> {
  return chatPost({ request });
}
```

`src/lib/chat-handler-next.ts` wires the same `createChatPostHandler` for Next runtime with Amplify storage and `createAgent`.

Production Lambda path is `amplify/functions/chat-streaming/handler.ts`: it verifies Cognito, creates DynamoDB/S3 stores, then calls the shared `createChatPostHandler`. This means token usage capture should primarily be implemented in shared `src/lib/chat-handler.ts` / `src/ai/agents/agent.ts`, not separately per runtime.

### Request parsing

`src/lib/chat-helpers.ts` accepts:

```ts
type ChatRequest = {
  threadId: string;
  messages: MyUIMessage[];
  trigger?: string;
  regenerateMessageId?: string;
  modelId: string;
  runtimeModelId: string;
  webSearchEnabled: boolean;
};
```

The schema does not include any client-provided usage fields. Good: token accounting should come from server-side AI SDK callbacks/results, not the client.

### Main per-request chat flow

`src/lib/chat-handler.ts` does this in order:

1. `parseChatRequest(await request.json())`.
2. Resolve owner and thread.
3. Create thread when missing.
4. Validate UI messages.
5. Persist the latest user message with `chatStore.saveMessage(...)` unless regenerating.
6. Load persisted history, restore attachment bytes for Bedrock, and call `convertToModelMessages(...)`.
7. Create request-scoped agent with artifact tools and status callbacks.
8. Call:

```ts
const result = await requestAgent.stream({
  messages: modelMessages,
  timeout: { totalMs: 570_000, stepMs: 180_000 },
});
```

9. Merge `result.toUIMessageStream({ ... onFinish })` into the outgoing UI stream.
10. In `toUIMessageStream.onFinish`, persist `responseMessage` via `chatStore.saveMessage(...)` or `replaceAssistantMessageAfter(...)`.
11. Optionally call `deps.generateText(...)` to generate a thread title.

The best single request-level interception point is inside this `execute` closure around `requestAgent.stream(...)` and `result.toUIMessageStream({ onFinish })`, because it has `threadId`, triggering mode, owner, persisted user message/history, final assistant `messageId`, abort state, and persistence calls.

### Existing AI SDK usage access

`src/ai/agents/agent.ts` already receives AI SDK usage per step:

```ts
onStepFinish: ({ stepNumber, toolCalls, finishReason, usage }) => {
  console.log("[agent] step:finish", {
    event: "agent_step_finished",
    stepNumber,
    finishReason,
    tools: toolNames,
    usage: {
      input: usage.inputTokens,
      output: usage.outputTokens ?? 0,
      cacheRead: usage.inputTokenDetails?.cacheReadTokens,
      cacheWrite: usage.inputTokenDetails?.cacheWriteTokens,
      total: usage.totalTokens,
    },
  });
},
```

This is the current concrete token source. It is only logged, not returned to the chat handler and not persisted. It includes cache read/write token detail, which is important for Bedrock prompt caching cost/usage accounting.

There are two additional AI calls outside the main stream:

1. `repairInvalidToolInput` uses `generateText(...)` in `src/ai/agents/agent.ts` lines 177-213. Its result likely has usage available from AI SDK, but the code currently only reads `result.toolCalls`.
2. Title generation uses `deps.generateText(...)` in `src/lib/chat-handler.ts` lines 602-610. Its result likely has usage available, but the code only reads `titleResult.text`.

### Bedrock provider and prompt caching

`src/lib/bedrock-provider.ts` uses `createAmazonBedrock` with AWS region/credential provider.

`src/ai/agents/agent.ts` configures the model via `bedrockProvider(MODELS[0].runtimeModelId)` and supplies `providerOptions.bedrock.cachePoint` on the stable system prompt prefix. Current usage logging already captures `inputTokenDetails.cacheReadTokens` and `cacheWriteTokens`, so any persisted usage model should preserve those fields.

### Persistence points

Current chat persistence abstraction:

```ts
interface ChatStore {
  getThreadMessages(threadId: string): Promise<MyUIMessage[]>;
  saveMessage(threadId: string, message: MyUIMessage): Promise<void>;
  replaceAssistantMessageAfter(threadId, messageId, nextAssistantMessage): Promise<void>;
  ...
}
```

No usage-specific API exists.

Amplify schema currently has:

```ts
Message: a.model({
  sessionId: a.id().required(),
  position: a.integer().required(),
  role: a.string().required(),
  payloadJson: a.json().required(),
})
```

`AmplifyChatStore.saveMessage` writes the whole UI message to `payloadJson: JSON.stringify(message)`.

`LambdaDynamoDbChatStore.saveMessage` writes the whole UI message object to `payloadJson: message`.

Therefore, near-term usage persistence options are:

1. Add usage metadata into the assistant `MyUIMessage` before `saveMessage` / `replaceAssistantMessageAfter`.
2. Extend `ChatStore` with usage-specific methods and add schema/table fields or a new usage model/table.
3. Log only to CloudWatch/console by expanding existing `agent_step_finished` logs with request/message correlation.

Option 1 is fastest but couples accounting to UI message payload shape. Option 2 is cleaner for per-request/session aggregation and querying.

## Architecture

Client flow:

`ChatInterface` -> `useChat` + `DefaultChatTransport` -> Lambda Function URL (`CHAT_LAMBDA_URL`) -> Cognito bearer token in `authorization` header.

Server/Lambda flow:

`amplify/functions/chat-streaming/handler.ts` -> auth + stores -> `createChatPostHandler` -> parse/validate request -> persist user message -> convert history to AI SDK model messages -> `ToolLoopAgent.stream` -> `toUIMessageStream` -> persist assistant message -> optional title `generateText` -> streamed response back to client.

AI SDK/Bedrock flow:

`createAgent` -> `new ToolLoopAgent({ model: bedrockProvider(...), instructions, tools, prepareStep, experimental_repairToolCall, onStepFinish })` -> Bedrock provider from `@ai-sdk/amazon-bedrock` -> per-step `usage` currently exposed in `onStepFinish`.

Persistence flow:

Messages are persisted per thread/session via `ChatStore`. Production Lambda uses DynamoDB (`LambdaDynamoDbChatStore`); Next/server path uses Amplify Data (`AmplifyChatStore`) unless configured fallback. Both persist the full `MyUIMessage` in `payloadJson`. Threads/sessions store title/user/timestamps but no token aggregates.

## Start Here

Start with `src/ai/agents/agent.ts` because it is the only place currently receiving authoritative AI SDK token usage (`onStepFinish`). Then open `src/lib/chat-handler.ts` to decide how to correlate those step usage events to `threadId`, request, and final assistant `messageId`, and where to persist or emit them.

Key design decision for implementation: whether usage should be stored as message metadata in `payloadJson`, as separate per-step/per-request records, or only as correlated logs.

## Supervisor coordination

No blocking decision was needed. Important discovery: token usage is already available per AI SDK agent step in `src/ai/agents/agent.ts`, but it is only logged and lacks thread/message correlation/persistence. Engram save was requested, but no Engram/memory tool is available in this child subagent environment.
