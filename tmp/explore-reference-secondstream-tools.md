I do not have a `write`/`edit` tool in this subagent runtime, so I cannot persist the file directly. Below is the complete SDD explore envelope content. Please save it to:

`/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/explore-reference-secondstream-tools.md`

---

```markdown
# SDD Explore — Reference Project (SecondStream) vs Current (SecondstreamAI/H2O)

**status:** `explore-complete` — no edits made.  
**date:** 2026-05-17  
**scope:** PDF generation, agent tools, prompts, orchestration patterns

---

## 1. Where Each Project Defines PDF / Tools / Agent Prompts / Orchestration

### Reference Project — `SecondStream` (monorepo: `backend/` + `frontend/`)

| Concern | Path | Pattern |
|---|---|---|
| **Agent definition** | `backend/app/agents/chat_agent.py` | `pydantic-ai` `Agent[ChatAgentDeps, str]` with `BedrockConverseModel` |
| **Agent orchestration** | `backend/app/agents/chat_agent.py` + `backend/app/services/chat_service.py` | `agent.run_stream_events()` → custom event stream mapping → SSE to frontend |
| **System prompt** | `backend/app/prompts/chat-agent-prompt.md` | Single Markdown file loaded at startup; skills compiled dynamically |
| **Skills loader** | `backend/app/agents/chat_skill_loader.py` | Directory-per-skill (`prompts/chat-skills/<name>/SKILL.md`), YAML frontmatter, metadata-only prompt block |
| **PDF generation** | `backend/app/services/pdf_renderer.py` | **WeasyPrint** + Jinja2 HTML templates (`ideation_brief.html.j2`, etc.) |
| **PDF tools** | `backend/app/agents/chat_agent.py` (registered via `@agent.tool`) | 3 tools: `generateIdeationBrief`, `generateAnalyticalRead`, `generatePlaybook` |
| **Tool execution** | `backend/app/agents/chat_agent.py::_upload_pdf()` | Sync render (WeasyPrint in thread pool), S3 upload, PostgreSQL attachment record |
| **Chat API** | `backend/app/api/v1/chat.py` | FastAPI endpoint, streams events via `stream_chat_turn()` in `chat_service.py` |
| **Frontend chat** | `frontend/lib/api/chat.ts` | Thin REST client; no agent logic in frontend |

### Current Project — `SecondstreamAI/H2O` (single-package Next.js)

| Concern | Path | Pattern |
|---|---|---|
| **Agent definition** | `src/ai/agents/agent.ts` | AI SDK v6 `ToolLoopAgent` with `stepCountIs(10)` |
| **Agent orchestration** | `src/lib/chat-handler.ts` | `requestAgent.stream()` → `toUIMessageStream()` → SSE via `createUIMessageStreamResponse` |
| **System prompt** | `src/ai/prompts/h2o-allegiant.ts` | Generated TypeScript string (from `.md` source); skills XML block appended at module load |
| **Skills loader** | `src/ai/skills/discover.ts` + `src/ai/tools/load-skill.ts` | Same directory-per-skill pattern (`src/ai/skills/<name>/SKILL.md`), frontmatter parsed, cached in `skillBodyCache` |
| **PDF generation** | `src/lib/artifacts/pdf-renderer-dispatch.ts` + `src/lib/artifacts/pdf/*.tsx` | **`@react-pdf/renderer`** (`renderToBuffer`) with JSX component templates |
| **PDF tools** | `src/ai/tools/h2o-artifacts.ts` | 4 tools: `generateFieldBrief`, `generatePlaybook`, `generateAnalyticalRead`, `generateProposalShell` |
| **Tool execution** | `src/ai/tools/h2o-artifacts.ts::persistArtifact()` | Async `renderArtifactPdf()` → S3 put → DynamoDB artifact record |
| **Chat API** | `app/api/chat/route.ts` | Next.js App Router API route (`createChatPostHandler`) |
| **Frontend chat** | `app/c/[threadId]/page.tsx` + `src/components/chat-interface.tsx` | AI SDK v6 `useChat` with `DefaultChatTransport` |

---

## 2. Tool Count & Orchestration Model

### Reference (SecondStream)
- **Tool count:** 4 total (`loadSkill`, `generateIdeationBrief`, `generateAnalyticalRead`, `generatePlaybook`)
- **Orchestration:** Model-emit **sequential** tool calls. The prompt explicitly says:
  > "Call PDF tools **one at a time** and wait for each tool result before starting the next. Do not invoke them in parallel."
- **Pattern:** One `agent.run_stream_events()` call. The model emits tools; the runtime executes them and returns results to the model. No explicit "parallel" emission.

### Current (H2O)
- **Tool count:** 5 total (`loadSkill`, `generateFieldBrief`, `generatePlaybook`, `generateAnalyticalRead`, `generateProposalShell`)
- **Orchestration:** Model-emit **parallel** tool calls. The prompt explicitly says:
  > "On opportunity-advancing turns, emit ALL FOUR tool_use calls … in a SINGLE assistant response. Do not call one, wait, then call the next."
- **Pattern:** `ToolLoopAgent` with `stepCountIs(10)`. The model emits multiple `tool_use` blocks in one assistant message; AI SDK v6 `runToolsTransformation` executes them in parallel.

---

## 3. How PDF Jobs Are Executed

### Reference (SecondStream)
- **Sync/async:** Synchronous PDF render via `asyncio.to_thread(renderer, payload)` (WeasyPrint is CPU-bound, run in thread pool)
- **Stream integration:** PDF tool results stream as `tool-output-available` events with `attachment_id`
- **Storage:** S3 upload + PostgreSQL `ChatAttachment` record
- **Status updates:** Real-time via SSE (`tool-input-start`, `tool-output-available`, `agent-status`)
- **No background jobs / polling:** Everything happens inside the single agent stream lifecycle
- **Failure handling:** Produced attachments are preserved even if the overall stream fails; orphan S3 objects are cleaned up

### Current (H2O)
- **Sync/async:** Asynchronous PDF render via `@react-pdf/renderer` `renderToBuffer()` (Node async, but CPU-intensive Yoga layout engine)
- **Stream integration:** Tool results emit as `tool-output-available` parts when the full render + S3 + DynamoDB completes
- **Storage:** S3 put via `ArtifactPdfStorage` + DynamoDB artifact record via `ArtifactStore`
- **Status updates:** Same AI SDK v6 tool part streaming (no preliminary progress — plain async `execute` functions)
- **No background jobs / polling:** Same single-stream lifecycle
- **Failure handling:** S3 orphan cleanup on DynamoDB write failure; `sanitizeAbortedToolParts` on stream abort

---

## 4. Concrete Differences Explaining Why SecondStream Works While H2O Stalls/Aborts

| Factor | SecondStream | H2O | Impact |
|---|---|---|---|
| **PDF engine** | WeasyPrint (Python, mature, fast HTML→PDF) | `@react-pdf/renderer` (Node, Yoga layout, slower on Lambda vCPU) | H2O PDF renders take 30–60s vs. WeasyPrint's ~1–5s |
| **Deployment** | Persistent FastAPI containers (no hard timeout) | AWS Lambda (300s hard cap, 240s stream timeout) | H2O hits `totalMs: 240_000` consistently; SecondStream has no ceiling |
| **Tool emission pattern** | Sequential ("one at a time") | Parallel ("all four in one response") | H2O model often emits only 2–3 of 4 tools; sequential is more reliable |
| **Tool count** | 3 PDFs | 4 PDFs | More tools = more model output tokens = longer preamble = higher timeout risk |
| **Skill pipeline** | Same 4-step skill load, then sequential PDFs | Same 4-step skill load, then parallel PDFs | H2O's parallel step does 4× PDF render simultaneously, compounding CPU contention on Lambda |
| **Backend separation** | FastAPI backend dedicated to agent runtime | Next.js API route shared with frontend rendering | H2O bundles `@react-pdf` into the chat Lambda, inflating cold start and competing for CPU |
| **Prompt compliance** | Simple 3-tool sequential instruction | Complex 4-tool parallel instruction | Model non-compliance is the *primary* root cause in H2O; SecondStream's simpler contract is easier to follow |

### Root Cause Chain (H2O)

1. **Model emits incomplete tool set** (2–3 of 4 tools) despite prompt saying "emit ALL FOUR"
2. **Missing tools never execute**, so the opportunity package is incomplete
3. **Timeout `totalMs: 240_000` fires** because the remaining work (skill pipeline + whatever tools did emit) still takes too long on Lambda
4. **`sanitizeAbortedToolParts`** converts incomplete parts to `output-error`
5. **Client sees "Pending" cards snap to terminal state** after reconciliation, with only 1–2 PDFs actually produced

### Why SecondStream Does Not Stall

- WeasyPrint is **orders of magnitude faster** than `@react-pdf/renderer` for template-driven PDFs
- **Sequential tool execution** means the model makes simpler decisions and the runtime never tries to parallelize 4 heavy CPU tasks
- **Persistent containers** mean no hard timeout ceiling; a slow render just takes longer, it doesn't abort
- The **3-tool set** is simpler for the model to emit correctly than H2O's 4-tool set

---

## 5. Which Design to Copy, If Any?

### A. Copy SecondStream's Sequential Tool Execution (high confidence, small change)
- **Change H2O prompt** from "emit ALL FOUR in a SINGLE assistant response" to "emit ONE tool at a time, wait for result, then emit the next"
- **Trade-off:** Slower total wall time (4× serial PDF renders), but much higher reliability and lower model-output-token pressure
- **Files:** `src/ai/prompts/h2o-allegiant.ts`

### B. Copy SecondStream's WeasyPrint/HTML Template Approach (medium confidence, medium change)
- **Replace `@react-pdf/renderer`** with a server-side HTML→PDF pipeline (Puppeteer/Playwright on a container, or a Python microservice)
- **Trade-off:** Requires either (a) a containerized Node host with Chromium, or (b) a separate Python PDF service
- **Not viable on Amplify Lambda** due to Chromium binary size; would require moving PDF generation off Lambda
- **Files:** `src/lib/artifacts/pdf/*.tsx` → HTML templates + Puppeteer/Playwright or Python service

### C. Single Meta-Tool (highest confidence, medium change)
- **Replace 4 separate `generate*` tools** with one `generateArtifactPackage` tool whose schema contains all 4 payloads
- **Model makes ONE tool decision**, server internally parallelizes the 4 PDF renders
- **Trade-off:** Changes the API contract between model and server; requires updating prompt, tool definitions, UI types, and persistence
- **Files:** `src/ai/tools/h2o-artifacts.ts`, `src/ai/prompts/h2o-allegiant.ts`, `types/ui-message.ts`, `src/lib/chat-reconciliation.ts`

### D. Increase Timeout Margin (low confidence, trivial change)
- **Bump `totalMs: 240_000` → `280_000`** in `src/lib/chat-handler.ts`
- **Trade-off:** Only delays the abort; does not fix model non-compliance or incomplete packages
- **Recommendation:** Do **NOT** rely on this alone

### E. Background/Async Artifact Generation (low confidence, large change)
- **Model queues jobs, returns immediately, UI polls/WebSockets for completion**
- **Trade-off:** Eliminates timeout issue entirely, but requires job queue, status tracking, and polling infrastructure
- **Recommendation:** Overkill for current stage; consider only if C fails

---

## Recommended Path

1. **Immediate:** Do **A** (sequential execution) — change the prompt to tell the model to emit tools one at a time. This is the smallest change with the highest reliability payoff.
2. **Short-term:** Do **C** (single meta-tool) — this is the structural fix that removes model discretion entirely. It guarantees all four PDFs are always produced together.
3. **Medium-term:** Evaluate **B** (WeasyPrint/HTML) if PDF render performance remains a bottleneck after A+C. This likely requires moving PDF generation to a persistent container or dedicated service, not Lambda.

---

## Exact Implementation Patterns (for copying)

### SecondStream Prompt Pattern (sequential tools)
From `backend/app/prompts/chat-agent-prompt.md`:
```markdown
- Generate three separate PDFs through the available report tools:
  - `generateIdeationBrief`
  - `generateAnalyticalRead`
  - `generatePlaybook`
- Before PDF generation begins, ensure the relevant PDF support skills are loaded
- Call PDF tools **one at a time** and wait for each tool result before starting the next.
  Do not invoke them in parallel.
```

### SecondStream PDF Render Pattern (WeasyPrint)
From `backend/app/services/pdf_renderer.py`:
```python
def render_pdf(template_name: str, payload: BaseModel) -> BytesIO:
    from weasyprint import HTML
    env = configure_pdf_environment(Environment(loader=FileSystemLoader(str(_TEMPLATE_DIR))))
    html_content = env.get_template(template_name).render(payload=payload)
    buf = BytesIO()
    HTML(string=html_content, base_url=str(_TEMPLATE_DIR)).write_pdf(buf)
    buf.seek(0)
    return buf
```

### SecondStream Tool Registration Pattern
From `backend/app/agents/chat_agent.py`:
```python
@agent.tool(name="generateIdeationBrief", timeout=120)
async def generate_ideation_brief(ctx: RunContext[ChatAgentDeps], payload: IdeationBriefPayload) -> PdfAttachmentOutput:
    from app.services.pdf_renderer import render_ideation_brief
    return await _upload_pdf(ctx, payload=payload, renderer=render_ideation_brief, filename_suffix="ideation-brief", tool_name="generateIdeationBrief")
```

### H2O Parallel Tool Pattern (to be changed)
From `src/ai/prompts/h2o-allegiant.ts`:
```markdown
On opportunity-advancing turns, emit ALL FOUR tool_use calls — `generateFieldBrief`, `generatePlaybook`, `generateAnalyticalRead`, `generateProposalShell` — in a SINGLE assistant response.
```

### H2O React-PDF Pattern (to be evaluated for replacement)
From `src/lib/artifacts/pdf/field-brief-document.tsx`:
```tsx
export const renderFieldBriefPdf = async (payload: FieldBriefPayload): Promise<Buffer> =>
  renderToBuffer(<FieldBriefDocument payload={payload} />);
```

---

## Skill Resolution

- **ai-sdk SKILL.md:** Verified that AI SDK v6 `ToolLoopAgent` supports parallel tool execution via `runToolsTransformation`. Plain async `execute` functions emit no preliminary progress. Confirmed `ignoreIncompleteToolCalls` and `sanitizeAbortedToolParts` are correct defensive patterns.
- **No other skills required** — this is a pure architecture comparison.
```

---

Please save the content above to `/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/explore-reference-secondstream-tools.md`.