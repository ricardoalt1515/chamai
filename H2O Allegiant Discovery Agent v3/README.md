# H2O Allegiant Discovery Agent — v3

A Claude-based intelligence layer for US wastewater BD field agents. Produces a **four-artefact opportunity package** — Field Brief, Playbook, Analytical Read, Proposal Shell — that compresses deal-flow time by giving the field agent a defended position framed on the customer's economics before every conversation.

**v3 is the speed and packaging release.** Same output design as v2, faster production model, and all four artefacts produced automatically instead of on-demand.

See `ARCHITECTURE_NOTES.md` for the v2 → v3 architectural rationale and migration guide.

## What's in this package

```
H2O Allegiant Discovery Agent v3/
├── README.md                                      ← This file
├── ARCHITECTURE_NOTES.md                          ← Architectural rationale + v2→v3 migration
├── h2o-allegiant-system-prompt-v3.md              ← System prompt (paste into Project custom instructions)
├── h2o-allegiant-brand-brand.py                   ← Brand kit
├── h2o-allegiant-brand-test.pdf                   ← Visual verification of every brand primitive
├── h2o_allegiant_logo_transparent.png             ← Brand logo (transparent PNG, used at runtime)
├── h2o_allegiant_logo.svg                         ← Brand logo (SVG fallback)
│
├── H2O Allegiant Skills/                          ← 5 skills (down from 9 in v2)
│   ├── h2o-evidence-and-context-SKILL.md          ← NEW (replaces 4 v2 skills)
│   ├── h2o-stage-and-gaps-SKILL.md                ← NEW (replaces 2 v2 skills)
│   ├── h2o-positioning-SKILL.md                   ← Updated (stop conditions, v3 references)
│   ├── h2o-field-brief-SKILL.md                   ← Updated (always-four-PDFs, staged delivery)
│   └── h2o-allegiant-brand-SKILL.md               ← Unchanged
│
├── H2O Allegiant Knowledge Base/                  ← Unchanged from v1.1
│   ├── INDEX.md
│   └── research-a/b/c (75 flags, 7 lenses, 37 document types)
│
└── Reference/                                     ← Design artefacts (not consumed at runtime)
    ├── h2o-field-brief-SPEC.md                    ← Field Brief design specification
    ├── prairie_field_brief_example.pdf            ← Validated worked example (Prairie AeroSurface)
    └── render_field_brief.py                      ← Renderer that produced the Prairie example
```

## Quick install

1. **Create a Claude Project** for H2O Allegiant Discovery Agent (or open the existing one).
2. **Paste the system prompt** (`h2o-allegiant-system-prompt-v3.md`) into the Project's custom instructions.
3. **Upload the skills** in `H2O Allegiant Skills/` as installable `.skill` files. **If migrating from v2**, first delete v2's `h2o-segmentation-router`, `h2o-water-evidence-interpretation`, `h2o-solution-lens-light`, `h2o-compliance-and-safety-flagging`, `h2o-deal-stager`, `h2o-discovery-gap-analysis`. Replace with v3's `h2o-evidence-and-context` and `h2o-stage-and-gaps`.
4. **Upload the knowledge base** files in `H2O Allegiant Knowledge Base/` into the Project's knowledge base. (Unchanged from v1.1/v2 — if you have these already, skip.)
5. **Upload the brand kit** (`h2o-allegiant-brand-brand.py`) and both logo files to the Project's file storage. The brand kit and logo files must be in the same directory at runtime for the logo to render.

## What the agent produces

**On opportunity-advancing turns** (case file uploaded, new evidence, explicit Field Brief request, stage change):

Four PDFs, presented in staged order:
1. **Field Brief** (1-2 pages) — strategic decision aid, presented first
2. **Playbook** (1-2 pages) — themed question structure
3. **Analytical Read** (3-6 pages) — evidence-tagged write-up for managers
4. **Proposal Shell** (1-5 pages) — scoping-language seed; content scales with stage

**On focused conversational turns** ("what's the F006 exposure?", "is this a CWSRF candidate?"):

Chat reply only. No new PDFs. The skill pipeline is skipped via the system prompt's fast path.

**On-demand lightweight outputs** (explicit request):

- Follow-up email drafts (PDF or markdown depending on length)
- Site-visit prep checklists (single-page PDF)
- Objection responses (markdown in-chat)

## The Field Brief

The Field Brief is the durable agent output and the field agent's primary read. Four sections:

1. **What this is** — situation, with the reframe surfaced
2. **What we'd propose** — recommended approach, win-win argument, **fully-priced cost of the customer's alternative** (the executive headline), deal-size sensitivity
3. **What could kill it** — 2-3 ranked kill risks
4. **Do this next** — 3 time-bound actions, action #1 always stage-advancing

The brief frames the deal on the customer's economics, not ours. The cost-of-alternative table is what wins the deal — without it, our proposal looks like overengineering against a competitor's cheaper line item.

See `Reference/prairie_field_brief_example.pdf` for the canonical worked example. Every future brief should match its visual rhythm and section structure.

## Internal handover only

All artefacts are for the BD field agent. Never customer-facing in final form. The Proposal Shell is customer-facing in *draft intent* — the field agent edits it before sending. Categories instead of vendor/decision-maker names. Directional sizing instead of firm pricing. Roles instead of specifics. The agent flags what Assessment-mode work will need; it does not do Assessment-mode work itself.
