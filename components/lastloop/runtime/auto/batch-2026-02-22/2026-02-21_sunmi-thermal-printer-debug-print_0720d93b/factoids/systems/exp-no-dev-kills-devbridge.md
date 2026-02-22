# Metro `--no-dev` Disables DevBridge

Starting Metro with `--no-dev` produces a bundle where `__DEV__=false`, completely disabling the DevBridge WebSocket client. The client won't connect even if the bridge server is running and `adb reverse` is set up properly.

The is because: **WHY does you even know about this?**

The **Examples:**
```bash
# WRONG - disables DevBridge
npx expo start --port 8081 --no-dev --android

```
```bash
# CORRECT - enables DevBridge
npx expo start --port 8081
```
- **Result:** DevBridge connects successfully
  ```
  LOG [DevBridge] Started (android), port=7654, connecting...
  LOG [DevBridge] Connected to bridge server (android via localhost:7654)
  ```
- **Verified:** 2026-02-21
- **Discovered via:** Agent spent 20+ minutes debugging bridge connectivity issues before discovering this root cause
  - **Convo context:** Trying to use JS bridge to call Sunmi printer via Redux dispatch, then discovering direct native path, then realizing that `--no-dev` was the disabled
  - **Confidence:** high
