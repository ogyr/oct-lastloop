# Feedback Loop Extractor — Knowledge Base

## Tool Categories

### General Tools (publicly available)
These are tools/approaches that work across any software system:

| Tool/Approach | What it observes |
|---------------|-----------------|
| `logcat` (adb logcat) | Android native module execution, errors, lifecycle events |
| `adb shell` | Device state, processes, properties, file system |
| `adb reverse` | Port forwarding from device to host — enables localhost access |
| Chrome DevTools Protocol | WebView DOM, JS execution, network |
| `curl` / HTTP requests | API endpoints, service health |
| `lsof` / `netstat` | Port usage, process networking |
| Expo/Metro dev server | JS bundle serving, hot reload, dev mode features |

### @oct-private Tools (custom)
These are tools from the oct-private source:

| Tool | What it does |
|------|-------------|
| `@oct-private/bridge` (`bridge_js_eval`) | Evaluates JS in running app via WebSocket — reads Redux state, dispatches actions, calls native modules |
| `@oct-private/adb` (`adb_check_screen`, `adb_tap`, etc.) | Android UI automation — screenshots, tap, type, wait for elements |
| `@oct-private/adb_screenshot_utils` | Screenshot management, GIF creation |

## What Makes a Tool Use "Novel"

### Examples of Novel Uses from Past Conversations

**bridge_js_eval → direct native module call:**
Normal: Read Redux state with `getState()`, dispatch actions with `dispatch()`
Novel: Called `onr.hws.execute()` to invoke the Sunmi printer native module directly, bypassing the entire Redux → saga → queue → native pipeline

**adb reverse → DevBridge connectivity:**
Normal: Forward a single port for a specific service
Novel: Forwarded an entire port range (7654-7664) to enable DevBridge auto-discovery on a physical device

**Expo dev client URL intent:**
Normal: Let Expo CLI handle app launch
Novel: Used `adb shell am start` with the `exp+onr-plus-pos://expo-development-client/?url=...` deep link to force a running app to connect to a Metro dev server

### Examples of Routine Uses (skip these)

- `read` to read a file
- `grep` to search for a pattern
- `edit` to modify code
- `bash` (git commands)
- `adb_check_screen` to see what's on screen (that's literally its purpose)
- `bridge_js_eval` with `getState()` to read Redux state (standard use)

## The "Insight" Test

For each potential entry, ask: "If I told this to another agent working on this project, would they say 'I wouldn't have thought of that' or 'obviously'?" Only include the former.
