# Effect (Failed): Use await for async native module calls in bridge eval

## Summary
The agent tried to use `await` to get the result of `onr.hws.execute()` (which returns a Promise) directly in the bridge eval expression. The bridge eval context does not support top-level await — expressions must be synchronous or use `.then()` callbacks.

## Attempts
### 1. Top-level await in bridge eval
- **What was tried:** `const result = await onr.hws.execute(JSON.stringify({...})); JSON.stringify(result)`
- **Why it failed:** Parse error — `await` is not valid syntax in the eval context. Error: `3:22:';' expected`
- **Example:**
  ```js
  // This FAILS:
  const result = await onr.hws.execute(JSON.stringify({
    Cmd: "PrintReceipt",
    CmdVer: 1,
    PrintLines: [{ PrintLine: "text" }]
  }));
  JSON.stringify(result)
  // → Error: 3:22:';' expected

  // WORKAROUND that works:
  onr.hws.execute(JSON.stringify({...}))
    .then(function(r) { console.log("RESULT: " + JSON.stringify(r)); })
    .catch(function(e) { console.log("ERROR: " + e.message); })
  ```
