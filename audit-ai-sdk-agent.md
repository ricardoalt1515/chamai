I can’t write files in this session (no write/edit tool available), so I’m providing the exact audit content below for `audit-ai-sdk-agent.md`.

---

# AI SDK Agent Audit — SecondstreamAI

`skill_resolution: paths-injected`

## Scope reviewed
- `src/ai/agents/agent.ts`
- `src/ai/tools/**`
- `src/lib/chat-handler.ts`
- `src/lib/chat-helpers.ts`
- `app/api/chat/route.ts`
- `src/config/models.ts`
- chat/tool/runtime tests under `src/**` and `amplify/functions/chat-streaming/**`
- OpenSpec context: `openspec/config.yaml`, `openspec/changes/port-chat-streaming-to-lambda/{spec.md,design.md}`

## Findings

### 1) **High** — Transport rollback path is not actually configurable in UI
- **Evidence**
  - `src/components/chat-interface.tsx`: `CHAT_LAMBDA_URL` hardcoded; `getChatTransportApi()` always returns Lambda URL.
  - No env-based switch for `/api/chat` fallback despite OpenSpec requirement.
- **Risk**
  - Breaks intended rollback safety; if Lambda URL/auth/origin config fails, UI cannot switch back without code change/redeploy.
- **Recommended fix**
  - Add explicit transport mode config (e.g. `NEXT_PUBLIC_CHAT_TRANSPORT`, `NEXT_PUBLIC_CHAT_LAMBDA_URL`) and route to `/api/chat` when disabled.

### 2) **Medium** — `modelId` is validated but not used to select runtime model at inference
- **Evidence**
  - `parseChatRequest` returns `runtimeModelId` (`src/lib/chat-helpers.ts`).
  - `createAgent` always uses `MODELS[0].runtimeModelId` (`src/ai/agents/agent.ts`).
  - `chat-handler` never passes request model choice into agent model selection.
- **Risk**
  - Hidden coupling; future multi-model support can silently misbehave.
- **Recommended fix**
  - Either remove unused per-request model fields (if intentionally single-model), or wire model selection via `createAgent({ ... })`/request context.

### 3) **Medium** — Persisted attachment metadata validation is weaker in request parser than store metadata contract
- **Evidence**
  - `parseChatRequest` persisted-ref check only requires `{version, s3Key, sizeBytes}` (`src/lib/chat-helpers.ts`).
  - `filePartToAttachmentRef` expects stricter metadata incl. `mediaType`, `url`, and supported media type (`src/lib/storage/attachment-metadata.ts`).
- **Risk**
  - Inconsistent validation boundary; malformed refs pass parser then fail later in runtime path.
- **Recommended fix**
  - Reuse `filePartToAttachmentRef` (or equivalent strict schema) inside `parseChatRequest`.

### 4) **Medium** — Route timeout mismatch with long-running artifact/tool flow
- **Evidence**
  - `/api/chat` route sets `maxDuration = 60` (`app/api/chat/route.ts`).
  - `chat-handler` sets agent `timeout.totalMs = 240_000` with documented long flow rationale (`src/lib/chat-handler.ts`).
- **Risk**
  - If fallback `/api/chat` is used, long tool flows likely abort prematurely.
- **Recommended fix**
  - Align route max duration with realistic flow or enforce shorter bounded behavior for that path.

### 5) **Low** — Tool export surface inconsistency can hurt maintainability
- **Evidence**
  - `src/ai/tools/index.ts` exports only `load-skill`; artifact tools are imported via deep path.
- **Risk**
  - Fragmented imports and discoverability drift.
- **Recommended fix**
  - Export `createH2oArtifactTools` (and related schemas/types) from barrel if intended public module API.

### 6) **Low** — Some AI SDK best-practice choices are strong and modern
- **Evidence**
  - Proper `ToolLoopAgent` usage (`src/ai/agents/agent.ts`).
  - `tool({ inputSchema, execute })` + Zod schemas in tools.
  - `convertToModelMessages(..., { ignoreIncompleteToolCalls: true })`.
  - `createUIMessageStreamResponse({ consumeSseStream: consumeStream })` to ensure finalize/persistence.
  - Lambda runtime adapter streams progressively and handles backpressure/keepalive (`amplify/functions/chat-streaming/runtime-adapter.ts`).
- **Risk**
  - None; this is a positive.
- **Recommended fix**
  - Keep these patterns; they are aligned with current AI SDK streaming/tooling patterns.

## Schema validation quality (quick verdict)
- **Good:** tool input schemas are explicit and constrained (`h2o-artifacts.ts`); request-level attachment limits and MIME checks are clear (`chat-helpers.ts`).
- **Needs hardening:** unify persisted attachment metadata validation path (see Finding #3).

## Streaming behavior (quick verdict)
- **Good:** server stream lifecycle has abort sanitization and persistence guardrails (`chat-handler.ts`), plus Lambda stream adapter supports progressive writes, drain handling, and SSE keepalive.
- **Watchouts:** `/api/chat` timeout mismatch and non-configurable frontend transport reduce operational resilience.

## Test coverage (quick verdict)
- Strong targeted coverage for:
  - request parsing (`chat-helpers.test.ts`)
  - handler persistence/error/abort/regenerate paths (`chat-handler.test.ts`)
  - tool schemas/execution (`h2o-artifacts.test.ts`, `load-skill.test.ts`)
  - Lambda runtime adapter stream mechanics (`runtime-adapter.test.ts`)
- Gap:
  - no visible tests for transport mode switching (currently not implemented).

## Engram note
No memory-save tool is available in this session, so I could not persist discoveries to Engram programmatically.