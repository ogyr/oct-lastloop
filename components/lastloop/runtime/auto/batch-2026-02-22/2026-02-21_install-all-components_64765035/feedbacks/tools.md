# Novel Tool Uses

## oct Tool Flow for "install all"

**Standard Usage**: `oct install <component-name>`

**Novel Pattern**: When user says "install all" or similar:
1. Call `oct list` to get all components with install status
2. Filter to show ONLY components NOT yet installed (no ✓ marker)
3. Present checkbox list via question tool
4. Pre-select components marked `recommended` or `REQUIRED`
5. Install selected components

**Code Path**:
```
"install all" 
  → oct list 
  → filter uninstalled 
  → question (multiple: true) 
  → oct install <comma-separated-qualified-names>
```

## Multi-Repo Git Workflow Pattern

**Pattern**: When edits span multiple independent git repos under `.opencode/.oct/`:
1. Check status in each repo: `git status --short` with different `workdir`
2. Make edits to each repo
3. Commit each repo separately (different commit messages appropriate to each)
4. Push each repo to its remote
5. Run `oct update` to verify sync

**Critical Order**: Commit ALL changes BEFORE `oct update` or lose work.
