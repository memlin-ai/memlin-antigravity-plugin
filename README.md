# Memlin for Google Antigravity

Memlin is packaged as a native Antigravity plugin: one directory containing a
root `plugin.json`, `hooks.json`, `mcp_config.json`, `skills/`, and `rules/`.
The runnable hooks and MCP server are bundled under `dist/`, so an installed
plugin has no monorepo or `node_modules` dependency.

## What it installs

- The local `memlin` MCP server and its resolve, search, memory, document, and
  handoff tools.
- A Memlin skill and rule that tell Antigravity when and how to resolve project
  context.
- Documented `PreInvocation`, `PreToolUse`, `PostToolUse`, and `Stop` hooks.

`PreInvocation` performs the initial best-effort project/plan sync and injects
an ephemeral status note. `PreToolUse` maps Memlin guardrails to Antigravity's
native allow/deny/ask response. `PostToolUse` records a throttled heartbeat.
`Stop` runs best-effort memory/session scribing. Every hook fails open.

Antigravity does not include tool arguments in its documented `PostToolUse`
payload, so this adapter does not guess at commit or changed-file details.

## Build and install

From the Memlin source repository:

```sh
bash scripts/build-antigravity-plugin.sh
agy plugin install ./antigravity-plugin-out
```

The output is the same directory that Companion downloads, verifies, and hands
to Antigravity's native plugin installer. The checked-in `install.sh` is only a
source-tree convenience wrapper; it never edits workspace files or merges user
configuration.

For the Antigravity IDE without the CLI, Google documents placing the built
`memlin` directory under `~/.gemini/config/plugins/`. Workspace-scoped plugins
belong under `<workspace>/.agents/plugins/` and should only be added with
separate project consent.

Node.js 20 or newer is required by the bundled local hooks and MCP server. The
plugin reuses the account token managed by Companion under
`~/.config/memlin/`; it does not embed credentials.

## Verify

After install, restart or reload Antigravity, then use `/hooks` and `/mcp` to
confirm the Memlin hook namespace and MCP server are loaded. Run a non-trivial
task and call `memlin_resolve_task` to verify project-scoped context.

References: [Antigravity plugins](https://www.antigravity.google/docs/plugins),
[hooks](https://www.antigravity.google/docs/hooks), and
[CLI plugins](https://antigravity.google/docs/cli-plugins).
