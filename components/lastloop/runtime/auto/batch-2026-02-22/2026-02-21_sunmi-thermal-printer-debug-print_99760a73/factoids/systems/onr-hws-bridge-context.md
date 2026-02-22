# `onr.hws` provides direct native module access on JS bridge

The global `onr` object on the JS bridge context includes an `hws` property with direct access to native hardware services:

```javascript
onr.hws = {
  execute: (jsonCommand: string) => Promise<HwsResponse>,
  getDeviceCapabilities: () => Promise<...>,
  emitter: EventEmitter
}
```

This bypasses the Redux saga chain entirely. Useful when the normal dispatch path isn't working or when you need direct hardware control.

**Example - print directly:**
```javascript
onr.hws.execute(JSON.stringify({
  Cmd: "PrintReceipt",
  CmdVer: 1,
  PrintLines: [{ PrintLine: "Hello World" }]
}))
```

**Full `onr` context available on bridge:**
```javascript
Object.keys(onr)
// ["coreActions", "coreSel", "dispatch", "getDbs", "getState", 
//  "hws", "navigate", "navigationRef", "pathName", "removedActions", 
//  "replace", "scaleTestMode", "shoppingBasketSel", "store", 
//  "toggleDebug", "watchedSelectors"]
```
