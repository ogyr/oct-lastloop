# ETRON CI Review Pipeline Architecture

## System Structure
The ETRON CI review pipeline uses an OpenCode agent container to review MRs:

- **Image**: `ghcr.io/anomalyco/opencode:latest`
- **Model**: `openai/gpt-5.2-chat-latest` with medium reasoning/text verbosity
- **Workflow**:
  1. Read `docs/ARCHITECTURE.md` for context
  2. Run `cicd/scripts/get_mr_data.sh` for MR metadata (author, description, notes, discussions)
  3. Run `cicd/scripts/get_mr_diff.sh` for the diff
  4. Post review via `cicd/scripts/post_mr_note.sh`
  5. Optionally post inline comments via `cicd/scripts/post_mr_discussion.sh`

## Permission Model
The agent runs with `edit: deny` and a bash whitelist:
- Read-only git commands allowed: `git status`, `git log`, `git diff`, `git show`, `git branch`
- File reading: `cat`, `grep`, `sed`, `find`, `ls`, `tree`
- CI scripts allowed: `get_mr_data.sh`, `get_mr_diff.sh`, `post_mr_note.sh`, `post_mr_discussion.sh`, `post_mr_reply.sh`, `update_mr_description.sh`

## Key Files
- `.gitlab-ci.yml` lines 292-311: Review job definition
- `cicd/review/prompt.txt`: Agent instructions
- `cicd/review/opencode.json`: Agent permissions and model config
