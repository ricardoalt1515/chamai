# SDD Explore — Streaming, Tool UI, and AWS Logs

## Status

completed

## Executive Summary

Manual testing showed the UI appearing to stall on the first PDF tool, then later updating with completed cards and an error. Parallel exploration found this is not a single backend bug. It is a design/runtime mismatch:

- The UI exposes internal tool lifecycle cards and raw parameters.
- Artifact generation is heavy and sequential.
- The model spends a long time generating structured tool inputs before the actual PDF render/storage/persist starts.
- Terminal tool states are only visible when each tool finishes or errors.
- Current reconciliation waits for terminal artifact tool states, which protects persistence but reinforces the “frozen” feeling.

AWS logs show PDF render/storage/persist were fast once the tools actually started. The long delay happened before and between artifact tools, likely during Bedrock/agent generation of large structured inputs.

## User Evidence

Screenshots showed:

1. First state: `Field Brief` card stuck as `Pending` while the user sees no clear progress.
2. Later state: `Field Brief` and `Conversation Playbook` completed, then `Analytical Read` errored.
3. UI displayed code-like JSON parameters for tool calls.

## Current UI Findings

- `src/components/chat-interface.tsx` renders artifact tool parts using `ToolHeader`, status badges, and `ToolInput` JSON parameters.
- `src/components/ai-elements/tool.tsx` maps states roughly as:
  - `input-streaming` → Pending
  - `input-available` → Running
- Artifact tools perform PDF render + storage + DB persist before returning final output.
- During long model/tool steps, the user may see a pending/running card with little visible progress.
- `waitForTerminalArtifactTools: true` in `ChatInterface` + `chat-reconciliation.ts` can defer applying persisted snapshots until artifact tools are terminal.

## Legacy UI Comparison

Legacy project examined:

- `/Users/ricardoaltamirano/Developer/SecondStream/frontend/components/chat-ui/*`
- `/Users/ricardoaltamirano/Developer/SecondStream/frontend/types/ui-message.ts`
- `/Users/ricardoaltamirano/Developer/SecondStream/frontend/lib/chat-bridge/transport.ts`

Legacy UI had:

- Dedicated `MessagePartsRenderer`.
- `PdfDocumentCard` with view/download actions, loading spinners, inline errors, file size, and attachment-id fallback.
- `ChatAttachmentChip` with open/download actions and persisted attachment fetch logic.
- Stream bridge support for `data-agent-status` high-level progress labels.

Current UI is less mature:

- Message rendering is mostly inlined in `ChatInterface`.
- Artifact cards expose tool internals and raw params.
- Download card is simpler: one download link when URL exists.
- Progress surface is mostly generic thinking + artifact heartbeat, not detailed agent phases.

## AWS / Backend Findings

AWS identity and region were available:

- Region: `us-east-1`
- Identity: `arn:aws:iam::882816896907:user/CTOAdmin`

Relevant sandbox log group:

`/aws/lambda/amplify-goodchat-ricardoa-ChatStreamingFunctionF36-0EiVMZlsaDvl`

Observed manual-test request:

- Request/correlation id: `f81f9be4-0ace-4be3-a00e-e14b4b10ec4b`
- Origin: `http://localhost:3000`
- Thread: `7s1x-qjxZth5GKVh9h7kv`
- Duration: `240588 ms`
- Lambda memory: `288 MB / 1024 MB`
- Lambda completed; it was not a hard Lambda timeout.

Timeline:

- `16:58:46` request started.
- `16:58:46` streaming response status `200` returned.
- `17:01:25` Field Brief artifact started.
- Field Brief render/storage/persist succeeded quickly:
  - render: `1599 ms`
  - S3 PDF storage: `71 ms`
  - DynamoDB persist: `35 ms`
- `17:02:28` Playbook artifact started.
- Playbook render/storage/persist succeeded quickly:
  - render: `1285 ms`
  - S3 PDF storage: `90 ms`
  - DynamoDB persist: `13 ms`
- Near the end, assistant message saved with `isAborted: true` and `tool-generateAnalyticalRead:output-error`.

Conclusion: the stall is probably not PDF rendering, S3, or DynamoDB. The slow part is the model/tool loop before and between artifact executions, likely from large structured tool-input generation and long Bedrock steps.

## Likely Root Causes

1. **Model generation bottleneck**
   - Field Brief tool did not start until ~159 seconds after request start.
   - Playbook started ~61 seconds after Field Brief completed.
   - The model is likely spending most time constructing large structured inputs.

2. **UI exposes low-level tool lifecycle**
   - Pending tool card with raw params feels like the agent stopped.
   - Users expect a job/progress card, not internal tool call details.

3. **Reconciliation waits for terminal states**
   - Good for consistency, but bad for perceived progress.

4. **Client/request abort near time budget**
   - The run ended near 240 seconds with `isAborted: true` and Analytical Read output-error.

5. **Redacted logging hides the concrete Analytical Read failure**
   - Privacy is good, but diagnostics need structured error codes/categories.

## What Should Change

### UI direction

- Hide artifact tool internals by default.
- Do not show raw JSON parameters/code to end users.
- Show high-level package progress:
  - Preparing Field Brief…
  - Field Brief ready
  - Preparing Playbook…
  - Playbook ready
  - Analytical Read failed / retry available
- Render compact download cards only for terminal successful PDF outputs.
- Render concise error cards for terminal failures, without raw payload.
- Port/adapt legacy `PdfDocumentCard` behavior:
  - View
  - Download
  - action-level loading/error states
  - file size/metadata when available
- Consider a dedicated message-part renderer instead of inlining all rendering in `ChatInterface`.

### Backend/progress direction

- Emit user-facing progress events/parts separate from tool internals, similar to legacy `data-agent-status`.
- Add structured diagnostic error codes for artifact failures while keeping content redacted.
- Add telemetry around model step start/end, not only artifact render/storage/persist.
- Consider reducing generated artifact input payload size or moving more layout/content assembly into deterministic code/templates.

## Next Recommended

Proceed to SDD proposal/design for two related but separable slices:

1. **UX slice**: artifact cards and progress rendering.
2. **Observability/performance slice**: model-step timing, structured error codes, and progress events.

## Risks

- Fixing cards alone improves perception but not the 2–4 minute backend latency.
- Fixing backend latency alone still leaves users seeing raw tool internals unless UI is changed.
- Adding too much progress plumbing can overcomplicate the stream protocol; start with minimal status events.

## Skill Resolution

paths-injected for relevant subagents:

- `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`
- `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`
