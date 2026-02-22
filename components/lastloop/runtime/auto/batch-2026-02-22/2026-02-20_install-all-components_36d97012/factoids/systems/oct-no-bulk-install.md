# oct tool lacks bulk install capability

## Fact
The oct component manager does not support an "all" keyword or wildcard pattern for installing all available components at once.

## Evidence
`oct install all` → "Component 'all' not found in any source."

## Workaround
Use `oct list` to enumerate, then `oct install <comma-separated-names>` for bulk operations. Agent must implement the enumeration → selection → install flow manually.
