# AWS CloudWatch Latest Chat Streaming Scout

## Scope

Read-only CloudWatch/log scout for the latest visible chat-streaming Lambda invocation. AWS CLI was configured and usable. Audit started at `2026-05-19T00:02:15Z`; final log refresh was at `2026-05-19T00:04:24Z`.

## Commands run

```bash
date -u '+%Y-%m-%dT%H:%M:%SZ'
aws sts get-caller-identity --output json
aws logs describe-log-groups --log-group-name-prefix '/aws/lambda' --query 'logGroups[].logGroupName' --output text
aws logs describe-log-streams \
  --log-group-name '/aws/lambda/amplify-goodchat-ricardoa-ChatStreamingFunctionF36-0EiVMZlsaDvl' \
  --order-by LastEventTime --descending --max-items 5 \
  --query 'logStreams[].{name:logStreamName,last:lastEventTimestamp,first:firstEventTimestamp}' \
  --output json
aws logs get-log-events \
  --log-group-name '/aws/lambda/amplify-goodchat-ricardoa-ChatStreamingFunctionF36-0EiVMZlsaDvl' \
  --log-stream-name '2026/05/18/[$LATEST]87c7bd75c79f466a8bc05471251724e5' \
  --start-from-head --output json > /tmp/latest-log-3.json
python3 # local parsing of /tmp/latest-log-3.json for event counts, chunk cadence, gaps, and keyword search
```

Code references checked to interpret log semantics:

```bash
nl -ba amplify/functions/chat-streaming/handler.ts | sed -n '158,179p'
nl -ba src/lib/chat-handler.ts | sed -n '463,583p'
nl -ba src/ai/tools/h2o-artifacts.ts | sed -n '223,320p'
nl -ba src/ai/tools/h2o-artifacts.ts | sed -n '345,385p'
```

## Target log stream

Log group:

`/aws/lambda/amplify-goodchat-ricardoa-ChatStreamingFunctionF36-0EiVMZlsaDvl`

Most recent stream as of final refresh:

```json
{
  "logStreamName": "2026/05/18/[$LATEST]87c7bd75c79f466a8bc05471251724e5",
  "firstEventTimestamp": 1779148431356,
  "lastEventTimestamp": 1779148435053,
  "lastIngestionTime": 1779148435561
}
```

UTC conversion:

- First event: `2026-05-18T23:53:51.356Z`
- Last ingested event: `2026-05-18T23:56:37.627Z`
- RequestId/correlationId: `a78c8045-b59c-438b-a34a-6e5bea5eec62`
- ThreadId from chat logs: `LrSSm-abWausf-aU84DkT`

No newer chat-streaming log stream was present through `2026-05-19T00:04:24Z`.

## Timeline evidence

### Request setup

```text
23:53:51.356 INIT_START Runtime Version: nodejs:22.v78
23:53:52.477 START RequestId: a78c8045-b59c-438b-a34a-6e5bea5eec62 Version: $LATEST
23:53:52.482 {"event":"request_start","method":"POST","origin":"http://localhost:3000"}
23:53:52.613 {"event":"auth_result","success":true}
23:53:52.928 [chat] agent_stream_started { threadId: 'LrSSm-abWausf-aU84DkT', elapsedMs: 0 }
23:53:52.933 {"event":"handler_result","status":200}
23:53:52.944 [chat] agent_stream_ready { durationMs: 16 }
```

### Stream write cadence and sizes

Parsed `stream_write` events:

- Count: `3948`
- First write: `23:53:52.960Z`, chunk `1`, `283` bytes
- Last write: `23:56:37.627Z`, chunk `3948`, `112` bytes
- Final `totalBytes`: `383122`
- All sampled `waitedForDrain` values were `false`.

Byte-size histogram:

```text
<40 bytes:     15
40-79 bytes:   2215
80-129 bytes:  1652
130-219 bytes: 60
>=220 bytes:   6
```

Largest inter-chunk gaps:

```text
23:53:52.969 -> 23:53:54.176  gap 1207 ms  chunk 4 -> 5
23:53:59.951 -> 23:54:01.200  gap 1249 ms  chunk 88 -> 89
23:55:51.031 -> 23:55:52.936  gap 1905 ms  chunk 2361 -> 2362
23:55:52.936 -> 23:55:54.657  gap 1721 ms  chunk 2362 -> 2363
23:55:54.783 -> 23:55:55.936  gap 1153 ms  chunk 2446 -> 2447
23:55:56.167 -> 23:55:58.936  gap 2769 ms  chunk 2480 -> 2481
23:55:58.936 -> 23:56:31.941  repeated ~3000 ms heartbeat-sized chunks, chunk 2481 -> 2492
23:56:31.941 -> 23:56:34.747  gap 2806 ms  chunk 2492 -> 2493
```

Per-second samples:

```text
23:53:52  4 writes,    759 bytes
23:53:54 16 writes,    862 bytes
23:53:55 13 writes,  10483 bytes
23:53:58  7 writes,  31280 bytes
23:54:01 18 writes,   1118 bytes
...
23:55:52  1 write,     212 bytes
23:55:54 84 writes,   9056 bytes
23:55:55  5 writes,    648 bytes
23:55:56 29 writes,   3109 bytes
23:55:58  1 write,     212 bytes
23:56:01  1 write,     212 bytes
23:56:04  1 write,     212 bytes
23:56:07  1 write,     212 bytes
23:56:10  1 write,     212 bytes
23:56:13  1 write,     212 bytes
23:56:16  1 write,     212 bytes
23:56:19  1 write,     212 bytes
23:56:22  1 write,     212 bytes
23:56:25  1 write,     212 bytes
23:56:28  1 write,     212 bytes
23:56:31  1 write,     212 bytes
23:56:34 95 writes,  10374 bytes
23:56:35 527 writes, 56912 bytes
23:56:36 463 writes, 50040 bytes
23:56:37 371 writes, 40189 bytes
```

Interpretation: server-side Lambda did continuously emit during the suspected visible freeze window. From `23:55:58.936Z` through `23:56:31.941Z`, it emitted a `212`-byte chunk roughly every 3 seconds, matching the app heartbeat/status cadence (`src/lib/chat-handler.ts:474-481`). At `23:56:34.747Z`, it resumed high-volume content streaming with 95/527/463/371 writes per second through the final ingested event.

### Agent/tool activity visible in this invocation

Only `loadSkill` tool activity reached CloudWatch step-finish logs:

```text
23:53:55.643 [agent] step:finish stepNumber=0 finishReason='tool-calls' tools='loadSkill'
23:53:58.132 [agent] step:finish stepNumber=1 finishReason='tool-calls' tools='loadSkill,loadSkill'
23:53:59.950 [agent] step:finish stepNumber=2 finishReason='tool-calls' tools='loadSkill'
```

Artifact tool events searched and not found in this invocation:

- `artifact_tool_started`
- `artifact_tool_finished`
- `artifact_render_started` / `artifact_render_finished`
- `artifact_pdf_storage_started` / `artifact_pdf_storage_finished`
- `artifact_db_persist_started` / `artifact_db_persist_finished`
- `generateFieldBrief`, `generatePlaybook`, `generateAnalyticalRead`, `generateProposalShell`

Therefore Field Brief / Playbook / Analytical Read / Proposal Shell did **not** start or finish in the latest invocation before the log stream stopped/ended. No tool-output preliminary artifact chunks can be proven for these tools in this invocation because the artifact tools were never entered.

Code evidence for expected artifact logging and preliminary yields:

- `src/ai/tools/h2o-artifacts.ts:230-246` yields `rendering`, logs render start/finish, then yields `storing`.
- `src/ai/tools/h2o-artifacts.ts:273-298` yields `persisting`, logs DB persist start/finish.
- `src/ai/tools/h2o-artifacts.ts:351-375` logs `artifact_tool_started` and `artifact_tool_finished`.

None of those log events appear in `/tmp/latest-log-3.json` for the latest stream.

### Abort / disconnect / error / finish / save

Keyword search over the latest stream found no entries for:

- `agent_stream_finished`
- `onFinish:before-save`
- `onFinish:saved`
- `onFinish:save-failed`
- `agent_stream_error`
- `stream:error`
- `stream_event { completed: true }`
- `END RequestId`
- `REPORT RequestId`
- `Task timed out`
- `abort`, `disconnect`, `error` related to this request

Code evidence for what should have appeared if finish/save happened:

- `src/lib/chat-handler.ts:544-558` logs `agent_stream_finished` and `onFinish:before-save`.
- `src/lib/chat-handler.ts:572-578` saves the assistant response and logs `onFinish:saved`.
- `amplify/functions/chat-streaming/handler.ts:172-178` logs each `stream_write`, then logs `stream_event` with `completed: true` after `pipeResponseToStream` returns.

Because none of these appeared, CloudWatch evidence does **not** show a normal finish or persistence for the latest invocation.

## Conclusions

1. **Server emitted continuous chunks during the visible freeze.** Evidence: repeated `212`-byte `stream_write` chunks every ~3 seconds from `23:55:58.936Z` through `23:56:31.941Z`, followed by high-volume writes from `23:56:34.747Z` through `23:56:37.627Z`.
2. **Those continuous chunks were likely heartbeat/status chunks, not artifact tool output.** Evidence: exact ~3s cadence matches `AGENT_STATUS_HEARTBEAT_MS` status heartbeat in `src/lib/chat-handler.ts:474-481`; no artifact tool log events occurred.
3. **Field Brief / Playbook / Analytical Read / Proposal Shell did not start in this latest invocation.** Only `loadSkill` tool step-finish logs appear.
4. **Preliminary artifact tool-output chunks were not emitted live or at end in this latest invocation, because the artifact tools were never invoked.** The app code would log artifact tool start/finish and render/storage/persist events if they ran; those logs are absent.
5. **No successful `onFinish` save is evidenced.** No `agent_stream_finished`, `onFinish:before-save`, or `onFinish:saved` log appears. Also no explicit abort/disconnect/error/timeout/REPORT appears by the final refresh.

## Open risk / limitation

CloudWatch `stream_write` telemetry records only chunk index, byte length, total bytes, and drain status; it does not include SSE/UI chunk content. Content classification is therefore inferred from cadence/size plus app code and surrounding structured logs. Direct proof of exact client-visible payload type would require adding safe content-type/part-type telemetry or capturing the HTTP stream client-side.
