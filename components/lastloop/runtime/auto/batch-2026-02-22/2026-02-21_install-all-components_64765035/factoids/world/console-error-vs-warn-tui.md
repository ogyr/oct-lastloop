# console.error vs console.warn in TUI

**Observation**: In OpenCode TUI (and most terminals):
- `console.error()` writes to **stderr** → shows **red**
- `console.warn()` writes to **stdout** → shows **yellow**

**Implication**: For non-fatal warnings that shouldn't alarm users, use `console.warn()` not `console.error()`.

**General Principle**: Reserve `console.error()` for actual errors that may require user intervention or indicate a failure condition. Use `console.warn()` for informational warnings about degraded-but-functional behavior.

**Example from OCT**:
```typescript
// Wrong: non-fatal warning shows red (alarming)
console.error(`⚠ Component "${label}": manifest.json is missing fields...`);

// Right: non-fatal warning shows yellow (informational)
console.warn(`⚠ Component "${label}": manifest.json is missing fields...`);
```
