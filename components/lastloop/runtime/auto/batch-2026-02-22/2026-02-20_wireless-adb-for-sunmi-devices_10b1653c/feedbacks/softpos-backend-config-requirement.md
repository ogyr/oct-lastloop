# SoftPOS Backend Configuration Requirement

## Effect
Card payment completed instantly without SoftPOS terminal prompt because the EC journal wasn't configured with a payment terminal on the backend.

## Problem
When selecting "EC Kartenlesegerät" (card reader) as payment method and completing checkout:
- Receipt printed immediately
- No terminal prompt appeared on the Sunmi
- No NFC/card reading interaction

## Root Cause
The journal's `paymentTerminal` field was `null`:
```javascript
// From bridge state inspection
{
  "id": 2,
  "name": "EC Kartenlesegerät",
  "type": "bank",
  "usePaymentTerminal": false,  // <-- Should be true
  "paymentTerminal": null        // <-- Should be SoftPOS terminal config
}
```

The SoftPOS integration routes via `TerminalType==99`, but the journal needs:
1. `use_payment_terminal` = true (or specific terminal provider)
2. `payment_terminal` = configured terminal record
3. Terminal type set to SoftPOS provider

## Solution (Backend Config)
In Odoo backend:
1. Go to POS Config → Journals
2. Open "EC Kartenlesegerät" journal
3. Set "Use Payment Terminal" to SoftPOS provider
4. Link to payment terminal device
5. Set terminal type to 99 (SoftPOS)

## Code Side (Already Done)
The SoftPOS handler is implemented:
- `SoftPosHandler.kt` — Routes payments when TerminalType==99
- `HWSAndroidModule.kt` — Conditional routing to SoftPOS
- Build gated on `JFROG_USER` env var for PhonePos SDK

## Verification
Check via JS bridge:
```javascript
onr.find("paymentTerminal")
// Should return terminal config, not null
```
