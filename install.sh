#!/usr/bin/env bash
# Install this already-built directory through Antigravity's native plugin CLI.
# It never edits a project or merges user configuration files.
set -euo pipefail

BUNDLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v agy >/dev/null 2>&1; then
  AGY="$(command -v agy)"
elif [[ -x "$HOME/.local/bin/agy" ]]; then
  AGY="$HOME/.local/bin/agy"
else
  echo "✗ Antigravity CLI was not found." >&2
  echo "  Install it from https://antigravity.google/docs/cli-install, then rerun this installer." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js 20 or newer is required." >&2
  echo "  Install it from https://nodejs.org, then rerun this installer." >&2
  exit 1
fi

NODE_VERSION="$(node --version 2>/dev/null || true)"
NODE_MAJOR="${NODE_VERSION#v}"
NODE_MAJOR="${NODE_MAJOR%%.*}"
if [[ ! "$NODE_MAJOR" =~ ^[0-9]+$ ]]; then
  echo "✗ Node.js 20 or newer is required; found an unrecognized version: ${NODE_VERSION:-unknown}." >&2
  echo "  Install it from https://nodejs.org, then rerun this installer." >&2
  exit 1
fi
if (( 10#$NODE_MAJOR < 20 )); then
  echo "✗ Node.js 20 or newer is required; found $NODE_VERSION." >&2
  echo "  Install it from https://nodejs.org, then rerun this installer." >&2
  exit 1
fi

"$AGY" plugin install "$BUNDLE_DIR"

cat <<EOF

✓ Memlin was staged by Antigravity's native plugin manager.
  Restart or reload Antigravity, then open /mcp and /hooks to verify it.
  Companion manages the shared Memlin sign-in token; it does not write project files.
EOF
