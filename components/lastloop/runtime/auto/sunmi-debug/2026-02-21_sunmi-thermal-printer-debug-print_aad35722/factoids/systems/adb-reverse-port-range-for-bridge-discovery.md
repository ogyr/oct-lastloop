# ADB Reverse Port Range Required for DevBridge Auto-Discovery on Physical Devices

The DevBridge client in React Native apps discovers the bridge server by scanning a port range (7654-7664) via HTTP `GET http://localhost:<port>/bridge`. On an Android emulator, `localhost` maps to the host via `10.0.2.2` fallback. On a **physical device**, `localhost` points to the device itself — so `adb reverse` must be set up for the **entire port range**, not just the known active port.

The bridge server picks the first free port in 7654-7664. The client doesn't know which port in advance (unless `__DEV_BRIDGE_PORT__` was injected at build time via Babel/Vite). It scans all 11 ports sequentially. If only one port is reverse-forwarded, the client might not find the server.

The complete setup command:
```bash
DEVICE="<device-serial>"
for port in $(seq 7654 7664); do
  adb -s "$DEVICE" reverse tcp:$port tcp:$port
done
# Also reverse Metro port if needed
adb -s "$DEVICE" reverse tcp:8081 tcp:8081
```

The agent initially set up reverse for all ports but the bridge still didn't connect — because the `--no-dev` flag had disabled the client entirely (separate factoid). Once `--no-dev` was removed and the full port range was already forwarded, connection was immediate.

## Details
- **Discovered via:** Reading DevBridge source code (subagent explored `DevBridge.ts` lines 31-32 for port constants, lines 75+ for `getBridgeHosts()`) + setting up `adb reverse` for the range + verifying with `adb reverse --list`
- **Convo context:** Connecting JS bridge to Sunmi V3 MIX physical device for printer access
- **Confidence:** high
