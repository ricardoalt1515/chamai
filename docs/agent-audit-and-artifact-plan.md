# Agent Audit & H2O Allegiant Artifact Plan

**Status:** Planning — ready to execute. Lambda chat migration has landed. H2O Allegiant v2 spec fully ingested (system prompt + 9 skills + Reference + brand.py). **Plan validated 2026-05-15 against Anthropic prompt-engineering best practices and AI SDK v6 source (`node_modules/ai@6.0.77`).**

**Date:** 2026-05-14 (updated 2026-05-15 with validation deltas)
**Source of truth for product:** `H2O Allegiant Discovery Agent v2/` (system-prompt-v2.md, 9 skills, knowledge base, brand kit, Prairie reference).
**Audit baseline:** AI SDK v6 docs (`node_modules/ai/docs/`), `@ai-sdk/amazon-bedrock` provider docs, AI Elements references (May 2026), Anthropic prompt-engineering and prompt-caching guidance.
**Scope decision:** **V1 implements all 4 artifacts** (Field Brief + 3 on-demand follow-ons). Confirmed by user.

### Validation deltas applied (2026-05-15)

The original plan injected ~7,800 lines of knowledge base into the system prompt. Validation against Anthropic guidance ("every token added depletes Claude's attention budget") and user decision to defer KB drove the following changes — see updated sections below:

1. **Knowledge base deferred to V2.** No KB injection in V1. System prompt v2 ships compact (system prompt + 9 skill descriptions only). Section 3 rewritten.
2. **Operating sequence reframed as quality criteria + output contract,** not prescriptive step-by-step instructions. Updated in §3.
3. **Extended thinking enabled** via `providerOptions.bedrock.reasoningConfig`. New in §5.
4. **`<system-reminder>` pattern** for per-turn state delta (stage, prior brief presence, active stop-flags). New in §5.
5. **Explicit cache breakpoints** via `providerOptions.bedrock.cachePoint`. New in §5.
6. **Response-length contract** by turn type baked into system prompt. New in §3.
7. **PR3 registers all 8 tools with stubs** for PR4-6 follow-ons, preserving cache prefix across deploys. Updated in §8.
8. **Prairie visual-validation gate scoped down for V1** — structural + brand fidelity only. Content specificity recovered in V2 with KB strategy. Updated in §6.4.

---

## 1. Product context

H2O Allegiant is an internal intelligence layer for US wastewater BD field agents. NOT a generic chat. Each turn the agent runs a 9-skill operating sequence and produces ONE primary deliverable plus optional follow-ons.

### The 4 artifacts (per spec)

| Artifact | When produced | Structure | Pages | Voice |
|---|---|---|---|---|
| **Field Brief** | Always (every opportunity-advancing turn) | 4 fixed sections: What this is / What we'd propose / What could kill it / Do this next | 1-2 | Consultant briefing in a hallway |
| **Playbook** | On-demand only — triggers: "give me the playbook", "questions for tomorrow's call", "what should I ask" | 11-theme stage-aware question set | 1-2 | Sales-engineering reference tool |
| **Analytical Read** | On-demand only — triggers: "send to my manager", "full write-up" | 9 sections, evidence-tagged | 4-8 | Senior consultant to senior manager |
| **Proposal Shell** | On-demand only — triggers: "draft the proposal", or when RFP/offer on table | 7 sections, customer-facing scoping | 3-6 | Formal, written as if customer reads it (because they will) |

**Each artifact = PDF + markdown mirror.** Per spec: "most runs produce 2 files" (Field Brief PDF + .md). Maximum any run can produce: 8 (4 artifacts × 2 formats).

### Operating sequence (every turn)

1. `h2o-segmentation-router` → decompose into sub-streams
2. `h2o-water-evidence-interpretation` → extract evidence, surface conflicts
3. `h2o-solution-lens-light` → per-sub-stream specialist read
4. `h2o-compliance-and-safety-flagging` → flag inventory (always-on header)
5. `h2o-discovery-gap-analysis` → gaps + top 3 questions
6. `h2o-deal-stager` → current stage (Lead → Qualify → Scope → Position → Propose → Close)
7. `h2o-positioning` → committed position (approach + win-win + cost-of-alternative + kill risks)
8. `h2o-field-brief` → render Field Brief (always) + requested follow-ons

Not every turn renders a PDF. Conversational turns (focused questions) answer with text + flag header only.

### Non-goals (per spec)
- Never customer-facing (except Proposal Shell, which IS customer-facing by design).
- No final regulatory determinations.
- No firm pricing, no named vendors, no named decision-makers. Categories and roles only.
- No Assessment-mode work (engineering specs, regulatory findings).

---

## 2. Current state issues

| # | Severity | Issue | Files |
|---|---|---|---|
| H1 | 🔴 Critical | `loadSkill` tool reads from `process.cwd()` — broken in Lambda; v2 skills are hardwired in system prompt, not dynamic | `src/ai/tools/load-skill.ts`, `src/ai/skills/` |
| H2 | ✅ Resolved | Chat streaming migrated to Lambda Function URL | `amplify/functions/chat-streaming/handler.ts`, `src/lib/chat-handler.ts` |
| H5 | 🟠 Important | `MyUIMessage` declares tools that don't exist | `src/types/ui-message.ts` |
| H8 | 🟠 Important | UI renders dead tool cases; `webSearchEnabled` plumbed but ignored | `src/components/chat-interface.tsx`, `chat-prompt-composer.tsx` |
| H4 | 🔴 Replaced | `water-sector.md` is generic; replace with `h2o-allegiant-system-prompt-v2.md` + injected KB | `src/ai/prompts/water-sector.md` |
| H3 / H6 / H7 | 🟡 Minor | Default `stopWhen`, fake fast model, oversized `prompt-input.tsx` — defer to post-MVP | — |
| N1 / N2 / N3 | 🟡 Tech debt | Lambda URL hardcoded, dead Next handler, canary still deployed — tracked separately | — |

---

## 3. System prompt strategy: compact, KB deferred

The system prompt v2 originally referenced ~7,800 lines of knowledge base (75 flags, 7 lenses, 37 doc types). **Decision: KB deferred to V2. V1 ships with a compact system prompt only.**

### Why KB is out of V1

- Per Anthropic guidance on harnessing intelligence: *"every token added depletes Claude's attention budget."* Prompt caching reduces cost, not attention drain.
- 80k+ tokens of always-on KB compete with the user's question for attention every turn — including conversational turns that don't need it.
- The right pattern (tool-callable KB lookups: `lookupFlag`, `lookupLens`, `lookupDocType`) is a V2 design question that deserves dedicated thinking, not a rush job in V1.
- User decision: defer KB strategy entirely, ship V1 without it, iterate on KB approach post-launch.

### What ships in V1

The system prompt is built from:
- `h2o-allegiant-system-prompt-v2.md` (compact — system prompt body only, no KB references inlined)
- 9 skill descriptions (one short paragraph each — the agent uses them as quality criteria, not as a runtime sequence)
- Behavior rules (lean-forward, never-defer, confidence labels, roles-not-names, etc.)
- Output contract (when to call which tool)
- Response-length contract (see below)

Estimated total preamble: **5-15k tokens** (vs ~85-100k with KB). System prompt lives as a single string export from `src/ai/prompts/h2o-allegiant.ts` — no build-time compile script, no `_compiled.ts`.

### Operating sequence: quality criteria, not steps

The 9 skills in `H2O Allegiant Discovery Agent v2/` are written as a prescriptive sequence ("run skill 1, then skill 2..."). **V1 reframes them as quality criteria the output must satisfy** — not as enforced steps the model must walk through.

Concretely, the system prompt expresses:

```
QUALITY BAR (every Field Brief MUST satisfy):
- Cost-of-alternative table fully priced over 5 years — non-negotiable
- 4 fixed sections: What this is / What we'd propose / What could kill it / Do this next
- 7 positioning components committed before rendering
- Confidence labels (HIGH/MEDIUM/LOW) on every sized number
- Always-on flag header when stop-flags or specialist-attention flags are present

BEHAVIOR RULES (override all defaults):
- Lean-forward: NEVER defer, ALWAYS commit with confidence label
- Roles and categories only — never name specific people, vendors, funders, competitors
- No firm pricing, no regulatory determinations
- LOW stays LOW (never soften to MEDIUM for readability)
- Stop-flags surface above everything, in bracketed [STOP]/[SPECIALIST]/[ATTENTION] format

OUTPUT CONTRACT:
- Opportunity-advancing turn → call proposeFieldBriefCover, then Section1-4 in order
- Trigger phrase for follow-on detected → also call the matching propose* tool
- Focused question / conversational turn → respond with text, include stage line, NO tool calls
```

This pushes intelligence into Claude. The model decides how to sequence the underlying reasoning; the prompt only enforces what must be true about the output.

### Response-length contract (baked into system prompt)

```
RESPONSE LENGTH:
- Conversational turn (focused question, clarification, color update): 2-4 sentences max. Include stage line at the end.
- Brief-rendering turn: text response is a 1-2 sentence handoff to the panel
  ("Field Brief produced for [customer] at [stage] stage. [Headline insight.]").
  The brief itself lives in the panel via tool calls.
- Stop-flag header: prepend to ANY response when active.
```

Without this, Sonnet 4.6 calibrates verbosity to task complexity and tends to over-explain on conversational turns.

### Risk acknowledged for V1 without KB

Without injected KB, outputs lose specificity:
- Field Brief references generic compliance categories instead of specific 75-flag codes (F006, F019, etc.)
- Lens reads are directional without the per-lens cheat sheet detail
- Document interpretation lacks the 37 doc-type reading disciplines

This is an explicit V1 tradeoff. The structural quality bar (4 sections, cost-of-alternative table, kill risks, action cards, brand fidelity) is preserved. Content depth is the V2 unlock once we design KB delivery (tool-callable lookups, scoped retrieval, or staged injection).

---

## 4. Unified artifact model

The 4 artifacts have different structures but share lifecycle (persisted per thread, owner-scoped, exported as PDF + markdown). One DynamoDB model with discriminator beats 4 separate models — fewer migrations, fewer queries, consistent auth.

```ts
// amplify/data/resource.ts
Artifact: a
  .model({
    threadId: a.id().required(),                     // composite key part
    kind: a.enum(["field-brief", "playbook", "analytical-read", "proposal-shell"]),
    ownerId: a.string().required(),
    customerName: a.string().required(),
    stage: a.enum(["lead", "qualify", "scope", "position", "propose", "close"]),
    payload: a.json().required(),                    // typed per `kind` in TS
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .identifier(["threadId", "kind"])                  // composite PK — one per kind per thread
  .authorization((allow) => [allow.owner()])
```

`threadId + kind` as composite identifier means: one Field Brief, one Playbook, one Analytical, one Proposal Shell per thread maximum. Re-rendering overwrites. Matches spec — "the brief is regenerated only if its content would meaningfully change."

TypeScript types live in `src/types/artifacts/`:
- `field-brief.ts` → `FieldBriefPayload` with `flags`, `section1..4`
- `playbook.ts` → `PlaybookPayload` with `themes: Theme[]`
- `analytical-read.ts` → `AnalyticalReadPayload` with `subStreams`, `decisionMatrix`, `fundingPathways`, etc.
- `proposal-shell.ts` → `ProposalShellPayload` with `scope`, `sizing`, `schedule`, `commitBoundaries`, etc.

Writes from Lambda: `DynamoDBClient` + `PutItemCommand` + `marshall(..., { removeUndefinedValues: true })` + inject `__typename: "Artifact"` and `owner: "<sub>::<sub>"` (mirrors `lambda-chat-store.ts`). Reads from browser: Amplify Data with owner auth.

---

## 5. Tool design — different shape per artifact

### 5.1 Field Brief (iterative — 5 tools, streamed)

The Field Brief is built up section-by-section as the agent reasons. Splitting into 5 tools gives clean progress events in the UI and per-section traceability.

```ts
proposeFieldBriefCover         // customerName, stage, stageRegression?, flags
proposeFieldBriefSection1      // situation, reframe, insight
proposeFieldBriefSection2      // approach, winWin, costOfAlternative, dealSizeSensitivity, insight
proposeFieldBriefSection3      // killRisks: KillRisk[]
proposeFieldBriefSection4      // actions: Action[]
```

Each `execute` emits `data-artifact-update` with `{ kind: "field-brief", patch: {...} }` transient. UI accumulates the patches into the panel state.

### 5.2 Follow-ons (one-shot — 1 tool each, no streaming)

The 3 follow-ons are composed AFTER positioning is committed. The agent already has full context. No reason to stream piecewise — emit the entire structured payload in one call.

```ts
proposePlaybook                // themes: Theme[] (11 themes, stage-aware question sets)
proposeAnalyticalRead          // subStreams[], decisionMatrix, fundingPathways, ... (9 sections)
proposeProposalShell           // execSummary, scope, sizing, schedule, commitBoundaries, ... (7 sections)
```

Each emits a single `data-artifact-update` with the complete payload. Faster, simpler, matches the on-demand semantics.

### 5.3 Server-side accumulator (`chat-handler.ts` `onFinish`)

After the stream completes:
1. Walk `responseMessage.parts` for all `propose*` tool calls.
2. Group by `kind` (Field Brief sections merge; follow-ons are atomic).
3. For each kind present, upsert `Artifact { threadId, kind, payload, ... }` via `lambda-artifact-store.ts`.

If no `propose*` calls fired (conversational turn), no writes. Previous artifacts stay as-is.

### 5.4 Provider options — extended thinking + prompt caching

Bedrock provider options applied in `agent.ts`:

```ts
providerOptions: {
  bedrock: {
    reasoningConfig: { type: 'enabled', maxReasoningEffort: 'medium' },
    cachePoint: { type: 'default', ttl: '5m' },
  },
}
```

**Extended thinking** (`reasoningConfig`): the 9-skill operating sequence is internal reasoning the model carries forward into tool calls. Reasoning blocks give the model an explicit space for that work without contaminating the visible output. `maxReasoningEffort: 'medium'` is the V1 default; tune up/down based on observed output quality.

**Prompt caching** (`cachePoint`): the AI SDK exposes Bedrock's cache point on message content. Default TTL `'5m'`. Verify during PR2 whether Sonnet 4.6 via Bedrock supports `'1h'` TTL (the AI SDK Bedrock docs list 1h support for Sonnet 4.5 / Opus 4.5 / Haiku 4.5 — 4.6 needs verification). Two cache points placed:

- **Cache point 1**: end of the system message (stable preamble — system prompt + skill descriptions + behavior rules + output contract).
- **Cache point 2**: end of the last assistant turn in conversations longer than 4 messages, so multi-turn threads still benefit from prefix cache hits.

### 5.5 Per-turn state delta — `<system-reminder>` pattern

Stage, prior-brief presence, and active stop-flags change per turn. Encoding them in the system prompt invalidates cache; re-deriving them every turn wastes attention. Instead, the client prepends a `<system-reminder>` block to each user message:

```ts
const message = `<system-reminder>
Current thread state:
- Stage: ${currentStage ?? 'none yet'}
- Prior Field Brief: ${hasFieldBrief ? 'exists' : 'none'}
- Active stop-flags: ${activeStopFlags.join(', ') || 'none'}
</system-reminder>

${userInput}`;
```

The Lambda passes this through unchanged. The model reads state from the reminder without any special parsing on our side. This pattern is documented in Anthropic's Claude Code prompt-caching guidance — keeps the cached system prefix stable while delivering up-to-date state.

---

## 6. PDF & markdown rendering

### 6.1 Stack: `@react-pdf/renderer`

- Node-native, no Chrome dependency.
- Streamable via `renderToStream`.
- Built-in Helvetica = brand spec primary, zero embedding cost.
- Lambda-friendly bundle (~2MB).
- Stays in Next API route, NOT in chat Lambda — does not contaminate chat cold-start.

### 6.2 Brand primitives port from `brand.py` (1,622 lines → React-PDF)

`brand.py` already covers all 4 artifacts (the v2 brand kit retained v1.2 templates for follow-ons). Port plan:

**Shared (used by 2+ artifacts):**
- `styles.ts` — 3-tier color palette (BRAND_NAVY `#03045E`, BRAND_BLUE `#0090F0`, BRAND_CYAN `#ADFDFF`, stage colors, flag severities), typography (Helvetica), page constants (US Letter, margins)
- `LogoMark`, `PageFooter`

**Field Brief specific:** CoverBlock, StageBadge, FlagHeader, InsightBox, SectionHeader, CostOfAlternativeTable, KillRiskCard, ActionCard, LaterPageHeader

**Playbook specific:** PlaybookCover, ThemeHeader (color cycling per theme), WhyItMattersCallout, QuestionList

**Analytical Read specific:** AnalyticalCover, EvidenceTaggedParagraph, DecisionMakerMatrix (table), SubStreamSection, FundingPathwayBlock

**Proposal Shell specific:** FormalCover (customer-facing styling), ScopeBlock, CommitBoundaryBlock (explicit commit vs don't-commit visualization), RiskAllocationBlock

Total: ~20 components.

### 6.3 Endpoints (Next route)

```
GET /api/threads/[id]/artifacts/[kind]/pdf
  → application/pdf, attachment

GET /api/threads/[id]/artifacts/[kind]/md
  → text/markdown, attachment

where [kind] ∈ field-brief | playbook | analytical-read | proposal-shell
```

Both handlers:
1. `getCurrentOwner()` — Cognito auth via `@aws-amplify/adapter-nextjs`
2. Read `Artifact` via Amplify Data with owner auth, filtered by `kind`
3. `pdf` → `renderToStream(<Doc payload={...} />)` from the appropriate React-PDF document
4. `md` → call the appropriate markdown renderer (typed string templating from payload)
5. Response with proper `Content-Disposition: attachment; filename=<customerSlug>_<kind>.<ext>`

Markdown is generated at request time from the typed payload. Never persisted. Single source of truth = DynamoDB payload.

### 6.4 Visual validation gate (mandatory before merging PR3) — scoped for V1

Render the Prairie example with the React-PDF components using data from `Reference/prairie_field_brief_v2.md`. Compare side-by-side against `Reference/prairie_field_brief_v2.pdf`.

**V1 gate (without KB):**
- ✅ Structural fidelity: cover block, 4 sections, insight boxes, cost-of-alternative table, kill-risk cards, action cards, page-2 anchor — all present and laid out correctly
- ✅ Brand fidelity: colors, typography, spacing, stage badge, severity coloring, flag header
- ✅ Voice and confidence labeling: every sized number tagged HIGH/MEDIUM/LOW
- ⚠️ Content specificity NOT gated: Prairie-level depth (specific flag codes, lens-specific approaches, document-type-specific reading) is V2 work tied to KB strategy

V1 ships when the brief is *structurally indistinguishable* from Prairie. Content depth is the V2 unlock.

---

## 7. UI integration

### 7.1 Artifact panel (`src/components/artifact-panel.tsx`)

Single panel component with internal tab/dropdown navigation between artifact kinds present for the current thread:

```
┌─ Artifact panel ──────────────────────┐
│ [Field Brief ▼]  [↓ PDF] [↓ Markdown] │
│ ─────────────────────────────────────  │
│ <FlagHeader />                         │
│ <CoverBlock customer={...} stage={...}/>│
│ <SectionOne />                         │
│ <SectionTwo>                           │
│   <CostOfAlternativeTable />           │
│ </SectionTwo>                          │
│ <SectionThree killRisks={[...]} />     │
│ <SectionFour actions={[...]} />        │
└────────────────────────────────────────┘
```

When `proposePlaybook` (or other follow-on) fires, a new tab appears: `[Field Brief] [Playbook]`. Each tab renders the matching DOM components (different from the React-PDF components — these are HTML for in-browser viewing, sharing primitives only conceptually via shared `styles.ts` colors and the same logical hierarchy).

### 7.2 Layout in `chat-interface.tsx`

- Desktop (`md:` breakpoint+): two-column flex when at least one artifact exists for the thread (chat left ~40%, panel right ~60%).
- Mobile: `<Sheet>` from `src/components/ui/sheet.tsx` triggered by an indicator in the conversation toolbar showing artifact count.
- Empty state: no panel, chat takes full width.

### 7.3 Hydration on thread mount

`/c/[threadId]` mount → query `Artifact` via Amplify Data filtered by `threadId` → hydrate all artifact kinds found into panel tabs. If none, panel stays closed until the first `data-artifact-update` arrives via streaming.

### 7.4 Streaming updates

`useChat` `onData` callback handles `data-artifact-update`:
- `kind === "field-brief"` + `patch` → merge into existing Field Brief state (section-by-section accumulation)
- `kind ∈ { playbook, analytical-read, proposal-shell }` + `payload` → replace entire artifact state for that kind (one-shot)

### 7.5 System prompt swap (H4)

Replace `water-sector.md` content with the compact H2O Allegiant prompt. No build-time compile script in V1 — the prompt is a single string in `src/ai/prompts/h2o-allegiant.ts`:

```ts
export const H2O_ALLEGIANT_SYSTEM_PROMPT = `
[h2o-allegiant-system-prompt-v2.md body — KB references stripped]

[9 skill descriptions — one short paragraph each, framed as quality criteria]

[Behavior rules: lean-forward, never-defer, confidence labels, ...]

[Output contract: when to call which tool]

[Response-length contract: per turn type]
`;
```

`agent.ts` imports the string and wraps it with `cachePoint` in `providerOptions`. `EMPTY_STATE_SUGGESTIONS` in `chat-interface.tsx` updates to wastewater BD scenarios.

KB injection (and the compile pipeline that would support it) is deferred to V2 — see §3.

### 7.6 AI Elements integration

V1 adds the following AI Elements components (via `npx ai-elements@latest`):

- `Reasoning` — collapsible block to surface extended-thinking output during streaming (not persisted)
- `Message` / `MessageContent` / `MessageResponse` — existing chat message primitives, already in use after the Lambda migration
- `PromptInput` (and attachment-related subcomponents) — already adopted

The artifact panel (`src/components/artifact-panel.tsx`) is custom — AI Elements does not ship a panel-with-tabs primitive that matches our brand-kit requirements. We compose with shadcn `Tabs` + custom React-PDF-mirroring DOM components.

---

## 8. Implementation order — 6 PRs

| PR | Scope | Approx LOC |
|----|-------|-----------|
| **PR1 — Cleanups** | H1 + H8 + H5. Drop `loadSkill`, dead UI tool cases, dead `webSearchEnabled` plumbing. Derive `MyUIMessage` from agent via `InferAgentUIMessage`. Refactor `readFileSync` side-effect out of `agent.ts`. | ~150 |
| **PR2 — Core foundation** | Unified `Artifact` Amplify Data model. Compact H2O Allegiant system prompt in `src/ai/prompts/h2o-allegiant.ts` (no KB, no compile pipeline). `agent.ts` updated with `providerOptions` (extended thinking + `cachePoint`). `<system-reminder>` helper in client for per-turn state delta. `lambda-artifact-store.ts` (DynamoDB direct). `onFinish` accumulator (multi-kind aware). Shared brand primitives port (`styles.ts`, `LogoMark`, `PageFooter`). Base endpoint scaffolding `/api/threads/[id]/artifacts/[kind]/{pdf,md}`. `data-artifact-update` data part added to `MyDataParts`. Install `ai-elements` `Reasoning` component. Verify `writer.write({ transient: true })`, `cachePoint`, and `reasoningConfig` all work in Lambda. | ~350 |
| **PR3 — Field Brief end-to-end** | Register **all 8 tools** in `agent.ts` (5 Field Brief tools implemented + 3 follow-on stubs returning `"not yet implemented"`). 9 Field Brief PDF primitives (CoverBlock, StageBadge, FlagHeader, InsightBox, SectionHeader, CostOfAlternativeTable, KillRiskCard, ActionCard, LaterPageHeader). `FieldBriefDocument` React-PDF + markdown renderer. `artifact-panel.tsx` with Field Brief tab + DOM components mirroring the PDF structure. Hydration. `Reasoning` component wired in chat to surface thinking blocks. **Prairie visual validation gate (V1 scope — structural + brand only).** | ~950 |
| **PR4 — Playbook end-to-end** | Replace `proposePlaybook` stub with real implementation (one-shot). 4 Playbook PDF primitives (PlaybookCover, ThemeHeader, WhyItMattersCallout, QuestionList). `PlaybookDocument` + markdown. Playbook tab in `artifact-panel.tsx`. Endpoint reuse. No new tool registration → cache prefix unchanged across deploy. | ~480 |
| **PR5 — Analytical Read end-to-end** | Replace `proposeAnalyticalRead` stub with real implementation. 5 Analytical primitives (AnalyticalCover, EvidenceTaggedParagraph, DecisionMakerMatrix, SubStreamSection, FundingPathwayBlock). `AnalyticalReadDocument` + markdown. Analytical tab. No new tool registration. | ~580 |
| **PR6 — Proposal Shell end-to-end** | Replace `proposeProposalShell` stub with real implementation. 4 Proposal primitives (FormalCover, ScopeBlock, CommitBoundaryBlock, RiskAllocationBlock). `ProposalShellDocument` + markdown. Proposal tab. No new tool registration. | ~480 |

**Total: ~2,990 LOC across 6 PRs.** (Down from ~3,250 original — KB compile pipeline removed, prompt simpler.)

PR1-2 are foundation. PR3 is the heart, registers the full 8-tool surface (with stubs for PR4-6 so the cache prefix stays stable across the remaining deploys), and gates everything else against the V1-scoped Prairie validation. PR4-6 only swap stub implementations for real ones — no tool definition changes — preserving prompt cache hits in production conversations across deploys.

### Post-MVP (deferred)
- **KB delivery strategy (V2).** Tool-callable lookups (`lookupFlag`, `lookupLens`, `lookupDocType`), scoped retrieval, or staged injection — design pending. This is the V1→V2 unlock for content specificity.
- **Few-shot Prairie exemplar in system prompt** for voice and structure locking once KB strategy is decided.
- **1h TTL cache point** if/when Sonnet 4.6 confirms support.
- H6: real fast model for thread titles (Bedrock Haiku).
- H7: trim `prompt-input.tsx`.
- N1/N2/N3: Lambda URL env var, dead-code removal, canary cleanup.
- Inline artifact editing.
- Token-level streaming inside Field Brief sections.
- Custom font embedding (Inter / Inter Tight / JetBrains Mono per brand spec).
- Artifact versioning to S3.
- Multi-brief threads (>1 opportunity per thread).

---

## 9. Anti-patterns to avoid

- ❌ Client posts markdown/payload to PDF endpoint — untrusted, no audit trail.
- ❌ Generic `{ title, markdown }[]` payload — forces post-hoc parsing, can't render brand primitives reliably.
- ❌ Persisting the markdown mirror separately — two sources of truth.
- ❌ Streaming follow-ons piecewise — they're composed one-shot post-positioning; no benefit.
- ❌ One mega-tool with kind discriminator — worse traces, harder debugging than focused tools.
- ❌ Dynamic skill loading — v2 skills are quality criteria in the system prompt, not runtime-loaded.
- ❌ Custom fonts in v1 PDF — Helvetica is the brand spec primary.
- ❌ Producing follow-ons proactively — spec says on-demand only.
- ❌ Markdown layer between agent and PDF renderer — agent emits typed payloads, renderers consume them directly.
- ❌ Rendering Proposal Shell with internal-handover voice — Proposal Shell is the ONE artifact the customer will read; formal voice required.
- ❌ **KB injected into system prompt in V1** — deferred per validation deltas (§3). Attention budget over cost optimization.
- ❌ **Mutating system prompt mid-thread for per-turn state** — use `<system-reminder>` in user message instead (§5.5). Preserves cache prefix.
- ❌ **Adding/removing tools between deploys mid-conversation** — PR3 registers all 8 tools with stubs so PR4-6 don't invalidate cache (§8).
- ❌ **Encoding the 9-skill sequence as prescriptive steps** — express as quality criteria + output contract instead (§3). Trust Claude to sequence its own reasoning.

---

## 10. Verify during execution

- [ ] Sonnet 4.6 via Bedrock accepts `providerOptions.bedrock.cachePoint` — if NOT, cost mode degrades but functionality intact.
- [ ] Sonnet 4.6 via Bedrock accepts `providerOptions.bedrock.reasoningConfig` for extended thinking — if NOT, disable thinking, ship without it, ship the rest.
- [ ] Sonnet 4.6 supports `cachePoint` TTL `'1h'` — if YES, upgrade from `'5m'` in PR2; if NO, stay on `'5m'`.
- [ ] `writer.write({ transient: true })` works inside Lambda stream context.
- [ ] `@react-pdf/renderer` bundles cleanly under Next 16 + Amplify Hosting build.
- [ ] Amplify Data `a.json()` accepts deeply nested payload shapes per artifact kind.
- [ ] Cognito auth in Next API route still works post-Lambda-migration (PDF endpoint reuses `getCurrentOwner` from existing pattern).
- [ ] Compact system prompt size — confirm well under 20k tokens (target ≤ 15k).
- [ ] Logo file resolution in Lambda + Next route environments (PNG bundled correctly).
- [ ] `ai-elements` `Reasoning` component installs cleanly under Next 16 + shadcn config and renders streamed thinking blocks.
- [ ] `<system-reminder>` prefix on user messages survives the AI SDK transport unchanged (no escaping, no mutation).
