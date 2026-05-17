Read-only investigation complete. I did **not** write `/Users/ricardoaltamirano/Developer/SecondstreamAI/attachment-readiness-ai-sdk.md` because the task also said “READ-ONLY” and “Do not edit files”; per instruction, no-edit wins over artifact-writing. Key discoveries were saved to Engram project `secondstreamai`.

## Findings

### 1. `useChat/sendMessage` file handling

Verified in:

- `node_modules/ai/src/ui/chat.ts`
- `node_modules/ai/src/ui/convert-file-list-to-file-ui-parts.ts`
- `node_modules/ai/docs/07-reference/02-ai-sdk-ui/01-use-chat.mdx`

AI SDK v6 `sendMessage` accepts:

- `{ text }`
- `{ files }`
- `{ text, files }`
- full `parts`

If `files` is a `FileList`, AI SDK converts each browser `File` to:

```ts
{
  type: "file",
  mediaType: file.type,
  filename: file.name,
  url: dataUrl
}
```

Your app currently pre-converts blob URLs to data URLs in:

- `src/components/ai-elements/prompt-input.tsx`

Then sends:

- `sendMessage(message, { body: { modelId, webSearchEnabled } })`
- from `src/components/chat-interface.tsx`

This is compatible with AI SDK v6’s `FileUIPart[]` path.

### 2. `DefaultChatTransport` request shape

Verified in:

- `node_modules/ai/src/ui/http-chat-transport.ts`
- `node_modules/ai/docs/04-ai-sdk-ui/21-transport.mdx`

Default body would be:

```ts
{
  ...body,
  id: chatId,
  messages,
  trigger,
  messageId
}
```

But your app overrides it with `prepareSendMessagesRequest`, returning:

```ts
{
  threadId,
  messages,
  trigger,
  messageId,
  modelId,
  webSearchEnabled
}
```

File parts are therefore sent inside `messages` as JSON data URLs. This is correct structurally, but risky for Lambda payload size.

### 3. UIMessage file parts and persistence

Verified in:

- `node_modules/ai/docs/07-reference/01-ai-sdk-core/31-ui-message.mdx`
- `node_modules/ai/docs/04-ai-sdk-ui/03-chatbot-message-persistence.mdx`

`FileUIPart` is:

```ts
{
  type: "file";
  mediaType: string;
  filename?: string;
  url: string; // hosted URL or Data URL
}
```

Docs recommend storing messages in `UIMessage` format, not `ModelMessage` format.

Your app does that and persists attachment refs by replacing data URLs with `s3://...` + metadata in:

- `src/lib/chat-handler.ts`
- `src/lib/storage/attachment-metadata.ts`

That persistence direction is aligned with AI SDK guidance.

### 4. `convertToModelMessages` file/image/document behavior

Verified in:

- `node_modules/ai/docs/07-reference/02-ai-sdk-ui/31-convert-to-model-messages.mdx`
- `node_modules/ai/src/ui/convert-to-model-messages.ts`
- `node_modules/ai/docs/07-reference/01-ai-sdk-core/30-model-message.mdx`

For user message file parts, AI SDK v6 maps:

```ts
UI file part -> Model file part
{
  type: "file",
  mediaType,
  filename,
  data: part.url
}
```

Important: it does **not** convert `image/*` UI parts into `type: "image"` model parts. They remain `type: "file"` with image media type. Bedrock provider later turns image media types into Bedrock image blocks.

Custom `data-*` UI parts are ignored unless `convertDataPart` is provided.

### 5. Bedrock provider attachment compatibility risks

Verified in:

- `node_modules/@ai-sdk/amazon-bedrock/docs/08-amazon-bedrock.mdx`
- `node_modules/@ai-sdk/amazon-bedrock/src/convert-to-bedrock-chat-messages.ts`
- `node_modules/@ai-sdk/amazon-bedrock/src/bedrock-api-types.ts`

Bedrock provider:

- supports file inputs only with specific models;
- rejects `FilePart.data instanceof URL` with `UnsupportedFunctionalityError("File URL data")`;
- accepts data/bytes and converts:
  - `image/*` to Bedrock image blocks;
  - other supported files to Bedrock document blocks.

Supported image MIME types in source:

- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`

Supported document MIME types in source:

- `application/pdf`
- `text/csv`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `text/html`
- `text/plain`
- `text/markdown`

Your app currently accepts:

- `text/*`
- `image/*`
- `application/pdf`

Risk: this accepts MIME types Bedrock provider will reject, for example `image/svg+xml`, `text/xml`, possibly other `text/*`.

### 6. ToolLoopAgent + Bedrock tools/streaming risks

Verified in:

- `node_modules/ai/docs/07-reference/01-ai-sdk-core/16-tool-loop-agent.mdx`
- `node_modules/ai/src/agent/tool-loop-agent.ts`
- `node_modules/@ai-sdk/amazon-bedrock/src/bedrock-prepare-tools.ts`
- `node_modules/@ai-sdk/amazon-bedrock/src/bedrock-chat-language-model.ts`

`ToolLoopAgent` is a thin wrapper over `streamText` / `generateText`.

Bedrock provider supports ConverseStream tool-use/tool-result conversion, but with caveats:

- provider-defined Anthropic `web_search_20250305` is explicitly filtered as unsupported on Bedrock;
- function tools are converted into Bedrock `toolConfig`;
- tool content is removed if no active tools are available.

Current app risk in:

- `src/lib/chat-handler.ts`

It calls:

```ts
validateUIMessages<MyUIMessage>({ messages: params.messages })
convertToModelMessages(uiMessages)
```

without passing `agent.tools`.

For a ToolLoopAgent app, safer AI SDK pattern is to validate/convert with tools, as shown by:

- `node_modules/ai/src/ui/direct-chat-transport.ts`
- `node_modules/ai/src/agent/create-agent-ui-stream.ts`

Both pass `tools: agent.tools`.

### 7. Lambda payload size risk

AWS docs confirm Lambda Function URL buffered invoke max payload is **6 MB**.

Source:

- AWS Lambda docs: `https://docs.aws.amazon.com/lambda/latest/dg/config-rs-invoke-furls.html`
- AWS Lambda Invoke API docs: `https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html`

Your current app allows:

- `MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024`
- `MAX_ATTACHMENTS_PER_REQUEST = 5`

A 4 MB binary becomes roughly 5.33 MB base64, plus `data:` prefix and JSON overhead. One max-size file can approach the 6 MB Lambda request ceiling; multiple files will exceed it before server validation/persistence runs.

## Recommended app changes before prompt/skills/tools work

1. Change transport to send only the last user message, not full `messages`, once server persistence is authoritative.
2. Reduce attachment limits for data-URL transport, or preferably upload attachments before chat send and send persisted refs.
3. Narrow accepted MIME types to Bedrock-supported list, not broad `text/*` / `image/*`.
4. Pass `agent.tools` into `validateUIMessages` and `convertToModelMessages`, or use the documented agent UI stream helper pattern.
5. Add explicit Lambda request-size client validation before `sendMessage`.
6. Keep persisted UIMessage format, but hydrate persisted refs to data URLs only immediately before model conversion.

## Recommended tests

- `prepareSendMessagesRequest` includes expected Lambda body and auth header.
- File submit converts blob URL to data URL `FileUIPart`.
- Max payload guard rejects data URL JSON bodies near/over Lambda 6 MB.
- MIME validation rejects Bedrock-unsupported `image/svg+xml` and unsupported `text/*`.
- Persisted `s3://` attachment refs hydrate to data URLs before `convertToModelMessages`.
- `convertToModelMessages` is called with `agent.tools`.
- Tool history with `loadSkill` parts validates and survives regeneration.