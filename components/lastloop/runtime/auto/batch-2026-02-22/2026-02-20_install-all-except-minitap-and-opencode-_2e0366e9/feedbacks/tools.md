# Novel Tool Uses

## prune Tool

**Observed use:** Agent called `prune` tool with `ids: [0, 1]` after successful install to remove verbose tool outputs from context.

**Output:**
```
Context pruning complete. Pruned 2 tool outputs.
Semantically pruned (2):
→ oct: {"args":"list"}
→ oct: {"args":"install oct-private/glab,oct-private/adb,
```

**Purpose:** Reduces token usage by removing large, completed tool outputs that are no longer needed for the conversation.

**When to use:** After completing multi-step operations that generated verbose outputs, especially when the task is essentially complete and only a summary matters.
