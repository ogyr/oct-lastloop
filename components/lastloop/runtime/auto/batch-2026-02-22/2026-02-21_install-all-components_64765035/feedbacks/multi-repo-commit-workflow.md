# Multi-Repo Commit Workflow

**Context**: Changes spanned 4 independent git repos under `.opencode/.oct/`.

**Repos and Their Changes**:
1. **`oct`** (core) — `lib/registry.ts`, `test/registry.test.ts`
2. **`oct-private`** (source) — `components/cullto/manifest.json`, `components/teams-remote/manifest.json`
3. **oct-odoobridge`** (source) — `components/odoobridge/manifest.json`, `components/odoo-overlay/manifest.json`
4. **`oct-serve_onretailbe`** (source) — `components/onretail-be-dev/manifest.json`

**Workflow**:
1. Check git status in each repo: `git status --short`
2. Stage and commit in each repo separately
3. Push each repo to its remote

**Critical Order**: Must commit ALL changes BEFORE running `oct update`, or `oct update` will overwrite uncommitted local changes by pulling fresh from remotes.
