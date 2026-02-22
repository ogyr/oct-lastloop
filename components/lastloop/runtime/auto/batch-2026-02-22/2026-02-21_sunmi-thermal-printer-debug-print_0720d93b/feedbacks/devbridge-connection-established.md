# Effect: DevBridge WebSocket Connection Established

## Summary

The JS bridge (bridge_js_eval) requires the DevBridge WebSocket client in the app to connect to a server running on the host machine. On a physical Android device, this requires `adb reverse` to forward ports from the device's localhost to the host's localhost. Without this, the bridge server has no connected clients.

## Observation

- **Tool:** adb (bash), bridge_bridge_status, bridge_js_eval
- **Approach:** Set up `adb reverse` for the entire DevBridge port range (7654-7664) so the app can discover and connect to whichever port the bridge server is listening on
- **Prerequisites:** 
  - USB or wireless ADB connection to physical device
  - Bridge server running (starts automatically when bridge_js_eval is called)
- **Example:**
  ```bash
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  for port in $(seq 7654 7664); do
    adb -s "$DEVICE" reverse tcp:$port tcp:$port
  done
  ```
- **Result:**
  ```
  [DevBridge] Started (android), port=7654, connecting...
  [DevBridge] Connected to bridge server (android via localhost:7654)
  ```
- **Verified:** 2026-02-21

## Key Discovery

The DevBridge client on Android uses `localhost` as the default host (not an IP address). For a physical device, `localhost` refers to the device itself, not the host machine. `adb reverse` creates a tunnel that forwards device-localhost:PORT to host-localhost:PORT, enabling the connection.
