# oct-lastloop

Post-conversation knowledge extraction pipeline for [OpenCode](https://opencode.ai).

Extracts structured knowledge from agent conversations — observable effects, novel tool uses, hard-won factoids, failed approaches, and reusable workflow patterns.

## Concept

Every agent conversation has **effects on the world**. These effects are achieved through two types of tools:

- **CHANGE tools** — modify state (edit files, dispatch actions, install APKs, etc.)
- **OBSERVE tools** — measure/verify state (logcat, screenshots, JS bridge, etc.)

The organizing principle is the **OBSERVABLE EFFECT** — what can you see/measure? Everything is filed under that.

### What Gets Extracted

| Category | Directory | Description |
|----------|-----------|-------------|
| **Feedbacks** | `feedbacks/` | Successful observations — one file per effect |
| **Novel Tools** | `feedbacks/tools.md` | Only uncommon/unexpected tool uses |
| **Failed Approaches** | `triedbutfailed/` | Approaches that failed due to system/world behavior |
| **Ideas** | `ideas/` | Untested hypotheses, user-redirected approaches |
| **Factoids (Systems)** | `factoids/systems/` | Repo/company/infra-specific knowledge |
| **Factoids (World)** | `factoids/world/` | Generally applicable knowledge |
| **Goals** | `goals.md` | What user and agent were trying to achieve |
| **Agents** | `agents/` | Reusable workflow patterns extracted as agent roles |

### Rules

- **One file per effect** — multiple tools may be listed in one effect file
- **triedbutfailed/** is strict — only system/world failures, not user redirections
- **Factoids must not be common knowledge** — only hard-won insights
- **tools.md is selective** — only novel/unexpected uses, quality over quantity
- **Verbatim code examples** — agents verify quotes against the source convo.txt

## Installation

```bash
# Add source
oct source oct-lastloop https://github.com/ogyr/oct-lastloop.git

# Install (auto-installs all 4 agent dependencies)
oct install oct-lastloop/lastloop
```

## Usage

### CLI (from terminal)

```bash
# List recent sessions
bun .opencode/lastloop/extract.ts --list

# List all sessions across projects
bun .opencode/lastloop/extract.ts --list_all --limit 10

# List existing workspaces
bun .opencode/lastloop/extract.ts --list_workspaces

# Create a workspace and extract session #3
bun .opencode/lastloop/extract.ts -w my-workspace --create 3

# Extract by session ID into existing workspace
bun .opencode/lastloop/extract.ts -w my-workspace ses_xxxxx

# Extract latest session into existing workspace
bun .opencode/lastloop/extract.ts -w my-workspace
```

### OpenCode Tool

```
lastloop --list
lastloop --list_workspaces
lastloop -w my-workspace --create 1
```

### OpenCode Command

```
/lastloop -w my-workspace
/lastloop -w my-workspace ses_xxxxx
```

## Pipeline

After extraction, run the 4 agent roles (the `/lastloop` command guides you through this):

```
1. world-effect-classifier    → goals.md + feedbacks/ + triedbutfailed/ + ideas/
2. feedback-loop-extractor    → feedbacks/tools.md
3. factoid-extractor          → factoids/systems/ + factoids/world/

4. extraction-verifier        → audits everything, writes verification-report.md
```

Steps 1-3 run in parallel. Step 4 (verifier) runs after, using a Think → Verify → Fix workflow:
1. **Think** — read all deliverables, form opinions
2. **Verify** — check opinions against convo.txt source
3. **Fix** — move misclassified files, correct inaccuracies, write report

## Workspaces

Extractions are organized into named workspaces under `auto/<workspace>/`. A workspace groups related extractions — for example, all sessions about a particular feature or debugging effort.

```
.opencode/lastloop/auto/
  sunmi-debug/
    2026-02-21_sunmi-thermal-printer_aad35722/
      convo.txt
      prompt.txt
      goals.md
      feedbacks/
      triedbutfailed/
      factoids/systems/
      factoids/world/
      ideas/
      agents/
      verification-report.md
    2026-02-22_another-session_b3c4d5e6/
      ...
  customer-display/
    ...
```

## Components

| Component | Type | Description |
|-----------|------|-------------|
| `lastloop` | tool | CLI script, /lastloop command, lastloop tool |
| `world-effect-classifier` | agent | Classifies effects, writes goals, routes to feedbacks/triedbutfailed/ideas |
| `feedback-loop-extractor` | agent | Extracts novel tool uses |
| `factoid-extractor` | agent | Extracts non-common-knowledge insights |
| `extraction-verifier` | agent | Adversarial reviewer, audits extraction output |

## Testing

```bash
cd /path/to/oct-lastloop
bun test
```

50 tests covering extract.ts CLI behavior and manifest/agent file validation.
