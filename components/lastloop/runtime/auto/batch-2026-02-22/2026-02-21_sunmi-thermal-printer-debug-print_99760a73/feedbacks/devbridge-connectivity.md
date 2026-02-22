# Effect: DevBridge WebSocket connection established on physical Android device

## Summary
Agent needed to connect to the JS bridge on a physical Sunmi V3 MIX device. The bridge requires a dev build with `__DEV__=true`, Metro dev server, and adb reverse port forwarding for the bridge discovery range.

## Observation

### Tool: adb reverse + Metro dev server
- **Approach:** Forwarded entire port range 7654-7664 via `adb reverse tcp:$port tcp:$port`, then started Expo dev server WITHOUT `--no-dev` flag
- **Prerequisites:**
  - Expo started with `npx expo start --port 8081` (no `--no-dev`)
  - adb reverse for ports 7654-7664
  - App reloaded via intent URL: `exp+onr-plus-pos://expo-development-client/?url=http://localhost:8081`
- **Example:**
  ```bash
  # Forward bridge port range
  for port in $(seq 7654 7664); do
    adb -s "$DEVICE" reverse tcp:$port tcp:$port
  done
  
  # Start Expo without --no-dev
  npx expo start --port 8081
  
  # Force app to connect to Metro
  adb shell am start -a android.intent.action.VIEW \
    -d "exp+onr-plus-pos://expo-development-client/?url=http://localhost:8081"
  ```
- **Result:** Logcat showed `[DevBridge] Connected to bridge server (android via localhost:7654)`
- **Verified:** 2026-02-21

## Key Discovery
The `onr.hws` object is available on the global bridge context, providing direct access to native modules including `execute()` for hardware commands.
