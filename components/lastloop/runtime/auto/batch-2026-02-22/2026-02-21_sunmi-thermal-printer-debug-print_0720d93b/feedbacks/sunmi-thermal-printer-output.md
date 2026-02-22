# Effect: Sunmi Thermal Printer Produces Physical Output

## Summary

The agent needed to print text on the Sunmi V3 MIX built-in thermal printer. The standard Redux dispatch path (ADD_TO_HWS_QUEUE_TRIGGER) appeared to succeed (queue item marked DONE, Result: 0) but produced no physical output. The solution was to call the native module directly via `onr.hws.execute()`, completely bypassing the Redux saga chain.

## Observation

- **Tool:** bridge_js_eval (onr.hws.execute)
- **Approach:** Called NativeModule.execute() directly via the global `onr.hws` handle exposed on the bridge, bypassing the entire Redux → saga → queue → native pipeline
- **Prerequisites:** 
  - Dev build (`__DEV__=true`) — Metro must be started WITHOUT `--no-dev`
  - Metro dev server running
  - `adb reverse` for ports 7654-7664 to enable DevBridge discovery
  - App must be on a screen where DevBridge module is loaded
- **Example:**
  ```javascript
  onr.hws.execute(JSON.stringify({
    Cmd: "PrintReceipt",
    CmdVer: 1,
    PrintLines: [
      { PrintLine: " " },
      { PrintLine: "before we continue," },
      { PrintLine: "i want to ask you why" },
      { PrintLine: "the feedback loops that" },
      { PrintLine: "you have (adb, jsbridge" },
      { PrintLine: "mainly) are not sufficient" },
      { PrintLine: "to see for yourself why" },
      { PrintLine: "the wrong phase steps" },
      { PrintLine: "persist, please reflect" },
      { PrintLine: " " }
    ]
  })).then(r => console.log(JSON.stringify(r)))
  ```
- **Result:** 
  ```
  {"Result":0,"Message":"OK"}
  ```
  Plus physical printout on thermal paper.
- **Verified:** 2026-02-21

## Key Discovery

The `onr` global object exposed by the app includes a direct handle to the HWS native module at `onr.hws`, which has `execute()`, `getDeviceCapabilities()`, and `emitter` properties. This provides a shortcut for testing hardware functionality without going through the full Redux saga chain.
