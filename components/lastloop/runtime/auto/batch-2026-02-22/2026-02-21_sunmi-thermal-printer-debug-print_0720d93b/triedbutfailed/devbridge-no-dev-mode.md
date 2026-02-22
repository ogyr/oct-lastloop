# Effect (Failed): JS Bridge Connection without Dev Mode

## Summary

The DevBridge WebSocket client in the app wouldn't connect even with `adb reverse` properly configured and the bridge server running. The root cause was that Metro was started with `--no-dev`, which sets `__DEV__=false` in the JS bundle, completely disabling the DevBridge initialization.

## Difficulty Encountered

The agent spent ~20 minutes debugging bridge connectivity: checking `adb reverse`, verifying the bridge server port, checking Metro logs, before discovering the `--no-dev` flag in the Expo startup command.

## Attempts

### 1. Verify adb reverse setup
- **What was tried:** 
  ```bash
  adb -s "$DEVICE" reverse --list
  ```
- **Why it failed:** Reverse was correctly set up — this wasn't the issue.

### 2. Check bridge server status
- **What was tried:** `bridge_bridge_status` showed "server running on port 7654 but no clients connected"
- **Why it failed:** The server was fine — the client wasn't connecting.

### 3. Force Expo dev client URL
- **What was tried:** 
  ```bash
  adb shell am start -a android.intent.action.VIEW -d "exp+onr-plus-pos://expo-development-client/?url=http://localhost:8081"
  ```
- **Why it failed:** The app reloaded but still didn't connect — because the bundle was compiled without `__DEV__`.

### 4. Check Metro logs for `__DEV__`
- **What was tried:** Inspected the `npx expo start` command — found `--no-dev` flag
- **Why it failed:** This WAS the issue. The `--no-dev` flag compiles the bundle with `__DEV__=false`, which guards the DevBridge initialization at TWO levels:
  1. `_layout.tsx`: `if (__DEV__) startDevBridge(store)`
  2. `DevBridge.ts`: `if (!isDev()) return`

## Resolution

Restarted Metro WITHOUT `--no-dev`:
```bash
npx expo start --port 8081
```
Then forced the app to reload the bundle. DevBridge connected immediately:
```
LOG [DevBridge] Started (android), port=7654, connecting...
LOG [DevBridge] Connected to bridge server (android via localhost:7654)
```
