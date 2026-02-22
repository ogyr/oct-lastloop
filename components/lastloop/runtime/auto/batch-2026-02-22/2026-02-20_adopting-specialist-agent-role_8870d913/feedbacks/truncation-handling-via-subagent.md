# Truncation Handling via Subagent Delegation

## Effect
Successfully handled a truncated tool output by delegating to an `@explore` subagent for file processing.

## Context
The `odoo_cli.py read` command returned a massive JSON with embedded base64 images in the `description` field. The output exceeded 51200 bytes and was truncated. The system suggested:
> Use the Task tool to have explore agent process this file with Grep and Read (with offset/limit).

## Resolution
Delegated to subagent with specific extraction instructions:
- Parse JSON from saved file
- Extract specific fields (name, description, description_us, description_tc, tag_ids, etc.)
- Strip HTML tags and base64 images from description
- Return structured output

## Subagent Output
The subagent used Python to parse the JSON and strip HTML/base64, returning clean structured data:
- Ticket title
- Human-readable description text
- User story (empty)
- Test cases (empty)
- Metadata (priority, deadline, etc.)

## Key Insight
When tool output is truncated and saved to a file, the `task` tool with `subagent_type: "explore"` is the recommended pattern. The subagent can use Python for parsing complex nested structures.
