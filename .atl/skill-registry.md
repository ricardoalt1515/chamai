# Skill Registry

**Orchestrator use only.** Read this registry once per session to resolve skill paths, then pass pre-resolved paths directly to each sub-agent's launch prompt. Sub-agents receive the path and load the skill directly — they do NOT read this registry.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When creating a pull request, opening a PR, or preparing changes for review | branch-pr | /Users/ricardoaltamirano/.claude/skills/branch-pr/SKILL.md |
| Use when reviewing code before merge | code-review | /Users/ricardoaltamirano/.agents/skills/code-review/SKILL.md |
| Use when refactoring code for clarity without changing behavior | code-simplification | /Users/ricardoaltamirano/.agents/skills/code-simplification/SKILL.md |
| Use when user wants to stress-test a plan against documented domain language | domain-model | /Users/ricardoaltamirano/.agents/skills/domain-model/SKILL.md |
| Use when building or modifying user-facing interfaces | frontend-ui-engineering | /Users/ricardoaltamirano/.agents/skills/frontend-ui-engineering/SKILL.md |
| When writing Go tests, using teatest, or adding test coverage | go-testing | /Users/ricardoaltamirano/.claude/skills/go-testing/SKILL.md |
| Use when user wants to stress-test a plan or mentions "grill me" | grill-me | /Users/ricardoaltamirano/.agents/skills/grill-me/SKILL.md |
| Use "idea-refine" or "ideate" to trigger | idea-refine | /Users/ricardoaltamirano/.agents/skills/idea-refine/SKILL.md |
| Use when user wants to improve architecture or testability | improve-codebase-architecture | /Users/ricardoaltamirano/.agents/skills/improve-codebase-architecture/SKILL.md |
| Use when designing dashboards, admin panels, apps, and interactive products | interface-design | /Users/ricardoaltamirano/.agents/skills/interface-design/SKILL.md |
| When having to write a detailed plan for a project | interview-me-plan | /Users/ricardoaltamirano/.claude/skills/interview-me-plan.md/SKILL.md |
| When creating a GitHub issue, reporting a bug, or requesting a feature | issue-creation | /Users/ricardoaltamirano/.claude/skills/issue-creation/SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | judgment-day | /Users/ricardoaltamirano/.claude/skills/judgment-day/SKILL.md |
| Use before implementing logs in a medium to large scale production system | Logging Best Practices | /Users/ricardoaltamirano/.agents/skills/logging-best-practices/SKILL.md |
| Use this skill for all Mastra development | mastra | /Users/ricardoaltamirano/Developer/openchat/.agents/skills/mastra/SKILL.md |
| Use when user asks to create a new skill or document AI patterns | skill-creator | /Users/ricardoaltamirano/.claude/skills/skill-creator/SKILL.md |
| Applies when working with shadcn/ui or components.json projects | shadcn | /Users/ricardoaltamirano/.agents/skills/shadcn/SKILL.md |
| Use when preparing to deploy to production | shipping-and-launch | /Users/ricardoaltamirano/.agents/skills/shipping-and-launch/SKILL.md |
| Trigger: When styling with Tailwind - cn(), theme variables, no var() in className | tailwind-4 | /Users/ricardoaltamirano/.claude/skills/tailwind-4/SKILL.md |
| Use when setting up Tailwind CSS v4 in Expo with NativeWind | tailwind-setup | /Users/ricardoaltamirano/.claude/skills/tailwind-setup/SKILL.md |
| Use when designing/debugging prompts for LLM APIs | ai-prompt-engineering | /Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md |
| Use when building AI agents with Pydantic AI or Claude SDK | agentic-development | /Users/ricardoaltamirano/.agents/skills/agentic-development/SKILL.md |
| Use when designing AI agent harnesses and tool/action spaces | agent-harness-construction | /Users/ricardoaltamirano/.agents/skills/agent-harness-construction/SKILL.md |
| Use for autonomous AI agent architecture and orchestration | ai-agents-architect | /Users/ricardoaltamirano/.agents/skills/ai-agents-architect/SKILL.md |
| Use when building chatbot/assistant UIs with ai-elements | ai-elements | /Users/ricardoaltamirano/.agents/skills/ai-elements/SKILL.md |
| Use for strict UI engineering taste and metric-based design rules | design-taste-frontend | /Users/ricardoaltamirano/.agents/skills/design-taste-frontend/SKILL.md |
| Use for editorial minimalist interfaces | minimalist-ui | /Users/ricardoaltamirano/.agents/skills/minimalist-ui/SKILL.md |
| Use to upgrade existing sites/apps to premium quality without breaking functionality | redesign-existing-projects | /Users/ricardoaltamirano/.agents/skills/redesign-existing-projects/SKILL.md |
| Use to generate premium anti-generic Stitch DESIGN.md systems | stitch-design-taste | /Users/ricardoaltamirano/.agents/skills/stitch-design-taste/SKILL.md |
| Use when optimizing Postgres queries/schema/configuration | supabase-postgres-best-practices | /Users/ricardoaltamirano/.agents/skills/supabase-postgres-best-practices/SKILL.md |
| Use when writing/reviewing React/Next.js for performance best practices | vercel-react-best-practices | /Users/ricardoaltamirano/.claude/skills/vercel-react-best-practices/SKILL.md |
| Use when asked to review UI/accessibility/UX against best practices | web-design-guidelines | /Users/ricardoaltamirano/.claude/skills/web-design-guidelines/SKILL.md |
| Use when user wants to create a PRD and submit it as a GitHub issue | write-a-prd | /Users/ricardoaltamirano/.agents/skills/write-a-prd/SKILL.md |

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /Users/ricardoaltamirano/Developer/openchat/AGENTS.md | Index — references files below |
| src/mastra | /Users/ricardoaltamirano/Developer/openchat/src/mastra | Referenced by AGENTS.md |
| src/mastra/agents | /Users/ricardoaltamirano/Developer/openchat/src/mastra/agents | Referenced by AGENTS.md |
| src/mastra/workflows | /Users/ricardoaltamirano/Developer/openchat/src/mastra/workflows | Referenced by AGENTS.md |
| src/mastra/tools | /Users/ricardoaltamirano/Developer/openchat/src/mastra/tools | Referenced by AGENTS.md |
| src/mastra/mcp | /Users/ricardoaltamirano/Developer/openchat/src/mastra/mcp | Referenced by AGENTS.md |
| src/mastra/scorers | /Users/ricardoaltamirano/Developer/openchat/src/mastra/scorers | Referenced by AGENTS.md |
| src/mastra/public | /Users/ricardoaltamirano/Developer/openchat/src/mastra/public | Referenced by AGENTS.md |
| src/mastra/index.ts | /Users/ricardoaltamirano/Developer/openchat/src/mastra/index.ts | Referenced by AGENTS.md |
| .env.example | /Users/ricardoaltamirano/Developer/openchat/.env.example | Referenced by AGENTS.md |
| package.json | /Users/ricardoaltamirano/Developer/openchat/package.json | Referenced by AGENTS.md |
| tsconfig.json | /Users/ricardoaltamirano/Developer/openchat/tsconfig.json | Referenced by AGENTS.md |
| .cursorrules | /Users/ricardoaltamirano/Developer/openchat/.cursorrules | Standalone convention file |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
