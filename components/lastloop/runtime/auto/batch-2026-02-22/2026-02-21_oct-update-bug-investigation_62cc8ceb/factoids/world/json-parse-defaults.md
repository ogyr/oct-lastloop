# JSON Parse Defaults

## Key Insight
`JSON.parse()` returns exactly what's in the file. If optional fields are missing, they're `undefined`, not defaulted. Code that assumes arrays exist will crash.

## The Pattern
```typescript
// BAD: Assumes array exists
if (data.items.length > 0) { ... }
for (const item of data.items) { ... }

// GOOD: Handle missing field
if (data.items?.length > 0) { ... }
for (const item of data.items || []) { ... }
```

## Solution Options

### 1. Normalize After Parse
```typescript
function loadConfig(path: string): Config {
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  return {
    items: [],
    ...raw,
    items: raw.items ?? [],  // Explicit default
  };
}
```

### 2. Make TypeScript Types Optional
```typescript
interface Config {
  items?: string[];  // Optional in type
}
// Forces consumers to handle undefined
```

### 3. Validate and Reject
```typescript
function loadConfig(path: string): Config {
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  if (!Array.isArray(raw.items)) {
    throw new Error("Config missing required 'items' array");
  }
  return raw;
}
```

### 4. Validate and Warn
```typescript
function loadConfig(path: string): Config {
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  if (!raw.items) {
    console.error(`⚠ Config missing 'items', using empty array`);
    raw.items = [];
  }
  return raw;
}
```

## When to Use Which
- **Normalize**: When missing fields have sensible defaults
- **Optional types**: When downstream code should decide
- **Reject**: When missing fields mean corrupt/invalid data
- **Warn**: When you want to alert but still function
