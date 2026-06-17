---
name: memlin-status
description: Show Memlin status — auth (token expiry, refresh state), bound account + project, routing, last sync, and pending local changes.
---

Call the `memlin_status` MCP tool (no arguments) and relay its `summary` field
verbatim. It reports auth, the bound account and project, MCP routing/host, last
sync, and pending local changes — read from `~/.config/memlin/` by the bundled
local stdio MCP server. Do NOT run a `memlin status` terminal command; this
plugin ships no `memlin` CLI on PATH (the bundled CLI lives in the plugin
directory). If the tool is unavailable, Memlin is not connected — tell the user
to sign in (run the installer, or `memlin login`) and restart Antigravity.

Sections to summarize:

- **Auth** — access-token validity + expiry, refresh-token presence
- **Account** — bound account
- **Project** — cwd, auto-resolved project (with reason: git remote / local-path / config)
- **Routing** — host + MCP transport
- **Local state** — tracked docs, last sync, pending added/modified/deleted
