# CI Review Pipeline Diff Bug Fix

## Effect
Fixed a critical bug where the CI review agent was producing completely incorrect reviews because it used local `git diff origin/develop...HEAD` which produced wrong diffs when the `origin/develop` ref was stale or misresolved in the CI runner.

## Root Cause
In `.gitlab-ci.yml` review job:
- Line 41 in `cicd/review/prompt.txt`: `git diff origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME...HEAD`
- CI runner's `origin/develop` ref could be stale, missing, or point to wrong commit
- This caused MR !2578 (a small Sunmi display fix) to get a review about CI migration, Jenkins removal, Dockerfiles — completely unrelated changes

## Solution
Replaced all local `git diff` usage with GitLab API-based diffs:

1. **New script `cicd/scripts/get_mr_diff.sh`**:
   - Fetches MR diff via `glab api "projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/changes"`
   - Checks `overflow` flag for truncated diffs (fail-fast)
   - Outputs unified-diff format for agent consumption

2. **Updated `cicd/review/prompt.txt`**:
   - Changed step 3 from `git diff origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME...HEAD` to `bash cicd/scripts/get_mr_diff.sh`
   - Added explicit note: "from GitLab API — do NOT use local git diff"

3. **Updated `cicd/scripts/post_mr_discussion.sh`**:
   - Replaced local git diff line validation with API-based validation
   - Now fetches file diff from `/merge_requests/:iid/changes` endpoint

4. **Updated `.gitlab-ci.yml` review job**:
   - Added `merge_request_event` pipeline rule for reliable `CI_MERGE_REQUEST_IID`
   - Removed `git fetch origin $CI_MERGE_REQUEST_TARGET_BRANCH_NAME` (no longer needed)
   - Kept `GIT_DEPTH: 0` for agent's local git inspection needs

5. **Updated `cicd/review/opencode.json`**:
   - Added `get_mr_diff.sh` to bash whitelist

## Verbatim Code
```bash
# get_mr_diff.sh (lines 1-29)
#!/usr/bin/env bash
set -euo pipefail

# Fetch the MR diff via GitLab API — the authoritative source of truth.
# This avoids the local git-diff pitfall where a stale or missing
# origin/<target> ref produces a diff against the wrong base.

ENDPOINT="projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/changes"

RESPONSE="$(glab api "$ENDPOINT")"

# Check for truncated diff (GitLab sets overflow: true on very large MRs)
OVERFLOW="$(echo "$RESPONSE" | jq -r '.overflow // false')"
if [ "$OVERFLOW" = "true" ]; then
  echo "ERROR: GitLab reports the diff is truncated (overflow=true)." >&2
  echo "The MR is too large for a reliable automated review. Skipping." >&2
  exit 1
fi

# Heuristic: typical MRs touch <20 files; 80+ usually indicates a wrong
# base branch, an accidental mega-merge, or scope that should be split.
FILE_COUNT="$(echo "$RESPONSE" | jq '.changes | length')"
if [ "$FILE_COUNT" -gt 80 ]; then
  echo "WARNING: MR has $FILE_COUNT changed files — diff is unusually large." >&2
  echo "The review agent may struggle with this volume. Consider splitting the MR." >&2
fi

# Output a unified-diff-like format that the review agent can read
echo "$RESPONSE" | jq -r '.changes[] | "diff --git a/\(.old_path) b/\(.new_path)\n--- a/\(.old_path)\n+++ b/\(.new_path)\n\(.diff)"'
```

## Outcome
MR !2580 created, three review cycles completed with all feedback addressed. The API-based diff approach is now the single source of truth for MR reviews.
