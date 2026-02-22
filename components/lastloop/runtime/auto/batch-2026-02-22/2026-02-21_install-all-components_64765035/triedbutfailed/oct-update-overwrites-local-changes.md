# oct update Overwrites Local Changes

**What Happened**: After making edits to registry.ts, test files, and manifests, ran `oct update`. This pulled fresh copies from remotes and **overwrote all uncommitted local changes**.

**Root Cause**: `oct update` runs `git pull` (or equivalent) on each source repo. Uncommitted local changes are lost when the remote has the same or newer commits.

**Solution**: Always commit changes BEFORE running `oct update`. The correct order is:
1. Make edits
2. `git status` to verify
3. `git add` + `git commit` 
4. `git push`
5. THEN `oct update` is safe (will just say "Already up to date")

**Evidence from Conversation**:
```
> All four repos show no changes — `git status` is clean in all of them. 
> This means the `oct update` that just ran pulled fresh copies and overwrote our local changes.
> We need to re-apply all the changes.
```

**Detection**: `git status --short` returning empty after edits = changes were lost.
