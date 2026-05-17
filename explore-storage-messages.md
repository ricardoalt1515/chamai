I couldn’t write `/Users/ricardoaltamirano/Developer/SecondstreamAI/explore-storage-messages.md` because this session has no write/edit tool (read-only tools only).  
Findings:

## Likely root cause (primary)

**Storage split-brain after Lambda migration**: chat writes go to Lambda/DynamoDB, but UI reads thread/messages from Amplify Data/AppSync.

### Evidence

- **New Lambda path writes to DynamoDB adapter**
  - `amplify/functions/chat-streaming/handler.ts`
    - uses `createLambdaDynamoDbChatStoreFromEnv()` + `createChatPostHandler(...)`
- **Legacy Next.js read paths still use `getChatStore()` defaulting to Amplify**
  - `app/actions/messages.ts` → `getChatStore()` → `getThreadMessages`
  - `app/actions/threads.ts` → `getChatStore()` → `listThreads/getThreadById`
  - `src/lib/storage/chat-store.ts`:
    - if `CHAT_STORE_RUNTIME !== "libsql"`, it imports `createAmplifyChatStore()`
- **AmplifyChatStore reads AppSync models** (`Session`, `Message`)
  - `src/lib/storage/amplify-chat-store.ts`
- **Lambda ChatStore writes direct to DynamoDB Session/Message tables**
  - `src/lib/storage/lambda-chat-store.ts`

So after sending via Function URL:
- message/thread saved in DynamoDB by Lambda
- sidebar/thread page fetches from Amplify Data/AppSync and misses Lambda-written records
- title remains `"New Chat"` because `data-conversation-title` update is transient client-side and later invalidation reloads from wrong backend.

## Why this matches symptoms

- “Thread opens but assistant messages not visible” → `/c/[threadId]` page loads via `getThreadMessages` server action (Amplify read path), not Lambda store.
- “Sidebar still shows New Chat” → `onFinish` invalidates `["threads"]`; refetch uses `getThreads` server action (Amplify read path), so generated title from Lambda path is not reflected.

## Pre-Lambda vs Lambda comparison

- **Pre-Lambda `/api/chat`**: `app/api/chat/route.ts` → `chat-handler-next.ts` → `getChatStore()` (Amplify by default). Write/read stayed consistent.
- **New Function URL**: `chat-interface.tsx` posts to hardcoded Lambda URL; Lambda handler writes via `lambda-chat-store` (DynamoDB), while UI still reads via Next server actions (Amplify). Inconsistent backends.

## Affected files/functions

- `src/components/chat-interface.tsx` (transport switched to Lambda URL)
- `amplify/functions/chat-streaming/handler.ts` (Lambda write path)
- `src/lib/storage/lambda-chat-store.ts` (DynamoDB persistence)
- `app/actions/messages.ts` (read path for `/c/[threadId]`)
- `app/actions/threads.ts` (sidebar threads/title read path)
- `src/lib/storage/chat-store.ts` + `src/lib/storage/amplify-chat-store.ts` (default read runtime)

## Recommended minimal fix

1. **Unify read and write store for Lambda mode**:
   - when Lambda transport is active, make `getThreads/getThreadMessages` read from the same DynamoDB-backed store (or expose Lambda-backed read API and consume it).
2. Keep one source of truth for `Session`/`Message` until/if full AppSync-compatible Lambda write path is implemented.

## Verify next

1. For a known threadId created via Lambda, check:
   - DynamoDB Session + Message rows exist
   - AppSync `Session.get` / `listMessageBySessionId` do not contain same rows (or differ)
2. Reload `/c/<threadId>` after fix:
   - assistant message appears
   - sidebar title updates from generated title (not “New Chat”)
3. Confirm query invalidations (`["threads"]`) now refetch from unified backend.