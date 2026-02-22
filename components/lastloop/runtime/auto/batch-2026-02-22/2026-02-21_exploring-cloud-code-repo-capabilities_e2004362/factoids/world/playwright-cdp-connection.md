# Playwright CDP Connection

## Context
Playwright can connect to an existing browser instance via Chrome DevTools Protocol (CDP), enabling shared browser scenarios.

## Connection Method
```javascript
const browser = await chromium.connectOverCDP('http://localhost:9222')
const context = browser.contexts()[0] // Use existing context
const page = context.pages()[0] // Use existing page
```

## Use Cases
1. **Collaborative browsing** — multiple actors (user + agent) share same browser
2. **Debugging automation** — attach Playwright to manually opened browser
3. **Remote browser control** — agent controls browser visible to user via WebRTC/VNC

## CDP Endpoint
When running Chrome with `--remote-debugging-port=9222`, the CDP endpoint is available at `http://localhost:9222`. Tools like Neko expose this for agent integration.
