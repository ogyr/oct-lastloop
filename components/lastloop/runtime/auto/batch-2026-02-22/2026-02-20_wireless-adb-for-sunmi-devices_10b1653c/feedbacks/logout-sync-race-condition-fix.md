# Logout Sync Race Condition Fix

## Effect
Fixed "no credentials" error that occurred when logging out while sync sagas were actively making HTTP requests.

## Problem
When user tapped "Abmelden" (logout) during active sync:
1. `onLogout` saga called `Odoo.reset()` which cleared `apiKey`, `apiSecret`, `token`
2. Sync sagas (`onSync`, `onSyncRequest`) were still running with `takeLatest` watchers
3. In-flight HTTP requests hit `Odoo.sendRequest()` after credentials cleared
4. `sendRequest` threw `"no credentials"` error which showed in the UI

## Timeline of the Race
```
1. SynchronizationFunctions.Reset  → dispatches RESET.request
   → Sync sagas STILL RUNNING (takeLatest not cancelled)

2. Odoo.reset()                    → CLEARS ALL CREDENTIALS
   → apiKey="", apiSecret="", token=""

3. In-flight sync HTTP request     → needs auth
   → finds empty credentials
   → throws "no credentials"

4. AuthActions.LOGOUT.success()    → sets isAuthenticated=false
   → React re-renders
   → DynamicModuleLoader removes Synchronization module
   → saga tasks finally cancelled (TOO LATE)
```

## Solution Pattern: CANCEL_ALL Action

### 1. Add CANCEL_ALL Action
```typescript
// Synchronization.actions.ts
CANCEL_ALL: createAction()("CANCEL_ALL"),
```

### 2. Add CancelAll Function
```typescript
// Synchronization.functions.ts
function* CancelAll() {
    yield put(SynchronizationActions.CANCEL_ALL.action());
}
```

### 3. Race Sync Sagas Against CANCEL_ALL
```typescript
// Synchronization.sagas.ts - onSync
const { cancelled } = yield race({
    result: call(function* () {
        // ... HTTP work ...
    }),
    cancelled: take(SynchronizationActions.CANCEL_ALL.action),
});
if (cancelled) return;
```

### 4. Call CancelAll Before Reset
```typescript
// Auth.sagas.ts - onLogout
yield call(SynchronizationFunctions.CancelAll);  // NEW
yield call(SynchronizationFunctions.Reset);
yield call(Odoo.reset);
yield put(AuthActions.LOGOUT.success());
```

## Why This Works
- `CANCEL_ALL` dispatches synchronously
- All running sync sagas are `race`-ing against this action
- Sagas exit cleanly via `if (cancelled) return;`
- No HTTP requests in-flight when `Odoo.reset()` runs
- No need to wait for React re-renders or module teardown

## Files Changed
- `Synchronization.actions.ts` — Added `CANCEL_ALL` action
- `Synchronization.functions.ts` — Added `CancelAll` function
- `Synchronization.sagas.ts` — Added `race` against `CANCEL_ALL` in `onSync`, `onSyncRequest`, `onSyncGroup`
- `Auth.sagas.ts` — Added `CancelAll` call before `Reset`

## Verification
- All 936 unit tests passed
- Device test: logout during active sync produced zero "no credentials" errors
- Error count went from 8→9, but the new error was `onCouple` (pre-existing), not sync-related
