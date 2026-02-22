# Journal Terminal Type Routing

## Fact
Payment routing in onRetail POS depends on the journal's `paymentTerminal` configuration, not just the payment method name.

## Observed State
```javascript
// "EC Kartenlesegerät" journal
{
  "name": "EC Kartenlesegerät",
  "type": "bank",
  "usePaymentTerminal": false,  // <-- No terminal integration
  "paymentTerminal": null       // <-- No terminal linked
}
```

## Implication
Even with SoftPOS code implemented (`SoftPosHandler.kt`, `TerminalType==99` routing), payments won't use the terminal unless the backend journal is configured with:
- `use_payment_terminal` = true
- `payment_terminal` linked to SoftPOS terminal record
- Terminal type matching the expected provider

## SoftPOS Routing Logic
From `HWSAndroidModule.kt`:
```kotlin
// Routes to SoftPosHandler when TerminalType==99
when (terminalType) {
    99 -> softPosExecutor.execute()
    // ... other terminal types
}
```

The terminal type comes from the journal's payment terminal configuration, not hardcoded.
