# SDD Explore — Approach Validation for AI Agent Tool Orchestration

## Status

completed_with_constraints

## Executive Summary

The agent's real job-to-be-done is not generic chat. It is to accelerate wastewater business-development deal progression by converting ambiguous field evidence into action-ready sales artifacts, especially a cost-of-alternative-led Field Brief, plus next-step guidance.

Given this purpose and current AI SDK v6 loop controls, **bounded autonomy** remains the best fit: prompt-led intent plus runtime-enforced sequencing and limits. A hard fixed sequence is too brittle for conversational turns. Pure autonomy is too risky for artifact correctness, cost, latency, and duplicate/missed tool behavior.

## Docs Examined

- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`
- `node_modules/ai/docs/03-agents/04-loop-control.mdx`
- `node_modules/ai/src/generate-text/prepare-step.ts`
- `node_modules/ai/src/generate-text/stream-text.ts` grep-verified loop params/defaults

## Files Examined

- `openspec/config.yaml`
- `openspec/changes/ai-agent-tool-orchestration/explore-v2.md`
- `AGENTS.md`
- `package.json`
- `src/ai/agents/agent.ts`
- `src/ai/agents/agent.test.ts`
- `src/ai/prompts/h2o-allegiant.ts`
- `src/ai/prompts/h2o-allegiant.md`
- `src/ai/skills/h2o-field-brief/SKILL.md`
- `src/ai/tools/load-skill.ts`
- `src/ai/tools/h2o-artifacts.ts`
- `src/lib/chat-handler.ts`

## Official AI SDK Findings

- Tool loops stop on non-tool finish reason, non-executable tool, approval-needed tool, or a stop condition.
- `stopWhen` has a default safety behavior and supports custom/combined conditions.
- `prepareStep` is the official hook for per-step control: `toolChoice`, `activeTools`, messages, model, and provider options.
- Forced tool patterns are explicitly supported through `toolChoice: "required"` and named tool forcing.
- Manual loop control is supported, but it is only justified when the built-in `ToolLoopAgent` / `prepareStep` controls are insufficient.

## Product Purpose

### Job to be done

Help wastewater field agents advance and close deals by producing decision-grade, stage-aware artifacts and direct tactical answers grounded in customer economics, especially BATNA/cost-of-alternative.

### Domain workflow

- Opportunity-advancing turns need ordered artifact production.
- Focused conversational turns need fast direct response with no artifact churn.
- The Field Brief appears to be the foundational artifact because it establishes the economic and situational framing for downstream sales materials.

## Architecture Options

### Option 1 — Hard fixed sequence

Pros:

- Maximum determinism.
- Easy to reason about once artifact flow begins.

Cons:

- Harms fast-path Q&A.
- Overproduces artifacts.
- Higher cost and latency.
- Poor UX when user only wanted explanation, refinement, or one artifact.

Verdict: useful inside the artifact pipeline, not as the whole agent policy.

### Option 2 — Pure autonomy

Pros:

- Flexible.
- Less runtime code.
- Lets model choose tools naturally.

Cons:

- Sequencing drift.
- Duplicate or missed artifacts.
- Unstable latency/cost.
- Riskier privacy/compliance envelope for heavy artifact payloads.

Verdict: too loose for this production workflow.

### Option 3 — Bounded autonomy

Pros:

- Preserves conversational flexibility.
- Enforces critical artifact order and limits.
- Matches AI SDK-native controls: `ToolLoopAgent`, `prepareStep`, `toolChoice`, `activeTools`, `stopWhen`.
- Keeps the simplest architecture that still protects expensive operations.

Cons:

- Requires a clean trigger contract.
- Requires targeted orchestration tests/evals.

Verdict: best current approach.

## Recommended Simple Maintainable Architecture

### Prompt owns

- Role and domain priorities.
- Intent policy.
- Concise decision table:
  - direct Q&A → answer directly, no artifacts;
  - full opportunity package → generate ordered artifacts;
  - explicit single artifact → generate only that artifact;
  - insufficient context → ask or load required skill/context first.
- Output style and user-facing behavior.

### Runtime code owns

- Non-negotiable control flow and safety bounds.
- One-artifact-at-a-time enforcement.
- Ordered sequence once artifact flow starts.
- Duplicate suppression.
- Step/time limits.
- Optional deterministic turn classification signal from server.

### Tool schemas/descriptions own

- Precise input/output contract.
- Tool purpose and prerequisites.
- Guardrails at execution boundary.
- No hidden policy sprawl.

### Tests/evals own

- Behavioral lock for orchestration invariants:
  - Q&A produces no tools/artifacts.
  - Full opportunity package generates four artifacts in order.
  - Single artifact request generates only one artifact.
  - No duplicates after completion.
  - Timeout/partial failure produces predictable response.

## What Would Be Overengineering

- Full external workflow engine/state machine for the current single-agent path.
- Multi-agent planner/executor split inside the app runtime.
- Heavy custom loop while `ToolLoopAgent + prepareStep` covers current needs.
- Large speculative eval platform before core regression cases exist.

## Final Recommendation

Use **bounded autonomy** with high confidence.

Keep the current `ToolLoopAgent + prepareStep` direction, but improve it by:

1. Normalizing prompt contradictions into one decision table.
2. Adding deterministic server-side turn classification signal, advisory at first.
3. Keeping current AI SDK-native loop controls instead of moving to manual loops.
4. Adding orchestration evals around triggering, sequencing, single-artifact behavior, and partial-failure recovery.

## Assumptions

- The four artifacts are genuinely part of a full opportunity package.
- Field Brief is the correct first artifact because it grounds downstream materials.
- The app must support both direct tactical answers and artifact generation in the same chat surface.
- Current AI SDK v6 APIs remain the target.

## Next Recommended

Proceed to SDD proposal/design focused on:

1. Prompt contract simplification.
2. Server-side/advisory intent gate.
3. PrepareStep pre-artifact tightening.
4. Orchestration regression tests/evals.

## Risks

- Prompt policy collisions can still degrade behavior.
- Model-judged triggering without server gate may drift.
- Sequential heavy artifact generation can still hit latency/step budgets on bad paths.

## Skill Resolution

paths-injected

Loaded:

- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`

Official AI SDK conclusions are grounded in local `node_modules` docs/source, not memory.
