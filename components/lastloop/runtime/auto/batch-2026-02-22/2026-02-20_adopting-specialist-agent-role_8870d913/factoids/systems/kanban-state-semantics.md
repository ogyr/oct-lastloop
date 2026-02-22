# kanban_state Semantics on project.task

## Overview
The `kanban_state` field on Odoo `project.task` is **orthogonal to `stage_id`**. Stage determines pipeline position; kanban_state describes status *within* that stage.

## Values

| Value | UI Color | Meaning |
|-------|----------|---------|
| `normal` | Grey | **In Progress** — actively being worked on |
| `blocked` | Red | **Blocked** — missing info, dependency, or activity needed |
| `done` | Green | **Stage Complete** — ready to be pulled to next stage |

## Key Rules

1. **`normal` is auto-set** when `stage_id` changes — no manual action needed
2. **`blocked` must be set manually** — always accompany with chatter comment explaining blocker
3. **`done` must be set manually** when stage work is complete — but NOT in Implementation stage (auto-set on MR merge)
4. **`done` ≠ "task finished"** — it means "ready for next stage"

## Practical Implication
When querying for actionable tickets, filter by `kanban_state=normal` (not just `stage_id=Ready`). Tickets with `kanban_state=done` in Ready stage are already complete for that stage and waiting to move.

## Source
- Developer agent KNOWLEDGE.md from oct-private
- Learned from E-11757 incident
