# Effect (Failed): Trigger Sunmi print via Redux dispatch

## Summary
Attempted to print by dispatching `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER`. Items appeared in `finishedQueueItems` as DONE with `Result: 0, Message: "OK"` but no physical print occurred. The Redux saga chain processed the action without actually calling the native module.

## Attempts

### 1. Dispatch without PrinterSettings
- **What was tried:** 
  ```javascript
  dispatch({
    type: "HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER",
    payload: {
      type: "PrintReceipt",
      data: { Cmd: "PrintReceipt", PrintLines: [...] }
    }
  })
  ```
- **Why it failed:** Missing `PrinterSettings` — queue item may have been processed but silently dropped at the native layer. No error returned.

### 2. Dispatch with PrinterSettings
- **What was tried:** Added `PrinterSettings` with correct `PrinterName` from Redux state:
  ```javascript
  dispatch({
    type: "HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER",
    payload: {
      type: "PrintReceipt",
      data: {
        Cmd: "PrintReceipt",
        PrintLines: [...],
        PrinterSettings: {
          PrinterName: "Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)",
          RollWidth: 80
        }
      }
    }
  })
  ```
- **Why it failed:** Queue showed `IDLE` with 0 items waiting, item went to `finishedQueueItems` as DONE but:
  - No `HWS.PrinterHandler` entries in logcat
  - Physical printer never activated
  - The saga chain processed it without reaching the native module

## Root Cause Hypothesis
The `hwsQueue` structure is an object keyed by command type (`{PrintReceipt: {status: "IDLE", queue: []}}`), not a flat array. The dispatch path may not have been correctly routing to the `PrintReceipt` queue processor, or the queue processor wasn't actively watching for new items. The direct native call via `onr.hws.execute()` bypassed this entire layer.
