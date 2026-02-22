# manifest componentType Fix

**Context**: 5 manifest.json files were missing the required `componentType` field, triggering warnings at load time.

**Affected Files**:
| Source | Component | File |
|--------|-----------|------|
| oct-odoobridge | odoobridge | `components/odoobridge/manifest.json` |
| oct-odoobridge | odoo-overlay | `components/odoo-overlay/manifest.json` |
| oct-private | cullto | `components/cullto/manifest.json` |
| oct-private | teams-remote | `components/teams-remote/manifest.json` |
| oct-serve_onretailbe | onretail-be-dev | `components/onretail-be-dev/manifest.json` |

**Fix**: Added `"componentType": "tool"` after the `"name"` field in each manifest.

**Example**:
```json
{
  "name": "odoobridge",
  "componentType": "tool",
  "displayName": "Odoo Agent Bridge",
  ...
}
```

**Note**: All components under `components/` directory should have `"componentType": "tool"`. Agents under `agents/` directory should have `"componentType": "agent"`.
