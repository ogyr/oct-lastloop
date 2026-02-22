# Verification Report

## triedbutfailed/ audit

### teams-search-messages-permission-error.md
- ✅ Error is verbatim from convo.txt (lines 215)
- ✅ Root cause analysis is accurate: permission mismatch for search endpoint
- ✅ Recovery documented (fallback to list+filter)
- **PASS** — Meets strict test: failed due to system/world behavior (API permissions), not user redirection

## ideas/ audit

### teams-comms-role-fallback.md
- ✅ Event sequence matches convo.txt (lines 340-357, 387-441)
- ✅ Correctly classified: not a system failure, but a cross-repo path reference issue
- ✅ Agent recovered and completed task without the role
- **PASS** — User didn't redirect; agent adapted and proceeded

## feedbacks/ audit

### teams-chat-lookup-via-list.md
- ✅ Verbatim quote matches convo.txt (line 105-106)
- ✅ Observation about umlaut transliteration is accurate

### teams-filter-syntax-for-meeting-chats.md
- ✅ Failed filter verbatim matches lines 230-232
- ✅ Working filter verbatim matches lines 249-267
- ✅ OData syntax explanation is correct

### loi-draft-sent-to-teams.md
- ✅ Message sent confirmation matches line 536
- ✅ Content structure accurately summarized from the message

### tools.md
- ✅ OData filter pattern is novel (not standard tool usage)
- ✅ Permission limitation discovery is documented from actual error

## factoids/ audit (common knowledge gate)

### systems/roles-tool-cross-repo-path.md
- ✅ **NOT common knowledge** — Specific to this codebase's roles tool configuration
- ✅ Verifiable from convo.txt (lines 389-417)

### world/teams-self-chat-id.md
- ⚠️ **Borderline** — Some Teams developers know this, but it's not widely documented
- ✅ Keeps — useful enough, not obvious from standard docs

### world/teams-odata-filter-syntax.md
- ✅ **NOT common knowledge** — The filter parameter supports OData syntax, but this isn't in the tool's inline docs
- ✅ Specific syntax examples are valuable

### world/teams-umlaut-transliteration.md
- ✅ **NOT common knowledge** — Teams-specific behavior, not general knowledge
- ✅ Practical value for German-speaking orgs

## Summary

| Category | Count | Status |
|----------|-------|--------|
| feedbacks/ | 4 | ✅ All verified |
| triedbutfailed/ | 1 | ✅ Passes strict test |
| ideas/ | 1 | ✅ Correctly classified |
| factoids/systems/ | 1 | ✅ Passes gate |
| factoids/world/ | 3 | ✅ Pass gate (1 borderline) |

## Issues Found
None. All extractions verified against source conversation.
