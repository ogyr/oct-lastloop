# Effect (Failed): JS bridge connection when Expo started with --no-dev

## Summary
The previous session had started the Expo dev server with `--no-dev` flag, which sets `__DEV__=false` in the JavaScript bundle. Even though a debug APK was installed and `adb reverse` was correctly configured for all bridge ports (7654-7664), the DevBridge client inside the app never attempted to connect. The `startDevBridge()` function is gated behind `if (__DEV__)` in `_layout.tsx` and `if (!isDev()) return` in `DevBridge.ts`, so with `--no-dev` the bridge code is completely bypassed.

## Attempts
### 1. bridge_js_eval after Metro --no-dev bundle loaded
- **What was tried:** Called `bridge_js_eval` with `getState()` expression after the app loaded the `--no-dev` bundle (3207 modules bundled in 20s)
- **Why it failed:** Bridge server reported "No app connected within 15s" because the DevBridge WebSocket client was not started in the bundle (gated by `__DEV__ === false`)
- **Example:**
  ```js
  // Bridge status showed: "Bridge server running on port 7654 but no clients connected"
  // bridge_js_eval returned: "Bridge error: No app connected within 15s. Is the dev build running?"
  ```

### 2. Verified adb reverse was correctly set up
- **What was tried:** Confirmed all reverse ports were forwarded and bridge server was listening
- **Why it failed:** The issue was not network connectivity — it was that the client-side code was not running at all
- **Example:**
  ```bash
  adb -s "$DEVICE" reverse --list
  # Output showed all ports 7654-7664 correctly forwarded
  lsof -i :7654
  # Showed opencode process listening on port 7654
  ```
