# Effect (Failed): Start Metro bundler via react-native start

## Summary
The agent tried to start the Metro dev server using `npx react-native start --port 8081` but this failed because the project uses Expo and the standalone React Native CLI is not fully configured. The CLI printed an error about missing `@react-native-community/cli` dependency.

## Attempts
### 1. npx react-native start
- **What was tried:** Started Metro directly via the React Native CLI to serve the dev bundle
- **Why it failed:** The project uses Expo, which has its own dev server (`npx expo start`). The bare `react-native start` command couldn't find the required CLI package.
- **Example:**
  ```bash
  npx react-native start --port 8081 &>/tmp/metro.log &
  # Metro log output:
  # ⚠️ react-native depends on @react-native-community/cli for cli commands.
  # To fix update your package.json to include:
  #   "devDependencies": {
  #     "@react-native-community/cli": "latest",
  #   }
  ```

### 2. Switched to npx expo start (this worked)
- **What was tried:** After `react-native start` failed, switched to `npx expo start --port 8081` which successfully started Metro
- **Why it mattered:** However, the first attempt used `--no-dev` flag which disabled `__DEV__`, causing a separate problem (see `bridge-connection-with-no-dev-expo.md`)
