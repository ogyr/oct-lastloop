# oct update Behavior

**Command**: `oct update`

**What It Does**:
1. Pulls latest version of the oct core repo (`.opencode/.oct/oct/`)
2. Pulls latest version of each source repo (`.opencode/.oct/sources/<name>/`)
3. Does NOT install or modify any project components

**Analogous To**: `apt update` — updates the package list, not the packages themselves.

**Critical Warning**: `oct update` runs git operations that can **overwrite uncommitted local changes** in source repos. Always commit before running `oct update`.

**Output Example**:
```
[oct] Already up to date at ebc07e0.
[oct-private] Already up to date at fbefa3d.
[oct-odoobridge] Already up to date at 733bc6a.
[oct-serve_onretailbe] Already up to date at 5c34023.
```

**After Updating**: Run `/oct` or `oct list` to see if new components are available.
