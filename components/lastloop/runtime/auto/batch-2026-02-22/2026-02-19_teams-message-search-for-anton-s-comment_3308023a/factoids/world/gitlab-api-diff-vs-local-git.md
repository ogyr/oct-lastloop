# GitLab MR Diff API vs Local Git Diff

## Fact
The GitLab `/merge_requests/:iid/changes` API endpoint is the authoritative source for MR diffs. Using local `git diff` in CI pipelines can produce wrong diffs when:
- The shallow clone depth is insufficient
- Remote refs haven't been fetched
- The target branch ref is stale

## Evidence
MR !2578 (a small Sunmi display fix) received a review about CI migration, Jenkins removal, Dockerfiles, and `.gitattributes` — completely unrelated to the actual changes. The CI review agent used `git diff origin/develop...HEAD` but the `origin/develop` ref was stale in the runner.

## Key Insight
The `overflow` flag in the API response indicates when GitLab has truncated the diff (very large MRs). This should be checked to avoid silently operating on incomplete diff data.

## Code Pattern
```bash
# Correct: Use API
RESPONSE="$(glab api "projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/changes")"
OVERFLOW="$(echo "$RESPONSE" | jq -r '.overflow // false')"

# Incorrect: Local git diff in CI
git diff origin/develop...HEAD  # May produce wrong diff
```
