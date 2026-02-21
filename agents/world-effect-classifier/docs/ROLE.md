# World Effect Classifier — Workflow Playbook

## Purpose

Read a complete agent conversation dump (`convo.txt`) and classify every world effect into structured output files. An "effect" is any observable change to or measurement of the external world — files edited, commands run, hardware triggered, state changes observed, errors encountered.

## Phase 1: Read, Understand, and Write Goals

1. Read `convo.txt` from the output directory (path provided in prompt)
2. Identify the conversation's **goals** — what were the user AND agent trying to achieve?
3. Note the **platform context** — web, mobile, hardware (Sunmi, etc.), backend (Odoo), CI
4. **Write `goals.md`** — this is a mandatory output for every extraction

### `goals.md` Format

```markdown
# Conversation Goals

## User Intent
<What the user was trying to achieve — their high-level objective.
Note if this evolved or pivoted during the conversation.>

## Agent Approach
<How the agent pursued the user's intent — the technical strategy chosen.
Note if the agent pivoted approaches and why.>

## Goal Evolution
<Chronological list of how goals shifted during the conversation.
Each entry: what changed and what triggered the change.>
- **Initial:** <starting goal>
- **Pivot 1:** <what changed and why>
- **Pivot 2:** <...>

## Final State
- **Achieved:** <what was accomplished>
- **Partially achieved:** <what's in progress or incomplete>
- **Abandoned:** <what was dropped and why>
```

## Phase 2: Extract Effects

Scan every tool call in the conversation. For each, classify:

| Question | Classification |
|----------|---------------|
| Did the tool **change** something in the world? | CHANGE effect |
| Did the tool **observe/measure** something? | OBSERVE effect |
| Did the observation **succeed** (meaningful result)? | → `feedbacks/` |
| Did the approach **fail due to how the system/world works**? | → `triedbutfailed/` |
| Was the approach **aborted by user direction** or external circumstance? | → `ideas/` |

### Strict `triedbutfailed/` vs `ideas/` distinction

**`triedbutfailed/`** — ONLY for approaches that failed due to **system/world constraints**. The failure must be evident from system behavior, not from user redirection. Examples:
- `require()` doesn't exist in bridge eval context → system constraint
- `--no-dev` disables `__DEV__` → system behavior
- Redux dispatch goes through but doesn't trigger native call → architectural gap

**`ideas/`** — For approaches that were **aborted by user direction**, interrupted by external circumstance (device disconnected, user said "stop"), or simply **never completed** because the user steered elsewhere. These are untested/incomplete approaches that might work if tried properly. They are NOT failures — they're unexplored paths.

**The test:** Ask "did the system/world reject this approach?" If YES → `triedbutfailed/`. If the user redirected or an external event interrupted → `ideas/`.

**Redirection heuristic:** If the user explicitly redirected the agent away from an approach AND the agent hadn't exhausted recovery options (e.g. could have added a missing flag, retried with different params, tried a workaround), classify as `ideas/` not `triedbutfailed/`. The failure must be **inherent to the approach itself**, not interrupted by user choice. Example: agent tries WebView CDP on customer display, hits a missing debug flag, but before the agent can add the flag the user says "stop, do something else" → `ideas/` (the approach was viable but untested). Contrast: agent tries `require()` in bridge eval, gets a hard error, no workaround exists → `triedbutfailed/` (system rejected it).

### What counts as an effect?

- File edits that changed behavior
- Native module calls (printer, display, scanner)
- ADB commands that changed device state
- Redux dispatches that triggered side effects
- API calls to backends
- Build/install operations
- State observations via JS bridge, logcat, screenshots, DOM queries

### What does NOT count?

- Routine file reads for context gathering (reading source code to understand it)
- Grep/glob searches used only for navigation
- Context management (distill, prune)
- Planning/todo management

## Phase 3: Write Effect Files

### For successful observations → `feedbacks/<effect-name>.md`

Use kebab-case for filenames. The filename should describe the observable effect, not the tool used.

**Format:**
```markdown
# Effect: <what was observed/measured>

## Summary
<2-3 lines explaining what the agent was trying to understand,
what difficulty was encountered, and why this observation mattered.
Be specific about the problem context.>

## Observation
- **Tool:** <tool name and specific function/flag>
- **Approach:** <how the tool was used to achieve this observation>
- **Prerequisites:** <what must be true for this to work>
- **Example:**
  \```
  <exact working command/code from the conversation>
  \```
- **Result:** <what the observation revealed>
- **Verified:** <date>
```

If multiple tools contributed to the same effect, list them all under separate `## Observation` sections.

### For failed observations → `triedbutfailed/<effect-name>.md`

**Format:**
```markdown
# Effect (Failed): <what agent tried to observe>

## Summary
<2-3 lines explaining what the agent was trying to understand,
what difficulty was encountered, and why the observation failed.
Be honest about the failure.>

## Attempts

### 1. <tool/approach name>
- **What was tried:** <description>
- **Why it failed:** <error, wrong assumption, missing prerequisite, silent failure>
- **Example:**
  \```
  <what was actually run>
  \```

### 2. <next attempt>
...
```

### For user-aborted/incomplete approaches → `ideas/<approach-name>.md`

**Format:**
```markdown
# Idea: <what was being attempted>

## Summary
<What the agent was trying to do and why it was interrupted.
Note whether it was user-directed abort, external circumstance, or pivot to a different approach.>

## Approach
- **What was started:** <description of the approach>
- **Why it stopped:** <user redirected / device disconnected / pivoted to X>
- **Viability:** likely | uncertain | unknown
- **What would be needed to test:** <prerequisites to validate this approach>

## Partial Evidence
<Any information gathered before the approach was abandoned.
This helps future agents pick up where this one left off.>
```

### Agent generation (conditional)

After writing all effect files, goals, and ideas, review the conversation for **reusable workflow patterns**. If the conversation reveals a workflow that would be valuable as a reusable agent role (e.g. "connect to physical Sunmi device via dev build + Metro + bridge + native module"), generate agent files under `agents/`:

- `agents/manifest.json` — standard oct agent manifest
- `agents/agents/<role-name>.md` — agent identity with frontmatter
- `agents/docs/ROLE.md` — workflow playbook
- `agents/docs/KNOWLEDGE.md` — domain reference

Follow the same patterns as existing agents in `oct-private/agents/`. The agent should capture the **reusable workflow**, not the specific conversation.

If no reusable pattern emerges, skip this step. But err on the side of generating — most multi-step hardware/integration conversations contain at least one reusable workflow.

## Phase 4: Review

Before finishing:
- Verify every effect file has a concrete example from the actual conversation
- Verify filenames are descriptive kebab-case based on the effect, not the tool
- Verify summaries capture the *difficulty* and *context*, not just a dry description
- Ensure no routine/obvious tool uses leaked into the effect files

## Rules

1. **One file per effect** — if the same effect was observed via multiple tools, they go in the same file
2. **Effect-centric, not tool-centric** — the filename and heading describe what was observed, not how
3. **Only include effects that reveal something non-trivial** — "file was saved successfully" is not an effect worth documenting
4. **Summaries must capture struggle** — the value is in understanding what was hard and why
5. **Code examples must be verbatim** — for any code snippet, command invocation, or tool output you quote, go back to `convo.txt` and copy the exact text. Do NOT paraphrase or reconstruct from memory. Use your Read tool on `convo.txt` with grep/offset to locate the exact passage, then copy it character-for-character into the effect file.
6. **When in doubt, re-read the source** — if you're unsure about a detail (what parameters were passed, what the output said, what order things happened), re-read the relevant section of `convo.txt` before writing. The conversation is your single source of truth.
