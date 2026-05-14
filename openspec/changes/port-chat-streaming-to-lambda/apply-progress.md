# Apply Progress — port-chat-streaming-to-lambda

## Workload / PR Boundary

- Delivery path: stacked-to-main / chained PR mode, per `tasks.md` high workload forecast.
- Current slice: **PR 5 — Handler Composition, IAM/Env Wiring, Frontend Transport Switch, Observability, Smoke Docs**.
- Completed previous slices: PR1 Lambda Runtime Adapter & Infrastructure; PR2 Cognito Access-Token Owner Adapter; PR3 Portable ChatStore Adapter; PR4 Role-Backed S3 BlobStore Adapter.
- Existing streaming canary stack remains intentionally retained as a synthetic diagnostic endpoint; cleanup is documented and deferred until the real Lambda chat path is accepted or rejected.

## Completed Tasks

### PR5 — Handler Composition, IAM/Env Wiring, Frontend Transport Switch, Observability, Smoke Docs

- Composed the Lambda chat handler with the existing `createChatPostHandler` seam rather than `chatPost()`/Next-cookie defaults.
- Wired request-scoped Cognito access-token owner resolution with `createCognitoAccessTokenVerifier` and `createLambdaOwnerResolver`.
- Wired Lambda DynamoDB `ChatStore` and Lambda S3 `BlobStore` factories from environment.
- Preserved progressive `Response.body` → Lambda `responseStream` piping from PR1.
- Added structured JSON logging/correlation IDs via `amplify/functions/chat-streaming/observability.ts` without logging message content, tokens, or JWT claims.
- Added frontend transport switch:
  - default/safe rollback remains `/api/chat`;
  - Lambda mode uses `NEXT_PUBLIC_CHAT_TRANSPORT=lambda` and `NEXT_PUBLIC_CHAT_LAMBDA_URL`;
  - Lambda mode fetches a Cognito access token via Amplify Auth immediately before sending and injects `Authorization: Bearer <token>`;
  - AI SDK request body shape remains compatible with `parseChatRequest`.
- Added CDK env/IAM wiring for the chat Lambda:
  - Cognito user pool/client IDs;
  - DynamoDB Session/Message table and GSI env vars;
  - S3 bucket/prefix env vars;
  - DynamoDB table/index permissions;
  - S3 object permissions scoped to `lambda-chat/attachments/*`;
  - Bedrock invoke/converse permissions scoped to Bedrock inference-profile/foundation-model ARN patterns.
- Added `docs/lambda-chat-smoke.md` with curl/browser validation and config-only rollback instructions.
- Canary cleanup/retention decision: retained the synthetic `streaming-canary` Function URL for diagnostics during Lambda chat validation; docs state it should be removed after chat Lambda acceptance/rejection.

### PR4 — Role-Backed S3 BlobStore Adapter

- Added `createLambdaS3BlobStore` preserving the existing `BlobStore` interface while closing over the Lambda request `OwnerContext`.
- Added `createLambdaS3BlobStoreFromEnv` using AWS SDK v3 `S3Client` and the default Lambda role credential chain; no static AWS credentials are required or accepted by this adapter.
- Added direct dependency `@aws-sdk/client-s3`.
- Implemented S3 `PutObject`, `GetObject`, and `DeleteObject` operations with a mocked-client unit test surface.
- Implemented Lambda blob key helper with user/thread scoping:
  - `<prefix>/users/<userId>/threads/<threadId>/<uuid>-<safe-filename>`
- Sanitized prefix, owner, thread, generated id, and filename path segments.
- Rejected empty blob writes at the `BlobStore` boundary.
- Did not modify the existing `AmplifyBlobStore`/Next path or the custom signed fallback `S3BlobStore`.
- Did not wire real chat execution into the Lambda handler; POST remains dependency-pending until PR5 composes auth/store/blob and transport safely.

### PR3 — Portable ChatStore Adapter

- Completed official-docs-first decision gate and recorded `openspec/changes/port-chat-streaming-to-lambda/chat-store-decision.md`.
- Chose a narrow direct DynamoDB adapter for Lambda because the current Amplify Data model auth rules are owner/user-pool based; raw AppSync SigV4/IAM does not satisfy those rules without expanding scope into data authorization/schema/function-resource changes.
- Added `createLambdaDynamoDbChatStore` preserving the existing `ChatStore` interface.
- Added `createLambdaDynamoDbChatStoreFromEnv` requiring explicit table/index environment variables:
  - `LAMBDA_CHAT_SESSION_TABLE_NAME`
  - `LAMBDA_CHAT_MESSAGE_TABLE_NAME`
  - `LAMBDA_CHAT_SESSION_USER_ID_INDEX_NAME`
  - `LAMBDA_CHAT_MESSAGE_SESSION_ID_INDEX_NAME`
- Added AWS SDK v3 dependencies for official role-backed DynamoDB access: `@aws-sdk/client-dynamodb` and `@aws-sdk/util-dynamodb`.
- Added contract-style unit tests with a mocked DynamoDB `send(...)` client for create/read/list/delete, message ordering, regenerate-safe assistant replacement, clone semantics, cross-user list isolation, and configured index usage.
- Did not wire real chat execution into the Lambda handler; POST remains dependency-pending until PR4 BlobStore exists and the handler is safely composed.

### PR2 — Cognito Access-Token Owner Adapter

- Added Lambda-specific owner adapter utilities:
  - `parseBearerToken` for strict `Authorization: Bearer <token>` extraction.
  - `createCognitoAccessTokenVerifier` factory using `aws-jwt-verify` `CognitoJwtVerifier.create` with `tokenUse: "access"`.
  - `ownerFromAuthorizationHeader` mapping verified access-token `sub` to `{ userId: sub, identityId: sub }`.
  - `createLambdaOwnerResolver` request-bound `getOwner` adapter factory for later handler wiring.
- Added auth failure handling that maps missing/malformed bearer headers, verifier failures, wrong token_use, missing sub, and empty sub to `AuthRequiredError` without exposing token or JWT claim details.
- Confirmed unexpected scopes are ignored by owner mapping; authorization semantics remain issuer/client/token-use/sub based.
- Did not wire real chat execution into the Lambda handler; POST remains dependency-pending until PR3/PR4 adapters exist.

### PR1 — Lambda Runtime Adapter & Infrastructure

- Added Lambda Function URL runtime adapter utilities for PR1:
  - Function URL event → web `Request` conversion.
  - Base64 and plain body decoding.
  - JSON body validation for `application/json` requests.
  - Unsupported method rejection.
  - CORS preflight response builder with restricted allowed origins.
  - Web `Response.body` → Lambda `responseStream` progressive reader loop.
  - Lambda response metadata decoration hook for status and headers.
- Added Lambda chat streaming handler shell:
  - Uses `awslambda.streamifyResponse`.
  - Handles `OPTIONS`, unsupported methods, malformed requests, and a temporary `501` response documenting that PR2–PR4 dependencies are pending.
  - Does not call `chatPost()` or wire Next-cookie defaults.
- Added Amplify/CDK infrastructure for chat streaming Function URL:
  - Custom stack `chat-streaming`.
  - `NodejsFunction` with Node 22 runtime and 60s timeout.
  - Function URL with `InvokeMode.RESPONSE_STREAM` and `FunctionUrlAuthType.NONE`.
  - Restrictive CORS allowlist placeholder for production Amplify origin and localhost.
  - CloudFormation output `ChatStreamingFunctionUrl`.
- Preserved existing `streaming-canary` Function URL stack.
- Added direct dependency `aws-jwt-verify` for later PR2 auth adapter usage.

## Files Changed

- `amplify/functions/chat-streaming/runtime-adapter.ts` — new runtime adapter utilities.
- `amplify/functions/chat-streaming/runtime-adapter.test.ts` — new strict TDD unit coverage.
- `amplify/functions/chat-streaming/handler.ts` — new Lambda handler shell.
- `amplify/backend.ts` — added chat streaming Function URL stack while preserving canary.
- `amplify/backend.test.ts` — added infrastructure assertions for chat streaming stack and URL config.
- `package.json` — added `aws-jwt-verify` dependency.
- `bun.lock` — dependency lockfile update.
- `openspec/changes/port-chat-streaming-to-lambda/apply-progress.md` — this cumulative progress file.
- `src/lib/auth/lambda-owner.ts` — new Lambda Cognito access-token owner adapter.
- `src/lib/auth/lambda-owner.test.ts` — new strict TDD unit coverage for PR2.
- `src/lib/storage/lambda-chat-store.ts` — new Lambda direct DynamoDB `ChatStore` adapter.
- `src/lib/storage/lambda-chat-store.test.ts` — new strict TDD/contract-style unit coverage for PR3.
- `openspec/changes/port-chat-streaming-to-lambda/chat-store-decision.md` — AppSync/IAM vs DynamoDB decision record.
- `src/lib/storage/lambda-blob-store.ts` — new Lambda role-backed S3 `BlobStore` adapter.
- `src/lib/storage/lambda-blob-store.test.ts` — new strict TDD unit coverage for PR4.
- `amplify/functions/chat-streaming/handler.test.ts` — PR5 handler composition tests.
- `amplify/functions/chat-streaming/observability.ts` — PR5 structured logging/correlation helpers.
- `src/components/chat-interface.tsx` — PR5 transport switch and access-token header injection.
- `src/components/chat-interface.test.tsx` — PR5 transport/payload tests.
- `docs/lambda-chat-smoke.md` — PR5 smoke validation and rollback guide.

## TDD Cycle Evidence

| Task                                | Test File                                                  | Layer     | Safety Net                                                          | RED                                                                                                                                         | GREEN                                                                                                                        | TRIANGULATE                                                                                                                                             | REFACTOR                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------- | --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Runtime adapter utilities           | `amplify/functions/chat-streaming/runtime-adapter.test.ts` | Unit      | N/A (new)                                                           | ✅ Wrote tests first; initial run failed because `./runtime-adapter` did not exist                                                          | ✅ `bun run test amplify/functions/chat-streaming/runtime-adapter.test.ts` passed 9/9                                        | ✅ Covered plain body, base64 body, malformed JSON, method rejection, CORS allow/deny, streaming chunks, null-body fallback, stream error close         | ✅ Extracted CORS/header helpers and response metadata decoration hook; tests stayed green                             |
| Backend Function URL infrastructure | `amplify/backend.test.ts`                                  | Unit      | ✅ `bun run test amplify/backend.test.ts` passed 2/2 before editing | ✅ Added expectations for `chat-streaming` stack and Function URL config; test failed before backend implementation                         | ✅ `bun run test amplify/backend.test.ts amplify/functions/chat-streaming/runtime-adapter.test.ts` passed 11/11              | ✅ Test now distinguishes existing canary stack from new chat streaming stack and verifies CORS/timeout/output                                          | ✅ Kept CDK config inline to avoid premature shallow infrastructure module                                             |
| Handler shell                       | Covered through runtime adapter tests and typecheck        | Unit/type | N/A (new)                                                           | ✅ Handler depended on adapter behavior specified by runtime tests                                                                          | ✅ `bunx tsc --noEmit` passed after handler implementation                                                                   | ✅ Handler covers OPTIONS, unsupported methods, malformed requests, and dependency-pending POST path                                                    | ✅ Delegates to adapter functions; no inline stream piping logic                                                       |
| Cognito access-token owner adapter  | `src/lib/auth/lambda-owner.test.ts`                        | Unit      | N/A (new)                                                           | ✅ Wrote tests first; initial run failed because `./lambda-owner` did not exist                                                             | ✅ `bun run test src/lib/auth/lambda-owner.test.ts` passed 10/10                                                             | ✅ Covered missing/malformed headers, verifier failures, wrong token_use, missing/empty sub, unexpected scope, verifier factory, request-bound resolver | ✅ Extracted bearer parsing, verifier factory, claim mapping, and request-bound resolver helpers; formatted with Biome |
| Lambda DynamoDB ChatStore adapter   | `src/lib/storage/lambda-chat-store.test.ts`                | Unit      | Existing `ChatStore` semantics                                      | ✅ Wrote tests first; initial run failed because `./lambda-chat-store` did not exist                                                        | ✅ `bun run test src/lib/storage/lambda-chat-store.test.ts` passed 7/7                                                       | ✅ Covered cross-user list isolation, regenerate truncation/order preservation, clone up to message id, and explicit configured index usage             | ✅ Extracted env factory, row parsing, message listing, batch write helpers; formatted with Biome                      |
| Lambda S3 BlobStore adapter         | `src/lib/storage/lambda-blob-store.test.ts`                | Unit      | Existing `BlobStore` interface                                      | ✅ Wrote tests first; initial run failed because `./lambda-blob-store` did not exist                                                        | ✅ `bun run test src/lib/storage/lambda-blob-store.test.ts` passed 7/7                                                       | ✅ Covered user/thread key scope, get/delete, unsafe path sanitization, empty-byte rejection, owner scoping, and env factory                            | ✅ Extracted key creation, env factory, body conversion helper; formatted with Biome                                   |
| Lambda handler composition          | `amplify/functions/chat-streaming/handler.test.ts`         | Unit      | PR1 runtime adapter; PR2–PR4 adapter factories                      | ✅ Added composition tests; initial run failed because old handler returned dependency-pending and test import lacked Lambda runtime global | ✅ Handler composes verifier, owner resolver, ChatStore, BlobStore, existing agent/generateText, and `createChatPostHandler` | ✅ Added configuration-error path before chat execution                                                                                                 | ✅ Kept request/runtime logic delegated to adapter helpers and moved safe logs to observability module                 |
| Frontend transport switch           | `src/components/chat-interface.test.tsx`                   | Unit      | Existing request payload tests                                      | ✅ Added lambda-mode tests; initial run failed because transport helper/header injection did not exist                                      | ✅ Same-origin default and Lambda access-token header tests pass                                                             | ✅ Existing submit/regenerate payload contract tests updated to await async prepare without payload drift                                               | ✅ Extracted `getChatTransportApi`, token retrieval helper, and mode detection while preserving component shape        |
| Backend IAM/env wiring              | `amplify/backend.test.ts`                                  | Unit      | Existing Function URL infrastructure assertions                     | ✅ Added env/IAM expectations; initial run failed because backend lacked env and policies                                                   | ✅ Backend tests pass with Cognito, table/index, bucket env vars and DynamoDB/S3/Bedrock policy assertions                   | ✅ Policy tests cover least-privilege resource categories instead of only URL config                                                                    | ✅ Kept CDK inline; no premature infrastructure module                                                                 |

## Test Commands Run

- `bun run test amplify/backend.test.ts` — baseline before editing: ✅ 2 tests passed.
- `bun run test amplify/functions/chat-streaming/runtime-adapter.test.ts` — RED: ❌ failed because `./runtime-adapter` did not exist.
- `bun run test amplify/functions/chat-streaming/runtime-adapter.test.ts` — GREEN after implementation: ✅ 9 tests passed.
- `bun run test amplify/backend.test.ts` — RED after adding expectations: ❌ failed because `chat-streaming` stack was not implemented.
- `bun run test amplify/backend.test.ts amplify/functions/chat-streaming/runtime-adapter.test.ts` — GREEN after infra implementation: ✅ 11 tests passed.
- `bunx tsc --noEmit` — ✅ passed.
- `bun run test` — ✅ 27 files passed, 102 tests passed.
- `bun run check` — ⚠️ failed only on known/pre-existing lint/format issues outside this PR1 scope after new-file formatting was fixed:
  - `app/login/page.tsx` static `id="main-content"`.
  - `app/shell.tsx` static `id="main-content"`.
  - `src/ai/tools/load-skill.ts` formatting.
  - `src/components/ai-elements/suggestion.tsx` import/format.
  - `src/components/chat-interface.tsx` import order.
  - `src/components/ui/scroll-area.tsx` formatting.
- `PATH="$HOME/.local/share/nvm/v22.22.2/bin:$PATH" npx ampx sandbox --once` — ✅ deployed updated chat streaming Lambda in sandbox.
- `curl -i -s -N --no-buffer https://i2bquluu4ttmvzpuxva665dlye0tnunw.lambda-url.us-east-1.on.aws/ -H 'content-type: application/json' --data '{"test":true}'` — ✅ returned real `HTTP/1.1 501 Not Implemented` with `x-error-code: CHAT_LAMBDA_DEPENDENCIES_PENDING` and no Lambda metadata prelude in body after stream metadata fix.
- `curl -i -s -X OPTIONS ... -H 'Origin: http://localhost:3000'` — ✅ CORS preflight returns allowed origin/method/header response from Function URL.
- `bun run test src/lib/auth/lambda-owner.test.ts` — RED: ❌ failed because `./lambda-owner` did not exist.
- `bun run test src/lib/auth/lambda-owner.test.ts` — GREEN after implementation: ✅ 10 tests passed.
- `bun run test src/lib/auth/lambda-owner.test.ts src/lib/auth/errors.test.ts` — ✅ 12 tests passed.
- `bunx tsc --noEmit` — ✅ passed after PR2 implementation.
- `bunx biome check --write src/lib/auth/lambda-owner.ts src/lib/auth/lambda-owner.test.ts` — ✅ fixed new-file formatting/import order only.
- `bun run check` — ⚠️ still fails only on known/pre-existing lint/format issues outside PR2 scope:
  - `app/login/page.tsx` static `id="main-content"`.
  - `app/shell.tsx` static `id="main-content"`.
  - `src/ai/tools/load-skill.ts` formatting.
  - `src/components/ai-elements/suggestion.tsx` import/format.
  - `src/components/chat-interface.tsx` import order.
  - `src/components/ui/scroll-area.tsx` formatting.
- `bun run test src/lib/storage/lambda-chat-store.test.ts` — RED: ❌ failed because `./lambda-chat-store` did not exist.
- `bun run test src/lib/storage/lambda-chat-store.test.ts` — GREEN after implementation: ✅ 7 tests passed.
- `bunx tsc --noEmit` — ❌ initially failed on `process.env` typing for PR3 env factory.
- `bun run test src/lib/storage/lambda-chat-store.test.ts && bunx tsc --noEmit` — ✅ passed after env typing fix.
- `bun run test src/lib/storage/lambda-chat-store.test.ts src/lib/storage/chat-store.test.ts` — ✅ 10 tests passed.
- `bunx biome check --write src/lib/storage/lambda-chat-store.ts src/lib/storage/lambda-chat-store.test.ts` — ✅ fixed new-file formatting/import order only.
- `bun run check` — ⚠️ still fails only on known/pre-existing lint/format issues outside PR3 scope after new-file formatting was fixed:
  - `app/login/page.tsx` static `id="main-content"`.
  - `app/shell.tsx` static `id="main-content"`.
  - `src/ai/tools/load-skill.ts` formatting.
  - `src/components/ai-elements/suggestion.tsx` import/format.
  - `src/components/chat-interface.tsx` import order.
  - `src/components/ui/scroll-area.tsx` formatting.
- `bun run test src/lib/storage/lambda-blob-store.test.ts` — RED: ❌ failed because `./lambda-blob-store` did not exist.
- `bun run test src/lib/storage/lambda-blob-store.test.ts` — GREEN after implementation and test expectation correction: ✅ 7 tests passed.
- `bun run test src/lib/storage/lambda-blob-store.test.ts src/lib/storage/lambda-chat-store.test.ts src/lib/storage/chat-store.test.ts` — ✅ 17 tests passed.
- `bunx tsc --noEmit` — ❌ initially failed on S3 body type narrowing.
- `bunx tsc --noEmit` — ✅ passed after adding an explicit transformable S3 body type guard.
- `bunx biome check --write src/lib/storage/lambda-blob-store.ts src/lib/storage/lambda-blob-store.test.ts` — ✅ fixed new-file formatting/import order only.
- `bun run test src/lib/storage/lambda-blob-store.test.ts && bunx tsc --noEmit` — ✅ passed after formatting.
- `bun run check` — ⚠️ still fails only on known/pre-existing lint/format issues outside PR4 scope after new-file formatting was fixed:
  - `app/login/page.tsx` static `id="main-content"`.
  - `app/shell.tsx` static `id="main-content"`.
  - `src/ai/tools/load-skill.ts` formatting.
  - `src/components/ai-elements/suggestion.tsx` import/format.
  - `src/components/chat-interface.tsx` import order.
  - `src/components/ui/scroll-area.tsx` formatting.
- `bun run test amplify/functions/chat-streaming/handler.test.ts` — RED: ❌ failed because the old handler returned dependency-pending and the Lambda runtime global was unavailable during module import.
- `bun run test amplify/functions/chat-streaming/handler.test.ts` — GREEN after composition implementation: ✅ 2 tests passed.
- `bun run test src/components/chat-interface.test.tsx` — RED: ❌ failed because `getChatTransportApi` and Lambda Authorization header injection did not exist.
- `bun run test src/components/chat-interface.test.tsx` — GREEN after transport switch implementation: ✅ 9 tests passed.
- `bun run test amplify/backend.test.ts` — RED: ❌ failed because chat Lambda env vars and IAM policies were not wired.
- `bun run test amplify/backend.test.ts` — GREEN after env/IAM implementation: ✅ 2 tests passed.
- `bun run test amplify/functions/chat-streaming/handler.test.ts amplify/functions/chat-streaming/runtime-adapter.test.ts src/components/chat-interface.test.tsx amplify/backend.test.ts` — ✅ 23 tests passed.
- `bunx tsc --noEmit` — ✅ passed after PR5 type fixes.
- `bun run test` — ✅ 31 files passed, 132 tests passed.
- `bunx biome check --write amplify/functions/chat-streaming/handler.ts src/components/chat-interface.tsx src/components/chat-interface.test.tsx amplify/backend.ts amplify/backend.test.ts docs/lambda-chat-smoke.md` — ✅ fixed formatting/import order for touched files only.
- `bun run check` — ⚠️ fails only on known/pre-existing lint/format issues outside PR5 scope:
  - `app/login/page.tsx` static `id="main-content"`.
  - `app/shell.tsx` static `id="main-content"`.
  - `src/ai/tools/load-skill.ts` formatting.
  - `src/components/ai-elements/suggestion.tsx` import/format.
  - `src/components/ui/scroll-area.tsx` formatting.

## Deviations From Design

- The PR1 temporary `501 CHAT_LAMBDA_DEPENDENCIES_PENDING` path was removed in PR5; POST now composes the real chat handler with Lambda auth/store/blob adapters.
- CORS allowlist remains production Amplify origin plus localhost. Additional sandbox/preview origins should be added deliberately before browser canary outside localhost/prod.
- Unexpected Cognito access-token scopes are ignored rather than rejected; the adapter relies on `aws-jwt-verify` for issuer/client/token-use validity and requires a non-empty `sub` for owner mapping.
- PR3 selected direct DynamoDB instead of AppSync/IAM. This is a deliberate fallback from the design preference because current model auth is user-pool owner based and AppSync IAM would require schema/auth/function-resource changes outside the PR3 slice. The coupling is contained behind `ChatStore` and documented in `chat-store-decision.md`.
- PR4 adds a separate role-backed AWS SDK v3 S3 adapter instead of modifying the existing custom signed `S3BlobStore`; this keeps the Lambda role-credential path localized and avoids introducing static-key behavior into the streaming runtime.

## Post-Fix Slice — Lambda Bundle Contamination Fix

Applied after full verify identified cold-start crash from esbuild bundling Next-only dynamic imports in `chat-handler.ts`.

### Files Changed (post-fix)

- `src/lib/chat-handler.ts` — removed `getDefaultHandler`, `chatPost`, `cachedHandler`, and all Next/libsql/Amplify-SSR imports; exports only `createChatPostHandler` + supporting types/helpers.
- `src/lib/chat-handler-next.ts` — new file containing Next-only `getDefaultHandler`/`chatPost`/`cachedHandler` composition with dynamic imports for `@/lib/storage/chat-store`, `@/lib/auth/server`, and `@/lib/storage/amplify-blob-store`.
- `app/api/chat/route.ts` — updated import from `@/lib/chat-handler` → `@/lib/chat-handler-next`.
- `src/ai/agents/agent.ts` — import ordering fix (Biome `organizeImports`).
- `amplify/functions/chat-streaming/handler.ts` — added `isAuthRequiredError` import and `authRequiredResponse()` to return `401 AUTH_REQUIRED` for invalid Cognito tokens instead of `500 CHAT_LAMBDA_CONFIGURATION_INVALID`.
- `amplify/functions/chat-streaming/handler.test.ts` — added auth-error test case (`returns auth errors before chat execution`).
- `AGENTS.md` — updated stale reference from `src/ai/prompts/water-sector.md` to `src/ai/prompts/water-sector.ts`.
- `openspec/changes/port-chat-streaming-to-lambda/verify-report.md` — updated to reflect cold-start fix applied and canary retention decision.

### TDD Evidence (post-fix)

| Task                                        | Test File                                          | RED                                                    | GREEN                              | TRIANGULATE                                                     | REFACTOR           |
| ------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------ | ---------------------------------- | --------------------------------------------------------------- | ------------------ |
| Auth error classification in Lambda handler | `amplify/functions/chat-streaming/handler.test.ts` | ✅ New test failed before `isAuthRequiredError` branch | ✅ 3/3 passed after implementation | ✅ Configuration error path still distinct from auth error path | ✅ Biome formatted |

### Test Commands Run (post-fix)

- `bun run test amplify/functions/chat-streaming/handler.test.ts` — ✅ 3 tests passed (was 2, added auth-error case).
- `bun run test amplify/functions/chat-streaming/handler.test.ts amplify/functions/chat-streaming/runtime-adapter.test.ts src/lib/auth/lambda-owner.test.ts src/lib/storage/lambda-chat-store.test.ts src/lib/storage/lambda-blob-store.test.ts` — ✅ 37 tests passed.
- `bun run test` — ✅ 31 files, **133 tests passed** (was 132).
- `bunx tsc --noEmit` — ✅ passed.
- `bun run check` — ⚠️ 6 pre-existing issues only (same list as PR5; no new violations introduced).
- `npx -y -p node@22 -c 'node -v && ./node_modules/.bin/ampx sandbox'` — ✅ deployed using Node 22 workaround (system Node is v26; nvm unavailable in shell).
- `curl` invalid-token smoke (post-fix) — ✅ `HTTP/1.1 401 Unauthorized`, `x-error-code: AUTH_REQUIRED` — cold-start crash is gone, app code is reached.
- Local esbuild bundle audit: zero inputs for `@libsql`, `next/headers`, `adapter-nextjs`, `aws-amplify/auth/server`, `aws-amplify/storage/server`, `src/lib/storage/chat-store.ts`, `src/lib/auth/server.ts`, `src/lib/storage/amplify-blob-store.ts`.

### Canary Retention Decision

The synthetic `streaming-canary` Function URL is **retained** until real Cognito-token smoke passes. It confirms Lambda Function URL response streaming works independently of chat domain logic and serves as a low-risk diagnostic baseline.

## Remaining Tasks

- **PENDING (requires user action):** Run real Cognito access-token smoke against `https://i2bquluu4ttmvzpuxva665dlye0tnunw.lambda-url.us-east-1.on.aws/`. No test credentials available in environment. Exact steps documented in `verify-report.md`.
- Validate browser Lambda transport mode with `NEXT_PUBLIC_CHAT_TRANSPORT=lambda` and `NEXT_PUBLIC_CHAT_LAMBDA_URL=<ChatStreamingFunctionUrl>`.
- After real smoke passes: remove synthetic `streaming-canary` Function URL stack and update `docs/amplify-sandbox-smoke.md`.

## Risks

- `awslambda.HttpResponseStream.from` was validated in sandbox after fixing `pipeResponseToStream` to avoid overriding the Lambda HTTP integration metadata content type after decoration.
- The Function URL remains public at Lambda auth mode (`authType: NONE`) but now requires a valid Cognito access-token in application code before chat execution.
- Direct DynamoDB adapter is coupled to generated table/index names through CDK environment variables; schema/index changes must keep those env vars and IAM grants updated.
- Lambda S3 BlobStore writes new objects under `lambda-chat/attachments/users/{userId}`; old Amplify private `identityId` objects are not automatically readable by this new key path.
- Bedrock IAM is scoped to inference-profile/foundation-model ARN patterns rather than exact model IDs; tighten further if governance requires explicit model ARN allowlists.
- Existing SDD artifacts `design.md` and `tasks.md` appear untracked in this worktree; they were read as source context and not modified by this PR5 apply slice.

## Post-Deploy Fix Slice — Lambda Streaming POST CORS

### Completed Tasks

- Added explicit runtime CORS response header support for Lambda Function URL streaming responses.
- Added allowed-origin enforcement before POST chat execution; unapproved cross-origin POST requests now return `403 ORIGIN_NOT_ALLOWED` without invoking chat handling or adding `access-control-allow-origin`.
- Added `access-control-allow-origin`, `access-control-expose-headers`, and `vary: origin` to approved-origin POST stream metadata, including auth/error response paths.
- Preserved OPTIONS preflight behavior and existing non-wildcard allowlist semantics.

### Files Changed

- `amplify/functions/chat-streaming/runtime-adapter.ts` — added CORS response helpers and reused exposed-header metadata.
- `amplify/functions/chat-streaming/handler.ts` — rejects unapproved origins before auth/chat execution and wraps POST/error responses with approved-origin CORS headers.
- `amplify/functions/chat-streaming/handler.test.ts` — added metadata-capture tests for approved POST CORS, approved auth-error CORS, and unapproved-origin rejection.
- `openspec/changes/port-chat-streaming-to-lambda/apply-progress.md` — recorded this post-deploy fix evidence.

### TDD Evidence (post-deploy CORS fix)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lambda streaming POST CORS metadata and origin rejection | `amplify/functions/chat-streaming/handler.test.ts` | Unit | ✅ 13/13 existing handler/runtime tests passed before edits | ✅ Added tests failed: approved POST lacked ACAO metadata; evil origin still invoked chat; auth-error lacked ACAO | ✅ `bun run test amplify/functions/chat-streaming/handler.test.ts` passed 4/4 after implementation | ✅ Covered success stream, auth-error stream, and disallowed-origin rejection before chat execution | ✅ Extracted CORS helpers in `runtime-adapter.ts`; Biome check/write made no further changes |

### Test Commands Run (post-deploy CORS fix)

- `bun run test amplify/functions/chat-streaming/runtime-adapter.test.ts amplify/functions/chat-streaming/handler.test.ts` — ✅ baseline 13/13 passed before edits.
- `bun run test amplify/functions/chat-streaming/handler.test.ts` — ❌ RED: 3 new assertions failed before implementation (missing ACAO; disallowed origin still invoked chat; auth-error missing ACAO).
- `bun run test amplify/functions/chat-streaming/handler.test.ts` — ✅ GREEN: 4/4 passed after implementation.
- `bunx biome check --write amplify/functions/chat-streaming/handler.ts amplify/functions/chat-streaming/handler.test.ts amplify/functions/chat-streaming/runtime-adapter.ts` — ✅ no fixes needed.
- `bun run test amplify/functions/chat-streaming/handler.test.ts amplify/functions/chat-streaming/runtime-adapter.test.ts` — ✅ 14/14 passed.
- `bunx tsc --noEmit` — ✅ passed.
- `bun run check` — ✅ passed, 141 files checked.

### Deviations From Design

- None. This narrows R7 CORS/origin controls for the already-selected Lambda Function URL streaming path and avoids wildcard origins with Authorization.

### Remaining Tasks

- Deploy this fix to production, then retry the browser Network smoke against the hardcoded Lambda Function URL.
- If CORS is resolved, continue evaluating whether chunks arrive progressively; if not, inspect Function URL streaming mode, adapter chunk logs, AI SDK/Bedrock stream timing, and browser/proxy behavior.
- Remove synthetic `streaming-canary` only after chat Lambda streaming is accepted.

### Workload / PR Boundary

- Delivery path remains stacked-to-main/post-deploy hotfix slice.
- Boundary: minimal Lambda CORS fix only; no frontend transport or infrastructure behavior changes.

## Post-Deploy Fix Slice — Remove Function URL CORS Duplication

### Completed Tasks

- Removed CDK-managed CORS from the chat streaming Function URL so handler-owned streaming response metadata is the single source for `access-control-allow-origin`.
- Preserved `InvokeMode.RESPONSE_STREAM` and `authType: NONE` for the chat Function URL.
- Preserved the existing streaming canary Function URL configuration.
- Updated backend infrastructure tests to assert the chat Function URL has no `cors` property.

### Files Changed

- `amplify/backend.ts` — removed `cors` from `chatStreamingFunction.addFunctionUrl` and dropped the unused `HttpMethod` import.
- `amplify/backend.test.ts` — updated Function URL expectations to verify both canary and chat URLs remain response-streaming and chat URL has no CDK CORS config.
- `openspec/changes/port-chat-streaming-to-lambda/apply-progress.md` — recorded this second CORS hotfix evidence.

### TDD Evidence (duplicate ACAO hotfix)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Remove duplicate Function URL CORS injection for chat streaming | `amplify/backend.test.ts` | Unit/infrastructure composition | ✅ `bun run test amplify/backend.test.ts` passed 2/2 before edits | ✅ Updated test failed because chat Function URL still had `cors` metadata | ✅ Removed chat Function URL `cors`; focused backend test passed 2/2 | ✅ Asserted both Function URL calls remain `authType: NONE` + `RESPONSE_STREAM`, and chat config has no `cors` property | ✅ Removed unused `HttpMethod` import; checks stayed green |

### Test Commands Run (duplicate ACAO hotfix)

- `bun run test amplify/backend.test.ts` — ✅ baseline 2/2 passed before edits.
- `bun run test amplify/backend.test.ts` — ❌ RED: expected chat Function URL config to omit `cors`, but existing config included it.
- `bun run test amplify/backend.test.ts` — ✅ GREEN: 2/2 passed after removing chat Function URL CORS.
- `bun run test amplify/backend.test.ts` — ✅ TRIANGULATE/REFACTOR: 2/2 passed after precise call-order assertions.
- `bunx tsc --noEmit` — ✅ passed.
- `bun run check` — ✅ passed, 141 files checked.
- `bun run verify:amplify-config` — ✅ passed.

### Deviations From Design

- The original CDK-level Function URL CORS allowlist is intentionally removed for the chat streaming URL because production showed duplicate ACAO when both AWS Function URL CORS and handler-owned streaming metadata inject CORS headers. Handler-owned CORS remains allowlist-based via `CHAT_STREAM_ALLOWED_ORIGINS`.

### Remaining Tasks

- Deploy this second CORS hotfix to production and retry invalid-token/browser smoke.
- Confirm the POST response has exactly one `access-control-allow-origin` and one `vary: origin` value.
- If CORS passes, continue validating progressive chunk delivery.

### Workload / PR Boundary

- Boundary: minimal infrastructure metadata hotfix only; no chat handler, frontend transport, storage, auth, or model behavior changes.
