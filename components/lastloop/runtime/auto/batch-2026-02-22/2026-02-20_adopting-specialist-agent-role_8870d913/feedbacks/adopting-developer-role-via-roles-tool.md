# Adopting Developer Role via Roles Tool

## Effect
Successfully adopted the "developer" agent role from oct-private source after the initial "etron-dev" query failed.

## Context
User requested to adopt "etron dev" role. The `roles` tool with `name="etron-dev"` returned no match.

## Discovery
The `roles` tool with no arguments lists all available roles. The correct role was named "developer" (not "etron-dev") with description "ETRON product developer — picks up tickets from Odoo, implements features/fixes, creates MRs on GitLab".

## Resolution
Called `roles` with no args to list available roles, identified "developer" as the match, then read:
- `{path}/agents/developer.md` — Agent identity and permissions
- `{path}/docs/ROLE.md` — Full 16-phase workflow
- `{path}/docs/KNOWLEDGE.md` — Domain knowledge (kanban states, system landscape)

## Key Insight
Role names in the roles tool don't always match user shorthand. The `roles` tool without arguments is the discovery mechanism.
