/**
 * lastloop — Post-conversation knowledge extraction tool
 *
 * Thin wrapper that delegates to extract.ts in the runtime dir.
 * Installed by oct into .opencode/tools/lastloop.ts
 */
import { tool } from "@opencode-ai/plugin"
import { existsSync } from "fs"
import { dirname, join } from "path"
import { spawnSync } from "child_process"

const OPENCODE_DIR = join(dirname(import.meta.path), "..")
const EXTRACT_PATH = join(OPENCODE_DIR, "lastloop", "extract.ts")

export default tool({
  description:
    "Post-conversation knowledge extraction pipeline. Subcommands: " +
    "--list (browse sessions), --list_all (all projects), --list_workspaces (see workspaces), " +
    "-w NAME [--create] <session> (extract into workspace). " +
    "Session can be a number from --list output or a session ID. No args = help.",
  args: {
    args: tool.schema
      .string()
      .optional()
      .describe(
        "Arguments, e.g. '--list', '--list --limit 5', '--list_workspaces', " +
        "'-w my-workspace --create 3', '-w my-workspace ses_xxxxx'",
      ),
  },
  async execute(input) {
    if (!existsSync(EXTRACT_PATH)) {
      return `[error] extract.ts not found at ${EXTRACT_PATH}. Run: oct install oct-lastloop/lastloop`
    }

    const argv = input.args ? input.args.trim().split(/\s+/) : []
    const result = spawnSync("bun", [EXTRACT_PATH, ...argv], {
      cwd: dirname(OPENCODE_DIR),
      env: { ...process.env },
      timeout: 30_000,
      encoding: "utf-8",
    })

    const output = ((result.stdout || "") + (result.stderr ? "\n" + result.stderr : "")).trim()

    if (result.status !== 0) {
      return `[exit ${result.status}]\n${output}`
    }

    return output
  },
})
