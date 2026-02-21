# Effect: Sunmi thermal printer produces physical output via direct native module call

## Summary
Agent needed to print arbitrary text on the Sunmi V3 MIX built-in thermal printer. After the standard Redux dispatch path failed silently (items appeared as DONE but nothing printed), the agent discovered `onr.hws.execute()` on the global CLI object — a direct handle to the HWS Expo native module. Calling it with a PrintReceipt JSON payload triggered the Sunmi printer hardware and produced a physical receipt.

## Observation
- **Tool:** bridge_js_eval (onr.hws.execute)
- **Approach:** Called `NativeModule.execute()` directly via the `onr.hws` handle, bypassing the entire Redux saga→queue→native pipeline. Used `.then()` callback since `await` is not supported in bridge eval context.
- **Prerequisites:** Dev build with `__DEV__=true` running on device, Metro/Expo dev server running (without `--no-dev`), `adb reverse` for ports 7654-7664, DevBridge connected
- **Example:**
  ```js
  onr.hws.execute(JSON.stringify({
    Cmd: "PrintReceipt",
    CmdVer: 1,
    PrintLines: [
      { PrintLine: " " },
      { PrintLine: "================================" },
      { PrintLine: "  your text here" },
      { PrintLine: "================================" },
      { PrintLine: " " }
    ]
  })).then(function(r) { console.log("PRINT RESULT: " + JSON.stringify(r)); }).catch(function(e) { console.log("PRINT ERROR: " + e.message); })
  ```
- **Result:** Native module returned `{"Result":0,"Message":"OK"}`, logcat confirmed `HWS.PrinterHandler: printReceipt called` → `printReceipt completed successfully`, and physical receipt was printed.
- **Verified:** 2026-02-21
