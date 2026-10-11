# Troubleshooting

## Plugin does not appear after install

Cause: the client loads a stale list. Fix: reload, then list again.

- Claude Code session: run `/reload-plugins`, then in the shell run
  `claude plugin list`.
- Codex: run `codex plugin list --available --json` and confirm the
  entry. Restart the desktop app after local edits.
- Kimi session: run `/reload` or start a new session. Install,
  enable, disable, and remove all need this step.
- Amp: run the `reload_skills` tool.
- Muse: run `muse plugins list --json`.

## Marketplace install cannot access the package

Cause: the session has no authenticated access to the private
repository. Fix: authenticate `gh` with read access to
`tailrocks/tailrocks-asd-ste100-skills` and retry. As fallback, clone with an
SSH key and use the authorized local package route in
`installation.md`. Never work around access with a public copy.

## Wrong skill answers

Cause: a same-named skill from another source won the collision.
Fix: keep one copy and always use the qualified id.

- Install and select with `asd-ste100-skill@tailrocks`
  on Claude, Codex, and Muse.
- On Amp, a local copy masks a repository copy, and a personal copy
  masks a workspace copy. Inspect the source before use.
- On OpenCode V2, the project `.opencode` directory beats the global
  directory. On V1, names must be unique.
- On Kimi, Project beats User beats Extra beats Built-in.
- On Antigravity and Grok, no precedence is documented. Keep one
  copy per skill.

## Skill loads but dictionary lookups fail

Cause: the install copied `SKILL.md` without its references. Fix:
copy the complete `skills/asd-ste100` directory again, including
`skills/asd-ste100/references`. Then reload per the client
section in `installation.md`.

## Strict audit gives a verdict on an unknown word

Cause: the bundled shards do not cover every Issue 9 headword, and
absence from a shard is not proof of unapproved status. Fix: consult
the authorized Issue 9 copy before a strict verdict. See
`skills/asd-ste100/references/source-access.md` for the method.

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
`codex plugin marketplace upgrade tailrocks`, then restart the
desktop app. Adding over an installed copy has unresolved semantics:
verify the loaded copy with `codex plugin list --available --json`.

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
