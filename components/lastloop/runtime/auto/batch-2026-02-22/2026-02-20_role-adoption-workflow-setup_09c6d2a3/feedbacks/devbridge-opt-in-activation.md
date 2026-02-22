# DevBridge Opt-In Activation

## Problem
The DevBridge client auto-connected on startup and retried every 3 seconds forever, scanning ports 7654-7664. When no bridge server was running (the common case), this created endless canceled `/bridge` requests visible in Chrome DevTools Network tab.

## Discovery Path
1. User (via Anton's Teams screenshot) showed repeated `/bridge` requests all with `(canceled)` status
2. Explored DevBridge.ts code — found 3-tier port discovery with infinite retry
3. Initially misunderstood as Odoo agent_bridge issue, then corrected to POS web app DevBridge
4. User rejected Playwright injection approach (wrong context)
5. User chose: 5-attempt exponential backoff + `--bridge=<port>` CLI flag

## Solution Implemented
- **Opt-in activation**: Bridge only connects when `__DEV_BRIDGE_PORT__ > 0` (set via `--bridge=<port>` or `.bridge-port` file)
- **No port scanning**: Removed 11-port range scan; connects directly to known port
- **Bounded retry**: 5 attempts with exponential backoff (0ms, 5s, 30s, 60s, 60s) instead of infinite 3s retry
- **Manual escape hatch**: `window.__startBridge()` always registered for console activation
- **Retry reset**: Counter resets on successful connection (handles server restarts)

## Files Changed
| File | Change |
|------|--------|
| `packages/shared/src/Utils/DevBridge/DevBridge.ts` | Core logic overhaul |
| `packages/web/vite.config.ts` | Added `--bridge=<port>` CLI arg parsing |

## Verbatim Code Snippets

### Before: Infinite retry
```typescript
const RECONNECT_INTERVAL = 3000;

function scheduleReconnect() {
    if (stopped || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
    }, RECONNECT_INTERVAL);
}
```

### After: Bounded exponential backoff
```typescript
const RETRY_DELAYS = [0, 5_000, 30_000, 60_000, 60_000];

function scheduleRetry() {
    if (stopped || retryTimer) return;
    if (retryIndex >= RETRY_DELAYS.length) {
        console.log("[DevBridge] No bridge server found after %d attempts. Reload or call window.__startBridge().", RETRY_DELAYS.length);
        return;
    }
    const delay = RETRY_DELAYS[retryIndex++];
    if (delay === 0) {
        connect();
    } else {
        retryTimer = setTimeout(() => {
            retryTimer = null;
            connect();
        }, delay);
    }
}
```

### Vite CLI arg parsing
```typescript
const bridgePort = (() => {
    // 1. CLI arg: npm start -- --bridge=7654
    const arg = process.argv.find((a) => a.startsWith("--bridge="));
    if (arg) return parseInt(arg.split("=")[1], 10) || 0;
    // 2. Fallback: .bridge-port file
    try {
        const portFile = path.resolve(rootDir, ".bridge-port");
        const data = JSON.parse(fs.readFileSync(portFile, "utf-8"));
        return data.port || 0;
    } catch {
        return 0;
    }
})();
```

## Usage
```bash
npm start                           # No bridge, zero network noise (default)
npm start -- --bridge=7654          # Activates bridge, connects to port 7654
window.__startBridge()              # Manual activation from browser console
```

## Result
- MR: !2582
- Commit: 4811c1d1a
- CI: All checks passed
- Zero network noise when no bridge server running
