# Spec Delta — port-chat-streaming-to-lambda

## Status

`draft`

## Scope

This spec defines AWS-only behavior contracts for migrating chat streaming transport from Amplify Hosting `WEB_COMPUTE` to Lambda response streaming, while preserving existing chat module seams and keeping `/api/chat` rollback available.

## Requirements

### R1 — Preserve deep chat module seams
The implementation **MUST** preserve `createChatPostHandler` as the primary chat Module interface and **MUST NOT** inline or rewrite domain logic into infrastructure handlers.

The implementation **MUST** preserve these Interfaces/Seams as independently swappable Adapters:
- `ChatStore`
- `BlobStore`
- `StreamAgent`
- `getOwner`

#### Scenario: lambda runtime uses existing chat module
- **Given** a Lambda runtime adapter receives a chat request
- **When** it invokes chat handling
- **Then** it uses `createChatPostHandler(...)` with injected seam adapters
- **And** chat domain behavior remains outside the Lambda transport adapter.

### R2 — Initial spike path is Lambda Function URL response streaming
The first production candidate **MUST** use Lambda Function URL direct with `InvokeMode.RESPONSE_STREAM`.

API Gateway REST response streaming **MAY** be considered later for governance. API Gateway HTTP API **MUST NOT** be specified as the streaming path in this change.

#### Scenario: infrastructure defines streaming invoke mode
- **Given** the chat streaming Lambda is provisioned
- **When** function URL settings are evaluated
- **Then** `InvokeMode.RESPONSE_STREAM` is enabled
- **And** this path is the default spike runtime.

### R3 — Lambda runtime adapter contract
A Lambda runtime Adapter **MUST** transform Function URL event input into a web `Request` compatible with `createChatPostHandler`.

The same Adapter **MUST** map handler output `Response` status/headers/body to Lambda `responseStream`, piping progressive chunks and closing the stream correctly.

#### Scenario: progressive response piping
- **Given** chat handler returns a streaming `Response.body`
- **When** the Lambda adapter writes to `responseStream`
- **Then** chunks are emitted progressively (not buffered until completion)
- **And** stream termination and errors are surfaced in Lambda logs/metrics.

### R4 — Cognito JWT owner adapter and auth failures
A Lambda `getOwner` Adapter **MUST** verify Cognito JWT Bearer tokens and map valid identity to the existing owner context shape used by chat seams.

The system **MUST** reject requests for missing, malformed, expired, issuer-mismatch, audience/client mismatch, or token-use mismatch credentials with explicit auth failure responses.

#### Scenario: missing bearer token
- **Given** a request without `Authorization: Bearer ...`
- **When** owner resolution runs
- **Then** chat execution is not invoked
- **And** an authentication failure response is returned.

#### Scenario: valid token maps owner
- **Given** a valid Cognito JWT for the configured user pool/client
- **When** owner resolution runs
- **Then** owner context is produced for downstream chat/storage seams.

### R5 — Portable persistence and attachment behavior
`ChatStore` behavior **MUST** remain portable in Lambda: thread/message lifecycle semantics must match current chat contracts.

`BlobStore` behavior **MUST** either:
1) preserve existing attachment semantics in Lambda, **or**
2) be explicitly scoped with a documented temporary limitation and rollback-safe behavior.

#### Scenario: attachment support scoped explicitly
- **Given** Lambda spike cannot preserve full attachment behavior yet
- **When** the spec/design declares limitation
- **Then** the limitation is explicit, testable, and reversible
- **And** non-attachment chat flows remain fully functional.

### R6 — Frontend transport switch and rollback
Frontend chat transport **MUST** support configured target selection between:
- Lambda Function URL (cross-origin)
- existing same-origin `/api/chat` rollback path.

When targeting Lambda, client transport **MUST** send a Cognito Bearer token and **MUST** preserve existing request payload shape consumed by `parseChatRequest`.

#### Scenario: rollback to existing route
- **Given** Lambda path is degraded or disabled
- **When** transport configuration flips to rollback mode
- **Then** chat requests are sent to `/api/chat` without app-code migration rollback.

### R7 — CORS and origin controls
Function URL CORS/origin handling **MUST** allow only approved app origins and required headers (including `Authorization`) for configured environments.

The runtime **MUST** handle preflight correctly and **MUST NOT** allow wildcard production origins when authenticated chat data is involved.

#### Scenario: disallowed origin blocked
- **Given** a browser request from an unapproved origin
- **When** CORS evaluation executes
- **Then** the request is rejected by origin policy.

### R8 — Rollout, rollback, and canary cleanup
The rollout **MUST** be canary-first with `/api/chat` retained until Lambda verification gates pass.

Temporary streaming canaries/proxies used for diagnosis **MUST** be removed or disabled after migration decision and validation.

#### Scenario: staged rollout
- **Given** Lambda streaming is newly deployed
- **When** rollout begins
- **Then** traffic is introduced in controlled stages
- **And** a documented immediate rollback path to `/api/chat` exists.

### R9 — Observability basics
The Lambda chat path **MUST** emit baseline telemetry for:
- request correlation id
- auth resolution outcome/timing
- persistence timing
- Bedrock first-byte timing
- stream completion/error outcome.

This telemetry **SHOULD** support diagnosing buffering, auth failures, and partial streams without requiring code changes.

#### Scenario: stream failure diagnosable
- **Given** a stream aborts mid-response
- **When** operators inspect logs/metrics
- **Then** request id, failure phase, and timing context are available.

### R10 — Strict TDD verification evidence
Implementation and verification phases for this change **MUST** produce strict TDD evidence (RED, GREEN, TRIANGULATE, REFACTOR) for runtime adapter, auth adapter, storage behavior, and transport configuration.

Verification evidence **MUST** include project commands from `openspec/config.yaml` (`bun run test`, targeted tests, `bunx tsc --noEmit`, `bun run check` with known pre-existing lint caveat noted) plus AWS streaming smoke validation.

#### Scenario: verification gate
- **Given** implementation is complete
- **When** verification runs
- **Then** RED→GREEN cycle evidence is recorded per critical adapter
- **And** streaming is demonstrated with AWS smoke checks
- **And** known pre-existing lint issues are separated from new regressions.
