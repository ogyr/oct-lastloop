# Extraction Verifier — Knowledge Base

## Classification Rules Quick Reference

### `triedbutfailed/` — System/World Failures ONLY

**Must pass ALL:**
1. Approach was actually attempted (tool called, code run)
2. System/world rejected it (error, silent failure, architectural constraint)
3. Failure is inherent — would fail again the same way
4. User did NOT redirect before agent exhausted recovery options

**Redirection heuristic:** User redirected + agent had unexplored recovery options = `ideas/`, not `triedbutfailed/`.

### `ideas/` — Untested or Interrupted Approaches

Goes here when:
- User aborted/redirected before approach was fully explored
- External circumstance interrupted (device disconnected, network dropped)
- Agent hypothesized but never tried
- Approach was started but not completed for any non-system reason

### `feedbacks/` — Successful Observations/Changes

Must be:
- Non-trivial (not just "read a file", "ran grep")
- Effect-centric naming (named after what was observed, not the tool)
- Concrete example from the conversation

### `factoids/` — Non-Common-Knowledge Only

**Common Knowledge Gate:** Would a competent developer with general experience easily know this?
- YES → discard or don't extract
- NO → keep

**Sub-bucket rules:**
- `systems/` — specific to this repo, company (ETRON), product (onRetail), internal infrastructure, internal APIs, build system specifics
- `world/` — generally applicable: React Native, Expo, ADB, Sunmi SDK, WebView debugging, native bridging patterns, etc.

## Common Misclassification Patterns

### 1. User Redirection Disguised as System Failure
**Pattern:** Agent starts approach → hits initial obstacle → user says "stop, do X instead" → extractor sees the obstacle and classifies as `triedbutfailed/`.

**The tell:** Look for user messages between the obstacle and the next approach. If the user redirected, it's `ideas/` regardless of whether there was also a system error.

**Example from practice:** Agent tries WebView CDP on customer display → hits missing debug flag → user says "dont tackle customer display" → should be `ideas/` not `triedbutfailed/`.

### 2. External Circumstance as System Failure
**Pattern:** Device disconnects, network drops, build times out → extractor classifies as `triedbutfailed/`.

**The tell:** The failure isn't about the approach — it's about infrastructure. Would the approach work if retried under normal conditions? If yes → `ideas/`.

### 3. Common Knowledge Leaking into Factoids
**Pattern:** "You need to use `npx expo start` for Expo projects, not `npx react-native start`."

**The test:** Would a developer who's worked with Expo for a week know this? Probably yes. Unless there's a non-obvious twist (like the `--no-dev` flag silently disabling `__DEV__`), skip it.

### 4. Tool-Centric Naming in Feedbacks
**Pattern:** File named `bridge-js-eval-state-read.md` instead of `redux-state-inspection-via-bridge.md`.

**The test:** Does the filename tell you what was learned/observed, or just which tool was used? It should be the former.

### 5. Duplicate Knowledge Across Sections
**Pattern:** Same insight appears as a factoid AND in a triedbutfailed summary AND in a feedbacks observation.

**The fix:** Keep the most detailed version. Remove duplicates or add cross-references.

## Confidence Scoring

| Level | Meaning |
|-------|---------|
| **high** | Classification is unambiguous, verbatim verified, effect is clear |
| **medium** | Classification is defensible but borderline, or verbatim not fully verified |
| **low** | Classification could go either way, needs human review |

Assign confidence per file in the verification report. Anything scored `low` should include a note explaining the ambiguity.

## Cross-Consistency Checks

1. Every goal in `goals.md` should have at least one corresponding effect file (feedbacks/ or triedbutfailed/)
2. Every effect file should relate to at least one goal
3. Generated agent's KNOWLEDGE.md should not contradict factoids
4. `tools.md` novel uses should be a subset of feedbacks/ effects (every novel tool use produced an observable effect)
5. No orphaned files — every file should connect to the conversation narrative
