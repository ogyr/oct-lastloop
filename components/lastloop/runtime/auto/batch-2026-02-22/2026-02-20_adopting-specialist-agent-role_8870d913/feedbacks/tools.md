# Novel Tool Uses — Developer Agent Session

## `roles` tool — Role Discovery

### Novel Use
Used without arguments to discover available agent roles, rather than assuming role names match user shorthand.

### Pattern
```python
roles({})  # No name arg = list all roles
```

Returns structured list with role names, descriptions, versions, and paths.

### When to Use
- When user provides role shorthand that doesn't match exactly
- To discover what specialist roles are available before adopting one

---

## `task` tool — Truncation Recovery

### Novel Use
Delegated file processing to an `@explore` subagent when tool output was truncated and saved to disk.

### Pattern
```python
task({
  "description": "Extract ticket 11527 details",
  "subagent_type": "explore",
  "prompt": "Read the file /path/to/truncated-output and extract..."
})
```

### When to Use
- When a tool output is truncated (>51200 bytes) and saved to `/Users/clemensgruenberger/.local/share/opencode/tool-output/`
- When you need to process large JSON/structured data without loading it into main context
- When the system explicitly suggests using Task tool for the truncated output

### Benefits
- Preserves main context token budget
- Subagent can use Python/shell tools for parsing
- Returns structured, focused results
