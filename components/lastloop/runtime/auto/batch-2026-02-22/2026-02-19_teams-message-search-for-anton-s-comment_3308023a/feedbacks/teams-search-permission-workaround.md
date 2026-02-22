# Teams Search API Permission Issue

## Effect
`teams_search_messages` tool failed with 403 Forbidden error despite having `Chat.ReadWrite` permission. Had to use fallback approach of listing chats and reading messages individually.

## Error Details
```
Graph API 403: {"error":{"code":"Forbidden","message":"Access to ChatMessage in Graph API requires the following permissions: Chat.Read or Chat.ReadWrite, ChannelMessage.Read.All. However, the application only has the following permissions granted: Calendars.Read, Chat.ReadWrite, Sites.Read.All, User.Read"}}
```

## Workaround
Used `teams_list_chats` to get chat IDs, then `teams_read_messages` to read specific chats. This approach works because the read endpoints have different permission requirements than the search endpoint.

## Verbatim
```
[TOOL: teams_search_messages] (completed)
Input: {
  "query": "anton reviewer MR",
  "top": 10
}
Output: Failed to search: Graph API 403...
```

## Outcome
Successfully found Anton's message in group chat via the fallback approach.
