# Installing tailrocks-skills for Codex

`tailrocks-skills` is a cross-agent skill collection. Codex (and Amp, OpenCode,
Kimi) consume the same `skills/<name>/` sources that the Claude Code plugin does.

## Option 1: The `skills` CLI (recommended)

Codex, Amp, OpenCode, and Kimi all read `~/.agents/skills/`. Install the whole
collection there with the [`skills`](https://www.npmjs.com/package/skills) CLI:

```sh
npx -y skills add "tailrocks/tailrocks-skills" -s '*' -a codex --global --yes
```

`-s '*'` installs every skill in the collection; `--global` writes the canonical
`~/.agents/skills/<skill>/` tree that OpenCode and Kimi also read. Codex
additionally picks up `.codex-plugin/plugin.json` through its `/plugins` flow. Pin
to a release tag in production:

```sh
npx -y skills add "tailrocks/tailrocks-skills#vX.Y.Z" -s '*' -a codex --global --yes
```

Install a single skill instead of all with `-s tailrocks-rust-project-setup`.

## Option 2: Reference from a Project

Clone the repository alongside the target project:

```sh
git clone https://github.com/tailrocks/tailrocks-skills.git
```

Add a note to the target project's `AGENTS.md`:

```markdown
## Tailrocks Skills

Rust guidance is available in `../tailrocks-skills/skills/`. When asked to write
or review Rust code, follow `tailrocks-rust-best-practices/SKILL.md`; when scaffolding or
auditing project structure and tooling, follow `tailrocks-rust-project-setup/SKILL.md`.
```

## Option 3: Symlink into Codex Skills

```sh
mkdir -p .codex/skills
ln -s /path/to/tailrocks-skills/skills/tailrocks-rust-best-practices .codex/skills/tailrocks-rust-best-practices
ln -s /path/to/tailrocks-skills/skills/tailrocks-rust-project-setup  .codex/skills/tailrocks-rust-project-setup
```

## Option 4: Copy into Codex Home

```sh
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R /path/to/tailrocks-skills/skills/* "${CODEX_HOME:-$HOME/.codex}/skills/"
```
