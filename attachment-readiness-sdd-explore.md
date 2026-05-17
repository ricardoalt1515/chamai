I couldn’t write `attachment-readiness-sdd-explore.md` because this session has no file-write tool (read/grep only).  
Below is the exact report content to save there.

---

# Attachment Readiness — SDD Explore (Read-only)

## status
`completed_with_constraints` (read-only exploration done; file write blocked by tool surface)

## executive_summary
The Lambda Function URL chat path **does support attachments end-to-end in principle** (UI files → AI SDK request body → `parseChatRequest` validation → persistence to Lambda S3 blob store → rehydrate to data URLs → `convertToModelMessages` → Bedrock model stream).  
But there are **contract mismatches and hardening gaps** that should be resolved before prompt/skills/tools expansion—especially around attachment type consistency, payload/headroom, and observability.

## artifacts
- Requested output path (not written due tool limitation):  
  `/Users/ricardoaltamirano/Developer/SecondstreamAI/attachment-readiness-sdd-explore.md`
- Evidence files inspected:
  - UI/transport: `src/components/chat-interface.tsx`, `src/components/chat-prompt-composer.tsx`, `src/components/ai-elements/prompt-input.tsx`
  - Request validation: `src/lib/chat-helpers.ts`, `src/lib/chat-helpers.test.ts`
  - Chat runtime path: `src/lib/chat-handler.ts`, `src/lib/chat-handler.test.ts`
  - Lambda adapter/auth/runtime: `amplify/functions/chat-streaming/handler.ts`, `amplify/functions/chat-streaming/runtime-adapter.ts`
  - Storage adapters: `src/lib/storage/attachment-metadata.ts`, `src/lib/storage/lambda-blob-store.ts`, `src/lib/storage/lambda-chat-store.ts`
  - Rehydration for thread load: `app/actions/messages.ts`
  - Infra/CORS: `amplify/backend.ts`
  - Deploy/log evidence snapshot: `explore-aws-logs.md`
  - OpenSpec: `openspec/config.yaml`, `openspec/changes/port-chat-streaming-to-lambda/*`

## findings

### 1) End-to-end attachment path (Lambda production path)
1. **UI selection + constraints**  
   `ChatPromptComposer` passes `accept`, `maxFiles`, `maxFileSize` from config (`text/*`, `image/*`, `application/pdf`, 5, 4MB).  
   `PromptInput` converts `blob:` URLs to `data:` before submit.
2. **AI SDK transport**  
   `useChat` + `DefaultChatTransport` posts directly to Lambda URL with `prepareChatSendMessagesRequest`, preserving `threadId/messages/trigger/messageId/modelId/webSearchEnabled` and adding bearer access token.
3. **Server parse/validation**  
   `parseChatRequest` validates model, counts total `file` parts, MIME capability, size for `data:` payloads, and PDF-with-text rule.
4. **Persistence**  
   `withAttachmentPersistence` stores `data:` attachments via blob store and rewrites to persisted `s3://...` + metadata ref.
5. **Rehydration for model**  
   `withBedrockAttachmentData` resolves persisted refs by `blobStore.get` and converts back to base64 `data:` file parts.
6. **Model conversion + Bedrock**  
   `convertToModelMessages(uiMessages)` then agent streams with Bedrock provider/model.

### 2) Accepted attachment types by layer + mismatches
- **UI accept layer**: `text/*`, `image/*`, `application/pdf` (`src/config/models.ts` used by composer)
- **`parseChatRequest` capability layer**: accepts any `text/*`, any `image/*`, exact `application/pdf`
- **Persistence gate (`isSupportedAttachmentMediaType`)**: accepts `image/*`, `application/pdf`, and **only** `text/plain` + `text/markdown`
- **Model capability registry (`MODELS[0].capabilities`)**: logical categories `text/image/pdf` (broad)

**Mismatch (important):**
- UI + parse allow `text/csv`, `text/html`, etc.
- Persistence layer rejects many of those (`Unsupported file format.`).
- This means user can attach valid-by-UI files that fail later in runtime.

### 3) Hardening needed before prompt/skills/tools

#### P0
1. **Unify attachment MIME contract across all layers** (UI accept, parse capability, persistence gate, tests).  
2. **Add explicit e2e tests on Lambda path for attachment MIME matrix** (allowed/blocked cases, error codes).  
3. **Add payload/headroom guards for Lambda Function URL path** (request-size awareness; currently 4MB/file × 5 exceeds practical HTTP/Lambda payload limits).

#### P1
1. **Attachment observability** (non-content logs/metrics): attachment count, mime class, bytes persisted, blob get/put failures, rehydration failures, first-byte latency.  
2. **Runtime resilience**: typed mapping for blob get failures to user-facing attachment-specific errors (now mostly generic chat failure).  
3. **Config externalization**: Lambda URL currently hardcoded in UI.

#### P2
1. **Attachment lifecycle/cleanup policy** (orphan cleanup on thread delete/failure paths).  
2. **Model-specific attachment capability probes/contract tests** for Bedrock provider changes over time.

### 4) Recommended next SDD slice
**Slice name:** `attachment-contract-and-lambda-hardening`

**Acceptance criteria**
1. One canonical MIME policy source consumed by UI, request validation, and persistence adapter.  
2. MIME behavior table covered by tests (e.g., `text/plain`, `text/markdown`, `text/csv`, `image/png`, `application/pdf`, `application/zip`).  
3. Lambda path has explicit request-size boundary tests and clear failure semantics for oversize payloads.  
4. Lambda logs/metrics include attachment-stage observability without sensitive content.  
5. End-to-end test proves persisted ref → rehydrate → `convertToModelMessages` path works on Lambda adapters.

**Test targets (strict TDD later)**
- `src/lib/chat-helpers.test.ts` (validation matrix)
- `src/lib/chat-handler.test.ts` (persist + rehydrate + model conversion)
- `amplify/functions/chat-streaming/handler.test.ts` (Lambda auth/cors + attachment error surfaces)
- `src/lib/storage/lambda-blob-store.test.ts` (size/type edge behavior)
- new integration-style test for “UI-like data URL payload through Lambda handler composition”

### 5) Job 18 / deploy status
I could not query live AWS from this tool surface.  
From existing repo evidence (`explore-aws-logs.md`), latest recorded deploy there is **job 16 = SUCCEED** and Lambda URL path is active/streaming. No in-repo evidence for “job 18” specifically.

## risks
- User-visible attachment failures due to MIME policy drift.
- Potential oversized request failures under Lambda URL limits despite per-file 4MB check.
- Limited observability for attachment-stage regressions.

## next_recommended
Start the SDD proposal/spec for `attachment-contract-and-lambda-hardening` with strict TDD gates, before prompt/skills/tools expansion.

## skill_resolution
`injected` (project standards were provided in task prompt)