# teams-self-chat-id

## Fact
Microsoft Teams has a hardcoded chat ID for self-chat (notes to self): `48:notes`

## Usage
```javascript
teams_send_message({ chat_id: "48:notes", message: "Note to self" })
```

## Note
This chat ID does not appear in `teams_list_chats` output. It's a reserved Teams constant.
