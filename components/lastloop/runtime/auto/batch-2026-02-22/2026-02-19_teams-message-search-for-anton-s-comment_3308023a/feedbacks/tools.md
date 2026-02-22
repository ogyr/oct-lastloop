# Novel Tool Uses

## teams_search_messages Permission Issue
The `teams_search_messages` tool returned a 403 Forbidden despite the app having `Chat.ReadWrite` permission. The error message indicates the search endpoint requires additional permissions not currently granted. Workaround: use `teams_list_chats` + `teams_read_messages` to navigate to specific chats.

## GitLab API for Inline Discussion Replies
The `post_mr_reply.sh` script expects CI environment variables (`CI_PROJECT_ID`, `CI_MERGE_REQUEST_IID`) that aren't available locally. For local testing/replies, use the API directly:

```bash
printf '{"body": "..."}' | glab api -X POST \
  "projects/$PROJECT/merge_requests/$MR_IID/discussions/$DISCUSSION_ID/notes" \
  -H "Content-Type: application/json" \
  --input -
```

## GitLab MR Merge Status Staleness
GitLab's `detailed_merge_status` can report "conflict" even when there are no actual conflicts — it just means the merge check hasn't been computed. Force a recheck with an empty commit:
```bash
git commit --allow-empty -m "trigger pipeline recheck" && git push
```
