# Factoid Extractor — Workflow Playbook

## Overview

Read a conversation transcript. Extract non-common-knowledge factoids. Classify each as **systems** or **world** knowledge. Write one file per factoid.

## Phase 1: Read & Scan

1. Read the complete `convo.txt`
2. If `goals.md` exists in the output directory, read it for context on what the conversation was trying to achieve — this helps distinguish genuine factoids from user-directed pivots
3. Identify all moments where:
   - The agent learned something new (explicit "I see" / "now I understand" / correction moments)
   - The agent struggled and eventually found a solution
   - An assumption was proven wrong
   - A specific technical detail was revealed that isn't obvious from documentation
   - The user corrected the agent or provided insider knowledge
   - A tool behaved unexpectedly (returned success but didn't actually work, etc.)

## Phase 2: Filter — The Common Knowledge Gate

For each candidate factoid, ask:

> "Would a competent developer or AI agent working with this stack easily know this without having encountered this specific situation?"

- **YES** → Discard. Examples: how to `cd`, how to `git commit --amend`, what `npm install` does, how Redux dispatch works in general
- **NO** → Keep. Examples: "Expo `--no-dev` disables `__DEV__` which kills the DevBridge", "`NativeModule.execute()` returns OK even when printer has no paper", "the HWS queue marks items DONE even when the saga chain silently drops them"

**Difficulty signal**: If the agent tried 3+ approaches before finding the answer, it's almost certainly a factoid worth keeping.

## Phase 3: Classify

Two categories:

### Systems Knowledge (`factoids/systems/`)
Knowledge specific to:
- This repository (onRetail POS, ETRON)
- The company's infrastructure, conventions, deployment
- Specific configuration of the tools/services in this stack
- Internal API behaviors, module quirks, Redux state shapes
- Build system specifics (Expo + Gradle + Metro interactions)

**Filename**: `<kebab-case-topic>.md`

### World Knowledge (`factoids/world/`)
Knowledge that applies broadly:
- General React Native / Expo behaviors
- Android ADB patterns that aren't well-documented
- Sunmi SDK behaviors (applicable to any Sunmi developer)
- WebView debugging techniques applicable to any Android app
- General patterns about native module bridging, build systems, etc.

**Filename**: `<kebab-case-topic>.md`

## Phase 4: Write

One file per factoid. Format:

```markdown
# <Factoid Title>

<2-5 lines explaining the factoid clearly and completely.
Include the context of discovery — what was being attempted,
what went wrong, what the truth turned out to be.>

## Details
- **Discovered via:** <what tool/approach revealed this>
- **Convo context:** <brief description of the task>
- **Confidence:** high | medium
```

## Decision Rules

| Signal | Action |
|--------|--------|
| Agent corrected by user | Almost always a factoid |
| Agent tried 3+ approaches | Factoid if the final solution was non-obvious |
| Agent used a tool in a novel way | Factoid if the usage pattern is reusable |
| Configuration/flag had unexpected effect | Factoid |
| "It works but doesn't actually do anything" | Factoid (silent failures are gold) |
| Standard tool used in standard way | Not a factoid |
| Agent knew the answer immediately | Not a factoid |
| General programming concepts | Not a factoid |

## Rules

1. **Verbatim verification** — for any technical detail, code snippet, error message, or tool output you include, go back to `convo.txt` and verify the exact text. Do NOT paraphrase or reconstruct from memory. Use your Read tool on `convo.txt` with grep/offset to locate the exact passage, then copy it character-for-character.
2. **When in doubt, re-read the source** — if you're unsure whether something is accurate (a flag name, an error message, a state shape), re-read the relevant section of `convo.txt` before writing. The conversation is your single source of truth.
3. **One factoid per file** — keep files focused and atomic.

## Output Location

Write files to the output directory provided in the prompt:
- `<output_dir>/factoids/systems/<topic>.md`
- `<output_dir>/factoids/world/<topic>.md`
