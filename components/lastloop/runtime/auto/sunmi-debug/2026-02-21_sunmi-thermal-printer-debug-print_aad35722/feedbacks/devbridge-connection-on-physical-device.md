# Effect: DevBridge WebSocket client connects from physical Android device to Mac host

## Summary
The JS bridge (DevBridge) needed to connect from a physical Sunmi V3 MIX device to the Mac running the bridge server. This required three prerequisites that the agent had to discover through trial and error: (1) the Expo/Metro dev server must run in dev mode (NOT `--no-dev`), (2) `adb reverse` must forward port 7654 from device to host, and (3) the debug APK must be forced to load the dev bundle from Metro.

## Observation
- **Tool:** bash (adb reverse) + bridge_js_eval + Metro logs
- **Approach:** Set up `adb reverse tcp:PORT tcp:PORT` for ports 7654-7664 (bridge range) and 8081 (Metro). Then verified connection by checking Metro logs for `[DevBridge] Connected to bridge server` message.
- **Prerequisites:** USB or wireless ADB connection to device, debug APK installed, Expo dev server running WITHOUT `--no-dev` flag, `adb reverse` for bridge port range
- **Example:**
  ```bash
  # Set up adb reverse for bridge port range
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  for port in $(seq 7654 7664); do
    adb -s "$DEVICE" reverse tcp:$port tcp:$port
  done
  # Also reverse Metro port
  adb -s "$DEVICE" reverse tcp:8081 tcp:8081
  ```
- **Result:** Metro logs showed `[DevBridge] Started (android), port=7654, connecting...` followed by `[DevBridge] Connected to bridge server (android via localhost:7654)`. After this, `bridge_js_eval` calls succeeded.
- **Verified:** 2026-02-21
