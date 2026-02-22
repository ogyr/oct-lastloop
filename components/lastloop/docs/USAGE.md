# lastloop — Usage Reference

## CLI Reference

### List Sessions

```bash
# List last 20 sessions from current project
lastloop --list

# List last 5 sessions
lastloop --list --limit 5

# List sessions from all projects
lastloop --list_all

# List sessions with custom limit
lastloop --list_all --limit 50
```

Output:
```
Sessions (current project) (showing 5 of 23):

    #  Date         Msgs  Session ID                     Title
    ─  ────────────  ────  ──────────────────────────────  ──────────────────────────────
    1  2026-02-21      133  ses_37f9e3f13ffer06IsPLc7azpqz  Sunmi thermal printer debug
    2  2026-02-20       87  ses_a1b2c3d4...                 Customer display phase fix
    3  2026-02-19       12  ses_e5f6g7h8...                 Git aliases setup

Use: lastloop -w WORKSPACE_NAME <#> to extract a session
```

### List Workspaces

```bash
lastloop --list_workspaces
```

Output:
```
Workspaces in .opencode/lastloop/auto/:

  Workspace                      Extractions  Latest
  ──────────────────────────────  ───────────  ──────────────────────────────
  sunmi-debug                              1  2026-02-21 sunmi thermal printer
  customer-display                         3  2026-02-20 customer display phase
```

### Extract a Session

```bash
# By number (from --list output)
lastloop -w my-workspace 3

# By session ID
lastloop -w my-workspace ses_xxxxx

# Latest session (auto-select)
lastloop -w my-workspace

# Create new workspace
lastloop -w new-workspace --create 1
```

### Help

```bash
# No args shows help + existing workspaces
lastloop
```

## Workspace Management

A workspace is a named directory under `auto/`. It groups related extractions.

- **Create:** `lastloop -w NAME --create` (or `-c`)
- **Use existing:** `lastloop -w NAME <session>`
- **List:** `lastloop --list_workspaces`

A workspace that doesn't exist requires `--create`. This prevents typos from silently creating new workspaces.

## Output Structure

Each extraction produces:

```
auto/<workspace>/<date>_<title>_<hash>/
  convo.txt                  Full conversation dump (messages + tool I/O + subagents)
  prompt.txt                 Extraction instructions for the agent roles
  goals.md                   User + agent goals, evolution, final state
  feedbacks/
    <effect>.md              One file per successfully observed effect
    tools.md                 Novel/unexpected tool uses only
  triedbutfailed/
    <effect>.md              One file per failed approach (system/world failures only)
  factoids/
    systems/<topic>.md       Repo/company/ETRON-specific insights
    world/<topic>.md         Generally applicable insights
  ideas/
    <idea>.md                Untested hypotheses, user-redirected approaches
  agents/
    manifest.json            If a reusable workflow pattern was found
    agents/<name>.md
    docs/ROLE.md
    docs/KNOWLEDGE.md
  verification-report.md     Written by extraction-verifier
```

## Pipeline Execution

After `lastloop` scaffolds the extraction, run the roles:

### In OpenCode (via /lastloop command)

The command guides you through the pipeline automatically.

### Manually

1. **Parallel extraction (steps 1-3):**
   - `/role world-effect-classifier` — reads convo.txt, produces goals.md + feedbacks/ + triedbutfailed/ + ideas/
   - `/role feedback-loop-extractor` — reads convo.txt, produces feedbacks/tools.md
   - `/role factoid-extractor` — reads convo.txt, produces factoids/

2. **Verification (step 4):**
   - `/role extraction-verifier` — audits all output, moves/edits files, writes verification-report.md

## Classification Rules

### feedbacks/ vs triedbutfailed/ vs ideas/

| Outcome | Directory | Criteria |
|---------|-----------|----------|
| Successful observation | `feedbacks/` | Tool was used, produced useful result |
| System/world failure | `triedbutfailed/` | Approach failed due to how the system works (error, constraint, architectural gap) |
| User-redirected | `ideas/` | User aborted the approach before it was fully tried |
| External circumstance | `ideas/` | Device disconnected, network issue, etc. |
| Untested hypothesis | `ideas/` | Agent proposed but never executed |

**Key heuristic:** If the user redirected AND the agent hadn't exhausted recovery options → `ideas/`, not `triedbutfailed/`.

### Factoid Gate

A factoid is extracted only if a competent developer would NOT easily know it. Signals:
- Agent tried 3+ approaches before finding the answer
- An assumption was proven wrong
- User had to correct the agent
- Tool behaved unexpectedly
