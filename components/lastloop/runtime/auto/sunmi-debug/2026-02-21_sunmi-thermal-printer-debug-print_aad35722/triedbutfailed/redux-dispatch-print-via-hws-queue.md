# Effect (Failed): Trigger Sunmi printer via Redux ADD_TO_HWS_QUEUE dispatch

## Summary
The agent tried to print by dispatching `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER` through the JS bridge — the standard Redux path used by the app for all HWS commands. Items appeared in `finishedQueueItems` with status DONE and response `{"Result":0,"Message":"OK"}`, but no physical print occurred. The dispatch was silently swallowed somewhere in the saga chain. The finished items in the queue turned out to be from earlier (release build) checkout receipts, not from the bridge dispatches.

## Attempts
### 1. Dispatch without PrinterSettings
- **What was tried:** Dispatched `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER` with `type: "PrintReceipt"` and `data: { Cmd: "PrintReceipt", PrintLines: [...] }` but no `PrinterSettings`
- **Why it failed:** Item may have been silently dropped by the saga because `PrinterSettings` was missing. The queue showed the item as "finished" but it was actually a pre-existing item from a prior session.
- **Example:**
  ```js
  dispatch({
    type: "HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER",
    payload: {
      type: "PrintReceipt",
      data: {
        Cmd: "PrintReceipt",
        PrintLines: [
          { PrintLine: " " },
          { PrintLine: "  before we continue," },
          { PrintLine: "  i want to ask you why" },
          // ...
        ]
      }
    }
  });
  ```

### 2. Dispatch with PrinterSettings from state
- **What was tried:** Added `PrinterSettings` with `PrinterName: "Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)"` and `RollWidth: 80`, plus `retryDelay: 190` and `totalRetries: 6`
- **Why it failed:** Queue still showed `PrintReceipt: {status: "IDLE", queue: []}` — the item was never enqueued. The saga chain likely rejected it because the action payload structure didn't match what the `takeLatest` watcher expected, or the saga for PrintReceipt queue type was not actively running in the dynamic module context.
- **Example:**
  ```js
  dispatch({
    type: "HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER",
    payload: {
      type: "PrintReceipt",
      data: {
        Cmd: "PrintReceipt",
        CmdVer: 1,
        PrintLines: [{ PrintLine: "text" }],
        PrinterSettings: {
          PrinterName: "Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)",
          printerType: "local",
          printerName: "Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)",
          RollWidth: 80
        },
        retryDelay: 190,
        totalRetries: 6
      }
    }
  });
  ```
