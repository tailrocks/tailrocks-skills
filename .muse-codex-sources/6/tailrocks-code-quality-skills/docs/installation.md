# Installation

Install the package `tailrocks-code-quality-skills` from the
central `tailrocks` marketplace. The marketplace source is
`tailrocks/tailrocks-skills`. The qualified plugin id is
`tailrocks-code-quality-skills@tailrocks`. Always use the
qualified id. It prevents collisions with same-named plugins.

Each section below names the exact version, surface, and
source. Shell commands run in a terminal. Session commands
run inside the agent session. All commands were recorded on
2026-10-07.

## Runtime requirements

Audits need Git and read access to the target repository.
Target verification commands need the repository toolchain
and explicit execution authority. Without authority, the
skills record proof as not run. No skill needs `gh`.

Vet the package before install. Read `plugin.json`, the host
manifests, and every file under `skills/`. This
package ships skills and references only. It adds no hooks
and no MCP servers.

## User-only skills

Thirteen skills need an explicit human command. A model must
not select them from task similarity. Only
`tailrocks-agents-md` is model-selectable, and it supplies
policy only. Support differs per client:

- Enforced on Claude Code, Codex, Kimi Code, and Grok
  Build. The client blocks automatic model invocation.
- Limited on Amp, Antigravity, and Muse Code. These
  clients cannot enforce per-skill user-only entry. Invoke
  the thirteen skills only through an explicit human
  command.
- Gated by `permission.skill` on OpenCode v1. Set the value
  to `ask` for the thirteen skills.

Loading or selecting a skill never authorizes side effects.
Each run needs its own human invocation.

## Claude Code

- Version and surface: `claude` 2.1.289, CLI. Sources: the
  plugin docs at code.claude.com (five pages, HTTP 200) and
  local `--help`, 2026-10-07.
- Tools and access: the `claude` CLI and network access to
  GitHub. Target work needs repository read access.
- Method: native marketplace, then qualified install.
- Scope: user, project, or local.

Shell commands:

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-code-quality-skills@tailrocks --scope user
```

Inspect the install (shell):

```sh
claude plugin list
claude plugin details tailrocks-code-quality-skills
```

Selection example (session):

```text
/tailrocks-code-quality-skills:tailrocks-improve-audit ./my-repo
```

Update and reload. Update one plugin (there is no
update-all), or refresh the marketplace listing and its
installed plugins (shell). Reload in the session after
changes:

```sh
claude plugin update tailrocks-code-quality-skills@tailrocks
claude plugin marketplace update tailrocks
```

```text
/reload-plugins
```

Removal (shell):

```sh
claude plugin uninstall tailrocks-code-quality-skills --scope user
```

Limits and evidence: removing a marketplace uninstalls its
plugins and strips `enabledPlugins`. Cloud sessions load no
local or project plugins. A project scope needs one install
per machine. Sources with `..` are rejected. Source: the
loading and manifest-reference docs, 2026-10-07.

## Codex

- Version and surface: codex-cli 0.160.1, CLI. Sources: the
  plugin guide at developers.openai.com, the
  developer-commands and skills-and-plugins pages at
  learn.chatgpt.com, and local `--help`, 2026-10-07.
- Tools and access: the `codex` CLI and network access to
  GitHub.
- Method: native marketplace, then qualified add.
- Scope: user install under `~/.codex/plugins/`, plus
  project enable in `.codex/config.toml`.

Shell commands:

```sh
codex plugin marketplace add tailrocks/tailrocks-skills
codex plugin add tailrocks-code-quality-skills@tailrocks
```

Inspect the install (shell):

```sh
codex plugin list --available --json
```

Selection example (session):

```text
$tailrocks-improve-audit ./my-repo
```

Update and reload (shell). This refreshes the marketplace
snapshots for configured plugins, even disabled ones:

```sh
codex plugin marketplace upgrade tailrocks
```

Removal (shell):

```sh
codex plugin remove tailrocks-code-quality-skills@tailrocks
```

Limits and evidence: Codex 0.160.1 has no `install`,
`update`, or `validate` verbs (local `--help`). Marketplace
refresh is separate from installed-plugin refresh: there is
no verb to refresh one installed plugin. Restart the desktop
app after local edits. Whether `marketplace remove` also
removes installed plugins is unresolved in the docs.
Identity is `name@marketplace`: always qualify the id.

## Amp

- Version and surface: docs unversioned, CLI plus hosted
  threads. Sources: the skills, plugins,
  global-plugins-and-skills, and settings pages at
  ampcode.com, plus the official building-skills guide,
  2026-10-07. The `amp` CLI is absent locally, so these
  commands are doc-derived and unverified here.
- Tools and access: the `amp` CLI and a local checkout of
  the package. Each skill installs as its own directory.
- Method: per-skill add from local paths.
- Scope: project `.agents/skills/`, machine-local
  `~/.config/agents/skills/`, or personal and workspace
  hosted scopes.

Shell commands. Clone once, then add each of the fourteen
skill directories:

```sh
git clone https://github.com/tailrocks/tailrocks-code-quality-skills
for skill in tailrocks-improve-audit tailrocks-improve-security-audit \
    tailrocks-improve-plan tailrocks-improve-execution \
    tailrocks-improve-reconcile tailrocks-code-health-audit \
    tailrocks-code-health tailrocks-root-cause tailrocks-remediate \
    tailrocks-simplify-audit tailrocks-simplify tailrocks-agents-md \
    tailrocks-agents-md-audit tailrocks-agents-md-sync; do
  amp skill add ./tailrocks-code-quality-skills/skills/"$skill" \
    --name "$skill"
done
```

Each add copies the full skill directory, including
references. Add `--global` for the machine-local scope. Add
`--overwrite` to replace an older copy.

Inspect the install (shell):

```sh
amp skills list --json
```

Selection example (session). Amp has no slash invoke. Ask
the thread for the exact qualified skill by name:

```text
Use the tailrocks-code-quality-skills:tailrocks-improve-audit skill on ./my-repo.
```

Update and reload: run the `reload_skills` tool after
changes. No restart is needed. Hosted update is documented
under two names (`amp skill update` on the Global page,
`amp skills update` in building-skills). Verify the correct
verb against the installed CLI before use.

Removal: delete the installed skill directory, then run the
`reload_skills` tool. There is no documented remove
subcommand. Never delete the loader cache directory.

Limits and evidence: hosted installs cap each repository at
200 skills, 200 files, 10 MiB per file, 25 MiB per skill,
text files only. A binary file blocks that skill from
loading. Names keep 64 characters or less and match their
directory. Descriptions keep 1024 characters or less. All
fourteen skills in this package fit these caps: names are
32 characters or less, and descriptions are 301 characters
or less. Every payload file is text (observed
2026-10-07).
Duplicates resolve first-`name`-wins: a local copy masks a
repository copy, and a personal copy masks a workspace copy.
Amp cannot enforce per-skill user-only entry: it lists every
discovered skill to the model. Remove or disable untrusted
skill sources.

## Muse Code

- Version and surface: CLI 1.4.3, doc examples 1.3.0,
  Developer Preview. Sources: the marketplaces-and-updates
  and compatibility guides at meta-models.github.io, plus
  local `--help` and read-only probes, 2026-10-07.
- Tools and access: the `muse` CLI and network access to
  GitHub for the first snapshot. Installs run offline from
  the snapshot.
- Method: native marketplace, then qualified install, then
  approve when the client asks.
- Scope: marketplace installs are always user scope.
  Local-path installs accept user or project scope.

Shell commands:

```sh
muse plugins marketplace add tailrocks tailrocks/tailrocks-skills
muse plugins install tailrocks-code-quality-skills@tailrocks
```

This package ships no hooks and no MCP servers, so there is
usually nothing to approve. When the client reports
capabilities that wait at `review_needed`, approve them
explicitly.

Inspect the install (shell):

```sh
muse plugins list --json
```

Validate a local checkout without install (shell,
read-only):

```sh
muse plugins validate ./tailrocks-code-quality-skills --json
muse skills validate ./tailrocks-code-quality-skills/skills/tailrocks-improve-audit
```

Selection example (session): select the skill in the `/`
picker and invoke its shown slash shortcut:

```text
/tailrocks-improve-audit ./my-repo
```

Update and reload (shell). Refresh the catalog first.
Installed plugins never follow the refreshed snapshot.
Refresh one git plugin with the remove plus install
sequence, then re-approve when the client asks:

```sh
muse plugins marketplace update tailrocks
muse plugins remove tailrocks-code-quality-skills@tailrocks
muse plugins install tailrocks-code-quality-skills@tailrocks
```

Removal (shell):

```sh
muse plugins remove tailrocks-code-quality-skills@tailrocks
```

Add `--delete-data` to also remove the plugin data
directory. The data directory stays without the flag.

Limits and evidence: the first marketplace add clones over
git with a 60 second timeout and stores a snapshot. The
catalog probe reads `marketplace.json`, then the Codex form,
then the Claude form. Removing a marketplace keeps
installed plugins working but ends their git update path.
The catalog `name` must equal the manifest `name` or install
fails. Always qualify `@marketplace`. Muse documents no
frontmatter user-only enforcement, and its skill-recall
observer can surface skills automatically. Invoke the
thirteen user-only skills only through an explicit human
`/` picker command.

## OpenCode

- Version and surface: V1 and V2 docs, file copy, no
  install verb. Sources: the skills pages at opencode.ai
  (V1, last updated Oct 6, 2026) and
  opencode.ai/v2/docs/skills, full pages, 2026-10-07. The
  `opencode` CLI is absent locally, so these steps are
  doc-derived and unverified here.
- Tools and access: a shell and a local checkout of the
  package.
- Method: copy complete skill directories, including
  references.
- Scope: project `.opencode/skills/` (plus `.claude/` and
  `.agents/` compatibility directories), or user
  `~/.config/opencode/skills/`.

Shell commands for the project scope:

```sh
git clone https://github.com/tailrocks/tailrocks-code-quality-skills
mkdir -p .opencode/skills
cp -R tailrocks-code-quality-skills/skills/. .opencode/skills/
```

Shell commands for the user scope:

```sh
git clone https://github.com/tailrocks/tailrocks-code-quality-skills
mkdir -p ~/.config/opencode/skills
cp -R tailrocks-code-quality-skills/skills/. ~/.config/opencode/skills/
```

Inspect the install (shell): list the copied directories and
confirm each holds its own `SKILL.md` file:

```sh
ls .opencode/skills/tailrocks-improve-audit/SKILL.md
```

Selection example. V1 uses `skill({name})` in the prompt.
V2 uses the path-derived case-sensitive id with `@` mention
or `skill({id})`. Request the skill by name in the prompt:

```text
Use the tailrocks-improve-audit skill on ./my-repo. Report only; change nothing.
```

Update and reload: replace the copied files with the new
package files. There is no reload command. V2 lists
permitted skills per step.

Removal: delete the copied skill directories and drop stale
`skills` array entries from `opencode.json`. There is no
documented remove verb.

Limits and evidence: V1 names use 1 to 64 lowercase
hyphenated characters and match their directory.
Descriptions use 1 to 1024 characters. All fourteen skills
in this package fit: names are 32 characters or less,
descriptions are 301 characters or less (observed
2026-10-07). Never write V2 keys into V1 instructions.
The keys are `metadata.opencode/autoinvoke`,
`disable-model-invocation`, and `permission.skill`. The V1
`permission.skill` map and the V2 JSONC permissions are
different schemas. Keep V1 and V2 instructions separate.
Gate the thirteen user-only skills with `permission.skill`
set to `ask` on V1:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "skill": {
      "tailrocks-improve-audit": "ask",
      "tailrocks-improve-security-audit": "ask",
      "tailrocks-improve-plan": "ask",
      "tailrocks-improve-execution": "ask",
      "tailrocks-improve-reconcile": "ask",
      "tailrocks-code-health-audit": "ask",
      "tailrocks-code-health": "ask",
      "tailrocks-root-cause": "ask",
      "tailrocks-remediate": "ask",
      "tailrocks-simplify-audit": "ask",
      "tailrocks-simplify": "ask",
      "tailrocks-agents-md-audit": "ask",
      "tailrocks-agents-md-sync": "ask"
    }
  }
}
```

Duplicates on V2 resolve later-registered source wins: the
project `.opencode` directory beats the global directory.
On V1, names must be unique. Keep one copy per skill.

## Antigravity

- Version and surface: docs unversioned, surfaces
  "Antigravity 2.0 / CLI / IDE". Sources: the plugins,
  marketplace, skills, and CLI reference pages at
  antigravity.google, 2026-10-07. The `agy` CLI is absent
  locally, so these commands are doc-derived and unverified
  here.
- Tools and access: the `agy` CLI and a local checkout of
  the package. There is no Git-URL install form.
- Method: local-path plugin install, or native
  skill-directory copy.
- Scope: workspace `.agents/` directories or global
  `~/.gemini/` directories. The CLI skill paths are
  `.agents/skills/` in the workspace and
  `~/.gemini/antigravity-cli/skills/` globally.

Shell commands for the plugin route. Clone first, then
install the local path:

```sh
git clone https://github.com/tailrocks/tailrocks-code-quality-skills
agy plugin install ./tailrocks-code-quality-skills
```

Shell commands for the native skill route:

```sh
git clone https://github.com/tailrocks/tailrocks-code-quality-skills
mkdir -p .agents/skills
cp -R tailrocks-code-quality-skills/skills/. .agents/skills/
```

Inspect the install. Shell:

```sh
agy plugin list
```

Session:

```text
/plugin list
```

Selection example (session). The CLI converts each skill to
a slash command:

```text
/tailrocks-improve-audit ./my-repo
```

Update and reload: no update, upgrade, refresh, or reload
command is documented. The docs describe only the 2.0 to CLI
sync. Reload-after-edit behavior and collision precedence
are undocumented. Reinstall the local path after upstream
changes and verify the loaded copy.

Removal. Shell:

```sh
agy plugin uninstall tailrocks-code-quality-skills
```

Session:

```text
/plugin uninstall tailrocks-code-quality-skills
```

Uninstall removes files and registry entries. For the native
skill route, delete the copied skill directories.

Limits and evidence: the plugin install accepts a local path
only. There is no public marketplace catalog JSON. The root
manifest must not carry the Antigravity schema. This package
carries the portable Agent Plugins 1.0.0 schema (observed
2026-10-07). Antigravity frontmatter supports only `name`
and `description`, so user-only entry cannot be enforced
here. The agent auto-reads skills. Invoke the thirteen
user-only skills only through an explicit human
`/<skill-name>` command. Keep one copy per skill: no
precedence is documented.

## Grok Build

- Version and surface: docs unversioned, CLI plus project
  files. Sources: the skills-plugins-marketplaces and CLI
  reference pages at docs.x.ai, plus the xai-org
  plugin-marketplace repository, 2026-10-07. Install syntax
  is corroborated by ten or more consistent third-party
  READMEs. The `grok` CLI is absent locally, so these
  commands are doc-derived and unverified here.
- Tools and access: the `grok` CLI and network access to
  GitHub.
- Method: native marketplace, then install with explicit
  trust.
- Scope: user scope under `~/.grok/`. Project scope needs
  manual placement under `./.grok/plugins` or
  `./.grok/skills`.

Shell commands:

```sh
grok plugin marketplace add tailrocks/tailrocks-skills
grok plugin install tailrocks-code-quality-skills --trust
```

The `--trust` flag is required. The `@marketplace` qualified
form and the direct `owner/repo` and `./path` source forms
come from third-party evidence only. Compare them with
current `grok --help` at install time before use.

Inspect the install (shell):

```sh
grok inspect --json
```

Selection example (session):

```text
/tailrocks-improve-audit ./my-repo
```

Update and reload: the `plugin update` and `marketplace
update` verbs are official, but their semantics come from
third-party sources (bump the sha, regenerate the index).
Reload is third-party-only with no official statement.
Verify behavior on the installed build.

Removal (shell):

```sh
grok plugin uninstall tailrocks-code-quality-skills
```

Removal file effects and name-collision behavior are
unresolved. Verify on the installed build.

Limits and evidence: remote catalog entries need the full 40
character lowercase `sha`. Branches, tags, and short SHAs
are rejected, and the client re-verifies the sha against the
cloned head. The `.grok-plugin/plugin-index.json` file is
generated: never hand-edit it. Grok reads the Claude catalog
with zero-config compatibility. This package sets
`disable-model-invocation` to `true` on the thirteen
user-only skills and to `false` on the one ordinary skill.
Do not treat `allowed-tools` metadata as an enforced
tool-permission boundary.

## Kimi Code

- Version and surface: docs unversioned, CLI surface with
  in-session commands only. Sources: the plugins and skills
  pages at kimi.com, 2026-10-07. The `kimi` CLI is absent
  locally, so these commands are doc-derived and unverified
  here.
- Tools and access: a Kimi Code session with network access
  to github.com and codeload.github.com.
- Method: in-session plugin manager with a commit-pinned
  source. There is no shell verb.
- Scope: user only. Project-level install is unsupported.

Session commands. Register the central catalog first. Kimi
never auto-discovers the catalog, so the marketplace URL is
required:

```text
/plugins marketplace https://raw.githubusercontent.com/tailrocks/tailrocks-skills/c401bb7f8aeb77cc8d0cec0b99ce2ab2e0427f3e/.kimi-plugin/marketplace.json
/plugins install https://github.com/tailrocks/tailrocks-code-quality-skills/commit/e63a82f28b688a7fada418e615aa9ec0eeec4c04
```

The commit pin is the recommended form. The pin above is the
last verified main revision of this package (version
0.28.0). It predates the restructure on branch
`standardize/package-rewrite`. Re-pin to the merge commit
after the branch merges. Apply every install, enable,
disable, or remove with `/reload` or a new session.

Inspect the install (session):

```text
/plugins list
/plugins info tailrocks-code-quality-skills
```

Selection example (session):

```text
/skill:tailrocks-improve-audit ./my-repo
```

Update and reload: there is no `update` subcommand. The
manager UI offers an update when one is available. Official
plugins do not auto-update. Run `/reload` after each
change.

Removal (session):

```text
/plugins remove tailrocks-code-quality-skills
```

Removal deletes the installation record but leaves the
managed copy on disk. Delete the
`$KIMI_CODE_HOME/plugins/managed/tailrocks-code-quality-skills/`
directory to clear it fully. The CLI always runs from that
managed copy: reinstall after upstream changes.

Limits and evidence: fields cap at 32 KB each and 64 KB
total `systemPrompt`. Non-`.md` command files are ignored.
Paths stay confined to the plugin root. Manifest names match
`[a-z0-9][a-z0-9_-]{0,63}`. This package name fits (observed
2026-10-07). The `.kimi-plugin/plugin.json` manifest must
set `skills` to `./skills/`. Without it, Kimi reads a root
SKILL.md instead. This package sets it (observed
2026-10-07). Invocation nesting caps at three levels.
Duplicates resolve Project over User over Extra over
Built-in. The thirteen user-only skills set
`disableModelInvocation` to `true`: invoke them only with an
explicit `/skill:` command. Audit enabled plugins: a
`sessionStart.skill` injection can bypass the gate.

## Migrate from the old catalog

Older installs used the self-hosted
`tailrocks-code-quality-skills` marketplace, which this
restructure removed. Move each install to the central
`tailrocks` marketplace in this order. Uninstall each plugin
per scope, then remove the old marketplace. Then add the new
marketplace and install the plugin. The order prevents
duplicates.

Claude Code (shell):

```sh
claude plugin uninstall tailrocks-code-quality-skills --scope user
claude plugin marketplace remove tailrocks-code-quality-skills
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-code-quality-skills@tailrocks --scope user
```

Removing a marketplace uninstalls its plugins and strips
`enabledPlugins`, so the explicit uninstall first keeps the
record clean. Repeat the uninstall for `project` and `local`
scopes when used.

Codex (shell):

```sh
codex plugin remove tailrocks-code-quality-skills@tailrocks-code-quality-skills
codex plugin marketplace remove tailrocks-code-quality-skills
codex plugin marketplace add tailrocks/tailrocks-skills
codex plugin add tailrocks-code-quality-skills@tailrocks
```

Muse (shell):

```sh
muse plugins remove tailrocks-code-quality-skills@tailrocks-code-quality-skills
muse plugins marketplace remove tailrocks-code-quality-skills
muse plugins marketplace add tailrocks tailrocks/tailrocks-skills
muse plugins install tailrocks-code-quality-skills@tailrocks
```

Grok (shell):

```sh
grok plugin uninstall tailrocks-code-quality-skills
grok plugin marketplace remove tailrocks-code-quality-skills
grok plugin marketplace add tailrocks/tailrocks-skills
grok plugin install tailrocks-code-quality-skills --trust
```

Kimi (session):

```text
/plugins remove tailrocks-code-quality-skills
/plugins marketplace https://raw.githubusercontent.com/tailrocks/tailrocks-skills/c401bb7f8aeb77cc8d0cec0b99ce2ab2e0427f3e/.kimi-plugin/marketplace.json
/plugins install https://github.com/tailrocks/tailrocks-code-quality-skills/commit/e63a82f28b688a7fada418e615aa9ec0eeec4c04
```

Then run `/reload` and delete the stale managed copy when
needed.

Amp: delete the old installed skill directories, add the
fourteen new skill directories, and run the `reload_skills`
tool. OpenCode and Antigravity native routes: delete the old
copied directories and copy the new ones. Antigravity plugin
route: run `agy plugin uninstall
tailrocks-code-quality-skills`, then install the new local
path.
