# 4. Observability

The layer that receives and displays execution records. It is not part of the request processing path. It only stores the records that other components send. Langfuse is used as the example tool.

## Responsibilities

- Record the acceptance, dispatch, and completion of every request the gateway handles.
- Keep one identifier across machines. A task that moves from a PC to the central server and then to an execution machine is viewed as one record.
- Show where time was spent, where a task failed, and how much model usage occurred.

## Out of scope

- Delaying or blocking requests.
- Serving as the source of truth for authorization decisions. The source of truth for who was allowed or denied what is each host's audit log and the task ledger.
- Judging the quality of the work. Records alone do not show whether an answer was correct.

## Record sources

| Source | What it records |
| --- | --- |
| Gateway tap, user side | Acceptance and completion of requests from PCs and the messenger |
| Gateway tap, execution-machine side | The times at which an execution machine fetched a task and reported on it |
| Model gateway | Model, token count, and duration of each model call |
| Agent host | Tool calls and authorization decisions |
| Desktop app | Time spent awaiting approval and time spent executing. Submitted through the gateway. |

## Record structure

| Unit | Meaning | Example |
| --- | --- | --- |
| trace | One execution accepted by the gateway | One task |
| span | An interval with a start and an end | Gateway turn, tool round trip, host start, approval wait |
| event | A fact at one point in time | An authorization decision. Denials and blocks are marked as warnings. |
| generation | One model call | Model, token count, duration |

Example records for the second use case (handing off before leaving work). The names are illustrative.

```text
trace  run-7c1e   PC-A → central → VM-1
├ gateway.turn       accepted, target VM-1
├ task.create        delegation token issued
├ task.claim         waited 4 s
├ host.spawn         start duration
├ policy.decision    allow
├ tool               read wiki
├ model.request      generation × 6
├ approval.wait      13 h
├ apply              hash matched
└ terminal           complete
```

## Checks at the boundary

- **Records are sent asynchronously.** A failed send does not affect the request.
- **Content is excluded by default.** Only the model, token count, duration, and decision are sent. Prompt and response bodies are enabled per profile. If all bodies are collected in a multi-user environment, the observability server becomes the most sensitive data store.
- **Users are recorded under pseudonyms.** The pseudonym is derived from the identity the server authenticated. A name sent by a client is not trusted.
- **Execution machines hold no observability server key.** Their records are submitted through the gateway.
- **Long tasks are split into short records.** For an interval that lasts hours, such as an approval wait, the start and the end are recorded separately.

## Failure behavior

- **The observability server is down**: Tasks continue, and records for that period are missing. The missing period can be checked in the task ledger and the hosts' audit logs.
- **The end of an interval is lost in a restart**: The end time is not fabricated. A separate recovery record is attached.

## Open questions

- How long to retain records.
- Which clock to use for interval durations when a user's PC and the server disagree. Using the duration measured by each process is the safer choice.
