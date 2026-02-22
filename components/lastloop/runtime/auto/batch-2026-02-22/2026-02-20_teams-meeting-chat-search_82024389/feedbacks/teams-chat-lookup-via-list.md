# teams-chat-lookup-via-list

## Effect
Successfully located Jürgen Gächter's 1:1 chat using `teams_list_chats` with `top: 50`.

## Observation
The chat appeared as the most recent item with display name "Gaechter Juergen" (German spelling without umlaut). The search was for a "meeting chat" but only a 1:1 chat existed.

## Key Insight
Teams chat display names use ASCII transliteration for umlauts (Gächter → Gaechter). The `teams_list_chats` output shows the normalized name, not the original spelling.

## Verbatim
```
[oneOnOne] (no topic) — Gaechter Juergen, Clemens Grünberger
  ID: 19:2c532aa6-aa86-4376-be20-68831bd346e5_99d70028-13b5-47e1-8e03-014b229331d6@unq.gbl.spaces
```
