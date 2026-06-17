---
name: memlin-resolve
description: Resolve and print the Memlin context bundle (skills, memory, approved goals, schemas) for a task description.
---

Call the **`memlin_resolve_task`** MCP tool with a short description of the
current task (pass the user's argument as the description). Present the returned
bundle: primary skill, supporting skills, memory facts, approved goals, and
schemas — each with its path + version citation. Then apply it as authoritative
project context for the work that follows.
