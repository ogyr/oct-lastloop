# Novel Tool Uses

## bridge_js_eval (onr.hws.execute): Direct Native Module Invocation

- **Context:** Redux saga chain silently swallowed print commands — items marked DONE but no native call occurred
- **Normal use:** Read Redux state via `getState()`, dispatch actions via `dispatch()`
- **Novel use:** Called Expo NativeModule.execute() directly via the global `onr.hws` handle exposed by the app, completely bypassing Redux → saga → queue → native pipeline
- **Prerequisites:** 
  - DevBridge connected (`__DEV__=true`, Metro running without `--no-dev`, adb reverse for ports 7654-7664)
  - App on a screen where DevBridge module is loaded
- **Example:**
  ```javascript
  onr.hws.execute(JSON.stringify({
    Cmd: "PrintReceipt",
    CmdVer: 1,
    PrintLines: [{ PrintLine: "text" }]
  })).then(r => console.log(JSON.stringify(r)))
  ```
- **Why this is novel:** The `onr.hws` handle is a debugging/testing shortcut that bypasses all the production code paths. It's useful for verifying hardware functionality without the complexity of the full saga chain.

---

## adb reverse: Port Range Forwarding for DevBridge Discovery

- **Context:** DevBridge client discovers the server by scanning ports 7654-7664, but on a physical device `localhost` refers to the device itself, not the host machine
- **Normal use:** Forward a single port for a specific service (e.g., `adb reverse tcp:8081 tcp:8081` for Metro)
- **Novel use:** Forward the entire port range (7654-7664) to enable DevBridge auto-discovery on a physical Android device
- **Example:**
  ```bash
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  for port in $(seq 7654 7664); do
    adb -s "$DEVICE" reverse tcp:$port tcp:$port
  done
  ```
- **Why this is novel:** Most docs show single-port forwarding. Forwarding a range enables discovery protocols that scan multiple ports.

---

## Expo Dev Client URL Intent: Force Metro Bundle Reload

- **Context:** The app was running a release bundle baked into the APK, not connecting to Metro
- **Normal use:** Let Expo CLI handle app launch via `npx expo start`
- **Novel use:** Use `adb shell am start` with the Expo dev client deep link to force the app to reload from Metro
- **Example:**
  ```bash
  adb -s "$DEVICE" shell am start -a android.intent.action.VIEW \
    -d "exp+onr-plus-pos://expo-development-client/?url=http://localhost:8081" \
    com.etron.mobile
  ```
- **Why this is novel:** When the app is already running, a simple `adb_launch` just brings it to foreground without reloading. The deep link intent forces it to fetch a fresh bundle from Metro.
