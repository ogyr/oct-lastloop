# teams-odata-filter-syntax

## Fact
Microsoft Graph API for chats supports OData `$filter` query syntax via the `filter` parameter.

## Syntax
```
filter: "property operator 'value'"
```

## Valid Properties on chat resource
| Property | Type | Example |
|----------|------|---------|
| `chatType` | string | `chatType eq 'meeting'` |
| `lastUpdatedDateTime` | datetime | `lastUpdatedDateTime gt 2026-01-01T00:00:00Z` |

## Valid chatType values
- `'oneOnOne'` — direct message between two people
- `'group'` — group chat (not meeting)
- `'meeting'` — meeting chat

## Example
```javascript
teams_list_chats({ top: 50, filter: "chatType eq 'meeting'" })
```

## Common pitfall
Using a bare value like `filter: "meeting"` fails with 400 Bad Request. Must use full OData expression syntax.
