# Effect: Metro Serves Dev-Mode Bundle with __DEV__=true

## Summary

Starting Expo with `npx expo start --port 8081 --no-dev` produces a bundle where `__DEV__` is `false`, completely disabling the DevBridge. The bridge won't connect even with all other prerequisites met. Starting WITHOUT `--no-dev` enables dev mode and the DevBridge.

## Observation

- **Tool:** bash (npm/npx), Metro logs
- **Approach:** Start Metro/Expo dev server without the `--no-dev` flag
- **Prerequisites:** None (just need to start the server correctly)
- **Example:**
  ```bash
  # WRONG - disables DevBridge
  npx expo start --port 8081 --no-dev --android
  
  # CORRECT - enables DevBridge
  npx expo start --port 8081
  ```
- **Result:**
  ```
  LOG [DevBridge] Started (android), port=7654, connecting...
  LOG [DevBridge] Connected to bridge server (android via localhost:7654)
  ```
- **Verified:** 2026-02-21

## Key Discovery

The DevBridge has two layers of guards:
1. Entry point: `if (__DEV__) startDevBridge(store)` in `_layout.tsx`
2. Internal: `if (!isDev()) return` inside `startDevBridge()`

Both checks must pass for the bridge to initialize. The `--no-dev` flag breaks this chain.
