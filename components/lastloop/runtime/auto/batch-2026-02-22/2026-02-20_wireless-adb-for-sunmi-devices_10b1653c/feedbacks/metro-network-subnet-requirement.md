# Metro Network Subnet Requirement

## Effect
Identified that Metro dev server URL is baked into the native APK at build time, causing "no credentials" type connection failures when device and Mac are on different subnets.

## Problem
App showed `SocketTimeoutException: failed to connect to /10.0.1.34 (port 8081)` when running on Sunmi device. The Sunmi was on `192.168.0.x` subnet while Mac was on `10.0.1.x`.

## Root Cause
Expo/React Native embeds the Metro bundler URL at native build time. Even with `adb reverse`, the app tries to connect to the hardcoded IP first.

## Solution
1. Connect Mac to same WiFi network as the device (same subnet)
2. Rebuild the APK with the new IP address
3. Use `adb reverse tcp:8081 tcp:8081` as fallback for Metro access

## Network Setup Commands
```bash
# Check Mac's current IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# After connecting to same network, rebuild
npm run android:device -- V3_MIX_EDLA_GL
# or use profile
adb_startup with profile: "sunmi", build: true
```

## Alternative Approaches (not tested)
- Set `REACT_NATIVE_PACKAGER_HOSTNAME=localhost` before build, rely solely on `adb reverse`
- Use production build without Metro dependency
