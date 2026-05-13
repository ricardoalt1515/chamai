# Explore — port-chat-streaming-to-lambda

## Status

`explore_complete`

## Executive summary

The production streaming issue is confirmed as an Amplify Hosting `WEB_COMPUTE` buffering problem, not a Bedrock or AI SDK problem. The standalone Lambda Function URL canary in the Amplify sandbox proved that `InvokeMode.RESPONSE_STREAM` delivers progressive chunks over AWS.

The existing chat core has good seams. `createChatPostHandler` is a deep Module: request validation, owner lookup, persistence, Bedrock agent streaming, assistant persistence, and title generation sit behind a compact `Request -> Response` interface with injectable Adapters (`ChatStore`, `BlobStore`, `StreamAgent`, `getOwner`, `generateText`). The next work should preserve that depth and add a Lambda runtime Adapter around it.

The main portability risks are outside the chat core:

- `getCurrentOwner()` is a Next/Amplify SSR cookie Adapter.
- `AmplifyChatStore` uses `generateServerClientUsingCookies` and is Next-cookie shaped.
- `AmplifyBlobStore` uses Amplify server context and private storage paths shaped by Cognito identity.
- The frontend currently posts to same-origin `/api/chat`; a Function URL spike needs CORS and a Bearer token.

Recommended smallest path: design a Lambda Function URL chat spike that uses `awslambda.streamifyResponse`, verifies Cognito JWTs in the handler, uses portable AWS-role-backed Adapters for data/storage, and pipes the existing AI SDK `Response.body` to the Lambda response stream. Keep Function URL direct for the spike. Consider API Gateway REST response streaming only if production governance needs throttling/custom domains/WAF/API management.

## Confirmed facts

- Amplify Hosting `WEB_COMPUTE` buffers progressive responses in production.
- Lambda Function URL with `InvokeMode.RESPONSE_STREAM` streamed the canary progressively in `us-east-1`.
- AWS documents Node.js response streaming via `awslambda.streamifyResponse()` and Function URLs with `InvokeMode=RESPONSE_STREAM`.
- CDK v2 directly supports `FunctionUrlOptions.invokeMode` and `InvokeMode.RESPONSE_STREAM`.
- API Gateway response streaming documentation is for REST API endpoint types; direct Function URL remains the simpler proven spike path.
- Bedrock auth is portable if the Lambda role receives the same least-privilege Bedrock permissions, because `createBedrockProvider()` uses `fromNodeProviderChain()`.
- `createChatPostHandler` is runtime-agnostic at its external seam.
- Current owner/data/blob default Adapters are coupled to Next cookies and Amplify SSR context.
- The project already depends on `aws-jwt-verify`, but not as a direct `package.json` dependency; if Lambda auth imports it directly, declare it explicitly.

## Documentation findings — May 2026

- **Lambda Function URL response streaming** is the modern Lambda-native way to expose a simple streaming HTTP endpoint. It avoids API Gateway/CloudFront ceremony for the spike.
- **Node.js managed runtime** uses the global `awslambda.streamifyResponse()` wrapper. The handler must end the response stream and should set the content type.
- **Function URL auth** supports `NONE` and `AWS_IAM`. For browser users authenticated by Cognito, `NONE` plus explicit JWT verification in the handler is the simplest spike shape; `AWS_IAM` would require SigV4 from the browser or a signing proxy.
- **CORS** must allow the Amplify app origin and `Authorization` header for cross-origin Function URL calls.
- **Function URL streaming and VPC** do not mix; do not put the streaming Lambda in a VPC for this path.
- **API Gateway response streaming** is available through REST API response transfer mode `STREAM`; it is a governance/hardening candidate, not the smallest next step.
- **CloudFront + Function URL OAC** can protect a Function URL origin, but it pushes complexity into CloudFront signing and still leaves user JWT validation to the Lambda. It is not needed for the spike.

## Candidate runtime architecture options

### Option A — Lambda Function URL direct (recommended spike)

- **Runtime Adapter**: Lambda handler uses `awslambda.streamifyResponse`.
- **Auth Adapter**: `Authorization: Bearer <Cognito token>` verified by `aws-jwt-verify`.
- **Chat Module**: reuse `createChatPostHandler` unchanged.
- **Data Adapter**: portable AppSync/IAM or direct data Adapter, selected explicitly for Lambda.
- **Blob Adapter**: portable S3 Adapter using Lambda role credentials.
- **Pros**: proven streaming, smallest service surface, easiest to debug, AWS-only.
- **Cons**: custom JWT verification, cross-origin CORS, limited API governance.

### Option B — API Gateway REST response streaming + Lambda

- **Runtime Adapter**: REST API proxy integration with response transfer mode `STREAM`.
- **Pros**: API management, custom domains, throttling/WAF path, stronger governance.
- **Cons**: more infrastructure, not yet proven in this app, unnecessary for the next spike.

### Option C — CloudFront + Function URL origin

- **Runtime Adapter**: CloudFront behavior routes to Function URL origin.
- **Pros**: can support same-domain routing and origin access control.
- **Cons**: more moving parts; user auth still belongs in Lambda; not needed until domain/governance requirements are explicit.

## Recommended smallest next proposal scope

Create a proposal for a bounded chat Lambda spike, not a full production migration.

In scope:

1. Add a new Lambda Function URL for chat streaming with `InvokeMode.RESPONSE_STREAM`.
2. Add a Lambda runtime Adapter that converts Function URL events to a web `Request`, invokes `createChatPostHandler`, and pipes the returned `Response.body` to `responseStream`.
3. Add a Cognito JWT owner Adapter for Lambda.
4. Decide and spike the smallest portable storage/data Adapter path needed for chat persistence.
5. Add a frontend transport switch behind configuration so chat can target the Function URL with `Authorization: Bearer <token>`.
6. Keep existing `/api/chat` as rollback until the Lambda path is validated.
7. Document smoke validation with `curl -N --no-buffer` and browser chat validation.

Out of scope:

- Moving the whole Next.js app off Amplify Hosting.
- Rewriting `createChatPostHandler` or the agent system.
- API Gateway, CloudFront, custom domains, WAF, VPC, WebSockets, AppSync realtime, Amplify AI Conversations.
- Removing existing Next/Amplify SSR stores until the Lambda path is proven.
- Cleanup of temporary canaries before the new chat path passes.

## Unknowns / questions for proposal/design

1. Which token should the frontend send: Cognito access token or ID token? The owner Adapter needs stable `userId` and the verifier must match Cognito token-use rules.
2. How should Lambda get an `identityId` if private Storage paths require it? Options: map `identityId` via Cognito Identity APIs, or use Lambda-role S3 paths keyed by `userId` for chat attachments.
3. What is the simplest portable `ChatStore` Adapter: AppSync IAM GraphQL using generated schema operations, direct DynamoDB, or another Amplify-supported server client outside Next cookies?
4. Does the AI SDK UI message stream `Response` require exact headers that must be copied to the Lambda response stream?
5. What production origin(s) should Function URL CORS allow during spike and initial production?

## Likely test surfaces for strict TDD

- Lambda event-to-`Request` Adapter: method, body, headers, CORS preflight, malformed body.
- Response piping Adapter: copies status/content-type and writes chunks progressively.
- Cognito owner Adapter: missing header, malformed token, expired token, wrong issuer/audience/token_use, valid owner mapping.
- Lambda storage/data Adapter: save/list/get/replace semantics match `ChatStore` expectations.
- Frontend transport config: sends configured endpoint and Bearer token without changing message payload shape.
- CDK stack tests: Function URL uses `RESPONSE_STREAM`, CORS allows expected origin/header, role has least-privilege permissions.

## Risks

- AppSync/Amplify Data access outside Next cookies may be more complex than the runtime Adapter.
- `identityId` may not be available in Cognito JWTs; blob paths need a deliberate decision.
- Cross-origin Function URL calls require careful CORS and token handling.
- Direct Function URLs lack API Gateway throttling/WAF; acceptable for spike but may not be final production governance.
- Existing `bun run check` failures are pre-existing UI lint issues and should not be attributed to this change.

## Skill resolution

`injected` — project standards were supplied by parent orchestration. Architecture vocabulary used: Module, Interface, Seam, Adapter, Depth, Leverage, Locality.
