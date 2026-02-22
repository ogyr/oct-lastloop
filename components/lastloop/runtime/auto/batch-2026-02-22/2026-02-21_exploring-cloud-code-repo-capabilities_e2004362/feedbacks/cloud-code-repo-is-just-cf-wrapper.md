# cloud-code repo is just CF wrapper

## Effect
Analyzed miantiao-me/cloud-code repo and determined it provides zero unique value for a custom web frontend. It's 100% Cloudflare-specific deployment glue.

## Evidence
From `src/container.ts`:
```typescript
export class AgentContainer extends Container {
  sleepAfter = '10m'
  defaultPort = PORT
  // ...
  async watchContainer() {
    const res = await this.containerFetch('http://container/global/event')
    // SSE monitoring for keep-alive
  }
}
```

The Dockerfile just runs:
```bash
opencode web --port 2633 --hostname 0.0.0.0
```

## What Actually Matters
OpenCode itself provides:
- `opencode web` — built-in browser UI + API
- `opencode serve` — headless API only
- `@opencode-ai/sdk` — type-safe JS client

## Verdict
Don't use cloud-code. Use OpenCode directly.
