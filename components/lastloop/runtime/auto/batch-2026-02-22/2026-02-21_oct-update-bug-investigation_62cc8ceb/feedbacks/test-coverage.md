# Test Coverage for Missing Fields

## Problem
No existing tests covered manifests with missing optional fields.

## Solution
Added 6 new test cases in `test/registry.test.ts`:

### Test 1: filterByPlatform with empty platforms
```typescript
test("includes components with empty platforms (cross-platform)", async () => {
  // Manifest with no platforms field
  const manifest = loadManifest(tmp.path, "no-plat");
  const manifests = new Map([["s/no-plat", manifest]]);
  const filtered = filterByPlatform(manifests);
  expect(filtered.has("s/no-plat")).toBe(true);
});
```

### Test 2: Manifest with missing platforms, dependencies, envVars
```typescript
test("handles manifest missing platforms, dependencies, envVars", async () => {
  // Manifest with only required string fields
  const manifest = loadManifest(tmp.path, "minimal");
  expect(manifest.platforms).toEqual([]);
  expect(manifest.dependencies).toEqual([]);
  expect(manifest.envVars).toEqual([]);
});
```

### Test 3: Bare-minimum manifest (only name and type)
```typescript
test("handles bare-minimum manifest (only name and type)", async () => {
  // { name: "bare-min", type: "agent" } — the backend-dev case
  expect(manifest.componentType).toBe("agent");
  expect(manifest.displayName).toBe("bare-min");
  expect(manifest.version).toBe("0.0.0");
  expect(manifest.maturity).toBe("beta");
});
```

### Test 4: Warning output for missing fields
```typescript
test("warns when critical fields are missing", async () => {
  const consoleSpy = spyOn(console, "error");
  loadManifest(tmp.path, "warn-me");
  expect(consoleSpy.mock.calls.length).toBe(1);
  expect(consoleSpy.mock.calls[0][0]).toContain("missing fields");
});
```

### Test 5: No warning for complete manifest
```typescript
test("does not warn when all fields present", async () => {
  const consoleSpy = spyOn(console, "error");
  loadManifest(tmp.path, "complete");
  expect(consoleSpy.mock.calls.length).toBe(0);
});
```

### Test 6: resolveDependencies with undefined dependencies
```typescript
test("handles undefined dependencies gracefully", async () => {
  // Manifest with dependencies field completely absent
  const resolved = resolveDependencies(selected, manifests);
  expect(resolved.has("s/no-deps")).toBe(true);
});
```

## Results
- All 98 tests pass (was 92 before)
- Warnings appear in test output as expected
