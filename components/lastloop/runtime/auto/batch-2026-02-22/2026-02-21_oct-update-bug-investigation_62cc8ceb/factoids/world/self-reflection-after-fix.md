# Self-Reflection After Fix

## Key Insight
After completing a fix, asking "what could have been better?" reveals gaps that would otherwise go unaddressed.

## What the Agent Missed on First Pass

1. **Didn't investigate the trigger** — The `backend-dev` manifest was broken, but the agent only fixed the symptom (crash), not the cause (broken manifest).

2. **Didn't consider UX** — Silent defaulting produces garbage output (`vundefined [undefined]`). A better approach is to warn users something is wrong.

3. **Didn't push** — Left the commit local, risking overwrite on next `oct update`.

4. **Didn't test** — Didn't run existing tests to verify no breakage, didn't add new tests.

5. **Didn't consider alternative designs** — Normalize vs. validate vs. reject.

## The Prompt That Helped
> "think about what you just did and if that could have been made better"

This triggered a systematic review that identified 6 gaps, leading to:
- Running existing tests (92 pass)
- Adding validation warnings
- Adding 6 new test cases
- Fixing the broken manifest
- Pushing both repos

## Lesson
A brief self-reflection phase after "done" catches issues that would otherwise require follow-up work.
