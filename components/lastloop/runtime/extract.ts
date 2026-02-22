#!/usr/bin/env bun
/**
 * lastloop/extract.ts — Dump an OpenCode conversation from SQLite and scaffold the extraction directory.
 *
 * Usage:
 *   lastloop --list                           List last 20 sessions (current project)
 *   lastloop --list_all                       List last 20 sessions (all projects)
 *   lastloop --list_workspaces                List existing workspaces
 *   lastloop --list --limit 5                 List last 5 sessions
 *   lastloop -w NAME --create                 Create workspace + extract latest session
 *   lastloop -w NAME 3                        Extract session #3 (from --list output) into workspace
 *   lastloop -w NAME ses_xxxxx                Extract specific session into workspace
 *   lastloop                                  Show help
 *
 * Session selection: use # from --list output, or a session ID (ses_...).
 */

import { Database } from "bun:sqlite";
import { mkdirSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { randomBytes } from "crypto";

// --- Config ---
const DB_PATH = join(
    process.env.HOME || "~",
    ".local/share/opencode/opencode.db",
);
// auto/ lives alongside this script
// LASTLOOP_AUTO_DIR env var allows tests to redirect output
const LASTLOOP_BASE = process.env.LASTLOOP_AUTO_DIR || resolve(import.meta.dir, "auto");

// --- Parse args ---
let sessionArg: string | undefined;
let promptOverride: string | undefined;
let workspace: string | undefined;
let createWorkspace = false;
let listMode = false;
let listAllMode = false;
let listWorkspacesMode = false;
let limit = 20;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--workspace" || args[i] === "-w") && args[i + 1]) {
        workspace = args[++i];
    } else if (args[i] === "--create" || args[i] === "-c") {
        createWorkspace = true;
    } else if (args[i] === "--prompt" && args[i + 1]) {
        promptOverride = args[++i];
    } else if (args[i] === "--list" || args[i] === "-l") {
        listMode = true;
    } else if (args[i] === "--list_all") {
        listAllMode = true;
    } else if (args[i] === "--list_workspaces") {
        listWorkspacesMode = true;
    } else if (args[i] === "--limit" && args[i + 1]) {
        limit = parseInt(args[++i], 10) || 20;
    } else if (!args[i].startsWith("--") && !args[i].startsWith("-")) {
        sessionArg = args[i];
    }
}

// --- Help ---
const isListOp = listMode || listAllMode || listWorkspacesMode;
if (!isListOp && !workspace && !sessionArg) {
    console.log(`lastloop — Post-conversation knowledge extraction

Usage:
  lastloop --list [--limit N]              List last N sessions (current project, default 20)
  lastloop --list_all [--limit N]          List last N sessions (all projects)
  lastloop --list_workspaces               List existing workspaces with extraction counts
  lastloop -w NAME --create [session]      Create workspace + extract session (latest if omitted)
  lastloop -w NAME [session]               Extract into existing workspace
  lastloop -w NAME --list                  List sessions (with workspace context)

Session can be:
  #N          Number from --list output (e.g. 3)
  ses_xxxxx   Session ID

Examples:
  lastloop --list                          Browse recent sessions
  lastloop -w sunmi-debug --create 1       Create workspace, extract session #1
  lastloop -w sunmi-debug 3               Extract session #3 into existing workspace`);

    if (existsSync(LASTLOOP_BASE)) {
        const existing = readdirSync(LASTLOOP_BASE).filter(d =>
            statSync(join(LASTLOOP_BASE, d)).isDirectory()
        );
        if (existing.length > 0) {
            console.log(`\nExisting workspaces:`);
            for (const ws of existing) {
                const count = readdirSync(join(LASTLOOP_BASE, ws)).filter(d =>
                    statSync(join(LASTLOOP_BASE, ws, d)).isDirectory()
                ).length;
                console.log(`  ${ws}  (${count} extraction${count !== 1 ? "s" : ""})`);
            }
        }
    }
    process.exit(0);
}

// --- Open DB (needed for list and extraction) ---
if (!existsSync(DB_PATH)) {
    console.error(`ERROR: OpenCode DB not found at ${DB_PATH}`);
    process.exit(1);
}
const db = new Database(DB_PATH, { readonly: true });

// --- Helpers ---
function formatTimestamp(ms: number): string {
    return new Date(ms).toISOString().replace("T", " ").replace(/\.\d+Z/, "");
}

function formatDateShort(ms: number): string {
    return new Date(ms).toISOString().slice(0, 10);
}

interface SessionListRow {
    id: string;
    title: string;
    time_created: number;
    msg_count: number;
    project_dir: string;
}

function querySessions(allProjects: boolean): SessionListRow[] {
    const cwd = process.cwd();
    if (allProjects) {
        return db
            .query<SessionListRow, []>(
                `SELECT s.id, s.title, s.time_created,
                        (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) as msg_count,
                        COALESCE(s.directory, p.worktree, '') as project_dir
                 FROM session s
                 LEFT JOIN project p ON s.project_id = p.id
                 WHERE s.parent_id IS NULL
                   AND s.time_archived IS NULL
                 ORDER BY s.time_created DESC`,
            )
            .all();
    } else {
        return db
            .query<SessionListRow, [string, string]>(
                `SELECT s.id, s.title, s.time_created,
                        (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) as msg_count,
                        COALESCE(s.directory, p.worktree, '') as project_dir
                 FROM session s
                 LEFT JOIN project p ON s.project_id = p.id
                 WHERE (s.directory = ? OR s.project_id IN (SELECT id FROM project WHERE worktree LIKE ? || '%'))
                   AND s.parent_id IS NULL
                   AND s.time_archived IS NULL
                 ORDER BY s.time_created DESC`,
            )
            .all(cwd, cwd);
    }
}

function printSessionList(sessions: SessionListRow[], limited: number, label: string) {
    const list = sessions.slice(0, limited);
    console.log(`\n${label} (showing ${list.length} of ${sessions.length}):\n`);
    console.log(`  ${"#".padStart(3)}  ${"Date".padEnd(12)} ${"Msgs".padStart(4)}  ${"Session ID".padEnd(30)} Title`);
    console.log(`  ${"─".repeat(3)}  ${"─".repeat(12)} ${"─".repeat(4)}  ${"─".repeat(30)} ${"─".repeat(30)}`);
    for (let i = 0; i < list.length; i++) {
        const s = list[i];
        const num = String(i + 1).padStart(3);
        const date = formatDateShort(s.time_created).padEnd(12);
        const msgs = String(s.msg_count).padStart(4);
        const sid = s.id.padEnd(30);
        const title = (s.title || "(untitled)").slice(0, 50);
        console.log(`  ${num}  ${date} ${msgs}  ${sid} ${title}`);
    }
    console.log(`\nUse: lastloop -w WORKSPACE_NAME <#> to extract a session`);
}

// --- List workspaces ---
if (listWorkspacesMode) {
    console.log(`\nWorkspaces in ${LASTLOOP_BASE}:\n`);
    if (existsSync(LASTLOOP_BASE)) {
        const dirs = readdirSync(LASTLOOP_BASE).filter(d =>
            statSync(join(LASTLOOP_BASE, d)).isDirectory()
        );
        if (dirs.length === 0) {
            console.log("  (no workspaces)");
        } else {
            console.log(`  ${"Workspace".padEnd(30)} ${"Extractions".padStart(11)}  Latest`);
            console.log(`  ${"─".repeat(30)} ${"─".repeat(11)}  ${"─".repeat(30)}`);
            for (const ws of dirs) {
                const subs = readdirSync(join(LASTLOOP_BASE, ws)).filter(d =>
                    statSync(join(LASTLOOP_BASE, ws, d)).isDirectory()
                );
                const latest = subs.sort().reverse()[0] || "(empty)";
                const latestDate = latest.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "";
                const latestTitle = latest.replace(/^\d{4}-\d{2}-\d{2}_/, "").replace(/_[a-f0-9]{8}$/, "").replace(/-/g, " ");
                console.log(`  ${ws.padEnd(30)} ${String(subs.length).padStart(11)}  ${latestDate} ${latestTitle}`);
            }
        }
    } else {
        console.log("  (auto/ directory not found)");
    }
    db.close();
    process.exit(0);
}

// --- List sessions ---
if (listMode || listAllMode) {
    const sessions = querySessions(listAllMode);
    const label = listAllMode ? "All sessions (all projects)" : "Sessions (current project)";
    printSessionList(sessions, limit, label);
    db.close();
    process.exit(0);
}

// --- Extraction mode: workspace required ---
if (!workspace) {
    console.error(`ERROR: --workspace NAME is required for extraction.`);
    console.error(`Use --list to browse sessions first, then: lastloop -w WORKSPACE_NAME <#>`);
    process.exit(1);
}

const workspaceDir = join(LASTLOOP_BASE, workspace);
const workspaceExists = existsSync(workspaceDir);

if (!workspaceExists && !createWorkspace) {
    console.error(`ERROR: Workspace "${workspace}" does not exist.`);
    console.error(`Use --create to create it, or choose an existing workspace.`);
    if (existsSync(LASTLOOP_BASE)) {
        const existing = readdirSync(LASTLOOP_BASE).filter(d =>
            statSync(join(LASTLOOP_BASE, d)).isDirectory()
        );
        if (existing.length > 0) {
            console.error(`\nExisting workspaces:`);
            for (const ws of existing) {
                console.error(`  ${ws}`);
            }
        }
    }
    process.exit(1);
}

if (!workspaceExists && createWorkspace) {
    mkdirSync(workspaceDir, { recursive: true });
    console.log(`Created workspace: ${workspace}`);
}

// --- Resolve session from argument ---
let sessionId: string | undefined;

if (sessionArg) {
    // Check if it's a number (from --list output)
    const num = parseInt(sessionArg, 10);
    if (!isNaN(num) && String(num) === sessionArg && num > 0) {
        // Numbered selection — re-query sessions to find the one at this position
        const sessions = querySessions(false);
        if (num > sessions.length) {
            console.error(`ERROR: Session #${num} not found. Only ${sessions.length} sessions available.`);
            console.error(`Run: lastloop --list to see available sessions.`);
            process.exit(1);
        }
        sessionId = sessions[num - 1].id;
        console.log(`Selected session #${num}: ${sessionId} ("${sessions[num - 1].title}")`);
    } else {
        // Direct session ID
        sessionId = sessionArg;
    }
} else {
    // Auto-select latest session
    const cwd = process.cwd();

    let session = db
        .query<{ id: string; title: string }, [string]>(
            `SELECT id, title FROM session
             WHERE directory = ?
               AND parent_id IS NULL
               AND time_archived IS NULL
             ORDER BY time_created DESC LIMIT 1`,
        )
        .get(cwd);

    if (!session) {
        const project = db
            .query<{ id: string; worktree: string }, []>(
                "SELECT id, worktree FROM project ORDER BY rowid DESC",
            )
            .all()
            .find((p) => cwd.startsWith(p.worktree) || p.worktree.startsWith(cwd));

        if (project) {
            session = db
                .query<{ id: string; title: string }, [string]>(
                    `SELECT id, title FROM session
                     WHERE project_id = ?
                       AND parent_id IS NULL
                       AND time_archived IS NULL
                     ORDER BY time_created DESC LIMIT 1`,
                )
                .get(project.id);
        }
    }

    if (!session) {
        console.error(`ERROR: No sessions found for cwd ${cwd}. Pass session # or ID explicitly.`);
        process.exit(1);
    }

    sessionId = session.id;
    console.log(`Auto-selected session: ${sessionId} ("${session.title}")`);
}

// --- Fetch session metadata ---
interface SessionRow {
    id: string;
    title: string;
    time_created: number;
    project_id: string;
}
const session = db
    .query<SessionRow, [string]>(
        "SELECT id, title, time_created, project_id FROM session WHERE id = ?",
    )
    .get(sessionId);

if (!session) {
    console.error(`ERROR: Session ${sessionId} not found`);
    process.exit(1);
}

// --- Fetch messages + parts ---
interface MessageRow {
    id: string;
    data: string;
    time_created: number;
}
interface PartRow {
    id: string;
    message_id: string;
    data: string;
    time_created: number;
}

const messages = db
    .query<MessageRow, [string]>(
        "SELECT id, data, time_created FROM message WHERE session_id = ? ORDER BY time_created ASC",
    )
    .all(sessionId);

const allParts = db
    .query<PartRow, [string]>(
        "SELECT id, message_id, data, time_created FROM part WHERE session_id = ? ORDER BY time_created ASC",
    )
    .all(sessionId);

const childSessions = db
    .query<{ id: string; title: string }, [string]>(
        "SELECT id, title FROM session WHERE parent_id = ? ORDER BY time_created ASC",
    )
    .all(sessionId);

const partsByMessage = new Map<string, PartRow[]>();
for (const part of allParts) {
    const arr = partsByMessage.get(part.message_id) || [];
    arr.push(part);
    partsByMessage.set(part.message_id, arr);
}

// --- Build convo.txt ---
function formatPart(partData: Record<string, unknown>): string {
    const type = partData.type as string;

    if (type === "text") {
        return (partData.text as string) || "";
    }

    if (type === "tool") {
        const tool = partData.tool as string;
        const state = partData.state as Record<string, unknown> | undefined;
        const input = state?.input
            ? JSON.stringify(state.input, null, 2)
            : "(no input)";
        const rawOutput = state?.output || "(no output)";
        const output = typeof rawOutput === "string" ? rawOutput : JSON.stringify(rawOutput);
        const status = state?.status || "unknown";
        const MAX_OUTPUT = 10_000;
        const truncated = output.length > MAX_OUTPUT;
        return `[TOOL: ${tool}] (${status})\nInput: ${input}\nOutput: ${truncated ? output.slice(0, MAX_OUTPUT) + "\n... (truncated from " + output.length + " chars)" : output}`;
    }

    if (type === "step-start" || type === "step-finish") {
        const cost = (partData as Record<string, unknown>).cost;
        const tokens = (partData as Record<string, unknown>).tokens;
        if (type === "step-finish" && (cost || tokens)) {
            return `--- step-finish (cost: ${cost}, tokens: ${JSON.stringify(tokens)}) ---`;
        }
        return `--- ${type} ---`;
    }

    return `[${type}]: ${JSON.stringify(partData).slice(0, 500)}`;
}

let convoLines: string[] = [];
convoLines.push(`# Conversation: ${session.title}`);
convoLines.push(`# Session ID: ${session.id}`);
convoLines.push(`# Created: ${formatTimestamp(session.time_created)}`);
convoLines.push(`# Messages: ${messages.length}, Parts: ${allParts.length}`);
convoLines.push(`# Workspace: ${workspace}`);
if (childSessions.length > 0) {
    convoLines.push(
        `# Subagent sessions: ${childSessions.map((s) => `${s.id} ("${s.title}")`).join(", ")}`,
    );
}
convoLines.push("");
convoLines.push("=".repeat(80));
convoLines.push("");

for (const msg of messages) {
    let msgData: Record<string, unknown>;
    try {
        msgData = JSON.parse(msg.data);
    } catch {
        msgData = { role: "unknown" };
    }

    const role = (msgData.role as string) || "unknown";
    const agent = msgData.agent ? ` [${msgData.agent}]` : "";
    const model = (msgData.model as Record<string, string>)?.modelID || "";

    convoLines.push(
        `## ${role.toUpperCase()}${agent}${model ? ` (${model})` : ""} — ${formatTimestamp(msg.time_created)}`,
    );
    convoLines.push("");

    const msgParts = partsByMessage.get(msg.id) || [];
    for (const part of msgParts) {
        let partData: Record<string, unknown>;
        try {
            partData = JSON.parse(part.data);
        } catch {
            partData = { type: "unknown", raw: part.data };
        }

        const formatted = formatPart(partData);
        if (formatted.trim()) {
            convoLines.push(formatted);
            convoLines.push("");
        }
    }

    convoLines.push("-".repeat(40));
    convoLines.push("");
}

// --- Append subagent sessions ---
if (childSessions.length > 0) {
    convoLines.push("");
    convoLines.push("=".repeat(80));
    convoLines.push("# SUBAGENT SESSIONS");
    convoLines.push("=".repeat(80));
    convoLines.push("");

    for (const child of childSessions) {
        const childMsgs = db
            .query<MessageRow, [string]>(
                "SELECT id, data, time_created FROM message WHERE session_id = ? ORDER BY time_created ASC",
            )
            .all(child.id);
        const childParts = db
            .query<PartRow, [string]>(
                "SELECT id, message_id, data, time_created FROM part WHERE session_id = ? ORDER BY time_created ASC",
            )
            .all(child.id);

        const childPartsByMsg = new Map<string, PartRow[]>();
        for (const part of childParts) {
            const arr = childPartsByMsg.get(part.message_id) || [];
            arr.push(part);
            childPartsByMsg.set(part.message_id, arr);
        }

        convoLines.push(`### SUBAGENT: ${child.title || "(untitled)"} (${child.id})`);
        convoLines.push("");

        for (const msg of childMsgs) {
            let msgData: Record<string, unknown>;
            try { msgData = JSON.parse(msg.data); } catch { msgData = { role: "unknown" }; }
            const role = (msgData.role as string) || "unknown";
            convoLines.push(`> ${role.toUpperCase()} — ${formatTimestamp(msg.time_created)}`);

            const msgParts = childPartsByMsg.get(msg.id) || [];
            for (const part of msgParts) {
                let partData: Record<string, unknown>;
                try { partData = JSON.parse(part.data); } catch { partData = { type: "unknown" }; }
                const formatted = formatPart(partData);
                if (formatted.trim()) {
                    convoLines.push(formatted.split("\n").map(l => `> ${l}`).join("\n"));
                    convoLines.push("");
                }
            }
            convoLines.push("");
        }
        convoLines.push("-".repeat(40));
        convoLines.push("");
    }
}

const convoText = convoLines.join("\n");

// --- Create output directory ---
const date = new Date(session.time_created).toISOString().slice(0, 10);
const titleSlug = (session.title || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
const hash = randomBytes(4).toString("hex");
const dirName = `${date}_${titleSlug}_${hash}`;
const outputDir = join(workspaceDir, dirName);

mkdirSync(join(outputDir, "feedbacks"), { recursive: true });
mkdirSync(join(outputDir, "triedbutfailed"), { recursive: true });
mkdirSync(join(outputDir, "factoids", "systems"), { recursive: true });
mkdirSync(join(outputDir, "factoids", "world"), { recursive: true });
mkdirSync(join(outputDir, "ideas"), { recursive: true });
mkdirSync(join(outputDir, "agents"), { recursive: true });

// --- Write files ---
writeFileSync(join(outputDir, "convo.txt"), convoText);

// Create empty goals.md placeholder
writeFileSync(join(outputDir, "goals.md"), `# Conversation Goals\n\n(To be populated by world-effect-classifier)\n`);

const defaultPrompt = `Extraction workspace: ${workspace}
Output directory: ${outputDir}

Run these extraction roles IN PARALLEL (they are independent):

1. /role world-effect-classifier
   Read convo.txt and:
   - Write goals.md — characterize what the user and agent were trying to achieve, how goals evolved, final state.
   - Extract all observable effects into feedbacks/ and triedbutfailed/.
   - Move user-aborted/redirected approaches to ideas/ (NOT triedbutfailed/).
   - Review for reusable workflow patterns → scaffold under agents/ if found.

2. /role feedback-loop-extractor
   Read convo.txt and extract novel tool uses into feedbacks/tools.md.

3. /role factoid-extractor
   Read convo.txt and extract non-common-knowledge factoids into factoids/systems/ and factoids/world/.

THEN after all three complete, run:

4. /role extraction-verifier
   Audit all produced files. Think → Verify against convo.txt → Fix.
   Write verification-report.md.`;

writeFileSync(join(outputDir, "prompt.txt"), promptOverride || defaultPrompt);

// --- Summary ---
console.log(`\nExtraction scaffolded:`);
console.log(`  Workspace:   ${workspace}`);
console.log(`  Session:     ${sessionId} ("${session.title}")`);
console.log(`  Output:      ${outputDir}/`);
console.log(`  convo.txt    ${(convoText.length / 1024).toFixed(1)}KB (${messages.length} messages, ${allParts.length} parts)`);
console.log(`  prompt.txt   ${promptOverride ? "(custom)" : "(default)"}`);
console.log(`\nDirectories created:`);
console.log(`  goals.md           (populated by world-effect-classifier)`);
console.log(`  feedbacks/`);
console.log(`  triedbutfailed/`);
console.log(`  factoids/systems/`);
console.log(`  factoids/world/`);
console.log(`  ideas/`);
console.log(`  agents/`);
console.log(`\nNext: Run extraction roles on convo.txt`);

db.close();
