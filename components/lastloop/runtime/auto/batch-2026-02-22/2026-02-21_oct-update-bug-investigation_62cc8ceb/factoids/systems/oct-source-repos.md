# OCT Source Repo Locations

## Key Insight
OCT source repos are separate git repos cloned into `.opencode/.oct/sources/<source-name>/`. Changes must be committed IN THOSE REPOS, not in the main project repo.

## Directory Structure
```
.opencode/
├── commands/              # Installed commands (managed by oct)
├── tools/                 # Installed tools (managed by oct)
└── .oct/
    ├── bin/oct            # CLI wrapper script
    ├── oct/               # OCT core repo (ogyr/oct)
    ├── sources/           # Source repos (cloned)
    │   ├── oct-etron/     # Main ETRON components
    │   ├── oct-private/   # Private components + agents
    │   └── oct-odoobridge/
    ├── state/installed.json
    └── logs/
```

## Where to Make Changes

| What | Where | Remote |
|------|-------|--------|
| OCT core (installer) | `.opencode/.oct/oct/` | `git@github.com-ogyr:ogyr/oct.git` |
| oct-private components | `.opencode/.oct/sources/oct-private/` | `https://github.com/ogyr/oct-tools.git` |
| oct-etron components | `.opencode/.oct/sources/oct-etron/` | (varies) |

## After Making Changes
1. Commit in the source repo
2. Push to remote
3. Run `oct update <source>` to pull and reinstall

## Warning
The `.oct/` directory is gitignored in the main project repo. Edits there are NOT tracked by the main project's git.
