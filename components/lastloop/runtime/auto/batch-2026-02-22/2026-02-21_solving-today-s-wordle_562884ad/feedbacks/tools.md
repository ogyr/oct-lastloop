# Novel Tool Uses

## webfetch on NYT Wordle JSON API

**Standard use:** Fetching web page content
**Novel use:** Direct API endpoint discovery for game data

The agent discovered that `https://www.nytimes.com/svc/wordle/v2/{date}.json` returns the Wordle solution directly as JSON. This is an undocumented public API.

```json
{"id":2531,"solution":"awake","print_date":"2026-02-21","days_since_launch":1708,"editor":"Tracy Bennett"}
```

## playwright_browser_press_key for Game Input

**Standard use:** Single key press for shortcuts/navigation
**Novel use:** Sequential key presses for typing game guesses

Used to type 5-letter words in Wordle game:
- `playwright_browser_press_key` with `key: "s"` then `"l"`, `"a"`, `"t"`, `"e"`
- More efficient than clicking each virtual keyboard button individually
- Mimics natural gameplay behavior

## prune Tool for Context Management

**Standard use:** Not a standard tool in most contexts
**Novel use:** Agent autonomously pruned context to stay within token limits

The agent used the `prune` tool multiple times to remove completed tool outputs from context, saving ~19K tokens total throughout the session.
