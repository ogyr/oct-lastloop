# Defensive Null Checks

## Problem
Multiple code paths accessed manifest array fields without null checks:
- `manifest.platforms.length` — crash
- `manifest.platforms.join(", ")` — crash
- `manifest.dependencies.length` — crash
- `for (const dep of manifest.dependencies)` — crash
- `manifest.envVars.length` — crash

## Solution
Added optional chaining (`?.`) and fallback arrays (`|| []`) at all 13 access sites.

## Changes

### registry.ts
```typescript
// Before: manifest.platforms.length === 0
// After:
!manifest.platforms?.length || manifest.platforms.includes(platform)

// Before: for (const dep of manifest.dependencies)
// After:
for (const dep of manifest.dependencies || [])
```

### oct.ts (multiple sites)
```typescript
// Before: manifest.platforms.join(", ")
// After:
manifest.platforms?.join(", ") || "all"

// Before: manifest.dependencies.length > 0
// After:
manifest.dependencies?.length > 0

// Before: manifest.envVars.length > 0
// After:
manifest.envVars?.length > 0
```

## Belt-and-Suspenders Approach
The `normalizeManifest()` fix handles the root cause at load time. These defensive checks provide additional safety for any edge cases or future code paths that might bypass normalization.
