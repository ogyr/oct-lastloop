# OpenCode Server API Surface

## Context
OpenCode's server exposes a comprehensive HTTP API. The TUI is just a client that talks to this server.

## Key Endpoints

### Global
- `GET /global/health` — health check
- `GET /global/event` — SSE stream of all events

### Sessions
- `POST /session` — create session
- `POST /session/:id/message` — sync prompt
- `POST /session/:id/prompt_async` — async prompt
- `POST /session/:id/command` — execute slash command
- `POST /session/:id/shell` — run shell command
- `POST /session/:id/abort` — cancel running session

### Files
- `GET /find?pattern=` — search code
- `GET /file/content?path=` — read file
- `GET /file/status` — git status

### TUI Control
- `POST /tui/append-prompt` — prefill prompt
- `POST /tui/submit-prompt` — submit current prompt
- `POST /tui/execute-command` — run command

## Auth
Set `OPENCODE_SERVER_PASSWORD` (and optionally `OPENCODE_SERVER_USERNAME`) env var for HTTP Basic Auth.

## SDK
`@opencode-ai/sdk` provides type-safe client. Types generated from OpenAPI spec at `/doc`.
