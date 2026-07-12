# Installing tailrocks-skills across agents

The shared `skills/<name>/` directories follow the Agent Skills specification.
Client-specific metadata adds invocation controls without changing the shared
Markdown bodies.

## Canonical shared install

Use Bun to run the installer and select every detected target agent:

```sh
bunx --bun skills add "tailrocks/tailrocks-skills#vX.Y.Z" -s '*' --global
```

Or install deterministically without another package manager:

```sh
git clone --branch vX.Y.Z https://github.com/tailrocks/tailrocks-skills.git
mkdir -p ~/.agents/skills
cp -R tailrocks-skills/skills/* ~/.agents/skills/
```

The generic `~/.agents/skills/` location is supported by Codex, Grok Build,
Kimi Code, OpenCode, Gemini CLI, GitHub Copilot, and Amp. Restart or reload the
client after installation when its documentation requires it.

## Native locations

| Client | Project | User | Invocation |
|---|---|---|---|
| Claude Code | Plugin or `.claude/skills/` | `~/.claude/skills/` | `/tailrocks-skills:<name>` |
| Codex | `.agents/skills/` | `~/.agents/skills/` | `$<name>` |
| Grok Build | `.grok/skills/` or Claude plugin | `~/.grok/skills/` or `~/.agents/skills/` | `/<name>` |
| Kimi Code | `.kimi-code/skills/` or `.agents/skills/` | `$KIMI_CODE_HOME/skills/` or `~/.agents/skills/` | `/skill:<name>` |
| OpenCode | `.opencode/skills/` or `.agents/skills/` | `~/.config/opencode/skills/` or `~/.agents/skills/` | Ask it to use the named skill |
| Gemini CLI | `.gemini/skills/` or `.agents/skills/` | `~/.gemini/skills/` | `/skills`, then activate |
| GitHub Copilot | `.github/skills/` or `.agents/skills/` | `~/.copilot/skills/` or `~/.agents/skills/` | `/<name>` |
| Amp | `.agents/skills/` | `~/.config/agents/skills/` or `~/.agents/skills/` | `skill: invoke` |

## Invocation guarantees

- Claude Code, Kimi Code, and GitHub Copilot honor
  `disable-model-invocation: true` and `user-invocable: true`.
- Codex honors `policy.allow_implicit_invocation: false` in
  `agents/openai.yaml`.
- Grok documents full Claude Code compatibility and reads Claude plugins and
  skill directories.
- Gemini CLI, OpenCode, and Amp do not document a portable per-skill automatic
  invocation disable. The skills remain usable there, but the host may offer
  them to the model automatically.

Do not add client-specific commands, tool names, or directory assumptions to a
`SKILL.md` body. Keep such integration metadata and installation guidance
outside the shared skill source.

Kimi Code can also install this repository as a native plugin because
`.kimi-plugin/plugin.json` points at the shared `./skills/` tree:

```text
/plugins install https://github.com/tailrocks/tailrocks-skills
/plugins reload
```
