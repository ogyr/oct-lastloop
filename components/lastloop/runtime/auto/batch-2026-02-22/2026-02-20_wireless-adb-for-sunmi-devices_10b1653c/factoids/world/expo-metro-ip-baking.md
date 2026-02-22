# Expo Metro IP Baking

## Fact
Expo embeds the Metro bundler URL into the native APK/JS bundle at build time. This URL is derived from the build machine's network interface at build time.

## Implication
1. If build machine changes IP (different WiFi, VPN, etc.), the embedded URL becomes stale
2. `adb reverse` alone isn't sufficient — the app tries the hardcoded IP first
3. Rebuilding is required when network environment changes

## Solutions
1. **Rebuild on same network as device** — The embedded IP matches the device's subnet
2. **Use `REACT_NATIVE_PACKAGER_HOSTNAME=localhost`** — Bakes `localhost` into APK, relies on `adb reverse` at runtime
3. **Production build** — No Metro dependency, bundle is self-contained

## The `localhost` Approach
```bash
REACT_NATIVE_PACKAGER_HOSTNAME=localhost npx expo run:android
```

This makes the APK try `localhost:8081` first, which `adb reverse tcp:8081 tcp:8081` tunnels to the Mac's Metro server.

## Trade-offs
- `localhost` approach: Works across networks, but requires `adb reverse` to be set up
- Network-specific build: Simpler for dev, but requires rebuild when IP changes
