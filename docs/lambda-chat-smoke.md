# Lambda Chat Streaming Smoke Test

## Purpose

Validate the AWS-only chat streaming path that moves chat transport from Amplify Hosting `WEB_COMPUTE` to a Lambda Function URL with `InvokeMode=RESPONSE_STREAM`.

The existing same-origin `/api/chat` route remains the rollback path.

## Deploy sandbox

```bash
nvm use
npx ampx sandbox
```

Find the CloudFormation output named `ChatStreamingFunctionUrl` for the `chat-streaming` stack.

## Get a Cognito access token

Use the browser session or an approved Cognito test-user flow to obtain an **access token**. The Lambda endpoint expects:

```http
Authorization: Bearer <cognito-access-token>
```

ID tokens are intentionally not accepted by the Lambda owner adapter.

## Curl validation

```bash
curl -N --no-buffer \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer <access-token>' \
  --data '{
    "threadId":"lambda-smoke-thread",
    "messages":[{"id":"user-1","role":"user","parts":[{"type":"text","text":"Say hello in one short sentence."}]}],
    "trigger":"submit-message",
    "modelId":"claude-sonnet-4-6",
    "webSearchEnabled":false
  }' \
  '<ChatStreamingFunctionUrl>'
```

Pass condition: AI SDK UI message chunks arrive progressively rather than all at process end.

## Browser validation

The production frontend uses the production `ChatStreamingFunctionUrl` directly as the default chat transport. No `NEXT_PUBLIC_CHAT_TRANSPORT` or `NEXT_PUBLIC_CHAT_LAMBDA_URL` flag is required.

For sandbox/browser validation, temporarily point `CHAT_LAMBDA_URL` in `src/components/chat-interface.tsx` at the sandbox `ChatStreamingFunctionUrl`, then rebuild/redeploy that environment.

Then validate:

1. Authenticated user can send a normal chat message.
2. Assistant output appears progressively.
3. Thread reload shows persisted user/assistant messages.
4. Regenerate preserves expected behavior.
5. Attachment behavior is validated separately because Lambda writes new objects under `lambda-chat/attachments/users/<userId>/threads/<threadId>/...`.

## Rollback

Revert the frontend transport commit so `src/components/chat-interface.tsx` uses `/api/chat` again. The same-origin Next route remains implemented and can be restored without backend changes.

## Canary retention decision

The original synthetic `streaming-canary` Function URL is retained for now as a low-risk diagnostic endpoint while the real chat Lambda path is validated. It returns only synthetic chunks and should be removed after the chat Lambda path is accepted or rejected.
