# 6. Agent host

The container in which an agent runs. It has no internet access and no account keys, and it cannot write outside its mounted folders. One container is one permission boundary. One agent is one profile. A profile is the file that defines that agent's policy.

## Principles

- **The model only proposes.** Code inside each tool function decides whether an action is allowed. The model's own restraint is not counted as a control.
- **Default deny.** Only the file extensions, capabilities, and callers listed in the policy are allowed.
- **An approval is valid for one execution only.** If the content, target, requester, or policy changes, a new approval is required.
- **The same write is applied once.** If an approval arrives twice, only the execution that recorded its receipt first performs the write.
- **Restrictions are placed outside the agent.** Mounts, the network, and the gateway enforce them, not the prompt.
- **Verification uses a different method from enforcement.** It does not repeat the decision. It inspects the output that was actually produced.

## Responsibilities

A request passes these checkpoints in order.

| Step | Checkpoint | What is checked |
| --- | --- | --- |
| 1 | Host entry | Signature and expiry of the delegation token |
| 2 | Input format | A request with unknown fields is rejected |
| 3 | Authorization | Whether the subject in the token may use this capability, input size, call rate |
| 4 | Pre-execution snapshot | The state of writable folders is saved |
| 5 | Tool execution and inspection | Path decision, denylist, whether the result contains hidden paths or secret content |
| 6 | Model call | Sent to the model gateway only |
| 7 | Output masking | Values shaped like tokens or passwords are masked |
| 8 | Result comparison | Whether only the expected changes occurred, and whether the answer contains secret content |
| 9 | Pre-send inspection | A final check before the response leaves the host |

## Out of scope

- Direct internet access. The only reachable destination is the model gateway.
- Holding model account keys.
- Calling other hosts.

## Profile contents

| Field | Description |
| --- | --- |
| Readable paths | A scope within the folders mounted into the container |
| Writable paths | None, or a separately mounted folder |
| Denylist | Environment files, keys, certificates, production databases. No approval can open these. |
| Read allowlist | File extensions and names. A file outside the list, such as a log, is opened for one request only, after approval. |
| Allowed subjects and capabilities | Which user or service identity may do what |
| Approvers | Who approves writes for tasks started by a trigger |
| Budget | Daily model usage limit |

The hash of the profile file is registered in the central policy registry. If the file changes, the hash changes. If it differs from the registered value, the host is suspended.

## Operations that require approval

The agent produces a draft and stops. Nothing changes before approval.

| Operation | Values bound to the approval | Blocked when |
| --- | --- | --- |
| Add a note | Requester, approval ID, file, content hash, policy hash, expiry | The same approval is reused |
| Temporary read access | Requester, path list, policy hash, expiry | A denylisted file is requested, or a symlink is replaced between request and approval |
| Code change | Requester, original hash and result hash of each file, policy hash, expiry | A user edited the file after the proposal, or a secret value is added |

## Records

| Record | Content |
| --- | --- |
| Audit log | Every decision. The source of truth for who was allowed or denied what. |
| Evidence | The files read and searches run while producing an answer |
| Approvals and receipts | Prevent the same write from being applied twice |
| Task store | Tasks awaiting approval survive a restart |

## Issues found during implementation

- **The denylist was incomplete.** A listing of key files was visible. The model did not reproduce their contents, but the policy was not blocking them. This confirmed that the model's restraint cannot be relied on.
- **The agent answered that a hidden file did not exist.** It now states that hidden files exist and explains how to request access.
- **A secret value embedded in the middle of a sentence was missed.** The check compared whole lines only. A word-level comparison was added.
- **An ordinary question was blocked.** A file path written in a log was mistaken for a secret value. A blocking rule must be tested against the full set of real files and its false positives counted.

## Failure behavior

- **The delegation token has expired**: The request is rejected. The supervisor must obtain a new token from the central server.
- **The target changed after approval**: The change is not applied, and a new proposal is submitted.
- **Secret content is found in a result**: The result is replaced and the request is marked as failed. No answer is sent.

## Similar decisions elsewhere

- [Coder](https://coder.com/solutions/ai-governance): runs agents in ephemeral workspaces behind a default-deny network and allows only approved domains and HTTP methods.

## Open questions

- Whether per-user permissions are written in each profile file or managed centrally.
- A pre-deployment check for conflicting rules across profiles.
