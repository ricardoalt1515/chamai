I do not have a file-write tool available in this session, so I cannot create `/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/explore-ai-sdk-tool-best-practices.md` directly. Below is the complete, ready-to-paste findings document.

---

```markdown
# AI SDK v6 Tool Best-Practices Exploration

**Scope:** Local AI SDK v6 docs/source + current repo usage.  
**Date:** 2026-05-17  
**Repo:** `/Users/ricardoaltamirano/Developer/SecondstreamAI`

---

## 1. Long-Running Tools & Progress: What Does AI SDK Recommend?

### 1.1 Preliminary Tool Results (Official Pattern)

AI SDK v6 supports **preliminary tool results** via `async function*` (async generator) in a tool's `execute` function. Every `yield` sends a partial update to the UI stream; the **last** yield is the final result.

**Docs reference:**  
- `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx` (section "Preliminary Tool Results")  
- `node_modules/ai/docs/03-agents/06-subagents.mdx` (section "Streaming Subagent Progress")

**Source reference:**  
- `node_modules/ai/src/generate-text/execute-tool-call.ts:104-121` — `executeTool()` returns an iterable; `part.type === 'preliminary'` triggers `onPreliminaryToolResult`.

**Key mechanics:**
```ts
async *execute({ location }) {
  yield { status: 'loading', text: `Getting weather for ${location}` };
  await delay(3000);
  yield { status: 'success', text: `The weather in ${location} is ...`, temperature: 72 };
}
```
- Each `yield` **replaces** the previous output entirely (not append).
- The UI part enters `state: 'output-available'` with `preliminary: true`, then later `preliminary: false` (or absent) when the final result arrives.
- `onPreliminaryToolResult` enqueues the intermediate result into the `toolExecutionStepStreamController`, which pipes into the main UIMessage stream.

### 1.2 Subagent Streaming (The Canonical Use-Case)

The docs explicitly position preliminary results as the way to stream **subagent** progress:

```ts
import { readUIMessageStream, tool } from 'ai';

const researchTool = tool({
  inputSchema: z.object({ task: z.string() }),
  execute: async function* ({ task }, { abortSignal }) {
    const result = await researchSubagent.stream({ prompt: task, abortSignal });
    for await (const message of readUIMessageStream({
      stream: result.toUIMessageStream(),
    })) {
      yield message; // each yield is a complete accumulated UIMessage
    }
  },
});
```

**Docs:** `node_modules/ai/docs/03-agents/06-subagents.mdx:138-145`

### 1.3 Custom Status via Stream Data (Side-Channel)

For progress that is **not** a tool result (e.g. "rendering PDF…"), the docs recommend using `writer.write({ type: 'data-tool-status', ... })` inside `createUIMessageStream`:

**Docs:** `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:600-635`

```ts
execute: async (args, { toolCallId }) => {
  writer.write({
    type: 'data-tool-status',
    id: toolCallId,
    data: { name: 'myTool', status: 'in-progress' },
  });
  // ... long work ...
}
```

This is a **side-channel** via the `writer` from `createUIMessageStream`, not a formal preliminary result. It is useful when:
- The progress is ephemeral (transient).
- You want progress bars/counters outside the tool result part.

### 1.4 Abort Signals

Long-running tools **must** accept and forward `abortSignal`:

**Docs:** `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:670-690`  
**Source:** `node_modules/ai/src/generate-text/execute-tool-call.ts:104` — the signal is passed into `executeTool`.

### 1.5 Async Generator Caveat

The telemetry source explicitly notes a context-capture pattern to maintain OpenTelemetry context across async generator yields:

**Source:** `node_modules/ai/src/telemetry/record-span.ts:26-30`

> "Capture the current context to maintain it across async generator yields."

This implies that if you implement custom tracing inside an `async function* execute()`, you should bind/capture context before yielding, or rely on AI SDK's built-in telemetry spans.

---

## 2. Are Multiple Simultaneous Tool Calls Reliable with Large JSON Inputs?

### 2.1 Execution is Parallel; Parsing is Parallel

Both `generateText` and `streamText` execute **all approved tool calls in parallel** via `Promise.all`:

**Source:**  
- `node_modules/ai/src/generate-text/generate-text.ts:1267-1270`
- `node_modules/ai/src/generate-text/stream-text.ts:1407-1430`

```ts
// generateText.ts
const toolOutputs = await Promise.all(
  toolCalls.map(async toolCall => executeToolCall({ ... }))
);

// streamText.ts
await Promise.all(
  localApprovedToolApprovals.map(async toolApproval => {
    const result = await executeToolCall({ ... });
    if (result != null) {
      toolExecutionStepStreamController?.enqueue(result);
      toolOutputs.push(result);
    }
  })
);
```

### 2.2 Model-Side Reliability (The Real Bottleneck)

The AI SDK docs do **not** guarantee that a model will correctly emit multiple **large** JSON tool-call blocks in one turn. Reliability depends on:

- **Provider/model support for parallel tool calls** — Anthropic Claude supports multiple `tool_use` blocks; the SDK's `streamText` parses them as they arrive.
- **Strict mode** — Enabling `strict: true` per-tool increases reliability by forcing the provider to validate generated arguments against the schema. Not all providers support it.
- **`inputSchema` size** — Very large schemas (e.g. a 4,000-line Field Brief JSON) increase the chance of model truncation or malformed JSON. The SDK has `experimental_repairToolCall`, but that adds a round-trip.

**Docs on strict mode:** `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:140-160`

### 2.3 Practical Recommendation for Large Payloads

If the model must emit several large JSON inputs simultaneously:

1. **Reduce per-tool schema size** — Use a single composite tool (see §3) or move bulk data into the tool execution context rather than the input schema.
2. **Enable `strict: true`** if the provider supports it.
3. **Set a generous `maxOutputTokens`** — The current repo already caps at 32,768 (`AGENT_MAX_OUTPUT_TOKENS` in `src/ai/agents/agent.ts:53`), which is sensible for Claude Sonnet 4.6 (64K max).
4. **Expect repair loops** — The SDK automatically sends malformed tool calls back to the model on the next step, but this consumes steps from `stopWhen`.

---

## 3. Patterns to Reduce Model Tool-Call Burden

### 3.1 Composite / Single Tool with Aggregated Input

Instead of exposing N separate tools (e.g. `generatePdf1`, `generatePdf2`, …), expose **one** tool that accepts an array or a composite payload, then fan out server-side:

```ts
// Instead of 4 separate tools:
const generateArtifacts = tool({
  inputSchema: z.object({
    items: z.array(z.object({ type: z.enum(['pdf', 'pptx']), ... })),
  }),
  execute: async ({ items }) => {
    // Server-side fan-out: Promise.all() internally
    const results = await Promise.all(items.map(generateOne));
    return results;
  },
});
```

This costs the model **one** tool-call block instead of N, reducing:
- Output token count (fewer `tool_use` wrappers)
- Step consumption (one call = one step, not N parallel calls + 1 step)

**Trade-off:** The model loses the ability to react to intermediate failures per-item. Mitigate by returning per-item error states in the composite result.

### 3.2 Server-Side Fanout (Subagents)

The AI SDK docs recommend **subagents** for parallelizing independent work without bloating the main context:

**Docs:** `node_modules/ai/docs/03-agents/06-subagents.mdx:45-50`

> "For tasks like exploring a codebase, you can spawn multiple subagents to research different areas simultaneously. Each returns a summary, and the main agent synthesizes the findings—without paying the context cost of all that exploration."

Key pattern:
- Main agent calls **one** `research` tool.
- That tool internally spawns N subagents in parallel.
- Only the **summary** returns to the main agent via `toModelOutput`.

### 3.3 `toModelOutput` for Context Reduction

Even when streaming progress to the UI, you can hide the full subagent context from the main model:

```ts
const researchTool = tool({
  execute: async function* ({ task }) { /* stream subagent */ },
  toModelOutput: ({ output: message }) => {
    const lastTextPart = message?.parts.findLast(p => p.type === 'text');
    return { type: 'text', value: lastTextPart?.text ?? 'Task completed.' };
  },
});
```

**Docs:** `node_modules/ai/docs/03-agents/06-subagents.mdx:180-210`  
**Source:** `node_modules/ai/src/generate-text/execute-tool-call.ts` — `createToolModelOutput` uses `toModelOutput` if present.

### 3.4 Step Limits & `stopWhen`

AI SDK v6 replaced `maxSteps` with `stopWhen`. The default for `ToolLoopAgent` is `stepCountIs(20)`. The current repo uses `stepCountIs(10)`.

**Docs:** `node_modules/ai/docs/03-agents/04-loop-control.mdx`  
**Source:** `node_modules/ai/docs/08-migration-guides/26-migration-guide-5-0.mdx:1148-1188`

Available controls:
- `stepCountIs(n)` — hard cap
- `hasToolCall('toolName')` — stop after a specific tool
- `isLoopFinished()` — no cap (dangerous)
- Array of conditions — stops when **any** is met

### 3.5 `prepareStep` for Dynamic Tool Selection

Reduce burden by restricting which tools are visible at each step:

```ts
prepareStep: async ({ stepNumber }) => {
  if (stepNumber <= 2) return { activeTools: ['search'], toolChoice: 'required' };
  if (stepNumber <= 5) return { activeTools: ['analyze'] };
  return { activeTools: ['summarize'] };
}
```

**Docs:** `node_modules/ai/docs/03-agents/04-loop-control.mdx:250-320`

### 3.6 Context Pruning in Long Loops

For long-running loops, `prepareStep` can truncate message history:

```ts
prepareStep: async ({ messages }) => {
  if (messages.length > 20) {
    return {
      messages: [messages[0], ...messages.slice(-10)], // keep system + last 10
    };
  }
  return {};
}
```

**Docs:** `node_modules/ai/docs/03-agents/04-loop-control.mdx:183-210`

---

## 4. Logging / Telemetry: Prove Model Emission vs Execution vs Rendering

### 4.1 Built-In OpenTelemetry Spans

AI SDK v6 emits OpenTelemetry spans when `experimental_telemetry: { isEnabled: true }` is set.

**Docs:** `node_modules/ai/docs/03-ai-sdk-core/60-telemetry.mdx`

**Span hierarchy for `streamText`:**
- `ai.streamText` (outer span)
  - `ai.streamText.doStream` (provider call span)
    - `ai.toolCall` (one per tool call)
      - Attributes: `ai.toolCall.name`, `ai.toolCall.id`, `ai.toolCall.args`, `ai.toolCall.result`
  - Events: `ai.stream.firstChunk`, `ai.stream.finish`

**Span hierarchy for `generateText`:**
- `ai.generateText`
  - `ai.generateText.doGenerate`
    - `ai.toolCall`

### 4.2 TelemetryIntegration (Custom Observability)

Instead of wiring callbacks per call, implement `TelemetryIntegration` once and pass it via `experimental_telemetry.integrations`:

```ts
class MyIntegration implements TelemetryIntegration {
  async onStepFinish(event) {
    console.log(`Step ${event.stepNumber} done:`, event.usage.totalTokens);
  }
  async onToolCallFinish(event) {
    if (event.success) {
      console.log(`Tool ${event.toolCall.toolName} took ${event.durationMs}ms`);
    } else {
      console.error(`Tool ${event.toolCall.toolName} failed:`, event.error);
    }
  }
}
```

**Docs:** `node_modules/ai/docs/03-ai-sdk-core/60-telemetry.mdx:91-150`

**Lifecycle hooks available:**
- `onStart` — before any LLM calls
- `onStepStart` — before provider call
- `onToolCallStart` — before `execute` runs
- `onToolCallFinish` — after `execute` completes or errors (includes `durationMs`)
- `onStepFinish` — after LLM step completes
- `onFinish` — after entire generation finishes

### 4.3 Event Callbacks (Per-Call)

For ad-hoc logging without OpenTelemetry, use callbacks on `streamText` / `generateText` / `ToolLoopAgent`:

```ts
const result = await agent.stream({
  onStepFinish: ({ stepNumber, usage, finishReason, toolCalls }) => {
    // Prove: model emitted tool calls
  },
  onToolCallStart: ({ toolCall }) => {
    // Prove: execution began
  },
  onToolCallFinish: ({ toolCall, success, output, durationMs, error }) => {
    // Prove: execution finished (success or error)
  },
});
```

**Current repo usage:** `src/ai/agents/agent.ts:66-78` already logs `step:finish` with `finishReason`, `tools`, and `usage`. This covers **model emission** but not **execution start/finish**.

### 4.4 What to Add (Actionable Guidance)

Based on the logging-best-practices skill (structured JSON, high-cardinality fields), recommend the following additions:

| Concern | Where to Log | Key Fields |
|---|---|---|
| **Model emission** | `onStepFinish` | `step_number`, `finish_reason`, `tool_calls` (names), `usage.input_tokens`, `usage.output_tokens` |
| **Execution start** | `onToolCallStart` | `tool_name`, `tool_call_id`, `thread_id`, `step_number` |
| **Execution end** | `onToolCallFinish` | `tool_name`, `tool_call_id`, `success`, `duration_ms`, `error_type` (if any) |
| **Rendering state** | UI message parts | `part.state`, `part.preliminary` (true/false), `part.type` |

**Recommended structured log shape (server-side):**

```ts
// In ToolLoopAgent constructor or per-call:
onToolCallStart: ({ toolCall, stepNumber }) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    event: 'tool_call_started',
    request_id: requestId,
    tool_name: toolCall.toolName,
    tool_call_id: toolCall.toolCallId,
    step_number: stepNumber,
  }));
},
onToolCallFinish: ({ toolCall, success, output, durationMs, error }) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: success ? 'info' : 'error',
    event: success ? 'tool_call_completed' : 'tool_call_failed',
    request_id: requestId,
    tool_name: toolCall.toolName,
    tool_call_id: toolCall.toolCallId,
    duration_ms: durationMs,
    error_type: error?.name,
  }));
}
```

**Current repo gap:** `agent.ts` only logs `onStepFinish`. Adding `onToolCallStart` and `onToolCallFinish` (or a `TelemetryIntegration`) would close the "emission vs execution vs rendering" observability triangle.

### 4.5 Proving Rendering

To prove the client rendered preliminary vs final results, the UIMessage part carries:

- `state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'`
- `preliminary?: boolean` — present and `true` during streaming, absent/false when final

**Source:** `node_modules/ai/src/ui-message-stream/ui-message-chunks.ts:97` (chunk schema), `node_modules/ai/src/ui/process-ui-message-stream.ts:149-177` (state machine).

If you add client-side logging, log:
```ts
const isStreaming = part.state === 'output-available' && part.preliminary === true;
const isComplete = part.state === 'output-available' && !part.preliminary;
```

---

## 5. Current Repo Specifics & Gaps

| Area | Current State | Gap / Opportunity |
|---|---|---|
| **Agent** | `ToolLoopAgent` with `stepCountIs(10)` | Good baseline. Could add `prepareStep` for context pruning at high step counts. |
| **Tool streaming** | `loadSkillTool` uses plain `execute` (no generator) | If skills become long-running, switch to `async function*` + preliminary results. |
| **Subagents** | Not used | Opportunity: wrap multi-PDF generation in a subagent with `toModelOutput` to keep main context clean. |
| **Telemetry** | Console `onStepFinish` only | No `onToolCallStart/Finish`, no OpenTelemetry spans, no `TelemetryIntegration`. |
| **Abort** | `abortSignal` propagated to subagents in docs, but not explicitly tested in repo | Ensure all long-running tools forward `abortSignal` to `fetch`/promises. |
| **`toModelOutput`** | Not used anywhere in repo | Could reduce context cost for artifact-heavy turns. |

---

## Source Index

| Path | Relevance |
|---|---|
| `node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx` | Preliminary results, tool execution options, strict mode, error handling |
| `node_modules/ai/docs/03-agents/04-loop-control.mdx` | `stopWhen`, `prepareStep`, manual loops |
| `node_modules/ai/docs/03-agents/06-subagents.mdx` | Subagent patterns, streaming progress, `toModelOutput` |
| `node_modules/ai/docs/03-ai-sdk-core/60-telemetry.mdx` | OpenTelemetry spans, `TelemetryIntegration` |
| `node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx` | Custom data streaming, transient parts, reconciliation |
| `node_modules/ai/src/generate-text/execute-tool-call.ts` | Exact preliminary result handling, `onPreliminaryToolResult`, span recording |
| `node_modules/ai/src/generate-text/generate-text.ts:1267` | `Promise.all` parallel tool execution |
| `node_modules/ai/src/generate-text/stream-text.ts:1407` | `Promise.all` parallel tool execution in streaming |
| `node_modules/ai/src/generate-text/run-tools-transformation.ts` | How preliminary results are enqueued into the stream controller |
| `node_modules/ai/src/ui-message-stream/ui-message-chunks.ts` | Wire format for tool chunks including `preliminary` |
| `node_modules/ai/src/ui/process-ui-message-stream.ts` | UI message state machine (`state`, `preliminary`) |
| `node_modules/ai/src/ui-message-stream/read-ui-message-stream.ts` | Accumulating subagent streams into complete UIMessages |
| `node_modules/ai/src/telemetry/record-span.ts` | Async generator context preservation |
| `src/ai/agents/agent.ts` | Current repo agent configuration |
| `src/lib/chat-handler.ts` | Current repo streaming handler (`createUIMessageStream`, `consumeStream`) |
| `src/ai/tools/load-skill.ts` | Current repo tool implementation (plain async, no generator) |
```

---

**Note:** The file could not be written because no write/edit tool is available in this session. Please paste the markdown block above into `/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/explore-ai-sdk-tool-best-practices.md`.