I’m unable to write files from this session (no write tool is available), so I’m returning the exact audit content below for `audit-ai-ui-contract.md`.

---

# AI Chat UI Contract Audit

skill_resolution: paths-injected

## Scope reviewed
- `app/page.tsx`
- `app/c/[threadId]/page.tsx`
- `src/components/**` (chat-related + ai-elements integration)
- `app/actions/**`
- `app/api/chat/route.ts`
- `src/lib/chat-handler.ts`
- `src/lib/chat-helpers.ts`

## Findings

### 1) **High** — Regenerate path likely violates required backend contract (`modelId`)
**Evidence**
- Frontend transport base body only includes `threadId`: `src/components/chat-interface.tsx:351-356`
- Regenerate call sends only `messageId`: `src/components/chat-interface.tsx:646`
- Backend hard-requires valid `modelId`: `src/lib/chat-helpers.ts:64-68`

**Why it matters**
`parseChatRequest` rejects requests without `modelId`. `sendMessage` includes `modelId`, but regenerate does not explicitly include it.

**Recommended fix**
Pass `modelId` (and `webSearchEnabled` if needed) in `regenerate({...})` body, or set transport-level body to always include current `modelId`.

---

### 2) **High** — Attachment size contract mismatch (UI allows > server aggregate limit)
**Evidence**
- UI allows up to 5 files at 4MB each: `src/components/chat-prompt-composer.tsx:188-191`
- Server aggregate cap is 4MB total payload: `src/config/attachments.ts:8`, enforced in `src/lib/chat-helpers.ts` (aggregate check)

**Why it matters**
Users can attach files that pass client validation but fail server-side with `FILE_TOO_LARGE` aggregate payload errors.

**Recommended fix**
Add client-side aggregate size validation aligned to `MAX_ATTACHMENT_PAYLOAD_BYTES`, and surface dedicated error copy before submit.

---

### 3) **Medium** — Generic tool parts are intentionally hidden from transcript
**Evidence**
- Non-artifact tool parts return `null` in renderer: `src/components/chat-interface.tsx:587-589`
- Only artifact tools are rendered in detail: `src/components/chat-interface.tsx` default branch
- Test explicitly asserts hidden `tool-loadSkill`: `src/components/chat-interface.test.tsx` (“hides internal loadSkill tool cards…”)

**Why it matters**
This reduces observability/debuggability for unexpected/new tool outputs and can make “silent” behavior look broken.

**Recommended fix**
Keep `tool-loadSkill` hidden, but add fallback rendering for unknown non-internal tools (collapsed generic card with state/input/error).

---

### 4) **Medium** — Chat transport endpoint is hardcoded to a single Lambda URL
**Evidence**
- Hardcoded constant: `src/components/chat-interface.tsx:205`
- API route exists but is bypassed by client transport: `app/api/chat/route.ts`

**Why it matters**
Hardcoded infra endpoint reduces environment portability (local/preview/staging), and couples frontend build to one runtime URL.

**Recommended fix**
Move transport API URL to env-driven config with safe default (`/api/chat`) and explicit override for Lambda URL deployments.

---

### 5) **Low** — `webSearchEnabled` wiring is mostly inert
**Evidence**
- Composer forces `webSearchEnabled: false`: `src/components/chat-prompt-composer.tsx:167`
- Draft store tracks `webSearchEnabled` but no UI toggle path is active: `src/hooks/use-draft-input.ts`

**Why it matters**
Contract field exists end-to-end but behavior is effectively fixed; this is confusing for maintainers.

**Recommended fix**
Either remove inactive field for now or add explicit UI toggle and keep values consistent in submit/regenerate paths.

---

## Positive checks

- Request payload shape preparation is correctly centralized in `prepareSendMessagesRequest` and matches server parser expectations for submit path.
- Attachment MIME/type and per-file size constraints are aligned between frontend and backend.
- SSE reconciliation/persistence strategy is robust (long-stream recovery and artifact terminal-state waiting).
- Thread ownership checks are enforced in server actions and chat handler before data access.

---

## Suggested priority order
1. Fix regenerate `modelId` contract.
2. Align client attachment aggregate-size validation with backend.
3. Add env-based transport endpoint configuration.
4. Add fallback rendering for non-artifact tools.
5. Clean up/activate `webSearchEnabled` UX path.

---

Note: Engram save was requested, but no memory-save tool is exposed in this session.