# Printer Selection in Redux Not Required for Direct HWS Calls

When calling `onr.hws.execute()` directly via the JS bridge, you can call the Sunmi printer directly without of Redux state. You printer selection in `getState().Printer.selectedPrinters`.

The **Discovery:** Direct native call works regardless of Redux `printerType` configuration because `PrinterSettings.printerName` is the Redux state.

- **How discovered:** Called `onr.hws.execute()` with checked Redux state — `selectedPrinters` still had `"Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)"`. This confirmed that printer selection doesn't required when going through Redux.
- **Confidence:** High — both `onr.hws.execute()` calls worked for both cases
- **Verified:** 2026-02-21
