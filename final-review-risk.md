## Review

I did **not** write `/Users/ricardoaltamirano/Developer/SecondstreamAI/final-review-risk.md` because the task also says **READ-ONLY / Do not edit files**. I treated no-edit as higher priority.

### Correct

- Production deploy for `29168d4` succeeded: Amplify job `17`, commit `29168d41...`, status `SUCCEED`.
- Lambda Function URL is deployed with `InvokeMode=RESPONSE_STREAM`, `AuthType=NONE`, Cognito bearer verification in app code, and expected CORS origins.
- Post-`29168d4` CloudWatch evidence shows one authenticated production-origin POST:
  - `auth_result success=true`
  - `handler_result status=200`
  - `stream_event completed=true`
  - Lambda metrics: `Invocations=1`, `Errors=0`, `Throttles=0`.
- Targeted tests passed:
  - `src/lib/storage/lambda-chat-store.test.ts`
  - `src/components/chat-interface.test.tsx`
  - `amplify/functions/chat-streaming/handler.test.ts`
  - `amplify/functions/chat-streaming/runtime-adapter.test.ts`
- `bunx tsc --noEmit` passed.
- Git status has only the known untracked files:
  - `docs/agent-audit-and-artifact-plan.md`
  - `explore-ai-sdk-ui-message.md`
  - `explore-aws-logs.md`
  - `explore-storage-messages.md`

---

## P0

None found from code/tests/AWS read-only checks.

---

## P1 — Must do before calling migration complete

### 1. Config/rollback is not production-grade yet

**Evidence**

- SDD design calls for config-based transport:
  - `openspec/changes/port-chat-streaming-to-lambda/design.md:245-248`
  - `NEXT_PUBLIC_CHAT_TRANSPORT=same-origin|lambda`
  - `NEXT_PUBLIC_CHAT_LAMBDA_URL=https://...`
- Current UI hardcodes the production Function URL:
  - `src/components/chat-interface.tsx:49`
  - `getChatTransportApi()` always returns that constant at `src/components/chat-interface.tsx:56`.
- Current docs say rollback requires reverting a frontend commit:
  - `docs/lambda-chat-smoke.md:60-62`

**Risk**

Rollback is no longer a safe config flip. Sandbox/prod endpoint drift also requires source edits.

**Recommended next action**

Restore the originally planned config switch before declaring complete, or explicitly document that the accepted operational rollback is “revert/deploy commit,” not config rollback.

---

### 2. DynamoDB batch operations will fail on threads with >25 messages

**Evidence**

`BatchWriteItem` is used with unbounded arrays:

- `src/lib/storage/lambda-chat-store.ts:155-178`
- `src/lib/storage/lambda-chat-store.ts:294-305`
- `src/lib/storage/lambda-chat-store.ts:332-340`

DynamoDB `BatchWriteItem` max is 25 items per request, and unprocessed items must be retried.

**Risk**

Long conversations can break delete/regenerate/replace flows. This is not theoretical for chat sessions.

**Recommended next action**

Chunk batch writes/deletes to 25 and retry `UnprocessedItems`. Add tests for 26+ messages.

---

### 3. Operational headroom is tight

**Evidence**

Post-deploy Lambda report after `29168d4`:

- `Memory Size: 128 MB`
- `Max Memory Used: 117 MB`
- Duration about `17.8s`

**Risk**

Cold starts, larger prompts, attachments, or Bedrock response variance can push memory over the limit.

**Recommended next action**

Increase Lambda memory to at least 256 MB, then measure duration/cost. Add CloudWatch alarm coverage for errors, throttles, duration p95/p99, and memory pressure if available.

---

## P2 — Follow-ups / hardening

### 4. Canary cleanup remains pending

**Evidence**

- Canary stack remains in `amplify/backend.ts:23-38`.
- Verify report says remove after real chat Lambda smoke passes:
  - `openspec/changes/port-chat-streaming-to-lambda/verify-report.md:67-71`
- Docs also say retained until accepted/rejected:
  - `docs/lambda-chat-smoke.md:64-66`

**Recommended next action**

Do not remove it until browser + persistence + attachment validation is signed off. Then delete canary stack and handler.

---

### 5. Observability is useful but below SDD target

**Evidence**

Design asks for detailed persistence stages, first-byte timing, complete timing, parse failures, etc.:

- `openspec/changes/port-chat-streaming-to-lambda/design.md:252-263`

Current handler logs only:

- request start
- auth success
- handler status
- stream completed/error

See `amplify/functions/chat-streaming/handler.ts:99-164`.

**Recommended next action**

Add timing/stage logs without message content/JWTs. Prioritize first-byte latency, assistant persistence success/failure, title update failure, and attachment operations.

---

### 6. Attachment/rollback compatibility needs explicit validation

**Evidence**

- Lambda writes attachments under `lambda-chat/attachments/...`:
  - `amplify/backend.ts:60-61`
  - `src/lib/storage/lambda-blob-store.ts`
- Existing Amplify blob path uses `private/<identityId>/sessions/...`:
  - `src/lib/storage/amplify-blob-store.ts:10-12`
- SDD design already flags rollback users/data:
  - `openspec/changes/port-chat-streaming-to-lambda/design.md:283`

**Recommended next action**

Before final acceptance, test attachment upload, reload, continued conversation, and rollback behavior for Lambda-created attachment threads.

---

### 7. Function URL direct is acceptable for now, but governance remains a later decision

**Evidence**

- Function URL is `AuthType=NONE`; app-layer Cognito verification is implemented.
- SDD explicitly says API Gateway REST/other governance is later:
  - `openspec/changes/port-chat-streaming-to-lambda/design.md:285-287`

**Recommended next action**

Do not change this now. After migration acceptance, decide whether direct Function URL remains enough or whether WAF/custom domain/API governance is needed.

---

## What should NOT be touched right now

- Do **not** change the AI SDK v6 payload shape or `DefaultChatTransport` protocol.
- Do **not** rewrite AI Elements UI rendering as part of migration closure.
- Do **not** remove `/api/chat`; it remains the rollback path.
- Do **not** commit the known untracked audit/explore files unless explicitly requested.
- Do **not** remove the streaming canary until end-to-end browser + persistence validation is accepted.