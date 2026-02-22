# OCT Manifest Loading

## Key Insight
`loadManifest()` in `lib/registry.ts` returns raw `JSON.parse()` output without defaulting optional fields. This is a design decision (trust the manifest) that crashes when manifests are incomplete.

## The Code Path
```
loadAllSourceManifests()
  → loadAllManifests()
    → loadManifest()
      → JSON.parse(readFileSync(...))  // No defaults!
      → normalizeManifest()            // NOW adds defaults
```

## What Fields Need Defaults
- `platforms` — array, defaults to `[]` (meaning: all platforms)
- `dependencies` — array, defaults to `[]`
- `envVars` — array, defaults to `[]`
- `provides.tools` — array
- `provides.commands` — array
- `provides.skills` — array
- `provides.agents` — array
- `provides.plugins` — array

## Critical String Fields (warn if missing)
- `componentType` — default "tool"
- `displayName` — default to name
- `description` — default ""
- `version` — default "0.0.0"
- `maturity` — default "beta" (must be valid enum: "beta" | "rc" | "stable")
- `category` — default "uncategorized"

## Alias Handling
`type` is accepted as alias for `componentType` (common in hand-authored manifests)

## Location
`.opencode/.oct/oct/lib/registry.ts` — `loadManifest()` and `normalizeManifest()`
