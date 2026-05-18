# SDD Explore — AI Agent Tool Orchestration

## Status

completed_with_constraints

## Executive Summary

- The current implementation is already a hybrid of prompt guidance plus runtime gating:
  - Prompt (`h2o-allegiant`) instructs staged skill usage and sequential artifact generation.
  - Runtime (`artifactSequencePrepareStep` in `src/ai/agents/agent.ts`) enforces one artifact tool at a time, in a fixed order, once artifact flow starts.
- The user's intuition is mostly correct: better tool behavior usually comes from clear tool availability and when-to-use criteria, not from telling the model to use multiple tools together.
- A purely autonomous approach is risky in this codebase because artifact tools are heavy: PDF rendering, S3/blob writes, DB persistence, and large schemas/results. Best fit is bounded autonomy: concise tool contracts plus selective runtime constraints for expensive tools.

## Files Examined

- `openspec/config.yaml`
- `AGENTS.md`
- `package.json`
- `app/api/chat/route.ts`
- `src/lib/chat-handler.ts`
- `src/lib/chat-helpers.ts`
- `src/ai/agents/agent.ts`
- `src/ai/prompts/h2o-allegiant.ts`
- `src/ai/skills/discover.ts`
- `src/ai/tools/load-skill.ts`
- `src/ai/tools/h2o-artifacts.ts`
- `src/ai/skills/h2o-field-brief/SKILL.md`
- `src/ai/skills/*/SKILL.md` frontmatter

## Docs Examined

- `node_modules/ai/docs/03-agents/01-overview.mdx`
- `node_modules/ai/docs/03-agents/04-loop-control.mdx`
- `node_modules/ai/docs/04-ai-sdk-ui/21-transport.mdx`
- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`
- `/Users/ricardoaltamirano/.codex/skills/ai-agent-engineer/SKILL.md`

## Key Findings

1. Active toolchain in practice is `loadSkill` plus dynamically injected artifact tools:
   - `generateFieldBrief`
   - `generatePlaybook`
   - `generateAnalyticalRead`
   - `generateProposalShell`
2. `prepareStep` enforces artifact order only after artifact flow begins. Before that, the model still decides whether and when to start artifacts.
3. The prompt is very prescriptive and long; sequencing rules appear in multiple sections, which can create instruction collisions.
4. `loadSkill` returns full skill body text. If called repeatedly, it can inject a large amount of content into context.
5. Artifact tool schemas are rich and large. Combined with long prompts and skill text, this increases context pressure and can degrade tool-selection quality.

## Interpretation

The previous prompt instruction to use four tools together was an anti-pattern for this workflow. It likely encouraged the model to batch expensive work, generate broad payloads, and treat all artifact tools as mandatory rather than conditional.

The current hardcoded sequential behavior is safer than the old approach, but it can become too rigid if every opportunity-advancing turn is forced through the same artifact chain.

Recommended direction: bounded autonomy.

- Let the agent know which tools exist and when each is appropriate.
- Keep deterministic runtime guardrails for expensive or irreversible tools.
- Make `understand brief` / first-context acquisition the default first step only when the user asks for opportunity analysis or new evidence arrives.
- Let later artifact tools depend on available information and user intent rather than always firing as a bundle.

## Next Recommended

1. Move toward bounded-autonomy orchestration:
   - Keep runtime guardrails for expensive artifact tools.
   - Reduce prompt over-prescription.
   - Put deterministic sequencing in runtime policy, not repeated prose.
2. Refactor tool instructions into concise tool contract blocks:
   - purpose
   - prerequisites
   - required inputs
   - stop condition
   - do-not-use-when conditions
3. Add pre-artifact gating policy:
   - answer directly for pure Q&A
   - load/refresh skill only when context is missing or stale
   - start artifact generation only when user intent advances an opportunity or deliverable
4. Add payload controls:
   - limit repeated `loadSkill` calls per turn
   - cache or summarize loaded skills
   - compact tool results in `prepareStep`
5. Add orchestration evals:
   - direct Q&A should not trigger artifact tools
   - first opportunity-analysis turn should load/understand brief before artifact tools
   - artifact tools should not all fire unless prerequisites are satisfied
   - max tool calls/token payload should stay under defined thresholds

## Risks

- Prompt-rule conflicts from repeated sequencing mandates.
- Heavy tool economics: forced multi-artifact flow increases latency, cost, and timeout risk.
- Context bloat from verbose skills plus large tool schemas/results.
- Over-hardcoding can block legitimate fast-path direct answers.
- Without explicit evals, tool-calling regressions are likely.

## Skill Resolution

paths-injected

Loaded and applied:

- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`
- `/Users/ricardoaltamirano/.codex/skills/ai-agent-engineer/SKILL.md`
