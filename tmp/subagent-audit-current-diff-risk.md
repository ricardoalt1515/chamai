## Review

- Correct:
  - `progress.md` was available and read; `plan.md` was missing at `/Users/ricardoaltamirano/Developer/SecondstreamAI/plan.md`.
  - Focused test file passes: `bun run test src/components/chat-interface.test.tsx` → 39 tests passed.
  - The patch does prevent stale historical `input-streaming` / `input-available` cards by requiring `isLive` before rendering them: `src/components/ai-elements/artifact-tool-card.tsx:29-35`.

- Blocker:
  - `shouldShowAgentStatusProgress` now ignores visible assistant text. It returns true whenever the latest message is not hiding behind an artifact card, even if assistant text is already streaming: `src/lib/chat-utils.ts:61-69`. This directly explains the reported generic/status rectangle during text streaming. The prior `hasVisibleText` helper still exists but is no longer used for status suppression: `src/lib/chat-utils.ts:21-25`.
  - Completed artifact cards can hide status for the next artifact in the same assistant message. `hasArtifactCardVisible` treats any `output-available` artifact as visible, regardless of whether it is merely a completed previous artifact: `src/lib/chat-utils.ts:45-48`. Then `shouldShowAgentStatusProgress` hides global status for the whole latest assistant message: `src/lib/chat-utils.ts:69`. This likely causes “Preparing Playbook/Analytical Read” status to disappear after Field Brief output exists but before the next active card exists.
  - `shouldShowArtifactPackageHeartbeat` was changed to always return false: `src/components/chat-interface.tsx:120-125`. This removes the previous fallback during artifact work. If the new live-card detection is wrong or if no live input part is present yet, the UI has less backup visibility.

- Note:
  - `liveAssistantMessageId` assumes only the latest assistant message can be live: `src/components/chat-interface.tsx:443-447`. That is mostly reasonable, but combined with heartbeat removal it creates a brittle all-or-nothing rendering path.
  - Tool card keys are index/state based: `src/components/chat-interface.tsx:117`, used at `src/components/chat-interface.tsx:620`. Because the key changes from `active` to `terminal`, React remounts the card on state transition. If `message.parts` ordering shifts, index-based keys can also cause flashing/remounting. Prefer `toolCallId` where available.

## Recommendation

Yes: revert this UI patch while diagnosis continues, or at minimum revert the status/heartbeat behavior changes. The patch plausibly introduces exactly the reported regressions: generic rectangle during text streaming, status disappearing between artifact cards, and active card flashing due unstable keys.

I did not write `tmp/subagent-audit-current-diff-risk.md` because the task also said “READ-ONLY / No edits”; per instruction hierarchy, no-edit wins.