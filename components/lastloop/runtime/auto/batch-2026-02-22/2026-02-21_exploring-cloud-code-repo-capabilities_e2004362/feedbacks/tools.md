# Tools

## Novel/Unexpected Tool Uses

### webfetch for raw GitHub content
Used `webfetch` with `format: "text"` to retrieve raw source files directly from `raw.githubusercontent.com` URLs. This bypasses the GitHub HTML UI and gets clean source code.

Example:
```
url: "https://raw.githubusercontent.com/miantiao-me/cloud-code/master/src/container.ts"
format: "text"
```

### webfetch for OpenCode docs
Used `webfetch` with `format: "markdown"` to pull documentation pages. The OpenCode docs site returns clean markdown that can be parsed directly.

### distill tool for context pruning
The agent used the `distill` tool to compress multiple webfetch outputs into distilled summaries, saving ~26K tokens. This is a DCP (Dynamic Context Pruning) feature.
