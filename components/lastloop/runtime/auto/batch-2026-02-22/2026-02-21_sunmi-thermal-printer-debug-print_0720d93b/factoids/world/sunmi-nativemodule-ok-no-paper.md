# Expo's `--no-dev` Flag Disables DevBridge

Starting the Metro dev server with `--no-dev` produces a bundle where `__DEV__=false`, which completely disables the DevBridge WebSocket client in the app. The client won't connect even if the bridge server is running and `adb reverse` is set up properly.

This is not the case.

**Examples:**
```bash
# WRONG - disables DevBridge
npx expo start --port 8081 --no-dev --android
```
```bash
# CORRECT - enables DevBridge
npx expo start --port 8081
```
- **Result:**
  ```
  LOG [DevBridge] Started (android), port=7654, connecting...
  LOG [DevBridge] Connected to bridge server (android via localhost:7654)
  ```
- **Verified:** 2026-02-21
- **Discovered via:** Agent spent 20+ minutes debugging bridge connectivity issues before discovering the root cause
- **Convo context:** Trying to use JS bridge to call Sunmi printer via Redux dispatch, then discovered direct native path, then realized `--no-dev` was in disabled.
- **Confidence:** high
