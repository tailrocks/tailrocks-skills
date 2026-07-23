# Installing and developing tailrocks-skills across agents

This document is the verified cross-agent contract for this repository: how each
supported agent discovers skills and plugins, how to install `tailrocks-skills`
for it, and how to keep one shared `skills/` tree from ever being shown twice in
any client. Everything below was verified in July 2026 against official
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

## The one rule that prevents duplicates

Every agent scans several skill locations, and several agents scan *each
other's* locations. Installing the same collection through two channels
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

## Per-agent installation (plugin-first profile)

### 1. Claude Code

This repository is its own marketplace (`.claude-plugin/marketplace.json`
lists the repo root as the plugin source):

```text
/plugin marketplace add tailrocks/tailrocks-skills
/plugin install tailrocks-skills@tailrocks-skills
```

Non-interactive equivalent:

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-skills@tailrocks-skills
```

Production pin: client syntax can vary by release; verify against your client,
then add the marketplace at the tag:
`claude plugin marketplace add tailrocks/tailrocks-skills@v0.11.0`.

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
codex plugin add tailrocks-skills
```

Production pin: client syntax can vary by release; verify against your client,
then add the marketplace at the tag:
`codex plugin marketplace add tailrocks/tailrocks-skills@v0.11.0`.

- Manifest: `.codex-plugin/plugin.json` with `"skills": "./skills/"` (the
  official Codex plugin manifest location; only `plugin.json` belongs inside
  `.codex-plugin/`).
- Per-skill metadata: `skills/<name>/agents/openai.yaml` —
  `interface.display_name`, `interface.short_description`,
  `interface.default_prompt`, and `policy.allow_implicit_invocation: false`
  (defaults to `true`; `false` makes the skill explicit-only).
- Invocation: type `$` and pick `$<skill-name>`, or run `/skills`. Because
  every tailrocks skill ships `policy.allow_implicit_invocation: false`, the
  skills do not appear in the model-visible implicit skill list (verified via
  `codex debug prompt-input`) — they are reachable through explicit `$`
  invocation only. That is the intended manual-only behavior.
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
git clone --depth 1 --branch v0.11.0 https://github.com/tailrocks/tailrocks-skills.git /tmp/tailrocks-skills
mkdir -p ~/.config/opencode/skills
cp -R /tmp/tailrocks-skills/skills/* ~/.config/opencode/skills/
```

Use the latest release tag in place of `v0.11.0` when upgrading.

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

- Grok resolves `.grok-plugin/plugin.json` first, then falls back to
  `.claude-plugin/plugin.json` — this repo installs as-is. `@v0.11.0` ref
  pins and `#subdir` are supported.
- Invocation: `/<skill-name>`, or qualified `/tailrocks-skills:<skill-name>`;
  `/skills` opens the extensions modal; `grok inspect --json` lists every
  discovered skill with its source.
- Frontmatter: honors `disable-model-invocation` and `user-invocable`
  (plus Grok extras `when-to-use`, `effort`).
- Duplicate semantics: name-deduped by priority (local > repo > user >
  Claude/Cursor compat), but plugin skills are namespaced separately from
  directory skills — do not also copy the tree into `~/.grok/skills/` or
  `~/.agents/skills/`. Installing natively *and* having the Claude plugin
  ingested counts as two plugins of the same name; higher-priority wins, but
  keep one channel anyway.

### 5. Kimi Code

Native plugin install (manifest `.kimi-plugin/plugin.json`, officially
supported; `kimi.plugin.json` at the root would take precedence if both
existed):

```text
/plugins install https://github.com/tailrocks/tailrocks-skills
/plugins reload
```

Pin with a release URL (`.../releases/tag/v0.11.0`) or `/tree/<ref>`.

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
git clone --depth 1 --branch v0.11.0 https://github.com/tailrocks/tailrocks-skills.git
agy plugin install ./tailrocks-skills
```

Use the latest release tag in place of `v0.11.0` when upgrading.

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

```sh
amp skill add tailrocks/tailrocks-skills --global
```

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
- Amp also ingests Claude plugin-cache skills (`~/.claude/plugins/cache/`).
  Name-deduplication is first-wins, so the `~/.config/agents/skills/` copy
  wins and each skill still lists once. Disable the Claude bridge entirely
  with `amp.skills.disableClaudeCodeSkills` if preferred.
- Verify with `amp skill list`.

## Compatibility matrix (verified July 2026)

| Client | Install channel | Manifest read | Explicit invocation | `disable-model-invocation` | Duplicate semantics |
|---|---|---|---|---|---|
| Claude Code | marketplace plugin | `.claude-plugin/plugin.json` | `/tailrocks-skills:<name>` | honored | plugin skills namespaced; a skills-dir copy would ALSO list |
| Codex CLI | marketplace plugin | `.codex-plugin/plugin.json` (+ Claude-format marketplace) | `$<name>`, `/skills` | via `agents/openai.yaml` `policy.allow_implicit_invocation: false` | path-dedupe only — never dual-install |
| OpenCode | `~/.config/opencode/skills/` copy | none (skills only) | ask for skill by name (`skill` tool) | ignored — use `permission.skill` | warning + last-write-wins |
| Grok Build | Claude plugin auto-ingest, or `grok plugin install` | `.grok-plugin/` then `.claude-plugin/plugin.json` | `/<name>`, `/tailrocks-skills:<name>` | honored | name-dedupe by priority; plugins namespaced |
| Kimi Code | `/plugins install <github-url>` | `.kimi-plugin/plugin.json` (or root `kimi.plugin.json`) | `/skill:<name>`, `/<name>` | honored (alias) | first-registration-wins by name |
| Antigravity CLI | `agy plugin install <local-clone>` | root `plugin.json` (Antigravity schema) | `/<name>` | not read | undocumented — keep one location |
| Amp | `amp skill add --global` | none (skills only) | palette skill list / name in prompt | tolerated, not enforced | first-wins by name across its path list |

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
5. **Descriptions are the trigger surface.** ≤1024 chars, and because Amp,
   OpenCode, Antigravity, and Gemini cannot hard-disable model invocation,
   every description starts with the explicit-request guard sentence.
6. **Version in lockstep.** `version` must match across all three versioned
   manifests and the marketplace entry (enforced by the validator). Tag
   releases (`vX.Y.Z`) so Grok/Kimi/Codex installs can pin.
7. **Keep SKILL.md a router.** Under 500 lines; deep material in
   `references/`, copy-ready assets in `templates/`; link every reference
   from SKILL.md (paths relative to the skill directory — Claude Code copies
   plugins into a cache, so `../` escapes break).
8. **Validate before publishing:** `bun run scripts/validate-skills.ts`,
   plus `claude plugin validate .` and `grok plugin validate .` when
   available.
