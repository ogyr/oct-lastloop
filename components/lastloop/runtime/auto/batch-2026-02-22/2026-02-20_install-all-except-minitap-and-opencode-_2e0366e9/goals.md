# Goals

## User Goal
Install all available oct components except `minitap` and `opencode-driver`.

## Agent Goal
Execute batch install via `oct install` with explicit component list, bypassing interactive selection.

## Evolution
1. User provided explicit exclusion criteria (all except minitap and opencode-driver)
2. Agent listed components to identify full set, then calculated 15 to install
3. Single batch install call with comma-separated qualified names

## Final State
- **Achieved**: All 15 components installed successfully
- **Dependencies auto-resolved**: `odoobridge` and `teams` added automatically as transitive deps
- **Pending**: User must configure required env vars (GITLAB_ACCESS_TOKEN, GITBOOK_API_TOKEN, etc.)
