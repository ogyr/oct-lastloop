# Expo --no-dev Disables DevBridge Entirely

The previous agent started the Expo dev server with `--no-dev` flag (`npx expo start --port 8081 --no-dev --android`). This sets `__DEV__=false` in the JS bundle, which completely disables the DevBridge WebSocket client — even though the APK was a debug build (`assembleDebug`) and `adb reverse` was correctly configured for the full port range 7654-7664.

The guard exists in two independent places:
1. `packages/mobile/src/app/_layout.tsx` (line 131): wraps `startDevBridge(store)` in `if (__DEV__)`
2. `packages/shared/src/Utils/DevBridge/DevBridge.ts` (line 87): internal `if (!isDev()) return` early exit

The agent spent multiple `bridge_js_eval` calls timing out (15s each), set up `adb reverse` for 11 ports, verified the bridge server was listening with `lsof`, confirmed reverse port forwarding with `adb reverse --list` — everything was correct at the infrastructure level. The breakthrough came from inspecting the Metro log and noticing the `--no-dev` flag in the original Expo start command. Restarting Expo without `--no-dev` immediately enabled the bridge connection.

## Details
- **Discovered via:** Two failed `bridge_js_eval` calls (15s timeout each) → checking Metro logs → seeing `--no-dev` in the Expo startup command → restarting Expo without the flag
- **Convo context:** Trying to connect JS bridge to Sunmi V3 MIX physical device to call the thermal printer via `onr.hws.execute()`
- **Confidence:** high
