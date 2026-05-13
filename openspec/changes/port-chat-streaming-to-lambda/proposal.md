# Proposal: Port Chat Streaming to Lambda

## Intent

Move only the chat streaming transport for `POST /api/chat` off Amplify Hosting `WEB_COMPUTE` and onto an AWS Lambda runtime that supports progressive response streaming, while preserving the existing chat Module and its seams: `createChatPostHandler`, `ChatStore`, `BlobStore`, `StreamAgent`, and `getOwner`.

The problem is runtime buffering, not the chat domain logic. The Lambda Function URL canary with `InvokeMode.RESPONSE_STREAM` has passed, so the next change should add a small AWS-only runtime Adapter around the existing handler instead of rewriting the agent, persistence model, or frontend chat protocol.

## Problem

Amplify Hosting `WEB_COMPUTE` currently buffers streamed responses in production. The app generates chunks progressively with AI SDK v6 and Bedrock, but the production host delivers the assistant response all at once. A standalone Lambda Function URL canary proved that AWS Lambda response streaming can deliver progressive chunks in the target AWS environment.

This creates a user experience gap: local streaming works, Bedrock invocation works, but production users do not see incremental assistant output from the current `/api/chat` route.

## Goals

- Provide the best modern, standard, simple, maintainable AWS-only path for progressive chat streaming.
- Move only the chat endpoint transport/runtime, not the whole app.
- Preserve the existing deep chat Module behind `createChatPostHandler({ chatStore, blobStore, agent, generateText, getOwner })`.
- Add Lambda-specific Adapters at the runtime boundary:
  - Function URL event to web `Request`.
  - Web `Response.body` to Lambda `responseStream`.
  - Cognito JWT to `OwnerContext`.
  - Lambda-compatible `ChatStore` and `BlobStore` selection.
- Keep the existing Next `/api/chat` path as rollback until Lambda chat is validated.
- Keep review workload controlled by splitting design/tasks/apply into reviewable slices before implementation.
- Use strict TDD in later phases with explicit RED/GREEN/TRIANGULATE/REFACTOR evidence.

## Non-Goals

- Do not implement app code in this proposal phase.
- Do not move the entire Next.js app off Amplify Hosting.
- Do not rewrite `createChatPostHandler`, the AI SDK agent system, the water-sector prompt, or the message protocol.
- Do not introduce Vercel or any non-AWS runtime.
- Do not choose HTTP API as the response-streaming path unless later verified against official AWS documentation. Current known official API Gateway response streaming docs apply to REST API endpoint types / REST APIs with response transfer mode `STREAM`.
- Do not add API Gateway REST, CloudFront, custom domains, WAF, WebSockets, AppSync realtime, ECS/Fargate, or Amplify AI Conversations in the initial spike unless design discovers a blocking Function URL limitation.
- Do not remove the existing `/api/chat` route or current Amplify Data/Storage defaults until Lambda chat is proven.
- Do not treat the temporary public streaming canary as a secure chat endpoint.

## Proposed Scope

### In Scope

1. Define a Lambda Function URL chat runtime using `InvokeMode.RESPONSE_STREAM` as the recommended spike path.
2. Define a Lambda handler Adapter using Node.js Lambda response streaming (`awslambda.streamifyResponse`) that:
   - accepts the Function URL request,
   - builds a standard web `Request`,
   - invokes `createChatPostHandler`,
   - copies required status/headers, and
   - pipes `Response.body` progressively into the Lambda response stream.
3. Define a Lambda owner Adapter that verifies `Authorization: Bearer <Cognito token>` and returns the existing `OwnerContext` shape.
4. Design the smallest portable `ChatStore` Adapter path for Lambda, preserving current `ChatStore` semantics.
5. Design the smallest portable `BlobStore` Adapter path for Lambda, including how attachment keys map to user/thread ownership.
6. Add a frontend transport switch behind configuration so the UI can send chat requests to the Function URL with a Bearer token while preserving the existing request payload shape parsed by `parseChatRequest`.
7. Add CDK/Amplify backend configuration for the chat Lambda Function URL, CORS, environment, and least-privilege IAM permissions.
8. Document smoke validation with `curl -N --no-buffer` and browser chat validation.

### Out of Scope for Initial Spike

- API Gateway REST response streaming governance path.
- Same-domain CloudFront routing.
- Public production cutover without rollback.
- Data model redesign beyond what is needed to satisfy `ChatStore` from Lambda.
- Attachment UX changes beyond preserving existing `BlobStore` behavior.

## Affected Areas

| Area | Impact | Description |
|---|---:|---|
| `amplify/backend.ts` | Modified later | Add a chat streaming Lambda Function URL with `InvokeMode.RESPONSE_STREAM`, CORS, outputs/env, and IAM permissions. |
| `amplify/functions/*` | Added later | Add Lambda runtime Adapter code for chat streaming. |
| `src/lib/chat-handler.ts` | Preserved/minimal | Reuse `createChatPostHandler`; avoid changing core chat flow unless tests expose a seam issue. |
| `src/lib/auth/server.ts` or new auth adapter module | Added/modified later | Keep Next cookie owner Adapter; add separate Cognito JWT owner Adapter for Lambda. |
| `src/lib/storage/chat-store.ts` or new store adapter module | Added/modified later | Preserve `ChatStore` interface; add/choose Lambda-compatible implementation. |
| `src/lib/storage/blob-store.ts` / S3 adapter | Added/modified later | Preserve `BlobStore`; ensure Lambda role-backed storage works for attachments. |
| Chat UI transport configuration | Modified later | Allow configured Function URL endpoint and Bearer token while keeping message body contract. |
| Tests | Added/modified later | Strict TDD evidence for runtime, auth, stores, transport config, and CDK config. |
| Existing `app/api/chat/route.ts` | Preserved | Remains same-origin rollback path during spike and canary rollout. |

## Acceptance Criteria

- [ ] Proposal/spec/design/tasks preserve the seams `createChatPostHandler`, `ChatStore`, `BlobStore`, `StreamAgent`, and `getOwner`.
- [ ] The implementation plan uses Lambda Function URL direct as the spike path with `InvokeMode.RESPONSE_STREAM`.
- [ ] The proposal does not claim API Gateway HTTP API response streaming is the path; API Gateway REST response streaming remains a later governance option only.
- [ ] Lambda chat can stream AI SDK UI message chunks progressively when validated with `curl -N --no-buffer` and in the browser.
- [ ] Authenticated chat requests use Cognito JWT verification in Lambda and reject missing, malformed, expired, wrong-issuer, wrong-audience, or wrong-token-use tokens.
- [ ] Lambda chat persists/reloads threads and messages through a `ChatStore` implementation with semantics matching the existing interface.
- [ ] Lambda chat preserves attachment behavior through a `BlobStore` implementation or an explicitly scoped attachment limitation accepted during design.
- [ ] Frontend transport can switch between same-origin `/api/chat` and the Lambda Function URL via configuration.
- [ ] Existing `/api/chat` remains available as rollback until production cutover is explicitly approved.
- [ ] Later implementation records strict TDD evidence: RED, GREEN, TRIANGULATE, REFACTOR.

## Risks

| Risk | Likelihood | Mitigation |
|---|---:|---|
| Lambda-compatible Amplify Data access is more complex than the runtime Adapter | High | Preserve `ChatStore`; evaluate AppSync/IAM vs direct DynamoDB in design before coding. |
| Cognito JWT lacks `identityId` needed by current private Storage paths | High | Decide whether to map identity ID or use Lambda-role S3 paths keyed by stable `userId`. |
| Cross-origin Function URL requires careful CORS and token handling | Medium | Restrict allowed origins, allow `Authorization`, test preflight and browser transport. |
| Function URL has lighter governance than API Gateway | Medium | Accept for spike; document API Gateway REST response streaming as later governance path. |
| Lambda duration/cost grows with long streams | Medium | Set timeout/concurrency limits and capture timing metrics for Bedrock first byte and stream close. |
| Header/body protocol mismatch breaks AI SDK UI streaming | Medium | Test status/content-type/header copying and chunk piping against `createUIMessageStreamResponse`. |
| Review workload exceeds safe size | High | Split implementation into small slices; pause after tasks if estimated diff exceeds ~400 changed lines. |
| Existing `bun run check` may report unrelated UI lint issues | Medium | Record known pre-existing issues separately; do not attribute them to this change. |

## Rollout and Rollback

### Rollout

1. Keep existing `/api/chat` on Amplify Hosting as the default path.
2. Add Lambda chat Function URL behind configuration, initially disabled for normal users.
3. Validate Lambda runtime with automated tests and `curl -N --no-buffer` smoke checks.
4. Enable the frontend transport switch for a controlled canary environment/user cohort.
5. Confirm browser streaming, persistence, regenerate, title generation, and attachment behavior.
6. Promote the Lambda endpoint only after design acceptance and verification evidence are recorded.

### Rollback

- Flip configuration back to same-origin `/api/chat`.
- Leave the Lambda Function URL deployed but unused while diagnosing, or remove the stack in a follow-up cleanup.
- Because the core chat Module and interfaces are preserved, rollback should not require reverting chat domain logic.
- If persistence adapters diverge during spike, design must specify whether any migrated data needs reconciliation before cutover.

## Review Workload Warning

This change is likely to touch infrastructure, Lambda runtime code, auth, storage/data adapters, frontend transport configuration, and tests. A single implementation PR may exceed the 400-line review comfort budget. The tasks phase should split delivery into reviewable slices, likely:

1. Runtime Adapter and streaming pipe tests.
2. Cognito owner Adapter tests.
3. Portable `ChatStore`/`BlobStore` Adapter decision and tests.
4. Amplify/CDK Function URL wiring.
5. Frontend transport switch and browser smoke docs.

Do not implement all slices at once without explicit approval after tasks estimate review size.

## Open Questions for Design

1. Should the browser send a Cognito access token or ID token to the Lambda Function URL? Which token gives the most stable `userId` while satisfying verifier rules for issuer, audience/client ID, and `token_use`?
2. How should Lambda obtain or replace `identityId` for `OwnerContext` when blob/private storage paths need it?
3. What is the simplest maintainable Lambda-compatible `ChatStore` Adapter: AppSync/IAM GraphQL, direct DynamoDB, or another Amplify-supported server path outside Next cookies?
4. What is the simplest maintainable Lambda-compatible `BlobStore` Adapter: current custom S3 Adapter with role credentials, Amplify Storage server APIs, or a new role-backed S3 Adapter keyed by `userId`?
5. Which headers from `createUIMessageStreamResponse` must be copied exactly to preserve AI SDK v6 UI message stream behavior?
6. Which production and sandbox origins should Function URL CORS allow during spike and rollout?
7. What observability is required for auth time, persistence time, Bedrock first byte, stream close, and stream errors?
8. When, if ever, should the path graduate from direct Function URL to API Gateway REST response streaming for governance?

## Expected Strict TDD Evidence Later

Strict TDD is active for this project. Later phases should record:

- RED/GREEN tests for Lambda event-to-`Request` conversion, including method, body, headers, malformed payload, and CORS preflight.
- RED/GREEN tests for `Response.body` piping to Lambda `responseStream`, including progressive chunk writes and stream close/error handling.
- RED/GREEN tests for Cognito JWT owner Adapter failure modes and valid owner mapping.
- RED/GREEN tests proving the selected `ChatStore` Adapter satisfies existing `ChatStore` semantics.
- RED/GREEN tests proving the selected `BlobStore` Adapter preserves attachment put/get/delete behavior.
- RED/GREEN tests for frontend transport configuration and Bearer token inclusion without request payload drift.
- Infrastructure assertions that the Function URL uses `RESPONSE_STREAM`, CORS permits only expected origins/headers, and Lambda IAM is least-privilege.
- Verification commands: targeted `bun run test <file>`, full `bun run test`, `bunx tsc --noEmit`, `bun run check` with known pre-existing issues noted, and Amplify validation with `nvm use` then `npx ampx sandbox`.

## Success Criteria

- [ ] A reviewed design confirms Function URL direct is the initial AWS-only spike path.
- [ ] Existing chat core Depth and seams remain intact; new code is localized to runtime/auth/storage/transport Adapters.
- [ ] Lambda chat streams progressively in AWS, not only locally.
- [ ] Auth, persistence, attachments, regenerate, and title generation behavior are preserved or explicitly scoped with accepted limitations.
- [ ] Rollback to existing `/api/chat` is a configuration change, not a code emergency.
- [ ] Review workload is controlled before implementation begins.
