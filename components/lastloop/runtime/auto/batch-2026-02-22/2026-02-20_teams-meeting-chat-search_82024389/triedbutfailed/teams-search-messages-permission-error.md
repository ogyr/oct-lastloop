# teams-search-messages-permission-error

## Effect
`teams_search_messages` failed due to missing Microsoft Graph API permissions.

## Error
```
Graph API 403: {"error":{"code":"Forbidden","message":"Access to ChatMessage in Graph API requires the following permissions: Chat.Read or Chat.ReadWrite, ChannelMessage.Read.All. However, the application only has the following permissions granted: Calendars.Read, Calendars.ReadWrite, Chat.ReadWrite, Files.Read.All, Files.ReadWrite.All, Sites.Read.All, User.Read","target":"","httpCode":403}
```

## Root Cause
The tool's underlying Azure app registration has `Chat.ReadWrite` permission, but the `/search` endpoint requires either:
- `Chat.Read` or `Chat.ReadWrite` for **delegated** access (user context)
- `ChannelMessage.Read.All` for **application** access (app-only)

The error indicates a mismatch between the declared permissions and what the search endpoint accepts — likely a permission scope configuration issue in Azure AD.

## Recovery
Agent fell back to `teams_list_chats` with larger result set and OData filtering, which succeeded.

## Impact
Search functionality unavailable; users must rely on list+filter approach for finding chats.
