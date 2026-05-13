# Production user management runbook

This app is invite-only. Cognito self sign-up is disabled in `amplify/backend.ts`, so users must be created by an operator.

## Current environments

| Environment | Region | User Pool | How to target it |
| --- | --- | --- | --- |
| Production | `us-east-1` | `us-east-1_BKJ4W7woB` | `--env prod` with `PROD_COGNITO_USER_POOL_ID` or explicit `--user-pool-id` |
| Local sandbox | from root `amplify_outputs.json` | from root `amplify_outputs.json` | default script behavior or `--env sandbox` |

> If production is recreated, update this table after confirming the new branch backend resources in Amplify.

## Recommended setup

Set these in your local shell profile or a private `.env.local`-style workflow. Do not commit secrets or operator-only values.

```bash
export PROD_AWS_REGION=us-east-1
export PROD_COGNITO_USER_POOL_ID=us-east-1_BKJ4W7woB
```

Your AWS credentials must allow Cognito admin operations on the target User Pool.

## Create a user

Always dry-run first. The script prints the exact User Pool before mutating Cognito.

### Production

```bash
bun run auth:create-user user@example.com --env prod --dry-run
bun run auth:create-user user@example.com --env prod --yes
```

If you do not have `PROD_COGNITO_USER_POOL_ID` exported:

```bash
bun run auth:create-user user@example.com \
  --env prod \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --yes
```

### Local sandbox

Make sure `amplify_outputs.json` points at the active sandbox first.

```bash
nvm use
npx ampx sandbox
bun run verify:amplify-config
bun run auth:create-user user@example.com --env sandbox --dry-run
bun run auth:create-user user@example.com --env sandbox --yes
```

## Resend an invitation

Use this when the temporary-password email expired or the user lost the invite.

```bash
bun run auth:create-user user@example.com --env prod --resend --yes
```

Sandbox:

```bash
bun run auth:create-user user@example.com --env sandbox --resend --yes
```

## Password operations

Prefer Cognito-generated temporary passwords and first-login password change. Do not send plaintext passwords through Slack/email if you can avoid it.

### Force a user to reset password

```bash
aws cognito-idp admin-reset-user-password \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --username user@example.com
```

### Set a temporary password manually

This puts the user back into the first-login password-change flow.

```bash
aws cognito-idp admin-set-user-password \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --username user@example.com \
  --password 'REPLACE_WITH_TEMP_PASSWORD'
```

### Set a permanent password manually

Use only for break-glass support. This bypasses the normal invitation flow.

```bash
aws cognito-idp admin-set-user-password \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --username user@example.com \
  --password 'REPLACE_WITH_STRONG_PASSWORD' \
  --permanent
```

## Disable, enable, or delete access

Disable first when offboarding. Delete only when you intentionally want to remove the Cognito identity.

```bash
aws cognito-idp admin-disable-user \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --username user@example.com
```

```bash
aws cognito-idp admin-enable-user \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --username user@example.com
```

```bash
aws cognito-idp admin-delete-user \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --username user@example.com
```

## Inspect users

List users:

```bash
aws cognito-idp list-users \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB
```

Inspect one user:

```bash
aws cognito-idp admin-get-user \
  --region us-east-1 \
  --user-pool-id us-east-1_BKJ4W7woB \
  --username user@example.com
```

## Least-privilege operator IAM

Start with the smallest policy needed for user operations:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminResetUserPassword",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminDisableUser",
        "cognito-idp:AdminEnableUser",
        "cognito-idp:ListUsers"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:<account-id>:userpool/us-east-1_BKJ4W7woB"
    }
  ]
}
```

Add `cognito-idp:AdminDeleteUser` only for operators allowed to permanently delete users.

## Post-create smoke test

After creating a production user:

1. Open `https://main.d22icjbzj7x471.amplifyapp.com/login`.
2. Sign in with the invited email and temporary password.
3. Complete the first-login password change.
4. Create a chat and wait for the AI response.
5. Refresh and reopen the saved session.
6. Click **New stream** and confirm a fresh empty chat opens.

If login works but chat fails, check Amplify Hosting runtime logs first. The likely production-only issue is Bedrock IAM permission for the SSR runtime role.
