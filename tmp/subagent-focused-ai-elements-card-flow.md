I did not write `/Users/ricardoaltamirano/Developer/SecondstreamAI/tmp/subagent-focused-ai-elements-card-flow.md` because the task also says **“No edits”**; per instruction hierarchy, no-edit wins.

## Focused diagnosis

### Current behavior

Relevant files inspected:

- `src/components/ai-elements/artifact-tool-card.tsx`
- `src/components/chat-interface.tsx`
- `src/lib/chat-utils.ts`
- `src/components/chat-interface.test.tsx`
- `src/lib/chat-reconciliation.ts`
- `src/types/ui-message.ts`

The current UI does **not** match the intended card flow:

> card per current active PDF tool → final downloadable card when complete → next active card.

Instead:

1. `ArtifactToolCard` explicitly returns `null` for:
   - `input-streaming`
   - `input-available`

2. `chat-interface.tsx` renders `ArtifactPackageHeartbeat` whenever any artifact tool is non-terminal.

3. `shouldShowAgentStatusProgress` hides the global agent status as soon as any artifact card is visible, including a previously completed artifact card.

Result: after Field Brief completes and Playbook starts, the UI can show the completed Field Brief download card plus a generic “Generating artifact package…” heartbeat, but **not** a named active Playbook card.

## Root mismatch

The stale-state fix avoided misleading frozen cards by suppressing input-state cards. That prevented static “Preparing X…” cards from persisting forever, but it also removed the intended active per-artifact card UX.

The fix should not simply revert that suppression globally. It needs to render active cards only when they represent **live stream activity**, not stale persisted snapshots.

## Exact changes needed

### 1. Make `ArtifactToolCard` support live active input states

Change its contract to distinguish live active rendering from persisted/non-live rendering.

Suggested prop:

```ts
isLive?: boolean;
```

Behavior:

- `input-streaming` / `input-available`:
  - render active shimmer card only when `isLive === true`
  - return `null` when not live
- `output-available` with progress output:
  - render progress card
- `output-available` with ready output:
  - render final downloadable card
- `output-error`:
  - render error card

This restores the active card without reintroducing stale static freezes.

### 2. Compute active/live artifact state in `chat-interface.tsx`

When rendering assistant message parts, determine whether the message is currently live:

```ts
const isLastAssistant = message.role === "assistant" && message.id === lastAssistantMessageId;
const isLiveStream = status === "submitted" || status === "streaming";
const isLiveAssistant = isLastAssistant && isLiveStream;
```

Then pass:

```tsx
<ArtifactToolCard
  ...
  isLive={isLiveAssistant}
/>
```

This means persisted historical `input-*` tool parts still do not display fake active cards.

### 3. Replace or remove `ArtifactPackageHeartbeat`

The generic package heartbeat conflicts with the intended UX.

Current helper:

```ts
shouldShowArtifactPackageHeartbeat(message)
```

This should either be removed from the artifact-tool path or narrowed to only true silent gaps where no specific active card can render.

Recommended direction:

- Do **not** show `ArtifactPackageHeartbeat` when a live artifact tool part exists.
- Prefer the specific `ArtifactToolCard` for active artifact progress.
- Keep `AgentStatusProgress` for pre-tool silent windows before a tool part exists.

### 4. Update `chat-utils.ts` visibility helpers

Current `hasArtifactCardVisible` treats only these as card-visible:

```ts
output-available
output-error
```

If live input-state cards are restored, helper logic needs to know about that.

Recommended split:

- terminal/download-visible card:
  - `output-available`
  - `output-error`
- live active card:
  - `input-streaming`
  - `input-available`
  - only when last assistant + streaming/submitted

Then `shouldShowAgentStatusProgress` should hide the global status only when a specific artifact card is actually visible for the current state.

Avoid a broad helper that says all input-state tools are visible regardless of stream liveness.

### 5. Add/update tests

Tests to add or change in `src/components/chat-interface.test.tsx`:

1. `ArtifactToolCard` renders active shimmer for `input-available` when live.
2. `ArtifactToolCard` returns `null` for `input-available` when not live.
3. Completed Field Brief card remains downloadable while Playbook active card renders next.
4. Generic package heartbeat does not render when a specific active artifact card can render.
5. Persisted stale `input-available` snapshot does not render a misleading active card.
6. `shouldShowAgentStatusProgress` stays visible during silent pre-tool windows, but hides once a live active artifact card exists.

## Recommended implementation shape

Minimal safe design:

```ts
type ArtifactToolCardProps = {
  Icon: ArtifactCardIcon;
  title: string;
  state: ToolUIPart["state"];
  output?: ArtifactToolUIOutput | null;
  errorText?: string;
  isLive?: boolean;
};
```

Inside `ArtifactToolCard`:

```ts
if (state === "input-streaming" || state === "input-available") {
  if (!isLive) return null;

  return activePreparingCard;
}
```

This restores:

- current active PDF card
- completed downloadable card
- next active card

while preserving the stale-state protection that motivated the current suppression.