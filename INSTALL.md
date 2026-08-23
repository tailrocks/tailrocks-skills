# Installing and developing tailrocks-skills across agents

This document is the verified cross-agent contract for this repository: how each
supported agent discovers skills and plugins, how to install `tailrocks-skills`
for it, and how to keep one shared `skills/` tree from ever being shown twice in
any client. Everything below was verified in August 2026 against official
documentation, shipped client binaries, and live installs. Re-verify the
matrix and every command at each release; see the AGENTS.md release checklist.

Supported agents:

1. Claude Code (Anthropic)
2. Codex CLI (OpenAI)
3. OpenCode
4. Grok Build (xAI)
5. Kimi Code (Moonshot AI, TypeScript CLI)
6. Antigravity CLI (`agy`, Google — Gemini)
7. Amp

## What installs

Every channel below ships the same `skills/` tree — all of these skills, under
one shared directory:

- **Rust:** `tailrocks-rust-best-practices`, `tailrocks-rust-project-setup`,
  `tailrocks-rust-project-audit`, `tailrocks-rust-project-remediate`,
  `tailrocks-rust-review`, `tailrocks-rust-refactor`,
  `tailrocks-axum-best-practices`, `tailrocks-axum-review`,
  `tailrocks-axum-refactor`, `tailrocks-graphql-best-practices`,
  `tailrocks-graphql-review`,
  `tailrocks-grpc-best-practices`, `tailrocks-grpc-review`
- **TypeScript:** `tailrocks-typescript-best-practices`,
  `tailrocks-typescript-review`, `tailrocks-typescript-refactor`,
  `tailrocks-typescript-migrate`,
  `tailrocks-tanstack-project-setup`, `tailrocks-tanstack-project-audit`,
  `tailrocks-tanstack-project-migrate`, `tailrocks-tanstack-project-remediate`
- **macOS (native):** `tailrocks-swift-best-practices`,
  `tailrocks-swift-review`, `tailrocks-swift-refactor`,
  `tailrocks-swift-rust-core-boundary`,
  `tailrocks-swift-project-setup`, `tailrocks-swift-project-audit`,
  `tailrocks-swift-project-remediate`, `tailrocks-swift-agent-integration`,
  `tailrocks-swift-rust-core-setup`
- **Design and prototypes:** `tailrocks-macos-design`, `tailrocks-macos-design-review`,
  `tailrocks-macos-design-systematize`, `tailrocks-web-design`,
  `tailrocks-web-design-audit`, `tailrocks-tui-design`,
  `tailrocks-tui-design-audit`, `tailrocks-macos-visual-baseline`,
  `tailrocks-macos-visual-qa`, `tailrocks-macos-visual-regression`,
  `tailrocks-web-visual-baseline`, `tailrocks-web-visual-regression`
- **Code quality:** `tailrocks-code-health`, `tailrocks-code-health-audit`, `tailrocks-improve`,
  `tailrocks-improve-deep`, `tailrocks-improve-security`,
  `tailrocks-improve-plan`, `tailrocks-improve-execution`,
  `tailrocks-improve-reconcile`,
  `tailrocks-agents-md`, `tailrocks-agents-md-audit`,
  `tailrocks-agents-md-sync`,
  `tailrocks-retrospect`, `tailrocks-simplify`, `tailrocks-simplify-audit`,
  `tailrocks-root-cause`, `tailrocks-remediate`,
  `tailrocks-contribute-recon`, `tailrocks-contribute-propose`,
  `tailrocks-contribute-prepare`, `tailrocks-contribute-submit`,
  `tailrocks-contribute-respond`
- **Decision support:** `tailrocks-grilling`
- **Skill authoring:** `tailrocks-skill-create`, `tailrocks-skill-update`,
  `tailrocks-skill-audit`, `tailrocks-skill-refactor`
- **Pull requests:** `tailrocks-create-pr`, `tailrocks-refresh-pr`,
  `tailrocks-review-pr`, `tailrocks-merge-pr`,
  `tailrocks-document`, `tailrocks-pr-template`
- **Delivery pipeline:** `tailrocks-seed-roadmap`, `tailrocks-idea`,
  `tailrocks-brainstorm`,
  `tailrocks-research`, `tailrocks-record-decision`, `tailrocks-finalize`,
  `tailrocks-plan`, `tailrocks-record-feedback`, `tailrocks-prove`,
  `tailrocks-reconcile`

## Invocation policy

The registry classifies 11 skills as `MODEL_POLICY`: `tailrocks-agents-md`,
`tailrocks-axum-best-practices`, `tailrocks-graphql-best-practices`,
`tailrocks-grilling`, `tailrocks-grpc-best-practices`,
`tailrocks-macos-design`, `tailrocks-rust-best-practices`,
`tailrocks-swift-best-practices`, `tailrocks-tui-design`,
`tailrocks-typescript-best-practices`, and `tailrocks-web-design`. They may load
only under their exact description trigger. The other 73 skills are
`MANUAL_ONLY` and require an explicit request.

Model selection grants no mutation, tool, blessing, commit, push, release,
external-message, or external-system authority. Direct invocation of a
model-policy owner remains available where the client supports it; identical
menu behavior is not portable.

There is no per-family install: an agent gets the whole collection through its
one chosen channel. See README.md for what each skill does.

## The one rule that prevents duplicates

Every agent scans several skill locations, and several agents scan _each
other's_ locations. Installing the same collection through two channels
therefore produces double listings (Codex dedupes by file path only; Claude
Code and Grok namespace plugin skills separately from directory skills, so
both copies stay visible).

**Pick exactly one install profile per machine and never mix them:**

- **Plugin-first (recommended, what this README documents):** install through
  each agent's native plugin/skill manager. No copies in shared directories
  (`~/.agents/skills/`, `~/.claude/skills/`). Cross-reads stay harmless
  because the only shared surface, the Claude plugin cache, is deduplicated
  by name in the agents that read it (Grok, Amp).
- **Skills-dir-first:** one canonical copy in `~/.agents/skills/` (for
  example via `npx skills add tailrocks/tailrocks-skills -g`), symlinked per
  agent, and **no plugin installs anywhere**. Codex, Kimi Code, OpenCode,
  Amp, Grok, Gemini CLI, and Cursor read that tree natively; Claude Code does
  not (it needs a symlink into `~/.claude/skills/`), and the Antigravity CLI
  needs a copy in `~/.gemini/config/skills/`.

If a skill ever shows twice in a client, one copy came from each profile.
Remove the non-native one.

## Track latest, or pin a version

**Default: track the latest release and let the client update itself where it
can.** Every install below is written that way. Never install from `main` — it
carries unreleased work, and only a released `version` triggers an update in the
clients that check for one.

Pin a tag instead when a build must be reproducible: CI images, air-gapped
machines, or a team that upgrades on its own schedule. A pinned install never
updates itself; you move the pin.

Releases are tagged `vX.Y.Z`, and the current release is
[v0.28.0](https://github.com/tailrocks/tailrocks-skills/releases/latest).
The `version` field is identical across all four manifests, so a bump is what
tells a client an update exists.

| Client          | Updates itself                                                                          | Upgrade command                                                                               | Pin syntax                      |
| --------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| Claude Code     | **Yes**, per marketplace — off by default for third-party marketplaces, turn it on once | `/plugin marketplace update tailrocks-skills`                                                 | `#v0.28.0` on the Git URL       |
| Codex CLI       | No                                                                                      | `codex plugin marketplace upgrade tailrocks-skills`, then `codex plugin add tailrocks-skills` | `@v0.28.0` or `--ref v0.28.0`   |
| Grok Build      | No                                                                                      | `grok plugin update tailrocks-skills`                                                         | `@v0.28.0`                      |
| Kimi Code       | No                                                                                      | re-run `/plugins install`, then `/plugins reload`                                             | release or `/tree/<ref>` URL    |
| Amp             | Inherits Claude Code's copy when installed plugin-first                                 | `amp skill add tailrocks/tailrocks-skills --global --overwrite`                               | clone a tag, add the local path |
| OpenCode        | No — it is a file copy                                                                  | re-copy the tree                                                                              | `git clone --branch v0.28.0`    |
| Antigravity CLI | No — it installs from a local path                                                      | re-clone, reinstall                                                                           | `git clone --branch v0.28.0`    |

Claude Code is the only client here that keeps itself current unattended. Turn
its auto-update on once (below) and the rest of the collection follows every
release. For the others, upgrading is one command, and the release notes list
what changed.

## Per-agent installation (plugin-first profile)

### 1. Claude Code

This repository is its own marketplace (`.claude-plugin/marketplace.json`
lists the repo root as the plugin source):

```text
/plugin marketplace add tailrocks/tailrocks-skills
```

```text
/plugin install tailrocks-skills@tailrocks-skills
```

Non-interactive equivalent:

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
```

```sh
claude plugin install tailrocks-skills@tailrocks-skills
```

**Turn auto-update on — this is the recommended setup.** Third-party
marketplaces ship with it off, so Claude Code will not refresh this one until
you say so. Run `/plugin`, open the **Marketplaces** tab, select
`tailrocks-skills`, and choose **Enable auto-update**. Claude Code then
refreshes the marketplace and updates installed plugins in the background
shortly after each session starts, and tells you to run `/reload-plugins` when a
new version landed. Updates follow the manifest `version`, so you receive
releases rather than every commit.

Administrators can set it for a whole organization with `"autoUpdate": true` on
the `extraKnownMarketplaces` entry in managed settings. To refresh on demand
instead of automatically: `/plugin marketplace update tailrocks-skills`.

Pin a version by adding the marketplace from the Git URL with a ref — the
`owner/repo` shorthand takes no ref:

```sh
claude plugin marketplace add https://github.com/tailrocks/tailrocks-skills.git#v0.28.0
```

Auto-update does not move a pin. Upgrading one means removing the marketplace
and re-adding it at the new tag.

- Manifest: `.claude-plugin/plugin.json` (`name` is the only required field);
  `skills/` at the plugin root is auto-discovered.
- Installed plugins are cached under `~/.claude/plugins/cache/`.
- Invocation: `/tailrocks-skills:<skill-name>`; the bare `/<skill-name>` alias
  also resolves while no other command claims the name.
- Do **not** additionally copy or symlink `skills/*` into `~/.claude/skills/`
  or `.claude/skills/` — plugin skills are namespaced, so both copies would
  stay listed (`/name` and `/tailrocks-skills:name`).
- Local development: `claude --plugin-dir .` (session-scoped, shadows the
  installed copy).

### 2. Codex CLI

Codex plugins are marketplace-based and Codex reads Claude-format
marketplaces, so the same self-listing marketplace works:

```sh
codex plugin marketplace add tailrocks/tailrocks-skills
```

```sh
codex plugin add tailrocks-skills
```

Codex does not update on its own. Upgrade with two commands — refresh the
marketplace snapshot, then reinstall from it:

```sh
codex plugin marketplace upgrade tailrocks-skills
```

```sh
codex plugin add tailrocks-skills
```

Pin a version with the `@ref` suffix on the source, or the equivalent `--ref`:

```sh
codex plugin marketplace add tailrocks/tailrocks-skills@v0.28.0
```

- Manifest: `.codex-plugin/plugin.json` with `"skills": "./skills/"` (the
  official Codex plugin manifest location; only `plugin.json` belongs inside
  `.codex-plugin/`).
- Per-skill metadata: `skills/<name>/agents/openai.yaml` —
  `interface.display_name`, `interface.short_description`,
  `interface.default_prompt`, and registry-matched
  `policy.allow_implicit_invocation`: `false` for `MANUAL_ONLY`, `true` for
  `MODEL_POLICY` (the client default is `true`).
- Canonical skill IDs and invocations remain `tailrocks-*`; Codex display
  labels use `Tailrocks: <label>`. Validation rejects unbranded names and
  labels.
- Invocation: type `$` and pick `$<skill-name>`, or run `/skills`.
  `MANUAL_ONLY` owners stay outside the model-visible implicit skill list;
  `MODEL_POLICY` owners enter it under their exact description trigger.
  Selection grants no mutation, tool, or external authority beyond the active
  task. Direct-command visibility for model-policy owners is best-effort across
  clients.
- Duplicate semantics: Codex dedupes by SKILL.md **path**, never by name —
  a plugin install plus a `~/.agents/skills/` copy shows the skill twice.
  Keep the plugin as the only channel. (`~/.codex/skills/` still loads but
  is deprecated.)
- Per-skill kill switch: `[[skills.config]]` entries (`name` or `path` +
  `enabled`) in `~/.codex/config.toml`.

### 3. OpenCode

OpenCode has no plugin channel for skills (its JS/TS plugins cannot register
skills), so use its own global skills directory:

```sh
git clone --depth 1 --branch v0.28.0 https://github.com/tailrocks/tailrocks-skills.git /tmp/tailrocks-skills
```

```sh
mkdir -p ~/.config/opencode/skills
```

```sh
cp -R /tmp/tailrocks-skills/skills/* ~/.config/opencode/skills/
```

The clone is pinned on purpose: a file copy has no update mechanism, so the tag
records which release the copy came from. Upgrade by re-cloning the newer tag
and copying over the tree again. Substituting `--branch main` would leave you on
unreleased work with no way to tell which.

- Frontmatter: OpenCode recognizes only `name`, `description`, `license`,
  `compatibility`, `metadata`; unknown fields (including
  `disable-model-invocation`) are ignored.
- Exposure: a single native `skill` tool; the model loads a skill by name.
  There is no user slash command — ask for the skill by its `name`.
- Manual-only enforcement lives in config instead of frontmatter:

  ```json
  { "permission": { "skill": { "tailrocks-*": "ask" } } }
  ```

- Why not `~/.agents/skills/`: OpenCode reads it, but so do Codex, Kimi,
  Amp, and Grok — that copy would duplicate their plugin installs.
- Duplicates are logged (`duplicate skill name`) and resolved
  last-write-wins with no guaranteed order — keep exactly one copy.

### 4. Grok Build

If Claude Code already has the plugin installed, **do nothing**: Grok reads
`~/.claude/plugins/installed_plugins.json` and loads Claude plugins,
including their skills, automatically.

On machines without Claude Code:

```sh
grok plugin install tailrocks/tailrocks-skills --trust
```

Grok does not update on its own. Upgrade with `grok plugin update
tailrocks-skills`, or omit the name to update every installed plugin. Pin a
version with the `@ref` suffix: `grok plugin install
tailrocks/tailrocks-skills@v0.28.0 --trust`.

- Grok resolves `.grok-plugin/plugin.json` first, then falls back to
  `.claude-plugin/plugin.json` — this repo installs as-is. `@v0.28.0` ref
  pins and `#subdir` are supported.
- Invocation: `/<skill-name>`, or qualified `/tailrocks-skills:<skill-name>`;
  `/skills` opens the extensions modal; `grok inspect --json` lists every
  discovered skill with its source.
- Frontmatter: honors `disable-model-invocation` and `user-invocable`
  (plus Grok extras `when-to-use`, `effort`).
- Duplicate semantics: name-deduped by priority (local > repo > user >
  Claude/Cursor compat), but plugin skills are namespaced separately from
  directory skills — do not also copy the tree into `~/.grok/skills/` or
  `~/.agents/skills/`. Installing natively _and_ having the Claude plugin
  ingested counts as two plugins of the same name; higher-priority wins, but
  keep one channel anyway.

### 5. Kimi Code

Native plugin install (manifest `.kimi-plugin/plugin.json`, officially
supported; `kimi.plugin.json` at the root would take precedence if both
existed):

```text
/plugins install https://github.com/tailrocks/tailrocks-skills
```

```text
/plugins reload
```

The bare repository URL tracks the default branch, so re-running the install
picks up whatever has landed. To follow releases instead, install from the
release URL (`.../releases/tag/v0.28.0`) or a `/tree/<ref>` URL, and repeat the
pair of commands against the newer tag to upgrade. Kimi does not update
plugins on its own in either mode.

- Plugins are copied to `~/.kimi-code/plugins/managed/<id>/` (user scope
  only).
- Invocation: `/skill:<skill-name>`, or the `/<skill-name>` shorthand while
  no built-in command owns the name.
- Frontmatter: `name` + `description` are **required** (skills without them
  are skipped); `disable-model-invocation` is honored (kebab-case alias of
  `disableModelInvocation`); `user-invocable` passes through as inert
  metadata.
- No-login alternative (the `/plugins` manager requires a signed-in TUI):
  copy `skills/*` into `$KIMI_CODE_HOME/skills/` (default
  `~/.kimi-code/skills/`), Kimi's documented user skills directory. Pick one
  channel — remove that copy before switching to the plugin install.
- Duplicate semantics: first registration wins by case-insensitive name
  across Project > User > Extra > Built-in; whichever channel you chose,
  leave the other one and `~/.agents/skills/` free of tailrocks copies.

### 6. Antigravity CLI (`agy`)

Install the CLI (`curl -fsSL https://antigravity.google/cli/install.sh | bash`
or `brew install --cask antigravity-cli`), then install the plugin from a
local clone (the CLI installs plugins from local paths):

```sh
git clone --depth 1 --branch v0.28.0 https://github.com/tailrocks/tailrocks-skills.git
```

```sh
agy plugin install ./tailrocks-skills
```

The clone is pinned because `agy` installs from a local path and never checks
the source again. Upgrade by re-cloning the newer tag and re-running
`agy plugin install`.

- Manifest: root `plugin.json` with the
  `https://antigravity.google/schemas/v1/plugin.json` schema; the `skills/`
  directory at the plugin root ships every skill. Installs land in
  `~/.gemini/config/plugins/<name>/` (verified with `agy` 1.1.5; `agy plugin
list` shows the import).
- Alternative without the plugin manager (also covers the Antigravity IDE):
  copy `skills/*` into `~/.gemini/config/skills/` (global, read by IDE and
  CLI) or the workspace `.agents/skills/`.
- Skills auto-convert to slash commands (`/<skill-name>`); activation is
  description-driven; only `name` and `description` frontmatter are read.
- Gemini CLI (the predecessor): `gemini skills install
https://github.com/tailrocks/tailrocks-skills.git --scope user` or package
  consumption via `~/.agents/skills/`; `agy plugin import gemini` migrates.
- Pick one location: plugin **or** `~/.gemini/config/skills/` copy, never
  both (Antigravity's cross-path precedence is undocumented).

### 7. Amp

If Claude Code already has the plugin installed, **do nothing**: Amp reads
`~/.claude/plugins/cache/` natively and exposes the same skills without a
second copy. This is the preferred plugin-first channel.

On machines without Claude Code:

```sh
amp skill add tailrocks/tailrocks-skills --global
```

Plugin-first is also the update story: when Amp reads Claude Code's cache, it
sees whatever Claude Code's auto-update installed, with nothing to run here. A
standalone `amp skill add` copy is a snapshot — refresh it with
`amp skill add tailrocks/tailrocks-skills --global --overwrite`. The source
argument takes no ref, so pinning means cloning a tag and adding that local
path instead.

- `--global` installs each skill to `~/.config/agents/skills/` (Amp's
  highest-priority location); omit it inside a project to install to the
  committable `.agents/skills/`.
- Invocation is model-driven (name + description always visible); force a
  skill from the command palette (Ctrl-O) skill list, or name it in the
  prompt. Amp has no slash commands (custom commands were removed in favor
  of skills; toolboxes are legacy and unsupported).
- Frontmatter: Amp validates `name`/`description` (+ `license`,
  `compatibility`, `metadata`, `allowed-tools`, `argument-hint`, `model`,
  `mode`, `isolatedContext`); `disable-model-invocation` is tolerated but
  **not enforced**, and `user-invocable` is unrecognized (log-level warning
  only).
- Do not combine the two channels. A `~/.config/agents/skills/` copy outranks
  the Claude cache and hides which source is active. Keep
  `amp.skills.disableClaudeCodeSkills` false for the plugin-first channel.
- Verify with `amp skill list`.

## Compatibility matrix (verified August 2026)

Re-verified 2026-08-21 by running the clients installed on the release
machine: Claude Code 2.1.233 (`claude plugin marketplace update` present),
Codex CLI 0.148.0 (`codex plugin marketplace upgrade` and `codex plugin add`
present), OpenCode 1.18.15, and Amp `0.0.1786824065` (`amp skill add`
present). The Grok Build, Kimi Code, and Antigravity CLI rows carry their
documentation-verified values and were not re-run — the clients are not
installed here, and a row nobody executed should say so rather than inherit
a date it did not earn.

| Client          | Install channel                                               | Manifest read                                             | Explicit invocation                   | Invocation-class control                                          | Duplicate semantics                                         |
| --------------- | ------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| Claude Code     | marketplace plugin                                            | `.claude-plugin/plugin.json`                              | `/tailrocks-skills:<name>`            | `disable-model-invocation: true` manual; omitted for model policy | plugin skills namespaced; a skills-dir copy would ALSO list |
| Codex CLI       | marketplace plugin                                            | `.codex-plugin/plugin.json` (+ Claude-format marketplace) | `$<name>`, `/skills`                  | `agents/openai.yaml` implicit `false` manual; `true` model policy | path-dedupe only — never dual-install                       |
| OpenCode        | `~/.config/opencode/skills/` copy                             | none (skills only)                                        | ask for skill by name (`skill` tool)  | ignored — use `permission.skill`                                  | warning + last-write-wins                                   |
| Grok Build      | Claude plugin auto-ingest, or `grok plugin install`           | `.grok-plugin/` then `.claude-plugin/plugin.json`         | `/<name>`, `/tailrocks-skills:<name>` | honored                                                           | name-dedupe by priority; plugins namespaced                 |
| Kimi Code       | `/plugins install <github-url>`                               | `.kimi-plugin/plugin.json` (or root `kimi.plugin.json`)   | `/skill:<name>`, `/<name>`            | honored (alias)                                                   | first-registration-wins by name                             |
| Antigravity CLI | `agy plugin install <local-clone>`                            | root `plugin.json` (Antigravity schema)                   | `/<name>`                             | not read                                                          | undocumented — keep one location                            |
| Amp             | Claude plugin auto-ingest; otherwise `amp skill add --global` | Claude plugin cache or skills only                        | palette skill list / name in prompt   | tolerated, not enforced                                           | first-wins by name; never dual-install                      |

Portable baseline (Agent Skills specification, agentskills.io): required
`name` (1–64 chars, lowercase-hyphen, must equal the directory name) and
`description` (1–1024 chars); optional `license`, `compatibility`,
`metadata` (string map), experimental `allowed-tools`. Spec-compliant
clients ignore unknown fields, which is what makes the invocation-policy
extensions above safe to ship in one shared file.

## Developing cross-agent skills and plugins (house rules)

1. **One source of truth.** Every skill lives in `skills/<name>/SKILL.md`;
   all four plugin manifests point at that same tree. Never fork a skill per
   agent.
2. **Spec body, extension frontmatter.** The Markdown body stays
   agent-neutral: no `$name`/`/name` syntax, no client tool names, no
   directory assumptions. Client-specific behavior belongs only in
   frontmatter extensions (`disable-model-invocation`, `user-invocable`) and
   sidecars (`agents/openai.yaml`), which non-supporting clients ignore.
3. **Manifests never collide.** Each client reads a distinct path —
   `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`,
   `.kimi-plugin/plugin.json`, root `plugin.json` (Antigravity),
   `.claude-plugin/marketplace.json` (Claude + Codex + Grok marketplace
   adds). Keep component directories (`skills/`) at the repo root; only
   manifest files live inside the dot-directories.
4. **Name = directory.** `name` frontmatter must equal the skill directory
   name (spec requirement; OpenCode and Amp enforce it, Kimi requires
   explicit `name`).
5. **Descriptions are the trigger surface.** ≤1024 chars. `MANUAL_ONLY`
   descriptions start with the exact explicit-request guard because some
   clients ignore policy metadata. `MODEL_POLICY` descriptions instead state
   the exact content/intent predicate and the neighboring boundary.
6. **Version in lockstep.** `version` must match across all three versioned
   manifests and the marketplace entry (enforced by the validator). Tag
   releases (`vX.Y.Z`) so Grok/Kimi/Codex installs can pin.
7. **Keep SKILL.md a router.** At most 200 body lines; deep material in
   `references/`, copy-ready assets in `templates/`; link every reference
   from SKILL.md (paths relative to the skill directory — Claude Code copies
   plugins into a cache, so `../` escapes break).
8. **Validate before publishing:** `bun run scripts/validate-skills.ts`,
   plus `claude plugin validate .` and `grok plugin validate .` when
   available.
