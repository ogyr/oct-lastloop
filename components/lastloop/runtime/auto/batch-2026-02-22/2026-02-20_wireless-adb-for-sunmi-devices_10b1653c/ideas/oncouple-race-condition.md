# onCouple Race Condition (Not Fixed)

## Observation
During logout testing, error count went from 8 → 9. The new error was `onCouple` (400 "already paired"), not "no credentials".

## Analysis
The `onCouple` request (POS config pairing) was still in-flight during logout. Similar to the sync race condition, but:
1. Only fires once at login/couple time (not continuous like sync)
2. The 400 error was pre-existing (config already paired)
3. Lower severity than sync race

## Potential Fix (Not Implemented)
Apply same `CANCEL_ALL` pattern to CashRegister coupling saga:
```typescript
// CashRegister.sagas.ts - onCouple
const { cancelled } = yield race({
    result: call(coupleRequest),
    cancelled: take(SynchronizationActions.CANCEL_ALL.action),
});
```

## Why Not Fixed
- The sync race was the primary issue (continuous HTTP calls)
- `onCouple` is a one-shot request
- User redirected to other tasks before this could be addressed
- The 400 error would have occurred anyway due to "already paired" state

## If Revisiting
Same pattern as sync fix:
1. Race the couple HTTP call against CANCEL_ALL
2. Call CancelAll in onLogout before DecoupleBeforeLogout
