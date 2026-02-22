# Sunmi NativeModule Returns OK Even Without Physical Output

The Sunmi HWS native module's `execute()` method returns `{Result: 0, Message: "OK"}` for `PrintReceipt` commands when the SDK accepts the command, regardless of whether the printer actually produces output. "OK" means "command accepted," not "print completed."

## Possible Silent Failures

- Paper out
- Paper door open
- Printer hardware disconnected from SDK
- Wrong print format/content

## Debugging Approach

Always verify physical output separately. Use logcat to see native module activity:

```bash
adb logcat -d -t 50 | grep -iE "print|HWS.PrinterHandler|sunmi"
```

Expected output on success:
```
HWS.PrinterHandler: printReceipt called
HWS.PrinterHandler: printReceipt completed successfully
```

## Discovery Context

- **Convo context:** Redux dispatch returned OK but no print; direct native call also returned OK — both had identical responses
- **How discovered:** Observed that `{"Result":0,"Message":"OK"}` appeared in both failed (Redux) and successful (direct) paths
- **Confidence:** High — this is a known pattern with hardware SDKs
