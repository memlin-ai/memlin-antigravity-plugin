#!/usr/bin/env node
import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// apps/antigravity-plugin/src/hooks/user-prompt-submit.ts
import { execFile, spawn } from "node:child_process";
import { promises as fs2 } from "node:fs";
import path2 from "node:path";
import os2 from "node:os";
import { fileURLToPath } from "node:url";

// packages/plugin-core/dist/state.js
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
var STATE_FILE = path.join(os.homedir(), ".config", "memlin", "state.json");
var EMPTY = { documents: {} };
async function readState() {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { ...EMPTY };
  }
}
async function writeState(state) {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  const tmp = `${STATE_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, STATE_FILE);
}

// packages/plugin-core/dist/continuity.js
var CONTINUITY_WINDOW_MS = 10 * 60 * 1e3;
var CONTINUATION_PATTERNS = [
  /^\s*(and|also|then|now|next|plus|but|or|so)\b/i,
  /^\s*(what about|how about|tell me more|go on|continue|keep going)\b/i,
  /^\s*(explain|show me|expand|elaborate)\s+(that|this|it|the|more)\b/i,
  /^\s*(yes|yeah|ok|sure|right),?\s+(now|and|so|continue|keep)\b/i,
  /^\s*(can you|could you)\s+(also|now|then|continue|elaborate)\b/i,
  /\b(the one|that|those|these)\b.*\?$/i
  // referential question
];
function isContinuation(prompt, cwd, host, last) {
  if (last.host !== host) return false;
  if (last.cwd !== cwd) return false;
  if (Date.now() - last.resolved_at > CONTINUITY_WINDOW_MS) return false;
  if (!last.had_content) return false;
  const trimmed = prompt.trim();
  if (trimmed.length <= 80) return true;
  for (const re of CONTINUATION_PATTERNS) {
    if (re.test(trimmed)) return true;
  }
  return false;
}
function buildContinuityMarker(auditId) {
  return [
    "<memlin-context-unchanged>",
    `# This turn is a follow-up to the prior turn. The same Memlin context applies.`,
    `# Refer to the bundle injected on the previous turn (audit_id: ${auditId}).`,
    "# If you need fresh context, ask the user to rephrase or invoke memlin_resolve_task directly.",
    "</memlin-context-unchanged>"
  ].join("\n");
}

// packages/plugin-core/dist/scribe-notice.js
async function takeScribeNotice(currentSessionId) {
  let state;
  try {
    state = await readState();
  } catch {
    return "";
  }
  const notice = state.scribe_notice;
  const n = notice?.unsurfaced ?? 0;
  if (n <= 0) return "";
  try {
    delete state.scribe_notice;
    await writeState(state);
  } catch {
  }
  if (currentSessionId && notice?.session_id && notice.session_id !== currentSessionId) {
    return "";
  }
  return [
    "<memlin-notice>",
    "# Status line for the user \u2014 surface it, do not act on it.",
    `Memlin auto-captured ${n} new proposal${n === 1 ? "" : "s"} \u2014 review and accept/reject with /memlin-inbox.`,
    "</memlin-notice>",
    ""
  ].join("\n");
}

// apps/antigravity-plugin/src/hook-io.ts
function readHookInput() {
  return new Promise((resolve) => {
    let data = "";
    const done = () => {
      try {
        resolve(data.trim() ? JSON.parse(data) : null);
      } catch {
        resolve(null);
      }
    };
    const timer = setTimeout(done, 1e3);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      clearTimeout(timer);
      done();
    });
    process.stdin.on("error", () => {
      clearTimeout(timer);
      done();
    });
  });
}

// apps/antigravity-plugin/src/hooks/user-prompt-submit.ts
var __dirname = path2.dirname(fileURLToPath(import.meta.url));
var RESOLVE_BIN = path2.resolve(__dirname, "../cli/resolve.js");
var PULL_PLANS_BIN = path2.resolve(__dirname, "../cli/pull-plans.js");
function firePlanSync(cwd) {
  try {
    const child = spawn(process.execPath, [PULL_PLANS_BIN], {
      cwd,
      env: process.env,
      detached: true,
      stdio: "ignore"
    });
    child.unref();
  } catch {
  }
}
var TRIVIAL_PATTERNS = [
  /^\s*(hi|hey|hello|yo|sup|thanks?|thx|ty|ok|okay|cool|nice|got it|sounds good)[!.\s]*$/i,
  /^\s*(yes|no|yep|nope|sure|maybe|idk)[!.\s]*$/i,
  /^\s*\/[a-z-]+/i,
  // slash commands like /clear, /memlin-status — agent will handle.
  /^\s*[<>][a-z]/i
  // tags or partial XML
];
function isTrivial(prompt) {
  const trimmed = prompt.trim();
  if (!trimmed) return true;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length < 4) return true;
  return TRIVIAL_PATTERNS.some((re) => re.test(trimmed));
}
async function hasToken() {
  try {
    const raw = await fs2.readFile(
      path2.join(os2.homedir(), ".config", "memlin", "token.json"),
      "utf8"
    );
    const t = JSON.parse(raw);
    return Boolean(t.access_token);
  } catch {
    return false;
  }
}
function runResolve(task, cwd, sessionId) {
  return new Promise((resolve) => {
    const child = execFile(
      process.execPath,
      [RESOLVE_BIN, task],
      {
        cwd,
        // Forward the agent's session id so the resolve's usage_event is
        // attributable to this session (concurrent-work awareness).
        env: sessionId ? { ...process.env, MEMLIN_SESSION_ID: sessionId } : process.env,
        timeout: 6e3,
        maxBuffer: 8 * 1024 * 1024,
        encoding: "utf8"
      },
      (err, stdout) => {
        if (err) {
          resolve(null);
          return;
        }
        const out = (typeof stdout === "string" ? stdout : "").trim();
        resolve(out || null);
      }
    );
    child.on("error", () => resolve(null));
  });
}
function emitAdditionalContext(additionalContext) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext }
    })
  );
}
async function main() {
  process.env.MEMLIN_HOST = "antigravity";
  const payload = await readHookInput();
  if (!payload?.prompt) {
    process.exit(0);
  }
  const prompt = payload.prompt;
  const cwd = payload.cwd || process.cwd();
  if (isTrivial(prompt)) {
    process.exit(0);
  }
  if (!await hasToken()) {
    process.exit(0);
  }
  const scribeNotice = await takeScribeNotice(payload.session_id);
  try {
    const state = await readState();
    if (state.last_resolve && isContinuation(prompt, cwd, "antigravity", state.last_resolve)) {
      emitAdditionalContext(scribeNotice + buildContinuityMarker(state.last_resolve.audit_id));
      process.exit(0);
    }
  } catch {
  }
  firePlanSync(cwd);
  const rendered = await runResolve(prompt, cwd, payload.session_id);
  if (!rendered) {
    if (scribeNotice) emitAdditionalContext(scribeNotice);
    process.exit(0);
  }
  const block = [
    "<memlin-resolved-context>",
    "# This bundle was auto-resolved by Memlin for the user prompt below.",
    "# Treat it as authoritative project context: apply skills, respect goals,",
    "# validate against schemas, cite by path + version. Do NOT re-invoke",
    "# memlin_resolve_task unless the user asks you to explore something specific.",
    "",
    rendered,
    "</memlin-resolved-context>"
  ].join("\n");
  emitAdditionalContext(scribeNotice + block);
  process.exit(0);
}
main().catch(() => process.exit(0));
