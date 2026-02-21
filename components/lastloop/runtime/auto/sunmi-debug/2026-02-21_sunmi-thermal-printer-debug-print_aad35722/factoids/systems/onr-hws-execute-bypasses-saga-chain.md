# onr.hws.execute() Bypasses Entire Redux Saga Chain for Direct Native Access

The `onr.hws` object on the global CLI handle exposes the Expo native module directly: `onr.hws.execute(JSON.stringify({...}))`. This calls `HWSAndroidModule.execute()` without going through the Redux → saga → queue → resume → native pipeline.

The agent discovered this after the Redux dispatch path failed silently (items marked DONE but no print output). The discovery path was:

1. `bridge_js_eval` — `JSON.stringify(Object.keys(onr).sort())` → revealed `hws` among the keys
2. `bridge_js_eval` — `JSON.stringify({type: typeof onr.hws, keys: Object.keys(onr.hws)})` → revealed `execute`, `getDeviceCapabilities`, `emitter`
3. First attempt with `await onr.hws.execute(...)` failed with syntax error (`await` not supported in bridge eval context)
4. Second attempt with `.then()` callback succeeded: the printer physically printed and logcat showed `HWS.PrinterHandler: printReceipt called` → `printReceipt completed successfully`

The working command format (must use `.then()` not `await`):
```javascript
onr.hws.execute(JSON.stringify({
  Cmd: "PrintReceipt",
  CmdVer: 1,
  PrintLines: [{ PrintLine: "text" }]
})).then(function(r) { console.log("PRINT RESULT: " + JSON.stringify(r)); })
```

Note: `PrinterSettings` is NOT required when calling `execute()` directly — the native `PrinterHandler` on Sunmi uses the built-in printer regardless.

## Details
- **Discovered via:** `bridge_js_eval` exploring `Object.keys(onr)` after Redux dispatch path failed silently
- **Convo context:** Agent needed to print arbitrary text on Sunmi thermal printer; Redux path produced no output despite queue showing items as DONE
- **Confidence:** high
