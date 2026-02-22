# oct Dependency Auto-Resolution

## Fact
The `oct install` command automatically resolves and installs transitive dependencies.

## Evidence
When installing `onretail-be-dev` and `teams-remote`:
```
Auto-added dependencies: oct-serve_onretailbe/oct-odoobridge/odoobridge, oct-private/oct-etron/teams
```

- `onretail-be-dev` depends on `odoobridge` → auto-added
- `teams-remote` depends on `teams` → auto-added

## Implication
No need to manually install dependencies before their dependents. A single batch install call handles the full dependency tree.
