# AI Elements Artifact Plan Critique

Scope: read-only review of `docs/agent-audit-and-artifact-plan.md` against local AI Elements references and current project code. No source files were edited.

## Findings

### 1. `Artifact` exists in the AI Elements registry, but is not installed locally yet

The plan's component choice is real: the local AI Elements reference documents `npx ai-elements@latest add artifact` and describes `Artifact` as a container for generated content with header/actions/content areas (`/Users/ricardoaltamirano/.agents/skills/ai-elements/references/artifact.md:9-24`). The example exports the expected subcomponents from `@/components/ai-elements/artifact`: `Artifact`, `ArtifactHeader`, `ArtifactTitle`, `ArtifactDescription`, `ArtifactActions`, `ArtifactAction`, and `ArtifactContent` (`/Users/ricardoaltamirano/.agents/skills/ai-elements/scripts/artifact.tsx:3-11`).

However, the project currently has no `src/components/ai-elements/artifact.tsx`; installed AI Elements are limited to attachments/conversation/message/model-selector/prompt-input/reasoning/shimmer/sources/suggestion/working-memory-update. So `docs/agent-audit-and-artifact-plan.md:99` and `docs/agent-audit-and-artifact-plan.md:207` are correct only if PR2 actually installs the registry component before `artifact-panel.tsx` imports it.

Concrete adjustment: keep the install step, but make PR2 acceptance explicitly include `src/components/ai-elements/artifact.tsx` existing and importing all needed subcomponents.

### 2. The planned `<Artifact>` rendering shape is underspecified

The plan says `artifact-panel.tsx` should render `<Artifact>` with `<ArtifactActions>` containing a download button (`docs/agent-audit-and-artifact-plan.md:181-185`). The AI Elements shape is more structured: header, title/description, actions, and content (`/Users/ricardoaltamirano/.agents/skills/ai-elements/references/artifact.md:35-84`), and the example nests actions inside `ArtifactHeader`, with rendered content inside `ArtifactContent` (`/Users/ricardoaltamirano/.agents/skills/ai-elements/scripts/artifact.tsx:74-124`).

Concrete adjustment: specify the artifact panel composition as `Artifact > ArtifactHeader(title/description + ArtifactActions/ArtifactAction) + ArtifactContent`, not just `<Artifact>` plus actions. For proposal markdown, `ArtifactContent` will also need a markdown renderer, likely existing `MessageResponse`/Streamdown styling, not `CodeBlock` from the example.

### 3. `onData` is wired in the parent, but a child `artifact-panel.tsx` cannot independently “subscribe” to it

The plan says the new `src/components/artifact-panel.tsx` subscribes to `useChat` data parts via `onData`, “already wired in `chat-interface.tsx`” (`docs/agent-audit-and-artifact-plan.md:181-183`). Current `useChat` is created inside `ChatInterface`, and its `onData` callback is local to that hook (`src/components/chat-interface.tsx:121-157`). Today it handles only `data-new-thread-created` and `data-conversation-title` (`src/components/chat-interface.tsx:127-156`).

AI SDK docs confirm transient data parts are only available through the `onData` callback, not `message.parts` (`node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx:160-181`, `node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx:197-224`). Therefore a separate child panel cannot recover transient artifact updates by scanning messages.

Concrete adjustment: put artifact update state in `ChatInterface` and pass it into `ArtifactPanel`, or introduce a dedicated state/store callback that `ChatInterface.onData` writes to. Do not make `artifact-panel.tsx` call `useChat` separately for the same thread.

### 4. The proposed tool code incorrectly assumes `writer` is available in tool `execute` options

The plan's tool definition calls `execute: async (input, { writer }) => { writer.write(...) }` (`docs/agent-audit-and-artifact-plan.md:143-148`). In AI SDK v6, tool execution options include `toolCallId`, `messages`, `abortSignal`, and `experimental_context`, but not `writer` (`node_modules/@ai-sdk/provider-utils/src/types/tool.ts:10-40`, `node_modules/@ai-sdk/provider-utils/src/types/tool.ts:68-71`). AI SDK's own tool/status example writes via a `writer` captured from the surrounding `createUIMessageStream`, while the tool `execute` receives only `{ toolCallId }` (`node_modules/ai/docs/03-ai-sdk-core/15-tools-and-tool-calling.mdx:563-588`).

This is more than a typing nit: the current project creates a singleton agent with static tools (`src/ai/agents/agent.ts:9-15`), then streams it inside `createUIMessageStream` (`src/lib/chat-handler.ts:328-350`). That static tool has no closure over the per-request UI stream writer.

Concrete adjustment: redesign `proposeArtifact` wiring before implementation. Options include creating the artifact tool/agent per request inside the `createUIMessageStream` closure, or using a supported per-call/context pattern verified against `ToolLoopAgent`. The current snippet will not compile or stream transient updates as written.

### 5. Server-side persistence from `responseMessage.parts` is plausible, but the plan must account for transient data not being persisted

The plan says server `onFinish` should walk `responseMessage.parts` for `proposeArtifact` tool calls and persist accumulated sections (`docs/agent-audit-and-artifact-plan.md:156-163`). That can work if `proposeArtifact` is a normal executed tool: tool parts appear in the assistant message history, while the additional `data-artifact-update` transient parts do not.

The distinction matters because the data parts written with `transient: true` are only available to the client `onData` callback (`node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx:160-181`, `node_modules/ai/docs/04-ai-sdk-ui/20-streaming-data.mdx:224`). Persistence must derive from the tool part input/output in `responseMessage.parts`, not from the transient `data-artifact-update` events.

Concrete adjustment: specify exact extraction logic: filter `part.type === "tool-proposeArtifact"` and `part.state === "output-available"` or equivalent final state, then use `part.input.title`, `part.input.section`, and `part.input.isFinal`. Avoid saying the server persists transient data parts.

### 6. Existing `MyUIMessage` typing does not yet include artifact updates, and PR ordering should make that explicit

Current `MyUIMessage` manually declares only `conversation-title`, `new-thread-created`, `webSearch`, and `updateWorkingMemory` (`src/types/ui-message.ts:10-39`). The plan's Phase A moves this to `InferAgentUIMessage` with only the two current data parts (`docs/agent-audit-and-artifact-plan.md:61-78`), while PR2 says to extend `MyDataParts` with `data-artifact-update` (`docs/agent-audit-and-artifact-plan.md:207`).

That ordering is reasonable, but the naming should stay aligned with AI SDK's generic data-part keys. The type key should be `"artifact-update"`, while streamed part type is `"data-artifact-update"`, matching the existing pattern where `"conversation-title"` becomes `data-conversation-title` (`src/components/chat-interface.tsx:147-156`, `docs/agent-audit-and-artifact-plan.md:66-77`).

Concrete adjustment: in PR2, add `"artifact-update": { title: string; section: { title: string; markdown: string }; isFinal: boolean }` to `MyDataParts`, and handle `dataPart.type === "data-artifact-update"` in `ChatInterface.onData`.

### 7. PromptInput integration is mostly compatible, but artifact state should not be hidden inside the composer

The project already uses AI Elements `PromptInput` through `ChatPromptComposer` (`src/components/chat-prompt-composer.tsx:193-240`), and sends via `useChat.sendMessage` from `ChatInterface` (`src/components/chat-interface.tsx:169-183`). This matches the AI Elements PromptInput + AI SDK usage pattern: `PromptInput` calls `sendMessage` with optional body fields (`/Users/ricardoaltamirano/.agents/skills/ai-elements/references/prompt-input.md:99-121`, `/Users/ricardoaltamirano/.agents/skills/ai-elements/references/prompt-input.md:151-180`).

The artifact feature should therefore stay in `ChatInterface`/panel state, not in `ChatPromptComposer`. The composer currently forces `webSearchEnabled: false` (`src/components/chat-prompt-composer.tsx:161-168`) and has no artifact-related controls; that is fine for artifact streaming because artifact updates are response-side `onData` events, not prompt input fields.

Concrete adjustment: leave PromptInput alone except for any necessary layout changes. Wire artifact updates at the `useChat` owner level.

### 8. Desktop two-column layout requires more than inserting a panel

The current chat layout is a single vertical flex column (`src/components/chat-interface.tsx:199-258`), with the conversation content capped at `max-w-[70ch]` (`src/components/chat-interface.tsx:260-261`) and the composer separately capped at the same width (`src/components/chat-interface.tsx:419-430`). The plan's “desktop two-column flex” (`docs/agent-audit-and-artifact-plan.md:187-189`) is directionally right, but it needs explicit min-width/overflow handling to avoid the chat column or artifact panel squeezing badly.

Concrete adjustment: define a desktop shell with `min-h-0`, `min-w-0`, independent scroll regions, and a fixed or bounded artifact column width. The composer should stay aligned with the chat column, not span under the artifact unless that is intentionally designed.

### 9. Mobile Sheet exists, but default dimensions are probably too narrow for artifact review

The plan says mobile should use the existing shadcn Sheet (`docs/agent-audit-and-artifact-plan.md:187-189`). The project does have `Sheet`, `SheetTrigger`, `SheetContent`, etc. (`src/components/ui/sheet.tsx:10-24`, `src/components/ui/sheet.tsx:39-74`). But the default right/left sheet width is `w-3/4` with `sm:max-w-sm` (`src/components/ui/sheet.tsx:55-57`), which is likely too narrow for proposal/document review and PDF/download actions.

Concrete adjustment: specify a custom `SheetContent` class for artifacts, e.g. nearly full viewport width on mobile and internal scrolling, rather than relying on the default sheet width.

### 10. AI Elements `Tool` is not required for artifact preview, but can help if tool-call rendering remains visible

The plan uses a custom artifact side panel, not AI Elements `Tool`. That is acceptable. AI Elements `Tool` is designed for rendering tool invocation details from `ToolUIPart` (`/Users/ricardoaltamirano/.agents/skills/ai-elements/references/tool.md:1-17`) and expects `tool-*` parts from `message.parts` (`/Users/ricardoaltamirano/.agents/skills/ai-elements/references/tool.md:68-99`).

If `proposeArtifact` returns `{ ok: true }`, the normal message stream may still contain `tool-proposeArtifact` parts unless filtered by UI rendering. Current `ChatInterface` returns `null` for unknown part types (`src/components/chat-interface.tsx:359-360`), so the tool calls will not appear in chat by default. That is probably desired for MVP.

Concrete adjustment: no need to install/render AI Elements `Tool` for artifact preview. If debugging visibility is wanted, add a temporary `tool-proposeArtifact` render using AI Elements `Tool`; otherwise keep it hidden and rely on the side panel.

## Bottom line

The AI Elements artifact-panel idea is viable, and the registry component exists. The highest-risk assumption is the proposed `execute(input, { writer })` API, which does not match AI SDK v6 tool execution options. The second highest-risk assumption is component ownership: transient artifact updates must be captured in `ChatInterface.onData` and passed to the panel, because a child panel cannot reconstruct them from message history.
