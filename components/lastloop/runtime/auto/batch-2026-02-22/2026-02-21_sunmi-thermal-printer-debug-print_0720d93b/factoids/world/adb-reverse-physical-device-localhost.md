# adb reverse Required for Physical Device to Reach Host localhost

For a physical Android device, `localhost` refers to the device itself, not the development host machine. Services running on the host (Metro, DevBridge, etc.) are unreachable via `localhost:PORT` from the device.

`adb reverse tcp:HOST_PORT tcp:DEVICE_PORT` creates a tunnel that forwards device-localhost:DEVICE_PORT to host-localhost:HOST_PORT.

## Common Use Cases

| Service | Port | Command |
|---------|------|---------|
| Metro bundler | 8081 | `adb reverse tcp:8081 tcp:8081` |
| DevBridge | 7654-7664 | `for p in $(seq 7654 7664); do adb reverse tcp:$p tcp:$p; done` |
| Chrome DevTools | 9222 | `adb reverse tcp:9222 localabstract:webview_devtools_remote_<pid>` |

## Discovery Context

- **Convo context:** DevBridge client couldn't connect to server running on host
- **How discovered:** Standard Android development knowledge, applied to DevBridge discovery protocol
- **Confidence:** High — this is a well-documented ADB feature

## Note

Android emulator uses `10.0.2.2` as the host's loopback alias, so `adb reverse` is optional for emulators. Physical devices always need it.
