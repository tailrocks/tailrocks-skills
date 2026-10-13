# Compatibility

This record covers each client and route. The default outcome is
unverified. Each unverified row names its reason. A route is never
unsupported only because its binary is absent. A route is never
verified only because a different client accepted the same files.

## Results

| Client | Version | Route | Outcome |
| --- | --- | --- | --- |
| Claude Code | 2.1.289 | Marketplace | Unverified: not run. |
| Claude Code | 2.1.289 | Local path | Unverified: not run. |
| Codex | 0.160.1 | Marketplace | Unverified: not run. |
| Codex | 0.160.1 | Local path | Unverified: not run. |
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

No installation trial ran for this package. No model task ran and no
skill executed.

## User-only enforcement

This table records documented support, not runtime verification.
Enforced means the client blocks automatic model invocation of the
ten user-only skills. Limited means the client documents the
frontmatter but cannot enforce it.

| Client | Entry for the ten skills |
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
are not install proofs:

- All 15 frontmatter names match their skill directories.
- All names are 32 characters or less. All descriptions are 291
  characters or less. The Amp, OpenCode, and Kimi caps fit.
- The root manifest carries the Agent Plugins 1.0.0 schema id.
- The Kimi manifest sets `skills` to `./skills/`.
- Every payload file under `skills/` is text. No file carries the
  executable bit.
