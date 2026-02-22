# NYT Wordle API Exposure

## Effect
Discovered that NYT Wordle has a public JSON API that exposes the daily solution directly.

## URL Pattern
```
https://www.nytimes.com/svc/wordle/v2/{YYYY-MM-DD}.json
```

## Response Example
```json
{"id":2531,"solution":"awake","print_date":"2026-02-21","days_since_launch":1708,"editor":"Tracy Bennett"}
```

## Fields
- `id` - puzzle number
- `solution` - the answer word
- `print_date` - date string
- `days_since_launch` - total puzzles since Wordle began
- `editor` - current editor name

## Implication
No authentication required. The daily Wordle answer is publicly accessible via a simple GET request to this endpoint.

## Verbatim from convo.txt (lines 23-28)
```
Input: {
  "url": "https://www.nytimes.com/svc/wordle/v2/2026-02-21.json",
  "format": "text"
}
Output: {"id":2531,"solution":"awake","print_date":"2026-02-21","days_since_launch":1708,"editor":"Tracy Bennett"}
```
