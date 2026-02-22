# Effect: HWS Queue State Observable via JS Bridge

## Summary

The HardwareService Redux state is fully accessible via the JS bridge, including the queue status, finished items, failed items, and HWS version. This enables debugging of hardware command flows without needing logcat or physical verification.

## Observation

- **Tool:** bridge_js_eval
- **Approach:** Read Redux state via `getState().HardwareService`
- **Prerequisites:** DevBridge connected (see devbridge-connection-established.md)
- **Example:**
  ```javascript
  // Check queue state structure
  const hs = getState().HardwareService;
  JSON.stringify({
    queueKeys: Object.keys(hs.hwsQueue),
    status: hs.hwsStatus,
    busy: hs.busyCounter
  })
  // Returns: {"queueKeys":["GetHwsVersion","GetPrinterList","PrintReceipt",...],"status":"IDLE","busy":0}
  
  // Check finished items for print commands
  const finished = hs.finishedQueueItems || [];
  const printItems = finished.filter(i => i.Cmd === "PrintReceipt");
  JSON.stringify(printItems.map(i => ({
    id: i.id?.slice(-8),
    status: i.status,
    Message: i.Message,
    response: i.response
  })))
  // Returns: [{"id":"45601485","status":"DONE","response":{"Result":0,"Message":"OK"},...}]
  ```
- **Result:** Full visibility into HWS queue state, enabling diagnosis of why print commands weren't reaching the native module
- **Verified:** 2026-02-21

## Key Discovery

The `hwsQueue` is an object keyed by command type (PrintReceipt, ShowCustomerDisplay, etc.), not a flat array. Each key maps to `{status: "IDLE"|"BUSY"|..., queue: []}`. Finished items go to `finishedQueueItems` array.
