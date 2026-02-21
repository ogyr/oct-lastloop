# Effect: onr.hws provides direct access to HWS native module from JS bridge

## Summary
The agent needed to call the HWS Expo native module directly but `require('expo-modules-core')` was not available in the bridge eval sandbox. By inspecting `Object.keys(onr)`, the agent discovered that `onr.hws` is a direct reference to the HWSAndroid native module with `execute`, `getDeviceCapabilities`, and `emitter` methods — providing a way to bypass the Redux saga chain entirely.

## Observation
- **Tool:** bridge_js_eval
- **Approach:** First tried `require('expo-modules-core').requireNativeModule('HWSAndroid')` which failed with "Property 'require' doesn't exist". Then enumerated `Object.keys(onr)` and found `hws`. Inspected `onr.hws` to find available methods.
- **Prerequisites:** DevBridge connected
- **Example:**
  ```js
  // Discover what's on onr
  JSON.stringify(Object.keys(onr).sort())
  // → ["coreActions","coreSel","dispatch","getDbs","getState","hws","navigate","navigationRef","pathName","removedActions","replace","scaleTestMode","shoppingBasketSel","store","toggleDebug","watchedSelectors"]

  // Inspect the hws handle
  JSON.stringify({ type: typeof onr.hws, keys: Object.keys(onr.hws) })
  // → {"type":"object","keys":["execute","getDeviceCapabilities","emitter"]}
  ```
- **Result:** `onr.hws.execute(JSON.stringify({...}))` returns a Promise that resolves to the native module response. This is the same function the saga chain eventually calls but accessible directly.
- **Verified:** 2026-02-21
