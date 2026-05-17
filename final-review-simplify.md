Read-only note: I did **not** write `final-review-simplify.md` because the task also said “READ-ONLY / Do not edit files,” and the harness instruction says no-edit wins over artifact-writing conflicts.

## Ranked simplification findings

### 1. Extract small response-piping helper in Lambda handler
- **File/function:** `amplify/functions/chat-streaming/handler.ts` — `handleChatStreamingRequest`
- **Evidence:** repeated `pipeResponseToStream(..., responseStream, { decorateResponseStream })` at lines 101–106, 110–113, 117–120, 128–138, 164–166, 172–176.
- **Simplification:** Inside `handleChatStreamingRequest`, define a local helper like `const pipe = (response: Response) => pipeResponseToStream(response, responseStream, { decorateResponseStream });`
- **Value:** Medium. Reduces noise in guard clauses and makes control flow easier to scan.
- **Risk:** Low. Pure mechanical refactor if tests stay green.
- **Do:** **Now**.

### 2. Extract attachment-part conversion helpers in chat handler
- **File/function:** `src/lib/chat-handler.ts` — `withAttachmentPersistence`, `withBedrockAttachmentData`
- **Evidence:** repeated construction of `filePartToAttachmentRef({ type: "file", mediaType, filename, url, metadata })` at lines 124–130 and 171–177; repeated casts around persisted file parts at lines 118–120 and 132–135.
- **Simplification:** Add narrow helpers, e.g. `attachmentRefFromFilePart(part)` and `toPersistedFilePart(metadata)`, keeping behavior identical.
- **Value:** High. These functions are correctness-sensitive and currently mix validation, persistence, metadata conversion, and type-cast ceremony.
- **Risk:** Low/Medium because attachment behavior is subtle; keep tests focused on persisted and legacy attachment cases.
- **Do:** **Now**, if covered by existing attachment tests.

### 3. Split `createChatPostHandler` finish logic into named helpers
- **File/function:** `src/lib/chat-handler.ts` — `createChatPostHandler`, especially `onFinish` lines 314–359.
- **Evidence:** `onFinish` performs message ID normalization, regenerate replacement, normal save, assistant text extraction, thread re-read, title generation, title persistence, and data event writing.
- **Simplification:** Extract helpers such as `persistAssistantResponse(...)` and `maybeGenerateThreadTitle(...)`.
- **Value:** High. New readers can understand streaming setup separately from persistence/title side effects.
- **Risk:** Medium. Ordering and error-swallowing behavior must remain exact, especially title generation failure handling.
- **Do:** **Later**, after end-to-end Lambda smoke passes.

### 4. Centralize message ordering/parsing inside each ChatStore
- **Files/functions:**
  - `src/lib/storage/lambda-chat-store.ts` — `listMessageRows`, `getThreadMessages`, `replaceAssistantMessageAfter`
  - `src/lib/storage/amplify-chat-store.ts` — `getThreadMessages`, `replaceAssistantMessageAfter`
- **Evidence:** ordering by `position` appears in Lambda lines 141–143 and Amplify lines 99–101 / 166–169; payload parsing/filtering appears in Lambda lines 207–212 / 344–348 and Amplify lines 102–106 / 179–183.
- **Simplification:** Use local helpers per file: `sortByPosition`, `parseStoredMessage`, `parseStoredMessages`. Avoid a cross-runtime shared abstraction unless duplication grows further.
- **Value:** Medium. Reduces repeated persistence semantics and makes regenerate behavior easier to audit.
- **Risk:** Low if kept local; Medium if shared across adapters.
- **Do:** **Now** as local helpers only.

### 5. Move `safeDetails` blocked key set to module scope
- **File/function:** `amplify/functions/chat-streaming/observability.ts` — `safeDetails`
- **Evidence:** line 13 creates `new Set([...])` on every log call.
- **Simplification:** `const BLOCKED_DETAIL_KEYS = new Set([...]);`
- **Value:** Low. Mostly readability and avoids repeated allocation.
- **Risk:** Very low.
- **Do:** **Now** if touching observability anyway; otherwise skip.

### 6. Extract chat transport preparation out of `ChatInterface`
- **File/function:** `src/components/chat-interface.tsx` — `getAccessToken`, `prepareChatSendMessagesRequest`, `getChatTransportApi`
- **Evidence:** transport/auth request code lives in UI component file at lines 49–88; tests import these helpers from the component test.
- **Simplification:** Move transport helpers to a dedicated module, e.g. `src/lib/chat-transport.ts` or `src/config/chat-transport.ts`, leaving `ChatInterface` focused on rendering and interactions.
- **Value:** Medium/High. Reduces UI file responsibility and makes transport behavior easier to test without rendering concerns.
- **Risk:** Medium because frontend transport is currently hot from the Lambda fix.
- **Do:** **Later**, after smoke validation.

### 7. Extract message part rendering from `ChatInterface`
- **File/function:** `src/components/chat-interface.tsx` — message parts switch lines 276–362.
- **Evidence:** rendering logic for files, reasoning, text, web search, and working memory is embedded inside the main component’s conversation map.
- **Simplification:** Extract `ChatMessagePart` and optionally `AssistantMessageActions`; preserve keys and props exactly.
- **Value:** Medium. Makes `ChatInterface` easier to understand and lowers risk for future UI changes.
- **Risk:** Medium due JSX/key/rendering behavior.
- **Do:** **Later**, not part of Lambda persistence stabilization.