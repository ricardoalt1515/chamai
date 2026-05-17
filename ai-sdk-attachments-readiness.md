I did **not** write `/Users/ricardoaltamirano/Developer/SecondstreamAI/ai-sdk-attachments-readiness.md` because the task also said **Do not edit**. Findings below.

## AI SDK v6 attachment readiness

### Verdict

Attachments are supported in the current AI SDK v6 chat path, and the project is mostly wired correctly:

- `useChat().sendMessage()` supports `files?: FileList | FileUIPart[]`.
- `FileList` is converted by AI SDK into `FileUIPart` data URLs.
- This project’s custom prompt input also converts `blob:` preview URLs into data URLs before submit.
- Server path persists incoming data URL attachments to S3, stores persisted metadata, rehydrates persisted refs back into data URLs, then calls `await convertToModelMessages(uiMessages)`.
- `convertToModelMessages` maps UI `file` parts into model `file` parts with:
  - `type: "file"`
  - `mediaType`
  - `filename`
  - `data: part.url`
- Bedrock provider source then converts file bytes into Bedrock image/document content.

So: **yes, attachments can reach the model**, assuming request size and model/provider compatibility hold.

## Supported types and project limits

Project config:

- Max files/request: `5`
- Max attachment bytes/file: `4 * 1024 * 1024` = **4 MiB**
- UI advertised types:
  - `text/*`
  - `image/*`
  - `application/pdf`

Important narrowing:

- `src/config/models.ts` accepts `text/*`.
- `src/lib/storage/attachment-metadata.ts` storage support only accepts:
  - `image/*`
  - `application/pdf`
  - `text/plain`
  - `text/markdown`

So generic `text/csv`, `text/html`, etc. may pass early capability normalization but fail persistence as “Unsupported file format.”

## PDFs require text

Yes. The project requires a same-message text instruction for PDFs:

- Client disables submit when a PDF is attached and prompt text is empty.
- Server rejects PDF-only messages with `DOCUMENT_TEXT_REQUIRED`.

This is good. Keep it.

## Lambda Function URL caveats

The Lambda Function URL adapter appears compatible with JSON chat requests:

- Preserves request body bytes.
- Handles base64-encoded Lambda events.
- CORS allows `authorization` and `content-type`.
- Client sends bearer token via `prepareSendMessagesRequest`.

Main risk: **payload size**.

AWS Lambda Function URL request payload remains constrained by Lambda invocation payload limits. AI SDK/client sends data URL attachments inline in JSON for the current message. Base64 adds ~33% overhead, plus JSON/message history overhead.

Current app limit of **5 × 4 MiB** can exceed Lambda’s practical request limit. Under Lambda Function URL transport, the aggregate payload limit should be lower than the theoretical per-file limits.

Recommendation: validate and likely enforce an aggregate request body limit, not just per-file size.

## Bedrock/model compatibility caveats

The Bedrock provider docs say file inputs are supported only with specific models. Source confirms Bedrock handling:

- `image/*` becomes Bedrock `image` content.
- Other file parts become Bedrock `document` content.
- URL file data is unsupported by Bedrock provider at conversion time, but this project rehydrates persisted files into data URLs/bytes before model conversion, so that path is okay.

Caveat: project model IDs look suspicious/currentness-sensitive:

```ts
runtimeModelId: "us.anthropic.claude-sonnet-4-6"
```

Before prompt/skills/tools work, validate that this exact Bedrock model ID exists and supports:
- image input
- PDF/document input
- text files as document input
- tool use together with document/image input
- streaming with documents

## What to validate before prompt/skills/tools work

Run end-to-end tests against deployed Lambda + real Bedrock model:

1. Small PNG reaches model and is described correctly.
2. Small `text/plain` reaches model.
3. Small `text/markdown` reaches model.
4. PDF with instruction succeeds.
5. PDF without instruction is rejected client/server.
6. Unsupported type is rejected consistently.
7. `text/csv` behavior is clarified: either support it in storage or reject it in UI/server.
8. Oversize single file is rejected.
9. Aggregate payload near Lambda limit is rejected before transport failure.
10. 5 small files succeeds if within aggregate limit.
11. Persisted conversation with prior attachments can be continued without resending giant data URLs from client.
12. Regenerate path rehydrates persisted attachments correctly.
13. Bedrock selected model supports file + tools together.
14. Lambda CORS/auth behavior works from production origin.
15. Error responses expose `x-error-code` to browser as expected.

## Bottom line

The AI SDK v6 mechanics are correct: `useChat` → `FileUIPart` → `convertToModelMessages` → Bedrock file/document parts.

The readiness blockers are not AI SDK API shape; they are:

1. Lambda aggregate request payload size.
2. Exact Bedrock model/file capability.
3. MIME-policy mismatch for `text/*` vs only `text/plain`/`text/markdown`.
4. End-to-end deployed validation before investing in prompt/skills/tools behavior.