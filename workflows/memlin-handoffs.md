---
name: memlin-handoffs
description: List, accept, or complete Memlin agent handoffs targeted at this Antigravity workspace.
---

Use the MCP tools to manage handoffs:

1. **`memlin_list_handoffs`** with `target_agent_kind: "antigravity"` — list
   pending handoffs for this workspace.
2. To take one: read its `packet_markdown`, call **`memlin_update_handoff`**
   with `action: "accept"`, and use the packet as the task brief.
3. When the work is done, call `memlin_update_handoff` with `action: "complete"`.

Relay the list and the action taken.
