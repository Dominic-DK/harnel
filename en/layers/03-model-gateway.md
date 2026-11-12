# 3. Model gateway

The server that relays model requests from agents. Model account credentials exist only on this server. An agent uses a short-lived key generated for each task.

## Responsibilities

A request is processed in this order.

| Step | Stage | Description |
| --- | --- | --- |
| 1 | Verify short-lived key | Checks the signature made with the per-host secret and the expiry. |
| 2 | Check path and model | Rejects paths and models that are not on the allowlist. |
| 3 | Rebuild request | Builds a new request from allowed fields only. Unknown fields are dropped. |
| 4 | Check budget | Each profile has a daily limit. Near the limit, the gateway switches to a smaller model or rejects the request. |
| 5 | Forward to account pool | The account pool selects an account, adds its token, and sends the request to the model provider. |
| 6 | Record usage | Records usage per profile. |
| 7 | Record observation | Attaches the model call to the trace ID passed by the host. |

The account pool is a proxy that holds several accounts and switches to the next account when one reaches its limit. An existing open-source proxy is used as is, with API-key accounts.

## Out of scope

- Deciding what work to do.
- Executing files or commands.
- Evaluating user permissions. The host's policy does that.

## Data exchanged

**Short-lived key**

| Field | Description |
| --- | --- |
| Host | The host that generated the key |
| Profile | Used to look up the budget and allowed models |
| Task ID | Valid for this task only |
| Expiry | Slightly longer than the expected task duration |
| Signature | Signed with a secret unique to each host. One host cannot generate a key for another host. |

## Checks at the boundary

- Each host must have its own signing secret. With a shared secret, a read-only host could impersonate a host with write access.
- The account pool is placed behind the model gateway and is not exposed directly.
- Each consumer (the central gateway and the model gateway) has its own key, so that usage is reported separately.

## Caution

When rebuilding a request, list safety-related fields explicitly in the allowlist so that they are not dropped. The request still succeeds without them, so the omission is hard to notice until you inspect the usage records.

## Failure behavior

- **Budget exceeded**: Depending on configuration, the gateway switches to a smaller model or rejects the request. A rejection is recorded in observability.
- **Every account in the pool has reached its limit**: The gateway waits until a limit resets or returns a failure. Waiting is preferable for unattended tasks.
- **Invalid or expired signature**: The request is rejected. The host can generate a new key and retry.

## Similar decisions elsewhere

- [Coder AI Gateway](https://coder.com/solutions/ai-governance): provider keys do not leave the control plane, and model requests are recorded per user.
- [agentgateway](https://github.com/agentgateway/agentgateway): applies policy to traffic among agents, tools, and models.

## Open questions

- Whether model requests from the desktop app should also go through this gateway, or whether the central gateway should send them to the account pool directly.
- Whether to set budgets per profile only, or per user as well.
