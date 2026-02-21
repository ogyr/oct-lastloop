# Feedback Loop Extractor — Workflow Playbook

## Purpose

Read a complete agent conversation dump (`convo.txt`) and produce a single `feedbacks/tools.md` file that documents **only novel, uncommon, or unexpected tool uses**. This is NOT a log of every tool call — it's a curated list of tool applications that future agents would benefit from knowing.

## Phase 1: Read and Catalog

1. Read `convo.txt` from the output directory (path provided in prompt)
2. If `goals.md` exists in the output directory, read it for context on what the conversation was trying to achieve
3. List every tool call made during the conversation
4. For each tool call, classify:
   - **Standard use** — the tool was used for its documented/obvious purpose (e.g., `read` to read a file, `grep` to search)
   - **Novel use** — the tool was used in an unexpected way, for an unusual purpose, or in a creative combination

## Phase 2: Filter for Novel Uses

A tool use is **novel** if any of these are true:

- The tool was used for a purpose different from its primary design
- The tool was called with unusual parameters or in an unusual context
- The tool was used as part of a workaround for something that should have been simpler
- The tool combination (A then B then C) revealed something that individual tools couldn't
- The tool was used to bypass a layer of abstraction (e.g., calling native module directly instead of going through Redux)
- The approach required non-obvious prerequisites (e.g., `adb reverse` for port forwarding, dev build for bridge access)

A tool use is **NOT novel** if:

- It's the standard documented use (reading files, searching code, editing files)
- Any competent developer would know to use it this way
- It's a common debugging pattern (console.log, breakpoints)

## Phase 3: Write tools.md

Write `feedbacks/tools.md` in the output directory with this format:

```markdown
# Novel Tool Uses

## <tool name>: <one-line description of the novel use>

- **Context:** <what problem the agent was solving>
- **Normal use:** <what this tool is typically used for>
- **Novel use:** <what was done differently and why>
- **Key insight:** <the non-obvious learning>
- **Example:**
  \```
  <exact working code/command from the conversation>
  \```

## <next tool>: ...
```

## Phase 4: Tool Classification

For each novel tool, also note its category:

| Category | Description | Examples |
|----------|-------------|----------|
| **General** | Publicly available, works across any system | logcat, adb, Chrome DevTools Protocol, curl |
| **@source/tool** | Custom oct tool from a specific source | @oct-private/bridge, @oct-private/adb |

Include the category in the tool entry.

## Rules

1. **Quality over quantity** — a tools.md with 2 genuinely novel entries is better than 10 obvious ones
2. **Examples must be verbatim** — for any code snippet, command, or tool invocation you quote, go back to `convo.txt` and copy the exact text. Do NOT paraphrase or reconstruct from memory. Use your Read tool on `convo.txt` with grep/offset to locate the exact passage, then copy it character-for-character.
3. **Explain the insight** — what did this teach about the system or the tool?
4. **Note prerequisites** — if this only works under specific conditions (dev build, adb connected, specific platform), say so
5. **Skip routine uses entirely** — if nothing novel happened with tools in this conversation, write a minimal file saying so
6. **When in doubt, re-read the source** — if you're unsure about a detail (what parameters were passed, what the result was), re-read the relevant section of `convo.txt` before writing. The conversation is your single source of truth.
