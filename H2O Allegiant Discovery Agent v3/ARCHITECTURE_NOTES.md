# H2O Allegiant Discovery Agent — Architecture Notes

These notes document the architectural rationale of the agent for future maintainers. They are NOT consumed at runtime — the runtime prompt is `h2o-allegiant-system-prompt-v3.md`. This document is for the human picking up the build six months from now and asking "why is it like this?"

## v3 — the speed and packaging release

v3 was motivated by two pieces of field feedback against v2:

1. **The on-demand follow-on model created friction.** v2 produced only the Field Brief automatically; Playbook / Analytical / Proposal Shell required explicit requests. In practice the field agent wanted all four every time and had to ask three times to get them. The on-demand model was correct in principle (reduce per-turn output overhead) but incorrect in practice (the friction of asking was greater than the cost of always-producing).
2. **The agent ran slowly.** Each substantive turn ran nine sequential skills, each producing comprehensive structured output. Most of what the early-pipeline skills produced wasn't independently consumed downstream — it all fed into positioning's integrated reasoning. The skill granularity was making the agent slow without making the output better.

### What changed in v3

**Skill consolidation: 9 → 6 skills.** Four v2 skills (`h2o-segmentation-router`, `h2o-water-evidence-interpretation`, `h2o-solution-lens-light`, `h2o-compliance-and-safety-flagging`) collapsed into one (`h2o-evidence-and-context`). Two v2 skills (`h2o-deal-stager`, `h2o-discovery-gap-analysis`) collapsed into one (`h2o-stage-and-gaps`). The remaining three skills (`h2o-positioning`, `h2o-field-brief`, `h2o-allegiant-brand`) are preserved with minor updates.

The consolidation isn't about removing capabilities — every piece of v2's analytical scope is preserved in the consolidated skills. The change is about how many separate reasoning passes the agent makes over the same evidence base. v2 made 5 passes; v3 makes 2.

**Production model inverted: on-demand → always-four-PDFs.** v3 produces all four artefacts (Field Brief, Playbook, Analytical Read, Proposal Shell) automatically on every opportunity-advancing turn. The lightweight outputs (follow-up email, site-visit prep, objection response) remain on-demand because their triggering depends on field-agent context the agent can't infer.

**Production order discipline.** Field Brief renders first and is presented via `present_files` immediately. The other three render and are presented in a second `present_files` call. The staged presentation is the perceived-speed win — the field agent sees the Field Brief within seconds, then reads it while the other three trickle in.

**Stage-conditional depth.** The four-artefact structure is constant; content depth scales with stage. At Lead the Proposal Shell is one paragraph saying "too early to draft"; at Propose it's a full draft. Same artefact, different depth.

**Markdown mirrors cut.** v2 produced markdown alongside every PDF. In practice the field agent forwards PDFs and copy-pastes from the in-chat conversation; the markdown was extra rendering overhead that wasn't being used.

**Fast path for conversational turns.** Focused questions ("what's the F006 exposure here?", "is this a CWSRF candidate?") skip the skill pipeline and answer from existing context. The Field Brief is regenerated only on explicit request, new evidence upload, or stage change.

**Three new lightweight outputs.** Follow-up email drafts, site-visit prep checklists, and objection responses fill the gap between major artefact generations. Field agents do these all the time; v2 shoehorned them into the Field Brief's "Do this next" section. v3 makes them first-class.

**System prompt slimmed.** From 175 lines (v2) to 147 lines (v3). The reduction is from removing historical/changelog content — that content moved here. The runtime prompt is now behavioural authority only.

**Lean-forward includes lower-scope, delay, and poor-fit.** v2's lean-forward principle could be read as "always sell more." v3 explicitly names that lean-forward includes recommending a smaller phase 1, a delay until regulatory clarity, or naming the opportunity as a poor fit. The recommendation is to the field agent; the field agent decides.

### What did NOT change in v3

- The customer-side framing / cost-of-alternative argument (the core architectural win from v2)
- The Field Brief design (validated with the Prairie hand-build)
- The brand kit primitives (LogoMark, StageBadge, InsightBox, cost-of-alternative table, etc.)
- The deal-stage model (Lead → Qualify → Scope → Position → Propose → Close, always-advance, first-class regression)
- The lens cheat-sheet and per-lens unit economics
- The knowledge base (75 flags, 7 lenses, 37 document types — unchanged from v1.1)
- The engagement boundary rule (separate Field Briefs only when both decision-makers AND procurement vehicles differ)

### v3 skill map

| v3 skill | v2 equivalent(s) | What changed |
|---|---|---|
| `h2o-evidence-and-context` | `h2o-segmentation-router` + `h2o-water-evidence-interpretation` + `h2o-solution-lens-light` + `h2o-compliance-and-safety-flagging` | Single integrated pass instead of four sequential ones |
| `h2o-stage-and-gaps` | `h2o-deal-stager` + `h2o-discovery-gap-analysis` | Merged because gap analysis is intrinsically stage-conditional |
| `h2o-positioning` | `h2o-positioning` | Stop conditions added; upstream references updated; output now serves four artefacts not one |
| `h2o-field-brief` | `h2o-field-brief` | Always-four-PDFs model; staged `present_files`; stage-conditional depth; markdown mirrors removed; three new lightweight outputs added |
| `h2o-allegiant-brand` | `h2o-allegiant-brand` | Unchanged (v2 brand kit promotion already done) |

## v2 — the customer-economics release

v2 was motivated by field feedback on v1.2's Prairie AeroSurface test: "Not valuable yet — the agent went conservative, deferred commercial PDFs when the gate was CLOSED, produced only a markdown annex." The architectural diagnosis: v1.2's gate model produced silence when it should have produced a position.

### What changed in v2

- **Stage model replaced gate model.** OPEN/CLOSED → six pipeline stages with always-advance plus first-class regression handling.
- **Customer-side framing made mandatory.** The Field Brief leads with the win-win argument and the fully-priced cost of the customer's alternative. Selling without it loses deals.
- **Lean-forward replaced evidence-conservatism.** Always commit to a position with confidence labels; never "deferred until evidence supports."
- **Output model inverted from v1.2.** v1.2 always produced three engagement-level PDFs; v2 always produced one (Field Brief) with three on-demand follow-ons. (v3 re-inverted to always-four.)
- **Brand kit primitives expanded.** New primitives for the Field Brief: `LogoMark`, `StageBadge`, `InsightBox`, `cost_of_alternative_table`, `kill_risk_card`, `action_card`, `cover_block`, `later_page_header`, `build_field_brief_templates`.

### v2 → v3 skill migration

If you have a v2 installation and want to migrate to v3:

1. Delete v2's `h2o-segmentation-router-SKILL.md`, `h2o-water-evidence-interpretation-SKILL.md`, `h2o-solution-lens-light-SKILL.md`, `h2o-compliance-and-safety-flagging-SKILL.md`. Install v3's `h2o-evidence-and-context-SKILL.md` in their place.
2. Delete v2's `h2o-deal-stager-SKILL.md`, `h2o-discovery-gap-analysis-SKILL.md`. Install v3's `h2o-stage-and-gaps-SKILL.md`.
3. Replace v2's `h2o-positioning-SKILL.md` and `h2o-field-brief-SKILL.md` with v3's versions.
4. Replace the system prompt with v3's.
5. The brand kit (`h2o-allegiant-brand-brand.py`) and knowledge base are unchanged.

## v1.2 — the engagement-based delivery release

v1.2 introduced the engagement-boundary rule (separate artefact sets only when both decision-makers AND procurement vehicles differ) and produced three engagement-level PDFs (Ideation Brief, Analytical Read, Playbook). The Prairie validation failed and triggered the v2 redirect.

## v1.1 — the renaming release

Added the `h2o-` prefix to all skills (376 cross-references updated).

## v1.0 — the initial architecture

8 skills, brand kit, system prompt, research knowledge base (75 flags, 7 lenses, 37 document types).

## Validated worked example

`Reference/prairie_field_brief_v2.pdf` is the canonical worked example of the Field Brief design. Developed through three rounds of feedback against the Prairie AeroSurface case:

1. First pass — established the four-section structure with insight boxes
2. Second pass — added the real logo, restructured Section 2 to lead with the proposed solution architecture, added value-drivers table
3. Third pass — added the win-win argument and the cost-of-alternative comparison table

Every future Field Brief should match this example's visual rhythm, section structure, and voice. The Prairie case is the validation anchor — if a future architectural change makes the Field Brief render worse than this example, the change should be reconsidered.

The example was rendered against v2 architecture but the design — four sections, insight boxes, cost-of-alternative table, two-page semantic split — is preserved in v3. v3 just produces this brief faster and produces the other three artefacts alongside it.
