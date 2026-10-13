# Compatibility

This record covers each client and route. The default outcome is
unverified. Each unverified row names its reason. A route is never
unsupported only because its binary is absent. A route is never
verified only because a different client accepted the same files.

## Results

| Client | Version | Route | Outcome |
| --- | --- | --- | --- |
| Claude Code | 2.1.289 | Marketplace | Unverified: not run. |
| Claude Code | 2.1.289 | Skill copy | Unverified: not run. |
| Codex | 0.160.1 | Marketplace | Unverified: not run. |
| Codex | 0.160.1 | Skill copy | Unverified: not run. |
| Amp | unversioned | Per-skill add | Unverified: CLI absent. |
| Muse Code | 1.4.3 | Marketplace | Unverified: not run. |
| Muse Code | 1.4.3 | Local path | Unverified: not run. |
| OpenCode V1 | unversioned | Skills copy | Unverified: CLI absent. |
| OpenCode V2 | unversioned | Skills copy | Unverified: CLI absent. |
| Antigravity | unversioned | Local path | Unverified: CLI absent. |
| Antigravity | unversioned | Skills copy | Unverified: CLI absent. |
| Grok Build | unversioned | Marketplace | Unverified: CLI absent. |
| Grok Build | unversioned | Skills copy | Unverified: CLI absent. |
| Kimi Code | unversioned | Manager pin | Unverified: CLI absent. |

No installation ran for this rewrite. No model task ran and no skill
executed.

## Access and naming findings

Two findings affect the marketplace rows. They stay open until the
marketplace owner resolves them.

Private access: the package is private. A marketplace install needs
authenticated access to `tailrocks/tailrocks-asd-ste100-skills`. If the required
access is absent, do not record a private installation check as
complete.

Catalog name: the central entry uses the id `asd-ste100`, while the
installed plugin name is `asd-ste100-skill` (observed 2026-10-07).
Some clients reject a catalog name that differs from the manifest
name. The marketplace owner must align the entry before the
marketplace rows can pass.

## Static fit

These facts were observed on 2026-10-07 from the package files. They
are not install proofs:

- The frontmatter name matches the skill directory.
- The name uses 10 characters. The description uses fewer than 1024
  characters. The Amp, OpenCode, and Kimi caps fit.
- The root manifest carries the Agent Plugins 1.0.0 schema id.
- The Kimi manifest sets `skills` to `./skills/`.
- Every payload file under `skills/` is text. No file carries the
  executable bit.
- The skill directory holds `SKILL.md`, `agents/openai.yaml`, 22
  reference files, and 20 dictionary letter shards.
