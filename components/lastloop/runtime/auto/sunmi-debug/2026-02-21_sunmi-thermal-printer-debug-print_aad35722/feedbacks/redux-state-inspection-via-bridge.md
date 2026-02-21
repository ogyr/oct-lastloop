# Effect: Redux state readable via JS bridge on physical device

## Summary
Once the DevBridge was connected, the agent could read the full Redux state tree from the running app on the physical Sunmi device. This enabled inspecting printer settings, HWS queue contents, finished queue items with their response data, and verifying which commands had been processed by the native module.

## Observation
- **Tool:** bridge_js_eval (getState)
- **Approach:** Used `getState()` to read Redux state and `JSON.stringify()` to extract specific slices. Key discoveries: `getState().Printer.selectedPrinters` revealed the configured bon printer name, `getState().HardwareService.finishedQueueItems` showed processed HWS commands with their native module responses.
- **Prerequisites:** DevBridge connected (dev build, adb reverse, Metro running)
- **Example:**
  ```js
  // Read printer settings
  JSON.stringify(getState().Printer.selectedPrinters)
  // → {"a4":null,"bon":{"printerType":"local","printerName":"Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)"},"label":null}

  // Check HWS finished items with response data
  const hs = getState().HardwareService;
  const printItems = hs.finishedQueueItems.filter(i => i.Cmd === "PrintReceipt");
  JSON.stringify(printItems.map(i => ({
    id: i.id?.slice(-8),
    status: i.status,
    Message: i.Message,
    response: i.response,
    printerName: i.data?.PrinterSettings?.PrinterName
  })))
  ```
- **Result:** Full visibility into app state including printer configuration, HWS queue status per command type, and native module response data for each processed queue item.
- **Verified:** 2026-02-21
