#!/usr/bin/env bun
/**
 * Tests for extract.ts — the conversation extraction script.
 * Run with: bun test components/lastloop/test/extract.test.ts
 *
 * Uses a temporary SQLite DB with synthetic session data to test
 * argument parsing, workspace management, session resolution, and output formatting.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Database } from "bun:sqlite";
import { existsSync, readFileSync, rmSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const SCRIPT = resolve(import.meta.dir, "../runtime/extract.ts");
const TMP_DIR = join(import.meta.dir, "fixtures", "tmp_test_run");
const TEST_DB_DIR = join(TMP_DIR, ".local", "share", "opencode");
const TEST_DB = join(TEST_DB_DIR, "opencode.db");

// --- Test fixtures ---
const TEST_SESSION_ID = "ses_test_abc123";
const TEST_SESSION_TITLE = "Test conversation about widgets";
const TEST_PROJECT_ID = "proj_test_xyz";
const OTHER_PROJECT_ID = "proj_other_456";

// Helper to run extract.ts with custom DB path
async function runExtract(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const proc = Bun.spawn(
        ["bun", SCRIPT, ...args],
        {
            cwd: TMP_DIR,
            env: {
                ...process.env,
                HOME: TMP_DIR,
                LASTLOOP_AUTO_DIR: join(TMP_DIR, "auto"),
            },
            stdout: "pipe",
            stderr: "pipe",
        },
    );
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    return { stdout, stderr, exitCode };
}

// --- Setup / Teardown ---

beforeAll(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DB_DIR, { recursive: true });

    const db = new Database(TEST_DB);
    db.run("PRAGMA journal_mode=WAL");

    db.run(`CREATE TABLE IF NOT EXISTS project (id TEXT PRIMARY KEY, worktree TEXT, name TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS session (id TEXT PRIMARY KEY, project_id TEXT, parent_id TEXT, directory TEXT, title TEXT, time_created INTEGER, time_updated INTEGER, time_archived INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS message (id TEXT PRIMARY KEY, session_id TEXT, time_created INTEGER, time_updated INTEGER, data TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS part (id TEXT PRIMARY KEY, message_id TEXT, session_id TEXT, time_created INTEGER, time_updated INTEGER, data TEXT)`);

    const now = Date.now();

    // Two projects
    db.run(`INSERT INTO project VALUES (?, ?, ?)`, [TEST_PROJECT_ID, TMP_DIR, "test-project"]);
    db.run(`INSERT INTO project VALUES (?, ?, ?)`, [OTHER_PROJECT_ID, "/other/project", "other-project"]);

    // Main session (current project)
    db.run(`INSERT INTO session VALUES (?, ?, NULL, ?, ?, ?, ?, NULL)`,
        [TEST_SESSION_ID, TEST_PROJECT_ID, TMP_DIR, TEST_SESSION_TITLE, now, now]);

    // Older session (current project)
    db.run(`INSERT INTO session VALUES (?, ?, NULL, ?, ?, ?, ?, NULL)`,
        ["ses_older", TEST_PROJECT_ID, TMP_DIR, "Older session", now - 86400000, now - 86400000]);

    // Third session (current project, oldest)
    db.run(`INSERT INTO session VALUES (?, ?, NULL, ?, ?, ?, ?, NULL)`,
        ["ses_oldest", TEST_PROJECT_ID, TMP_DIR, "Oldest session", now - 172800000, now - 172800000]);

    // Session in other project
    db.run(`INSERT INTO session VALUES (?, ?, NULL, ?, ?, ?, ?, NULL)`,
        ["ses_other_proj", OTHER_PROJECT_ID, "/other/project", "Other project session", now - 43200000, now - 43200000]);

    // Archived session (should be excluded from normal --list)
    db.run(`INSERT INTO session VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
        ["ses_archived", TEST_PROJECT_ID, TMP_DIR, "Archived session", now - 3600000, now - 3600000, now]);

    // Child/subagent session
    db.run(`INSERT INTO session VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
        ["ses_child_1", TEST_PROJECT_ID, TEST_SESSION_ID, TMP_DIR, "Subagent task", now + 1000, now + 1000]);

    // Messages + parts for main session
    const msg1 = "msg_user_1";
    const msg2 = "msg_asst_1";
    db.run(`INSERT INTO message VALUES (?, ?, ?, ?, ?)`,
        [msg1, TEST_SESSION_ID, now, now, JSON.stringify({ role: "user" })]);
    db.run(`INSERT INTO message VALUES (?, ?, ?, ?, ?)`,
        [msg2, TEST_SESSION_ID, now + 500, now + 500, JSON.stringify({ role: "assistant", agent: "build", model: { modelID: "claude-opus-4-6" } })]);

    db.run(`INSERT INTO part VALUES (?, ?, ?, ?, ?, ?)`,
        ["p1", msg1, TEST_SESSION_ID, now, now, JSON.stringify({ type: "text", text: "Help me fix the widget" })]);
    db.run(`INSERT INTO part VALUES (?, ?, ?, ?, ?, ?)`,
        ["p2", msg2, TEST_SESSION_ID, now + 500, now + 500, JSON.stringify({ type: "text", text: "I'll look at the widget code." })]);
    db.run(`INSERT INTO part VALUES (?, ?, ?, ?, ?, ?)`,
        ["p3", msg2, TEST_SESSION_ID, now + 600, now + 600, JSON.stringify({
            type: "tool", tool: "read",
            state: { status: "completed", input: { filePath: "/src/widget.ts" }, output: "const x = 1;" }
        })]);
    db.run(`INSERT INTO part VALUES (?, ?, ?, ?, ?, ?)`,
        ["p4", msg2, TEST_SESSION_ID, now + 700, now + 700, JSON.stringify({
            type: "step-finish", cost: 0.05, tokens: { input: 1000, output: 200 }
        })]);

    // Subagent message
    db.run(`INSERT INTO message VALUES (?, ?, ?, ?, ?)`,
        ["msg_c1", "ses_child_1", now + 1000, now + 1000, JSON.stringify({ role: "assistant" })]);
    db.run(`INSERT INTO part VALUES (?, ?, ?, ?, ?, ?)`,
        ["pc1", "msg_c1", "ses_child_1", now + 1000, now + 1000, JSON.stringify({ type: "text", text: "Found the issue in widget.ts" })]);

    db.close();
});

afterAll(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
});

// --- Tests ---

describe("help and usage", () => {
    test("no args shows help", async () => {
        const result = await runExtract([]);
        expect(result.stdout).toContain("Usage:");
        expect(result.stdout).toContain("--list");
        expect(result.stdout).toContain("--list_all");
        expect(result.stdout).toContain("--list_workspaces");
        expect(result.stdout).toContain("-w NAME");
    });

    test("--help shows help", async () => {
        const result = await runExtract(["--help"]);
        expect(result.stdout).toContain("Usage:");
    });
});

describe("--list (without workspace)", () => {
    test("lists sessions from current project", async () => {
        const result = await runExtract(["--list"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain(TEST_SESSION_TITLE);
        expect(result.stdout).toContain("Older session");
    });

    test("shows numbered sessions", async () => {
        const result = await runExtract(["--list"]);
        expect(result.exitCode).toBe(0);
        // Should have numbered entries like #1, #2, #3
        expect(result.stdout).toMatch(/#?\s*1\b/);
        expect(result.stdout).toMatch(/#?\s*2\b/);
    });

    test("excludes subagent sessions", async () => {
        const result = await runExtract(["--list"]);
        expect(result.stdout).not.toContain("Subagent task");
    });

    test("excludes archived sessions", async () => {
        const result = await runExtract(["--list"]);
        expect(result.stdout).not.toContain("Archived session");
    });

    test("excludes other project sessions", async () => {
        const result = await runExtract(["--list"]);
        expect(result.stdout).not.toContain("Other project session");
    });

    test("--limit restricts count", async () => {
        const result = await runExtract(["--list", "--limit", "1"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain(TEST_SESSION_TITLE);
        // Should not contain the oldest session if limit is 1
        expect(result.stdout).not.toContain("Oldest session");
    });
});

describe("--list_all", () => {
    test("lists sessions from ALL projects", async () => {
        const result = await runExtract(["--list_all"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain(TEST_SESSION_TITLE);
        expect(result.stdout).toContain("Other project session");
    });

    test("shows numbered sessions", async () => {
        const result = await runExtract(["--list_all"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toMatch(/#?\s*1\b/);
    });

    test("--limit restricts count", async () => {
        const result = await runExtract(["--list_all", "--limit", "2"]);
        expect(result.exitCode).toBe(0);
        // Should have at most 2 sessions
        expect(result.stdout).not.toContain("Oldest session");
    });
});

describe("--list_workspaces", () => {
    test("lists no workspaces initially", async () => {
        const result = await runExtract(["--list_workspaces"]);
        expect(result.exitCode).toBe(0);
        // No workspaces created yet in this clean test run
        expect(result.stdout).toContain("Workspaces");
    });

    test("shows workspace after creation", async () => {
        // Create a workspace first
        await runExtract(["-w", "test-ws-list", "--create", TEST_SESSION_ID]);
        const result = await runExtract(["--list_workspaces"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("test-ws-list");
    });
});

describe("workspace management", () => {
    test("requires --create for new workspace", async () => {
        const result = await runExtract(["-w", "nonexistent"]);
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("does not exist");
        expect(result.stderr).toContain("--create");
    });

    test("--create creates new workspace", async () => {
        const result = await runExtract(["-w", "test-ws-new", "--create", TEST_SESSION_ID]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("Created workspace: test-ws-new");
    });

    test("existing workspace works without --create", async () => {
        const result = await runExtract(["-w", "test-ws-new", TEST_SESSION_ID]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).not.toContain("Created workspace");
    });
});

describe("--list with workspace context", () => {
    test("lists sessions with workspace header", async () => {
        // Create workspace first
        await runExtract(["-w", "test-ws-ctx", "--create", TEST_SESSION_ID]);
        const result = await runExtract(["-w", "test-ws-ctx", "--list"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("Sessions");
        expect(result.stdout).toContain(TEST_SESSION_TITLE);
    });
});

describe("numbered session selection", () => {
    test("selects session by number from --list", async () => {
        // Create workspace, then extract by number
        await runExtract(["-w", "test-ws-num", "--create"]);
        // Number 1 should be the most recent session
        const result = await runExtract(["-w", "test-ws-num", "1"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("convo.txt");
    });

    test("number 2 selects second most recent", async () => {
        const result = await runExtract(["-w", "test-ws-num", "2"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("Older session");
    });

    test("out of range number fails gracefully", async () => {
        const result = await runExtract(["-w", "test-ws-num", "99"]);
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("Session #99 not found");
    });
});

describe("session resolution", () => {
    test("explicit session ID works", async () => {
        await runExtract(["-w", "test-ws-resolve", "--create"]);
        const result = await runExtract(["-w", "test-ws-resolve", TEST_SESSION_ID]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("convo.txt");
    });

    test("auto-selects most recent session when no ID given", async () => {
        const result = await runExtract(["-w", "test-ws-auto", "--create"]);
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("Auto-selected session");
        expect(result.stdout).toContain(TEST_SESSION_ID);
    });

    test("invalid session ID fails gracefully", async () => {
        const result = await runExtract(["-w", "test-ws-auto", "ses_nonexistent"]);
        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("not found");
    });
});

describe("output structure", () => {
    let outputDir: string;

    beforeAll(async () => {
        const result = await runExtract(["-w", "test-output", "--create", TEST_SESSION_ID]);
        const match = result.stdout.match(/Output:\s+(.+)/);
        outputDir = match?.[1]?.trim().replace(/\/$/, "") || "";
    });

    test("creates convo.txt", () => {
        expect(existsSync(join(outputDir, "convo.txt"))).toBe(true);
    });

    test("creates prompt.txt", () => {
        expect(existsSync(join(outputDir, "prompt.txt"))).toBe(true);
    });

    test("creates goals.md placeholder", () => {
        expect(existsSync(join(outputDir, "goals.md"))).toBe(true);
    });

    test("creates all scaffold directories", () => {
        expect(existsSync(join(outputDir, "feedbacks"))).toBe(true);
        expect(existsSync(join(outputDir, "triedbutfailed"))).toBe(true);
        expect(existsSync(join(outputDir, "factoids", "systems"))).toBe(true);
        expect(existsSync(join(outputDir, "factoids", "world"))).toBe(true);
        expect(existsSync(join(outputDir, "ideas"))).toBe(true);
        expect(existsSync(join(outputDir, "agents"))).toBe(true);
    });

    test("convo.txt has correct header", () => {
        const content = readFileSync(join(outputDir, "convo.txt"), "utf-8");
        expect(content).toContain(`# Conversation: ${TEST_SESSION_TITLE}`);
        expect(content).toContain(`# Session ID: ${TEST_SESSION_ID}`);
        expect(content).toContain("# Workspace: test-output");
    });

    test("convo.txt contains user and assistant messages", () => {
        const content = readFileSync(join(outputDir, "convo.txt"), "utf-8");
        expect(content).toContain("## USER");
        expect(content).toContain("## ASSISTANT [build] (claude-opus-4-6)");
        expect(content).toContain("Help me fix the widget");
        expect(content).toContain("I'll look at the widget code.");
    });

    test("convo.txt contains tool calls with input and output", () => {
        const content = readFileSync(join(outputDir, "convo.txt"), "utf-8");
        expect(content).toContain("[TOOL: read]");
        expect(content).toContain("completed");
        expect(content).toContain("/src/widget.ts");
        expect(content).toContain("const x = 1;");
    });

    test("convo.txt includes subagent sessions", () => {
        const content = readFileSync(join(outputDir, "convo.txt"), "utf-8");
        expect(content).toContain("SUBAGENT SESSIONS");
        expect(content).toContain("Subagent task");
        expect(content).toContain("Found the issue in widget.ts");
    });

    test("prompt.txt contains default extraction instructions", () => {
        const content = readFileSync(join(outputDir, "prompt.txt"), "utf-8");
        expect(content).toContain("world-effect-classifier");
        expect(content).toContain("feedback-loop-extractor");
        expect(content).toContain("factoid-extractor");
        expect(content).toContain("extraction-verifier");
    });

    test("output dir name follows YYYY-MM-DD_title_hash pattern", () => {
        const dirName = outputDir.split("/").pop() || "";
        expect(dirName).toMatch(/^\d{4}-\d{2}-\d{2}_[a-z0-9-]+_[a-f0-9]{8}$/);
    });
});

describe("custom prompt", () => {
    test("--prompt overrides default", async () => {
        const result = await runExtract(["-w", "test-prompt", "--create", TEST_SESSION_ID, "--prompt", "Custom extraction instructions here"]);
        expect(result.exitCode).toBe(0);

        const match = result.stdout.match(/Output:\s+(.+)/);
        const outputDir = match?.[1]?.trim().replace(/\/$/, "") || "";
        const content = readFileSync(join(outputDir, "prompt.txt"), "utf-8");
        expect(content).toBe("Custom extraction instructions here");
    });
});
