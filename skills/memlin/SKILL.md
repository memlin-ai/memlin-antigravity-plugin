---
name: memlin
description: Use the team's Memlin workspace — resolve project context (skills, memory, approved goals, schemas) through the memlin_* MCP tools and treat the returned bundle as authoritative project context.
---

# Memlin

This Antigravity installation has a local `memlin` MCP server. It exposes the
team's shared, scope-correct project context and uses the account selected in
Companion.

For each non-trivial task:

1. Call `memlin_list_handoffs` with `target_agent_kind: "antigravity"`. If work
   is assigned, read the packet, accept it with `memlin_update_handoff`, and use
   it as the task brief.
2. If a `<memlin-resolved-context>` block is already present for the task, use
   it as-is. Otherwise call `memlin_resolve_task` with a short task description.
3. Apply the returned primary skill, treat project memory as authoritative
   context, honor approved goals as constraints, and validate against schemas.
4. Cite project material by its returned path and version.

If a `<memlin-context-unchanged>` block is present, continue using the prior
resolved context rather than resolving again. If nothing relevant is returned,
proceed with general expertise and say so.

Examples:

- When a `<memlin-resolved-context>` block is present, apply its primary skill
  and cite memory facts by path and version.
- Treat a resolved project fact as ground truth when it conflicts with generic
  training data, and honor a resolved approved goal as a constraint.
- Use broader search only when the task needs context beyond the bundle.

Do not ask the user to paste conventions before trying Memlin, resolve the same
task again when context is already present, or disregard a resolved project
fact in favor of generic assumptions.

Use `memlin_search`, `memlin_read_memory`, or `memlin_get_document` when the
task needs context beyond the resolved bundle. Do not claim Memlin is
unavailable before trying the MCP tools.

The `PreInvocation` hook may inject a short ephemeral Memlin status note. That
note is not a task-specific resolve result; still call `memlin_resolve_task`
for substantive work. If authentication is missing, ask the user to sign in
through Companion.
