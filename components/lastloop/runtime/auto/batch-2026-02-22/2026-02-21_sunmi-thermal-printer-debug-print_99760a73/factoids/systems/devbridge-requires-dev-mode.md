# DevBridge requires `__DEV__=true`

Starting Expo with `--no-dev` sets `__DEV__=false` in the JS bundle. This completely disables the DevBridge WebSocket client — it won't connect even if:
- The bridge server is running
- adb reverse is set up
- The app is otherwise functional

The guard exists at two levels:
1. **Entry point** (`packages/mobile/src/app/_layout.tsx:131`): `if (__DEV__) { startDevBridge(store); }`
2. **Internal** (`packages/shared/src/Utils/DevBridge/DevBridge.ts:87`): `if (!isDev()) return;`

**Rule:** Always start Expo WITHOUT `--no-dev` for JS bridge access. The correct command is:
```bash
npx expo start --port 8081  # NO --no-dev flag
```
