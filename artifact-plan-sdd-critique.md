I could not write to `/Users/ricardoaltamirano/Developer/SecondstreamAI/artifact-plan-sdd-critique.md` because this subagent runtime exposes no write/edit tool.  
Below is the critique content to save there.

---

# SDD Critique — `docs/agent-audit-and-artifact-plan.md` (READ-ONLY)

## Summary
The plan is directionally strong, but it has **high-risk gaps** around persistence consistency, PDF route hardening, and stream/abort handling. It also includes a few outdated assumptions and one ordering risk in the PR split.

---

## 1) Over-engineering (fields/abstractions/tools)

### Finding 1.1 — **Low**: Schema is mostly lean; no obvious field bloat
- **Evidence:** `docs/agent-audit-and-artifact-plan.md:109-121` (`ArtifactDraft` with `threadId`, `ownerId`, `title`, `sections` only).
- **Assessment:** Good restraint (no version/status/id extras).

### Finding 1.2 — **Medium**: `isFinal` exists but no server-side invariant checks
- **Evidence:** `docs/agent-audit-and-artifact-plan.md:134-154` (`isFinal` flag), `:158-161` (persist from tool calls in `onFinish`).
- **Risk:** `isFinal` can be ignored/contradicted; no validation for duplicate/missing finalization.
- **Plan change:** Add explicit server validation rule (e.g., persist only if ≥1 section; optionally require at least one `isFinal:true` or tolerate absence but mark draft incomplete).

### Finding 1.3 — **Medium**: Introduces new artifact-store abstraction before proving read/write path
- **Evidence:** `docs/...md:161` (`lambda-artifact-store.ts` mirroring chat store) + PR2 breadth (`:207`).
- **Risk:** Could hide integration bugs behind abstraction too early.
- **Plan change:** In PR2, start with a minimal direct function + tests, then extract store abstraction if needed.

---

## 2) Hybrid Amplify Data schema + direct DynamoDB writes (May 2026)

### Finding 2.1 — **High**: Approach is viable but fragile without strict contract tests
- **Evidence:** Plan relies on manual `__typename`/`owner` injection (`docs/...md:102,120,161`), matching existing chat pattern (`src/lib/storage/lambda-chat-store.ts` includes `owner` + `__typename` on writes).
- **Risk:** Any schema/index/auth format drift can silently break Amplify Data reads.
- **Plan change:** Keep hybrid, but add contract tests that verify:
  1) Lambda-written item is readable via Amplify Data owner auth,
  2) owner format compatibility (`<sub>::<sub>`),
  3) identifier/index assumptions for `threadId`.

### Finding 2.2 — **Medium**: `ownerId` in model may be redundant/confusing
- **Evidence:** Proposed model includes `ownerId` (`docs/...md:111`), while auth already uses `allow.owner()` (`:117`) and runtime owner metadata is separately injected (`:120`).
- **Plan change:** Either remove `ownerId` from model or explicitly define its purpose (UI display/audit). Avoid dual owner truth.

---

## 3) `@react-pdf/renderer` for server-side PDF in 2026

### Finding 3.1 — **Low/Medium**: Choice is reasonable for generated document layout
- **Evidence:** `docs/...md:98,175`.
- **Assessment:** Still a valid default for React-authored PDFs in Node runtime.

### Finding 3.2 — **Medium**: Plan omits runtime constraints for Next route
- **Evidence:** PDF endpoint proposed (`docs/...md:167-175`) but no explicit runtime directive.
- **Risk:** Edge runtime incompatibility / stream issues.
- **Plan change:** Explicitly set Node runtime for PDF route and add large-document timeout/memory guardrails.

---

## 4) 3-PR split (cleanups → foundation → UI)

### Finding 4.1 — **Medium**: Split is mostly good, but one hidden coupling exists
- **Evidence:** PR2 includes AI Elements artifact install and data-part schema changes (`docs/...md:207`), PR3 does UI consumption (`:208`).
- **Risk:** PR2 may introduce types/events unused until PR3, causing temporary drift/confusion.
- **Plan change:** Move all UI-facing data-part type wiring that is not backend-required into PR3, or keep PR2 behind feature flag with dead-code guard.

### Finding 4.2 — **Low**: Cleanup ordering rationale is correct
- **Evidence:** H1/H8/H5 sequencing (`docs/...md:42-76`) matches current code realities:
  - `loadSkill` tool exists (`src/ai/agents/agent.ts:3,12-13`)
  - phantom UI tool types (`src/types/ui-message.ts:25-36`)
  - UI renders phantom tool states (`src/components/chat-interface.tsx:322,349`).

---

## 5) AI SDK v6 clashes (transient parts, writer tools, useChat onData)

### Finding 5.1 — **High**: Persistence source mismatch risk (onData transient vs onFinish tool parts)
- **Evidence:** Plan streams via transient data parts (`docs/...md:100,147,182`) but persists by walking `responseMessage.parts` in `onFinish` (`:158-161`).
- **Risk:** Transient payload shown to UI may diverge from persisted reconstruction if tool-call parsing differs.
- **Plan change:** Define single source of truth:
  - Either persist from normalized tool inputs captured during execution,
  - Or persist exactly what UI receives (buffered server-side mirror of emitted artifact updates).

### Finding 5.2 — **High**: Abort/continuation not handled in proposed `onFinish` flow
- **Evidence:** Existing `onFinish` handler only reads `responseMessage` (`src/lib/chat-handler.ts:353`), ignores `isAborted`/continuation metadata (present in test callback shape, `src/lib/chat-handler.test.ts` around onFinish mock payload).
- **Plan change:** Gate artifact upsert on non-aborted completion, and define behavior for partial drafts.

### Finding 5.3 — **Medium**: Existing `useChat onData` path currently handles only two data types
- **Evidence:** `src/components/chat-interface.tsx:127` with explicit branches for `data-new-thread-created` and `data-conversation-title`.
- **Plan change:** Add robust unknown data-part handling and ordering safeguards before adding artifact streaming events.

---

## 6) Missing v1 criticals (auth, errors, stream edges)

### Finding 6.1 — **High**: PDF endpoint authz needs explicit thread ownership check
- **Evidence:** Plan says “Read ArtifactDraft via Amplify Data with owner auth” (`docs/...md:170`) but doesn’t mention thread existence/ownership cross-check.
- **Reference pattern:** Existing server actions verify thread ownership (`app/actions/messages.ts:19-23`).
- **Plan change:** Require both:
  1) authenticated owner (`getCurrentOwner`),
  2) thread ownership validation before returning PDF.

### Finding 6.2 — **High**: PDF endpoint error contract missing
- **Evidence:** No explicit error mapping in plan section `:167-175`.
- **Plan change:** Define status codes + safe errors (401/403/404/422/500), response headers, and logging policy.

### Finding 6.3 — **High**: Stream failure edge cases under-specified
- **Evidence:** Current handler catches and emits generic error part (`src/lib/chat-handler.ts:406-408`), plan only says “if errored before any tool call, nothing to persist” (`docs/...md:163`).
- **Plan change:** Specify:
  - behavior when some sections emitted then stream fails,
  - whether partial draft persists,
  - dedupe/idempotency strategy for retries/regenerate.

---

## Recommended plan changes (concrete)

1. **Add “Contracts & invariants” subsection** in PR2:
   - owner/auth contract tests for hybrid writes,
   - artifact completeness/partial rules,
   - idempotent upsert behavior.
2. **Harden PDF route design**:
   - Node runtime explicit,
   - thread ownership check + artifact owner check,
   - typed error responses and logging.
3. **Clarify persistence truth source**:
   - transient stream vs reconstructed tool parts; choose one canonical persisted format.
4. **Handle abort/partial explicitly** in `onFinish` logic.
5. **Slight PR boundary tweak**:
   - keep backend foundation in PR2,
   - shift purely UI data-part typing/render wiring to PR3 unless required by compilation.