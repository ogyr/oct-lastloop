# Manifest Validation Tests

**Context**: Added tests to ensure manifests have all required fields, catching future regressions early.

**File**: `.opencode/.oct/oct/test/registry.test.ts`

**New Test Block**:
```typescript
describe("manifest validation", () => {
  const requiredFields = [
    "componentType",
    "displayName",
    "description",
    "version",
    "maturity",
    "category",
  ] as const;

  test("manifest with all required fields emits no warnings", async () => {
    await using src = await createTestSource("full", {
      alpha: {
        componentType: "tool",
        displayName: "Alpha",
        description: "A test component",
        version: "1.0.0",
      },
    });
    const registry = { version: "1.0.0", components: ["alpha"] };
    const spy = spyOn(console, "warn").mockImplementation(() => {});
    loadAllManifests(src.path, registry, "full");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("manifest missing componentType triggers warning for that field only", async () => {
    // Verifies only the missing field is reported, others recognized as present
    ...
  });

  test("each required field triggers a warning when missing", async () => {
    // Iterates over all requiredFields
    ...
  });
});
```

**Key Insight**: `createTestSource` fixture auto-fills `maturity: "stable"` and `category: "test"` — don't include those in test component objects or you get TypeScript errors.
