---
name: memlin
description: Use the team's Memlin workspace — resolve project context (skills, memory, approved goals, schemas) via the memlin_* MCP tools, run /memlin-* workflows for sync/status/handoffs, and treat the resolved bundle as authoritative project context.
---

# Memlin

This workspace is connected to a Memlin workspace. Memlin gives Antigravity the
team's shared, scope-correct context (skills, memory, approved goals, schemas)
and the tools to keep it in sync.

## Resolve context for a task

At session start, call **`memlin_list_handoffs`** with `target_agent_kind:
"antigravity"` to check for assigned work. If a handoff exists, read its
`packet_markdown`, call **`memlin_update_handoff`** with `action: "accept"`,
and use the packet as the task brief. Mark it `complete` when finished.

Before non-trivial work, call the **`memlin_resolve_task`** MCP tool with a
short description of the task. It returns a citation-bearing bundle: the top
skills, memory facts, approved goals, and schemas for this project. The
`SessionStart` hook also injects a Memlin context note when the workspace is
bound.

Use the bundle as authoritative project context: apply the primary skill's
framework, treat memory facts as ground truth (more authoritative than training
data when they conflict), honor goals as constraints, validate against schemas,
and cite sources by path + version. To explore beyond the task, use
`memlin_search`, `memlin_read_memory`, or `memlin_get_document` directly.

## Workflows (slash commands)

Memlin ships its workspace operations as Antigravity workflows under
`.agent/workflows/`. Invoke them as slash commands:

| Workflow           | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `/memlin-status`   | auth, bound account + project, sync state     |
| `/memlin-sync`     | full bidirectional sync (pull + push)         |
| `/memlin-resolve`  | resolve + print the context bundle for a task |
| `/memlin-handoffs` | list / accept / complete agent handoffs       |
| `/memlin-ask`      | natural-language query with citations         |
| `/memlin-scribe`   | extract decisions/memories from this session  |
| `/memlin-inbox`    | review scribe proposals (accept / reject)     |
| `/memlin-help`     | full command list (every command, grouped)    |

The CLI ships every Memlin command — including ones without a workflow
shortcut (revert, pull, push, push-plan, pull-plans, bind-plans, actions-list,
actions-execute, audit-replay, audit-explain, role, doctor, add-project, link).
For the complete categorized list, run `memlin help`.

If Memlin is not signed in, run `memlin login` in the terminal once per machine.
