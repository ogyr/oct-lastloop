# HWS queue structure is keyed by command type

The HardwareService `hwsQueue` in Redux state is NOT a flat array. It's an object keyed by command type:

```javascript
{
  GetHwsVersion: { status: "IDLE", queue: [] },
  PrintReceipt: { status: "IDLE", queue: [] },
  ShowCustomerDisplay: { status: "IDLE", queue: [] },
  // ... one entry per HARDWARESERVICE_TYPES
}
```

When querying queue state via bridge, use:
```javascript
const queue = getState().HardwareService.hwsQueue.PrintReceipt;
// { status: "IDLE", queue: [] }
```

Finished items are in a separate flat array:
```javascript
const finished = getState().HardwareService.finishedQueueItems;
// [{ id: "...", Cmd: "PrintReceipt", status: "DONE", response: {...} }, ...]
```
