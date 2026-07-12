# Memlin project context

The `memlin` MCP server provides the team's project-scoped skills, memory,
approved goals, schemas, and handoffs.

## Available MCP tools

| Tool                  | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `memlin_resolve_task` | Scope-correct bundle of skills, memory, goals, schemas for a task |
| `memlin_search`       | Broad natural-language search across the workspace                |
| `memlin_read_memory`  | Read specific memory facts (with an optional filter)              |
| `memlin_get_document` | Fetch the full body of a document cited in a bundle               |

## Resolve context for each task

- Check `memlin_list_handoffs` for assigned Antigravity work. Read an assigned
  packet, accept it with `memlin_update_handoff`, and use it as the task brief.
- Before non-trivial work, call `memlin_resolve_task` with a short task
  description.
- If a `<memlin-resolved-context>` block is already present for the task, use
  it as-is instead of resolving the same request again.
- If a `<memlin-context-unchanged>` block is present, continue using the prior
  resolved context.
- A short PreInvocation status note is not a task-specific resolve result.

Apply the primary skill first, use supporting skills where relevant, treat
project memory as authoritative context, honor approved goals as constraints,
validate against schemas, and cite project material by its returned path and
version. Use `memlin_search`, `memlin_read_memory`, or `memlin_get_document`
only when broader context is needed. If nothing relevant is returned, proceed
with general expertise and say so.

Memlin authentication is managed by Companion. If authentication is missing,
ask the user to sign in through Companion. Do not request pasted tokens or
write credentials into this workspace.
