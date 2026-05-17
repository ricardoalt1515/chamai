# Code Context

## Files Retrieved

1. `src/components/chat-interface.tsx` (lines 49-88, 158-164, 276-304) - Lambda transport URL/header preparation and attachment rendering.
2. `src/components/chat-prompt-composer.tsx` (lines 44-56, 99-110, 161-202) - UI validation messages, PDF instruction hint, submit payload defaults, attachment limits wiring.
3. `src/components/ai-elements/prompt-input.tsx` (lines 75-88, 519-612, 772-808) - browser file selection validation and blob URL to data URL conversion before send.
4. `src/config/models.ts` (lines 5-8, 24-32, 59-70) - attachment size/count/MIME families and current model attachment capabilities.
5. `src/lib/chat-helpers.ts` (lines 13-21, 60-189) - `parseChatRequest` validation for model, attachment count, MIME/capability, PDF text rule, persisted refs, size.
6. `src/lib/chat-handler.ts` (lines 79-193, 202-287) - persistence of incoming data URL attachments, rehydration from `BlobStore` for Bedrock/model messages, stream setup.
7. `src/lib/storage/attachment-metadata.ts` (lines 1-85) - persisted attachment metadata shape and supported server MIME check.
8. `src/lib/storage/lambda-blob-store.ts` (lines 75-96, 101-170) - Lambda S3 key shape and put/get/delete implementation.
9. `src/lib/storage/amplify-blob-store.ts` (lines 10-52) - same-origin Amplify private storage key shape and signed download flow.
10. `amplify/functions/chat-streaming/handler.ts` (lines 99-164) - Lambda Function URL CORS/auth/store/blob adapter wiring into shared chat handler.
11. `src/lib/chat-handler-next.ts` (lines 10-38) - same-origin `/api/chat` adapter selection and rollback path.
12. `app/actions/messages.ts` (lines 14-52), `app/c/[threadId]/page.tsx` (lines 5-13) - reload/hydration path for persisted file parts.
13. `src/ai/agents/agent.ts` (lines 9-15), `src/types/ui-message.ts` (lines 10-39) - active agent/tool type mismatch relevant before prompt/skills/tools work.
14. `src/lib/storage/lambda-chat-store.ts` (lines 159-177, 205-218, 325-342) - DynamoDB batch retry exists, but pagination/idempotency/long-thread behavior remains foundation risk.
15. `amplify/backend.ts` (lines 56-95) - Lambda env, DynamoDB/S3 permissions, Lambda attachment prefix.
16. `docs/lambda-chat-smoke.md` (lines 46-66) - current smoke checklist explicitly leaves attachments separately validated and rollback as source revert.

## Key Code

### Does the current agent accept attachments?

**Yes, through the chat pipeline, with important caveats.** The UI accepts files, sends them as AI SDK file parts with data URLs, the server persists them to a `BlobStore`, replaces stored message parts with metadata refs, then re-downloads stored bytes and converts them back to data URLs before `convertToModelMessages()` and `deps.agent.stream()`.

Critical flow:

```ts
// UI transport preserves full messages + modelId + webSearchEnabled.
// src/components/chat-interface.tsx:74-87
const preparedBody = { threadId, messages, trigger, messageId, modelId, webSearchEnabled };
headers: { authorization: `Bearer ${token}` }
```

```ts
// Browser converts object URLs to data URLs before submit.
// src/components/ai-elements/prompt-input.tsx:790-808
const convertedFiles = await Promise.all(files.map(async item =>
  item.url?.startsWith("blob:") ? { ...item, url: dataUrl } : item
));
```

```ts
// Persist incoming data URL attachment refs.
// src/lib/chat-handler.ts:101-119
const bytes = decodeDataUrl(part.url);
const saved = await params.blobStore.put({ bytes, filename, mediaType, threadId });
nextParts.push(attachmentRefToPersistedPart(metadata));
```

```ts
// Rehydrate persisted refs to data URLs for model invocation.
// src/lib/chat-handler.ts:184-190
const bytes = await blobStore.get(metadata.s3Key);
parts.push({ type: "file", mediaType, filename, url: `data:${mediaType};base64,...` });
```

The active model declares text/image/pdf capability: `src/config/models.ts:24-32`. The active agent is `ToolLoopAgent` on Bedrock with only `loadSkill` wired: `src/ai/agents/agent.ts:9-15`.

### Enforced limits/rules

- Max attachment bytes: `4 * 1024 * 1024`; max files: `5` (`src/config/models.ts:5-8`).
- UI accepts `text/*`, `image/*`, `application/pdf` and enforces max size/count (`src/components/chat-prompt-composer.tsx:193-198`; `prompt-input.tsx:519-612`).
- `parseChatRequest` rejects too many files, unsupported capability, PDF without same-message text, non-data URLs without persisted metadata, and oversized data URL payloads (`src/lib/chat-helpers.ts:87-189`).
- Server persistence re-checks MIME via `isSupportedAttachmentMediaType` (`src/lib/chat-handler.ts:94-99`).

### Lambda vs same-origin behavior

- **Current browser transport is hardcoded to Lambda**, not same-origin: `CHAT_LAMBDA_URL` and `getChatTransportApi()` always return the production Function URL (`src/components/chat-interface.tsx:49-56`). It always fetches a Cognito access token and adds `Authorization` (`lines 58-87`).
- **Same-origin `/api/chat` still exists** and uses either Amplify private storage or S3 fallback based on `CHAT_BLOB_STORE_RUNTIME` (`src/lib/chat-handler-next.ts:15-27`).
- **Lambda path** verifies origin/auth then injects `LambdaDynamoDbChatStore` and `LambdaS3BlobStore` (`amplify/functions/chat-streaming/handler.ts:142-160`). Lambda attachments are written under `lambda-chat/attachments/users/{userId}/threads/{threadId}/...` (`src/lib/storage/lambda-blob-store.ts:88-96`; `amplify/backend.ts:60-61, 90-95`).
- **Same-origin Amplify path** writes `private/{identityId}/sessions/{threadId}/...` (`src/lib/storage/amplify-blob-store.ts:10-17`).

### Persistence/reload

- Stored messages contain persisted `file` parts with `url: s3://<key>` plus metadata (`src/lib/storage/attachment-metadata.ts:60-69`).
- Reload uses `getThreadMessages()` server action, checks ownership, and converts persisted refs back to file parts using `metadata.url` (`app/actions/messages.ts:14-52`; page passes them to `ChatInterface`, `app/c/[threadId]/page.tsx:5-13`).
- Model replay uses stored metadata key to download bytes before each invocation (`src/lib/chat-handler.ts:148-190`).

## Architecture

```text
Browser composer
  -> validates file count/size/accept and stores blob: preview URLs
  -> on submit converts blob: to data:<mime>;base64,...
  -> useChat DefaultChatTransport sends full AI SDK messages

Lambda Function URL (current default)
  -> CORS/origin check + Cognito access-token verification
  -> createChatPostHandler({ LambdaDynamoDbChatStore, LambdaS3BlobStore, agent })

Shared chat handler
  -> parseChatRequest validates attachment contract
  -> validateUIMessages
  -> persist user message; data URL attachments become BlobStore objects + metadata refs
  -> load full history; persisted refs become data URLs again
  -> convertToModelMessages(uiMessages)
  -> ToolLoopAgent.stream(messages)
  -> persist assistant response on finish
```

Same-origin `/api/chat` reuses the same shared handler but swaps auth/store/blob adapters to Next/Amplify cookies + Amplify Data/Storage or fallback S3.

## Prioritized findings

### P0 — Fix before improving agent prompt/skills/tools

1. **Attachment object-read authorization is under-validated in Lambda.** `parseChatRequest` accepts any non-data file part with metadata `{version:1,s3Key,sizeBytes}` (`src/lib/chat-helpers.ts:161-177`). `LambdaS3BlobStore.get(key)` reads the supplied key with the Lambda role and does not enforce `users/{owner.userId}/threads/...` ownership (`src/lib/storage/lambda-blob-store.ts:130-138`). Because IAM allows the whole `lambda-chat/attachments/*` prefix (`amplify/backend.ts:90-95`), a crafted request that knows another key could attempt cross-user object reads. Recommendation: validate persisted attachment refs against current owner/thread before `blobStore.get`, or make `BlobStore.get` owner-scoped for Lambda.

2. **Attachment rollback/mixed-mode behavior is not solid.** Lambda writes `lambda-chat/attachments/users/...`; same-origin Amplify storage expects `private/{identityId}/sessions/...`. Docs explicitly say attachment behavior is separately validated and rollback requires reverting source (`docs/lambda-chat-smoke.md:46-62`). Recommendation: decide whether rollback must continue Lambda-created attachment threads. If yes, add mixed-key read support or a migration/scoping rule before agent work.

3. **UI/server MIME contracts disagree for text.** UI and parser allow all `text/*` (`src/config/models.ts:8`; `src/lib/chat-helpers.ts:145-151`), but `isSupportedAttachmentMediaType` only accepts `text/plain` and `text/markdown` plus images/pdf (`src/lib/storage/attachment-metadata.ts:20-31`). That can make `text/csv` pass UI/parse and fail later during persistence, outside the parse error handling path. Recommendation: centralize one MIME predicate and make parse/UI/server identical.

4. **Persisted/reloaded preview URLs are likely brittle.** Reload converts metadata back to a file part using `metadata.url` (`app/actions/messages.ts:44-45`). For Amplify, that URL was produced at upload time via `getUrl` and may expire (`src/lib/storage/amplify-blob-store.ts:19-32`). For Lambda, `buildS3ObjectUrl` is a plain S3 URL (`src/lib/storage/lambda-blob-store.ts:123-127`), likely not browser-readable for private buckets. Recommendation: on reload, generate fresh signed/readable URLs for display or treat attachments as non-previewable metadata only.

### P1 — Foundation backlog from Lambda streaming work

5. **Config/rollback is not production-grade.** The UI hardcodes the production Function URL (`src/components/chat-interface.tsx:49-56`), while the smoke doc says sandbox validation requires editing source and rollback means reverting a frontend commit (`docs/lambda-chat-smoke.md:48-62`). Recommendation: restore a config switch (`same-origin|lambda`, URL env) before further agent changes.

6. **Attachment E2E smoke is still unproven.** Code path exists, but docs explicitly separate attachment validation (`docs/lambda-chat-smoke.md:54-58`). Recommendation: run browser and curl tests for image, text, pdf-with-instruction, reload, continue conversation, regenerate, and rollback/mixed-mode.

7. **DynamoDB persistence still needs hardening.** Batch retry/chunk helper exists (`src/lib/storage/lambda-chat-store.ts:159-177`), but remaining risks include query pagination, concurrent sends/position races, retry/idempotency semantics, and long-thread regenerate/delete behavior. Recommendation: finish storage hardening before agent behavior improvements so agent outputs are not debugging persistence noise.

8. **Operational headroom/observability are thin.** Lambda handler logs request/auth/status/completion (`amplify/functions/chat-streaming/handler.ts:99-164`), but not attachment put/get, persistence stage timings, first-byte timing, or title update failures. Recommendation: add non-content structured logs and alarms before making the agent more capable.

9. **AI SDK message/tool typing is stale.** Active agent exposes only `loadSkill` (`src/ai/agents/agent.ts:9-15`), but `MyUIMessage` declares `webSearch` and `updateWorkingMemory` tools (`src/types/ui-message.ts:24-38`) and UI renders those, not `loadSkill`. Recommendation: align `MyUIMessage` with the real agent (`InferAgentUIMessage<typeof agent>` or equivalent) before prompt/skills/tools work.

10. **`webSearchEnabled` is payload-only.** Composer forces `webSearchEnabled: false` (`src/components/chat-prompt-composer.tsx:161-168`), transport/parser carry it, but the active agent has no web-search tool. Recommendation: remove/defer or wire it deliberately after the base is stable.

## Recommended order

1. Lock attachment security/contract: owner-scoped persisted refs, single MIME predicate, parse/persistence error handling.
2. Validate and fix attachment reload/preview and Lambda/same-origin mixed-mode behavior.
3. Restore configurable chat transport/rollback and document the operational path.
4. Run attachment smoke matrix on Lambda and same-origin rollback.
5. Harden persistence/observability: pagination/idempotency/races, stage timing logs, alarms, Lambda memory if still near limit.
6. Align `MyUIMessage`/tool rendering with the actual agent.
7. Only then improve agent prompt, skills, and tools.

## Start Here

Open `src/lib/chat-handler.ts` first. It is the shared choke point where validated UI messages become persisted attachment refs and then Bedrock/model file parts. The next most important files are `src/lib/chat-helpers.ts` for request contract and `src/lib/storage/lambda-blob-store.ts` for Lambda object ownership enforcement.

## Supervisor coordination

No supervisor decision was needed. Memory tools were not available in this session, so no Engram save was performed.
