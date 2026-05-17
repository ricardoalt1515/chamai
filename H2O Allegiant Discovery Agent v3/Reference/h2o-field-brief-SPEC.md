# H2O Allegiant — Field Brief Specification (v2 DRAFT)

## What the Field Brief is

A one-to-two-page decision aid for a BD field agent's next move on a wastewater opportunity. Read in 3–5 minutes. Always produced. Always action-shaped, never comprehension-shaped.

It exists in service of one outcome: **the field agent walks into their next customer conversation calibrated, confident on the deal's directional shape, clear on what we'd propose, clear on why the customer should want it, and clear on what to do next**.

The Field Brief takes a position — but the position is built on the *customer's* economics, not ours. It commits to (a) what we'd actually propose at this stage, named with treatment-stage capabilities, (b) why the customer should want it (their compliance outcomes, their latent risk reduction, their operational burden), (c) the fully-priced cost of their alternative — including avoided penalties, future-forced retrofits, and risk-adjusted enforcement exposure — so the deal can be defended on the customer's books, (d) what could kill the deal, and (e) what to do next.

This is the difference between selling and advising. An advisor wins the deal because their proposal is *demonstrably* the best path for the customer when everything is priced in. That wins year-1 capex, year-2 renewal, and the referral. Selling without the cost-of-alternative analysis wins fewer deals and burns trust on the ones it wins.

The field agent can refine any of these in conversation; the point is they walk in with a defended position, not a question.

## What the Field Brief is not

- An audit trail (that's the Analytical Read, on-demand)
- A question list (that's the Playbook, on-demand)
- A regulatory primer
- A solution architecture document
- A flag inventory
- A gap list
- An evidence catalogue

If any of these creep in, the brief is failing. The discipline is brutal.

## Structure — four sections, exact order

### Section 1 — What this is

3-4 sentences. Calibrates the field agent on the actual situation. The most consequential thing they don't yet realise goes here, named explicitly.

**Includes:** lens and sub-case, customer's framing vs evidence reality (when they diverge), deal stage. **Excludes:** every fact that doesn't change the next action.

### Section 2 — What we'd propose

The heart of the brief at Qualify stage. The proposed solution architecture (named treatment-stage capabilities), the customer-side argument for why this is the right path for them, and the explicit pricing of their alternative so the field agent walks in able to defend the deal on the customer's economics, not ours.

Four components in order:

1. **Recommended approach (anchor):** named capabilities — what we'd actually build. Specific enough that the field agent can defend a technical position in the conversation. E.g., "Cr⁶⁺ reduction (bisulfite, upstream of hydroxide), two-stage alkaline-chlorination cyanide destruction with segregation from acid streams, hydroxide precipitation re-tuned for the Ni/Zn/Cu mix, and EQ-tank slug control." Sized with capex range and timeline anchored to the proposed architecture. Phase-2 prize named if applicable.

2. **Why the customer should want this — the win-win argument:** three short bold-led paragraphs explaining what changes for *them*. The lens here is customer-side, not seller-side. Typical anchors: permanent compliance vs band-aid, latent regulatory exposure handled before it becomes a forced retrofit, safety risk neutralised, operational burden reduced, asset/uptime protected, recurring surcharges eliminated. This section is where Vallar earns the trust that wins year-2 renewal and referrals — not by selling more, but by being honest about the customer's outcomes.

3. **Cost of the alternative — fully priced over 5 years:** a 2-column comparison table showing the customer's BATNA (typically a cheap point-fix or do-nothing) *fully priced* against our proposal. Rows include capex, ongoing surcharges, latent compliance retrofits forced by future regulation, risk-adjusted enforcement exposure, safety incident exposure. The bottom-line row shows the 5-year mid-range total for each path with colour coding — alternative total in red (FLAG_STOP), our total in green (GATE_OPEN). This is the executive number that wins the deal. *Without this table, the customer compares $300K to our $3-8M and we look like overengineering. With this table, the customer compares ~$4-7M (theirs, fully priced) to ~$3-7M (ours, risk extinguished) and we win on their economics.*

4. **Deal-size sensitivity:** a small muted italic footer noting what moves us within our own range (scope of redesign, phase-2 commitment, recurring contracts). This is seller-side intelligence — useful for the field agent to spot scope-expansion opportunities in conversation, but deliberately subordinate to the customer-side argument above.

The insight box at the top of this section names the proposed approach AND the cost-of-alternative claim in one tight sentence. E.g., "Pretreatment redesign... $3-8M over 18 months. **Their $300K alternative costs them ~$4-7M over 5 years when surcharges, the forced PFAS retrofit, and risk-adjusted enforcement exposure are priced in.**" That bold second sentence is the executive headline of the entire brief.

### Section 3 — What could kill it

2-3 kill risks, ranked by likelihood × impact. Each one a single sentence. "Kill" means *deal collapses or shrinks by 5x*, not "minor concern."

**Format:** numbered list. Each item is `[Risk name] — [one sentence explaining mechanism]. Mitigation: [one sentence].`

### Section 4 — Do this next

3 time-bound actions, ordered by leverage. The first action is always doable within 7 days.

**Format:** numbered list. Each item is `[Action verb] [specific thing] [by date or within timeframe]. [Role to involve, if not the field agent themselves].`

## Layout

- **Page:** US Letter, 0.75" left/right margins, 0.45" top/bottom margins. Single page target.
- **Header (cover block):** programmatic H2O Allegiant logo top-left, stage badge top-right (coloured pill in stage-appropriate colour: amber for Qualify, navy for Position, green for Propose/Close). Customer name 16pt brand navy. Location, date, "Field Brief", "Internal handover" in 9.5pt muted on one line. Thin neutral horizontal rule below.
- **Section headers:** 12pt bold brand navy, each prefixed with a small coloured marker dot (blue for "What this is", green for "What it's worth", red for "What could kill it", navy for "Do this next"). The marker colours create visual rhythm and let the eye find each section in a glance.
- **Insight boxes:** light-navy tint background (`LIGHT_BG_NAVY`) with a 3pt brand-blue vertical accent line on the left edge. Bold brand-navy text inside at 10.5pt. 1-2 lines max. These are the 60-second skim layer.
- **Section bodies:** 9.5pt regular `BODY_TEXT`, leading 12pt. Plain prose for "What this is" and "What it's worth"; numbered cards for "What could kill it" and "Do this next".
- **Kill-risk cards:** 22pt severity-coloured rank circle (red for #1, amber for #2 and #3), then bold name + body paragraph that includes the inline italic mitigation in muted text.
- **Action cards:** 22pt brand-blue rounded rank box, then bold action title with the timeframe in brand-blue inline, then supporting paragraph.
- **Footer:** "H2O Allegiant Discovery Agent · Internal handover · Page 1 of 1" in muted small text.

## Removed from earlier drafts

The strategic-insight closing callout ("This is not X — it's Y. Win if you Z.") from v1.2's Ideation design has been **removed** from the Field Brief. In the v2 design with insight boxes, the strategic punch is delivered in the kill-risk insight box ("the framing battle is the #1 kill risk...") and the next-action insight box ("Thursday's reframe call is the single highest-leverage move..."). Repeating the punch at the bottom as a separate callout would duplicate the message and pushed the brief to two pages. The discipline is: every visual element earns its space, and decorative closures don't.

## Voice — five rules

1. **Declarative, not analytical.** "This is a chronic pretreatment failure dressed up as three events." Not "the data suggests the customer's framing may not align with the analytical findings."
2. **Committed, not hedged.** Numbers and positions are taken. Confidence labels mark uncertainty; hedging language does not.
3. **Specific about action.** Verb + object + time. "Call the environmental manager Thursday with the chronic-envelope reframe." Not "consider initiating a conversation."
4. **Short.** 400-700 words total across all four sections. Sentences average 12-18 words. Bullets 1-2 lines.
5. **Plain English with technical shorthand earned.** "Hex chrome at 3.4× local limit" — yes. "Categorical user under 40 CFR 433 subpart A-F" — only if it changes the action.

## What gets included from upstream skills

The Field Brief is the synthesis output of every analytical skill. It consumes:

- **`h2o-segmentation-router`** — lens, sub-case, sub-stream decomposition. (Surfaces only via Section 1 framing.)
- **`h2o-water-evidence-interpretation`** — extraction records, active conflicts. (Conflicts surface in Section 1 as the framing-vs-reality named claim.)
- **`h2o-solution-lens-light`** — specialist read. (Surfaces only via Section 2 sizing.)
- **`h2o-compliance-and-safety-flagging`** — flag inventory. (Stop-flags and specialist-flags surface in Section 3 as kill risks; attention-flags do not appear in the brief.)
- **`h2o-discovery-gap-analysis`** — gap list. (Surfaces only via Section 4 actions, as "close gap X by calling Y.")
- **`h2o-deal-stager`** (replaces `h2o-qualification-gate`) — current stage + advance criteria. (Surfaces as the stage badge and frames Section 4.)
- **`h2o-positioning`** (replaces `h2o-commercial-shaping`) — deal size, anchor, frame, kill risks. (Surfaces directly in Sections 2 and 3.)

## File details

- **Filename:** `[customer-slug]_[YYYY-MM-DD]_field-brief.pdf`
- **Single engagement = single brief.** Multi-engagement customers (per the decision-makers-AND-procurement-vehicles rule) produce one Field Brief per engagement.
- **Markdown mirror:** also produced as `[customer-slug]_[YYYY-MM-DD]_field-brief.md` for extraction.

## On-demand follow-ons (not the Field Brief — separate artefacts)

When the field agent asks, the agent produces:

- **Playbook PDF** — 11-theme question set for the next customer conversation, sub-stream-tagged where questions differ. Trigger: "give me the playbook" / "questions for tomorrow's call."
- **Analytical Read PDF** — comprehensive engagement record (per-sub-stream deep dive, evidence catalogue, flag inventory, status-changes log). Trigger: "send to my manager" / "I need the analysis" / "full write-up."
- **Proposal Shell** — recommended scope, terms, value-prop anchors, what we don't promise yet, phasing. Trigger: appears only when an offer or RFP is on the table.
- **Markdown annexes** — markdown mirrors of each PDF for extraction.

The Field Brief is always produced. The follow-ons are produced only on request. This is the inversion from v1.2.

---

## Worked example — Prairie AeroSurface (Qualify stage)

A complete worked example is delivered alongside this spec:

- `prairie_field_brief_v2.pdf` — the rendered Field Brief (2 pages: page 1 carries situation/proposal/value/kills + actions 1-2; page 2 carries action 3 with a page-anchor header showing the customer name and "continued" marker)
- `prairie_field_brief_v2.md` — the markdown mirror with identical content structure (the always-produced extraction format)

The PDF and the markdown are the authoritative reference for the design — the rendered visual, the section structure, the insight box phrasing, the value drivers table, the kill-risk card format, the action card format, and the page-2 anchor header are all canonical. Any future Field Brief should match the visual rhythm, content structure, and voice of this worked example.

### Notes on the worked example

- **Section 2 ("What we'd propose") leads with the proposed treatment architecture** (Cr⁶⁺ reduction + cyanide destruction with segregation + hydroxide precipitation re-tuning + EQ-tank slug control), followed by sizing anchored to that architecture, followed by the 3-row value drivers table. This is the correct ordering — solution → sizing → drivers — because the deal value follows from the solution, not the other way around.

- **The insight box for Section 2 names both the proposal and the deal size in one tight claim.** "Pretreatment redesign: Cr⁶⁺ reduction + cyanide destruction + EQ slug control. $3-8M over 18 months · MEDIUM confidence."

- **The value drivers table replaced a paragraph in an earlier iteration.** Compact tabular format ($X-row name | impact | rationale) is more scannable than prose and saves vertical space. The "impact" column uses brand-blue bold to draw the executive eye.

- **The strategic-insight closing callout was removed.** It would duplicate the strategic punch already carried by the kill-risk and next-action insight boxes, and it would push the brief to a third page.

- **Two-page format is acceptable when content earns it.** The Prairie brief at Qualify stage has 3 sub-streams, a complex proposal architecture, and 3 value drivers — that legitimately needs two pages. The discipline is "5 minutes to read," not "fits on one page." When the brief spills to page 2, the page-anchor header (small logo + customer name + stage + "continued" marker) gives page 2 standalone identity.
