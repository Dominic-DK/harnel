# 1. User entry

The layer where a user submits requests, gives approvals, and reads results. It consists of a desktop app and a messenger integration.

## Responsibilities

- Accept a request and submit it to the central gateway.
- Execute file operations and commands for a user's PC on that PC. The model runs centrally. Only the tool calls requested by the model are sent to the PC and executed there.
- Show the list of tasks that ran on other machines and the items awaiting approval.
- In the messenger, show a short answer and approval buttons. Supporting evidence is sent only on request.

## Out of scope

- Storing task state. State is stored in the task ledger on the central server.
- Handling files on other machines.
- Holding model account keys.

## Checks at the boundary

| Check | Description |
| --- | --- |
| Read scope | Reads are limited to the folder the user selected. |
| Write method | A write goes to a working copy first. After the user reviews the change, the app re-compares the hash of the original to confirm it has not changed, then applies the change. |
| Command execution | Requires an allowlist, local approval, and an OS sandbox. Network access is blocked. |
| Access mode change | Cannot be changed during execution, and cannot be changed by the model through tool arguments. |
| UI and main process | The UI process cannot access files or the network directly. It requests them from the main process through a restricted interface. |

## Data exchanged

| Data | Direction | Fields |
| --- | --- | --- |
| User key | App → gateway | A key unique to each user. With a shared key the gateway cannot tell who made a request. |
| Request | App → gateway | Request ID, execution location (this PC or an execution machine), content |
| Events | Gateway → app | Sequence-numbered, so the app can resume after a disconnection. |
| Tool call | Gateway → app | The execution right is limited to one PC. Another PC cannot claim it. |
| Tool result | App → gateway | The app stores the intent before execution and the result after execution locally, then sends the result. |

## Failure behavior

- **The app is closed**: Tasks executing on that PC are cancelled. Tasks assigned to execution machines continue.
- **The PC is off**: Tasks targeting that PC are held in a queue until it is on. They are not moved to another machine, because the files exist only on that PC.
- **A tool result is not delivered**: The app resends only the stored result. An operation whose outcome is uncertain is not executed again.

## Open questions

- How to map a messenger user to a gateway user: a mapping table, or the company's single sign-on.
- How much of a change the approval screen must show for users to actually read it before approving.
