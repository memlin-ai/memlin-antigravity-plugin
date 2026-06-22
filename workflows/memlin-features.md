---
name: memlin-features
description: Create a Memlin Feature / Workstream and tag your work into it from this Antigravity workspace.
---

A Feature (a.k.a. Workstream on non-code projects) gathers the thoughts, plans,
goals, schemas, and shipped PRs behind one thing you're building. Use the MCP
tools to organize the brain around the work you're doing:

1. **`memlin_create_feature`** with `{ title, summary?, project_id? }` — start a
   feature for the unit of work. Omit `project_id` to use the connection's bound
   project. Note the returned `id`.
2. As you capture or surface relevant items, **`memlin_add_to_feature`** with
   `{ feature_id, source: { kind, id } }` to attach them — `kind` is one of
   thought/file/todo/plan/goal/memory/skill/schema/decision; get ids from
   `memlin_search` or `memlin_resolve_task`.

Everything you attach (plus the PRs and handoffs scoped to it) shows up on the
feature's detail page at memlin.ai. Relay the feature you created and what you
attached.
