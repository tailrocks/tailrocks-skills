# House wiring

What a finished skill touches beyond its own directory. Target
repository policy governs. Detect it from instruction files,
existing skill siblings, validators, manifests, catalogs, and
generation commands. When evidence conflicts or required policy is
missing, stop without mutation. Never project this repository
metadata onto a different tree.

## The skill directory

```text
skills/<name>/
├── SKILL.md            # router: frontmatter + body
├── agents/openai.yaml  # per-client invocation policy
├── references/         # depth, free until read
└── assets/             # copy-ready templates the skill ships (optional)
```

This tree uses manual-only policy. It carries `name`,
`license: Apache-2.0`, `disable-model-invocation: true`, and
`user-invocable: true`. The description starts exactly with the
guard sentence ("Use only when the user explicitly requests this
skill."). 250 characters of budget remain after it. It carries an
`argument-hint` when the skill takes modes or targets.
`agents/openai.yaml` carries
`policy.allow_implicit_invocation: false` plus the interface block,
whose `default_prompt` uses the bare `$<skill>` form, never
`$plugin:skill`, which is not a documented Codex invocation. The
`false` value stops implicit match, but the entry still occupies
the Codex initial-list budget, so front-load trigger words
regardless. `agents/openai.yaml` keys are snake_case:
`interface.display_name`, `short_description`, `default_prompt`,
`icon_small` and `icon_large`, `brand_color`.

Bodies stay source-neutral, with no client-specific instructions.
OpenCode V1 and Antigravity ignore manual-only policy. On those
two clients the guard sentence alone holds the boundary. That is
why it is load-bearing and never paraphrased.

House prose rules inside the skill follow. Use mermaid for any
drawn flow. A one-line arrow sequence in prose is fine. An ASCII
diagram is not. State evidence-not-instructions and secret-citation
paragraphs in the router. Keep audit modes read-only: never infer
mutation from findings. Give every step its completion test. End
with a final gate of refusals.

## The repository files

Rows below define the common active-package structure. Another
repository maps only artifacts its observed policy supports.
Absent client or catalog surfaces stay absent.

- **`README.md`:** add the skill row to the Skills table by
  hand.
- **`docs/` guides:** add the skill to the index, usage owners,
  and compatibility record by hand.
- **Install guide:** add per-client install notes only when the
  skill needs them.
- **Version lockstep:** bump `version` in root `plugin.json`,
  `.claude-plugin/plugin.json`, and `.kimi-plugin/plugin.json`
  together. Root `plugin.json` is the source of truth. A bump ships
  nothing until the tag and release exist.

## Client packaging

Manifests, install verbs, and validators per client. Revalidate
commands against the installed build before relying on them.

### Claude Code

Manifest `.claude-plugin/plugin.json` carries name, version, and
description. Install `claude plugin install
<name>@<marketplace> [--scope user|project|local]` after
`marketplace add`. Manage with `update`, `remove` (`uninstall`,
`rm` aliases), `enable` and `disable`, `marketplace
add|list|remove|update`, the `/plugin` panel, and `/reload-plugins`
in-session. Validate with `claude plugin validate`.

### Codex CLI

Skill equals directory plus `SKILL.md` (`name` plus `description`
required). Install `codex plugin add <plugin>@<marketplace>` after
`codex plugin marketplace add <owner/repo|url|path>`. Manage with
`marketplace list|upgrade|remove` and `remove`. Per-repo enable
lives in `.codex/config.toml`. No `install`, `update`, or
`validate` verbs exist: marketplace refresh stays separate from
installed-plugin refresh.

### Grok Build

No native manifest: Grok reads `.claude-plugin/` marketplaces,
plugins, and skills as-is. Install `grok plugin install
<git|user/repo|path>[@ref][#subdir]` with explicit trust, after
`marketplace add`. Manage with `update`, `uninstall`,
`enable|disable`, `validate`, and `marketplace
add|remove|update`. Discovery check is `grok inspect`.

### Kimi Code

Manifest `.kimi-plugin/plugin.json` requires `name` only. It sets
`skills` to `./skills/`: without it, Kimi reads a root SKILL.md
file instead. `interface` allows only `displayName`,
`shortDescription`, `developerName`, `websiteURL`. TUI-only
management: `/plugins install <path|zip|github-url>`,
`list|info|enable|disable|remove|reload`. Run `/reload` or `/new`
after any change. Installs copy to
`$KIMI_CODE_HOME/plugins/managed/<id>/` (per-user only, source
edits need reinstall). No manifest CLI exists: diagnostics live in
`/plugins info`. Custom catalogs use marketplace JSON v2, reached
through `/plugins marketplace <path|url>`.

### Muse Code

This layout removes the native plugin manifest
`.muse-plugin/plugin.json`. Muse reads the Claude manifest through
its
foreign-adapter import, or the portable root manifest. Lifecycle:
`muse skills validate <dir>`, then `muse plugins validate <dir>`,
then `muse plugins install <path>` or `muse skills install <dir>`.
Manage with
`list|inspect|enable|disable|update|uninstall|remove`.

### Antigravity CLI

Root `plugin.json` carries the portable Agent Plugins 1.0.0 schema.
Never give it an Antigravity schema: the native schema differs.
Install `agy plugin install <local-dir>` (local path only, no
Git-URL form). Manage with `list|enable|disable|uninstall`. A new
plugin directory needs a restart. Skill frontmatter is `name` plus
`description`, both required. Validate with `agy plugin validate`.

### Amp

No manifest. Skills are directories, deduped by frontmatter `name`,
first wins across precedence levels. Install the `skills/`
container, never a single skill directory. `amp skill add
<owner/repo[/path]|git-URL|local-path>` copies whole skill
directories from a container. It copies SKILL.md only from a lone
skill dir and drops `references/`. This behavior is reported for
the documented version only. `--global` targets the
machine-local scope. Inspect with `amp skill list`. No `validate`
subcommand exists. Caps: 200 skills per repo, 200 files per skill,
10 MiB per file, 25 MiB per skill and repo.

### OpenCode

No manifest. Skill paths: `.opencode/skills/`,
`~/.config/opencode/skills/`, plus `.claude/skills/` and
`.agents/skills/` compatibility paths. On V1, the frontmatter
allowlist is `name`, `description`, `license`, `compatibility`,
`metadata` only: everything else is silently ignored, so
manual-only flags vanish there. V2 keeps
`disable-model-invocation` among its keys. `name` uses 1 to 64
lowercase hyphenated characters and equals the directory.
`description` uses 1 to 1024 characters. On V1, gate with
`permission.skill` (`ask` for manual-only skills) or per-agent
`tools.skill=false`. No install CLI and no validator exist.

### Frontmatter contract

Behavior that must survive all targets lives in `description` plus
body, never in extra frontmatter.

- **`name`, `description`:** required on all eight clients.
- **`license`:** honored on Claude and OpenCode, ignored on Grok,
  accepted on Muse, unknown on Kimi, absent elsewhere.
- **`argument-hint`:** display on Claude and Grok, accepted on
  Muse, `arguments:` instead on Kimi, ignored on OpenCode, absent
  elsewhere.
- **`disable-model-invocation`:** honored on Claude, Grok, and
  Kimi (kebab). Accepted on Muse, which cannot enforce
  per-skill manual-only entry. Codex uses the yaml flag. None
  observed on Antigravity and Amp. Ignored on OpenCode V1.
- **`user-invocable`:** honored on Claude. Accepted on Muse
  without enforcement. Literal `true` only on Grok. Unknown on
  Kimi. Ignored on OpenCode V1. Absent elsewhere.
- **`when_to_use` plus aliases:** appended trigger on Claude,
  `when-to-use` trigger on Grok, `whenToUse` trigger on Kimi,
  ignored on Codex and OpenCode, absent elsewhere.
- **`paths`:** file gate on Claude, hide-until-touched on Grok,
  ignored on OpenCode, absent elsewhere.
- **`allowed-tools`:** honored on Claude, parsed but inert on
  Grok, unknown on Kimi, unconfirmed on Muse, ignored on OpenCode,
  absent elsewhere.
- **`metadata`:** honored on Claude, UI-only on Grok, unknown on
  Kimi, unconfirmed on Muse, string map on OpenCode, absent
  elsewhere.
- **`compatibility`:** honored on Claude and OpenCode, ignored on
  Grok, unknown on Kimi, unconfirmed on Muse, absent elsewhere.

"Unknown" means Kimi documents neither the key nor its unknown-key
handling. Load-test through `/plugins info` before relying on it.
"Unconfirmed" means `muse skills validate` accepts the shipped keys,
but these three were not in the validated files.

## Validation

```sh
alint check
# plus the strict-JSON check and the frontmatter/ID check
npx --yes markdownlint-cli2@0.23.3 "**/*.md"
claude plugin validate <dir>
# Reserve --strict for warning-free manifests only
grok plugin validate
agy plugin validate
muse skills validate <skill-dir>
muse plugins validate <dir>
# Kimi has no manifest CLI: use /plugins info plus /plugins reload
# Codex: codex plugin marketplace list shows the entry
# OpenCode has no skill validator: caps and checklist only
# Amp has no skill validator: amp skills list shows discovery only
```

Each command covers one layer. `alint check` covers structure,
manifests, README, and skill IDs. The strict-JSON check parses
manifests and rejects duplicate keys. The frontmatter and ID check
matches names to directories and validates IDs. The markdownlint
check examines prose shape. `claude plugin validate`
exits 0 on pass, 1 on fail, and 2 on tool error. `grok plugin
validate` loads the manifest through `.claude-plugin/`. `agy plugin
validate` checks skill inventory plus manifest shape. `muse skills
validate` checks one skill and accepts extras. `muse plugins
validate` checks the portable or Claude manifest path.

Run each gate once. Repair only a matched, in-scope error. Stop
immediately for an unmatched error, an unavailable tool, or a
failed repair. Preserve the current state, report the exact failure
and prior mutations, and never claim completion.

## Update-mode obligations

Editing an existing skill adds constraints beyond the create path:

- **Check the cited evidence record before rewording** a gate,
  rejection rule, or completion clause. Load-bearing lines never
  change casually.
- **Strengthen over append.** Prefer making an existing section
  state the new obligation to adding a sibling section that gestures
  at it.
- **A router has at most 200 body lines.** At the limit, the next
  addition replaces or extracts existing material.
- **Rerun every affected static check** after a router change. A
  new section changes every behavior in the file, so the check
  nearest the edit is not the only one at risk.
- A check that misses one element while everything else is correct
  usually exposes a signposting defect. Before rewriting what it
  says, inspect where the requirement sits in the file.
- Refresh generated docs through their generator, never by hand.
