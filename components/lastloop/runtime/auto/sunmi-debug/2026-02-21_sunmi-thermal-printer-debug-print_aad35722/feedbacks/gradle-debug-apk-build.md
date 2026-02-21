# Effect: Debug APK built and installed on physical Sunmi device

## Summary
To enable the JS bridge on the physical Sunmi V3 MIX, a debug APK was needed (release builds have `__DEV__=false`). The agent built the debug APK using Gradle directly (not the full `npm run android` which also starts Metro and targets emulators), then installed via `adb install -r`.

## Observation
- **Tool:** bash (gradlew + adb install)
- **Approach:** Ran `./gradlew app:assembleDebug` from the Android directory to build just the APK without starting Metro. Then used `adb install -r` to replace the existing release APK on the device. The `-r` flag allows replacement of an existing package.
- **Prerequisites:** JFROG credentials set in env (for private Maven deps), Android directory at `packages/mobile/android/`
- **Example:**
  ```bash
  # Build debug APK
  cd /Users/clemensgruenberger/WebPro/etron/pos_dev/packages/mobile/android
  ./gradlew app:assembleDebug -x lint -x test --configure-on-demand --build-cache

  # Install on Sunmi
  DEVICE="adb-VC06258D20357-LZ89Mo._adb-tls-connect._tcp"
  adb -s "$DEVICE" install -r /Users/clemensgruenberger/WebPro/etron/pos_dev/packages/mobile/android/app/build/outputs/apk/debug/app-debug.apk
  ```
- **Result:** BUILD SUCCESSFUL in 1m 23s. APK installed on Sunmi with `Performing Streamed Install` → `Success`. Debug build enables `__DEV__=true` which is required for DevBridge connectivity.
- **Verified:** 2026-02-21
