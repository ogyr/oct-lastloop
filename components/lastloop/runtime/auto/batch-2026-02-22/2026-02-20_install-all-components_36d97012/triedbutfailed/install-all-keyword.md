# oct install "all" keyword not supported

## Effect
Calling `oct install all` returns error: "Component 'all' not found in any source."

## Cause
The oct tool does not support an "all" keyword or wildcard for bulk installation. Each component must be explicitly named or selected.

## Recovery
Agent fetched component list via `oct list` and presented interactive checkbox selection to user.

## Evidence
```
[TOOL: oct] Input: {"args": "install all"}
Output: ERROR: Component "all" not found in any source.
```

## Resolution
Workaround: Use `oct list` to enumerate components, then `oct install <comma-separated-names>` for bulk install.
