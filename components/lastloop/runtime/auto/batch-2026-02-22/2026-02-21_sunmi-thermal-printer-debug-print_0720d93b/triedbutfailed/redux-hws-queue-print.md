# Effect (Failed): Trigger Sunmi Print via Redux Dispatch

## Summary

Attempted to print by dispatching `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER` with a PrintReceipt payload. Items appeared in `finishedQueueItems` as `DONE` with `Result: 0, Message: "OK"`, but no physical print occurred. The saga chain processed the Redux actions but the queue processor (`onResumeHwsQueue`) didn't execute `hwsRequest` — likely because the payload was missing required fields or the saga silently dropped malformed requests.

## Difficulty Encountered

The agent spent significant time debugging why the Redux dispatch path appeared to succeed (queue showed DONE, native module returned OK) but produced no physical output. This revealed a disconnect between what the Redux state indicated and what actually happened at the native layer.

## Attempts

### 1. Dispatch without PrinterSettings
- **What was tried:** 
  ```javascript
  dispatch({
    type: "HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER",
    payload: {
      type: "PrintReceipt",
      data: {
        Cmd: "PrintReceipt",
        PrintLines: [{ PrintLine: "text" }]
      }
    }
  })
  ```
- **Why it failed:** Missing `PrinterSettings` — the saga likely requires printer configuration to route the command. The item went to `finishedQueueItems` as DONE but no native call appeared in logcat.

### 2. Dispatch with PrinterSettings from Redux state
- **What was tried:** Added `PrinterSettings` with correct `PrinterName` from `getState().Printer.selectedPrinters.bon`:
  ```javascript
  dispatch({
    type: "HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER",
    payload: {
      type: "PrintReceipt",
      data: {
        Cmd: "PrintReceipt",
        CmdVer: 1,
        PrintLines: [...],
        PrinterSettings: {
          PrinterName: "Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)",
          printerType: "local",
          RollWidth: 80
        },
        retryDelay: 190,
        totalRetries: 6
      }
    }
  })
  ```
- **Why it failed:** Queue showed IDLE with 0 items waiting. The item was marked DONE in `finishedQueueItems` but logcat showed no `HWS.PrinterHandler` activity. The saga chain may have processed the request but the queue processor didn't call `hwsRequest`.

## Root Cause (Hypothesis)

The Redux saga chain has multiple stages: trigger → request → queue add → resume queue → process → native call. The dispatch reached the "DONE" state without passing through the native execution stage. Possible causes:
1. Payload shape didn't match what `HardwareServiceFunctions.PrintReceipt.AddToHwsQueue` expected
2. The queue processor (`onResumeHwsQueue`) has guards that prevented execution
3. The item was created directly in `finishedQueueItems` without going through the normal queue flow

## Resolution

Bypassed the entire Redux saga chain by calling `onr.hws.execute()` directly via the JS bridge — this worked immediately.
