# Novel/Unexpected Tool Uses

## adb_startup with Wireless Profile
The `adb_startup` tool was used with `profile: "sunmi"` for wireless ADB devices. This was the correct way to handle wireless devices rather than passing IP:port directly to Expo CLI.

```json
// Tool call that worked
{
  "profile": "sunmi",
  "build": true
}
```

The tool internally:
- Reads `ADB_DEVICE_ID` from `.env.sunmi.local`
- Handles the `adb connect` sequence
- Sets up `adb reverse` for Metro
- Launches the appropriate Expo command

## bridge_js_eval for State Inspection
Used `js_eval` with `platform: "android"` to inspect Redux state and error details directly on the device. This was more reliable than trying to read console errors from the UI dump.

```javascript
// Check error count and last error type
JSON.stringify({
  errors: getState().Errors?.errors?.length,
  lastError: getState().Errors?.errors?.slice(-1)?.[0]?.meta
})

// Verify no "no credentials" errors
JSON.stringify(getState().Errors.errors[8])
```

## adb_tap by Coordinates
When text matching failed (e.g., `&K` was HTML-encoded as `&amp;K` in UI dump), direct coordinate tapping was used:

```json
// Text search failed
{"text": "&K Napkin Star"}  // Element not found

// Coordinate tap worked
{"x": 1054, "y": 385}
```

## Task Tool for Deep Code Exploration
Used `task` tool with `subagent_type: "explore"` to delegate complex code tracing (finding "no credentials" error flow, logout sequence, saga cancellation patterns). This kept context usage manageable while getting thorough analysis.

## playwright_browser_close Before Navigate
When Chromium failed to launch because another instance was running, `playwright_browser_close` followed by `pkill -f "Google Chrome for Testing"` was needed before `playwright_browser_navigate` could succeed.
