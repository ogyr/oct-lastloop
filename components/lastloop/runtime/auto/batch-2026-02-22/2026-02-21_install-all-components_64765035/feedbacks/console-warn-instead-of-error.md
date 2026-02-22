# console.warn Instead of console.error for Manifest Warnings

**Context**: Manifest field warnings were output via `console.error()` which writes to stderr and shows red in OpenCode TUI.

**File**: `.opencode/.oct/oct/lib/registry.ts:57`

**Change**: `console.error(...)` → `console.warn(...)`

**Code**:
```typescript
// Before
console.error(
  `⚠ Component "${label}": manifest.json is missing fields: ${missing.join(", ")}. Using defaults.`
);

// After  
console.warn(
  `⚠ Component "${label}": manifest.json is missing fields: ${missing.join(", ")}. Using defaults.`
);
```

**Rationale**: Non-fatal informational warnings should use `console.warn()` (stdout-like, shows yellow) not `console.error()` (stderr, shows red).

**Test Update Required**: All test spies using `spyOn(console, "error")` must change to `spyOn(console, "warn")`.
