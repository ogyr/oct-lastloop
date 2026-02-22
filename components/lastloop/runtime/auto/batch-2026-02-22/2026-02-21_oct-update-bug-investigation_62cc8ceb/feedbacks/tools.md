# Novel Tool Uses

## oct Tool with Component Argument

Standard usage is `oct install <names>` or `oct list`. This session used:

```
oct install
```

Without arguments, it returns:
```
ERROR: No component names provided. Usage: install glab,adb,bridge or install etron/glab
```

This revealed that `oct install` needs explicit component names — there's no "reinstall all" or "reinstall updated" subcommand. The auto-reinstall during `oct update` is a separate code path.

## bun test with File Watching

Standard test run: `bun test`

This runs all `*.test.ts` files in the current directory. Output includes:
- Test file names
- Pass/fail counts per file
- Total test count and expect() call count
- Runtime

Example:
```
bun test v1.3.9 (cf6cdbbb)

 98 pass
 0 fail
 248 expect() calls
Ran 98 tests across 10 files. [12.05s]
```

## git -C for Out-of-Directory Operations

Instead of `cd <dir> && git <cmd>`, used:

```bash
git -C /path/to/repo status
git -C /path/to/repo diff
git -C /path/to/repo log --oneline -5
git -C /path/to/repo add -A && git -C /path/to/repo commit -m "msg"
```

This allows running git commands on arbitrary directories without changing cwd.

## spyOn for Console Output Testing

```typescript
import { spyOn } from "bun:test";

test("warns when critical fields are missing", async () => {
  const consoleSpy = spyOn(console, "error");
  loadManifest(tmp.path, "warn-me");
  expect(consoleSpy.mock.calls.length).toBe(1);
  expect(consoleSpy.mock.calls[0][0]).toContain("missing fields");
});
```

Bun's `spyOn` works similarly to Jest's, allowing verification of console output.
