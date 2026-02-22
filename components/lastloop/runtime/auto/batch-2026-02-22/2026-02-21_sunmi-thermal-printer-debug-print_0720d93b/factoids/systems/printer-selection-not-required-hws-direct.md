# Printer Selection Not Required for Direct HWS Calls

When calling the HWS native module directly via `onr.hws.execute()`, the printer selection in Redux state (`Printer.selectedPrinters.bon`) is not consulted. The native module routes to the hardware directly.

## Discovery Context

- **Convo context:** Agent asked "will the Sunmi hardware be active with dev?" and "does it matter if the printer is selected if you call HWS directly?"
- **How discovered:** Confirmed by testing — direct `onr.hws.execute()` call printed successfully without verifying printer selection in Redux
- **Confidence:** High — print succeeded without any printer selection step

## Implication

For debugging/testing hardware functionality, the direct native call path is simpler because it doesn't depend on Redux state being correctly configured. The printer selection in settings only matters for the production code path through Redux sagas.
