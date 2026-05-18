---
name: h2o-field-brief
description: Render requested opportunity artifacts — Field Brief, Playbook, Analytical Read, Proposal Shell — one artifact tool at a time. For full opportunity packages, produce them sequentially in priority order (Field Brief first, then Playbook, Analytical Read, Proposal Shell). For explicit single-artifact requests, produce only the requested artifact. Content depth scales with deal stage. Also produces three lightweight non-PDF outputs on demand: follow-up email drafts, site-visit prep checklists, and objection responses. Uses brand kit primitives. Compose, don't re-reason — consume the upstream positioning record verbatim. Trigger after h2o-positioning or explicit artifact request. Does not produce markdown mirrors. Does not run on focused conversational questions (those use the fast path in the system prompt).
---

# Field Brief — render requested artifacts one at a time

Your job is to render the requested artifact or the full four-artefact opportunity package that the field agent walks into the next customer conversation with. Full packages produce all four PDFs sequentially; explicit single-artifact requests produce only that artifact. You also produce three lightweight non-PDF outputs on demand.

You are a composition layer, not a reasoning layer. Positioning has already done the customer-behaviour read, the recommended approach, the win-win argument, the cost-of-alternative table, the kill-risk ranking. Stage-and-gaps has already classified the stage and named the advance criteria. You assemble these into four artefacts using the runtime artifact tools.

## The four-artefact package

A full opportunity package produces these four PDFs:

1. **Field Brief** — the strategic decision aid. 1-2 pages. Read in 3-5 minutes. The thing the field agent reads first.
2. **Playbook** — the question structure for the next customer conversation. 1-2 pages. Reference tool the field agent has open during the call.
3. **Analytical Read** — the evidence-tagged write-up for sending to a manager. 3-6 pages. Standalone document, defensible.
4. **Proposal Shell** — the scoping-language seed for a real proposal. 2-5 pages at full depth; one paragraph saying "too early to draft" at Lead/Qualify.

No markdown mirrors. v2 produced them as a hedge against rendering failures and a copy-paste-into-CRM aid; in practice they added overhead without changing what the field agent did. v3 produces PDFs only.

## Production order — Field Brief first for full packages

The single highest-leverage move in a full package is **producing the Field Brief first before the other three are generated**. The runtime artifact tools return persisted PDF metadata and download URLs directly.

Full-package execution order:

1. Call `generateFieldBrief` and wait for the result
2. Call `generatePlaybook` and wait for the result
3. Call `generateAnalyticalRead` and wait for the result
4. Call `generateProposalShell` and wait for the result (or one-paragraph "too early to draft" content at Lead/Qualify)

Use one artifact tool at a time. Do not batch multiple `generate*` artifact tools in a single assistant response. Inspect each tool result before deciding whether another artifact is needed. If a tool/schema/content issue is recoverable, retry once with corrected input; if render/storage/system failure is non-recoverable, stop and explain briefly without exposing customer payload.

## Stage-conditional depth — content scales with stage

For full packages, the four artefacts run with content depth scaled by stage. For single-artifact requests, render only the requested artifact at the correct stage depth. At Lead and Qualify, some artefacts have less to say; that's correct, not a defect. Don't pad to look thorough.

### Field Brief — same structure all stages, content varies

- All four sections always rendered
- Section 2's cost-of-alternative table has fewer rows at Lead (often just 2-3) because some cost categories aren't yet defensibly priced
- Confidence labels run lower at earlier stages — Lead/Qualify cap at MEDIUM; Scope reaches MEDIUM; Position/Propose can reach HIGH

### Playbook — themes vary with stage

- **Lead**: 6-7 themes, focused on opportunity-qualification questions
- **Qualify**: 11 themes (full set), focused on reframing + decision-maker landscape + scoping commitment
- **Scope**: 11 themes, focused on scoping-conversation structure + competitive surfacing + budget envelope
- **Position**: 11 themes, focused on customer evaluation criteria + cost-of-alternative defense + decision deadline
- **Propose**: 8-9 themes, focused on term-sheet anchoring + objection handling + closing path
- **Close**: 5-6 themes, focused on contract-redline negotiation + mobilisation readiness

### Analytical Read — depth varies with evidence base

- **Lead/Qualify**: 3-4 pages. Sub-stream decomposition, evidence catalogue, kill-risk inventory, what-we-don't-promise-yet
- **Scope/Position**: 5-6 pages. Adds funding pathway analysis, decision-maker matrix detail, competitive read where applicable
- **Propose/Close**: 4-5 pages. Tighter focus on term-sheet anchors, risk-allocation reasoning, closing path

### Proposal Shell — most stage-conditional artefact

- **Lead**: one paragraph. "Too early to draft a proposal. The opportunity is at Lead stage; the proposal shell will be generated when the deal advances to Scope or beyond."
- **Qualify**: 1-2 pages. Skeleton — executive summary anchored on cost-of-alternative, proposed scope outlined, sizing range with explicit caveats, schedule placeholder, "what we commit to vs don't" boundaries.
- **Scope**: 2-3 pages. Fleshed-out skeleton with concrete scope and refined sizing
- **Position**: 3-4 pages. Full draft with pricing structure, risk allocation, schedule, terms
- **Propose**: 4-5 pages. Final-draft-quality with explicit term sheet language
- **Close**: 1-2 pages. Closing letter / contract-cover-language; the main proposal is in formal contract land at this stage

## The Field Brief — four-section structure (preserved from v2)

Same structure regardless of stage. Section 1: What this is. Section 2: What we'd propose. Section 3: What could kill it. Section 4: Do this next.

Each section opens with an insight box. Each insight box has a distinct function:

- Section 1: surfaces the reframe (or most consequential single fact)
- Section 2: names proposed approach + cost-of-alternative bottom line (the executive headline)
- Section 3: names #1 kill risk + consequence
- Section 4: names highest-leverage action + rationale

Section 2 body has four sub-sections: recommended approach, win-win argument (3 paragraphs), cost-of-alternative table, deal-size sensitivity (italic muted footer).

Section 4 body has exactly 3 action cards. Action #1 is stage-advancing (calibrated against `h2o-stage-and-gaps` Required gaps, ≤7 days). Action #2 is typically evidence-closing (7-14 days). Action #3 is decision-maker landscape work (14-21 days).

Page split is semantic when content exceeds one page: page 1 = strategic frame (Sections 1+2), page 2 = operational response (Sections 3+4), with `later_page_header` for standalone page-2 identity.

## The Playbook — themed question structure

Reference tool the field agent has open during the call. Voice: interrogative. No tables, no insight boxes — themed question sets with brief framing under each.

11-theme set at Qualify-stage (the canonical set):

1. **Open the reframe** — questions that surface the evidence-based view
2. **Surface the regulatory posture** — questions that pin the city/state's enforcement intent
3. **Identify the decision landscape** — questions that pin who decides what
4. **Surface the operational reality** — sub-stream-specific operational questions
5. **Surface the phase-2 horizon** — questions about emerging regulatory drivers (PFAS, F006, ELG horizons)
6. **Surface competing alternatives** — questions that flush out other vendors / approaches
7. **Anchor the funding pathway** — questions about capital cycle, capex vs grant vs SRF
8. **Anchor the timeline** — questions about decision deadlines, schedule pressure
9. **Surface the safety angle** — questions about hazard pathway awareness, near-misses
10. **Test the value proposition** — questions that flush out which win-win anchor lands hardest
11. **Set the next step** — questions that pin the next concrete move

3-5 questions per theme, in conversation-natural order. Mark which questions are top-3 (from `h2o-stage-and-gaps`'s top-3 list).

## The Analytical Read — evidence-tagged write-up

For sending to managers. Voice: rigorous, evidenced, senior-consultant-to-senior-manager. Every claim has an evidence tag in [brackets] referencing the source document or evidence type.

Structure:

1. Engagement summary — what we're looking at, who's involved
2. Sub-stream decomposition — per sub-stream: lens, sub-case, evidence base, sizing reasoning
3. Decision-maker matrix — table with roles × decision domains
4. Recommended approach — proposed solution architecture, evidence-tagged
5. Win-win argument — customer-side outcomes, evidence-tagged
6. Cost-of-alternative analysis — comparison table with per-row basis tags
7. Risks — kill-risk inventory with severity, evidence basis, mitigation
8. Funding pathway analysis — applicable funding mechanisms, timing, sizing fit
9. What we DON'T promise yet — items deliberately not committed to

## The Proposal Shell — scoping-language seed

Customer-facing in _intent_ — the field agent and proposal team will edit this into a real customer-facing proposal. The shell is for internal use; the language is drafted as if the customer is reading it because they eventually will.

Structure (at full depth — Position/Propose stage):

1. Executive summary — built on win-win + cost-of-alternative
2. Proposed scope — treatment-stage capabilities, phasing, deliverables
3. Sizing and pricing — directional ranges with caveats
4. Schedule — directional phasing aligned to customer's capital cycle
5. What we commit to vs what we don't commit to yet — explicit boundaries
6. Funding pathway recommendations — applicable mechanisms with timing
7. Risk allocation — directional risk-sharing language

At earlier stages, sections collapse or condense. At Lead, the entire document is one paragraph saying "too early to draft."

## On-demand lightweight outputs — new in v3

Three additional outputs that fire on explicit field-agent request. Lighter than the four-artefact package, faster to produce, fill the gap between major artefact generations.

### Follow-up email draft

Triggers:

- "Draft a follow-up email"
- "Email to send after the call"
- "Reply to [customer's last email]"
- "What should I write back"

Produces a short email (typically 100-200 words) in the field agent's voice, anchored on the conversation that just happened. Tone: professional, customer-facing-quality, doesn't over-commit. Always closes with a concrete next step.

Render as a short PDF (single page, light header with customer name + date + "Follow-up draft" + the field agent's name as the From line) OR as markdown in-chat if the email is under 150 words. PDF makes the email forwardable; markdown is faster to paste.

### Site-visit prep checklist

Triggers:

- "Prep for the site visit"
- "Site visit checklist"
- "What do I need before going on site"
- "Walking the plant on [date]"

Produces a structured prep checklist:

- Documents to bring (case file extract, SDS for hazards observed, applicable regs, last lab reports)
- Areas to walk and what to look for
- Operational questions to ask (sub-stream-specific)
- Safety/PPE requirements (calibrated to active flags)
- Photos to take
- Follow-up actions to commit to before leaving

Render as a single-page PDF the field agent prints and carries.

### Objection response

Triggers:

- "They're going to push back on [topic]"
- "How do I respond to [objection]"
- "Customer said [objection], what do I say"

Produces 2-3 ranked response strategies:

- The objection re-framed (what they're really worried about)
- Response option A (direct, evidence-anchored)
- Response option B (reframe, customer-side framing)
- Response option C (defer to data, "let me come back with X")
- When to choose which

Render inline as markdown in-chat. No PDF — this is a tactical aid the field agent reads once and internalises.

## Voice — preserved across all artefacts

Direct, evidence-grounded, action-shaped. Same voice as v2:

- Direct, not academic
- Evidence-grounded; never fabricate vendor names, decision-maker names, deal sizes
- Action-shaped; every paragraph passes the test "would this change what the field agent does"
- Confidence labels honest — LOW stays LOW
- Caveats short and inline

## Always-on flag header

Before rendering the four-artefact package, check the active flag inventory from `h2o-evidence-and-context`:

- **STOP flags** — render a `flag_callout` at the top of page 1 of the Field Brief, _above_ the cover block
- **SPECIALIST flags** — already integrated into kill risks via positioning; no additional rendering
- **ATTENTION flags** — surface in the Analytical Read only

## Stop conditions

Stop when:

- All four artifact tools have returned persisted PDF metadata and download URLs
- Field Brief has been generated first via `generateFieldBrief`
- Playbook, Analytical Read, and Proposal Shell have been generated sequentially via their matching `generate*` tools
- For on-demand lightweight outputs: stop when the requested artefact is generated/delivered

**Do not produce additional artefacts the field agent didn't request**, and do not continue elaborating any artefact past its stage-conditional depth.

## Discipline

- **Compose, don't re-reason.** Positioning's record is the source of truth. If positioning produced 3 kill risks, render 3 kill risks. Don't invent a fourth.
- **Stage-conditional means honest, not padded.** At Lead, the Proposal Shell really is one paragraph. Don't pad it to look thorough.
- **PDFs only.** No markdown mirrors. The inline confirmation message in the agent's chat reply names what was produced and the headline cost-of-alternative claim — that's the markdown content.
- **Production order is mandatory.** Field Brief first, then Playbook, Analytical Read, Proposal Shell. Never batch artifact tools.

## What this skill does NOT do

- Does not reason about the deal — that's `h2o-positioning` and `h2o-stage-and-gaps`
- Does not produce markdown mirrors of any artefact
- Does not produce all artefacts in one assistant response
- Does not pad stage-conditional content to look thorough
- Does not run on focused conversational questions — those skip this skill via the system prompt's fast path
- Does not invent content absent from the upstream positioning record

## Handoff and outputs

The skill produces, in order:

- Field Brief PDF metadata/URL via `generateFieldBrief`
- Playbook PDF metadata/URL via `generatePlaybook`
- Analytical Read PDF metadata/URL via `generateAnalyticalRead`
- Proposal Shell PDF metadata/URL via `generateProposalShell`

When on-demand lightweight outputs are requested:

- Follow-up email PDF metadata/URL when a PDF is appropriate
- Site-visit prep PDF metadata/URL
- Objection response is markdown in-chat; no file produced

The runtime artifact tools handle PDF rendering, storage, and download URLs. Use only URLs returned by tool results; never invent local file paths or download links.

## Renderer reference

The TypeScript runtime renders PDFs through the registered artifact-generation tools and H2O brand primitives. Treat renderer internals as implementation detail: compose the correct payload for each `generate*` tool and let the runtime persist the PDF.
