# OpenCode has native web server

## Effect
Discovered OpenCode has built-in web capabilities that make cloud-code redundant.

## Key Features

### `opencode web`
- Starts HTTP server with built-in browser UI + full API
- `--hostname 0.0.0.0` for network exposure
- `--port <N>` for specific port
- `--cors <origin>` for cross-origin access
- `OPENCODE_SERVER_PASSWORD` / `OPENCODE_SERVER_USERNAME` for Basic Auth

### `opencode serve`
- Headless API only (no built-in UI)
- OpenAPI 3.1 spec at `/doc`
- SSE event stream at `/event`

### `@opencode-ai/sdk`
```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"
const client = createOpencodeClient({ baseUrl: "http://localhost:4096" })
await client.session.prompt({ path: { id: sessionId }, body: { parts: [...] } })
```

## Evidence
From OpenCode docs:
> The `opencode serve` command runs a headless HTTP server that exposes an OpenAPI endpoint that an opencode client can use.
