# Novel Tool Uses

## oct install with comma-separated qualified names
```
oct install oct-private/adb,oct-private/bridge,oct-private/playwright,...
```
Multiple components can be installed in a single call using comma-separated qualified names (source/component format). This is more efficient than individual install calls.

## oct list as component enumeration source
The `oct list` output can be parsed to extract component metadata (name, version, maturity, deps, env vars) for building interactive selection UIs. Output is structured with consistent formatting:
```
[source] name version [maturity] [+ installed]
  Description
  Category: X | Maturity: Y | Deps: Z
  Env vars: VAR1*, VAR2
```

## prune tool removes failed tool outputs
After a failed tool call, the `prune` tool can remove the output from context to save tokens:
```
[TOOL: prune] Input: {"ids": ["0"]}
```
This is useful for removing noise from failed attempts.
