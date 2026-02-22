# Batch Install with Explicit Exclusions

## Context
User wanted to install all oct components except specific ones (minitap, opencode-driver).

## Approach
1. Run `oct list` to get full component catalog
2. Filter out excluded components programmatically
3. Build comma-separated qualified names string for batch install

## Verbatim Command
```
oct install oct-private/glab,oct-private/adb,oct-private/bridge,oct-private/playwright,oct-private/gitbook,oct-private/odoo,oct-private/teams,oct-private/onenote,oct-private/open-url,oct-private/commit,oct-private/cullto,oct-private/teams-remote,oct-odoobridge/odoobridge,oct-odoobridge/odoo-overlay,oct-serve_onretailbe/onretail-be-dev
```

## Outcome
- All 15 components installed successfully in single call
- Dependencies auto-added: `odoobridge` (for onretail-be-dev), `teams` (for teams-remote)
- No failures, no retries needed

## Key Insight
When exclusions are explicit, skip interactive checkbox selection and go straight to batch install with qualified names. This is faster and requires no user interaction.
