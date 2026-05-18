# SDD Explore — SecondStream PDF Flow Comparison

## Status

completed_with_constraints

## Executive Summary

Legacy `SecondStream` felt simpler because orchestration was mostly “prompt + PydanticAI defaults”: one agent, natural tool loop, minimal hard runtime sequencing, and built-in retry behavior (`retries=2` plus `ModelRetry` patterns). Current `SecondstreamAI` adds explicit AI SDK `prepareStep` sequencing logic, which is safer but more complex.

The older project does support the user's intuition: a simpler “one tool at a time” prompt can work well when the framework loop, retry semantics, tool design, and prompt all align. But it was not only the prompt. PydanticAI's agent-level retry behavior and tool error semantics contributed significantly.

## Comparison Project

Primary project examined:

`/Users/ricardoaltamirano/Developer/SecondStream`

Evidence strongly indicates this is the relevant older app: Python backend, PydanticAI agents, chat PDF tools. Nearby dirs were not needed for this comparison.

## Files Examined

Legacy project:

- `/Users/ricardoaltamirano/Developer/SecondStream/backend/app/agents/chat_agent.py`
- `/Users/ricardoaltamirano/Developer/SecondStream/backend/app/prompts/chat-agent-prompt.md`
- `/Users/ricardoaltamirano/Developer/SecondStream/backend/app/services/chat_stream_protocol.py`
- `/Users/ricardoaltamirano/Developer/SecondStream/backend/app/services/proposal_service.py`

Current project:

- `openspec/config.yaml`
- `openspec/changes/ai-agent-tool-orchestration/approach-validation.md`
- `src/ai/agents/agent.ts`
- `src/ai/prompts/h2o-allegiant.ts`
- `src/ai/prompts/h2o-allegiant.md`
- `src/ai/tools/h2o-artifacts.ts`

## Docs Examined

- `node_modules/ai/docs/03-agents/04-loop-control.mdx`
- `node_modules/ai/src` grep on `ToolLoopAgent`, `prepareStep`, `toolChoice`, `activeTools`, `stopWhen`
- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/building-pydantic-ai-agents/SKILL.md`

## Old Project Flow

- PydanticAI agent configured with `Agent(..., retries=2, tool_timeout=30)`.
- Prompt instructs one-at-a-time PDF generation.
- Tools include:
  - `generateIdeationBrief`
  - `generateAnalyticalRead`
  - `generatePlaybook`
- Tool failures can trigger model retry semantics.
- `ModelRetry` is treated as an internal retry signal and suppressed from UI.
- There is no heavy per-step forced sequence logic equivalent to current `prepareStep`.

## Current Project Flow

- AI SDK v6 `ToolLoopAgent` with `prepareStep` enforcing artifact order.
- Runtime actively constrains/forces tools using `activeTools`, `toolChoice: "required"`, and forced named tools.
- Hard-coded sequence and completion tracking for four artifacts.
- Prompt also instructs sequential behavior, so there is both prompt-level and runtime-level control.

## Key Differences

1. Legacy simplicity came from framework defaults plus prompt discipline.
2. Current stack adds deterministic control in code, increasing correctness but also complexity.
3. Legacy retry was explicit at agent level through PydanticAI `retries` plus `ModelRetry` behavior.
4. Current AI SDK flow relies more on loop behavior, tool error handling, step limits, and forced next-step policy.
5. Legacy had fewer artifacts/tools in the core sequence, which reduced orchestration pressure.

## AI SDK Mapping

The closest AI SDK equivalent to the old PydanticAI behavior is:

- `ToolLoopAgent`
- light `stopWhen` step budget
- minimal or no per-step `prepareStep` forcing
- optional `activeTools` / `toolChoice` only at coarse phase boundaries
- strong tool descriptions/schemas
- prompt guidance saying one tool at a time and retry/continue after tool failure where appropriate

AI SDK docs confirm `prepareStep` is powerful but optional. Simpler policies are valid when prompt + tool schemas + tests provide enough reliability.

## Answers to the User's Core Questions

### 1. What made the older project feel simpler and work better?

It used a natural agent loop with fewer hard-coded constraints. The model was instructed to generate PDFs one at a time, while PydanticAI handled retries and tool failure signaling more directly.

### 2. Was it truly only “tell the prompt to use one tool at a time”?

No. Prompt wording helped, but the behavior also depended on:

- PydanticAI `retries=2`
- `ModelRetry` semantics
- smaller tool set / fewer artifacts
- simpler PDF flow
- tool design and schemas

### 3. Can current SecondstreamAI simplify to prompt-only one-tool-at-a-time?

It can be simplified, but pure prompt-only control is risky in AI SDK for this heavier four-artifact flow. Risks include missed tools, duplicate tools, out-of-order artifacts, and less predictable recovery.

### 4. What is the minimal modern AI SDK approach?

Use `ToolLoopAgent` with a lighter policy:

- Prompt keeps one-tool-at-a-time/order guidance.
- Runtime gates only chat vs artifact mode and max steps.
- Use `activeTools` / `toolChoice` only at phase boundaries, not every step.
- Keep strict schemas and tool descriptions.
- Add evals for sequencing, retry/recovery, duplicates, and latency.

### 5. Should current `prepareStep` be kept, reduced, or replaced?

Recommendation: **reduce it**, do not remove all control immediately.

Keep guardrails for:

- step budget
- duplicate prevention
- artifact-mode gating

Consider removing or softening per-step micro-forcing so the agent can behave more like the older PydanticAI flow.

## Recommendations

1. Prototype a minimal orchestration variant:
   - Prompt: one tool at a time, generate next artifact only after prior tool result.
   - Runtime: chat vs artifact mode gate, max steps, duplicate guard.
   - Avoid forcing a named artifact tool at every step unless evals show it is needed.
2. Add evals comparing current vs simplified behavior:
   - sequential artifact completion
   - tool-failure recovery/retry
   - duplicate artifact calls
   - latency/cost/user experience
3. Keep strict tool schemas and descriptions.
4. Preserve `stopWhen` for runaway safety.
5. If simplified variant passes evals, prefer it because it is easier to understand and maintain.

## Next Recommended

Proceed to SDD proposal/design for a **minimal orchestration experiment**, not a full rewrite.

Proposed experiment:

1. Add/expand orchestration tests first.
2. Implement a simplified `prepareStep` variant behind a flag or small isolated function.
3. Compare old/current behavior against simplified behavior.
4. Keep whichever passes reliability with less complexity.

## Risks

- Prompt-only control can regress under model variance.
- Removing too much runtime control can weaken reliability on multi-artifact turns.
- Current richer orchestration may protect edge cases that legacy tolerated.
- PydanticAI retry semantics do not map 1:1 to AI SDK; explicit retry strategy may be needed.

## Skill Resolution

paths-injected

Loaded:

- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/building-pydantic-ai-agents/SKILL.md`
