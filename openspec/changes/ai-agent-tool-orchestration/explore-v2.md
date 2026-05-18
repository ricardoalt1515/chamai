# SDD Explore v2 — AI Agent Tool Orchestration After Recent Changes

## Status

completed

## Executive Summary

The updated agent is now a bounded, sequential tool-loop: prompt + skill docs now align on one-artifact-per-step sequencing, and runtime `prepareStep` enforces ordered artifact generation (`FieldBrief → Playbook → AnalyticalRead → ProposalShell`) once artifact flow starts. Chat timeout budget was expanded to fit this heavier serialized flow, and artifact tooling now has better structured/redacted logs.

Overall: this is a strong correction from “4 tools together,” but there are still policy conflicts, especially where prompt sections imply “always four PDFs,” and runtime-trigger ambiguity because artifact start is still model-judged rather than server-gated.

## Files Examined

- `openspec/config.yaml`
- `openspec/changes/ai-agent-tool-orchestration/explore.md`
- `package.json`
- `AGENTS.md`
- `src/ai/agents/agent.ts`
- `src/ai/agents/agent.test.ts`
- `src/ai/prompts/h2o-allegiant.ts`
- `src/ai/prompts/h2o-allegiant.md`
- `src/ai/skills/h2o-field-brief/SKILL.md`
- `src/ai/tools/h2o-artifacts.ts`
- `src/lib/chat-handler.ts`
- `src/lib/chat-handler.test.ts`
- `src/lib/chat-handler.artifacts.test.ts`
- `src/lib/chat-helpers.ts`

## Docs Examined

- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`
- `node_modules/ai/docs/03-agents/04-loop-control.mdx`
- `node_modules/ai/src/generate-text/prepare-step.ts`
- related local grep hits for `toolChoice` / `stopWhen`

## Current Flow

1. Request is validated via `parseChatRequest`.
2. Messages are persisted and attachments normalized.
3. Chat handler creates request-scoped artifact tools and passes them to `createAgent`.
4. Agent uses `ToolLoopAgent` with:
   - `stopWhen: stepCountIs(10)`
   - `prepareStep: artifactSequencePrepareStep`
   - stream timeout `{ totalMs: 240_000, stepMs: 120_000 }`
5. `prepareStep` behavior:
   - Before artifact flow and before `h2o-field-brief` skill load: no override.
   - After field-brief skill load, while brand skill is not loaded: restricts to `loadSkill + nextArtifact`, with `toolChoice: "required"`.
   - After artifact flow starts: forces exact next artifact tool via `toolChoice: { type: "tool", toolName }`.
   - After all four artifacts have tool-results: sets `toolChoice: "none"` to prevent duplicates.
6. Artifact tools render PDF, store PDF, persist metadata, and return URL.
7. Logs are emitted at tool/render/storage/persist phases, with customer/payload content redacted from errors.

## Desired Flow

- Fast-path conversational turns answer directly with no artifact churn.
- Opportunity-advancing turns reliably produce ordered artifacts, one tool per step, no batching, no duplicates.
- Explicit single-artifact requests generate only the requested artifact when valid.
- Tool usage remains observable without leaking sensitive payload/customer details.
- The loop finishes inside timeout/step budget with predictable retry/abort behavior.

## Analysis

### How it works currently

Prompt and skill now specify sequential artifact generation. Runtime guardrails in `prepareStep` enforce order and non-duplication after kickoff. Tests cover key sequencing and timeout wiring.

### What behavior we are trying to get

A deterministic artifact pipeline for “opportunity-advancing” turns, while preserving a direct-answer fast path for focused questions.

### What is good about the new changes

- Strong move from prompt-only control to runtime-enforced sequencing.
- Duplicate-artifact suppression after all four complete is the right guardrail.
- Timeout increase matches serialized PDF render/store/persist cost better than the old budget.
- Logging/redaction improves operations and privacy.
- Removing old `present_files`, local routes, and runtime references from the field brief skill reduces stale-context risk.

### What is still risky or wrong

1. Prompt policy conflict: parts still say every opportunity-advancing turn produces all four PDFs, while fast-path and explicit-single-artifact exceptions also exist.
2. Triggering is still prompt-only/model-decided: no server-side hard gate classifies “opportunity-advancing” vs direct Q&A vs single-artifact request.
3. `toolChoice: required` phase may still permit extra `loadSkill` churn before the first forced artifact.
4. Step budget risk remains: four heavy artifacts + skill calls + retries can still hit `stepCountIs(10)`.
5. There is no explicit orchestration eval harness beyond unit tests.

## Prioritized Improvements

1. **Unify prompt contract**: remove contradictory “always four” wording where exceptions exist; define one decision table for fast-path vs full package vs one-off artifact.
2. **Add server-side intent gate**: deterministic classifier/flag based on attachments, explicit phrases, and explicit single-artifact requests, passed into context so runtime is not purely model-interpreted.
3. **Tighten pre-artifact `prepareStep`**: force required prerequisite skills then first artifact, or cap redundant `loadSkill` calls.
4. **Add orchestration evals**:
   - pure Q&A → no artifacts
   - explicit full brief/package → ordered four artifacts
   - explicit single artifact → only that artifact
   - timeout/retry behavior remains bounded
5. **Add budget/latency safeguards**: monitor per-step durations and tool error rates; define abort/degraded-response behavior if the loop completes only part of the package.

## Next Recommended

Proceed to SDD proposal/design. Enough is known; no blocking questions are required before proposal/spec/design.

## Risks

- Instruction collisions in system prompt can still cause unwanted behavior despite runtime guardrails.
- Prompt-only turn classification may drift by model behavior/version.
- Sequential heavy artifact pipeline can still breach step/timeout under load or render failures.
- Without regression evals, orchestration quality may silently degrade.

## Skill Resolution

paths-injected

Loaded and applied:

- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`

AI SDK loop-control conclusions were source-verified from local `node_modules/ai/docs` and `node_modules/ai/src`.
