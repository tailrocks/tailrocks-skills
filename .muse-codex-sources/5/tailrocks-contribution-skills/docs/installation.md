# Installation

Install the package `tailrocks-contribution-skills` from the central
`tailrocks` marketplace. The marketplace source is
`tailrocks/tailrocks-skills`. The qualified plugin id is
`tailrocks-contribution-skills@tailrocks`. Always use the qualified id.
It prevents collisions with same-named plugins.

Each section below names the exact version, surface, and source. Shell
commands run in a terminal. Session commands run inside the agent
session. This guide recorded all commands on 2026-10-07.

## Runtime requirements

All contribution workflows need Git and `gh`. All workflows including
read-only reconnaissance need an authenticated `gh` session with access
to the fork and the target project. Only GitHub.com is supported.
GitHub Enterprise is unsupported.

Before install, examine the package. Read `plugin.json`, the host manifests,
and the five files under `skills/`. This package holds skills and references
only. It adds no hooks and no MCP servers.

## User-only skills

All five skills need an explicit human command. A model must not
select a contribution skill from task similarity. Support differs per
client:

- Enforced on Claude Code, Codex, Kimi Code, and Grok Build. The
  client blocks automatic model invocation.
- Limited on Amp, Antigravity, and Muse Code. These clients cannot
  enforce per-skill user-only entry. Invoke every skill only through
  an explicit human command.
- Gated by `permission.skill` on OpenCode v1. Set the value to `ask`
  for the five skills.

Load or select a skill. Neither action authorizes side effects.
Each run needs its own human invocation.

## Claude Code

The install facts are:

- Version and surface: `claude` 2.1.289, CLI. Sources: the plugin
  docs at code.claude.com (five pages, HTTP 200) and local `--help`,
  2026-10-07.
- Tools and access: the `claude` CLI and network access to GitHub.
  Private repository work needs an authenticated `gh` session.
- Method: native marketplace, then qualified install.
- Scope: user, project, or local.

Run these shell commands:

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-contribution-skills@tailrocks --scope user
```

Inspect the install (shell):

```sh
claude plugin list
claude plugin details tailrocks-contribution-skills
```

Use this selection example in the session:

```text
/tailrocks-contribution-skills:tailrocks-contribute-recon OWNER/REPO
```

Update and reload in the shell forms. Update one plugin (there is
no update-all), or refresh the marketplace listing and its installed
plugins. After changes, reload in the session:

```sh
claude plugin update tailrocks-contribution-skills@tailrocks
claude plugin marketplace update tailrocks
```

```text
/reload-plugins
```

Remove the plugin in the shell form:

```sh
claude plugin uninstall tailrocks-contribution-skills --scope user
```

These limits apply with their evidence. Marketplace removal
uninstalls installed plugins. Removal also clears `enabledPlugins`.

Cloud sessions load no local or project plugins. A project scope
needs one install per machine.

The client rejects sources with `..` (loading and
manifest-reference docs, 2026-10-07).

## Codex

The install facts are:

- Version and surface: codex-cli 0.160.1, CLI. Sources: the plugin
  guide at developers.openai.com, the developer-commands and
  skills-and-plugins pages at learn.chatgpt.com, and local `--help`,
  2026-10-07.
- Tools and access: the `codex` CLI and network access to GitHub.
- Method: native marketplace, then qualified add.
- Scope: user install under `~/.codex/plugins/`, plus project enable
  in `.codex/config.toml`.

Run these shell commands:

```sh
codex plugin marketplace add tailrocks/tailrocks-skills
codex plugin add tailrocks-contribution-skills@tailrocks
```

Inspect the install (shell):

```sh
codex plugin list --available --json
```

Use this selection example in the session:

```text
$tailrocks-contribute-recon OWNER/REPO
```

Update and reload in the shell form. This refreshes the
marketplace snapshots for configured plugins, even disabled ones:

```sh
codex plugin marketplace upgrade tailrocks
```

Remove the plugin in the shell form:

```sh
codex plugin remove tailrocks-contribution-skills@tailrocks
```

These limits apply with their evidence. Codex 0.160.1 has no
`install`, `update`, or `validate` verbs (local `--help`).
Marketplace refresh is separate from installed-plugin refresh:
there is no verb to refresh one installed plugin.

After local edits, restart the desktop app. Whether `marketplace
remove` also removes installed plugins is unresolved in the docs.

Identity is `name@marketplace`: always qualify the id.

## Amp

The install facts are:

- Version and surface: docs unversioned, CLI plus hosted threads.
  Sources: the skills, plugins, global-plugins-and-skills, and
  settings pages at ampcode.com, plus the official building-skills
  guide, 2026-10-07. The `amp` CLI is absent locally, so these
  commands are doc-derived and unverified here.
- Tools and access: the `amp` CLI and a local checkout of the
  package. Each skill installs as its own directory.
- Method: per-skill add from local paths.
- Scope: project `.agents/skills/`, machine-local
  `~/.config/agents/skills/`, or personal and workspace hosted
  scopes.

Clone once. Then add each of the five skill directories:

```sh
git clone https://github.com/tailrocks/tailrocks-contribution-skills
for skill in tailrocks-contribute-recon tailrocks-contribute-propose \
    tailrocks-contribute-prepare tailrocks-contribute-submit \
    tailrocks-contribute-respond; do
  amp skill add ./tailrocks-contribution-skills/skills/"$skill" \
    --name "$skill"
done
```

Each add copies the full skill directory with its references. Add
`--global` for the machine-local scope. Add `--overwrite` to replace
an older copy.

Inspect the install (shell):

```sh
amp skills list --json
```

Amp has no slash invoke. Ask the thread for the exact qualified
skill by name:

```text
Use the tailrocks-contribution-skills:tailrocks-contribute-recon skill on OWNER/REPO.
```

After changes, run the `reload_skills` tool to update and reload.
No restart is needed. Hosted update is documented under two names (`amp skill update`
on the Global page, `amp skills update` in building-skills). Before
use, verify the correct verb against the installed CLI.

To remove, delete the installed skill directory. Then run the
`reload_skills` tool. There is no documented remove subcommand. Never
delete the loader cache directory.

These limits apply with their evidence. Hosted installs allow
each repository 200 skills, 200 files, 10 MiB per file, 25 MiB per
skill, and text files only. A binary file blocks that skill from
loading.

Names stay at 64 characters or less and match their directory.
Descriptions stay at 1024 characters or less.

All five skills in this package fit. Names are 28 characters or
less. Descriptions are 292 characters or less. Every payload file
is text (observed 2026-10-07).

For duplicates, a local copy beats a repository copy. A personal
copy beats a workspace copy. Amp cannot enforce per-skill user-only
entry: it lists every discovered skill to the model. Remove or
disable untrusted skill sources.

## Muse Code

The install facts are:

- Version and surface: CLI 1.4.3, doc examples 1.3.0, Developer
  Preview. Sources: the marketplaces-and-updates and compatibility
  guides at meta-models.github.io, plus local `--help` and read-only
  probes, 2026-10-07.
- Tools and access: the `muse` CLI and network access to GitHub for
  the first snapshot. Installs run offline from the snapshot.
- Method: native marketplace, then qualified install, then
  client approval.
- Scope: marketplace installs are always user scope. Local-path
  installs accept user or project scope.

Run these shell commands:

```sh
muse plugins marketplace add tailrocks tailrocks/tailrocks-skills
muse plugins install tailrocks-contribution-skills@tailrocks
```

This package holds no hooks and no MCP servers, so there is usually
nothing to approve. When the client reports capabilities that wait at
`review_needed`, approve them explicitly.

Inspect the install (shell):

```sh
muse plugins list --json
```

Validate a local checkout without install (shell, read-only):

```sh
muse plugins validate ./tailrocks-contribution-skills --json
muse skills validate ./tailrocks-contribution-skills/skills/tailrocks-contribute-recon
```

In the session, select the skill in the `/` picker. Invoke its
shown slash shortcut:

```text
/tailrocks-contribute-recon OWNER/REPO
```

Update and reload in the shell form. Refresh the catalog first.
Installed plugins ignore the refreshed snapshot. Refresh one git
plugin through the remove-and-install sequence:

```sh
muse plugins marketplace update tailrocks
muse plugins remove tailrocks-contribution-skills@tailrocks
muse plugins install tailrocks-contribution-skills@tailrocks
```

When the client asks, re-approve.

Remove the plugin in the shell form:

```sh
muse plugins remove tailrocks-contribution-skills@tailrocks
```

Add `--delete-data` to also remove the plugin data directory. The
data directory stays without the flag.

These limits apply with their evidence. The first marketplace add
clones over git with a 60-second timeout and stores a snapshot. The
catalog probe reads `marketplace.json`, then the Codex form, then
the Claude form.

Marketplace removal keeps installed plugins working. Removal ends
their git update path.

The catalog `name` must equal the manifest `name` or install fails.
Always qualify `@marketplace`.

Muse documents no frontmatter user-only enforcement. Its
skill-recall observer can surface skills automatically. Invoke
every skill only through an explicit human `/` picker command.

## OpenCode

The install facts are:

- Version and surface: V1 and V2 docs, file copy, no install verb.
  Sources: the skills pages at opencode.ai (V1, last updated Oct 6,
  2026) and opencode.ai/v2/docs/skills, full pages, 2026-10-07. The
  `opencode` CLI is absent locally, so these steps are doc-derived
  and unverified here.
- Tools and access: a shell and a local checkout of the package.
- Method: copy complete skill directories with their references.
- Scope: project `.opencode/skills/` (plus `.claude/` and `.agents/`
  compatibility directories), or user `~/.config/opencode/skills/`.

For the project scope, run these shell commands:

```sh
git clone https://github.com/tailrocks/tailrocks-contribution-skills
mkdir -p .opencode/skills
cp -R tailrocks-contribution-skills/skills/. .opencode/skills/
```

For the user scope, run these shell commands:

```sh
git clone https://github.com/tailrocks/tailrocks-contribution-skills
mkdir -p ~/.config/opencode/skills
cp -R tailrocks-contribution-skills/skills/. ~/.config/opencode/skills/
```

Inspect the install (shell). List the copied directories. Confirm
each holds its own `SKILL.md` file:

```sh
ls .opencode/skills/tailrocks-contribute-recon/SKILL.md
```

Selection differs by version. V1 uses `skill({name})` in the
prompt. V2 uses
the path-derived case-sensitive id with `@` mention or
`skill({id})`. Request the skill by name in the prompt:

```text
Use the tailrocks-contribute-recon skill on OWNER/REPO. Report the
contract only. Do not propose or submit.
```

To update and reload, replace the copied files with the new
package files. There is no reload command. V2 lists permitted skills for each
step.

To remove, delete the copied skill directories. Drop stale
`skills` array entries from `opencode.json`. There is no documented remove
verb.

These limits apply with their evidence. V1 names use 1 to 64
lowercase hyphenated characters and match their directory.
Descriptions use 1 to 1024 characters.

All five skills in this package fit: names are 28 characters or
less, descriptions are 292 characters or less (observed
2026-10-07).

Never write V2 keys (`metadata.opencode/autoinvoke`,
`disable-model-invocation`, `permission.skill`) into V1
instructions. The V1 `permission.skill` map and the V2 JSONC
permissions are different schemas. Keep V1 and V2 instructions
separate. Gate the five user-only skills with
`permission.skill` set to `ask` on V1:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "skill": {
      "tailrocks-contribute-recon": "ask",
      "tailrocks-contribute-propose": "ask",
      "tailrocks-contribute-prepare": "ask",
      "tailrocks-contribute-submit": "ask",
      "tailrocks-contribute-respond": "ask"
    }
  }
}
```

On V2, a later-registered source beats an earlier source. The
project `.opencode` directory beats the global directory. On V1,
names must be unique. Keep one copy per skill.

## Antigravity

The install facts are:

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

For the plugin route, clone the package first. Then install the
local path:

```sh
git clone https://github.com/tailrocks/tailrocks-contribution-skills
agy plugin install ./tailrocks-contribution-skills
```

For the native skill route, run these shell commands:

```sh
git clone https://github.com/tailrocks/tailrocks-contribution-skills
mkdir -p .agents/skills
cp -R tailrocks-contribution-skills/skills/. .agents/skills/
```

Inspect the install in the shell form:

```sh
agy plugin list
```

Use the session form:

```text
/plugin list
```

The CLI converts each skill to a slash command:

```text
/tailrocks-contribute-recon OWNER/REPO
```

For update and reload, no update, upgrade, refresh, or reload
command is documented. The docs describe only the transfer from 2.0 to CLI.
Reload-after-edit behavior and collision precedence are undocumented.
After upstream changes, reinstall the local path. Verify the
loaded copy.

Remove the plugin in the shell form:

```sh
agy plugin uninstall tailrocks-contribution-skills
```

Use the session form:

```text
/plugin uninstall tailrocks-contribution-skills
```

Uninstall removes files and registry entries. For the native skill
route, delete the copied skill directories.

These limits apply with their evidence. The plugin install
accepts a local path only. There is no public marketplace catalog
JSON.

The root manifest must not carry the Antigravity schema. This
package uses the portable Agent Plugins 1.0.0 schema (observed
2026-10-07).

Antigravity frontmatter supports only `name` and `description`.
User-only entry has no enforcement here. The agent auto-reads
skills.

Invoke every skill only through an explicit human `/<skill-name>`
command. Keep one copy per skill: no precedence is documented.

## Grok Build

The install facts are:

- Version and surface: docs unversioned, CLI plus project files.
  Sources: the skills-plugins-marketplaces and CLI reference pages
  at docs.x.ai, plus the xai-org plugin-marketplace repository,
  2026-10-07. Ten or more consistent third-party READMEs confirm the install
  syntax. The `grok` CLI is absent locally,
  so these commands are doc-derived and unverified here.
- Tools and access: the `grok` CLI and network access to GitHub.
- Method: native marketplace, then install with explicit trust.
- Scope: user scope under `~/.grok/`. Project scope needs manual
  placement under `./.grok/plugins` or `./.grok/skills`.

Run these shell commands:

```sh
grok plugin marketplace add tailrocks/tailrocks-skills
grok plugin install tailrocks-contribution-skills --trust
```

The `--trust` flag is required. The `@marketplace` qualified form and the
direct `owner/repo` and `./path` source forms come from third-party evidence
only. Before use, compare them with current `grok --help` at install time.

Inspect the install (shell):

```sh
grok inspect --json
```

Use this selection example in the session:

```text
/tailrocks-contribute-recon OWNER/REPO
```

For update and reload, the `plugin update` and `marketplace update`
verbs are official. Their semantics come from third-party sources
(update the `sha`, regenerate the index). Reload is
third-party-only with no official statement. Verify behavior on the
installed build.

Remove the plugin in the shell form:

```sh
grok plugin uninstall tailrocks-contribution-skills
```

Removal file effects and name-collision behavior are unresolved.
Verify on the installed build.

These limits apply with their evidence. Remote catalog entries
need the full 40-character lowercase `sha`. The client rejects
branches, tags, and short SHAs. The client re-verifies the `sha`
against the cloned head.

The `.grok-plugin/plugin-index.json` file is generated: never
hand-edit it. Grok reads the Claude catalog with zero-config
compatibility.

This package sets `disable-model-invocation` to `true` on all five
skills. Do not treat `allowed-tools` metadata as an enforced
tool-permission boundary.

## Kimi Code

The install facts are:

- Version and surface: docs unversioned, CLI surface with in-session
  commands only. Sources: the plugins and skills pages at kimi.com,
  2026-10-07. The `kimi` CLI is absent locally, so these commands
  are doc-derived and unverified here.
- Tools and access: a Kimi Code session with network access to
  github.com and codeload.github.com.
- Method: in-session plugin manager with a commit-pinned source.
  There is no shell verb.
- Scope: user only. Project-level install is unsupported.

Use session commands. Register the central catalog first. Kimi never
auto-discovers the catalog, so the marketplace URL is required:

```text
/plugins marketplace https://raw.githubusercontent.com/tailrocks/tailrocks-skills/c401bb7f8aeb77cc8d0cec0b99ce2ab2e0427f3e/.kimi-plugin/marketplace.json
/plugins install https://github.com/tailrocks/tailrocks-contribution-skills/commit/3e51bc5c91949f361ed926d8f760bcb16edef111
```

The commit pin is the recommended form. The pin above is the pre-rewrite
package revision (version 0.28.0). After the rewrite release, update the pin
to the release revision. Apply every install,
enable, disable, or remove through `/reload` or a new session.

Inspect the install (session):

```text
/plugins list
/plugins info tailrocks-contribution-skills
```

Use this selection example in the session:

```text
/skill:tailrocks-contribute-recon OWNER/REPO
```

For update and reload, there is no `update` subcommand. The manager UI offers
an update when one is available. Official plugins do not auto-update. After
each change, run `/reload`.

Remove the plugin in the session form:

```text
/plugins remove tailrocks-contribution-skills
```

Removal deletes the installation record. The managed copy stays
on disk. Delete the
`$KIMI_CODE_HOME/plugins/managed/tailrocks-contribution-skills/`
directory to clear it fully. The CLI always runs from that managed copy. After upstream
changes, reinstall.

These limits apply with their evidence. Fields allow 32 KB each
and 64 KB total `systemPrompt`. The client ignores non-`.md`
command files. Paths stay confined to the plugin root.

Manifest names match `[a-z0-9][a-z0-9_-]{0,63}`. This package name
fits (observed 2026-10-07).

The `.kimi-plugin/plugin.json` manifest must set `skills` to
`./skills/`. Without it, Kimi reads a root SKILL.md instead. This
package sets it (observed 2026-10-07).

Invocation nesting allows three levels. Duplicates resolve Project
over User over Extra over Built-in.

All five skills set `disableModelInvocation` to `true`: invoke them
only with an explicit `/skill:` command. Audit enabled plugins: a
`sessionStart.skill` injection can skip the gate.

## Migrate from the old catalog

Older installs used the self-hosted `tailrocks-contribution-skills`
marketplace, which this restructure removed. Move each install to
the central `tailrocks` marketplace in this order:

1. Uninstall each plugin from each scope.
2. Remove the old marketplace.
3. Add the new marketplace.
4. Install the plugin.

The order prevents duplicates.

For Claude Code, run these shell commands:

```sh
claude plugin uninstall tailrocks-contribution-skills --scope user
claude plugin marketplace remove tailrocks-contribution-skills
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-contribution-skills@tailrocks --scope user
```

Marketplace removal uninstalls installed plugins. Removal also
clears `enabledPlugins`. The explicit uninstall first keeps the
record clean. When used, repeat the uninstall for `project` and
`local` scopes.

For Codex, run these shell commands:

```sh
codex plugin remove tailrocks-contribution-skills@tailrocks-contribution-skills
codex plugin marketplace remove tailrocks-contribution-skills
codex plugin marketplace add tailrocks/tailrocks-skills
codex plugin add tailrocks-contribution-skills@tailrocks
```

For Muse, run these shell commands:

```sh
muse plugins remove tailrocks-contribution-skills@tailrocks-contribution-skills
muse plugins marketplace remove tailrocks-contribution-skills
muse plugins marketplace add tailrocks tailrocks/tailrocks-skills
muse plugins install tailrocks-contribution-skills@tailrocks
```

For Grok, run these shell commands:

```sh
grok plugin uninstall tailrocks-contribution-skills
grok plugin marketplace remove tailrocks-contribution-skills
grok plugin marketplace add tailrocks/tailrocks-skills
grok plugin install tailrocks-contribution-skills --trust
```

For Kimi, run these session commands:

```text
/plugins remove tailrocks-contribution-skills
/plugins marketplace https://raw.githubusercontent.com/tailrocks/tailrocks-skills/c401bb7f8aeb77cc8d0cec0b99ce2ab2e0427f3e/.kimi-plugin/marketplace.json
/plugins install https://github.com/tailrocks/tailrocks-contribution-skills/commit/3e51bc5c91949f361ed926d8f760bcb16edef111
```

Then run `/reload`. When needed, delete the stale managed copy.

For Amp, delete the old skill directories. Add the five skill
directories. Run the `reload_skills` tool.

For OpenCode and Antigravity native routes, delete the old copied
directories. Copy the new ones. For the Antigravity plugin route,
run `agy plugin uninstall tailrocks-contribution-skills`. Install
the new local path.
