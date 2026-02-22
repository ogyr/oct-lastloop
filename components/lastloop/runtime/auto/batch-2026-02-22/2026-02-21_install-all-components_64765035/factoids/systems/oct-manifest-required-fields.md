# OCT Manifest Required Fields

**File**: `.opencode/.oct/oct/lib/registry.ts` — `normalizeManifest()` function

**6 Required String Fields** (validated at load time, warn if missing/falsy):

| Field | Default Fallback |
|-------|------------------|
| `componentType` | `"tool"` |
| `displayName` | component name |
| `description` | `""` (empty string) |
| `version` | `"0.0.0"` |
| `maturity` | `"beta"` |
| `category` | `"uncategorized"` |

**Optional Fields** (silently defaulted to `[]`):
- `platforms`
- `dependencies`
- `envVars`
- `provides.tools`
- `provides.commands`
- `provides.skills`
- `provides.agents`
- `provides.plugins`

**Type Alias**: `"type"` is accepted as an alias for `"componentType"` (line 35-36).

**Interface** (`types.ts:11-31`):
```typescript
export interface ComponentManifest {
  name: string;
  componentType: "tool" | "agent";
  displayName: string;
  description: string;
  version: string;
  maturity: Maturity;  // "beta" | "rc" | "stable"
  category: string;
  provides: {
    tools: string[];
    commands: string[];
    mcp: string | null;
    skills: string[];
    agents: string[];
    plugins: string[];
    runtime: string | null;
  };
  dependencies?: string[];
  envVars?: EnvVarRequirement[];
  platforms?: string[];
}
```
