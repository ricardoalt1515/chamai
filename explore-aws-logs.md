# AWS/Prod Observability Scout — after `4d9fa1a`

Read-only scout run from `/Users/ricardoaltamirano/Developer/SecondstreamAI` on 2026-05-14 UTC. No files were edited except this requested report. No AWS resources were mutated.

## Scope and time windows

- Commit checked: `4d9fa1a89c23acb973f5b8c6d1d91c1d13530572` — `Store Lambda message payloads as JSON`
- Commit time: `2026-05-14 08:55:30 -0700` / `2026-05-14T15:55:30Z`
- Amplify deploy job: `16`, status `SUCCEED`
  - start: `2026-05-14T08:55:32.976-07:00` / `2026-05-14T15:55:32.976Z`
  - end: `2026-05-14T09:04:09.883-07:00` / `2026-05-14T16:04:09.883Z`
- Log search start used: `1778774130000` (`2026-05-14T15:55:30Z`), i.e. from the commit timestamp.
- Metric search start used: `2026-05-14T16:04:09Z`, i.e. after successful deploy completion.
- Log groups searched:
  - Lambda: `/aws/lambda/amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw`
  - Amplify SSR: `/aws/amplify/d22icjbzj7x471`

## Commands used

```bash
git show -s --format='%H %ci %s' 4d9fa1a
aws sts get-caller-identity --output json
aws configure get region || true
python3 - <<'PY'
from datetime import datetime, timezone
start='2026-05-14T15:55:30Z'
dt=datetime.fromisoformat(start.replace('Z','+00:00'))
print(int(dt.timestamp()*1000))
print(datetime.now(timezone.utc).isoformat())
PY
```

```bash
START=1778774130000
for LG in "/aws/lambda/amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw" "/aws/amplify/d22icjbzj7x471"; do
  aws logs describe-log-streams --log-group-name "$LG" --order-by LastEventTime --descending --max-items 5 --output table --query 'logStreams[].{stream:logStreamName,last:lastEventTimestamp,stored:storedBytes}'
  for PAT in '"Thread not found"' '"title"' '"update"' '"message persistence"' '"JSON"' '"payload"' '"AppSync"' '"Unauthorized"' '"DynamoDB"' '"assistant"' '"ERROR"' '"Error"' '"Exception"'; do
    aws logs filter-log-events --log-group-name "$LG" --start-time "$START" --filter-pattern "$PAT" --max-items 20 --output json --query 'events[].{time:timestamp,stream:logStreamName,msg:message}'
  done
  for PAT in '"error"' '"Failed"' '"failed"' '"Validation"' '"AccessDenied"' '"ConditionalCheckFailed"' '"ResourceNotFound"' '"write"' '"persist"' '"message"' '"thread"' '"GraphQL"' '"graphql"'; do
    aws logs filter-log-events --log-group-name "$LG" --start-time "$START" --filter-pattern "$PAT" --max-items 10 --output text --query 'events[].{time:timestamp,stream:logStreamName,msg:message}'
  done
done
```

```bash
START=1778774130000
for LG in "/aws/lambda/amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw" "/aws/amplify/d22icjbzj7x471"; do
  aws logs filter-log-events --log-group-name "$LG" --start-time "$START" --max-items 100 --output text --query 'events[].{time:timestamp,stream:logStreamName,msg:message}'
done
```

```bash
FN='amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw'
aws lambda get-function-configuration --function-name "$FN" --output json --query '{FunctionName:FunctionName,LastModified:LastModified,Runtime:Runtime,Handler:Handler,CodeSha256:CodeSha256,Version:Version,RevisionId:RevisionId,MemorySize:MemorySize,Timeout:Timeout,EnvironmentKeys:keys(Environment.Variables)}'
aws amplify get-app --app-id d22icjbzj7x471 --output json --query '{appId:app.appId,name:app.name,defaultDomain:app.defaultDomain,repository:app.repository,productionBranch:app.productionBranch}'
aws amplify get-branch --app-id d22icjbzj7x471 --branch-name main --output json --query '{branchName:branch.branchName,stage:branch.stage,displayName:branch.displayName,enableAutoBuild:branch.enableAutoBuild,activeJobId:branch.activeJobId,totalNumberOfJobs:branch.totalNumberOfJobs,updateTime:branch.updateTime}'
aws amplify list-jobs --app-id d22icjbzj7x471 --branch-name main --max-items 5 --output json --query 'jobSummaries[].{jobId:jobId,commitId:commitId,commitMessage:commitMessage,status:status,startTime:startTime,endTime:endTime}'
aws lambda get-function-configuration --function-name "$FN" --output json --query 'Environment.Variables' | jq '{LAMBDA_CHAT_SESSION_TABLE_NAME,LAMBDA_CHAT_MESSAGE_TABLE_NAME,LAMBDA_CHAT_MESSAGE_SESSION_ID_INDEX_NAME,LAMBDA_CHAT_SESSION_USER_ID_INDEX_NAME,LAMBDA_CHAT_BLOB_BUCKET_NAME,LAMBDA_CHAT_BLOB_PREFIX,CHAT_STREAM_ALLOWED_ORIGINS,COGNITO_USER_POOL_ID,COGNITO_USER_POOL_CLIENT_ID}'
aws lambda get-function-url-config --function-name "$FN" --output json --query '{FunctionUrl:FunctionUrl,AuthType:AuthType,InvokeMode:InvokeMode,Cors:Cors}'
```

```bash
START_ISO='2026-05-14T16:04:09Z'; END_ISO=$(date -u +%Y-%m-%dT%H:%M:%SZ); FN='amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw'
for METRIC in Invocations Errors Duration; do
  aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name "$METRIC" --dimensions Name=FunctionName,Value="$FN" --start-time "$START_ISO" --end-time "$END_ISO" --period 60 --statistics Sum Average Maximum --output json --query 'Datapoints[] | sort_by(@,&Timestamp)'
done

for TABLE in 'Session-qqaerit4p5dt3olerx7w3mj374-NONE' 'Message-qqaerit4p5dt3olerx7w3mj374-NONE'; do
  for METRIC in UserErrors SystemErrors ThrottledRequests ConditionalCheckFailedRequests; do
    aws cloudwatch get-metric-statistics --namespace AWS/DynamoDB --metric-name "$METRIC" --dimensions Name=TableName,Value="$TABLE" --start-time "$START_ISO" --end-time "$END_ISO" --period 60 --statistics Sum --output json --query 'Datapoints[] | sort_by(@,&Timestamp)'
  done
done
```

## Deployed resource clues

- AWS caller/region used for read-only inspection:
  - account: `882816896907`
  - caller ARN: `arn:aws:iam::882816896907:user/CTOAdmin`
  - region: `us-east-1`
- Amplify app:
  - app id: `d22icjbzj7x471`
  - app name: `SecondstreamAI`
  - production branch: `main`
  - default domain: `d22icjbzj7x471.amplifyapp.com`
  - production deploy status after `4d9fa1a`: `SUCCEED`
- Lambda function:
  - name: `amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw`
  - last modified: `2026-05-14T15:59:40.000+0000`
  - runtime: `nodejs22.x`
  - handler: `index.handler`
  - version: `$LATEST`
  - code sha256: `dc6Hq8pXMhK4tfXHf0GWsTRVsriCUso6oRxXE/pxud4=`
  - memory: `128 MB`
  - timeout: `60s`
- Function URL:
  - URL: `https://ywyhxx4rlpppfkmqvnrh7ujlia0ydkxp.lambda-url.us-east-1.on.aws/`
  - auth type: `NONE`
  - invoke mode: `RESPONSE_STREAM`
  - CORS origins: `https://main.d22icjbzj7x471.amplifyapp.com`, `http://localhost:3000`
  - CORS allowed methods: `POST`
  - CORS allowed headers include `authorization`, `content-type`, `accept`, `x-request-id`
- Lambda data/storage env clues:
  - session table: `Session-qqaerit4p5dt3olerx7w3mj374-NONE`
  - message table: `Message-qqaerit4p5dt3olerx7w3mj374-NONE`
  - message session index: `messagesBySessionId`
  - session user index: `gsi-User.sessions`
  - blob bucket: `amplify-d22icjbzj7x471-ma-secondstreamprivatefiles-uwhlg0fbeexx`
  - blob prefix: `lambda-chat/attachments/`
  - Cognito user pool: `us-east-1_BKJ4W7woB`
  - Cognito app client: `1d678mjdsst10kseoacuot1cap`

## Log search results

### Explicit error/symptom patterns

Searched both known log groups from `2026-05-14T15:55:30Z` for:

- `Thread not found`
- `title`
- `update`
- `message persistence`
- `JSON`
- `payload`
- `AppSync`
- `Unauthorized`
- `DynamoDB`
- `assistant`
- `ERROR`, `Error`, `Exception`, `error`
- `Failed`, `failed`
- `Validation`
- `AccessDenied`
- `ConditionalCheckFailed`
- `ResourceNotFound`
- `write`, `persist`, `message`, `thread`
- `GraphQL`, `graphql`

Result: no matching events returned in either log group for those patterns.

### Lambda chat streaming log snippets

Log group: `/aws/lambda/amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw`

Recent log stream after deploy:

```text
2026/05/14/[$LATEST]d170ba2a653b4c9e860a126a78be1d4b lastEventTimestamp=1778775013713
```

Relevant events from the smoke-like request:

```text
2026-05-14T16:10:09.959Z INIT_START Runtime Version: nodejs:22.v78 Runtime Version ARN: arn:aws:lambda:us-east-1::runtime:ab6b11703de54c7e23d588024a17ddfc191cdfd59fda97876f938c3c51e3eaa5
2026-05-14T16:10:10.862Z START RequestId: b928fb10-d553-4afb-a917-2dd9e4083f15 Version: $LATEST
2026-05-14T16:10:10.931Z b928fb10-d553-4afb-a917-2dd9e4083f15 INFO {"level":"info","event":"request_start","correlationId":"b928fb10-d553-4afb-a917-2dd9e4083f15","method":"POST","origin":"https://main.d22icjbzj7x471.amplifyapp.com"}
2026-05-14T16:10:12.231Z b928fb10-d553-4afb-a917-2dd9e4083f15 INFO {"level":"info","event":"auth_result","correlationId":"b928fb10-d553-4afb-a917-2dd9e4083f15","success":true}
2026-05-14T16:10:13.713Z b928fb10-d553-4afb-a917-2dd9e4083f15 INFO {"level":"info","event":"handler_result","correlationId":"b928fb10-d553-4afb-a917-2dd9e4083f15","status":200}
2026-05-14T16:10:29.514Z b928fb10-d553-4afb-a917-2dd9e4083f15 INFO {"level":"info","event":"stream_event","correlationId":"b928fb10-d553-4afb-a917-2dd9e4083f15","completed":true}
2026-05-14T16:10:29.574Z END RequestId: b928fb10-d553-4afb-a917-2dd9e4083f15
2026-05-14T16:10:29.574Z REPORT RequestId: b928fb10-d553-4afb-a917-2dd9e4083f15 Duration: 18711.65 ms Billed Duration: 19611 ms Memory Size: 128 MB Max Memory Used: 120 MB Init Duration: 898.45 ms
```

Interpretation: the Lambda received one authenticated POST from the production Amplify origin, returned handler status `200`, and emitted a completed stream event. No Lambda-side errors or targeted persistence/payload/auth symptoms appeared in the searched window.

### Amplify SSR log snippets

Log group: `/aws/amplify/d22icjbzj7x471`

Recent streams after deploy include:

```text
main/2026/05/14/baacf6806a75441585cd8308ce2fde04 lastEventTimestamp=1778774987697
main/2026/05/14/2f81f53cd9e2488ca8406cb7fe7ee13a lastEventTimestamp=1778774987099
main/2026/05/14/a9b8b7d912bc44b79cf7b35cfd29be79 lastEventTimestamp=1778774986260
main/2026/05/14/b41a956b8edb475da21a63e92466b89a lastEventTimestamp=1778774986140
main/2026/05/14/68950e06e72e4e78b8370e8e0c872b99 lastEventTimestamp=1778774981525
```

Representative SSR events around and after smoke activity:

```text
2026-05-14T16:09:39.124Z START RequestId: 88040080-e1a8-475e-8a9f-257ac6229a36 Version: $LATEST
2026-05-14T16:09:39.125Z Starting request using compute deployment_id: 3bd8059f-11cb-47ed-bf24-f739a7bc1d2d and compute version: $LATEST
2026-05-14T16:09:41.525Z REPORT RequestId: 88040080-e1a8-475e-8a9f-257ac6229a36 Duration: 2400.12 ms Billed Duration: 3798 ms Memory Size: 1024 MB Max Memory Used: 198 MB Init Duration: 1396.98 ms
...
2026-05-14T16:10:14.257Z START RequestId: 18f45963-d2bd-41d3-89ff-0ec2cb3e9579 Version: $LATEST
2026-05-14T16:10:14.258Z Starting request using compute deployment_id: 3bd8059f-11cb-47ed-bf24-f739a7bc1d2d and compute version: $LATEST
2026-05-14T16:10:14.990Z REPORT RequestId: 18f45963-d2bd-41d3-89ff-0ec2cb3e9579 Duration: 733.07 ms Billed Duration: 734 ms Memory Size: 1024 MB Max Memory Used: 182 MB
2026-05-14T16:10:29.688Z START RequestId: 244db8e4-f6ca-4819-a526-38975e996ea1 Version: $LATEST
2026-05-14T16:10:29.690Z Starting request using compute deployment_id: 3bd8059f-11cb-47ed-bf24-f739a7bc1d2d and compute version: $LATEST
2026-05-14T16:10:30.397Z REPORT RequestId: 244db8e4-f6ca-4819-a526-38975e996ea1 Duration: 707.86 ms Billed Duration: 708 ms Memory Size: 1024 MB Max Memory Used: 182 MB
2026-05-14T16:10:39.717Z START RequestId: 19f6746a-993c-4c8a-9036-36da272504a1 Version: $LATEST
2026-05-14T16:10:39.723Z Starting request using compute deployment_id: 3bd8059f-11cb-47ed-bf24-f739a7bc1d2d and compute version: $LATEST
2026-05-14T16:10:39.997Z REPORT RequestId: 19f6746a-993c-4c8a-9036-36da272504a1 Duration: 279.11 ms Billed Duration: 280 ms Memory Size: 1024 MB Max Memory Used: 182 MB
2026-05-14T16:10:41.607Z START RequestId: 516bacfe-1774-41b3-a724-533b1a15bdd9 Version: $LATEST
2026-05-14T16:10:41.608Z Starting request using compute deployment_id: 3bd8059f-11cb-47ed-bf24-f739a7bc1d2d and compute version: $LATEST
2026-05-14T16:10:42.433Z REPORT RequestId: 516bacfe-1774-41b3-a724-533b1a15bdd9 Duration: 825.80 ms Billed Duration: 826 ms Memory Size: 1024 MB Max Memory Used: 182 MB
```

Interpretation: Amplify SSR showed normal START/REPORT lifecycle entries only in the sampled events. No targeted error strings appeared in the searched window.

## CloudWatch metrics

Range: `2026-05-14T16:04:09Z` to approximately `2026-05-14T16:16Z`.

### Lambda metrics

Function: `amplify-d22icjbzj7x471-ma-ChatStreamingFunctionF36-AlIdZ4i4gRBw`

```text
Invocations: one datapoint at 2026-05-14T16:10:00Z, Sum=1
Errors:      one datapoint at 2026-05-14T16:10:00Z, Sum=0
Duration:    one datapoint at 2026-05-14T16:10:00Z, Average/Sum/Maximum=18711.65 ms
```

Interpretation: the post-deploy smoke-like Lambda invocation completed without CloudWatch Lambda errors.

### DynamoDB metrics

Tables checked:

- `Session-qqaerit4p5dt3olerx7w3mj374-NONE`
- `Message-qqaerit4p5dt3olerx7w3mj374-NONE`

Metrics checked for both tables:

- `UserErrors`
- `SystemErrors`
- `ThrottledRequests`
- `ConditionalCheckFailedRequests`

Result: no datapoints returned for those metrics in the post-deploy window.

Interpretation: no CloudWatch DynamoDB error/throttle/conditional-failure metrics were observed for the session/message tables during the searched post-deploy interval. Absence of datapoints is consistent with no reported errors for these metrics, but it is not a row-level proof that every expected write occurred.

## Overall interpretation

- Production deploy for `4d9fa1a` succeeded and appears active on `main`.
- The Lambda function was updated shortly after the commit/deploy and is configured for streaming via Function URL.
- A production-origin chat POST occurred around `2026-05-14T16:10Z`.
- That request authenticated successfully, returned handler status `200`, completed streaming, and had zero Lambda `Errors` metric datapoints.
- Searches found no CloudWatch log evidence of:
  - `Thread not found`
  - title/update errors
  - message persistence errors
  - JSON/payload errors
  - AppSync/Unauthorized symptoms
  - DynamoDB errors
  - assistant message write failures
- The most relevant runtime risk visible in logs is resource headroom: the Lambda used `120 MB` of `128 MB` during the smoke-like request. It succeeded, but memory margin is narrow.

## Caveats

- This was log/metric observation only; I did not mutate AWS or run an active production request.
- CloudWatch logs shown here do not expose row-level confirmation of session/message records; they only show no logged failures and successful handler/stream completion.
- Engram save was requested for important discoveries, but no Engram memory tool is available in this subagent tool surface, so I could not persist the finding there.
