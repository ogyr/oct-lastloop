# Effect: HWS queue is an object keyed by command type, not a flat array

## Summary
The agent initially assumed `getState().HardwareService.hwsQueue` was a flat array and tried `queue.map()` which failed. By inspecting the actual structure, it was discovered that `hwsQueue` is an object keyed by command type (PrintReceipt, ShowCustomerDisplay, OpenCashDrawer, etc.), each containing `{status, queue: []}`. This structural understanding was essential for diagnosing why dispatched print commands appeared to succeed but didn't actually print.

## Observation
- **Tool:** bridge_js_eval (getState)
- **Approach:** Inspected `typeof` and structure of `hwsQueue` after `queue.map()` threw "queue.map is not a function (it is undefined)"
- **Prerequisites:** DevBridge connected
- **Example:**
  ```js
  const hs = getState().HardwareService;
  const q = hs.hwsQueue;
  JSON.stringify({ type: typeof q, isArr: Array.isArray(q), preview: JSON.stringify(q).slice(0, 500) })
  // → {"type":"object","isArr":false,"preview":"{\"GetHwsVersion\":{\"status\":\"IDLE\",\"queue\":[]},\"GetPrinterList\":{\"status\":\"IDLE\",\"queue\":[]},\"GetSystemInfo\":{\"status\":\"IDLE\",\"queue\":[]},\"InstallUpdate\":{\"status\":\"IDLE\",\"queue\":[]},\"OpenCashDrawer\":{\"status\":\"IDLE\",\"queue\":[]},\"PayCreditCard\":{\"status\":\"IDLE\",\"queue\":[]},\"PrintPDF\":{\"status\":\"IDLE\",\"queue\":[]},\"PrintReceipt\":{\"status\":\"IDLE\",\"queue\":[]},..."}
  ```
- **Result:** 13 queue types discovered: GetHwsVersion, GetPrinterList, GetSystemInfo, InstallUpdate, OpenCashDrawer, PayCreditCard, PrintPDF, PrintReceipt, ResetHws, ShowCustomerDisplay, RunShell, ScaleWeight, PrintLabel. Each has independent status and queue array.
- **Verified:** 2026-02-21
