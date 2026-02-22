# teams-comms-role-fallback

## Context
User requested `teams comm` role for formatting assistance with LOI message.

## What Happened
1. Agent queried `roles` with name "teams comm" — no match found
2. Agent listed all roles, found `teams-comms` (hyphenated)
3. Attempted to read role files from path reported by `roles` tool:
   - `/Users/clemensgruenberger/WebPro/etron/pos_dev2/.opencode/.oct/sources/oct-private/agents/teams-comms/ROLE.md`
   - `/Users/clemensgruenberger/WebPro/etron/pos_dev2/.opencode/.oct/sources/oct-private/agents/teams-comms/KNOWLEDGE.md`
4. Reads failed silently (files exist in pos_dev2 but agent is in pos_dev)
5. Agent proceeded without role knowledge, using system prompt formatting guidelines

## Why This is Ideas/
The role lookup didn't fail due to system/world behavior — it failed because:
- The `roles` tool reported paths from a different working directory (pos_dev2)
- This is a cross-repo reference issue, not an API limitation

Agent recovered gracefully by applying built-in knowledge. The role loading wasn't necessary for task completion.

## Potential Fix
The `roles` tool should report paths relative to current working directory, or agent should resolve absolute paths correctly for file reads.
