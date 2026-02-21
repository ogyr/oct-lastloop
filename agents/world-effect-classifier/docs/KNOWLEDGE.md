# World Effect Classifier — Knowledge Base

## Effect Categories

Effects fall into these broad categories. Use these as guidance for naming, not as rigid buckets:

| Category | Examples |
|----------|----------|
| **Hardware** | Printer output, customer display content, scanner input, NFC |
| **Device state** | Screen content, app lifecycle, installed APKs, running processes |
| **App state** | Redux state changes, navigation, saga execution, queue processing |
| **Native module** | Direct calls to Expo/RN native modules, their return values |
| **Network** | API calls, WebSocket connections, bridge connectivity |
| **Build/Deploy** | APK builds, Metro bundling, asset compilation, module installation |
| **File system** | Code changes, config edits, generated files |
| **Backend** | Odoo ORM operations, database changes, server-side state |

## Tool → Effect Mapping (Common Patterns)

| Tool | Typical OBSERVE effects | Typical CHANGE effects |
|------|------------------------|----------------------|
| `adb_check_screen` / `adb_screenshot` | Screen content, UI state | — |
| `adb_tap` / `adb_input` | — | UI interaction, navigation |
| `bridge_js_eval` (getState) | Redux state, config values | — |
| `bridge_js_eval` (dispatch) | — | State changes, saga triggers |
| `bridge_js_eval` (onr.hws.*) | Native module responses | Hardware activation |
| `bash` (logcat) | Native module execution, errors, lifecycle | — |
| `bash` (adb shell) | Device properties, process state | Device config |
| `bash` (gradle/npm) | Build output, errors | APK generation |
| `playwright_browser_snapshot` | DOM state, rendered content | — |
| `odoobridge_orm_*` | Database records, field values | Record creation/updates |
| `edit` / `write` | — | Source code changes |

## Distinguishing Success from Failure

An observation **succeeded** if:
- The tool returned meaningful data that answered the agent's question
- The agent used the result to make a decision or confirm a hypothesis
- The result was correct (even if unexpected)

An observation **failed** if:
- The tool errored (connection refused, device not found, timeout)
- The tool returned data but it was useless/misleading
- The tool returned success but the expected real-world effect didn't happen
- The agent had to abandon this approach and try something else

## Edge Cases

- **Silent failures** — a tool returns "OK" but nothing actually happened (e.g., Redux dispatch accepted but saga didn't process it). These go in `triedbutfailed/` with an explanation of why "OK" was misleading.
- **Partial success** — an approach worked after modification. The failed attempts go in `triedbutfailed/`, the final working version goes in `feedbacks/`.
- **Chain effects** — tool A enabled tool B which observed the actual effect. Document the final observation in `feedbacks/`, but mention the prerequisite chain in the approach/prerequisites.
