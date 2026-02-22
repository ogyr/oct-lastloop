import { tool } from "@anthropic-ai/tool";
import { spawn } from "child_process";
import * as path from "path";

export default tool({
  name: "lastloop",
  description:
    "Post-conversation knowledge extraction pipeline. List sessions, manage workspaces, and extract knowledge from OpenCode conversations. Use --list to browse sessions, --list_workspaces to see workspaces, or -w NAME <session> to run extraction.",
  parameters: {
    args: {
      type: "string",
      description: `Arguments for the lastloop CLI. Examples:
  --list                    List last 20 sessions (current project)
  --list_all                List last 20 sessions (all projects)
  --list_workspaces         List existing workspaces
  --list --limit 5          List last 5 sessions
  -w NAME --create          Create workspace + extract latest session
  -w NAME --create 3        Create workspace + extract session #3
  -w NAME ses_xxxxx         Extract specific session into workspace
  (no args)                 Show help`,
    },
  },
  async execute({ args }, context) {
    const scriptPath = path.join(
      context.worktree,
      ".opencode",
      "lastloop",
      "extract.ts",
    );

    return new Promise<string>((resolve) => {
      const child = spawn("bun", [scriptPath, ...args.split(/\s+/).filter(Boolean)], {
        cwd: context.worktree,
        env: { ...process.env },
        timeout: 30_000,
      });

      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
      child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

      child.on("close", (code) => {
        const output = (stdout + (stderr ? "\n" + stderr : "")).trim();
        if (code !== 0) {
          resolve(`[exit ${code}]\n${output}`);
        } else {
          resolve(output);
        }
      });

      child.on("error", (err) => {
        resolve(`[error] ${err.message}`);
      });
    });
  },
});
