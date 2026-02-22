# Effect (Failed): Bridge connection with `--no-dev` flag

## Summary
Agent started Expo with `--no-dev` flag, then tried to connect the JS bridge. The bridge never connected because `--no-dev` sets `__DEV__=false` in the bundle, which completely disables the DevBridge module.

## Attempts

### 1. Start Expo with --no-dev
- **What was tried:** `npx expo start --port 8081 --no-dev --android`
- **Why it failed:** The `--no-dev` flag sets `__DEV__=false` in the JS bundle. The DevBridge module has a guard at initialization:
  - `_layout.tsx`: `if (__DEV__) { startDevBridge(store); }`
  - `DevBridge.ts`: `if (!isDev()) return;`
- **Observation:** Metro logs showed bundle served, app loaded, but no `[DevBridge]` connection messages

### 2. Setup adb reverse anyway
- **What was tried:** Forwarded ports 7654-7664 and waited for bridge
- **Why it failed:** The bridge client code never starts because `__DEV__` is false

## Resolution
Restarted Expo WITHOUT `--no-dev` flag. After app reload, logcat immediately showed `[DevBridge] Started (android), port=7654, connecting...` followed by `[DevBridge] Connected to bridge server`.
