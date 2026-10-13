# Installation

Install the package `asd-ste100-skill` from the central
`tailrocks` marketplace. The marketplace source is
`tailrocks/tailrocks-skills`. The qualified plugin id is
`asd-ste100-skill@tailrocks`. Always use the qualified id.
It prevents collisions with same-named plugins.

Each section below names the exact version, surface, and source. Shell
commands run in a terminal. Session commands run inside the agent
session. All commands were recorded on 2026-10-07.

## Runtime requirements

All installs need authenticated access to the private repository.
Use an authenticated `gh` session or an SSH key with read access to
`tailrocks/tailrocks-asd-ste100-skills`. Keep the package private after install.
Do not copy the bundled references to a public location.

Vet the package before install. Read `plugin.json`, the host
manifests, and the skill file under `skills/`. This package ships
one skill and its references only. It adds no hooks and no MCP
servers.

## Marketplace name finding

The central catalog entry currently uses the id `asd-ste100`, while
the installed plugin name is `asd-ste100-skill`. This mismatch was
observed on 2026-10-07. The commands below use the real plugin name.
If a marketplace install fails to resolve the name, verify the
current central entry before retry. The authorized local package
route in each section avoids the mismatch entirely.

## Authorized local package

When the marketplace route is unavailable, install from an
authorized local checkout. Clone once with authenticated access:

```sh
git clone https://github.com/tailrocks/tailrocks-asd-ste100-skills
```

Use SSH instead when the session has no HTTPS credential:

```sh
git clone git@github.com:tailrocks/tailrocks-asd-ste100-skills.git
```

Each agent section below shows how to use this checkout. Always copy
or register the complete `skills/asd-ste100` directory, including
`skills/asd-ste100/SKILL.md` and `skills/asd-ste100/references`. A
partial copy breaks dictionary lookups.

## Writing profiles

The skill uses Practical clarity by default. It applies Strict Issue
9 only on explicit request. The profile travels with the skill on
every client. No client setting changes it. See `usage.md` for the
profile duties and triggers.

## Claude Code

- Version and surface: `claude` 2.1.289, CLI. Sources: the plugin
  docs at code.claude.com and local `--help`, 2026-10-07.
- Tools and access: the `claude` CLI, network access to GitHub, and
  read access to the private repository.
- Method: native marketplace, then qualified install. Local skill
  copy as fallback.
- Scope: user, project, or local.

Shell commands:

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install asd-ste100-skill@tailrocks --scope user
```

Local fallback. Clone per the local package section, then copy the
complete skill directory:

```sh
mkdir -p ~/.claude/skills
cp -R tailrocks-asd-ste100-skills/skills/asd-ste100 ~/.claude/skills/
```

Use `.claude/skills/` instead for the project scope.

Inspect the install (shell):

```sh
claude plugin list
claude plugin details asd-ste100-skill
```

Selection example (session):

```text
/asd-ste100-skill:asd-ste100 Rewrite this server upgrade procedure.
```

With the local fallback and no plugin wrapper, use `/asd-ste100`
instead.

Update and reload. Update one plugin (there is no update-all), or
refresh the marketplace listing and its installed plugins (shell).
Reload in the session after changes:

```sh
claude plugin update asd-ste100-skill@tailrocks
claude plugin marketplace update tailrocks
```

```text
/reload-plugins
```

For the local fallback, pull the checkout and copy the skill
directory again.

Removal (shell):

```sh
claude plugin uninstall asd-ste100-skill --scope user
```

For the local fallback, delete the copied skill directory.

Limits and evidence: removing a marketplace uninstalls its plugins
and strips `enabledPlugins`. Cloud sessions load no local or project
plugins. A project scope needs one install per machine. Sources with
`..` are rejected. Never register the package directory as its own
marketplace. Source: the loading and manifest-reference docs,
2026-10-07.

## Codex

- Version and surface: codex-cli 0.160.1, CLI. Sources: the plugin
  guide at developers.openai.com, the developer-commands and
  skills-and-plugins pages at learn.chatgpt.com, and local `--help`,
  2026-10-07.
- Tools and access: the `codex` CLI, network access to GitHub, and
  read access to the private repository.
- Method: native marketplace, then qualified add. Local skill copy
  as fallback.
- Scope: user install under `~/.codex/plugins/`, plus project enable
  in `.codex/config.toml`.

Shell commands:

```sh
codex plugin marketplace add tailrocks/tailrocks-skills
codex plugin add asd-ste100-skill@tailrocks
```

Local fallback. Clone per the local package section, then copy the
complete skill directory:

```sh
mkdir -p .agents/skills
cp -R tailrocks-asd-ste100-skills/skills/asd-ste100 .agents/skills/
```

Use `~/.agents/skills/` instead for the user scope.

Inspect the install (shell):

```sh
codex plugin list --available --json
```

Selection example (session):

```text
$asd-ste100 Rewrite this server upgrade procedure.
```

Update and reload (shell). This refreshes the marketplace snapshots
for configured plugins, even disabled ones:

```sh
codex plugin marketplace upgrade tailrocks
```

For the local fallback, pull the checkout and copy the skill
directory again.

Removal (shell):

```sh
codex plugin remove asd-ste100-skill@tailrocks
```

For the local fallback, delete the copied skill directory.

Limits and evidence: Codex 0.160.1 has no `install`, `update`, or
`validate` verbs (local `--help`). Marketplace refresh is separate
from installed-plugin refresh: there is no verb to refresh one
installed plugin. Restart the desktop app after local edits. Whether
`marketplace remove` also removes installed plugins is unresolved in
the docs. Identity is `name@marketplace`: always qualify the id.
Never register the package directory as its own marketplace.

## Amp

- Version and surface: docs unversioned, CLI plus hosted threads.
  Sources: the skills, plugins, global-plugins-and-skills, and
  settings pages at ampcode.com, plus the official building-skills
  guide, 2026-10-07. The `amp` CLI is absent locally, so these
  commands are doc-derived and unverified here.
- Tools and access: the `amp` CLI and a local checkout of the
  package. The skill installs as its own directory.
- Method: per-skill add from the local path.
- Scope: project `.agents/skills/`, machine-local
  `~/.config/agents/skills/`, or personal and workspace hosted
  scopes.

Shell commands. Clone once per the local package section, then add
the skill directory:

```sh
git clone https://github.com/tailrocks/tailrocks-asd-ste100-skills
amp skill add ./tailrocks-asd-ste100-skills/skills/asd-ste100 --name asd-ste100
```

The add copies the full skill directory, including references. Add
`--global` for the machine-local scope. Add `--overwrite` to replace
an older copy.

Inspect the install (shell):

```sh
amp skills list --json
```

Selection example (session). Amp has no slash invoke. Ask the thread
for the exact qualified skill by name:

```text
Use the asd-ste100-skill:asd-ste100 skill. Rewrite this server upgrade procedure.
```

Update and reload: pull the checkout, run the add again with
`--overwrite`, then run the `reload_skills` tool after changes. No
restart is needed.

Removal: delete the installed skill directory, then run the
`reload_skills` tool. There is no documented remove subcommand. Never
delete the loader cache directory.

Limits and evidence: hosted installs cap each repository at 200
skills, 200 files, 10 MiB per file, 25 MiB per skill, text files
only. A binary file blocks that skill from loading. Names keep 64
characters or less and match their directory. Descriptions keep 1024
characters or less. This package fits these caps: the name uses 10
characters, the description uses fewer than 1024 characters, and
every payload file is text (observed 2026-10-07). Duplicates resolve
first-`name`-wins: a local copy masks a repository copy, and a
personal copy masks a workspace copy.

## Muse Code

- Version and surface: CLI 1.4.3, doc examples 1.3.0, Developer
  Preview. Sources: the marketplaces-and-updates and compatibility
  guides at meta-models.github.io, plus local `--help` and read-only
  probes, 2026-10-07.
- Tools and access: the `muse` CLI, network access to GitHub for
  the first snapshot, and read access to the private repository.
  Installs run offline from the snapshot.
- Method: native marketplace, then qualified install, then approve
  when the client asks. Local-path install as fallback.
- Scope: marketplace installs are always user scope. Local-path
  installs accept user or project scope.

Shell commands:

```sh
muse plugins marketplace add tailrocks tailrocks/tailrocks-skills
muse plugins install asd-ste100-skill@tailrocks
```

This package ships no hooks and no MCP servers, so there is usually
nothing to approve. When the client reports capabilities that wait at
`review_needed`, approve them explicitly.

Local fallback. Clone per the local package section, then install
the local path (verified form in local `--help`, 2026-10-07):

```sh
muse plugins install ./tailrocks-asd-ste100-skills --scope user
```

Inspect the install (shell):

```sh
muse plugins list --json
```

Validate a local checkout without install (shell, read-only):

```sh
muse plugins validate ./tailrocks-asd-ste100-skills --json
muse skills validate ./tailrocks-asd-ste100-skills/skills/asd-ste100
```

Selection example (session): select the skill in the `/` picker and
invoke its shown slash shortcut:

```text
/asd-ste100 Rewrite this server upgrade procedure.
```

Update and reload (shell). Refresh the catalog first. Installed
plugins never follow the refreshed snapshot, so refresh one git
plugin with the remove plus install sequence, then re-approve when
the client asks:

```sh
muse plugins marketplace update tailrocks
muse plugins remove asd-ste100-skill@tailrocks
muse plugins install asd-ste100-skill@tailrocks
```

For the local fallback, pull the checkout and run the local-path
install again.

Removal (shell):

```sh
muse plugins remove asd-ste100-skill@tailrocks
```

Add `--delete-data` to also remove the plugin data directory. The
data directory stays without the flag.

Limits and evidence: the first marketplace add clones over git with a
60 second timeout and stores a snapshot. The catalog probe reads
`marketplace.json`, then the Codex form, then the Claude form.
Removing a marketplace keeps installed plugins working but ends
their git update path. The catalog `name` must equal the manifest
`name` or install fails. Always qualify `@marketplace`.

## OpenCode

- Version and surface: V1 and V2 docs, file copy, no install verb.
  Sources: the skills pages at opencode.ai (V1, last updated Oct 6,
  2026) and opencode.ai/v2/docs/skills, full pages, 2026-10-07. The
  `opencode` CLI is absent locally, so these steps are doc-derived
  and unverified here.
- Tools and access: a shell and a local checkout of the package.
- Method: copy the complete skill directory, including references.
- Scope: project `.opencode/skills/` (plus `.claude/` and `.agents/`
  compatibility directories), or user `~/.config/opencode/skills/`.

Shell commands for the project scope:

```sh
git clone https://github.com/tailrocks/tailrocks-asd-ste100-skills
mkdir -p .opencode/skills
cp -R tailrocks-asd-ste100-skills/skills/asd-ste100 .opencode/skills/
```

Shell commands for the user scope:

```sh
git clone https://github.com/tailrocks/tailrocks-asd-ste100-skills
mkdir -p ~/.config/opencode/skills
cp -R tailrocks-asd-ste100-skills/skills/asd-ste100 ~/.config/opencode/skills/
```

Inspect the install (shell): list the copied directory and confirm
it holds its own `SKILL.md` file:

```sh
ls .opencode/skills/asd-ste100/SKILL.md
```

Selection example. V1 uses `skill({name})` in the prompt. V2 uses
the path-derived case-sensitive id with `@` mention or
`skill({id})`. Request the skill by name in the prompt:

```text
Use the asd-ste100 skill. Rewrite this server upgrade procedure.
```

Update and reload: pull the checkout and replace the copied files
with the new package files. There is no reload command. V2 lists
permitted skills per step.

Removal: delete the copied skill directory and drop stale `skills`
array entries from `opencode.json`. There is no documented remove
verb.

Limits and evidence: V1 names use 1 to 64 lowercase hyphenated
characters and match their directory. Descriptions use 1 to 1024
characters. This package fits: the name uses 10 characters and the
description uses fewer than 1024 characters (observed 2026-10-07).
Never write these V2 keys into V1 instructions:
`metadata.opencode/autoinvoke`, `disable-model-invocation`,
`permission.skill`. The V1 `permission.skill` map and the V2 JSONC
permissions are different schemas. Keep V1 and V2 instructions
separate. Keep one copy per skill. On V2, use the project
`.opencode` directory, not the global directory. On V1, keep names
unique.

## Antigravity

- Version and surface: docs unversioned, surfaces "Antigravity 2.0 /
  CLI / IDE". Sources: the plugins, marketplace, skills, and CLI
  reference pages at antigravity.google, 2026-10-07. The `agy` CLI
  is absent locally, so these commands are doc-derived and
  unverified here.
- Tools and access: the `agy` CLI and a local checkout of the
  package. There is no Git-URL install form.
- Method: local-path plugin install, or native skill-directory copy.
- Scope: workspace `.agents/` directories or global `~/.gemini/`
  directories. The CLI skill paths are `.agents/skills/` in the
  workspace and `~/.gemini/antigravity-cli/skills/` globally.

Shell commands for the plugin route. Clone first, then install the
local path:

```sh
git clone https://github.com/tailrocks/tailrocks-asd-ste100-skills
agy plugin install ./tailrocks-asd-ste100-skills
```

Shell commands for the native skill route:

```sh
git clone https://github.com/tailrocks/tailrocks-asd-ste100-skills
mkdir -p .agents/skills
cp -R tailrocks-asd-ste100-skills/skills/asd-ste100 .agents/skills/
```

Inspect the install. Shell:

```sh
agy plugin list
```

Session:

```text
/plugin list
```

Selection example (session). The CLI converts each skill to a slash
command:

```text
/asd-ste100 Rewrite this server upgrade procedure.
```

Update and reload: no update, upgrade, refresh, or reload command is
documented. The docs describe only the 2.0 to CLI sync.
Reload-after-edit behavior and collision precedence are undocumented.
Pull the checkout, reinstall the local path after upstream changes,
and verify the loaded copy.

Removal. Shell:

```sh
agy plugin uninstall asd-ste100-skill
```

Session:

```text
/plugin uninstall asd-ste100-skill
```

Uninstall removes files and registry entries. For the native skill
route, delete the copied skill directory.

Limits and evidence: the plugin install accepts a local path only.
There is no public marketplace catalog JSON. The root manifest must
not carry the Antigravity schema. This package carries the portable
Agent Plugins 1.0.0 schema (observed 2026-10-07). Antigravity
frontmatter supports only `name` and `description`. Keep one copy
per skill: no precedence is documented.

## Grok Build

- Version and surface: docs unversioned, CLI plus project files.
  Sources: the skills-plugins-marketplaces and CLI reference pages
  at docs.x.ai, plus the xai-org plugin-marketplace repository,
  2026-10-07. Install syntax is corroborated by ten or more
  consistent third-party READMEs. The `grok` CLI is absent locally,
  so these commands are doc-derived and unverified here.
- Tools and access: the `grok` CLI, network access to GitHub, and
  read access to the private repository.
- Method: native marketplace, then install with explicit trust.
  Project skill directory as fallback.
- Scope: user scope under `~/.grok/`. Project scope needs manual
  placement under `./.grok/plugins` or `./.grok/skills`.

Shell commands:

```sh
grok plugin marketplace add tailrocks/tailrocks-skills
grok plugin install asd-ste100-skill --trust
```

The `--trust` flag is required. The `@marketplace` qualified form
and the direct `owner/repo` and `./path` source forms come from
third-party evidence only. Compare them with current `grok --help`
at install time before use.

Local fallback. Clone per the local package section, then copy the
complete skill directory to the project skill path:

```sh
mkdir -p ./.grok/skills
cp -R tailrocks-asd-ste100-skills/skills/asd-ste100 ./.grok/skills/
```

Inspect the install (shell):

```sh
grok inspect --json
```

Selection example (session):

```text
/asd-ste100 Rewrite this server upgrade procedure.
```

Update and reload: the `plugin update` and `marketplace update`
verbs are official, but their semantics come from third-party
sources (bump the sha, regenerate the index). Reload is
third-party-only with no official statement. Verify behavior on the
installed build. For the local fallback, pull the checkout and copy
the skill directory again.

Removal (shell):

```sh
grok plugin uninstall asd-ste100-skill
```

For the local fallback, delete the copied skill directory. Removal
file effects and name-collision behavior are unresolved. Verify on
the installed build.

Limits and evidence: remote catalog entries need the full 40
character lowercase `sha`. Branches, tags, and short SHAs are
rejected, and the client re-verifies the sha against the cloned
head. The `.grok-plugin/plugin-index.json` file is generated: never
hand-edit it. Grok reads the Claude catalog with zero-config
compatibility. Do not treat `allowed-tools` metadata as an
enforced tool-permission boundary.

## Kimi Code

- Version and surface: docs unversioned, CLI surface with in-session
  commands only. Sources: the plugins and skills pages at kimi.com,
  2026-10-07. The `kimi` CLI is absent locally, so these commands
  are doc-derived and unverified here.
- Tools and access: a Kimi Code session with network access to
  github.com and codeload.github.com, plus read access to the
  private repository.
- Method: in-session plugin manager with a commit-pinned source.
  There is no shell verb.
- Scope: user only. Project-level install is unsupported.

Session commands. Register the central catalog first. Kimi never
auto-discovers the catalog, so the marketplace URL is required:

```text
/plugins marketplace https://raw.githubusercontent.com/tailrocks/tailrocks-skills/c401bb7f8aeb77cc8d0cec0b99ce2ab2e0427f3e/.kimi-plugin/marketplace.json
/plugins install https://github.com/tailrocks/tailrocks-asd-ste100-skills/commit/0572839a13afc145083535b3e29c79b78489af40
```

The commit pin is the recommended form. The catalog pin above is the
verified central-catalog revision of 2026-10-07. The package pin
above is the verified base revision of this rewrite. After the
release, move the package pin to the release revision. Apply
every install, enable, disable, or remove with `/reload` or a new
session.

Inspect the install (session):

```text
/plugins list
/plugins info asd-ste100-skill
```

Selection example (session):

```text
/skill:asd-ste100 Rewrite this server upgrade procedure.
```

Update and reload: there is no `update` subcommand. The manager UI
offers an update when one is available. Official plugins do not
auto-update. Run `/reload` after each change.

Removal (session):

```text
/plugins remove asd-ste100-skill
```

Removal deletes the installation record but leaves the managed copy
on disk. Delete the
`$KIMI_CODE_HOME/plugins/managed/asd-ste100-skill/`
directory to clear it fully. The CLI always runs from that managed
copy: reinstall after upstream changes.

Limits and evidence: fields cap at 32 KB each and 64 KB total
`systemPrompt`. Non-`.md` command files are ignored. Paths stay
confined to the plugin root. Manifest names match
`[a-z0-9][a-z0-9_-]{0,63}`. This package name fits (observed
2026-10-07). The `.kimi-plugin/plugin.json` manifest must set
`skills` to `./skills/`. Without it, Kimi reads a root SKILL.md
instead. This package sets it (observed 2026-10-07). Invocation
nesting caps at three levels. Duplicates resolve Project over User
over Extra over Built-in. Audit enabled plugins: a
`sessionStart.skill` injection can bypass selection gates.

## Migrate from the old install

Older installs copied the skill directory by hand or registered the
package directory as its own marketplace. Move each install to the
central `tailrocks` marketplace or to the authorized local package
route above.

Claude Code (shell):

```sh
claude plugin uninstall asd-ste100-skill --scope user
claude plugin marketplace remove asd-ste100-skill
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install asd-ste100-skill@tailrocks --scope user
```

Removing a marketplace uninstalls its plugins and strips
`enabledPlugins`, so the explicit uninstall first keeps the record
clean. Repeat the uninstall for `project` and `local` scopes when
used. Delete any hand-copied `asd-ste100` skill directory after the
marketplace install succeeds.

Codex (shell):

```sh
codex plugin remove asd-ste100-skill@asd-ste100-skill
codex plugin marketplace remove asd-ste100-skill
codex plugin marketplace add tailrocks/tailrocks-skills
codex plugin add asd-ste100-skill@tailrocks
```

Muse (shell):

```sh
muse plugins remove asd-ste100-skill@asd-ste100-skill
muse plugins marketplace remove asd-ste100-skill
muse plugins marketplace add tailrocks tailrocks/tailrocks-skills
muse plugins install asd-ste100-skill@tailrocks
```

Grok (shell):

```sh
grok plugin uninstall asd-ste100-skill
grok plugin marketplace remove asd-ste100-skill
grok plugin marketplace add tailrocks/tailrocks-skills
grok plugin install asd-ste100-skill --trust
```

Kimi (session):

```text
/plugins remove asd-ste100-skill
/plugins marketplace https://raw.githubusercontent.com/tailrocks/tailrocks-skills/c401bb7f8aeb77cc8d0cec0b99ce2ab2e0427f3e/.kimi-plugin/marketplace.json
/plugins install https://github.com/tailrocks/tailrocks-asd-ste100-skills/commit/0572839a13afc145083535b3e29c79b78489af40
```

Then run `/reload` and delete the stale managed copy when needed.

Amp: delete the old installed skill directory, add the new skill
directory, and run the `reload_skills` tool. OpenCode and
Antigravity native routes: delete the old copied directory and
copy the new one. Antigravity plugin route: run `agy plugin
uninstall asd-ste100-skill`, then install the new local path.
