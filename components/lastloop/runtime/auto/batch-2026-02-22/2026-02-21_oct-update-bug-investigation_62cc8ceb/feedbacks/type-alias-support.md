# Type Alias Support

## Problem
The `backend-dev` manifest used `"type": "agent"` instead of `"componentType": "agent"`. This is a common mistake in hand-authored manifests.

## Solution
Accept `type` as an alias for `componentType` in `normalizeManifest()`:

```typescript
// Accept "type" as alias for "componentType"
if (m.type && !m.componentType) {
  m.componentType = m.type;
}
```

## Rationale
- `type` is a natural shorthand that authors might use
- Normalizing it to the canonical field name allows the manifest to work
- Warning is emitted for other missing fields, so the user still knows to fix it
