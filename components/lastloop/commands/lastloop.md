---
description: 'Extract knowledge from a past conversation — feedbacks, factoids, agents'
---

# /lastloop — Post-Conversation Knowledge Extraction

Extract feedbacks, factoids, novel tool uses, and reusable agent patterns from OpenCode conversation history.

## Usage

```
/lastloop <workspace> [session_id]
/lastloop <workspace> --create [session_id]
/lastloop --list [N]
```

**Arguments:**
- `workspace` — Named workspace directory under `auto/`. Required for extraction.
- `session_id` — Optional. Defaults to the most recent non-subagent session.
- `--create` — Required if the workspace doesn't exist yet.
- `--list N` — List the N most recent sessions (default 10). No workspace needed.

## Instructions

You are running the lastloop extraction pipeline. Follow these steps:

### Step 0: Extract the conversation

Run the extraction script to dump the conversation and scaffold the workspace:

```bash
bun .opencode/lastloop/extract.ts --workspace $1 $2
```

If the user passed `--create`, add it:
```bash
bun .opencode/lastloop/extract.ts --workspace $1 --create $2
```

If the user only wants `--list`:
```bash
bun .opencode/lastloop/extract.ts --list $1
```

The script will output the workspace path. Use that path for all subsequent steps.

### Step 1: Run extractors (parallel)

Launch these three agents **in parallel** as Task agents, each reading `convo.txt` from the workspace:

1. **`/role world-effect-classifier`** — Classify all world effects. Produce:
   - `goals.md` — conversation goals characterization (MANDATORY, always generated)
   - `feedbacks/<effect>.md` — successful observations/changes
   - `triedbutfailed/<effect>.md` — approaches that failed due to system/world behavior
   - `ideas/<idea>.md` — user-aborted or untested approaches

2. **`/role feedback-loop-extractor`** — Extract novel/unexpected tool uses → `feedbacks/tools.md`

3. **`/role factoid-extractor`** — Extract non-common-knowledge insights → `factoids/systems/` and `factoids/world/`

### Step 2: Review for agents

Review the conversation for reusable workflow patterns. If found, generate agent files under `agents/` following the standard oct agent structure (manifest.json, agents/*.md, docs/ROLE.md, docs/KNOWLEDGE.md).

### Step 3: Verify (sequential, after steps 1-2)

Run **`/role extraction-verifier`** to audit all produced files:
- Think first: read all deliverables, form opinions
- Verify: check against convo.txt source
- Fix: move misclassified files, correct inaccuracies
- Produce `verification-report.md`

### Step 4: Report

Summarize the extraction results to the user:
- Number of feedbacks, triedbutfailed, factoids, ideas, agents
- Key findings
- Verification score
