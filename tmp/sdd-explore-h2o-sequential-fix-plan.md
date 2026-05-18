Here is the concrete implementation plan. I do not have a write tool in this session, so I am returning the full document below; it can be copied to `/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/sdd-explore-h2o-sequential-fix-plan.md`.

---

# SDD Explore: H2O Sequential Artifact Tool Fix — Implementation Plan

## Goal
Replace the current “emit 4 artifact tools together under a single 240s total timeout” pattern with a **sequential, per-step/per-tool** pattern that:
1. Does not depend on the model batching 4 huge tool calls.
2. Uses `stepMs` (and optional per-tool timeouts) instead of a shared `totalMs`.
3. Removes all references to the nonexistent `present_files` tool from prompts and skills.
4. Adds granular logs for emission vs execution vs render.
5. Generates artifacts sequentially: Field Brief → Playbook → Analytical Read → Proposal Shell.

## Root Cause
- `src/ai/prompts/h2o-allegiant.md` **explicitly instructs** the model to emit all four `generate*` tools in a single assistant response (lines 9 and 33-35).
- `src/ai/skills/h2o-field-brief/SKILL.md` references a nonexistent `present_files` tool 10 times (lines 30, 34, 36, 210, 211, 221, 227, 236-239).
- `src/lib/chat-handler.ts:418` sets `timeout: { totalMs: 240_000 }`. When the model emits 4 tools together, the AI SDK executes them inside **one step**. If any tool hangs or the aggregate render time exceeds the budget, the entire step aborts and **all** tool results are lost. AWS logs showed only 2 of 4 artifacts persisted before abort.
- There is **no logging** inside the artifact tool `execute` functions or the PDF render path, making it impossible to distinguish “model emitted the tool” from “PDF render completed” from “DynamoDB write succeeded.”

## Reference Pattern
The reference project (`/Users/ricardoaltamirano/Developer/SecondStream`) calls PDF tools **one at a time** with **per-tool timeouts**. We replicate that with two layers:
- **Prompt layer**: instruct the model to emit one tool at a time.
- **Code guardrail**: `ToolLoopAgent.prepareStep` restricts `activeTools` after the first artifact is emitted, forcing sequential execution even if the model ignores the prompt.

---

## Files to Change

### 1. `src/ai/prompts/h2o-allegiant.md`
**Editing surface** (`.ts` is generated from this).

| Line | Current Text | Change |
|------|--------------|--------|
| 9 | `On opportunity-advancing turns the four `generate*` tools MUST be emitted together in one assistant response so the runtime parallelizes them.` | **Delete** |
| 33-35 | `On opportunity-advancing turns, emit ALL FOUR tool_use calls ... in a SINGLE assistant response. Do not call one, wait, then call the next. The runtime executes the four tool calls in parallel...` | **Replace** with sequential instructions |
| 33-35 (new) | — | `On opportunity-advancing turns, emit the four artifact tools ONE AT A TIME in this exact order, waiting for each result before continuing:`<br>1. `generateFieldBrief`<br>2. `generatePlaybook`<br>3. `generateAnalyticalRead`<br>4. `generateProposalShell`<br>After the fourth result returns, present all four in priority order in your reply text — Field Brief headline first, then the other three. |
| 90 | `render the four-artefact package by emitting the four `generate*` tool calls together in a single assistant response. The runtime runs them in parallel.` | `render the four-artefact package by emitting the four `generate*` tool calls one at a time in order: Field Brief, Playbook, Analytical Read, Proposal Shell.` |
| 108 | `All four PDF tool calls emitted in the same assistant response` | `All four PDF tool calls emitted sequentially, one per assistant response` |
| 145 | `four PDFs returned from a single parallel tool-call batch` | `four PDFs returned from sequential tool calls` |
| 149 | `emit all four tool calls TOGETHER in a single assistant response` | `emit all four tool calls sequentially, one per step` |

### 2. `src/ai/prompts/h2o-allegiant.ts`
Regenerate from the `.md` file (or apply the same string replacements). Keep the `// biome-ignore format: generated prompt string` header.

### 3. `src/ai/skills/h2o-field-brief/SKILL.md`
Remove **all** `present_files` references (the tool does not exist in the runtime).

| Lines | Action |
|-------|--------|
| 30 | `2. Call \`present_files([field_brief_path])\` — field agent sees Field Brief now` → `2. Call \`generateFieldBrief\` and wait for the result` |
| 34 | `6. Call \`present_files([playbook_path, analytical_path, proposal_path])\` — three more artefacts arrive` → `6. Call \`generatePlaybook\`, then \`generateAnalyticalRead\`, then \`generateProposalShell\`, waiting for each result` |
| 36 | `This staged presentation is mandatory. **Do not batch all four into a single \`present_files\` call**` → `Sequential generation is mandatory. **Do not emit more than one artifact tool per assistant response.**` |
| 210 | `- Field Brief has been presented via \`present_files\`` → `- Field Brief has been generated and its result returned` |
| 211 | `- The other three have been presented via a second \`present_files\` call` → `- The other three have been generated sequentially and their results returned` |
| 221 | `- **Production order is mandatory.** Field Brief first via \`present_files\`, then the other three. Never batch.` → `- **Production order is mandatory.** Field Brief first, then Playbook, Analytical Read, Proposal Shell. Never batch.` |
| 227 | `- Does not produce all artefacts in one \`present_files\` batch` → `- Does not produce all artefacts in one assistant response` |
| 236-239 | Remove `— presented via first/second \`present_files\` call` from each bullet. |

### 4. `src/ai/agents/agent.ts`
Add a `prepareStep` guardrail to enforce sequential artifact generation **once the first artifact tool has been called**. Before any artifact is started, all tools remain available so conversational turns are unaffected.

```ts
// Add to imports
import type { PrepareStepFunction } from "ai";

const ARTIFACT_SEQUENCE = [
  "generateFieldBrief",
  "generatePlaybook",
  "generateAnalyticalRead",
  "generateProposalShell",
] as const;

const prepareStep: PrepareStepFunction = ({ steps }) => {
  let anyArtifactStarted = false;
  const completed = new Set<string>();

  for (const step of steps) {
    for (const part of step.content) {
      if (part.type === "tool-call" && ARTIFACT_SEQUENCE.includes(part.toolName as typeof ARTIFACT_SEQUENCE[number])) {
        anyArtifactStarted = true;
      }
      if (part.type === "tool-result" && ARTIFACT_SEQUENCE.includes(part.toolName as typeof ARTIFACT_SEQUENCE[number])) {
        completed.add(part.toolName);
      }
    }
  }

  if (!anyArtifactStarted) {
    // Normal conversational turn — don't restrict.
    return undefined;
  }

  const nextArtifact = ARTIFACT_SEQUENCE.find((t) => !completed.has(t));
  if (nextArtifact) {
    return {
      activeTools: ["loadSkill", nextArtifact],
    } as any;
  }

  // All artifacts done — allow normal operation.
  return undefined;
};
```

Then inject it into `createAgent`:

```ts
export const createAgent = ({ tools = {} }: CreateAgentOptions = {}) =>
  new ToolLoopAgent({
    model: bedrockProvider(MODELS[0].runtimeModelId),
    instructions: H2O_AGENT_SYSTEM_MESSAGES,
    stopWhen: stepCountIs(AGENT_MAX_STEPS),
    maxOutputTokens: AGENT_MAX_OUTPUT_TOKENS,
    tools: {
      loadSkill: loadSkillTool,
      ...tools,
    },
    prepareStep: prepareStep as any,
    onStepFinish: ({ toolCalls, finishReason, usage, stepNumber }) => {
      // existing logic, but add stepNumber to the log
      const toolNames = toolCalls.map((call) => call.toolName).join(",") || "none";
      const outputTokens = usage.outputTokens ?? 0;

      console.log("[agent] step:finish", {
        stepNumber,
        finishReason,
        tools: toolNames,
        usage: {
          input: usage.inputTokens,
          output: outputTokens,
          cacheRead: usage.inputTokenDetails?.cacheReadTokens,
          cacheWrite: usage.inputTokenDetails?.cacheWriteTokens,
          total: usage.totalTokens,
        },
      });
    },
  });
```

**No generic signature changes needed** — `prepareStep` is injected with a cast because `ToolLoopAgent` accepts it at runtime and the mock-based tests are loosely typed.

### 5. `src/ai/tools/h2o-artifacts.ts`
Add **per-tool timeout wrapper** and **granular logs**.

Insert near the top (after imports):

```ts
const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
```

Modify `persistArtifact`:

```ts
const persistArtifact = async <...>(
  ctx: ArtifactRequestContext,
  kind: ArtifactKind,
  payload: TPayload,
): Promise<ArtifactToolResult> => {
  const customerSlug = slugFor(payload);
  const title = titleFor(kind, payload);

  console.log(`[artifact:${kind}] render:start`, { threadId: ctx.threadId });
  const renderStart = Date.now();
  const pdfBytes = await renderArtifactPdf(kind, payload);
  console.log(`[artifact:${kind}] render:finish`, {
    threadId: ctx.threadId,
    durationMs: Date.now() - renderStart,
    bytes: pdfBytes.length,
  });

  await ctx.pdfStorage.put({ bytes: pdfBytes, kind, threadId: ctx.threadId, userId: ctx.owner.userId });

  let artifact: Awaited<ReturnType<typeof ctx.artifactStore.putArtifact>>;
  try {
    console.log(`[artifact:${kind}] persist:start`, { threadId: ctx.threadId });
    const persistStart = Date.now();
    artifact = await ctx.artifactStore.putArtifact({ ... }, ctx.owner);
    console.log(`[artifact:${kind}] persist:finish`, {
      threadId: ctx.threadId,
      durationMs: Date.now() - persistStart,
      artifactId: artifact.id,
    });
  } catch (error) {
    // existing orphan cleanup
    await ctx.pdfStorage.delete(...).catch((cleanupError) => {
      console.error("[h2o-artifacts] s3-cleanup-failed", { kind, threadId: ctx.threadId, ... });
    });
    throw error;
  }

  // ... rest unchanged
};
```

Wrap each tool `execute` with timeout and entry/exit logs:

```ts
export const createH2oArtifactTools = (ctx: ArtifactRequestContext) => {
  const TOOL_TIMEOUT_MS = 90_000;

  const runTool = async <T>(
    kind: ArtifactKind,
    input: T,
    toolCallId: string,
  ): Promise<ArtifactToolResult> => {
    console.log(`[artifact:${kind}] execute:start`, { toolCallId, threadId: ctx.threadId });
    const start = Date.now();
    const result = await withTimeout(
      persistArtifact(ctx, kind, input),
      TOOL_TIMEOUT_MS,
      `generate${kind.replace(/(^|-)([a-z])/g, (_, _sep, ch) => ch.toUpperCase())}`,
    );
    console.log(`[artifact:${kind}] execute:finish`, {
      toolCallId,
      threadId: ctx.threadId,
      durationMs: Date.now() - start,
    });
    return result;
  };

  return {
    generateFieldBrief: tool({
      description: "...", // unchanged
      inputSchema: fieldBriefInputSchema,
      execute: async (input, { toolCallId }) => runTool("field-brief", input, toolCallId),
    }),
    generatePlaybook: tool({
      description: "...", // unchanged
      inputSchema: playbookInputSchema,
      execute: async (input, { toolCallId }) => runTool("playbook", input, toolCallId),
    }),
    generateAnalyticalRead: tool({
      description: "...", // unchanged
      inputSchema: analyticalReadInputSchema,
      execute: async (input, { toolCallId }) => runTool("analytical-read", input, toolCallId),
    }),
    generateProposalShell: tool({
      description: "...", // unchanged
      inputSchema: proposalShellInputSchema,
      execute: async (input, { toolCallId }) => runTool("proposal-shell", input, toolCallId),
    }),
  };
};
```

**No Zod schema or return-type changes.** `ArtifactToolResult`, `ArtifactRequestContext`, and download routes are untouched.

### 6. `src/lib/chat-handler.ts`
Change the timeout strategy at line 418.

**Current:**
```ts
timeout: { totalMs: 240_000 },
```

**New:**
```ts
timeout: { totalMs: 300_000, stepMs: 120_000 },
```

Update the comment above it:

```ts
// Lambda Duration.minutes(5) = 300s hard cap.
// Sequential artifact generation means each artifact tool executes in its own step.
// stepMs: 120s gives each step (model think + one PDF render + S3/DDB put)
// generous headroom without letting a hung render consume the whole turn.
// totalMs: 300s is the Lambda backstop, leaving ~60s for onFinish persistence.
```

---

## Tests to Add / Update

### A. `src/ai/agents/agent.test.ts` (update)
Add a test verifying `prepareStep` is passed to `ToolLoopAgent` and enforces the sequence.

```ts
it("passes prepareStep that restricts artifact tools to sequential order", () => {
  createAgent();
  const settings = toolLoopAgentMock.mock.calls.at(-1)?.[0];
  expect(settings.prepareStep).toBeDefined();

  // Simulate: no artifacts started yet → no restriction
  const noArtifacts = settings.prepareStep({ steps: [], stepNumber: 0, messages: [], experimental_context: undefined, model: { provider: "test", modelId: "test" } });
  expect(noArtifacts).toBeUndefined();

  // Simulate: generateFieldBrief completed → next step only allows generatePlaybook
  const afterFieldBrief = settings.prepareStep({
    steps: [{
      content: [
        { type: "tool-call", toolName: "generateFieldBrief", toolCallId: "t1", input: {} },
        { type: "tool-result", toolName: "generateFieldBrief", toolCallId: "t1", input: {}, output: {} },
      ],
      // ... other required StepResult fields can be stubbed
    }],
    stepNumber: 1,
    messages: [],
    experimental_context: undefined,
    model: { provider: "test", modelId: "test" },
  });
  expect(afterFieldBrief.activeTools).toContain("generatePlaybook");
  expect(afterFieldBrief.activeTools).not.toContain("generateAnalyticalRead");
  expect(afterFieldBrief.activeTools).toContain("loadSkill");
});
```

*(The test may need to stub minimal `StepResult` fields because the mock captures the raw function, not typed objects.)*

### B. `src/ai/tools/h2o-artifacts.test.ts` (update)
1. **Timeout test**: Mock `renderArtifactPdf` to delay 200s, assert the tool `execute` rejects with `"timed out after 90000ms"`.
2. **Logging test**: Mock `console.log`, execute `generateFieldBrief`, assert the output contains `[artifact:field-brief] execute:start`, `render:start`, `render:finish`, `persist:start`, `persist:finish`, `execute:finish`.

### C. `src/lib/chat-handler.artifacts.test.ts` (update)
Add an assertion that `requestAgent.stream` is called with the new timeout shape:

```ts
it("uses step-based timeout instead of shared total timeout", async () => {
  // in the existing test, capture the stream call
  const streamSpy = vi.fn(); // attach to the mock agent
  // ...
  expect(streamSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      timeout: expect.objectContaining({ stepMs: expect.any(Number), totalMs: expect.any(Number) }),
    }),
  );
});
```

*(May require plumbing the mock to expose `stream` arguments.)*

### D. `src/ai/prompts/h2o-allegiant.test.ts` (new, optional regression guard)
A lightweight test that imports the generated prompt and asserts:
- The string does **not** contain `in a SINGLE assistant response`
- The string does **not** contain `parallelizes them`
- The string **does** contain `one at a time`

This prevents future edits from reverting to the parallel instruction.

---

## API / UI Type Changes Required?

**None.**

- `ArtifactToolResult`, `ArtifactKind`, `ArtifactRequestContext`, and the four Zod input schemas are unchanged.
- `createH2oArtifactTools` return type is unchanged (same 4 tool keys).
- `createAgent` exported signature remains `(options?: CreateAgentOptions) => Agent`; `CreateAgentOptions` does not need to expose `prepareStep` to callers because it is hardcoded.
- Chat request/response types (`parseChatRequest`, `MyUIMessage`) are untouched.
- No frontend changes.

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Model still tries to batch** despite prompt change | Low | High (defeats the fix) | `prepareStep` guardrail restricts `activeTools` after the first artifact is emitted. Even if the model ignores the prompt, the framework will only expose the next allowed tool. |
| **Step timeout too tight** (120s) for large PDFs | Medium | High (false abort) | Per-tool timeout (90s) catches hung renders first. `stepMs` can be raised to 150s if monitoring shows p95 exceedance. Total timeout (300s) remains as backstop. |
| **Conversational turn accidentally triggers sequential lock** | Low | Medium (model loses access to artifact tools) | `prepareStep` only restricts **after** an artifact tool has already been called (`anyArtifactStarted`). Conversational turns that never call artifacts are unaffected. |
| **Step budget exhaustion** (10 max steps) | Low | Medium | Worst-case new flow: loadSkill (3 skills can still be parallel in one step) → generateFieldBrief → generatePlaybook → generateAnalyticalRead → generateProposalShell → closing reply = **6 steps**. Well under `AGENT_MAX_STEPS = 10`. |
| **Prompt/skill drift** (`.md` edited but `.ts` not regenerated) | Medium | Low | Add a CI check or a `prompts/h2o-allegiant.test.ts` regression test (see Tests D). |
| **Tool timeout swallows legitimate slow renders** | Low | Medium | 90s is ~3× the observed p95 for single @react-pdf renders (~20–30s). If renders grow, raise `TOOL_TIMEOUT_MS`. |

---

## Implementation Order (Small Slice)

This fits the **~700 changed-line review budget** comfortably. The change is roughly:
- `h2o-allegiant.md` / `.ts`: ~15 lines changed
- `h2o-field-brief/SKILL.md`: ~12 lines changed
- `agent.ts`: ~35 lines added
- `h2o-artifacts.ts`: ~45 lines added/modified
- `chat-handler.ts`: ~5 lines changed
- Tests: ~80 lines added
- **Total**: well under 200 changed lines.

### Step 1 — Prompt & Skill Cleanup
1. Edit `src/ai/prompts/h2o-allegiant.md`
2. Regenerate `src/ai/prompts/h2o-allegiant.ts`
3. Edit `src/ai/skills/h2o-field-brief/SKILL.md`

### Step 2 — Agent Guardrail
4. Edit `src/ai/agents/agent.ts` to add `prepareStep` and enrich `onStepFinish` log
5. Update `src/ai/agents/agent.test.ts`

### Step 3 — Tool Logging & Timeout
6. Edit `src/ai/tools/h2o-artifacts.ts`
7. Update `src/ai/tools/h2o-artifacts.test.ts`

### Step 4 — Chat Handler Timeout
8. Edit `src/lib/chat-handler.ts`
9. Update `src/lib/chat-handler.artifacts.test.ts`

### Step 5 — Verification
10. `bun run check` (lint + format)
11. `bun run test` (full suite)
12. `bunx tsc --noEmit` (typecheck)

---

## Why Not a Meta-Tool?

A meta-tool (e.g., `generateArtifactPackage` that internally calls all 4 renders) was considered and **rejected** for this plan because:

1. **It is unnecessary.** The AI SDK `ToolLoopAgent` already supports step-level tool restriction via `prepareStep`. We can enforce sequential behavior without introducing a new abstraction.
2. **It would increase complexity.** A meta-tool would require a new Zod schema that unions all four payload shapes, a new renderer dispatch, and new test coverage. The sequential prompt + `prepareStep` achieves the same outcome with less code.
3. **It would obscure retry granularity.** If one artifact fails validation, the model retries the specific tool. A meta-tool would fail the entire batch.
4. **The reference project does not use a meta-tool.** It calls PDF tools one at a time with per-tool timeouts.

If the `prepareStep` guardrail proves insufficient in production (e.g., the model finds a way to bypass it), a meta-tool can be added as a follow-up without changing the rest of the architecture.

---