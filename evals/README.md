# Eval Suite

Behavioral test coverage for the Chamai agent loop — the `ToolLoopAgent` on Amazon Bedrock that
turns wastewater BD evidence into four artifacts (Field Brief, Playbook, Analytical Read,
Proposal Shell). Unit tests cover the plumbing; this suite covers the behavior: does the agent
call the right tools in the right order, do the payloads stay schema-valid, does a prompt change
silently double the cost per conversation, and is the content actually grounded in the evidence.

Built vitest-native on purpose. No external eval SaaS — the harness itself is the point.

## Architecture

The core abstraction is the **`RunRecord`** (`runner/types.ts`): a JSON-serializable transcript
of one agent run — every tool call in order, every artifact payload, step count, token usage,
estimated cost. The runner produces them; every assert is a pure function over them.

That split gives the suite two speeds:

| Layer | Command | Model calls | Cost | When |
| --- | --- | --- | --- | --- |
| Deterministic gate | `bun run eval` | none | $0, <1s | every PR and push (CI) |
| Live run | `bun run eval:live` | real Bedrock, full agent loop | ~$7.30 est. for 12 scenarios, ~35 min | nightly + baseline refresh |
| LLM judge | `bun run eval:judge` | one `generateObject` call per recording | ~$0.47 for 12 | nightly, after live |
| Calibration report | `bun run eval:calibration` | none | $0 | whenever labels change |

The PR gate replays the **committed recordings** in `recordings/` through the deterministic
asserts. Zero tokens, sub-second, and it still catches real regressions: tighten a zod schema or
a business rule and yesterday's known-good outputs fail the gate — that is a breaking change
surfaced before merge. Live behavior drift is the nightly job's problem, not the PR's.

Live runs exercise the real production path: real system prompt, real skill loading, real PDF
rendering (`@react-pdf`), real Bedrock. Only persistence (artifact store, PDF storage) is faked
in-memory (`runner/fakes.ts`), so a render-time failure still surfaces as a tool error.

Nightly results are uploaded as workflow artifacts, **never auto-committed**. Promoting a new
baseline is a deliberate human PR — recordings are reviewable data, not CI side effects.

## The deterministic asserts (`runner/asserts.ts`)

Each exists because of a specific failure mode, not for coverage theater:

1. **Schema validity** — every artifact payload must parse against the live zod input schemas
   (`ARTIFACT_INPUT_SCHEMAS`). The renderer consumes these payloads downstream; drift between
   what the model emits and what the PDF renderer expects is the highest-blast-radius failure
   in the system.
2. **Tool sequence** — artifact tool calls must match the scenario's expected order
   (`ARTIFACT_TOOL_SEQUENCE`), or be absent when forbidden. The agent's single most important
   routing behavior: a conversational question must not trigger a four-PDF package, and an
   explicit single-artifact ask must not over-produce. The `h2o-field-brief` SKILL.md wording
   change that enabled single-artifact requests shipped with a stale test snapshot — this
   assert is the behavioral version of that contract.
3. **Step budget** — the loop must terminate within `AGENT_MAX_STEPS` (10). Measured reality:
   full-package runs use 8–9 steps. The headroom is two steps or fewer — one extra skill load
   or tool-input repair retry away from the cap. This assert is the tripwire.
4. **Cost budget** — per-scenario USD ceiling via `estimateTokenCostUsd()`. Guards against the
   quiet failure where a prompt or skill edit inflates input tokens on every conversation.

## The dataset (`datasets/`, 12 scenarios)

Three families, all grounded in the production domain (US wastewater BD):

- **happy-path (4)** — full opportunity package across realistic cases: a food-processing plant
  exceeding BOD/TSS surcharge limits, a municipal NPDES renewal, an industrial laundry with FOG
  violations, a brewery scoping an MBR retrofit.
- **tool-selection (4)** — explicit single-artifact ask → exactly that tool; "what stage is
  this deal?" → no artifact tools; explicit full package → exact sequence; email draft → no
  artifact tools.
- **edge-cases (4)** — minimal evidence at Lead stage (thin content must still be
  schema-valid), name-only customer (title fallback path), ~2 pages of inline eDMR numbers
  (long-evidence pressure), mixed conversational + artifact ask.

Every scenario carries a one-sentence `motivation` naming the failure mode it guards.

## LLM-as-judge (`runner/judge.ts`)

Deterministic asserts can't see content quality. The judge scores each recording 1–5 on three
anchored dimensions:

- **groundedness** — every factual claim traceable to the scenario evidence or explicitly
  flagged as an assumption,
- **stageAppropriateness** — depth matches the deal stage; thin content at Lead is *correct*,
- **actionability** — a field agent knows exactly what to do next.

A judge that nobody has checked is just a second opinion with API costs, so it ships with a
calibration loop: human labels live in `labels/human-labels.json` (same dimensions, same
scale), and `bun run eval:calibration` reports judge–human agreement per dimension — exact
match, within-one-point, and mean absolute error. With N=12, kappa-style statistics are
unstable; MAE and within-1 degrade gracefully instead. The calibration gate asserts overall
within-1 agreement ≥ 70% once labels exist.

## What the first runs actually caught

This suite found real problems before it was a day old — in rough order of embarrassment:

1. **The unit test suite was silently red on `main`** (pre-CI): three stale tests and vitest
   collecting 16 stale full-repo copies out of `.amplify/` CDK bundling output. The CI gate
   (PR #3) exists because of this.
2. **All 12 pre-measurement cost budgets were guesses, and 8 were wrong.** First live run:
   every scenario passed schema, sequence, and step asserts; 8 of 12 failed cost. Full-package
   reality: $0.80–0.93 estimated at list price vs $0.75 guessed. Budgets are now measured
   baseline × ~1.25. Lesson: cost budgets are measurements, not opinions.
3. **The judge's first run caught an incoherent eval scenario.** The long-eDMR case scored
   groundedness 2/5: the agent had built a severe-violation narrative (SNC, 8–13× permit
   exceedance, $4–13M BATNA) from numbers the judge read as influent-strength — while the
   prompt labeled them eDMR (discharge) data and narrated a mild emerging NH3-N problem. Root
   cause: the synthetic data generator emitted influent-typical BOD/TSS values into a
   discharge-data frame. The scenario was rewritten with coherent effluent values and
   re-recorded. The judge disagreeing with the dataset author — and being right — is the
   calibration loop working.

Also measured along the way: `estimateTokenCostUsd` prices all input tokens at list price and
ignores Bedrock cache-read discounts (the system prompt is cached with a 1h TTL), so recorded
costs are a conservative ceiling on billed spend.

## Running it

```sh
bun run eval              # deterministic gate — replay committed recordings, $0
bun run eval:live         # full live run against Bedrock — refreshes recordings/
bun run eval:judge        # judge each recording — refreshes judgments/
bun run eval:calibration  # judge-vs-human agreement report (needs filled labels)
```

Live and judge runs need AWS credentials with Bedrock invoke access (local credential chain or
the nightly workflow's OIDC role — see `.github/workflows/evals-nightly.yml`).

Eval files use the `.eval.ts` suffix so the root `bun run test` never collects them; they run
under their own config (`evals/vitest.config.ts`).
