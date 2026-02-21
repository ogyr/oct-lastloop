# HWS Queue Silently Drops Bridge-Dispatched Print Commands

Dispatching `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER` with a PrintReceipt payload via `bridge_js_eval` does not produce physical output. The dispatched items never appear in `finishedQueueItems` or in the `hwsQueue.PrintReceipt.queue` array — they are silently dropped somewhere in the saga chain.

The agent confirmed this by:

1. Dispatching a PrintReceipt action via `bridge_js_eval` with `dispatch({type: "HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER", payload: {type: "PrintReceipt", data: {PrintLines: [...]}}})`
2. Dispatching again with full `PrinterSettings` including the correct `PrinterName: "Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)"`
3. Checking `finishedQueueItems` — found 5 PrintReceipt items, but ALL were from the previous session's checkout receipts (37 lines each, containing receipt data like "KONVOLUT | Sorka Suess"), not from the bridge dispatches (which had 14-19 lines of the reflection question text)
4. Checking `hwsQueue.PrintReceipt` — showed `{status: "IDLE", queue: []}`, confirming the dispatched items never entered the queue
5. Checking `logcat` — zero `HWS.PrinterHandler` entries from the bridge dispatches

The saga chain (`onAddToHwsQueueFromAction` → `AddToHwsQueue` → `onAddToHwsQueue` → `onResumeHwsQueue` → `hwsRequest`) appears to have silently rejected or not matched the dispatched actions. The likely cause is a payload shape mismatch with what the saga's watcher expects, or the saga not being in the correct state to accept new items when dispatched from the bridge context.

The working approach was to bypass the saga chain entirely and call `onr.hws.execute()` directly.

## Details
- **Discovered via:** `bridge_js_eval` to inspect `finishedQueueItems` (showing DONE but no response) + `logcat` grep for `HWS.PrinterHandler` (zero results) — cross-referencing these two observations proved the native module was never reached
- **Convo context:** Agent dispatched PrintReceipt twice via Redux, both times the queue said "done" but the printer produced nothing
- **Confidence:** medium (the exact cause of the silent drop is unclear — likely payload shape mismatch, but the symptom is verified)
