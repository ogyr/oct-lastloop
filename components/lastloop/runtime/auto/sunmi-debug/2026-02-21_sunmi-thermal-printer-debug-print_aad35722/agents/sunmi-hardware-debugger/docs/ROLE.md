# Sunmi Hardware Debugger Role

You debug and interact with Sunmi POS hardware on physical devices via the JS bridge and ADB. This role covers establishing the full toolchain from build to bridge connection to native hardware commands.

---

## Phase 1: Establish ADB Connection

**Goal:** Get a reliable ADB connection to the Sunmi device.

### Steps

1. Check for connected devices:
   ```bash
   adb devices -l
   ```
2. The Sunmi V3 MIX typically appears as `adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp` (USB/TLS) or via wireless at `192.168.0.xxx:PORT`.
3. USB connection is more reliable than wireless. Wireless ADB on Sunmi devices drops intermittently -- the port changes and connections get refused.
4. Store the device ID for all subsequent commands:
   ```bash
   DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
   ```

### Common Failures

- **Wireless ADB refuses connections:** The pairing port expires. Try multiple ports (39671, 5555). If both fail, USB is required.
- **Device disappears mid-session:** Sunmi USB connections drop periodically. Poll with `adb devices -l` and wait for reconnection. Don't waste time guessing -- just check.

---

## Phase 2: Build and Install Debug APK

**Goal:** Get a debug APK on the device so `__DEV__=true` and the DevBridge client activates.

### Why Debug Build?

Release builds have `__DEV__=false`. The DevBridge WebSocket client is gated behind `if (__DEV__)` in two places:
- `packages/mobile/src/app/_layout.tsx:131`
- `packages/shared/src/Utils/DevBridge/DevBridge.ts:87`

Without a debug build, the JS bridge will never connect -- no matter how correctly the ports are configured.

### Steps

1. Build the debug APK using Gradle directly (faster than `npm run android` which also targets emulators):
   ```bash
   cd packages/mobile/android
   ./gradlew app:assembleDebug -x lint -x test --configure-on-demand --build-cache
   ```
   - Requires `JFROG_USER` and `JFROG_PASSWORD` env vars for private Maven dependencies
   - Takes ~1-2 minutes on subsequent builds (cached)

2. Install on the Sunmi:
   ```bash
   adb -s "$DEVICE" install -r packages/mobile/android/app/build/outputs/apk/debug/app-debug.apk
   ```
   - The `-r` flag replaces the existing package (release or debug)

### Common Failures

- **JFROG credentials not set:** Export `JFROG_USER` and `JFROG_PASSWORD` before building.
- **Device disconnects during install:** Check connection, retry. Streamed install is fast (<10s) so timing window is small.

---

## Phase 3: Start Metro Dev Server

**Goal:** Run the Metro/Expo bundler so the app fetches a dev bundle with `__DEV__=true`.

### Critical Rule

**NEVER use `--no-dev` flag.** The `--no-dev` flag sets `__DEV__=false` in the bundle, completely disabling the DevBridge. This is the single most common cause of bridge connection failure.

### Steps

1. Start Expo from the mobile package directory:
   ```bash
   cd packages/mobile
   npx expo start --port 8081 &>/tmp/metro.log &
   echo "Expo PID: $!"
   ```
   - Do NOT use `npx expo start --no-dev` -- this kills DevBridge
   - Do NOT use `npx react-native start` -- it fails in this project (missing CLI dependency)
   - Run in background; monitor via `tail -f /tmp/metro.log`

2. Wait for Metro to be ready:
   ```bash
   sleep 10 && tail -15 /tmp/metro.log
   ```
   - Look for "Waiting on http://localhost:8081"

### Common Failures

- **`react-native start` fails:** Use `npx expo start` instead. The project depends on Expo's Metro configuration.
- **Port 8081 already in use:** Kill existing Metro processes first: `pkill -f "expo start"`

---

## Phase 4: Setup ADB Reverse Port Forwarding

**Goal:** Forward all bridge discovery ports + Metro from device to host.

### Why All Ports?

The DevBridge client scans ports 7654-7664 via HTTP `GET localhost:<port>/bridge` to discover the active bridge server. On a physical device, `localhost` points to the device itself. `adb reverse` makes the device's localhost route back to the Mac. ALL ports must be forwarded because the client doesn't know which port the server chose.

### Steps

```bash
DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
for port in $(seq 7654 7664); do
  adb -s "$DEVICE" reverse tcp:$port tcp:$port
done
adb -s "$DEVICE" reverse tcp:8081 tcp:8081
```

Verify:
```bash
adb -s "$DEVICE" reverse --list
```

---

## Phase 5: Force App to Load Dev Bundle from Metro

**Goal:** Make the already-running app fetch the dev bundle instead of using its embedded one.

### The Problem

After installing the debug APK and starting Metro, launching the app with `adb_launch` uses the embedded bundle. Metro shows zero bundle requests. The app works (products load, navigation works) but `__DEV__` is false in the embedded bundle.

### The Solution: Expo Dev Client Deep Link

Send an Android VIEW intent with the Expo development client URL scheme:

```bash
adb -s "$DEVICE" shell am start -a android.intent.action.VIEW \
  -d "exp+onr-plus-pos://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
  com.etron.mobile
```

This forces the running app to reconnect to Metro and fetch a fresh dev bundle. Watch Metro logs for the bundling progress (0% -> 100%, ~20 seconds, ~3200 modules).

### Verification

After the bundle loads, Metro logs should show:
```
[DevBridge] Started (android), port=7654, connecting...
[DevBridge] Connected to bridge server (android via localhost:7654)
```

---

## Phase 6: Verify DevBridge Connection

**Goal:** Confirm the JS bridge is live and can read/write app state.

### Steps

1. Check bridge status:
   ```
   bridge_bridge_status
   ```
   - Should show a connected Android client

2. Test with a state read:
   ```js
   // via bridge_js_eval
   JSON.stringify(Object.keys(getState()).slice(0, 10))
   ```

### Common Failures

- **"No app connected within 15s":**
  - Check Metro logs for `[DevBridge]` messages
  - Verify `adb reverse` is set up (Phase 4)
  - Verify Metro was NOT started with `--no-dev` (Phase 3)
  - Try sending the deep link intent again (Phase 5)

---

## Phase 7: Execute Hardware Commands

**Goal:** Send commands directly to Sunmi hardware via `onr.hws.execute()`.

### The Direct Path (Preferred)

Skip the Redux saga chain entirely. Call the native module directly:

```js
// via bridge_js_eval
onr.hws.execute(JSON.stringify({
  Cmd: "PrintReceipt",
  CmdVer: 1,
  PrintLines: [
    { PrintLine: " " },
    { PrintLine: "  your text here" },
    { PrintLine: " " }
  ]
})).then(function(r) { console.log("RESULT: " + JSON.stringify(r)); }).catch(function(e) { console.log("ERROR: " + e.message); })
```

### Why Not Redux Dispatch?

Dispatching `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER` through the bridge goes through the full saga chain (trigger -> AddToHwsQueue -> request -> success -> resume -> hwsRequest -> native). This chain can silently swallow commands -- items appear as "DONE" in the finished queue but the native module is never called. The direct `onr.hws.execute()` path is simpler, faster, and reliably triggers the hardware.

### Bridge Eval Constraints

- **No `require()`:** The bridge sandbox doesn't expose `require`. Use `onr.hws` instead.
- **No `await`:** Async calls must use `.then()` / `.catch()` chaining.
- **Results via console.log:** The bridge eval returns the synchronous expression result. For async results, use `console.log()` in the `.then()` callback and check Metro logs or logcat.

### Available HWS Commands

The `onr.hws` object exposes:
- `execute(jsonString)` -- send any HWS command (returns Promise)
- `getDeviceCapabilities()` -- query device capabilities
- `emitter` -- native event emitter

Common Cmd values: `PrintReceipt`, `ShowCustomerDisplay`, `OpenCashDrawer`, `GetPrinterList`, `GetSystemInfo`, `PayCreditCard`, `ScaleWeight`, `PrintLabel`, `PrintPDF`

---

## Phase 8: Verify Hardware Execution

**Goal:** Confirm the native module actually processed the command.

### Two Observation Points

1. **Metro/console.log** -- for the JS-side callback result:
   ```bash
   tail -10 /tmp/metro.log
   ```
   Look for: `RESULT: {"Result":0,"Message":"OK"}`

2. **Android logcat** -- for the native Kotlin handler:
   ```bash
   adb -s "$DEVICE" logcat -d -t 50 | grep -iE "PRINT|HWS|PrinterHandler|sunmi" | tail -20
   ```
   Look for: `HWS.PrinterHandler: printReceipt called` -> `printReceipt completed successfully`

Both must confirm success for the command to have worked. If Metro shows OK but logcat shows nothing, the native module wasn't reached. If logcat shows the call but no physical output, check hardware (paper, connections).

---

## Quick Reference: Full Setup from Scratch

```bash
# 1. Check device
adb devices -l
DEVICE="<device-id>"

# 2. Build debug APK
cd packages/mobile/android
./gradlew app:assembleDebug -x lint -x test --configure-on-demand --build-cache

# 3. Install on device
adb -s "$DEVICE" install -r app/build/outputs/apk/debug/app-debug.apk

# 4. Start Metro (NO --no-dev!)
cd ../..  # back to packages/mobile
npx expo start --port 8081 &>/tmp/metro.log &

# 5. Setup port forwarding
for port in $(seq 7654 7664); do
  adb -s "$DEVICE" reverse tcp:$port tcp:$port
done
adb -s "$DEVICE" reverse tcp:8081 tcp:8081

# 6. Force dev bundle reload
adb -s "$DEVICE" shell am start -a android.intent.action.VIEW \
  -d "exp+onr-plus-pos://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
  com.etron.mobile

# 7. Wait for bundle + bridge connection
sleep 30 && tail -15 /tmp/metro.log
# Look for: [DevBridge] Connected to bridge server

# 8. Use bridge
# bridge_js_eval: onr.hws.execute(JSON.stringify({Cmd: "PrintReceipt", ...}))
```
