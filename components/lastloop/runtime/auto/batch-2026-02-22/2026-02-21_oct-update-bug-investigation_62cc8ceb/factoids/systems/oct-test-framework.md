# OCT Test Framework

## Key Insight
OCT uses `bun:test` with TC39 explicit resource management for auto-cleanup.

## Test Files
Located in `.opencode/.oct/oct/test/`:
- `registry.test.ts` — manifest loading and dependency resolution
- `sync.test.ts` — install/uninstall operations
- `types.test.ts` — type utilities
- `test-runner.test.ts` — component test runner
- `doctor-outdated.test.ts` — health checks and version checks
- `list-filter.test.ts` — component listing
- `config.test.ts` — configuration handling
- `commands.test.ts` — CLI commands
- `cache.test.ts` — source cache management
- `validate-agents.test.ts` — agent definition validation

## Running Tests
```bash
bun test                    # Run all tests
bun test registry.test.ts   # Run single file
```

## Fixture Helpers
Located in `test/fixture.ts`:

### `tmpdir(prefix)`
Creates temp directory with async disposal:
```typescript
await using tmp = await tmpdir();
// tmp.path is the directory
// Auto-deleted when scope exits
```

### `createTestSource(name, components)`
Creates a real git repo that looks like a component source:
```typescript
await using source = await createTestSource("test-src", {
  "tool-a": { dependencies: [] },
  "tool-b": { dependencies: ["tool-a"] },
});
// source.path is the repo root
```

### `createTestProject(sources)`
Creates a full `.opencode/` structure for integration testing.

## Test Component Format
```typescript
interface TestComponent {
  name: string;
  componentType?: "tool" | "agent";
  displayName?: string;
  description?: string;
  version?: string;
  dependencies?: string[];
  tools?: string[];
  commands?: string[];
  agents?: string[];
  mcp?: Record<string, any> | null;
  runtime?: boolean;
  platforms?: string[];
}
```
