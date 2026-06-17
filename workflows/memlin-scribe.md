---
name: memlin-scribe
description: Extract durable decisions and memories from this session into the Memlin review inbox.
---

Run `memlin scribe` in the terminal (the `memlin` CLI is installed by this
plugin — see the README/installer). This reads
the current session and proposes decisions/memories into your Memlin inbox for
review. Relay how many proposals were created, then point the user at
`/memlin-inbox` to accept or reject them. (The `StopHook` also runs the scribe
automatically at session end.)
