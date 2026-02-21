# Sunmi Hardware Debugger Knowledge Base

Domain knowledge extracted from debugging sessions with Sunmi V3 MIX POS hardware.

---

## Device Details

- **Model:** Sunmi V3 MIX (EDLA GL variant)
- **Product:** V3_MIX_EDLA_GL
- **Features:** Built-in thermal receipt printer, customer-facing secondary display (Android Presentation + WebView), cash drawer support
- **ADB Identifier:** Varies by connection type. USB/TLS connections appear as `adb-<SERIAL>._adb-tls-connect._tcp`. Use `adb devices -l` to find the current device.
- **Network IP:** Varies by network. Use `adb shell ip addr` to find.

---

## DevBridge Architecture

### Connection Requirements

The DevBridge is a WebSocket client that runs inside the React Native app and connects to the OpenCode bridge server running on the development machine.

**Three conditions must ALL be true:**

| Condition | How to Ensure |
|-----------|---------------|
| `__DEV__ === true` in JS bundle | Debug APK + Metro WITHOUT `--no-dev` |
| Bridge server running on ports 7654-7664 | Starts automatically with `bridge_js_eval` calls |
| Device can reach `localhost:7654+` | `adb reverse` for full port range |

### Port Discovery

The bridge client scans ports 7654-7664 sequentially via HTTP `GET http://localhost:<port>/bridge`. The first responding port is used. Constants defined in `DevBridge.ts:31-32`:
```ts
const BRIDGE_PORT_START = 7654;
const BRIDGE_PORT_END   = 7664;
```

Build-time injection via `__DEV_BRIDGE_PORT__` can skip the scan (Babel for mobile, Vite for web), but is not always available.

### Guard Locations

1. `packages/mobile/src/app/_layout.tsx:131` -- `if (__DEV__)` wraps `startDevBridge(store)`
2. `packages/shared/src/Utils/DevBridge/DevBridge.ts:87` -- `if (!isDev()) return` inside `startDevBridge()`

---

## The `--no-dev` Trap

**This is the #1 time-waster.** If the Expo dev server was started with `--no-dev`, `__DEV__` will be `false` even in a debug APK. The bridge client code is completely dead in this case.

Symptoms:
- `bridge_js_eval` times out ("No app connected within 15s")
- `adb reverse --list` shows all ports correctly forwarded
- `lsof -i :7654` shows bridge server listening
- Metro logs show the bundle was served (3200+ modules)
- Metro logs do NOT show `[DevBridge]` messages

Fix: Kill Expo and restart without `--no-dev`:
```bash
pkill -f "expo start"
cd packages/mobile && npx expo start --port 8081
```

---

## onr Global Object

The `window.onr` (global CLI object) exposes these keys in the bridge eval context:

```
coreActions, coreSel, dispatch, getDbs, getState, hws, navigate,
navigationRef, pathName, removedActions, replace, scaleTestMode,
shoppingBasketSel, store, toggleDebug, watchedSelectors
```

### onr.hws -- Direct Native Module Access

`onr.hws` is a reference to the HWSAndroid Expo native module:
- `onr.hws.execute(jsonString)` -- send any HWS command (returns Promise)
- `onr.hws.getDeviceCapabilities()` -- query device capabilities
- `onr.hws.emitter` -- native event emitter

This is the SAME function the saga chain calls at the bottom of its pipeline (`HardwareService.utils.platform.android.ts`), just accessible directly without the 8-step Redux dance.

---

## HWS Command Format

### PrintReceipt

```json
{
  "Cmd": "PrintReceipt",
  "CmdVer": 1,
  "PrintLines": [
    { "PrintLine": "text to print" },
    { "PrintBitmap": "base64...", "Format": "png", "Left": 0, "Right": 0, "Top": 0, "Bottom": 0 }
  ]
}
```

- `PrinterSettings` is NOT required when calling `execute()` directly -- the native PrinterHandler on Sunmi uses the built-in printer regardless
- `PrintLine` records are plain text lines
- `PrintBitmap` records are base64-encoded images with positioning

### ShowCustomerDisplay

```json
{
  "Cmd": "ShowCustomerDisplay",
  "CmdVer": 1,
  "Modus": 1,
  "Line1": "...",
  "Line2": "...",
  "Lines": [...],
  "Total": "0.00"
}
```

Modus values: 1 = shopping, 2 = checkout, 3 = thank you, 4 = welcome/idle

### Other Commands

- `OpenCashDrawer` -- opens the cash drawer
- `GetPrinterList` -- lists available printers
- `GetSystemInfo` -- device system info
- `PayCreditCard` -- initiates card payment
- `ScaleWeight` -- reads weight from connected scale
- `PrintLabel` -- label printing
- `PrintPDF` -- PDF printing

---

## HWS Queue Structure

`getState().HardwareService.hwsQueue` is NOT a flat array. It's an object keyed by command type:

```json
{
  "GetHwsVersion": { "status": "IDLE", "queue": [] },
  "GetPrinterList": { "status": "IDLE", "queue": [] },
  "PrintReceipt": { "status": "IDLE", "queue": [] },
  "ShowCustomerDisplay": { "status": "IDLE", "queue": [] },
  ...13 queue types total
}
```

Each type has independent status (`IDLE`, `BUSY`, `BLOCKING`) and its own queue array.

### Silent Drop Behavior

Dispatching `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER` via the bridge may silently fail:
- Items appear in `finishedQueueItems` with status `DONE`
- But `logcat` shows zero native handler calls
- The saga chain processed the Redux actions but the queue processor skipped the native call
- Likely cause: payload shape mismatch with what the saga's `takeLatest` watcher expects

**Always prefer `onr.hws.execute()` for direct hardware interaction from the bridge.**

---

## Printer Settings from Redux

The configured printer name can be read from state:
```js
getState().Printer.selectedPrinters
// → { a4: null, bon: { printerType: "local", printerName: "Sunmi SUNMI V3_MIX_EDLA_GL (Integriert)" }, label: null }
```

This is the printer name the saga chain uses, but it's not needed for direct `execute()` calls on Sunmi hardware.

---

## Bridge Eval Sandbox Constraints

| Feature | Supported? | Notes |
|---------|-----------|-------|
| `require()` | NO | "Property 'require' doesn't exist" |
| `await` | NO | Syntax error: "';' expected" |
| `getState()` | YES | Full Redux state access |
| `dispatch(action)` | YES | Redux dispatch (saga chain) |
| `onr.*` | YES | Global CLI object with hws, navigate, etc. |
| `.then()/.catch()` | YES | Promise chaining for async results |
| `console.log()` | YES | Output appears in Metro logs |
| `JSON.stringify()` | YES | Required for returning complex data |

---

## Observation Tools

### Metro Logs
```bash
tail -f /tmp/metro.log
```
Shows: DevBridge connection status, console.log output, bundle progress, JS errors.

### Logcat (Native Side)
```bash
adb -s "$DEVICE" logcat -d -t 50 | grep -iE "PRINT|HWS|PrinterHandler|sunmi" | tail -20
```
Shows: Native handler calls (`printReceipt called`, `printReceipt completed successfully`), native errors.

### Redux State via Bridge
```js
// Check HWS queue state
JSON.stringify(getState().HardwareService.hwsQueue.PrintReceipt)

// Check finished items with responses
const items = getState().HardwareService.finishedQueueItems.filter(i => i.Cmd === "PrintReceipt");
JSON.stringify(items.map(i => ({ status: i.status, response: i.response })))
```

### ADB Screen Capture
```
adb_check_screen  -- UI dump + screenshot of primary display
adb_screenshot    -- screenshot only
```
Note: These capture the PRIMARY display only. The customer-facing secondary display is not visible via standard ADB tools. To inspect it, you'd need WebView debugging enabled in DisplayHandler.kt (`WebView.setWebContentsDebuggingEnabled(true)`) and Chrome DevTools Protocol forwarding.

---

## Wireless ADB Reliability

Wireless ADB to Sunmi devices is unreliable:
- Connection drops frequently (multiple times per session)
- Port 39671 (wireless debugging) may expire
- Port 5555 (tcpip mode) may not be enabled
- USB connection (`adb-VC...._adb-tls-connect._tcp`) is more stable but also drops

Mitigation: Use USB whenever possible. If wireless is required, keep a polling loop ready:
```bash
while true; do
  adb devices -l 2>&1 | grep -q "device " && echo "FOUND" && break
  sleep 2
done
```
