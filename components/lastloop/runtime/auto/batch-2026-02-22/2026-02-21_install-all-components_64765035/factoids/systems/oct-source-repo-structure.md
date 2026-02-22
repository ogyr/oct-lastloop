# OCT Source Repo Structure

**Location**: `.opencode/.oct/sources/<source-name>/`

**Directory Layout**:
```
sources/
├── oct-private/
│   ├── registry.json         # Lists components and agents
│   ├── components/
│   │   ├── glab/
│   │   │   ├── manifest.json
│   │   │   ├── tools/
│   │   │   └── commands/
│   │   └── cullto/
│   └── agents/
│       └── oct-dev/
│           ├── manifest.json
│           └── agents/
├── oct-odoobridge/
│   ├── registry.json
│   └── components/
│       ├── odoobridge/
│       └── odoo-overlay/
└── oct-serve_onretailbe/
    ├── registry.json
    └── components/
        └── onretail-be-dev/
```

**registry.json Format**:
```json
{
  "version": "1.0.0",
  "components": ["glab", "adb", ...],
  "agents": ["developer", "oct-dev", ...]
}
```

**Component Types by Directory**:
- `components/` → tools (should have `componentType: "tool"`)
- `agents/` → agent roles (should have `componentType: "agent"`)

**Multiple Independent Repos**: Each source is an independent git repo with its own remote. Changes must be committed and pushed per-repo.
