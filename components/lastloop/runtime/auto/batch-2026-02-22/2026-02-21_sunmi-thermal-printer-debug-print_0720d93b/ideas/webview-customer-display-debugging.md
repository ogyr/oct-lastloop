# Sunmi NativeModule Returns OK Even When Print Fails Silently

The Sunmi HWS native module's `execute()` method can return `{Result: 0, Message: "OK"}` for `PrintReceipt` commands even when no physical print occurs. The "OK" response indicates the SDK accepted the command, not that the printer actually produced output. or that there was a hardware issue (paper out, paper door open, etc.). All verification must physical output separately.

**Examples:**
```javascript
// Returns OK but no physical output
onr.hws.execute(JSON.stringify({
  Cmd: "PrintReceipt",
  PrintLines: [...]
})).then(r => console.log(r))
// Logcat shows "printReceipt called" and "printReceipt completed successfully"
// But: No print came out
```
```bash
adb logcat -d -t 50 | grep -iE "print|receipt|HWS.PrinterHandler|sunmi"
```
- **Result:**
  ```
  02-21 15:52:11.677  D HWS.PrinterHandler: printReceipt called
 02-21 15:52:13.042  8918  9547 I ReactNativeJS: PRINT RESULT: {"Result":0,"Message":"OK"}
  ```
- **Verified:** 2026-02-21
- **Discovered via:** `onr.hws.execute()` call succeeded with `{"Result":0, Message":"OK"}`, but no physical output initially. Only discovered later when trying `adb shell am start` with a different intent.
- **Convo context:** Agent successfully printed via direct native call, then user reported "no" output. revealing the disconnect
- **Confidence:** high
