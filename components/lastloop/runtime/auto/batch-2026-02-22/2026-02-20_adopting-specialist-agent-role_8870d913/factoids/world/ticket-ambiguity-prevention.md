# Ticket Ambiguity Prevention

## Lesson from E-11757
A ticket titled "Serviceprodukt kann nicht hinterlegt werden" was misinterpreted as a `special_service` (Sonderleistung) issue when it actually referred to a regular `service` (Dienstleistung) product. An entire feature was implemented incorrectly and had to be reverted.

## Root Cause Analysis
1. Vague ticket description with missing details
2. Code analysis led to plausible but wrong interpretation
3. No user story or test cases provided
4. German terminology ambiguity ("Serviceprodukt" vs "Sonderleistung")

## Prevention Rules

1. **Vague tickets are blockers** — Do NOT start implementation until intent is unambiguous
2. **Code analysis can mislead** — Finding broken code doesn't mean that's what the ticket is about
3. **Reproduce first** — UI/flow bugs must be reproduced on a real device to understand user experience
4. **Request user story and test cases** — If `description_us` and `description_tc` are empty AND description is vague, explicitly request them
5. **Verify terminology** — Domain terms may have specific meanings that differ from code identifiers

## Action on Ambiguity
1. Set `kanban_state` to `blocked`
2. Post chatter comment with specific clarifying questions
3. Do NOT proceed to implementation

## Source
- Developer agent KNOWLEDGE.md from oct-private
- Incident E-11757
