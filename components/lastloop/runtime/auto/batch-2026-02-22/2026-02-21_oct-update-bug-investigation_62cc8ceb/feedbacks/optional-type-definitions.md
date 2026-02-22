# Optional Type Definitions

## Problem
TypeScript interface `ComponentManifest` declared array fields as required:
```typescript
dependencies: string[];
envVars: EnvVarRequirement[];
platforms: string[];
```

But runtime JSON often omits these fields, causing type/runtime mismatch.

## Solution
Made the fields optional to match reality:

```typescript
dependencies?: string[];
envVars?: EnvVarRequirement[];
platforms?: string[];
```

## Location
`lib/types.ts` lines 28-30

## Why This Matters
- TypeScript now correctly flags code that assumes these fields exist
- Forces use of optional chaining or null checks
- Prevents future developers from introducing similar crashes
