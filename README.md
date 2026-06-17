# Memlin for Google Antigravity

Full-capability Memlin plugin for the **Antigravity IDE** (the agent-first IDE
from Google, built by the former Windsurf/Codeium team). Targets capability
parity with the Claude Code and Cursor plugins:

| Capability        | How                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| **MCP tools**     | Remote MCP via `serverUrl` in `~/.gemini/antigravity/mcp_config.json` (`memlin_resolve_task`, `memlin_search`, …) |
| **Hooks**         | `SessionStart` / `PreToolHook` / `PostToolHook` / `StopHook` → `@memlin/plugin-core` handlers                     |
| **Commands**      | `/memlin-*` Antigravity workflows in `.agent/workflows/`                                                          |
| **Rules / skill** | `.agent/rules/memlin.md` (via `AntigravityAdapter`) + `.agents/skills/memlin/SKILL.md`                            |
| **Local sync**    | `SessionStart` pulls plans, `PostToolHook` pushes plan edits, all via `@memlin/plugin-core/plan-sync`             |
| **Scribe**        | `StopHook` runs the session scribe + heartbeat; `PostToolHook` scribes `git commit`s                              |

The hook handlers are the same shared `@memlin/plugin-core` handlers Claude Code
and Codex use, with `MEMLIN_HOST=antigravity` so on-disk state resolves under
`~/.config/memlin/` (see `AntigravityHost`). Everything **fails open** — a
Memlin error never blocks an Antigravity run.

## Install

```sh
./install.sh
```

…or manually:

1. **Build:** `pnpm --filter @memlin/antigravity-plugin build`
2. **MCP:** merge `mcp_config.json` into `~/.gemini/antigravity/mcp_config.json`
   (Antigravity → Settings → Customizations → Open MCP Config). Complete the
   browser OAuth, or add `"headers": { "Authorization": "Bearer <Memlin API key>" }`.
3. **Hooks:** copy `hooks.json` to the Antigravity hooks config location,
   replacing `__PLUGIN_DIR__` with this directory's absolute path. `install.sh`
   does the substitution for you.
4. **Skill:** copy `skills/memlin/` into `~/.gemini/antigravity/skills/memlin/`
   (global) or `<project>/.agents/skills/memlin/` (workspace).
5. **Workflows:** copy `workflows/*.md` into `<project>/.agent/workflows/`.
6. **Sign in:** run `memlin login` (the installer provisions the `memlin`
   launcher on PATH; for a manual install run
   `node "<plugin-dir>/dist/cli/login.js"`). Writes
   `~/.config/memlin/token.json`, auto-refreshed.

Rules (`.agent/rules/memlin.md`) are written automatically by the
`AntigravityAdapter` on sync — no manual step.

## Verify against your Antigravity build

The hook **handlers** are schema-stable (stdin JSON → `@memlin/plugin-core` →
stdout, fail-open). The `hooks.json` wiring was reverse-engineered from the
bundled `language_server` (Go/Codeium engine) and is evidence-based:

- **Config file:** `hooks.json` — confirmed as a literal string in the engine.
- **Event keys:** `SessionStart` / `PreToolUse` / `PostToolUse` / `Stop` — the
  Claude-Code-standard names. `PreToolUse`/`PostToolUse` appear as literal
  strings in `language_server`; the engine's _internal_ Go types are
  `PreToolHook`/`PostToolHook`/`StopHook`, but the user-facing config keys are
  the `*Use`/`Stop` forms (so this file matches `apps/cli-plugin/hooks/hooks.json`).
- **Schema:** `{ "hooks": { "<Event>": [{ "hooks": [{ "type": "command",
"command": "…", "timeout": N }] }] } }` — fields `event`/`matcher`/`command`/
  `timeout` confirmed in the `jsonhook.JSONHookSpec` parser.

One thing still worth a **2-minute empirical check**: the exact `hooks.json`
**location** — global `~/.gemini/antigravity/hooks.json` (where `install.sh`
writes) vs a project `.agent/hooks.json`. Install, restart Antigravity, run any
tool, then `tail ~/.config/memlin/` logs or watch Connected agents turn healthy.
(`timeout` may be `timeout_millis` on some builds.)
