# Maintenance rules

This package contains one instruction skill: `vitalik-mode`.
Keep its procedure in `skills/vitalik-mode/SKILL.md`.
Keep required resources inside that skill directory.
Keep installation and maintenance details in `docs/`.

## Package structure

- Use `plugin.json` as the source of package identity and version.
- Keep the Claude and Kimi manifests consistent with that source.
- Keep skill frontmatter limited to `name`, `description`, and `license`.
- Keep explicit activation in the description and skill procedure.
- Keep `policy.allow_implicit_invocation: false` in `agents/openai.yaml`.
- Do not add runtime hooks, background processes, or executable skill wrappers.
- Do not store an active goal or operator configuration in this package.

## Changes and verification

Obey the central
[structure and writing rules](https://github.com/tailrocks/tailrocks-skills/tree/main/docs/standards)
.
Use short, direct instructions with one action per sentence.
Read [the maintenance guide](docs/maintenance.md) before release.
Run `python3 scripts/validate-package.py` and `alint check` before publication.

Change CI through `.velnor/config.toml` and `velnor-actions generate`.
Do not hand-edit generator-owned files under `.github/`.
Keep model reviews separate from static package verification.
Do not describe documentation or a sample task as runtime compatibility proof.
