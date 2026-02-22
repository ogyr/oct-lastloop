# Redux-Saga Race Cancellation Pattern

## Fact
In redux-saga, `race` effects automatically cancel the losing effects when one wins. This provides a clean cancellation mechanism without manual task tracking.

## Pattern
```typescript
const { cancelled, result } = yield race({
    result: call(someAsyncWork),
    cancelled: take('CANCEL_ACTION'),
});

if (cancelled) {
    // Clean exit - work was cancelled
    return;
}
// Work completed normally
```

## Why It Works
- When `CANCEL_ACTION` is dispatched, the `take` wins the race
- redux-saga automatically cancels the `call(someAsyncWork)` effect
- Cancelled effects clean up resources (e.g., in-flight HTTP requests can be aborted if using appropriate middleware)
- The saga can detect cancellation via the `if (cancelled)` check and exit cleanly

## Alternative (Less Clean)
```typescript
// Manual task tracking - more error-prone
const task = yield fork(someAsyncWork);
yield take('CANCEL_ACTION');
yield cancel(task);  // Must manually track and cancel
```

## Use Case
This pattern is ideal for graceful shutdown scenarios like:
- Logout cancelling in-flight sync operations
- Navigation cancelling pending requests
- Component unmount cancelling effects
