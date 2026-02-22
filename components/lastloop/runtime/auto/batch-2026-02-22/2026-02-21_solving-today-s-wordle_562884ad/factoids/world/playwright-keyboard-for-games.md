# Playwright Keyboard Input for Browser Games

## Insight
When automating browser games (like Wordle) via Playwright, keyboard events work better than clicking UI elements.

## Why
1. **Efficiency:** One `press_key` call per letter vs. finding and clicking each button
2. **Realism:** Mimics how humans actually play
3. **Reliability:** Less dependent on UI element IDs/classes that may change

## Example: Typing a Word
```javascript
// Instead of clicking 5 separate buttons:
await page.getByRole('button', { name: 'add s' }).click();
await page.getByRole('button', { name: 'add l' }).click();
// ... etc

// Use keyboard events:
await page.keyboard.press('s');
await page.keyboard.press('l');
await page.keyboard.press('a');
await page.keyboard.press('t');
await page.keyboard.press('e');
await page.keyboard.press('Enter');
```

## Applicability
Any browser game or app that accepts keyboard input:
- Word games (Wordle, crossword puzzles)
- Typing games
- Games with keyboard controls
- Form inputs where typing is natural
