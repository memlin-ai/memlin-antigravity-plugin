# Memlin

This workspace is connected to a Memlin workspace. The `memlin` MCP server is
configured in `~/.gemini/antigravity/mcp_config.json` — its tools expose the
team's shared memory, skills, approved goals, and schemas.

## Available MCP tools

| Tool                  | Purpose                                                           |
| --------------------- | ----------------------------------------------------------------- |
| `memlin_resolve_task` | Scope-correct bundle of skills, memory, goals, schemas for a task |
| `memlin_search`       | Broad natural-language search across the workspace                |
| `memlin_read_memory`  | Read specific memory facts (with optional filter)                 |
| `memlin_get_document` | Fetch the full body of a document cited in a bundle               |

## Resolve context for each task

### 1. Check for handoffs

At session start, call **`memlin_list_handoffs`** with `target_agent_kind:
"antigravity"` to check for assigned work. If a handoff exists, read its
`packet_markdown`, call **`memlin_update_handoff`** with `action: "accept"`,
and use the packet as the task brief. Mark it `complete` when finished.

### 2. Resolve context

Follow these rules in order:

- **`<memlin-resolved-context>` block present** — the `SessionStart` hook
  already resolved context for this session. Use it as-is; do **not** re-call
  `memlin_resolve_task` for the same message.
- **`<memlin-context-unchanged>` block present** — the prior resolved context
  still applies. Continue using it without re-resolving.
- **`<memlin-auth-notice>` block present** — Memlin is not signed in or the
  token could not refresh. Tell the user to run `memlin login` in the terminal.
  Do **not** silently proceed as if Memlin context were available.
- **No resolved context and the task is non-trivial** — call
  **`memlin_resolve_task`** with a short description of the task. It returns a
  scope-correct, citation-bearing bundle: the top skills, memory facts,
  approved goals, and schemas for this project.

## How to use the bundle

1. **Treat it as authoritative project context** — it is scope-filtered and
   RLS-enforced server-side; you don't need to ask the user for access.
2. **Apply the primary skill's framework** first; use supporting skills for
   complementary perspectives. **Treat memory facts as project ground truth**
   (more authoritative than training data when they conflict). **Honor goals
   as constraints. Validate against any schemas.**
3. **Cite your sources** — name the path + version, e.g. "Per
   `goals/auth-required.md` v1, every new endpoint requires authn."

## Explore beyond the current task

- "What does Memlin know about X?" (broader than the task) → `memlin_search`.
- "List all approved goals in this project" → `memlin_read_memory` + filter.
- Full body of a doc the bundle only cited → `memlin_get_document`.

If nothing relevant comes back, proceed with general expertise and say so.

## Workflows

Memlin ships workspace operations as Antigravity workflows under
`.agent/workflows/`. Invoke them with `/memlin-*`:

| Workflow           | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `/memlin-status`   | Auth, bound account + project, sync state     |
| `/memlin-sync`     | Full bidirectional sync (pull + push)         |
| `/memlin-resolve`  | Resolve + print the context bundle for a task |
| `/memlin-handoffs` | List / accept / complete agent handoffs       |
| `/memlin-ask`      | Natural-language query with citations         |
| `/memlin-scribe`   | Extract decisions/memories from this session  |
| `/memlin-inbox`    | Review scribe proposals (accept / reject)     |
