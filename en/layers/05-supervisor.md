# 5. Supervisor

The only process that is always running on a cloud VM or an on-premises server. It has no model access and no account keys. Its command set is fixed, so that compromising it does not allow privilege escalation.

## Responsibilities

The supervisor supports exactly seven commands.

| Command | Function |
| --- | --- |
| Register | Announces the machine to the central server with a key unique to that machine. |
| Heartbeat | Periodically reports that it is running. |
| Fetch task | Receives only the tasks addressed to it, over an outbound connection to the central server. |
| Start host | Starts only registered agent host containers. |
| Pass task | Passes the task and its delegation token to a host on the same machine. |
| Report | Sends results, approval requests, and profile hashes to the central server. |
| Stop host | Stops the host after the task, unless the profile is resident. |

An agent runs in one of two modes. Most profiles are started when a task arrives and stopped when it ends. A profile that must watch continuously, such as log monitoring, is left running. In both modes the supervisor is the only process that must always be running.

## Out of scope

- Running arbitrary commands. Only the fixed start and stop commands exist.
- Connecting to anything other than the central server.
- Calling models.
- Starting a new task while the central server is unreachable.
- Evaluating permissions. The supervisor passes the delegation token to the host without inspecting it.

## Checks at the boundary

- **Connection direction**: The machine opens outbound connections to the central server only. A server inside the corporate network joins without any new inbound firewall rule.
- **Registration key**: Unique to each machine. A leaked key cannot be used to impersonate another machine, and only that key needs to be revoked.
- **Startable hosts**: Only hosts listed in the central host registry can be started.

## Data exchanged

| Data | Direction | Fields |
| --- | --- | --- |
| Registration | Machine → central | Machine name, registration key, profiles it can run |
| Heartbeat | Machine → central | Timestamp, running hosts, hash of each profile |
| Task | Central → machine | Task ID, profile, delegation token, trace ID |
| Report | Machine → central | Task ID, state, result or approval request |
| Task request | Machine → central | Used to submit a local event as a task. Accepted only within the registered trigger scope. |

## Failure behavior

- **The central server is unreachable**: The supervisor starts no new task and waits. A task in progress runs to completion, and its report is retained until the connection returns.
- **The machine reboots**: The supervisor is restarted by the OS service manager. It reports that the outcome of the task in progress is unknown. The central server records the task as `Unknown` and does not re-execute it automatically.
- **A host does not respond**: After a timeout the supervisor stops the host and reports a failure.

## Similar decisions elsewhere

- [Claude Managed Agents: self-hosted sandboxes](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes): a worker on the customer's machine claims work from a queue. The worker needs outbound HTTPS only.
- [Cursor self-hosted cloud agents](https://cursor.com/blog/self-hosted-cloud-agents): the worker opens an outbound connection and receives tool calls over it.
- [LangSmith Deployment, hybrid](https://docs.langchain.com/langsmith/deploy-hybrid): a component on the customer's side polls the control plane for changes.
- [Preloop](https://github.com/preloop/preloop): runners connect over an outbound WebSocket.

## Open questions

- Who updates the supervisor itself, and how. Self-update would violate the fixed command set.
- The procedure for provisioning the registration key on a new machine.
