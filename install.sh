#!/usr/bin/env bash
# Memlin → Antigravity installer (self-contained bundle).
#
# Usage:  bash install.sh
#
# This installs the Memlin plugin for Google Antigravity. Everything the
# plugin needs is in this directory — no monorepo or pnpm required.
set -euo pipefail

BUNDLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AG_DIR="$HOME/.gemini/antigravity"
HOOKS_DST="$AG_DIR/hooks.json"
MCP_DST="$AG_DIR/mcp_config.json"
SKILL_DST="$AG_DIR/skills/memlin"

echo "Memlin → Antigravity installer"
echo "bundle: $BUNDLE_DIR"
mkdir -p "$AG_DIR"

# Check prerequisites.
if ! command -v node >/dev/null 2>&1; then
  echo "✗ 'node' is required (≥ 20). Install from https://nodejs.org" >&2
  exit 1
fi
NODE_VER="$(node -v | sed 's/v//' | cut -d. -f1)"
if [ "$NODE_VER" -lt 20 ] 2>/dev/null; then
  echo "⚠  Node.js $(node -v) detected — version ≥ 20 is recommended."
fi

# 1. hooks.json — resolve __PLUGIN_DIR__ → this bundle's absolute path.
RESOLVED_HOOKS="$(sed "s|__PLUGIN_DIR__|$BUNDLE_DIR|g" "$BUNDLE_DIR/hooks.json")"
echo "$RESOLVED_HOOKS" > "$HOOKS_DST"
echo "→ hooks: $HOOKS_DST"

# Also write project-level hooks if we're in a repo.
if [ -d "$PWD/.git" ] || [ -d "$PWD/.agent" ]; then
  mkdir -p "$PWD/.agent"
  echo "$RESOLVED_HOOKS" > "$PWD/.agent/hooks.json"
  echo "→ project hooks: $PWD/.agent/hooks.json"
fi

# 2. mcp_config.json — resolve __BUNDLE_DIR__ → this directory.
RESOLVED_MCP="$(sed "s|__BUNDLE_DIR__|$BUNDLE_DIR|g" "$BUNDLE_DIR/mcp_config.json")"
if [ ! -s "$MCP_DST" ]; then
  echo "$RESOLVED_MCP" > "$MCP_DST"
  echo "→ MCP config: $MCP_DST (new)"
elif command -v jq >/dev/null 2>&1; then
  tmp="$(mktemp)"
  jq -s '.[0] * .[1]' "$MCP_DST" <(echo "$RESOLVED_MCP") > "$tmp" && mv "$tmp" "$MCP_DST"
  echo "→ MCP config: $MCP_DST (merged)"
else
  echo "$RESOLVED_MCP" > "$MCP_DST"
  echo "→ MCP config: $MCP_DST (replaced)"
fi

# 3. Skills (global).
mkdir -p "$SKILL_DST" && cp -R "$BUNDLE_DIR/skills/memlin/." "$SKILL_DST/"
echo "→ skills: $SKILL_DST"

# 4. Workflows (project-level, if in a repo).
if [ -d "$PWD/.git" ] || [ -d "$PWD/.agent" ]; then
  WF_DST="$PWD/.agent/workflows"
  mkdir -p "$WF_DST" && cp -R "$BUNDLE_DIR/workflows/." "$WF_DST/"
  echo "→ workflows: $WF_DST"
fi

# 5. Rules (project-level).
if [ -d "$PWD/.git" ] || [ -d "$PWD/.agent" ]; then
  RULES_DST="$PWD/.agent/rules"
  mkdir -p "$RULES_DST" && cp "$BUNDLE_DIR/rules/memlin.md" "$RULES_DST/memlin.md"
  echo "→ rules: $RULES_DST/memlin.md"
fi

# 6. Provision a `memlin` launcher on PATH so the /memlin-* workflows and the
#    documented terminal commands resolve `memlin` without a separate install.
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"
printf '#!/bin/sh\nexec node "%s" "$@"\n' "$BUNDLE_DIR/dist/cli/main.js" > "$BIN_DIR/memlin"
chmod +x "$BIN_DIR/memlin"
echo "→ memlin launcher: $BIN_DIR/memlin"
case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *) echo "⚠  $BIN_DIR is not on your PATH — add it (e.g. export PATH=\"\$HOME/.local/bin:\$PATH\") so 'memlin' resolves in new terminals." ;;
esac

# 7. Sign in (if not already).
TOKEN_FILE="$HOME/.config/memlin/token.json"
if [ -s "$TOKEN_FILE" ]; then
  echo "→ already signed in ✓"
else
  echo ""
  echo "→ Signing in to Memlin..."
  node "$BUNDLE_DIR/dist/cli/login.js" || {
    echo ""
    echo "⚠  Sign-in skipped. Run this later:"
    echo "   node \"$BUNDLE_DIR/dist/cli/login.js\""
  }
fi

cat <<EOF

✅ Memlin → Antigravity install complete.

Next:
  • Restart Antigravity to activate hooks and MCP server.
  • Every non-trivial prompt will auto-resolve Memlin context.
  • Watch Connected Agents go healthy in your dashboard.
EOF
