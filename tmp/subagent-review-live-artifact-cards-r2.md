## Review
- Correct: `ArtifactToolCard` now gates `input-streaming` / `input-available` cards behind `isLive`, returning `null` for non-live/historical input-state parts (`src/components/ai-elements/artifact-tool-card.tsx:29-35`) and rendering named live progress cards only when `isLive` is true (`src/components/ai-elements/artifact-tool-card.tsx:37-54`). This prevents stale prior assistant input cards from rendering during later turns.
- Correct: `ChatInterface` computes `liveAssistantMessageId` only when the chat is `submitted`/`streaming` and the latest message is an assistant message (`src/components/chat-interface.tsx:443-447`), then passes `isLive` only to that latest assistant's artifact cards (`src/components/chat-interface.tsx:545-548`, `src/components/chat-interface.tsx:620-632`). When a new submitted turn has a latest user message, prior assistant cards are not live.
- Correct: `shouldShowAgentStatusProgress` now only allows the latest assistant message's rendered artifact cards to suppress `AgentStatusProgress`; if the latest message is not an assistant, it returns true (`src/lib/chat-utils.ts:61-69`). This directly covers the submitted-gap/new-turn case.
- Correct: generic/non-rendered tools cannot hide `AgentStatusProgress`: status suppression is limited to known artifact tool types in `ARTIFACT_TOOL_TYPES` (`src/lib/chat-utils.ts:11-16`, `src/lib/chat-utils.ts:41-48`). Generic tools such as `tool-loadSkill` are covered by the added test (`src/components/chat-interface.test.tsx:253-276`).
- Correct: intended card flow remains intact. Live input-state artifact cards render named progress (`src/components/ai-elements/artifact-tool-card.tsx:37-54`), output/error artifact states still render cards (`src/components/ai-elements/artifact-tool-card.tsx:57-75`, `src/components/ai-elements/artifact-tool-card.tsx:77-132`), completed artifacts remain downloadable while a later live artifact card is active (`src/components/chat-interface.test.tsx:396-434`), and the generic package heartbeat is intentionally disabled to avoid competing with specific cards (`src/components/chat-interface.tsx:120-125`).
- Correct: focused regression coverage was added for live input card suppression/rendering, new submitted turn after prior artifact output, generic non-rendered tool status visibility, and artifact heartbeat behavior (`src/components/chat-interface.test.tsx:195-306`, `src/components/chat-interface.test.tsx:360-434`, `src/components/chat-interface.test.tsx:526-548`).
- Note: `bun run test src/components/chat-interface.test.tsx` passed: 39 tests, 1 file.

## Severity Findings
- Blocker: none.
- Major: none.
- Minor: none.

## Readiness
Ready for merge from this review scope. The diff addresses the prior stale live-card/status-suppression risks without edits from this reviewer.
