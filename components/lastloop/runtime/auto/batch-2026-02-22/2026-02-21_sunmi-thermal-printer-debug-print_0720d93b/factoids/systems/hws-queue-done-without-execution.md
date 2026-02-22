# HWS Queue Marks Items Done Without Native Execution

Dispatching `HARDWARE_SERVICE/ADDToHwsQueue_TRIGGER` with a PrintReceipt payload causes the item to appear in `finishedQueueItems` as `DONE` with `response: {Result: 0, Message: "OK"}` — but no native call occurs. The saga chain processed the Redux actions, but the `hwsQueue` processor never executed `hwsRequest()`.

The actual execution of the native module call.

## Why This Happens

- The `onAddToHwsQueue` saga ` uses `takeLatest` pattern, which matches on the right action type.
- - The payload shape doesn't matches what the saga chain expects (e.g., missing `PrinterSettings`, wrong `Cmd` enum)

- **How discovered:** Compared `finishedQueueItems` (via `bridge_js_eval`), to `finishedQueueItems` itself, the logcat showed no native call in `HWS.PrinterHandler` logs
- **Confidence:** Medium — The was only confirmed needed; the fact that `PrinterSettings` object had keys weren't correct (`PrinterName`, `RollWidth`) fields were that mattered.

## Discovery Context

Agent was trying to print on the Sunmi printer via Redux dispatch (standard saga chain). then via direct native module call (`onr.hws.execute()`). in this convo, `dispatch` → saga → queue → native call path` succeeded, but the Redux dispatch path, silent failure: likely due to:
7. Wrong `PrinterSettings` format
8. Saga expectation of missing required fields

**Verified:** 2026-02-21
