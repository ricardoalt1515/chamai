# chat-lambda-streaming Specification

## Purpose

Define durable AWS-only behavior for moving chat streaming transport to Lambda while preserving existing chat domain seams and rollback safety.

## Requirements

### Requirement: Preserve Chat Core Seams

The system MUST preserve `createChatPostHandler` as the core chat module and MUST keep `ChatStore`, `BlobStore`, `StreamAgent`, and `getOwner` as injectable seams. Lambda transport work MUST be implemented as runtime adapters around these seams and MUST NOT rewrite core chat behavior.

#### Scenario: Lambda invokes existing chat module

- GIVEN a Lambda chat request reaches the streaming runtime
- WHEN the runtime handles the request
- THEN it invokes `createChatPostHandler` with seam-compatible adapters and returns its response contract

### Requirement: AWS-Only Streaming Runtime

The system MUST use Lambda Function URL direct with `InvokeMode.RESPONSE_STREAM` as the initial production path for streaming chat. API Gateway REST response streaming MUST be treated as a later governance option and MUST NOT be required for initial cutover.

#### Scenario: Progressive chunks are delivered from Lambda

- GIVEN a valid chat request handled by Lambda Function URL
- WHEN the assistant produces streamed output
- THEN chunks arrive progressively to the client instead of being buffered to completion

### Requirement: Lambda Auth and Owner Resolution

The Lambda chat endpoint MUST require `Authorization: Bearer <token>` and MUST verify Cognito JWTs before owner resolution. Invalid, missing, expired, wrong-issuer, wrong-audience/client, or wrong-token-use JWTs MUST be rejected. Valid tokens MUST resolve `OwnerContext` via the `getOwner` seam.

#### Scenario: Unauthorized request is rejected

- GIVEN a request with missing or invalid bearer token
- WHEN Lambda auth verification runs
- THEN the request is rejected and chat execution does not start

### Requirement: Persistence Compatibility

The Lambda path MUST provide a `ChatStore` adapter whose behavior is compatible with existing thread/message persistence semantics, including create, read, append, regenerate-safe writes, and title update persistence.

#### Scenario: Thread state persists through Lambda path

- GIVEN an authenticated user sends chat messages through Lambda
- WHEN the request completes
- THEN thread and message state can be reloaded with behavior equivalent to current chat persistence expectations

### Requirement: Attachment and Blob Compatibility

The Lambda path MUST provide a `BlobStore` adapter compatible with existing attachment/report blob semantics. Existing attachment request constraints (count, size, mime families, PDF text rule) MUST remain enforced by the chat request parser.

#### Scenario: Attachment constraints remain enforced

- GIVEN a chat request with unsupported or invalid attachments
- WHEN Lambda chat parsing/validation runs
- THEN the request fails with the same validation class of behavior as current chat handling

### Requirement: Frontend Transport Switch and Rollback

The system MUST support configuration-based routing between same-origin `/api/chat` and Lambda Function URL for chat transport. Existing `/api/chat` MUST remain available as rollback until Lambda streaming is verified and approved.

#### Scenario: Rollback is configuration-only

- GIVEN Lambda transport is enabled and an operational issue occurs
- WHEN rollback is triggered
- THEN chat traffic can be switched back to `/api/chat` without rewriting chat domain logic

### Requirement: CORS and Browser Compatibility

Lambda Function URL configuration MUST restrict CORS to approved origins and MUST allow required methods and headers (including `Authorization`) for browser chat requests and preflight handling.

#### Scenario: Browser preflight succeeds only for approved origin

- GIVEN a browser sends CORS preflight from an approved origin
- WHEN the Function URL evaluates CORS
- THEN required headers/methods are allowed
- AND unapproved origins are not allowed

### Requirement: Observability for Stream Lifecycle

The Lambda chat path MUST emit observability data for request lifecycle, including authentication result, persistence stage outcomes, stream start/first-byte timing, stream completion, and stream errors with request correlation.

#### Scenario: Stream failure is diagnosable

- GIVEN a streaming request fails mid-stream
- WHEN operators inspect logs/metrics
- THEN they can correlate the failure to request id, stage, and timing boundaries

### Requirement: Temporary Resource Cleanup

Temporary streaming canary resources used only for migration validation MUST be removed or explicitly decommissioned after Lambda chat path verification and cutover governance decision.

#### Scenario: Canary cleanup after decision

- GIVEN Lambda chat streaming is validated and decisioned
- WHEN cleanup is executed
- THEN temporary canary endpoints/resources are no longer exposed

### Requirement: Strict TDD Evidence

Because strict TDD is active, implementation and verification for this change MUST record RED, GREEN, TRIANGULATE, and REFACTOR evidence for runtime adapters, auth, persistence, attachments, transport switch, and infrastructure assertions.

#### Scenario: Verification package includes TDD cycle evidence

- GIVEN implementation tasks are complete
- WHEN verification artifacts are produced
- THEN evidence shows RED→GREEN progression with triangulation/refactor notes and command outputs for required test gates
