# Effect: Force Expo dev client to reload bundle from Metro dev server

## Summary
After installing a debug APK and starting the Metro dev server, the app continued running from its embedded bundle instead of fetching from Metro. Metro logs showed no bundle request. The agent discovered that sending the Expo dev client deep link URL via ADB intent forced the app to reconnect to Metro and fetch the dev bundle.

## Observation
- **Tool:** bash (adb shell am start)
- **Approach:** Used `adb shell am start` with the Expo dev client deep link URL that tells the app to connect to a specific Metro URL. The app reloaded and fetched the new bundle from Metro.
- **Prerequisites:** Debug APK with Expo dev client installed, Metro server running on port 8081, `adb reverse tcp:8081 tcp:8081` set up
- **Example:**
  ```bash
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  adb -s "$DEVICE" shell am start -a android.intent.action.VIEW \
    -d "exp+onr-plus-pos://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
    com.etron.mobile
  ```
- **Result:** Metro logs showed bundle request starting, progressing through module compilation, and completing with `Bundled 20184ms node_modules/expo-router/entry.js (3207 modules)`. App reloaded with dev bundle.
- **Verified:** 2026-02-21
