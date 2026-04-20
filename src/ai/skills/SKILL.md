---
name: commercial-shaping
description: Apply a commercial lens to a qualifying secondary-stream opportunity — size it, position it, diagnose win-ability, and produce the smart questions the field agent takes into the next producer conversation. Trigger after the sub-discipline-router has decomposed the opportunity and specialist-lens-light has run, but before discovery-reporting — this turns a technical write-up into a commercial brief. Also trigger whenever the user asks for sizing, market value, opportunity shape, positioning, win strategy, decision-maker mapping, incumbent analysis, or "what should I ask next" on a specific opportunity. Produces four outputs — opportunity sizing with arithmetic shown (volume to mass to gross market size, confidence-labelled), product positioning with a single primary frame chosen, win-ability diagnostic (decision-maker, pain, incumbent, timeline, competitive context), and five to seven smart questions for the next call. Sized estimates are permitted only when evidence for each number is shown inline.
---

# Commercial shaping

The purpose of this skill is to produce a **commercial brief**, not a technical analysis. The field agent reads this before a conversation with the customer and acts on it during the conversation. Every output must pass the "could a sales engineer take this into a meeting and use it" test.

## When to run

Run after `sub-discipline-router` has decomposed the opportunity and `specialist-lens-light` has produced per-sub-stream questions, analytical needs, and red flags. Run before `discovery-reporting` — the reporting skill consumes your output directly.

Also run on direct user request: "size this opportunity," "what's the commercial angle," "who's the decision-maker," "what should I ask next."

## The four outputs, in order

Produce all four sections every time, even if some are sparse. Sparse sections make gaps visible; skipping them hides the gaps.

### 1. Opportunity sizing

The field agent needs two numbers at minimum: **mass per period** and **gross market size per period**. Both shown with arithmetic, both with a confidence label, both with the evidence source inline.

**Template:**

```
Mass rate
  Stated volume:       800,000 gal/month    [producer, verbal, Apr 2026]
  Specific gravity:    1.12                  [COA Baytown Tank 1499]
  Conversion:          800,000 gal × 1.12 × 8.34 lb/gal ÷ 2,000 lb/ton
  Result:              ≈ 3,740 tons/month    [calculated — HIGH confidence if SG holds]

Gross market size (directional)
  Low bound:           3,740 × $0  (if gate-fee route)     ≈ $0/month gross
  High bound:          3,740 × $150 (if recovered feedstock route)   ≈ $560k/month gross
  Result:              Range $0–$560k/month gross, route-dependent
  Confidence:          LOW (route not yet confirmed; prices are indicative market-range, not quoted)
```

**Rules for sizing:**

- **Show the arithmetic.** Every number the user sees has the calculation and the inputs beside it. "Roughly $32M/month savings" with no working is fabrication, regardless of how plausible it feels.
- **Label every number's evidence source.** COA / SDS / producer verbal / producer written / inferred / market range. Mixing these without labels destroys the credibility of the brief.
- **Unit discipline.** Convert to a single mass unit (tons/month or tonnes/month) as the canonical output, showing the conversion from whatever the producer stated. The 800,000-gallons-vs-800,000-tons error is a ~200× scale mistake and it happens in the real world.
- **When data is missing, state the missing input explicitly** rather than assuming. If SG is unknown, write "SG needed for mass conversion — Required gap" and produce a volume-only sizing until it's answered.
- **Prices are directional ranges, not quotes.** No firm $/ton for disposal, no firm $/ton for a buyer. Indicative market ranges with "$X–$Y/ton typical, route-dependent" are acceptable if labelled. Firm pricing waits for Assessment mode.
- **Never fabricate a single number.** If you cannot source it, say so and list it as a Required gap.

### 2. Product positioning

Decide what this stream **is** from a commercial standpoint, and name the single primary frame. A stream is positioned as one of:

- **Waste to dispose** — the current frame when there is no commercial upside beyond avoided disposal cost. Outlet: permitted TSDF or equivalent. Pricing direction: gate fee.
- **Recovered feedstock** — the stream has meaningful composition value and a buyer market exists for it in approximately its current form. Outlet: industrial reuser. Pricing direction: rebate possible or neutral.
- **Internal reuse** — the material can return to the producer's own process or another unit at the same site. Outlet: internal. Pricing direction: avoided-cost story, not a $/ton sale.
- **Strategic material** — the stream is tied to a customer ESG or zero-landfill commitment, or unlocks a broader relationship, even if the unit economics are marginal. Outlet: matters less than the relationship signal.

**Rules for positioning:**

- **Pick one primary frame.** The brief is commercially weaker when it offers all four. "You don't have waste, you have a low-quality recovered feedstock" is a sentence the agent can use; "this could be disposed or recycled or reused" is not.
- **Show what has to be true for that frame to hold.** Every positioning has an underlying assumption — composition meets buyer specs, contract allows segregation, logistics economics work. Name the critical assumption.
- **Show the fallback frame.** If positioning as recovered feedstock but composition may fail buyer spec, note "fallback: waste to dispose — ~$X/ton gate fee range if spec fails."
- **Never position as "strategic" unless there is actual evidence of strategic value** (zero-landfill commitment, ESG programme, multi-site relationship). Default-positioning thin opportunities as strategic is how value gets overstated.

### 3. Win-ability diagnostic

The five questions a commercial lead asks themselves before committing resource to an opportunity. Answer each in one line with the evidence tag. "Unknown" is a valid and useful answer — it becomes a Required gap downstream.

```
Decision-maker:        EHS Director at Site X  [producer verbal, confirmed] | OR | Unknown
Producer pain:         Current disposal cost $X/month and rising  [inferred from producer complaint] | OR | Unknown
Incumbent:             [name/region] on [contract status]  [producer verbal] | OR | Unknown
Vulnerability:         Contract expires in 6 months; service complaints on paperwork delays  [producer verbal] | OR | No known vulnerability
Timeline:              RFP expected Q3 2026  [producer verbal, soft] | OR | Unknown
Competitive context:   2–3 bidders expected; procurement-led decision  [inferred]  | OR | Unknown
```

**Rules for the diagnostic:**

- **Every field gets an evidence tag OR "Unknown."** Unknowns are valuable — they tell the field agent what to ask next. Blanks are not acceptable.
- **Pain must be concrete.** "High disposal cost" is not a pain. "$80k/month in disposal costs that doubled in the last 18 months" is a pain. If the concrete form isn't known, mark the field Unknown and list it as a Required gap.
- **Incumbent vulnerability is the commercial lever.** A weak-incumbent signal (contract ending, service failures, scope gaps) is worth more than a technical advantage. Say so.
- **No spec-fit projection here.** Whether your company can technically serve this stream is specialist-lens work, not win-ability work. Win-ability is about the deal shape.

### 4. Smart questions for the next producer conversation

Five to seven questions the field agent should prioritise for the next producer call or visit. These are **not** the gap list — the gap list is exhaustive; this is the **killer short list**.

**How to choose them:**

- Target the field agent's single most-valuable-next-hour. Which five answers, if you got them tomorrow, would move this opportunity from tentative to committable?
- Prefer questions that **reshape the commercial frame**, not just fill data fields. "Are all your caustic streams blended today, or can we segregate them to increase value?" is a reshaping question. "What is your monthly volume?" is a data question.
- Mix content layers: at least one commercial (pain / incumbent / timeline), at least one positioning-defining (segregation, reuse appetite, quality expectation), at least one diagnostic ("what has prevented a better solution so far?").
- Each question carries a **why-it-matters** one-liner showing the field agent what the answer unlocks.

**Template:**

```
Q1. [commercial] Who currently manages this stream, and when does that contract expire?
    Why: incumbent vulnerability + competitive window.

Q2. [positioning] If we could place this material with a buyer rather than a disposal TSDF, would segregation from [co-mingled stream] be operationally acceptable?
    Why: determines whether "recovered feedstock" positioning is live or dead.

Q3. [diagnostic] Has anyone previously attempted to reuse or recycle this stream? What happened?
    Why: reveals the real barrier — technical, contractual, or inertial.

Q4. [commercial] What does managing this stream cost you today, all-in?
    Why: anchors the value story in the producer's own numbers.

Q5. [strategic] Is this stream tied to any internal zero-landfill, ESG, or reporting commitment?
    Why: can unlock non-price budget and executive sponsorship.
```

**Rules for smart questions:**

- **Five to seven, not twelve.** The agent cannot carry twelve questions into a conversation. Force the prioritisation.
- **Phrase for the producer, not for the agent.** Say it the way the agent will say it on the call. "Who owns this stream today, and when is that arrangement up for review?" — not "identify the incumbent and contract expiry."
- **Avoid CAS numbers, specific CFR sections, or lab-intake language.** Producers disengage. If technical composition is genuinely unknown and blocking, the question is "do you have an SDS or COA we could review?" — not "what are the CAS numbers of the primary constituents?"
- **Never include a question the producer cannot plausibly answer.** Anything requiring the producer to run new analytical work is an analytical-plan item, not a smart question.

## What this skill never does

- **Classify.** RCRA codes, characteristic waste determinations, LDR analysis — all Assessment-mode work. If a technical hunch is commercially relevant ("likely hazardous on pH alone"), it goes in the `discovery-reporting` "technical considerations flagged for assessment" section, not here.
- **Route to a specific TSDF, recycler, or buyer by name.** Naming Veolia or Clean Harbors or Chevron Phillips as a buyer in Discovery is fabrication — the agent does not have the offtake network visibility to make that call. Use generic category language: "industrial alkaline-chemical blender," "permitted CWT facility," "drilling-fluids blender."
- **Quote prices.** Indicative market ranges only. Firm pricing is Assessment.
- **Produce a pitch deck.** The brief is evidence-grounded internal handover, not customer-facing collateral. A customer-facing deck, if wanted, is a Phase 2 derivative.
- **Soften uncertainty.** "LOW confidence" stays LOW confidence; the brief is honest or it is dangerous.

## Output format

Produce four labelled sections in the order above: **Opportunity sizing**, **Product positioning**, **Win-ability diagnostic**, **Smart questions**. Each section is consumed directly by `discovery-reporting` to populate the Opportunity Shape and The Ask sections of the executive report.

When uncertainty blocks a section (e.g., volume unknown → cannot size), produce the section header, state what is blocking, and list the blocker as a Required gap. Do not skip the section — visible gaps drive the commercial conversation.
