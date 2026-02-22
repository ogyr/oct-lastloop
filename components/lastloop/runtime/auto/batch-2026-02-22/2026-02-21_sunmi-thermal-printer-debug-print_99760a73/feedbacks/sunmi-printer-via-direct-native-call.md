# Effect: Sunmi thermal printer produces physical output

## Summary
Agent needed to print text on the Sunmi V3 MIX built-in thermal printer. The standard Redux dispatch path (ADD_TO_HWS_QUEUE_TRIGGER) appeared to succeed (queue item marked DONE, Result: 0) but produced no physical output. Direct native module call via JS bridge worked immediately.

## Observation

### Tool: bridge_js_eval (onr.hws.execute)
- **Approach:** Called `onr.hws.execute()` directly via the JS bridge, bypassing the entire Redux → saga → queue → native pipeline
- **Prerequisites:** 
  - Dev build (`__DEV__=true`, NOT `--no-dev`)
  - Metro dev server running
  - adb reverse for ports 7654-7664 for bridge discovery
- **Example:**
  ```javascript
  onr.hws.execute(JSON.stringify({
    Cmd: "PrintReceipt",
    CmdVer: 1,
    PrintLines: [
      { PrintLine: " " },
      { PrintLine: "before we continue," },
      { PrintLine: "i want to ask you why" },
      // ...
    ]
  })).then(r => console.log(JSON.stringify(r)))
  ```
- **Result:** `{"Result":0,"Message":"OK"}` confirmed in logcat, physical printout produced
- **Verified:** 2026-02-21 (logcat showed `HWS.PrinterHandler: printReceipt called` → `completed successfully`)
