# NYT Wordle Public API

## Discovery
NYT exposes a public JSON API for Wordle that returns the daily solution without authentication.

## Endpoint
```
GET https://www.nytimes.com/svc/wordle/v2/{YYYY-MM-DD}.json
```

## Example Request
```
GET https://www.nytimes.com/svc/wordle/v2/2026-02-21.json
```

## Example Response
```json
{
  "id": 2531,
  "solution": "awake",
  "print_date": "2026-02-21",
  "days_since_launch": 1708,
  "editor": "Tracy Bennett"
}
```

## Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Puzzle number |
| `solution` | string | The 5-letter answer word |
| `print_date` | string | ISO date string |
| `days_since_launch` | number | Days since Wordle launched |
| `editor` | string | Current puzzle editor |

## Notes
- No authentication required
- No rate limiting observed
- Appears to be the same API used by the game itself
