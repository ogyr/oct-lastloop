# Novel Tool Uses

## bridge_js_eval (onr.hws.execute): Direct native module invocation bypassing Redux saga chain

- **Context:** Redux dispatch path for printing appeared to succeed (queue items marked DONE with Result: 0) but produced no physical output. The saga chain wasn't reaching the native module.
- **Normal use:** Read Redux state via `getState()`, dispatch actions via `dispatch()`
- **Novel use:** Called `onr.hws.execute()` to invoke the Sunmi printer native module directly, bypassing the entire Redux → saga → queue → native pipeline. This required discovering that `onr.hws` is available on the bridge context with `{execute, getDeviceCapabilities, emitter}` methods.
- **Example:**
  ```javascript
  onr.hws.execute(JSON.stringify({
    Cmd: "PrintReceipt",
    CmdVer: 1,
    PrintLines: [{ PrintLine: "text" }]
  })).then(r => console.log(JSON.stringify(r)))
  ```

## adb reverse: Forward entire port range for DevBridge discovery

- **Context:** DevBridge client scans ports 7654-7664 to discover the bridge server. On physical devices, `localhost` refers to the device, not the host Mac.
- **Normal use:** Forward a single port for a specific service (e.g., `adb reverse tcp:8081 tcp:8081` for Metro)
- **Novel use:** Forwarded entire port range 7654-7664 in a loop to enable DevBridge auto-discovery:
  ```bash
  for port in $(seq 7654 7664); do
    adb -s "$DEVICE" reverse tcp:$port tcp:$port
  done
  ```

## adb shell am start: Force Expo dev client to connect to Metro

- **Context:** The debug APK was using its embedded bundle instead of connecting to Metro. Simply launching the app via `adb_launch` didn't trigger a Metro connection.
- **Normal use:** Launch an app by package name
- **Novel use:** Sent an intent with the Expo dev client URL scheme to force the app to connect to a specific Metro server:
  ```bash
  adb shell am start -a android.intent.action.VIEW \
    -d "exp+onr-plus-pos://expo-development-client/?url=http://localhost:8081"
  ```
