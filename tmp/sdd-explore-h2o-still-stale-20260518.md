I cannot write to disk (no `write`/`edit` tool in this subagent runtime), but here is the complete SDD explore envelope content. Please save it to:

`/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/sdd-explore-h2o-still-stale-20260518.md`

---

```markdown
# SDD Explore — H2O Artifact Live UI Still Stuck After Reconciliation/Heartbeat Fix

**status:** `explore-complete` — no edits made.  
**date:** 2026-05-18  
**scope:** `src/components/chat-interface.tsx`, `src/lib/chat-reconciliation.ts`, `src/lib/chat-handler.ts`, `src/ai/agents/agent.ts`, `src/ai/tools/h2o-artifacts.ts`, `src/ai/prompts/h2o-allegiant.ts`, AI SDK v6 source (`node_modules/ai/src`).

---

## executive_summary

The recent reconciliation/heartbeat fix is **functionally correct** in the working tree, but the live UI still looks stuck for two independent reasons:

1. **The model is not reliably emitting all four artifact tools.** Server-side logs consistently show only 2–3 of the 4 required `generate*` tools in the final assistant message parts (e.g., `tool-generateFieldBrief:output-available,tool-generatePlaybook:output-error` with no trace of `generateAnalyticalRead` or `generateProposalShell`). The prompt already instructs the model to emit all four in a single assistant response, but compliance is inconsistent.
2. **The 240 s total timeout is being hit** (`isAborted:true` at ~240 s). Because the model emits fewer tools than expected, the remaining work does not happen, and the stream aborts before a closing step can run. The client then sees the same “Pending” card for the one tool that did start, and reconciliation eventually applies the terminal state all at once.

The heartbeat component (`ArtifactPackageHeartbeat`) is **correctly implemented** in the current working tree and would show if the running code matched the working tree. Its absence in screenshots strongly suggests the UI process is stale (un-restarted dev server or cached bundle).

---

## evidence

### Server-side request logs
- **Request `0cb55e04`**, thread `d5CXAFf_xMw3HMPgxy18n` (latest repro):
  - `onFinish:before-save` at 05:59:53Z, `isAborted:true`
  - Duration: **240 398.93 ms** (hits the `totalMs: 240_000` cap)
  - Parts summary: `step-start,tool-loadSkill:output-available` ×4, `step-start,text,tool-generateFieldBrief:output-available,tool-generatePlaybook:output-error`
  - **Zero** mention of `generateAnalyticalRead` or `generateProposalShell` in the persisted parts array — not even as sanitized `output-error` stubs.

- **Request `62b90fbf`** (previous repro):
  - Same 240 s abort pattern
  - Parts: FieldBrief completed, Playbook completed, AnalyticalRead error — again, only **3 of 4** tools present.

### AI SDK v6 stream mechanics (source verified in `node_modules/ai/src`)
- `runToolsTransformation` (`generate-text/run-tools-transformation.ts`) executes tools in parallel via non-blocking `executeToolCall` promises.
- Tool results are enqueued into the combined stream as each completes (both via `onPreliminaryToolResult` and the final `.then`).
- The `finish` chunk is held back until all outstanding tool results arrive (`attemptClose`), but individual `tool-output-available` chunks **do stream live** to the client.
- H2O artifact tools use plain `async` execute functions (not async generators), so they emit **no preliminary updates** — only a single `tool-output-available` chunk when the full PDF render + S3/DDB persist is done.

### UI code audit
- `shouldShowArtifactPackageHeartbeat` returns `true` when any artifact part is in a non-terminal state (`input-streaming`, `input-available`, etc.). Tests verify this.
- `ArtifactPackageHeartbeat` is rendered at the top of the assistant message content **before** the parts map, so it is visible while any artifact is pending.
- The render key (`toolRenderKey`) changes when a tool transitions to terminal, which can cause a React remount but does not suppress the heartbeat.

### Screenshot evidence
- Screenshot 1 (localhost:3000): model text says “Now emitting all four artifacts in parallel:”, yet only **one** Field Brief card is visible as Pending. No heartbeat banner is shown.
- Screenshot 2 (minutes later): terminal states appear all at once after the abort.

---

## likely_root_cause

### 1. Model tool-emission compliance failure (primary)
The prompt (`h2o-allegiant.ts`) contains:
> “On opportunity-advancing turns, emit ALL FOUR tool_use calls … in a SINGLE assistant response. Do not call one, wait, then call the next.”

Despite this, the model emits a **variable subset** (2–3 tools). Because the tools are large JSON payloads (complex Zod schemas), the model may be truncating its own output, or it may be “deciding” to emit fewer tools based on internal reasoning. The fact that the text says “all four” but the actual tool-call block is incomplete confirms this is **model-side non-compliance**, not a client rendering bug.

If the model had emitted all four and only some timed out, the `sanitizeAbortedToolParts` logic would have converted the incomplete ones to `output-error`, and we would see all four in the `onFinish:before-save` log. We do not.

### 2. Total timeout is the hard ceiling (secondary)
The `timeout: { totalMs: 240_000 }` in `chat-handler.ts` is consistently hit. The Lambda hard cap is 300 s, leaving only 60 s of headroom. The comment estimates p95 at 150–180 s, but real-world execution (especially parallel `@react-pdf` rendering + S3/DDB writes on Lambda vCPU) is evidently pushing against the 240 s limit. When the abort fires:
- The `onFinish` callback runs (`isAborted:true`).
- `sanitizeAbortedToolParts` downgrades any non-terminal tool parts to `output-error`.
- Reconciliation on the client eventually replaces the live message with the persisted snapshot.
- Because the client may not have received the intermediate `tool-output-available` chunks (or the stream was so long that updates were sparse), the transition looks like “everything snapped to terminal at once.”

### 3. UI heartbeat is missing in the running process (tertiary)
The `ArtifactPackageHeartbeat` component and predicate are **correct** in the working tree, but the screenshots show it absent. The most parsimonious explanation is that the `localhost:3000` dev server or the browser bundle is **not running the latest code** (uncommitted fix not hot-reloaded, or Next.js HMR failed). If the code were current, a visible Field Brief in `input-available` state **would** trigger the heartbeat.

---

## recommended_next

Ranked by smallest-to-largest code change and confidence of impact:

### A. Ensure the UI heartbeat is actually running (zero code, deploy/verify)
- Restart the local dev server (`bun run dev`) and hard-refresh the browser.
- Confirm the heartbeat banner appears when a Field Brief card is in Pending state.
- If it still does not appear, that would indicate a render-order bug (predicate running before parts are hydrated), but current code review makes this unlikely.

### B. Increase total timeout margin (1-line change)
- Bump `timeout: { totalMs: 240_000 }` → `280_000` in `src/lib/chat-handler.ts`.
- Rationale: Lambda hard cap is 300 s; the current 240 s leaves 60 s for `onFinish` persistence, but the observed flow is exhausting it. A 40 s extension gives more headroom for slow `@react-pdf` renders.
- Risk: If the model continues to emit only 2 tools, this only delays the abort; it does not fix the missing artifacts.

### C. Prompt/tool orchestration change (medium change, highest impact)
- **Option C1 — Stronger prompt engineering:** Add an XML-formatted “package emission” block to the prompt, explicitly listing all four tools with their names, and instruct the model to output the tool-use block immediately after the short text preamble. Add a negative example (“Do NOT emit fewer than four tools”).
- **Option C2 — Single meta-tool (structural fix):** Replace the four separate `generate*` tools with one `generateArtifactPackage` tool whose input schema contains all four payloads. The model makes **one** tool decision, and the server internally parallelizes the four PDF renders. This guarantees all four are always emitted together, reduces model output tokens, and keeps the agent step count low.
  - This is the most reliable fix because it removes the model’s discretion entirely.
  - It requires updating `src/ai/tools/h2o-artifacts.ts`, the prompt, and the UI type definitions.

### D. Add streaming progress inside long tool executions (medium change)
- Convert `persistArtifact` from a plain async function to an async generator that yields preliminary progress updates (e.g., “rendering PDF…”, “uploading to S3…”). The AI SDK `executeTool` will forward these as `preliminary` results, giving the UI live granular progress.
- This improves perceived responsiveness but does not fix the missing-tools problem.

### E. Background/async artifact generation (large architectural change)
- Have the model queue artifact jobs and return immediately. The UI polls or uses WebSockets for completion.
- This would eliminate the timeout issue entirely but requires a job queue, DynamoDB status tracking, and UI polling infrastructure.

**Recommendation:** Do **A + B** immediately for quick relief, then **C2** as the durable fix. C2 is the smallest *structural* fix that actually solves the root cause.

---

## risks

- **Meta-tool migration (C2)** changes the API contract between the model and the server. Existing persisted messages with the old four tool types will still render (backward compatibility), but new turns will use the new single tool. Type definitions and any downstream analytics that depend on the four tool names will need updating.
- **Timeout increase (B)** alone risks masking the underlying model non-compliance. Users will still get incomplete artifact packages (e.g., only Field Brief + Playbook) but wait longer for the failure.
- **Prompt-only fix (C1)** may not be sufficient. The prompt already uses imperative “MUST” language and the model still non-complies. Further prompt tuning has diminishing returns.
- **Lambda streaming limitations:** Even with perfect server-side streaming, AWS Lambda Function URLs may buffer SSE responses depending on the invoke mode. Verify `RESPONSE_STREAM` invoke mode is configured if live chunk delivery is still suspect after other fixes.

---

## skill_resolution

- **ai-sdk SKILL.md:** Used to verify AI SDK v6 APIs (`ToolLoopAgent`, `DefaultChatTransport`, `processUIMessageStream`, `runToolsTransformation`, `executeToolCall`). Confirmed that tool execution is parallel and results stream as they complete, but plain async `execute` functions emit no preliminary progress.
- **ai-elements SKILL.md:** Confirmed that AI Elements components are local-source components that can be customized. No changes needed to the library; the heartbeat logic is correct in the project’s component file.
- **logging-best-practices SKILL.md:** The existing server-side logs (`[chat] onFinish:before-save`, `[chat-ui] reconciliation_decision`) follow structured logging with request/thread IDs and machine-readable event names. No logging changes required for this investigation, though adding `tool_emission_count` and `expected_tool_emission_count` to the `onFinish` log would make future debugging faster.

---

## engram_note

*No write tool available in this subagent session. The following should be saved to Engram under project `SecondstreamAI`:*

- **Title:** Discovered model emits only 2–3 of 4 required H2O artifact tools
- **Type:** discovery
- **Scope:** project
- **Topic key:** h2o-artifact-tool-emission
- **Content:**
  - **What:** Server logs show the Claude model consistently emits only 2–3 of the 4 required `generate*` tool calls despite prompt saying “emit ALL FOUR in a SINGLE assistant response.”
  - **Why:** The prompt compliance is inconsistent; large tool schemas may contribute to the model truncating or skipping tool calls.
  - **Where:** `src/ai/prompts/h2o-allegiant.ts`, `src/ai/tools/h2o-artifacts.ts`, `src/lib/chat-handler.ts`
  - **Learned:** A single meta-tool (`generateArtifactPackage`) is likely the most reliable fix because it removes model discretion. Also, the 240 s timeout is being hit in production, leaving insufficient headroom for the full skill pipeline + 4 PDF renders.

- **Title:** H2O artifact heartbeat is correct in tree but may not be running in dev server
- **Type:** discovery
- **Scope:** project
- **Topic key:** h2o-artifact-heartbeat
- **Content:**
  - **What:** `shouldShowArtifactPackageHeartbeat` and `ArtifactPackageHeartbeat` are correctly implemented in the working tree and pass unit tests.
  - **Why:** Screenshots from localhost:3000 show the heartbeat absent despite a visible Pending Field Brief card, suggesting the running bundle is stale.
  - **Where:** `src/components/chat-interface.tsx`, `src/components/chat-interface.test.tsx`
  - **Learned:** Before investigating rendering bugs, always verify the dev server has been restarted and the browser has hard-refreshed.
```

---

**Note to parent:** I do not have a file-write tool in this subagent runtime, so I could not save the markdown directly to `tmp/sdd-explore-h2o-still-stale-20260518.md`. Please persist the content above to that path. I also do not have access to `mem_save`; the Engram notes are included in the envelope for manual saving if desired.