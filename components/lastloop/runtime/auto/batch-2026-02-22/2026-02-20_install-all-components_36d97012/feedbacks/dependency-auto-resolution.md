# oct install auto-resolves dependencies

## Effect
When installing components that have dependencies, oct automatically adds the required components.

## Evidence
```
Output: Auto-added dependencies: oct-serve_onretailbe/oct-odoobridge/odoobridge, oct-private/oct-etron/teams
Installed: oct-serve_onretailbe/onretail-be-dev
Installed: oct-private/teams-remote
```

## Behavior
- `onretail-be-dev` depends on `odoobridge` → auto-added
- `teams-remote` depends on `teams` → auto-added (teams was already installed)
- No user intervention required for dependency resolution
