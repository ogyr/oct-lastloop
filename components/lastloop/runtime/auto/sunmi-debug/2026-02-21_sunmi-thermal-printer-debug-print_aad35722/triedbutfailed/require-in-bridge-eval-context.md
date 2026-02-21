# Effect (Failed): Use require() to load Expo native modules in bridge eval

## Summary
The agent tried to access the HWS native module by calling `require('expo-modules-core').requireNativeModule('HWSAndroid')` inside a `bridge_js_eval` expression. The bridge eval sandbox does not expose Node's `require` function — only `onr`, `dispatch`, `getState`, and standard JS globals are available.

## Attempts
### 1. require('expo-modules-core')
- **What was tried:** Standard CommonJS require to load the Expo modules core and get a reference to the native HWS module
- **Why it failed:** Bridge eval runs in a restricted context where `require` is not available. Error: `Property 'require' doesn't exist`
- **Example:**
  ```js
  const modules = require('expo-modules-core');
  const hws = modules.requireNativeModule('HWSAndroidModule');
  // → Error: Property 'require' doesn't exist
  ```
