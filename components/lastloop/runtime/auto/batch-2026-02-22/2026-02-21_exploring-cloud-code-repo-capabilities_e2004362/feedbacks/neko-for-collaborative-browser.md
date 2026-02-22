# Neko for collaborative browser

## Effect
Identified Neko as the best solution for shared collaborative browser where both AI agent and human user can interact with the same page simultaneously.

## Architecture
```
User's browser ──WebRTC──→ Neko container (Chromium + Xvfb + PulseAudio)
                                  ↑
Agent (Playwright) ──CDP──────────┘  (connects to same Chromium instance)
```

## Why Neko
- WebRTC streaming (~50ms latency)
- Full interactive control (mouse, keyboard, clipboard)
- Multi-user support (pass control between users)
- Embeddable client library

## Key Integration Point
Playwright can connect to Neko's Chromium via:
```javascript
const browser = await chromium.connectOverCDP(endpoint)
```

Both user (via WebRTC) and agent (via CDP) interact with the same browser instance.

## Alternatives Considered
| Solution | Latency | Interactive |
|----------|---------|-------------|
| Neko | ~50ms | Full |
| noVNC | ~100-200ms | Full but clunkier |
| CDP screencast | ~200ms+ | Requires custom input bridge |
