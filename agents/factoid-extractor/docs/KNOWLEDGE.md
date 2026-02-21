# Factoid Extractor — Reference Knowledge

## Example Factoids

### Systems Knowledge Examples

**`expo-no-dev-kills-devbridge.md`:**
```
# Expo --no-dev Disables DevBridge Entirely

Starting the Expo dev server with --no-dev sets __DEV__=false in the
JS bundle. This completely disables the DevBridge WebSocket client.
The guard exists in two places: _layout.tsx wraps startDevBridge() in
if (__DEV__), and DevBridge.ts has an internal if (!isDev()) return.
Even with a debug APK and adb reverse configured, the bridge won't connect.

## Details
- Discovered via: bridge_js_eval timeout → Metro log inspection
- Convo context: Trying to connect JS bridge to Sunmi for printer control
- Confidence: high
```

**`hws-queue-done-not-executed.md`:**
```
# HWS Queue Marks Items DONE Without Native Execution

Dispatching HARDWARE_SERVICE/ADD_TO_HWS_QUEUE_TRIGGER with a PrintReceipt
payload causes the item to appear in finishedQueueItems with status DONE
and Message undefined — but no native module call occurs. The saga chain
processes the Redux actions but the queue processor (onResumeHwsQueue)
doesn't execute hwsRequest. Likely caused by missing or malformed
PrinterSettings in the payload, which the saga silently drops.

## Details
- Discovered via: bridge_js_eval checking finishedQueueItems + logcat showing no native calls
- Convo context: Attempting to print on Sunmi via Redux dispatch
- Confidence: medium
```

### World Knowledge Examples

**`sunmi-printer-ok-not-printed.md`:**
```
# Sunmi NativeModule Returns OK Even When Print Fails Silently

The Sunmi HWS native module's execute() can return {Result: 0, Message: "OK"}
for PrintReceipt commands even when no physical print occurs. "OK" means the
command was accepted by the SDK, not that the printer actually produced output.
Always verify physical output separately.

## Details
- Discovered via: logcat showing "printReceipt completed successfully" with no physical output
- Convo context: Multiple print attempts via Redux dispatch on Sunmi V3 MIX
- Confidence: medium
```

**`adb-reverse-port-range.md`:**
```
# ADB Reverse Needed for DevBridge on Physical Devices

Physical Android devices (not emulators) need adb reverse tcp:<port> tcp:<port>
for EACH port in the DevBridge range (7654-7664). The bridge client on the device
connects to localhost, which maps to the device itself — adb reverse redirects it
to the host machine. Must also reverse port 8081 for Metro. The reverses survive
app restart but are cleared on device disconnect.

## Details
- Discovered via: DevBridge not connecting after Expo start → adb reverse setup
- Convo context: Connecting JS bridge to Sunmi V3 MIX for hardware control
- Confidence: high
```

## Anti-Examples (NOT Factoids)

These would be filtered out by the common knowledge gate:

- "You can use `adb devices -l` to list connected devices" — any Android dev knows this
- "Redux state is accessed via `getState()`" — basic Redux knowledge
- "TypeScript files end in `.ts`" — trivially common
- "You need to `npm install` before building" — standard workflow
- "Git branches can be created with `git checkout -b`" — basic git
- "Console.log outputs to the terminal" — trivially common

## Classification Edge Cases

| Factoid | Classification | Reasoning |
|---------|---------------|-----------|
| "Expo --no-dev sets __DEV__=false" | systems | Specific to this project's DevBridge dependency on __DEV__ |
| "ADB reverse survives app restart" | world | Applies to any Android development |
| "onr.hws.execute() bypasses Redux" | systems | Specific to this app's architecture |
| "Sunmi SDK accepts but doesn't print" | world | Applies to any Sunmi developer |
| "Metro bundler keeps running after install" | world | Applies to any React Native project |
