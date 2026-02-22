# teams-filter-syntax-for-meeting-chats

## Effect
Successfully filtered chats to show only meeting chats using OData filter syntax.

## Observation
Initial filter attempt with `filter: "meeting"` failed with 400 error. Corrected to `filter: "chatType eq 'meeting'"` which returned only meeting-type chats.

## Verbatim — Failed attempt
```
Input: { "top": 50, "filter": "meeting" }
Output: Graph API 400: {"error":{"code":"BadRequest","message":"Invalid filter clause: Could not find a property named 'meeting' on type 'microsoft.graph.chat'."...}}
```

## Verbatim — Working filter
```
Input: { "top": 50, "filter": "chatType eq 'meeting'" }
Output: [meeting] demo — Clemens Grünberger
        [meeting] Roadmap — Sebastian Auer, Markus Zoglauer, ...
        [meeting] talk — Nell, Phillip C., Clemens Grünberger
        [meeting] Lagerstand Tortenwelt Status — Michael Zopp, ...
```

## Key Insight
Microsoft Graph API for chats uses OData `$filter` syntax. The `chatType` property accepts values: `oneOnOne`, `group`, `meeting`. Filter must be a valid OData expression, not a simple string.
