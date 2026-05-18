I couldn’t write to `/tmp/...retry.md` from this session (no write tool available), so here is the exact explore content to save:

---

# SDD Explore — AI SDK v6 Sequential Tool Orchestration Guidance (Retry)

## status
blocked_on_file_write (analysis complete; unable to persist file from this tool-limited session)

## executive_summary
- For **sequential artifact orchestration** in AI SDK v6 `ToolLoopAgent`, the safest control is **`prepareStep` + `activeTools` + per-step `toolChoice`**. Prompt-only is soft; `stopWhen` is not an ordering mechanism.
- For Lambda/H2O timeouts, prefer **explicit `totalMs` + `stepMs`** (with total below Lambda hard cap). In this repo, `totalMs: 240_000` is already justified; if adding step guardrails, use e.g. `stepMs: 120_000`. Avoid aggressive `chunkMs`.
- H2O prompt/skill text is internally inconsistent today: system prompt requires “emit all four together,” while `h2o-field-brief` still references obsolete `present_files` staged behavior.
- Structured logging can be improved substantially with existing callbacks (`onStepFinish`, `onFinish`) and tool wrappers—no OpenTelemetry overhaul required.
- Focused tests should pin sequential gating policy, timeout shape, prompt contract cleanup, and logging payloads.

## evidence/citations
1. **Tool-loop control primitives**
   - `prepareStep` runs before each step and can set `toolChoice` / `activeTools`:  
     `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:370,394,396`
   - `toolChoice` options (`auto|required|none|{type:'tool'}`):  
     `.../15-tools-and-tool-calling.mdx:559,565,567`
   - `activeTools` limits callable tools; default all tools active:  
     `.../15-tools-and-tool-calling.mdx:1014,1020,1021`
   - Agent loop docs show phased tool control via `prepareStep` + `activeTools` + `toolChoice`:  
     `node_modules/ai/docs/03-agents/04-loop-control.mdx:232,233,240,246,247`

2. **`stopWhen` is not sequencing**
   - Stop conditions are evaluated when last step has tool results (not a planner):  
     `.../15-tools-and-tool-calling.mdx:238`
   - Default ToolLoopAgent stop condition is `stepCountIs(20)`:  
     `node_modules/ai/src/agent/tool-loop-agent.ts:30,86`  
     `node_modules/ai/docs/03-agents/04-loop-control.mdx:19`

3. **Parallel execution behavior (why batching happens today)**
   - Tool calls are executed with `Promise.all` in core generate/stream paths:  
     `node_modules/ai/src/generate-text/generate-text.ts:1267`  
     `node_modules/ai/src/generate-text/stream-text.ts:1407`

4. **Timeout semantics**
   - Timeout object supports `totalMs`, `stepMs`, `chunkMs`; chunk timeout aborts on no chunks:  
     `node_modules/ai/docs/07-reference/01-ai-sdk-core/02-stream-text.mdx:447,451`
   - Core applies total timeout via `AbortSignal.timeout(totalMs)` and per-step timeout via `stepMs`:  
     `node_modules/ai/src/generate-text/stream-text.ts:545,1503`  
     `node_modules/ai/src/generate-text/generate-text.ts:453,657`

5. **Current repo behavior**
   - Current chat timeout is `timeout: { totalMs: 240_000 }` with Lambda 5-min rationale:  
     `src/lib/chat-handler.ts:410-418`
   - Existing tests assert `totalMs: 240_000`:  
     `src/lib/chat-handler.test.ts:231`
   - Current prompt mandates “emit all four together”:  
     `src/ai/prompts/h2o-allegiant.md:10,32,95,159`
   - `h2o-field-brief` skill still instructs `present_files(...)` staged flow (stale for current toolchain):  
     `src/ai/skills/h2o-field-brief/SKILL.md:30,34,36,210,221,227,236-239`
   - Runtime artifact tools are atomic `generate*` returning PDF URLs; no `present_files` tool:  
     `src/ai/tools/h2o-artifacts.ts:258-282`

6. **Prompt-engineering guidance consulted**
   - “Tool/Agent Planner: plan-then-act, one tool per turn” (baseline sequential pattern):  
     `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md:44`
   - Deterministic agent template says one tool call per turn unless explicitly parallelized:  
     `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/assets/standard/template-agent.md:40-42`

## recommendation

### Q1) Safest way to encourage one artifact tool at a time?
Use **`prepareStep` as the control point**, returning:
- `activeTools: ['exactNextTool']`
- `toolChoice: { type: 'tool', toolName: 'exactNextTool' }` (or `'required'` if only one active tool)

Why:
- Prompt-only is non-binding.
- `toolChoice` alone is static unless changed per step.
- `activeTools` alone limits candidates but doesn’t force call.
- `stopWhen` controls termination, not ordering.

### Q2) Timeout config for Lambda/H2O?
Use an object form with both budgets, but keep total below Lambda hard cap:
- Prefer: **`{ totalMs: 240_000, stepMs: 120_000 }`**
- Avoid `totalMs: 300_000` (no headroom for cleanup/persist on abort).
- Keep `totalMs` (yes), and **avoid `chunkMs`** unless very conservative; chunk silence can happen during heavy tool execution and cause false aborts.

### Q3) Exact replacement wording (prompt/skill)
Replace “emit all four together” + stale `present_files` text with:

**System prompt snippet (h2o-allegiant):**
> On opportunity-advancing turns, generate artifacts **sequentially** in priority order:  
> 1) `generateFieldBrief` → wait for result  
> 2) `generatePlaybook` → wait for result  
> 3) `generateAnalyticalRead` → wait for result  
> 4) `generateProposalShell` → wait for result  
> Call **at most one `generate*` tool per assistant turn**.  
> Do not batch multiple artifact tool calls in a single turn.  
> After each tool result, continue to the next required artifact until all required artifacts are ready, then provide a short completion summary with links from tool results only.

**Skill snippet (h2o-field-brief) replacing `present_files`:**
> Runtime contract: artifact tools return persisted PDF metadata/URLs directly.  
> Use only `generateFieldBrief`, `generatePlaybook`, `generateAnalyticalRead`, `generateProposalShell`.  
> **Do not call `present_files`**.  
> Sequential policy: one artifact tool call per turn, Field Brief first, then Playbook, Analytical Read, Proposal Shell.

### Q4) Structured logging without OTel over-engineering
Use existing surfaces:
1. Keep/enrich agent `onStepFinish` log in `agent.ts` with:
   - `threadId` (if available via context injection), `stepNumber`, `finishReason`, `toolNames`, token usage, cache read/write.
2. Add `onFinish` callback at agent level (supported) for per-request aggregate:
   - total steps, total tokens, final finishReason, elapsed ms.
3. In artifact tools (`persistArtifact` path), add structured start/success/failure logs:
   - `toolName`, `kind`, `threadId`, `artifactId`, render ms, storage ms, error class.
4. Keep existing chat-handler logs (already good) and ensure consistent correlation keys:
   - `threadId`, `messageId`, `requestId` across `[chat]` and `[agent]`.

### Q5) Focused tests to prove changes
1. **Agent orchestration unit test** (`src/ai/agents/agent.test.ts`):
   - assert `prepareStep` policy returns single `activeTools` + forced `toolChoice` by phase.
2. **Chat timeout contract test** (`src/lib/chat-handler.test.ts`):
   - update expectation from `{ totalMs: 240_000 }` to new object shape (if adopted), and keep total cap assertion.
3. **Prompt contract test** (`agent.test.ts` or prompt snapshot):
   - assert prompt no longer contains “emit all four together” or `present_files`.
   - assert it contains “one artifact tool per turn” and explicit order.
4. **Skill text regression check**:
   - assert `h2o-field-brief/SKILL.md` no longer references `present_files`.
5. **Logging test(s)**:
   - verify structured keys in `onStepFinish`/`onFinish` payloads and artifact tool logs on success/failure.

## risks
- Sequential policy increases end-to-end latency vs current parallel batch behavior.
- Too-small `stepMs` may abort long model-thinking steps.
- If `totalMs` removed or set too high, Lambda may hard-kill before persistence cleanup.
- Prompt-only sequencing without `prepareStep` can regress under model variance.

## skill_resolution
- Loaded/reviewed:
  - `~/.agents/skills/ai-sdk/SKILL.md`
  - `~/.agents/skills/ai-prompt-engineering/SKILL.md`
  - prompt-engineering references/templates relevant to tool sequencing.
- Verified against local AI SDK docs/source under:
  - `node_modules/ai/docs`
  - `node_modules/ai/src`
- Reviewed requested repo files:
  - `src/ai/agents/agent.ts`
  - `src/lib/chat-handler.ts`
  - `src/ai/prompts/h2o-allegiant.md`
  - `src/ai/prompts/h2o-allegiant.ts`
  - `src/ai/skills/h2o-field-brief/SKILL.md`
  - `src/ai/tools/h2o-artifacts.ts`

--- 

If you want, I can reformat this into the exact markdown file body style your SDD template expects (same content, stricter heading schema).