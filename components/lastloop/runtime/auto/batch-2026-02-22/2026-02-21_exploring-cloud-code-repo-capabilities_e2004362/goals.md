# Goals

## User Goal
Understand capabilities of https://github.com/miantiao-me/cloud-code for running a web frontend connecting to an OpenCode instance. User suspected most of the repo was redundant but wanted to identify any useful components.

## Evolution
1. **Initial focus**: Cloud-code repo analysis for web frontend architecture
2. **Discovery**: Cloud-code is just Cloudflare deployment glue; OpenCode itself has all needed features
3. **Pivot**: User asked about streaming Playwright UI to another browser
4. **Refinement**: User clarified they want collaborative browser where agent and user both interact

## Final State
- Cloud-code repo deemed unnecessary (100% CF deployment wrapper)
- OpenCode's native `opencode web`, `opencode serve`, and `@opencode-ai/sdk` identified as the real value
- Neko recommended for collaborative agent+user browser interaction
- Unresolved questions: deployment location, agent framework specifics, concurrency model
