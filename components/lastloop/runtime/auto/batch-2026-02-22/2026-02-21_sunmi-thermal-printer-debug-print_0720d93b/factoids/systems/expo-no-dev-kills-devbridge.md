# Expo `--no-dev` Disables DevBridge Entirely

Starting the Expo dev server with `--no-dev` sets `__DEV__=false` in the JS bundle. This completely disables the DevBridge WebSocket client — it won't connect even if the bridge server is running and `adb reverse` is configured.

The guard exists in two places:
1. `_layout.tsx`: `if (__DEV__) startDevBridge(store)` — the call is never even made
2. `DevBridge.ts`: `if (!isDev()) return` — defense-in-depth

## Discovery Context

- **Convo context:** Agent tried to connect JS bridge to Sunmi for printer control. Bridge server was running, adb reverse was set up, but `bridge_js_eval` returned "no clients connected"
- **How discovered:** Inspected Metro startup command, saw `--no-dev` flag, realized it would affect `__DEV__`
- **Confidence:** High — Metro log showed `[DevBridge] Connected` immediately after restarting without `--no-dev`

## Impact

Any debugging that requires the JS bridge (reading Redux state, dispatching actions, calling native modules via bridge) requires a dev-mode bundle. Using `--no-dev` for "faster builds" breaks this entire debugging path.
