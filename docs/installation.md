# Installation

The package is `tailrocks-vitalik-mode-skills`.
The marketplace is
[tailrocks/tailrocks-skills](https://github.com/tailrocks/tailrocks-skills) .
The skill ID is `vitalik-mode`.

Install one copy for each host and scope.
Choose the marketplace, a host's package manager, or a complete skill directory
copy.
Use the command shown in your host's picker if it qualifies the skill name.
These procedures describe documented routes. See the
[compatibility evidence](compatibility.md) .

## Copy a complete skill directory

Clone the
[package repository](https://github.com/tailrocks/tailrocks-vitalik-mode-skills)
or use a local checkout.
Keep the skill file, references, assets, and agent metadata together.
If the destination exists, inspect it before replacing the installed files.

This example copies the skill to a project that uses `.agents/skills`.
Run it from the destination project.
Set `package_dir` to an absolute path to your checkout.

```sh
package_dir=/absolute/path/to/tailrocks-vitalik-mode-skills
mkdir -p .agents/skills
cp -R "$package_dir/skills/vitalik-mode" .agents/skills/
```

For another host root, replace `.agents/skills` in both commands.
Open a new session if the current session does not discover the skill.
Run the host's form of `status` to inspect the mode without enabling it.

## Claude Code

Run the marketplace commands in a terminal.

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-vitalik-mode-skills@tailrocks --scope user
```

Run `/tailrocks-vitalik-mode-skills:vitalik-mode status` in the session.
For `/vitalik-mode status` , use a standalone copy in `.claude/skills/` or
`~/.claude/skills/` .
To make the standalone skill user-only in the host, set its `/skills` entry to
`user-only` .
[Claude Code marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
· [Claude Code skills](https://code.claude.com/docs/en/skills)

## Codex

Run the marketplace commands in a terminal.

```sh
codex plugin marketplace add tailrocks/tailrocks-skills
codex plugin add tailrocks-vitalik-mode-skills@tailrocks
```

In the CLI, use `/skills` or type `$` and select `vitalik-mode`.
Pass `status` after the skill mention.
In supported Codex app surfaces, select the skill with the composer's skill
picker.
For a standalone copy, use `.agents/skills/` or `~/.agents/skills/`.
[Codex CLI](https://learn.chatgpt.com/docs/cli/reference) ·
[Codex skills](https://learn.chatgpt.com/docs/build-skills)

## Grok Build

Use xAI's Grok Build CLI.
For a standalone install, copy the skill to `.grok/skills/` or `~/.grok/skills/`
.
The CLI also discovers `.agents/skills/` in supported scopes.
Run `grok inspect --json` to find the advertised command.
Run `/vitalik-mode status` or the qualified command displayed under
`invocableAs` .
If you prefer plugin installation, use the CLI's marketplace and plugin manager.
[Grok Build skills](https://docs.x.ai/build/features/skills-plugins-marketplaces)
· [Grok Build CLI](https://docs.x.ai/build/cli/reference)

## omp

Run the marketplace commands in a terminal.

```sh
omp plugin marketplace add tailrocks/tailrocks-skills
omp plugin install tailrocks-vitalik-mode-skills@tailrocks
```

For a standalone copy, use `.omp/skills/` or `~/.omp/agent/skills/`.
The native skill command is `/skill:vitalik-mode status`.
[omp marketplace](https://github.com/can1357/oh-my-pi/blob/main/docs/marketplace.md)
· [omp skills](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md)

## pi

Install the package from Git in a terminal.

```sh
pi install git:github.com/tailrocks/tailrocks-vitalik-mode-skills
```

Pi reads its conventional `skills/` directory.
For a standalone copy, use `.pi/skills/` , `~/.pi/agent/skills/` , or
`.agents/skills/` .
Run `/skill:vitalik-mode status`.

For an optional `/vitalik-mode` alias, add `~/.pi/agent/prompts/vitalik-mode.md`
under your control.
Use this prompt template.

```markdown
---
description: Run a Vitalik mode command in this session.
---
Read and apply the vitalik-mode skill. This is the user's explicit Vitalik mode command.
Arguments: $ARGUMENTS
```

Use `/skill:vitalik-mode` when exact argument quoting matters.
Pi reconstructs `$ARGUMENTS` in prompt templates from the parsed arguments.
[Pi packages](https://docs.pi.dev/latest/packages) ·
[Pi skills](https://docs.pi.dev/latest/skills) ·
[Pi prompt templates](https://docs.pi.dev/latest/prompt-templates)

## OpenCode

Copy the skill to `.opencode/skills/` or `~/.config/opencode/skills/`.
You can also use the host's `.agents/skills/` compatibility path.
In the session, enter `Use the vitalik-mode skill and run its status command.`

For an optional OpenCode V2 `/vitalik-mode` alias, put this file at
`.opencode/commands/vitalik-mode.md` in a project you control.

```markdown
---
description: Run a Vitalik mode command in this session.
subagent: false
---
Load the vitalik-mode skill. This is the user's explicit Vitalik mode command.
Arguments: $ARGUMENTS
```

Keep this command in the primary session.
On V1, use explicit skill selection or the installed version's custom command
format.
[OpenCode skills](https://opencode.ai/docs/skills) ·
[OpenCode commands](https://opencode.ai/docs/commands) ·
[OpenCode migration](https://opencode.ai/docs/migrate-v1)

## Muse Code

Use Meta's `muse` CLI.
To install from a local checkout, run the command in a terminal.

```sh
muse skills install ./tailrocks-vitalik-mode-skills/skills/vitalik-mode --scope user
```

For a project copy, use `.agents/skills/` in a trusted workspace.
Open the `/` picker and use the displayed shortcut with `status`.
[Muse Code skills](https://dev.meta.ai/docs/muse-code/extending)

## Kimi Code

Run the following commands in the Kimi Code CLI session.
Add the marketplace URL if you want to browse its catalog.

```text
/plugins marketplace https://raw.githubusercontent.com/tailrocks/tailrocks-skills/main/.kimi-plugin/marketplace.json
/plugins install https://github.com/tailrocks/tailrocks-vitalik-mode-skills
/reload
```

For a version pin, use the desired commit URL in `/plugins install`.
For a standalone copy, use `.kimi-code/skills/` , `.agents/skills/` , or
`~/.kimi-code/skills/` .
Run `/skill:vitalik-mode status`.
[Kimi Code plugins](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/plugins)
·
[Kimi Code skills](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills)

## Other Agent Skills hosts

Copy the complete skill directory to the host's documented skills root.
Select `vitalik-mode` explicitly and pass `status`, `on`, or `off` as user text.
Use [host adapters](../skills/vitalik-mode/references/host-adapters.md) to
determine whether a separate planner route is available.
[Agent Skills specification](https://agentskills.io/specification)
