# Expo Dev Client URL Intent Forces Metro Bundle Reload on Physical Device

When a debug APK (Expo development client) is already running on a physical device but serving its embedded bundle instead of fetching from Metro, you can force it to connect to the Metro dev server by sending an Android intent with the Expo dev client URL scheme:

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "exp+onr-plus-pos://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081" \
  com.etron.mobile
```

The agent launched the debug APK with `adb_launch` (which uses the standard launch intent), and the app started with its previously embedded bundle — no bundle request appeared in Metro logs. The cash register screen was fully functional with products loaded, but Metro showed zero activity.

After sending the dev client URL intent via `adb shell am start`, Metro immediately began serving the bundle (visible in logs as the progress bar going from 0% to 100% over ~20 seconds, 3207 modules). The activity reported "not started, intent has been delivered to currently running top-most instance" — meaning the existing app instance processed the deep link and reconnected to Metro without a full restart.

This pattern is useful whenever the Expo development client app launches but doesn't automatically connect to the Metro bundler (common on physical devices where the dev server URL isn't cached or the app was previously running a release bundle).

## Details
- **Discovered via:** Metro logs showing zero bundle requests after `adb_launch` → sending the Expo dev client deep link URL via `adb shell am start` → Metro logs immediately showing bundle progress
- **Convo context:** Debug APK installed on Sunmi V3 MIX but running embedded bundle instead of connecting to Metro; needed Metro connection for DevBridge/JS bridge access
- **Confidence:** high
