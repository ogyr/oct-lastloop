# Manifest Crash Fix

## Problem
`oct update` crashed with `undefined is not an object (evaluating 'manifest.platforms.length')` during auto-reinstall.

## Root Cause
`loadManifest()` in `registry.ts` returns raw `JSON.parse()` output without defaulting optional array fields. When a manifest omits `platforms`, `dependencies`, or `envVars`, the code crashes at access sites that assume arrays exist.

## Solution
Added `normalizeManifest()` function called by `loadManifest()` to default all array fields:

```typescript
function normalizeManifest(
  raw: Record<string, unknown>,
  componentName?: string
): ComponentManifest {
  const m = raw as Record<string, unknown>;

  // Accept "type" as alias for "componentType"
  if (m.type && !m.componentType) {
    m.componentType = m.type;
  }

  // Warn and default critical string fields
  const label = componentName || (m.name as string) || "unknown";
  const requiredStrings: Array<[string, string]> = [
    ["componentType", "tool"],
    ["displayName", label],
    ["description", ""],
    ["version", "0.0.0"],
    ["maturity", "beta"],
    ["category", "uncategorized"],
  ];
  const missing: string[] = [];
  for (const [field, fallback] of requiredStrings) {
    if (!m[field]) {
      missing.push(field);
      m[field] = fallback;
    }
  }
  if (missing.length > 0) {
    console.error(
      `⚠ Component "${label}": manifest.json is missing fields: ${missing.join(", ")}. Using defaults.`
    );
  }

  // Default array fields
  m.platforms ??= [];
  m.dependencies ??= [];
  m.envVars ??= [];
  const provides = (m.provides ?? {}) as Record<string, unknown>;
  provides.tools ??= [];
  provides.commands ??= [];
  provides.skills ??= [];
  provides.agents ??= [];
  provides.plugins ??= [];
  m.provides = provides;
  return m as unknown as ComponentManifest;
}
```

## Files Changed
- `lib/registry.ts` — added `normalizeManifest()`, called in `loadManifest()`
- `lib/types.ts` — made `dependencies`, `envVars`, `platforms` optional
- `oct.ts` — added defensive `?.` and `|| []` at all 13 access sites

## Verification
- `oct list` works without crashes
- `oct install glab` works
- 98 tests pass (6 new tests added)
