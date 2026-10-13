# Compatibility

This record covers each client and route. The default outcome is
unverified. Each unverified row names its reason. A route is never
unsupported only because its binary is missing. A route is never
verified only because a different client accepted the same files.

## Results

| Client | Version | Route | Outcome |
| --- | --- | --- | --- |
| Claude Code | 2.1.289 | Marketplace | Unverified: not run. |
| Claude Code | 2.1.289 | Local path | Unverified: not run. |
| Codex | 0.160.1 | Marketplace | Unverified: not run. |
| Codex | 0.160.1 | Local path | Unverified: not run. |
| Amp | unversioned | Per-skill add | Unverified: no CLI. |
| Muse Code | 1.4.3 | Marketplace | Unverified: not run. |
| Muse Code | 1.4.3 | Local path | Unverified: not run. |
| OpenCode V1 | unversioned | Skills copy | Unverified: no CLI. |
| OpenCode V2 | unversioned | Skills copy | Unverified: no CLI. |
| Antigravity | unversioned | Local path | Unverified: no CLI. |
| Antigravity | unversioned | Skills copy | Unverified: no CLI. |
| Grok Build | unversioned | Marketplace | Unverified: no CLI. |
| Grok Build | unversioned | Skills copy | Unverified: no CLI. |
| Kimi Code | unversioned | Manager pin | Unverified: no CLI. |

No installation check ran for this package revision. No model task
ran and no skill executed.

## User-only enforcement

This table records documented support, not runtime verification.
Enforced: the client stops automatic model invocation of the
thirteen user-only skills. Limited: the client documents the
frontmatter but cannot enforce it.

| Client | Thirteen user-only skills entry |
| --- | --- |
| Claude Code | Enforced (`disable-model-invocation`). |
| Codex | Enforced (`allow_implicit_invocation: false`). |
| Kimi Code | Enforced (`disableModelInvocation`). |
| Grok Build | Enforced (`disable-model-invocation`). |
| Amp | Limited: lists every skill to the model. |
| Antigravity | Limited: frontmatter holds `name` and `description` only. |
| Muse Code | Limited: recall observer can surface skills. |
| OpenCode V1 | Gated by `permission.skill: ask`. |

## Static fit

These facts were observed on 2026-10-07 from the package files. They
are not install evidence:

- All fifteen frontmatter names match their skill directories.
- All names are 35 characters or less. All descriptions are 408
  characters or less. The Amp, OpenCode, and Kimi caps fit.
- The root manifest carries the Agent Plugins 1.0.0 schema id.
- The Kimi manifest sets `skills` to `./skills/`.
- Every payload file under `skills/` is text. No file carries the
  executable bit.

## Frontmatter fields

Every `skills/*/SKILL.md` file carries these frontmatter keys.
Observed 2026-10-07 from the package files:

- `name` (all 15 skills): skill id. It matches the skill
  directory.
- `description` (all 15 skills): task summary. It states the
  user-only rule where it applies.
- `argument-hint` (all 15 skills): example invocation arguments
  for pickers.
- `disable-model-invocation` (all 15 skills): `true` on the 13
  user-only skills, `false` on the 2 model-selectable skills.
- `disableModelInvocation` (13 user-only skills): camel-case
  twin of `disable-model-invocation` for Kimi Code.
- `license` (all 15 skills): `Apache-2.0`, matching the package
  license.
- `user-invocable` (all 15 skills): `true`. A person can invoke
  every skill.
- `when_to_use` (2 model-selectable skills): task trigger for
  model selection. User-only skills omit it.
