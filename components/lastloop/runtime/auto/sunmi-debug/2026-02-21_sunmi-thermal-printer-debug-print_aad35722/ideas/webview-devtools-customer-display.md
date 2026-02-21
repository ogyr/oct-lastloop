# Idea: Inject JS into customer display WebView via Chrome DevTools Protocol

## Summary
The customer display on Sunmi V3 MIX is an Android Presentation containing a WebView. To inject arbitrary content into it, the approach would be to enable WebView debugging (`WebView.setWebContentsDebuggingEnabled(true)` in `DisplayHandler.kt`), forward the WebView devtools port via `adb forward`, and use the Chrome DevTools Protocol (CDP) to inject JS.

## Status: Untested (user redirected to thermal printer task)

The agent began this approach but was redirected by the user ("i am talking about sunmi hardware printer"). The approach was **not exhausted** — a known fix exists (adding `setWebContentsDebuggingEnabled(true)` to `DisplayHandler.kt` + rebuild), but was never tested because the user's actual goal was the thermal printer, not the customer display.

## What was explored
1. **Port forwarding succeeded:** `adb forward tcp:9222 localabstract:webview_devtools_remote_<PID>` returned 9222
2. **CDP query returned nothing:** `curl -s http://localhost:9222/json` produced no output — WebView debugging was not enabled in the build
3. **Agent proposed the fix:** Add `WebView.setWebContentsDebuggingEnabled(true)` in `DisplayHandler.kt`, rebuild debug APK

## How to complete this approach
```bash
# 1. Edit DisplayHandler.kt to enable WebView debugging
# Add WebView.setWebContentsDebuggingEnabled(true) in the WebView setup

# 2. Rebuild debug APK
cd packages/mobile/android
./gradlew app:assembleDebug -x lint -x test

# 3. Install and launch
adb -s "$DEVICE" install -r app/build/outputs/apk/debug/app-debug.apk

# 4. Forward WebView devtools port
adb -s "$DEVICE" forward tcp:9222 localabstract:webview_devtools_remote_$(adb -s "$DEVICE" shell pidof com.etron.mobile)

# 5. List debug targets and inject JS
curl -s http://localhost:9222/json
# Use the webSocketDebuggerUrl from the response to inject JS via CDP
```

## Why this matters
The Sunmi secondary display is invisible to ADB screenshot/screen capture tools. CDP injection via WebView debugging would give full control over the customer display content — useful for debugging display phase issues, testing custom content, and verifying WebView rendering.
