# Effect: Native printer handler execution visible in logcat

## Summary
After the direct `onr.hws.execute()` call, the agent needed to verify that the native Kotlin PrinterHandler actually ran. Logcat provided the exact trace: `HWS.PrinterHandler: printReceipt called` → `printReceipt completed successfully`, plus the JS-side console.log from the `.then()` callback showing `PRINT RESULT: {"Result":0,"Message":"OK"}`.

## Observation
- **Tool:** bash (adb logcat)
- **Approach:** Filtered logcat with grep for printer/HWS related tags after issuing a print command via the bridge
- **Prerequisites:** ADB connection to device, app running with HWS module active
- **Example:**
  ```bash
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  adb -s "$DEVICE" logcat -d -t 50 | grep -iE "PRINT|HWS|PrinterHandler|sunmi" | tail -20
  ```
- **Result:**
  ```
  02-21 15:52:12.679  8918  9547 D HWS.PrinterHandler: printReceipt called
  02-21 15:52:13.042  8918  9547 D HWS.PrinterHandler: printReceipt completed successfully
  02-21 15:52:13.043  8918  9543 I ReactNativeJS: PRINT RESULT: {"Result":0,"Message":"OK"}
  ```
- **Verified:** 2026-02-21
