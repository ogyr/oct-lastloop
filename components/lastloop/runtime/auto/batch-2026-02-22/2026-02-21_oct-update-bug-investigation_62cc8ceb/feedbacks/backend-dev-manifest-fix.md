# Backend-Dev Manifest Fix

## Problem
The `backend-dev` agent component had a minimal/broken manifest that triggered the crash:

```json
{
  "name": "backend-dev",
  "type": "agent"
}
```

This was the actual trigger for the `oct update` crash.

## Solution
Fixed the manifest with all required fields:

```json
{
  "name": "backend-dev",
  "componentType": "agent",
  "displayName": "Backend Developer Agent",
  "description": "Odoo backend developer — Python/XML module development, model design, views, security, and server-side logic",
  "version": "1.0.0",
  "maturity": "beta",
  "category": "agent",
  "provides": {
    "tools": [],
    "commands": [],
    "mcp": null,
    "skills": [],
    "agents": ["agents/backend-dev.md"],
    "plugins": [],
    "runtime": null
  },
  "dependencies": [],
  "envVars": [],
  "platforms": ["darwin", "linux"]
}
```

## Location
`.opencode/.oct/sources/oct-private/agents/backend-dev/manifest.json`

## Commit
`d3a542c` in `ogyr/oct-tools` — "backend-dev: fix manifest.json — add missing required fields"

## Root Cause of Broken Manifest
The component had proper `agents/backend-dev.md`, `docs/ROLE.md`, `docs/KNOWLEDGE.md`, and `docs/README.md` files — but the manifest was never completed. Likely a WIP that was committed prematurely.
