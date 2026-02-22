# Novel Tool Uses

## teams_list_chats with OData filter

Standard usage is `teams_list_chats({ top: N })`. This session used OData filter syntax:

```javascript
teams_list_chats({ top: 50, filter: "chatType eq 'meeting'" })
```

This is documented in Microsoft Graph API but not in the tool's internal documentation. The filter accepts OData expressions on the `chat` resource type.

**Valid filter properties:**
- `chatType` — values: `'oneOnOne'`, `'group'`, `'meeting'`
- `lastUpdatedDateTime` — for date-based filtering

## teams_search_messages — Permission limitation discovered

The search endpoint has stricter permission requirements than documented. Despite having `Chat.ReadWrite`, the search API returned 403. This suggests the Azure app registration may need additional scope configuration or the delegated permission flow isn't correctly applied for the search endpoint.

## Fallback pattern

When search fails, `teams_list_chats` with `top: 50` + manual filtering provides a workable alternative for finding specific chats.
