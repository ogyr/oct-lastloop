# onr.hws Exposes Native Module Directly

The global `onr` object has a `hws` property with `execute`, `getDeviceCapabilities`, and `emitter` methods, providing direct access to the HWS native module without going through Redux saga chain.

## Discovery Context

Agent needed to debug the Sunmi printer behavior but Discovered by exploring the JS bridge options and inspecting `onr` global object via `bridge_js_eval`:

```javascript
JSON.stringify(Object.keys(onr))
// Returns: ["coreActions","coreSel","dispatch","getState","getDbs","navigate","navigationRef","pathName","replace","scaleTestMode","shoppingBasketSel","store","toggleDebug"]
```

This enables:
- Reading Redux state via `getState()`
- Dispatching actions via `dispatch()`
- Navigation via `onr.navigate()` / `onr.replace()`
- Access to the HWS native module via `onr.hws.execute()`, `onr.hws.getDeviceCapabilities()`
- `onr.hws.emitter` for native module events

## Methods

### execute(command: string): Promise<HwsResponse>
```javascript
onr.hws.execute(JSON.stringify({
  Cmd: "PrintReceipt",
  CmdVer: 1,
  PrintLines: [{ PrintLine: "text" }]
}))
```

### getDeviceCapabilities(): DeviceCapabilities
Returns hardware capabilities of the device.

### emitter: EventEmitter
Native module event emitter for listening to native module events

**Verified:** 2026-02-21
