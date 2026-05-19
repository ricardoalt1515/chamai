status: completed

executive_summary:
- Implemented the next SDD apply slice for post-progress manual-test fixes and Analytical Read recurring failure mitigation/diagnostics.
- Suppressed generic `Still working…` progress when the latest assistant already has visible text/reasoning or visible tool activity.
- Fixed submit/stop semantics: `PromptInputSubmit` only shows/acts as Stop when an `onStop` handler exists, and `useChat().stop` is now wired through `ChatInterface → ChatPromptComposer → PromptInputSubmit`.
- Converted H2O artifact tools to AI SDK-compatible async-generator executions that yield preliminary progress outputs: `rendering`, `storing`, `persisting`, then final `ready`.
- Expanded artifact UI output types and updated `ArtifactToolCard` to render phase messages without expecting `formats` until `status: "ready"`.
- Improved abort-sanitized incomplete tool error text to identify response timeout/interruption before tool completion.
- Increased chat `totalMs` from `240_000` to `285_000`, still below Lambda's 300s cap, because AWS logs showed Analytical Read was interrupted at the prior app cap before `artifact_tool_started`.

files_changed:
- src/types/ui-message.ts
- src/lib/chat-utils.ts
- src/lib/chat-runtime.ts
- src/lib/chat-runtime.test.ts
- src/lib/chat-handler.ts
- src/lib/chat-handler.test.ts
- src/ai/tools/h2o-artifacts.ts
- src/ai/tools/h2o-artifacts.test.ts
- src/components/ai-elements/artifact-tool-card.tsx
- src/components/ai-elements/prompt-input.tsx
- src/components/chat-interface.tsx
- src/components/chat-interface.test.tsx
- src/components/chat-prompt-composer.tsx
- openspec/changes/ai-agent-tool-orchestration/apply-progress.md
- tmp/sdd-apply-post-progress-and-analytical-read.md

tests:
  safety_net:
    command: bun run test src/components/chat-interface.test.tsx src/lib/chat-handler.test.ts src/ai/tools/h2o-artifacts.test.ts src/lib/chat-runtime.test.ts
    result: passed, 58/58 before this slice's production edits
  red:
    command: bun run test src/components/chat-interface.test.tsx src/ai/tools/h2o-artifacts.test.ts src/lib/chat-runtime.test.ts
    result: failed as expected, 7 failures for missing progress helper, stop semantics, preliminary artifact outputs, and abort text
  green:
    command: bun run test src/components/chat-interface.test.tsx src/lib/chat-handler.test.ts src/ai/tools/h2o-artifacts.test.ts src/lib/chat-runtime.test.ts
    result: passed, 64/64 after implementation
  triangulate:
    command: bun run test src/components/chat-interface.test.tsx src/lib/chat-handler.test.ts src/ai/tools/h2o-artifacts.test.ts src/lib/chat-runtime.test.ts
    result: passed, 66/66 after adding artifact activity/status, Analytical Read progress, and ArtifactToolCard progress render cases
  verification:
    - command: bunx tsc --noEmit
      result: passed
    - command: bun run test src/components/chat-interface.test.tsx src/lib/chat-handler.test.ts src/ai/tools/h2o-artifacts.test.ts src/lib/chat-runtime.test.ts
      result: passed, 66/66

TDD Cycle Evidence:
| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Suppress generic progress while visible text/tool activity exists | `src/components/chat-interface.test.tsx` | Unit | ✅ 58/58 | ✅ Missing `shouldShowAgentStatusProgress` failed | ✅ Helper wired and UI uses it | ✅ Added artifact-tool activity case plus silent submitted case | ✅ Extracted `hasVisibleAssistantProgress` in `chat-utils` |
| Fix submit/stop icon semantics | `src/components/chat-interface.test.tsx` | Unit/SSR | ✅ 58/58 | ✅ Streaming without `onStop` still rendered Stop | ✅ `PromptInputSubmit` only stops when `onStop` exists | ✅ Added wired-stop case and passed `useChat().stop` through composer | ✅ Reused `canStop` boolean for aria/type/icon/click semantics |
| Stream preliminary artifact progress | `src/ai/tools/h2o-artifacts.test.ts`, `src/components/chat-interface.test.tsx` | Unit | ✅ 58/58 | ✅ Artifact tools emitted only final `ready` result | ✅ Async-generator tools yielded `rendering`/`storing`/`persisting`/`ready` | ✅ Added Analytical Read progress case and card render progress case | ✅ Added output union types and centralized final-result collection helper in tests |
| Improve abort/Analytical Read mitigation | `src/lib/chat-runtime.test.ts`, `src/lib/chat-handler.test.ts` | Unit | ✅ 58/58 | ✅ Sanitized abort text and timeout budget expectation failed | ✅ Abort text distinguishes timeout/interruption and `totalMs` set to 285s | ✅ Dynamic-tool incomplete path also asserts new text | ✅ Extracted abort text constant and updated timeout comments with AWS rationale |

risks:
- Preliminary artifact progress only appears after a tool executor starts; it does not solve the long Bedrock/model input-generation gap before first tool start.
- Increasing `totalMs` to 285s leaves only ~15s before Lambda's 300s hard cap for cleanup; this is intentional but should be watched in sandbox CloudWatch.
- Analytical Read may still fail if the model emits invalid tool input/schema. This slice did not add raw `tool-input-error` chunk diagnostics because that is more invasive.
- Async-generator tool outputs expand the model-visible tool output union; if this causes model confusion, use `toModelOutput` in a follow-up to send only final-ready summaries to the model.

next_recommended:
- Restart/redeploy Amplify sandbox and manually test the full package flow.
- Confirm artifact cards show `Rendering PDF…`, `Storing PDF…`, and `Saving artifact metadata…`.
- Inspect CloudWatch for whether `generateAnalyticalRead` now reaches `artifact_tool_started` under the 285s budget.
- If Analytical Read still fails before execute, add raw UI stream diagnostics for `tool-input-error`, `tool-output-error`, and `abort`, redacting payload bodies.

skill_resolution:
- Loaded and applied `/Users/ricardoaltamirano/.agents/skills/ai-sdk/SKILL.md`.
- Loaded and applied `/Users/ricardoaltamirano/.agents/skills/ai-prompt-engineering/SKILL.md`.
- AI SDK conclusions used: async-generator tools can yield preliminary outputs; `data-*` progress is useful for status; no built-in heartbeat covers long model/tool gaps.
