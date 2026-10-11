# Troubleshooting

## Plugin does not appear after install

Cause: the client loads a stale list. Fix: reload. List again.

- Claude Code session: run `/reload-plugins`, then in the shell run
  `claude plugin list`.
- Codex: run `codex plugin list --available --json` and confirm the
  entry. Restart the desktop app after local edits.
- Kimi session: run `/reload` or start a new session. Install,
  enable, disable, and remove all need this step.
- Amp: run the `reload_skills` tool.
- Muse: run `muse plugins list --json`.

## Wrong skill answers

Cause: a same-named skill from another source won the collision.
Fix: keep one copy. Always use the qualified id.

- Install and select with `tailrocks-rust-skills@tailrocks`
  on Claude, Codex, and Muse.
- On Amp, a local copy masks a repository copy, and a personal copy
  masks a workspace copy. Inspect the source before use.
- On OpenCode V2, the project `.opencode` directory beats the global
  directory. On V1, names must be unique.
- On Kimi, Project beats User beats Extra beats Built-in.
- On Antigravity and Grok, no precedence is documented. Keep one
  copy per skill.

## User-only skill starts without a human command

Cause: the client cannot enforce user-only entry. Amp,
Antigravity, and Muse Code document no enforcement. OpenCode V1
ignores the frontmatter flags. Fix: invoke the ten user-only skills
only through an explicit human command. On OpenCode V1, set
`permission.skill` to `ask`. On Kimi, audit enabled plugins: a
`sessionStart.skill` injection can bypass the gate.

## Kimi reads the wrong skill root

Cause: the Kimi manifest lacks the `skills` field. Without it, Kimi
reads a root SKILL.md file. Fix: this package already sets `skills`
to `./skills/` in `.kimi-plugin/plugin.json`. When the symptom
persists, reinstall from the commit pin in `installation.md` and run
`/reload`. The CLI always runs from the managed copy under
`$KIMI_CODE_HOME/plugins/managed/`: delete the stale copy to clear
it fully.

## Codex shows an old plugin copy

Cause: marketplace refresh is separate from installed-plugin
refresh, and no verb refreshes one installed plugin. Fix: run
`codex plugin marketplace upgrade tailrocks`. Restart the
desktop app. Adding over an installed copy has unresolved semantics.
Verify the loaded copy with `codex plugin list --available --json`.

## Cargo or mise commands fail

Cause: the local toolchain differs from the committed pins, or a
required tool is missing. Fix: run `mise install` from the target
repository root. Retry through the committed `mise run` tasks.
Never replace a pinned tool with `latest`. Read-only audits install
no tools: when the host cannot provide a gate, the audit records
`BLOCKED` instead of running it.

## Manifests disagree

Cause: the version, name, or description differs between
`plugin.json` and a host manifest. Fix: run `alint check`. The
`manifest-version-agree`, `manifest-name-agree`, and
`manifest-description-agree` rules name the drift. Edit the host
manifest to match the root `plugin.json`, which is the source of
truth. Then re-run the strict-JSON check in `maintenance.md`.

## `alint check` cannot fetch the shared profile

Cause: no network access, or the pin no longer matches the profile
revision. Fix: confirm network access to raw.githubusercontent.com.
Confirm the REV and HASH in `.alint.yml` match the published
revision. Bump both in one pull request per `maintenance.md`.

## `.github/PULL_REQUEST_TEMPLATE.md` is missing

Cause: a hand edit or an old generator removed the file. Fix:
restore the file from version control. The current generator
preserves the file. See `maintenance.md`.
