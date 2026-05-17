# H2O Allegiant — Research Artefacts Index

**Project:** H2O Allegiant Discovery Agent (US wastewater BD)
**Scope of this folder:** Tier 1 enabling research outputs that form the canonical knowledge base for the agent's skills.
**Status:** All three research workstreams closed. Ready for skill construction.

This index is the entry point for anyone — Jose, Claude, or a downstream skill author — who needs to look up which file contains which knowledge. Read this before opening any individual file.

---

## File inventory

Eight files in this folder, organised by research workstream and version:

```
h2o-allegiant-research-a-v1_0-narrative.md         Research A v1.0 (Perplexity)
h2o-allegiant-research-a-v1_1-coverage.md          Research A v1.1 (Perplexity)
h2o-allegiant-research-b-v1_0-narrative.md         Research B v1.0 (Perplexity)
h2o-allegiant-research-b-v1_1-coverage.md          Research B v1.1 (Perplexity)
h2o-allegiant-research-b-v1_2-supplemental.md      Research B v1.2 (hand-written)
h2o-allegiant-research-c-v1_0-narrative.md         Research C v1.0 (Perplexity)
h2o-allegiant-research-c-v1_1-coverage.md          Research C v1.1 (Perplexity)
h2o-allegiant-research-c-v1_2-classification.md    Research C v1.2 (hand-written)
```

Naming convention: `h2o-allegiant-research-<X>-v<N>-<descriptor>.md` where `<X>` is `a` / `b` / `c`, `<N>` is the version, and `<descriptor>` indicates what's in the file (`narrative` for the primary Perplexity output, `coverage` for the YAML extraction passes, `supplemental` for hand-written gap closure, `classification` for the hand-written closing artefact).

---

## What each file contains

### Research A — Compliance and Safety Flag Taxonomy

**Purpose:** The full severity-classified flag taxonomy the agent consults when reading customer inputs (statements, photos, NPDES permits, eDMRs, lab analyses, consent decrees, NOVs). Defines what the agent flags, at what severity (`stop` / `specialist` / `attention`), with what evidence cue and what resolution path.

**Files:**

#### `h2o-allegiant-research-a-v1_0-narrative.md` (69 KB)
- Full narrative covering the four flag categories: cross-cutting compliance, permit-lifecycle and temporal pressure, operational and physical safety, evidence-quality
- Operational definition of the severity ratchet
- 12 `csflag-*` entities in YAML (the topical-level entities)
- 3 `reclass-*` entities re-classifying Research B lens-bound flags as cross-cutting
- 3 `bias-*` entities (customer bias patterns)
- 4 `temporal-*` entities (regulatory calendar events)
- Sources: eCFR, Federal Register, EPA programmatic pages, state agency documents

#### `h2o-allegiant-research-a-v1_1-coverage.md` (73 KB)
- 63 additional `csflag-*` entities, decomposed from the v1.0 narrative
- Per-subsection coverage at the 3–5-entity-per-narrative-section level
- Severity-range-to-two-entities discipline applied (where v1.0 narrative described "specialist or stop depending on context," v1.1 produced two distinct entities at the two severity levels)
- Coverage self-check confirms per-category minimums met

**Consolidated Research A totals:**
- **75** `csflag-*` entities (12 v1.0 + 63 v1.1)
- **3** `reclass-*` entities
- **3 + 8** `bias-*` entities (3 in Research A v1.0 + 8 in Research B v1.0)
- **4** `temporal-*` entities

**Severity distribution:** ~19% stop / ~44% specialist / ~37% attention.

**Category distribution:** ~29 cross-cutting / ~16 operational-safety / ~16 evidence-quality / ~14 permit-lifecycle-temporal.

---

### Research B — Specialist Lens Decomposition

**Purpose:** The seven specialist lenses that structure how the agent reasons about a wastewater opportunity. Each lens encodes the operator wisdom of a senior practitioner in that domain — what they ask in the first 30 minutes, what data they look for, what red flags trip their alarm.

**Files:**

#### `h2o-allegiant-research-b-v1_0-narrative.md` (95 KB)
- Lens decomposition test rationale (why seven lenses, not eight — emerging contaminants folded as cross-cutting concern)
- Sub-case structure within each lens (industrial direct/indirect, reuse non-potable/IPR/DPR, NRW AMI/leak/DMA-pressure, stormwater Phase I/II, decentralised single-lot/cluster/advanced)
- 7 `lens-*` entities defining each specialist lens
- 13 `profq-lens-*` entities (profile questions, fully populated for municipal-wet-weather and industrial-discharge only)
- 11 `data-lens-*` entities (data needs)
- 17 `flag-lens-*` entities (lens-specific red flags)
- 8 `bias-*` entities (customer self-reporting bias patterns)
- 46 sources

#### `h2o-allegiant-research-b-v1_1-coverage.md` (59 KB)
- 39 additional `profq-lens-*` entities expanding the five abbreviated lenses (advanced-reuse, NRW, biosolids-residuals, stormwater-MS4, decentralised-onsite)
- 30 additional `data-lens-*` entities
- 19 additional `flag-lens-*` entities

#### `h2o-allegiant-research-b-v1_2-supplemental.md` (15 KB, hand-written)
- 1 additional `profq-lens-*` entity (NRW finance-and-rate-link question to meet 8-per-lens minimum)
- 8 additional `flag-lens-*` entities — specifically, the stop-flag closures for four lenses that had no stop-flags after v1.1 (advanced-reuse, biosolids-residuals, stormwater-MS4, decentralised-onsite)
- Coverage self-check across all seven lenses
- Hand-verified citations: Maine LD 1911 / Verrill law firm / RIDOT consent decree / EPA septic system pages / California Title 22 DPR regulation

**Consolidated Research B totals:**
- **7** `lens-*` entities (one per lens)
- **53** `profq-lens-*` entities (13 v1.0 + 39 v1.1 + 1 v1.2) — at least 8 per lens minimum met
- **41** `data-lens-*` entities (11 v1.0 + 30 v1.1) — at least 6 per lens minimum met
- **44** `flag-lens-*` entities (17 v1.0 + 19 v1.1 + 8 v1.2) — at least 5 per lens minimum met for 5 of 7 lenses; 4 of 5 for the remaining two
- **8** `bias-*` entities (in v1.0)

**Lens coverage:** Every lens has at least 8 profile questions, 6 data needs, 4-6 red flags, and at least one stop-flag (the gate-closing severity). All seven lenses ready for `h2o-solution-lens-light` skill construction.

---

### Research C — Water Evidence Document Landscape

**Purpose:** The document reading manual the agent uses to extract structured information from formal documents — NPDES permits, eDMRs, consent decrees, lab analyses, ECHO records, water audits, master plans, sustainability reports, financing agreements. For each document type: how to read it, what to extract, what cross-checks to run, what gotchas to watch for, what gets lost when only summaries are available.

**Files:**

#### `h2o-allegiant-research-c-v1_0-narrative.md` (150 KB)
- 32 document types catalogued across 12 categories (regulatory, monitoring-compliance, enforcement, lab-analytical, operational, utility-side, reuse-specific, stormwater-specific, biosolids-specific, decentralised-specific, sustainability-esg, funding)
- 16 per-document reading-discipline subsections (Sections 2.1–2.16) with extraction fields, cross-checks, operator-wisdom insights, common gotchas, and what-summaries-lose
- 6 high-stakes claim evidence matrices (compliance posture, PFAS exposure, capacity adequacy, biosolids outlet viability, reuse project viability, NRW programme maturity)
- 7 `doc-*` entities in YAML
- 5 `xcheck-*` entities (cross-checks)
- 6 `claim-*` entities (high-stakes evidence matrices)
- 6 `docflag-*` entities (document-to-flag mappings)
- 34 sources

#### `h2o-allegiant-research-c-v1_1-coverage.md` (60 KB)
- 30 additional `doc-*` entities expanding to cover all 32 narrative-described document types plus 5 additional supporting documents (RMP filings, SDS, incident reports, decentralised failure reports, biosolids annual reports)
- 10 additional `xcheck-*` entities
- 12 additional `docflag-*` entities

#### `h2o-allegiant-research-c-v1_2-classification.md` (31 KB, hand-written)
- 75 `surface-csflag-*` entities classifying every Research A flag by surface channel (document / observation / conversation / multi-source)
- Skill-ownership map indicating which agent skill is responsible for surfacing each flag
- Consolidated Research C coverage self-check
- Resolves the architectural question of which skill owns which flag

**Consolidated Research C totals:**
- **37** `doc-*` entities (7 v1.0 + 30 v1.1) covering 32 document types from narrative
- **15** `xcheck-*` entities (5 v1.0 + 10 v1.1)
- **6** `claim-*` entities (all v1.0)
- **18** `docflag-*` entities (6 v1.0 + 12 v1.1) covering 40 unique flag IDs
- **75** `surface-csflag-*` entities (every Research A flag classified)

**Flag-surface distribution from Research C v1.2:**
- 35 document-surfaced flags → `h2o-water-evidence-interpretation` skill
- 10 observation-surfaced flags → `multimodal-intake` skill (future)
- 10 conversation-surfaced flags → conversational reasoning layer
- 20 multi-source flags → coordinated across skills

---

## YAML schema reference

The agent's skills will reference these entity types by ID. Schema reminders for skill authors:

### Research A schemas

```yaml
# csflag entity (compliance/safety flag)
- id: csflag-<kebab-case>
  flag_name: <human-readable>
  category: cross-cutting-compliance | permit-lifecycle-temporal | operational-physical-safety | evidence-quality
  severity: stop | specialist | attention
  applies_to_lenses: [lens-<id> ... or "all"]
  applies_to_subcases: [subcase-<id> ... or null]
  evidence_cue: <description>
  why_it_matters: regulatory | commercial | safety | operational
  resolution_path: <description>
  resolution_owner: agent | customer | specialist-in-assessment
  regulatory_environment_2025_specific: true | false
  superseded_research_b_flag: csflag-<id> | null
  source: <url>
  confidence: high | medium | low
  confidence_reason: <one-line>

# reclass, bias, and temporal entities have analogous schemas — see Research A v1.0 narrative for schema definitions.
```

### Research B schemas

```yaml
# lens entity (specialist lens definition)
- id: lens-<id>
  lens_name: <human-readable>
  archetype: <senior-operator role this lens encodes>
  description: <paragraph>
  sub_cases: [subcase-<id> ...]
  source: <url>

# profq-lens entity (profile question)
- id: profq-lens-<lens-id>-<kebab-case>
  lens: lens-<id>
  question_text: <natural-language question>
  customer_role_signals: <which customer role this works for, or "any">
  evidence_surfaced: <what evidence the answer provides>
  diagnostic_rank: 1 | 2 | 3 | null
  applies_to_subcase: subcase-<id> | null
  bias_calibration_notes: <how this question controls for optimism/alarmism>
  source: <url>
  confidence: high | medium | low

# data-lens entity (data needs)
- id: data-lens-<lens-id>-<kebab-case>
  lens: lens-<id>
  artefact_name: <document or data type>
  artefact_category: regulatory | operational | commercial | engineering | utility-rate | reuse-specific | biosolids-specific | stormwater-specific
  ideal_data: <description>
  realistic_first_call_ask: <description>
  cross_links_to_lenses: [lens-<id> ...]
  source: <url>
  confidence: high | medium | low

# flag-lens entity (lens-specific red flag)
- id: flag-lens-<lens-id>-<kebab-case>
  lens: lens-<id>
  flag_name: <human-readable>
  severity: stop | specialist | attention
  evidence_cue: <description>
  why_it_matters: regulatory | commercial | safety | operational
  resolution_path: <description>
  regulatory_environment_2025_specific: true | false
  applies_to_subcase: subcase-<id> | null
  source: <url>
  confidence: high | medium | low
```

### Research C schemas

```yaml
# doc entity (document type)
- id: doc-<kebab-case>
  name: <human-readable>
  category: regulatory | monitoring-compliance | enforcement | lab-analytical | operational | utility-side | reuse-specific | stormwater-specific | biosolids-specific | decentralized-specific | sustainability-esg | funding
  issued_by: <issuer>
  access_method: [<methods>]
  applies_to_lenses: [lens-<id> ...]
  applies_to_subcases: [subcase-<id> ... or null]
  structured_data_fields: [<fields>]
  operator_wisdom_reading_insights: [<insights>]
  common_gotchas: [<gotchas>]
  what_summaries_lose: [<missing-from-summaries>]
  realistic_first_call_ask: true | false
  source: <url>
  confidence: high | medium | low

# xcheck entity (cross-check)
- id: xcheck-<kebab-case>
  primary_document: doc-<id>
  cross_check_against: [doc-<id> ... or "customer-statement"]
  what_to_compare: <description>
  what_conflicts_indicate: <description>
  applies_to_lenses: [lens-<id> ...]
  applies_to_flags: [csflag-<id> ...]
  source: <url>
  confidence: high | medium | low

# claim entity (high-stakes claim evidence matrix)
- id: claim-<kebab-case>
  claim_topic: <e.g., compliance-posture, pfas-exposure>
  minimum_evidence_set: [doc-<id> ...]
  ideal_evidence_set: [doc-<id> ...]
  applies_to_lenses: [lens-<id> ...]
  notes: <description>
  source: <url>
  confidence: high | medium | low

# docflag entity (document-to-flag mapping)
- id: docflag-<kebab-case>
  document: doc-<id>
  surfaces_flags: [csflag-<id> | flag-lens-<id> ...]
  evidence_pattern_in_document: <what triggers the flag(s) in this document>
  source: <url>
  confidence: high | medium | low

# surface-csflag entity (flag-surface classification, v1.2 only)
- id: surface-csflag-<flag-name>
  flag: csflag-<id>
  surface_channel: document-surfaced | observation-surfaced | conversation-surfaced | multi-source
  primary_documents: [doc-<id> ...]              # populated when document is primary or contributing
  secondary_channels: [<channels>]                # populated for multi-source
  observation_cues: [<photo/site-observation descriptions>]   # populated for observation-surfaced
  language_patterns: [<customer-phrase patterns>] # populated for conversation-surfaced
  notes: <description>
```

---

## Skill consumption map

When each H2O Allegiant skill is built, this is which research files it depends on:

```
h2o-segmentation-router
├─ h2o-allegiant-research-b-v1_0-narrative.md       (lens definitions, decomposition reasoning)
└─ h2o-allegiant-research-b-v1_2-supplemental.md    (any stop-flag edge cases that affect routing)

h2o-solution-lens-light
├─ h2o-allegiant-research-b-v1_0-narrative.md       (lens narratives, sub-case structure)
├─ h2o-allegiant-research-b-v1_1-coverage.md        (profq/data/flag entities for the five expanded lenses)
└─ h2o-allegiant-research-b-v1_2-supplemental.md    (stop-flag closures, missing NRW question)

h2o-water-evidence-interpretation
├─ h2o-allegiant-research-c-v1_0-narrative.md       (per-document reading discipline, gotchas, cross-checks)
├─ h2o-allegiant-research-c-v1_1-coverage.md        (full doc-* / xcheck-* / docflag-* entity set)
└─ h2o-allegiant-research-c-v1_2-classification.md  (35 document-surfaced flags this skill is responsible for)

h2o-compliance-and-safety-flagging
├─ h2o-allegiant-research-a-v1_0-narrative.md       (severity ratchet definition, four flag categories)
├─ h2o-allegiant-research-a-v1_1-coverage.md        (75 csflag entities)
├─ h2o-allegiant-research-b-v1_2-supplemental.md    (8 stop-flag closures cross-referenced as cross-cutting candidates)
└─ h2o-allegiant-research-c-v1_2-classification.md  (which surface channel each flag uses)

h2o-discovery-gap-analysis (water-adapted from SecondStream)
├─ h2o-allegiant-research-b-v1_1-coverage.md        (data-lens entities define what data is missing)
└─ h2o-allegiant-research-c-v1_0-narrative.md       (Section 5 lens-to-document mapping for first-call asks)

h2o-qualification-gate (water-adapted from SecondStream)
├─ h2o-allegiant-research-a-v1_1-coverage.md        (stop-flag list determines what closes the gate)
├─ h2o-allegiant-research-b-v1_2-supplemental.md    (lens-bound stop-flags from supplemental pass)
└─ h2o-allegiant-research-c-v1_2-classification.md  (multi-source flag coordination logic)

h2o-commercial-shaping (water-adapted from SecondStream)
├─ h2o-allegiant-research-b-v1_0-narrative.md       (operator-wisdom for commercial framing per lens)
└─ h2o-allegiant-research-b-v1_1-coverage.md        (data-lens entities cover commercial inputs)

h2o-discovery-reporting (water-adapted from SecondStream)
└─ All eight files                                  (consolidates everything into Ideation/Analytical/Playbook outputs)

multimodal-intake (future, not in v1)
├─ h2o-allegiant-research-a-v1_1-coverage.md        (10 observation-surfaced flags this skill owns)
└─ h2o-allegiant-research-c-v1_2-classification.md  (observation_cues for each)
```

---

## Provenance and versioning

**v1.0 files** are Perplexity Deep Research outputs. Narrative quality is high; YAML coverage is partial.

**v1.1 files** are Perplexity coverage-completion passes that decompose the v1.0 narrative into full YAML coverage. Same source documents as v1.0; no new research.

**v1.2 files** are hand-written by Claude during the H2O Allegiant build session. They close specific gaps that the Perplexity passes did not address — Research B's missing stop-flags (verified against primary regulatory sources during writing) and Research C's flag-surface classification (architectural artefact that maps every Research A flag to the skill responsible for surfacing it).

**Updates to these files** should preserve the version-numbered structure. New material that supplements existing coverage gets a `v1.3-` (or higher) supplemental file rather than overwriting prior versions. New research workstreams get new `research-d`, `research-e`, etc. designations.

---

## Known limitations (carry forward to skill construction)

1. **The 2025 regulatory environment is contested.** PFAS NPDWR rule, Coal Ash Legacy Rule, ELG pipeline statuses have shifted in 2025. The agent must verify rule status against current Federal Register notices before relying on the regulatory_environment_2025_specific flags in the YAML.

2. **State-level rule variability is sampled, not exhaustive.** Research A and C cover representative states (CA, ME, TX, FL, MA, NJ, NY, MI, WA) for state-specific rules. State-by-state exhaustiveness is a future workstream if the agent's geographic coverage demands it.

3. **Two lenses (municipal-wet-weather and industrial-discharge) have 4 red flags instead of the 5-flag minimum.** Both have strong stop-flag coverage (2 each) and were the most thoroughly developed lenses in Research B v1.0. The one-flag shortfall is documented and can be closed in a future v1.3 supplemental if surfaced as a gap during skill construction.

4. **POTW local limits are not centrally databased.** Research C documents how to read POTW pretreatment documents, but local limits live in individual POTW program materials. The agent must request these directly from the customer or POTW.

5. **The flag-surface classification's multi-source category requires orchestration logic.** 20 of the 75 Research A flags require coordination across two or more agent skills before they're fully surfaced. The agent's orchestration layer (when built) must coordinate inputs before treating multi-source flags as open or closed.

---

## Status summary

```
TIER 1 ENABLING RESEARCH:                             ✅ CLOSED
  Research A (75 flags + 3 reclassifications + bias + temporal)
  Research B (7 lenses + 53 profile questions + 41 data needs + 44 red flags + 8 bias)
  Research C (37 doc types + 15 cross-checks + 6 high-stakes claims + 18 docflag mappings + 75 surface classifications)

SYSTEM PROMPT v0.1                                    ✅ LOCKED (seven lenses)

SKILLS:                                               ⏳ Build in dependency order
BRAND KIT:                                            ⏳ After skill prototypes
```

---

*Index version 1.0. Generated 2026-05-13. Maintainer: H2O Allegiant build session.*
