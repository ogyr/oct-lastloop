# Native module returning success doesn't guarantee physical output

The Sunmi printer native module (`HWSAndroidModule.execute()`) returns `{Result: 0, Message: "OK"}` when the command is **accepted by the SDK**, not when physical output completes.

This means:
- Paper out / paper door open → still returns `Result: 0`
- Hardware disconnected → still returns `Result: 0` (sometimes)
- Command accepted but queue backed up → still returns `Result: 0`

**Implication:** When debugging hardware issues, don't trust the return value alone. Check:
1. **logcat** for native module execution (`HWS.PrinterHandler: printReceipt called`)
2. **Physical observation** — did the hardware actually do something?

This is a common pattern with hardware SDKs — they report command acceptance, not physical completion.
