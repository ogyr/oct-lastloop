# Novel Tool Uses

## bridge_js_eval: Direct native module invocation via `onr.hws.execute()`, bypassing Redux saga chain
- **Context:** The agent needed to print text on the Sunmi V3 MIX built-in thermal printer. Dispatching `HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER` through Redux appeared to succeed (queue item DONE, Result: 0, Message: OK) but produced no physical output. The saga chain silently swallowed the command. After multiple failed dispatch attempts, the agent discovered `onr.hws` on the global CLI object, which exposes the raw Expo NativeModule with `.execute()`.
- **Normal use:** `bridge_js_eval` reads Redux state via `getState()` or dispatches actions via `dispatch()`. The `onr` object is documented for `navigate`, `find`, selectors, etc.
- **Novel use:** Called `onr.hws.execute(JSON.stringify({...}))` directly -- invoking the Expo NativeModule's `execute` method to send a raw command to the Sunmi printer SDK, completely bypassing the Redux -> saga -> HWS queue -> native call pipeline.
- **Type:** @oct-private/bridge
- **Key insight:** When the Redux saga chain silently swallows commands (items appear "done" but no side effect occurs), the `onr.hws` handle on the global CLI object provides a direct escape hatch to the native hardware layer. The bridge eval context doesn't support `require()` or `await`, so native module calls must use `.then()` chaining and console.log for results.
- **Example:**
  ```
  onr.hws.execute(JSON.stringify({
    Cmd: "PrintReceipt",
    CmdVer: 1,
    PrintLines: [
      { PrintLine: " " },
      { PrintLine: "================================" },
      { PrintLine: "  text to print" },
      { PrintLine: "================================" },
      { PrintLine: " " }
    ]
  })).then(function(r) { console.log("PRINT RESULT: " + JSON.stringify(r)); }).catch(function(e) { console.log("PRINT ERROR: " + e.message); })
  ```

## bash (adb): Force Expo dev client to reconnect to Metro via deep link intent
- **Context:** A debug APK was built with `assembleDebug` and installed, but when launched via `adb_launch`, it used the embedded release bundle instead of connecting to the Metro dev server. Metro showed zero bundle requests. The agent needed to force the already-running app to fetch the dev bundle from Metro so `__DEV__` would be true and the DevBridge would activate.
- **Normal use:** `adb shell am start` is used to launch apps by package name or open URLs.
- **Novel use:** Sent an Android VIEW intent with the Expo development client's custom URL scheme (`exp+onr-plus-pos://expo-development-client/?url=...`) to force the running app to reconnect to Metro. This triggered the dev client to fetch a fresh bundle from the local Metro server, enabling `__DEV__=true` in the JS runtime.
- **Type:** General
- **Key insight:** Expo development client apps respond to deep link intents with the `expo-development-client` path parameter. Sending this intent to an already-running app forces it to re-fetch the bundle from the specified Metro URL, even if it was previously running an embedded bundle. This is the programmatic equivalent of shaking the device and selecting "Change Server URL".
- **Example:**
  ```
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  adb -s "$DEVICE" shell am start -a android.intent.action.VIEW -d "exp+onr-plus-pos://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" com.etron.mobile
  ```

## bash (adb): Batch `adb reverse` for DevBridge port range to enable bridge on physical device
- **Context:** The DevBridge WebSocket client in the React Native app tries to connect to `localhost:7654-7664` to discover the bridge server. On an emulator, `adb reverse` is often pre-configured, but on a physical Sunmi device connected via USB or wireless ADB, the ports need to be explicitly forwarded so the device's `localhost` routes back to the Mac's bridge server.
- **Normal use:** `adb reverse` is typically used for a single port (e.g. Metro's 8081).
- **Novel use:** Batch-forwarded the entire DevBridge port range (7654-7664) plus Metro (8081) in a single loop, ensuring the bridge client's port-scanning discovery mechanism would work on a physical device.
- **Type:** General
- **Key insight:** The DevBridge client scans ports 7654-7664 via HTTP GET to `localhost:<port>/bridge` to discover which port the server is on. On physical devices, ALL ports in the range must be reverse-forwarded, not just the active one, because the client tries them sequentially. Without this, the bridge silently fails to connect with no error.
- **Example:**
  ```
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  for port in $(seq 7654 7664); do
    adb -s "$DEVICE" reverse tcp:$port tcp:$port
  done
  adb -s "$DEVICE" reverse tcp:8081 tcp:8081
  ```

## bash (adb): WebView Chrome DevTools Protocol port forwarding for secondary display
- **Context:** The Sunmi V3 MIX has a customer-facing secondary display driven by an Android Presentation containing a WebView. The agent wanted to inject JS into this WebView to display arbitrary content. Since it's a secondary display, `adb_check_screen` and `adb_screenshot` only capture the primary display.
- **Normal use:** `adb forward` is used for debugging apps via Chrome DevTools.
- **Novel use:** Forwarded the WebView's debug socket (`localabstract:webview_devtools_remote_<PID>`) to localhost:9222, then used `curl` to query the Chrome DevTools Protocol JSON endpoint to list debuggable WebView targets. This would have allowed JS injection into the secondary display's WebView via CDP websocket. (Approach was abandoned because WebView debugging wasn't enabled in the release build, but the technique is valid for debug builds.)
- **Type:** General
- **Key insight:** Android WebViews that have `WebView.setWebContentsDebuggingEnabled(true)` expose a Unix domain socket at `localabstract:webview_devtools_remote_<PID>`. Forwarding this to a TCP port and using CDP gives full JS injection capability into any WebView -- including ones on secondary displays that are invisible to standard ADB screenshot tools.
- **Example:**
  ```
  adb -s "$DEVICE" forward tcp:9222 localabstract:webview_devtools_remote_$(adb -s "$DEVICE" shell pidof com.etron.mobile)
  curl -s http://localhost:9222/json
  ```

## bash (logcat): Verify native module execution by correlating JS bridge call with native Android logs
- **Context:** After calling `onr.hws.execute()` via the JS bridge, the agent needed to confirm the command actually reached the Kotlin native module and was processed. The bridge returned `undefined` (promise-based, no synchronous result), so verification required checking both Metro console logs (for the `.then()` callback) and Android logcat (for the native `PrinterHandler` log entries).
- **Normal use:** `logcat` is used for general Android debugging.
- **Novel use:** Used targeted `logcat` grep filtering (`PRINT|HWS|PrinterHandler|sunmi`) to correlate the JS bridge call with native-side log entries, confirming the full JS -> bridge -> NativeModule -> Kotlin -> Sunmi SDK path was working. The native logs showed `printReceipt called` and `printReceipt completed successfully` while Metro logs showed the JS callback result.
- **Type:** General
- **Key insight:** When the JS bridge fires a promise-based native call, you need two observation points to verify the full chain: (1) Metro/console.log for the JS-side callback result, and (2) `adb logcat` with tag filters for the native-side handler. Together they confirm the command traversed the entire JS -> Native boundary.
- **Example:**
  ```
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  adb -s "$DEVICE" logcat -d -t 50 | grep -iE "PRINT|HWS|PrinterHandler|sunmi" | tail -20
  ```
