# Role Command Structure

The `/role` command in OpenCode injects a 4-step workflow for adopting specialist agent personas:

1. **Determine intent** from arguments:
   - Empty → list available roles
   - Single word → direct role name
   - Multiple words → task description, auto-select best matching role

2. **Get role details** via `roles` tool with the chosen name

3. **Read documentation** from `{path}/agents/{role}.md`, `{path}/docs/ROLE.md`, `{path}/docs/KNOWLEDGE.md`

4. **Adopt role** — use identity, follow workflows, obey rules, apply knowledge

The command explicitly states: "This is NOT OpenCode's agent system. You do not switch agents. You adopt the role's knowledge and workflows into YOUR current session."
