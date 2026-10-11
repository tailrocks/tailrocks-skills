# Troubleshooting

## Plugin does not appear after install

The cause is a stale client list. Reload. Then list again in the
client form:

- Claude Code session: run `/reload-plugins`. Then in the shell,
  run `claude plugin list`.
- Codex: run `codex plugin list --available --json`. Confirm the
  entry. After local edits, restart the desktop app.
- Kimi session: run `/reload` or start a new session. Install,
  enable, disable, and remove all need this step.
- Amp: run the `reload_skills` tool.
- Muse: run `muse plugins list --json`.

## Wrong skill answers

The cause is a same-named skill from another source that won the
collision. Keep one copy. Always use the qualified id. Use the
client rule:

- On Claude, Codex, and Muse, install through
  `tailrocks-contribution-skills@tailrocks`. Select through the same
  id.
- On Amp, a local copy beats a repository copy. A personal copy
  beats a workspace copy. Before use, inspect the source.
- On OpenCode V2, the project `.opencode` directory beats the global
  directory. On V1, names must be unique.
- On Kimi, Project beats User beats Extra beats Built-in.
- On Antigravity and Grok, no precedence is documented. Keep one
  copy per skill.

## User-only skill starts without a human command

The cause is a client without user-only enforcement. Amp,
Antigravity, and Muse Code document no enforcement. OpenCode V1
ignores the frontmatter flags. Invoke every contribution skill only
through an explicit human command. On OpenCode V1, set
`permission.skill` to `ask`. On Kimi, audit enabled plugins: a
`sessionStart.skill` injection can skip the gate.

## Kimi reads the wrong skill root

The cause is a Kimi manifest without the `skills` field. Without
it, Kimi reads a root SKILL.md file. This package already sets
`skills` to `./skills/` in `.kimi-plugin/plugin.json`. When the
symptom persists, reinstall from the commit pin in
`installation.md`. After the reinstall, run `/reload`.

The CLI always runs from the managed copy under
`$KIMI_CODE_HOME/plugins/managed/`. Delete the stale copy to clear
it fully.

## Codex shows an old plugin copy

The cause is separate marketplace and installed-plugin refresh.
No verb refreshes one installed plugin. Run `codex plugin
marketplace upgrade tailrocks`. Then restart the desktop app. The
semantics of an install over an installed copy are unresolved. Run
`codex plugin list --available --json` to verify the loaded copy.

## `gh` commands fail

The cause is missing authentication or missing access to the
target. Authenticate a `gh` session that has access to the fork and
the target project. After authentication, retry. Only GitHub.com is
supported. GitHub Enterprise is unsupported. Read-only
reconnaissance can run without authentication.

## Manifests disagree

The cause is a version, name, or description difference between
`plugin.json` and a host manifest. Run `alint check`. The
`manifest-version-agree`, `manifest-name-agree`, and
`manifest-description-agree` rules name the drift. Edit the host
manifest to match the root `plugin.json`, which is the source of
truth. Then re-run the strict-JSON check in `maintenance.md`.

## `alint check` cannot fetch the shared profile

The cause is missing network access or a stale pin. Confirm
network access to raw.githubusercontent.com.
Confirm the REV and HASH in `.alint.yml` match the published
revision. Bump both in one pull request as `maintenance.md` describes.

## `.github/PULL_REQUEST_TEMPLATE.md` is missing

The cause is a hand edit or an old generator run. Restore the file
from version control. The current generator preserves the file. See
`maintenance.md`.
