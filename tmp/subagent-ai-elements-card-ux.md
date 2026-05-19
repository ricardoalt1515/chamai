# AI Elements / Artifact Card UX Diagnosis

## Scope

Read-only diagnosis for the chat artifact-card behavior described by the screenshots:

- During generation: no artifact cards are visible.
- After refresh: all four final artifact cards are visible.

Files inspected:

- `src/components/chat-interface.tsx`
- `src/components/ai-elements/artifact-tool-card.tsx`
- `src/lib/chat-utils.ts`
- `src/components/chat-interface.test.tsx`
- `src/lib/chat-handler.ts`
- `src/lib/chat-reconciliation.ts`
- `src/types/ui-message.ts`
- AI Elements support components/styles: `message.tsx`, `shimmer.tsx`, `tool.tsx`

No source edits were made.

## Intended UI state model

The chat UI models artifact generation through AI SDK v6 tool UI parts. Artifact tools are identified in `chat-interface.tsx` as:

- `tool-generateFieldBrief`
- `tool-generatePlaybook`
- `tool-generateAnalyticalRead`
- `tool-generateProposalShell`

The relevant tool states are:

1. `input-streaming`
   - The model is still composing the tool input.
   - `ArtifactToolCard` explicitly returns `null`.
   - Intended visible progress source: `AgentStatusProgress`, usually with `phase: "preparing-artifact"`.

2. `input-available`
   - The tool input exists and the tool may be running.
   - `ArtifactToolCard` also explicitly returns `null`.
   - Intended visible progress source: `AgentStatusProgress` plus the high-level package heartbeat.

3. `output-available` with progress output, e.g. `{ status: "rendering" | "storing" | "persisting" }`
   - `ArtifactToolCard` renders a compact in-progress card with the progress message, e.g. `Rendering PDF…`.
   - `shouldShowAgentStatusProgress` hides the generic/global status once this visible card exists.

4. `output-available` with ready output, e.g. `{ status: "ready", formats: [...] }`
   - `ArtifactToolCard` renders the final card with View/Download links.
   - This is what appears after refresh if persistence has terminal artifact parts.

5. `output-error`
   - `ArtifactToolCard` renders an error card.

There are also two fallback progress surfaces:

- `AgentStatusProgress` in `chat-interface.tsx`, driven by `data-agent-status` chunks.
- `ArtifactPackageHeartbeat`, shown when the assistant message already contains at least one artifact tool part and at least one such part is non-terminal.

The intended layering is therefore:

- Silent request gap: generic `Thinking…` shimmer.
- Agent/model preparation: global semantic status (`Preparing analysis…`, `Preparing Field Brief…`, `Still working…`).
- Active artifact package with non-terminal tool parts: one high-level heartbeat.
- Tool output/progress available: individual artifact cards.
- Final persisted state: individual final cards.

## Why the live screen can show no artifact cards

This is mostly intentional in current code, but the UX result can feel like a blank/frozen generation state.

### 1. `ArtifactToolCard` suppresses input-phase cards

`src/components/ai-elements/artifact-tool-card.tsx` contains an explicit guard:

```ts
if (state === "input-streaming" || state === "input-available") {
  return null;
}
```

The comment says this avoids duplicate shimmer because `AgentStatusProgress` should already label the phase. That explains why the first screenshot can show no artifact cards while generation is underway: if the live stream has only input-phase tool parts, every artifact card returns `null`.

### 2. Per-tool progress cards only begin at `output-available`

The card has useful in-progress rendering for `output-available` when `output.status !== "ready"`, but not for `input-streaming` or `input-available`.

So the UI only shows per-tool artifact cards after the tool has yielded output/progress. During long model-composition windows, no per-tool card is shown.

### 3. `shouldShowAgentStatusProgress` intentionally hides global status once visible content/card exists

`src/lib/chat-utils.ts` keeps status visible only while there is no assistant text/reasoning and no visible artifact card:

```ts
return !hasVisibleText(lastAssistant) && !hasArtifactCardVisible(lastAssistant);
```

`hasArtifactCardVisible` only treats `output-available` and `output-error` as visible-card states. That is consistent with `ArtifactToolCard` returning `null` for input states.

This means global status should remain visible during input-phase tools _if_ `agentStatus` exists and chat `status` is `submitted` or `streaming`.

### 4. Status can still disappear in edge cases

Even though the helper is designed to keep status visible during input states, the progress surface can be absent if any of these happen:

- No `data-agent-status` chunk has arrived yet (`agentStatus` is `null`).
- `useChat` status is not `submitted` or `streaming` even though the user perceives generation as ongoing.
- The assistant message has visible text/reasoning, causing `shouldShowAgentStatusProgress` to return `false`.
- A prior output/progress card is visible, causing the global status to hide even while a later artifact is only in input composition.
- `onFinish` clears `agentStatus` before reconciliation replaces live messages with persisted terminal artifacts.

The last two are especially relevant for multi-artifact generation: once one artifact has an output card, the global progress can be suppressed even if the next artifact is in an input-only phase. If no compact card is rendered for that next artifact, the user may not see which artifact is currently progressing.

### 5. Refresh can show final cards because persisted messages are terminal

`ChatInterface` uses `initialMessages` on page load. If the backend persisted assistant parts with `output-available` ready outputs, refresh bypasses the live input-phase rendering and immediately renders all final artifact cards.

`reconcileThreadAfterStream(..., waitForTerminalArtifactTools: true)` is intended to eventually replace live state with persisted terminal artifact parts, but the live stream can still look sparse before that reconciliation lands.

## Relationship to the old static-card freeze

The current suppression appears to be a reaction to the old “static-card freeze” problem: rendering cards too early for input-phase tool parts can create visible cards that say “Preparing…” and then appear stuck for a long time while the model composes or the tool waits.

The current implementation avoids that freeze by hiding input-phase cards entirely and relying on global semantic status. That prevents misleading static cards, but it creates the opposite risk: a multi-minute artifact package may show no per-artifact object at all until outputs are available or the user refreshes.

## Recommended UX behavior

Recommended direction: keep avoiding full static cards for raw `input-streaming` / `input-available`, but add a compact, explicitly in-progress progress surface so users can see artifact package progress without mistaking it for completed cards.

### Preferred behavior

1. Show a compact package-level progress bar/status while any artifact package is active.
   - Example: “Generating artifact package — 1 of 4 complete.”
   - Include current semantic phase from `AgentStatusProgress` if available: “Preparing Analytical Read…”

2. Show compact per-artifact rows for known artifact types during generation.
   - Rows should be visually distinct from final cards.
   - Use states like `Queued`, `Preparing`, `Generating`, `Rendering PDF`, `Ready`, `Error`.
   - Do not show View/Download actions until `ready` output exists.

3. Keep final cards only for terminal/ready artifacts.
   - Final cards should remain stable and actionable.
   - Avoid reusing the exact final-card visual treatment for input-only placeholders.

4. Keep `AgentStatusProgress` visible for current-artifact semantic progress even after one earlier artifact has a visible output card.
   - The current `hasArtifactCardVisible` suppression is too broad for sequential multi-artifact work.
   - Better: hide the global status only when the visible card corresponds to the currently active artifact, or convert it into the package status bar instead of removing it.

5. Prefer a single compact “current work” indicator over multiple shimmering full cards.
   - This avoids the old freeze.
   - It also makes long generation feel alive.

### Concrete state mapping

- No assistant/tool parts yet, `status=submitted|streaming`: show `Thinking…` or `Preparing analysis…`.
- `agentStatus.phase=preparing-artifact`, no matching tool part yet: show compact current-artifact row/status: `Preparing <Artifact>…`.
- Artifact tool part `input-streaming`: show compact row: `Preparing input…` or `Composing artifact…`.
- Artifact tool part `input-available`: show compact row: `Generating…` / `Running…`.
- Artifact tool part `output-available` with `rendering|storing|persisting`: show compact or regular in-progress card with message.
- Artifact tool part `output-available` with `ready`: show final card with View/Download.
- `output-error`: show error row/card.

## Test coverage observations

Current tests encode the existing behavior:

- `keeps the agent status visible while an artifact tool input is still streaming`
- `hides the generic agent status once the artifact tool has output to render`
- `hides generic thinking shimmer when the last assistant has active artifact tool progress`
- `shows one high-level artifact package heartbeat while artifact tools are active`

These tests are directionally useful, but they do not fully cover sequential multi-artifact UX where one artifact has output and the next artifact is still only in `preparing-artifact` / input state. That is the likely gap where users can lose the current progress cue.

## Diagnosis summary

- The missing live artifact cards are explained by an explicit design choice: `ArtifactToolCard` returns `null` for `input-streaming` and `input-available`.
- The code expects `AgentStatusProgress` and `ArtifactPackageHeartbeat` to cover those phases.
- That fallback can be insufficient or hidden in multi-artifact generation, especially after any visible output card exists or after `agentStatus` is cleared.
- Refresh shows cards because persisted messages contain terminal `output-available` ready outputs.
- Best UX path: do not restore old full static placeholder cards; instead add compact in-progress rows/status that are clearly non-final and map to tool/package progress.
