# Memlin Project Context & Agent Directives

This workspace is managed with Memlin. The local `memlin` MCP server provides the team's project-scoped skills, memories, approved goals, schemas, decisions, and handoffs.

## Available MCP Tools

| Tool                  | Purpose                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| `memlin_resolve_task` | Scope-correct bundle of skills, memory, goals, schemas, decisions for a task |
| `memlin_search`       | Broad natural-language search across the workspace                           |
| `memlin_read_memory`  | Read specific memory facts (with an optional filter)                         |
| `memlin_get_document` | Fetch the full body of a document cited in a bundle                          |
| `memlin_list_handoffs`| Check for assigned work packets targeted at Antigravity                      |

## Mandatory Task Resolution

Before performing non-trivial work, research, architectural reviews, or code modifications:
1. **Check for Handoffs**: Call `memlin_list_handoffs` with `target_agent_kind: "antigravity"`. If assigned work exists, read the packet and accept it with `memlin_update_handoff`.
2. **Resolve Task Context First**:
   - Call `memlin_resolve_task` with `task` (a clear task description) and `cwd` (the workspace path).
   - If a `<memlin-resolved-context>` block was already provided by a pre-invocation hook, use it as-is instead of re-resolving.
   - If a `<memlin-context-unchanged>` block is present, continue using the prior resolved context.
   - **Do NOT begin by running blind filesystem scans (`find`, `grep`, `git log`, `git show`)** for topics or architecture that Memlin already tracks. Check Memlin first.
3. **Apply Resolved Context**:
   - **Skills**: Apply the primary skill's methodology.
   - **Memory & Facts**: Treat project memory as authoritative ground truth (overrides generic LLM assumptions).
   - **Goals & Directives**: Treat approved goals and REQUIRED or PINNED decisions as hard constraints.
   - **Schemas**: Validate code against project schemas.
   - **Citations**: Cite project materials by path and version number (e.g. `Per goals/auth-required.md v1...`).
4. **Explore Beyond the Task**: Use `memlin_search`, `memlin_read_memory`, or `memlin_get_document` when context beyond the initial bundle is needed. If nothing relevant is found in Memlin, proceed with general engineering expertise and state so explicitly.

## Authentication
Memlin authentication is managed by Memlin Companion. If authentication is missing, notify the user to sign in through Companion or run `memlin login`. Never ask the user to paste tokens into conversation or write credentials to disk.
