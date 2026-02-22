# Manifest Validation Warnings

## Problem
Silent defaulting of missing manifest fields produces garbage output: `backend-dev vundefined [undefined]`. Users don't know something is wrong.

## Solution
Added `console.error` warnings when critical fields are missing:

```
⚠ Component "backend-dev": manifest.json is missing fields: componentType, displayName, description, version, maturity, category. Using defaults.
```

This alerts the user that the manifest needs fixing while still allowing oct to function.

## Implementation
In `normalizeManifest()`, after detecting missing fields, emit a warning:

```typescript
if (missing.length > 0) {
  console.error(
    `⚠ Component "${label}": manifest.json is missing fields: ${missing.join(", ")}. Using defaults.`
  );
}
```

## Critical Fields Checked
- `componentType` (defaults to "tool")
- `displayName` (defaults to component name)
- `description` (defaults to "")
- `version` (defaults to "0.0.0")
- `maturity` (defaults to "beta" — must be valid enum)
- `category` (defaults to "uncategorized")

## Why Not Reject Invalid Manifests?
Rejection would break existing installs. Graceful degradation with warnings allows users to continue working while knowing what needs fixing.
