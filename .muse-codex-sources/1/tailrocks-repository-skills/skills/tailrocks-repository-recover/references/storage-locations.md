# Storage locations

Read this reference when steps 3 and 4 need session and scratch paths.
Treat every path as a search candidate, not a deletion target.

Storage reference version: 1. Checked: 2026-10-07. Recheck upstream
docs when a client updates.

Contents: status labels, environment variables, per-client tables,
shared rules, other candidates.

## Status labels

- **Documented**: the client's own docs state the path.
- **Observed**: consistent third-party or field evidence states the
  path. The client's own docs do not state the path.
- **Legacy**: it is an older documented path. Check it only when
  migration evidence exists.
- **Unverified**: there is no solid source. Resolve it at runtime from
  configuration or session evidence.

## Environment variables

Native variables relocate client data. Third-party reader variables do
not. Never present reader settings as native agent configuration.

Native: `CLAUDE_CONFIG_DIR`, `CLAUDE_CODE_TMPDIR`,
`CLAUDE_CODE_PROJECT_DIR_NAME`, `CODEX_HOME`, `KIMI_CODE_HOME`,
`XDG_DATA_HOME`, `XDG_CONFIG_HOME`.

Third-party reader only (AgentsView, checked 2026-10-07, latest
referenced release v0.40.0): `ANTIGRAVITY_DIR`,
`ANTIGRAVITY_CLI_DIR`, `GROK_DIR`, `agents.<id>.dirs`. These configure
a separate reader's supported layouts. They never configure the agents.

## Claude Code

Source: code.claude.com env-vars and skills docs. Checked 2026-10-07.
Docs current to v2.1.286-v2.1.288.

| Path | Status |
|---|---|
| `$CLAUDE_CONFIG_DIR`, default `~/.claude` | Documented |
| `$CLAUDE_CONFIG_DIR/projects/<dir>/` session records | Documented |
| `$CLAUDE_CODE_TMPDIR/claude-<uid>/` on Unix | Documented |
| `~/.claude/debug/<session-id>.txt`, `jobs/`, `plugins/`, `skills/synced/`, `skills/.trash/` | Documented |
| `/tmp` and `/private/tmp` aliases on macOS, scanned once | Observed |
| Project scratchpads, tasks, subagent records, recorded file paths | Observed (field evidence) |
| Worktrees and other configured storage paths | Unverified; resolve from configuration or session evidence |

Note: `CLAUDE_CODE_SKIP_PROMPT_HISTORY=1` suppresses transcripts. Such
sessions leave no record.

## Codex

Sources: learn.chatgpt.com skills and worktree docs (reached through
redirects from developers.openai.com). Checked 2026-10-07. No version
shown.

| Path | Status |
|---|---|
| `~/.codex/config.toml` | Documented |
| `$CODEX_HOME/worktrees`, relocatable in Settings | Documented |
| Skill roots: `$CWD/.agents/skills` up to `$REPO_ROOT/.agents/skills`, `$HOME/.agents/skills`, `/etc/codex/skills` | Documented |
| `CODEX_HOME` default `~/.codex` | Observed (officially implied; explicit statement only in community sources) |
| `$CODEX_HOME/sessions/`, `archived_sessions/`, history records | Unverified officially (consistent community sources) |
| Managed recovery snapshots | Unverified; use only when the installed CLI shows them |

Protect authentication files and unrelated sessions. Read only the
configuration needed to locate data.

## Kimi Code

Source: kimi.com data-locations, skills, migration, hooks, plugins
docs. Checked 2026-10-07. Unversioned docs.

| Path | Status |
|---|---|
| `$KIMI_CODE_HOME`, default `~/.kimi-code` | Documented |
| `session_index.jsonl` (`sessionId`, `sessionDir`, `workDir`) | Documented |
| `sessions/<workDirKey>/<sessionId>/`: `state.json`, `agents/main/wire.jsonl`, `agents/main/plans/`, `agents/agent-N/wire.jsonl`, `tasks/` | Documented |
| `user-history/<md5(workDir)>.jsonl` project input history | Documented |
| `~/.kimi/` | Legacy; check only when migration evidence exists |

Never confuse plugin copies (`plugins/managed/`) or credential storage
(`credentials/`) with project scratch work. Migration never modifies or
deletes `~/.kimi/`.

## Amp Code

Source: ampcode.com skills and threads docs. Checked 2026-10-07.
Unversioned docs.

| Path | Status |
|---|---|
| Cloud threads `https://ampcode.com/threads/T-...` | Documented (current primary) |
| `~/.local/share/amp/threads/T-*.json` | Observed historical (third-party only; current-write behavior disputed) |

Read actual configuration and current local thread metadata first.
Never treat a local thread stub as a complete remote transcript. Never
fetch cloud threads without the required scope and authority.

## Grok Build

Source: docs.x.ai sessions and skills docs. Checked 2026-10-07.
Unversioned.

| Path | Status |
|---|---|
| `~/.grok/sessions/`, keyed by working directory | Documented |
| Per-session file layout, snapshots, worktrees, background-task output | Observed (third-party only) |

Use session working-directory records to identify the project.

## Antigravity CLI

Sources: antigravity.google CLI and skills docs. Checked 2026-10-07.
No version is shown. Surfaces are labeled Antigravity 2.0 / CLI / IDE.

| Path | Status |
|---|---|
| `~/.gemini/antigravity-cli/` root, `settings.json`, `keybindings.json` | Documented |
| Skill and plugin skill subpaths under that root | Documented |
| `conversations/`, `history.jsonl`, `brain/` | Observed (third-party only; unverified natively) |
| `~/.gemini/antigravity/` (IDE sessions) | Observed (third-party only; unverified natively) |

Treat database, sidecar, and older encrypted formats as
version-dependent. Inspect the IDE root separately only when the IDE was
also used. Include migrated Gemini locations only when evidence
connects them.

## Muse Code

Sources: dev.meta.ai extending docs and the audit and replay cookbooks.
Checked 2026-10-07. Cookbook shows `export_schema_version: 1`.

| Path | Status |
|---|---|
| `${XDG_DATA_HOME:-$HOME/.local/share}/muse/sessions/YYYY/MM/DD/<session-id>/session.jsonl` | Documented |
| `.../<session-id>/subagent/<child-id>/` observer logs | Documented |

Use supported session inspection or export where necessary. Resolve
settings separately from session storage. Note: the AgentsView reader
page contains zero Muse mentions as checked, so it contributes no Muse
path.

## Shared rules

- Inspect environment overrides, launch scripts, account profiles, and
  container mounts for every client.
- Include referenced scratch directories outside the default roots.
- Inspect shared databases through a consistent read-only view or a
  supported export. Account for active sidecar files.
- Never edit a shared session database to remove one project by
  guesswork.

## Other candidates

Use OS metadata, user caches, application-support roots, and temporary
roots as additional candidates. Include accessible mounted local volumes
and relevant local container storage. Never access unrelated remote
machines or unavailable volumes without permission.
