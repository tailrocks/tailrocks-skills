# Standardization work record

This file records decisions, checkpoints, and the completion checklist.
It obeys the goal in `tailrocks-skills-standardization-goal.md`.
`docs/verification.md` records verification evidence.

## No-evaluation rule

Do not create skill evaluations. Do not run skill evaluations.
Section 15 of the goal gives this limit.
Static checks and installation checks are permitted.
Record this rule before authoring starts.

## Decisions

| ID | Decision |
| --- | --- |
| D1 | `tailrocks/tailrocks-skills` is the single distribution authority. |
| D2 | The marketplace name is `tailrocks` where an agent supports a name. |
| D3 | PR #17 in `tailrocks-repository-skills` merged on 2026-10-06. The `tailrocks-repository-recover` entry is now unconditional. |
| D4 | Keep the name `tailrocks-skill-authoring-skills`. |
| D5 | Keep the skill ID `asd-ste100`. Keep the ASD-STE100 repository private. |
| D6 | Repository renames stay pending until the Phase B name review. |
| D7 | Rename `tailrocks-open-source-skills` to `tailrocks-contribution-skills`. Target is available. Reason: the package holds only contribution procedures. |
| D8 | Rename `tailrocks/asd-ste100-skill` to `tailrocks-asd-ste100-skills`. The repository stays private. The skill ID `asd-ste100` stays unchanged. |
| D9 | Pin alint v0.17.0, velnor-actions 0.1.0, markdownlint-cli2 0.23.3, zizmor 1.30.1. |
| D10 | Accept common design v2. A fresh independent reviewer gave ACCEPT on 2026-10-07. All 15 v1 defects are fixed. |
| D11 | Carry 4 minor review notes into implementation: profile reject lines, file-length owner row, template coverage lines, per-installer private auth evidence. |
| D12 | Keep the 3-field Claude host manifest. Plain `validate` passes. The `claude --strict` author warning is advisory. |
| D13 | Merge and release Velnor PR #98 before Phase E CI regeneration. Repositories consume the generator through release pins. |
| D14 | Keep the manually added PR template content through the next Velnor regeneration. |
| D15 | Rename the central catalog asd entry id to `asd-ste100-skill` at the Phase E update. The skill ID `asd-ste100` stays unchanged. |
| D16 | The asd-ste100 SKILL.md must use the Section 10 common body order. Practical and Strict modes stay distinct. |
| D17 | Shard-tail finals stay open for the Phase E private review. They need the source holder. |
| D18 | Push through gh HTTPS auth while 1Password SSH signing refuses. Keep remotes unchanged. |

## Current revisions (Phase A, 2026-10-07 UTC)

| Repository | Revision | Skills |
| --- | --- | ---: |
| tailrocks-skill-authoring-skills | `95348b233ae53b4ea1f805b5e03843cbebcdbacd` | 4 |
| tailrocks-repository-skills | `759849769249b5a4ada95595914ab8e81daf618b` | 7 |
| tailrocks-typescript-skills | `0652a50fce67c4a11f01ebb960a50fd5e283e0a9` | 12 |
| tailrocks-macos-skills | `eb0be5522fe0c1c9c74d41ee354446a011b10c74` | 15 |
| tailrocks-roadmap-skills | `98d23280cd562c9298ce13ae40bd0eb73a3e376a` | 15 |
| tailrocks-open-source-skills | `3e51bc5c91949f361ed926d8f760bcb16edef111` | 5 |
| tailrocks-code-quality-skills | `e63a82f28b688a7fada418e615aa9ec0eeec4c04` | 12 |
| tailrocks-rust-skills | `0317f100714dc66285c01c24f7967134375b5ac5` | 15 |
| tailrocks-pull-request-skills | `1b260bab1e356b1123fbbbdcdb17bb7bbf8ae83a` | 6 |
| tailrocks-skills | `1e9a23a63e0a44abf6a5ef17b69711011316cd9f` | 0 |
| asd-ste100-skill | `0572839a13afc145083535b3e29c79b78489af40` | 1 |

Total: 92 installable skills. Baseline was 91. PR #17 adds 1.
Open PRs: 0 in all repositories.
Full per-skill inventory: `/tmp/phase-a-synthesis.md` plus
`/tmp/<repository>-inventory.json` (11 files, temporary).

Disposition summary: keep 80, move 3 (`tailrocks-improve-*` to
code quality), retire 6 (pull request package), compare 11
boundaries before a possible merger, keep 1 template asset
outside installed inventories.

## Phase checkpoints

- Phase A (current state): complete. Evidence: `docs/verification.md`.
- Phase B (common design): complete. Evidence: `docs/verification.md`.
- Phase C (distribution and checks): complete.
  Evidence: `docs/verification.md`.
- Phase D batch 1 (authoring, repository, open-source,
  asd-ste100): complete. Evidence: `docs/verification.md`.
  Next action: Phase D batch 2 rewrites. Tracked: Velnor PR
  #98 merge plus release; asd-ste100 body-order fix-up;
  1Password SSH signing refused, gh HTTPS fallback in use.
- Phase D (rewrite packages): not started.
- Phase E (migration): not started.
- Phase F (verify and finish): not started.

## Completion checklist

### Scope and ownership

- [x] Read the current remote state of all 11 repositories.
- [x] Read the relevant open PRs.
- [x] Record every current installable skill.
- [x] Count templates separately.
- [x] Record one final disposition for every original skill.
- [ ] Keep every retained responsibility.
- [x] Give each active skill one owner.
- [x] Complete the repository and plugin name review.
- [x] Complete every affected consumer mapping.
- [ ] Keep the ASD-STE100 repository's visibility.

### Shared distribution

- [ ] Use one central marketplace repository.
- [ ] Use one common marketplace name where supported.
- [ ] Keep one central plugin inventory.
- [ ] Generate only necessary native catalog formats.
- [ ] Remove internal component marketplaces.
- [ ] Remove the retired PR package from active catalogs.
- [ ] Make sure that every catalog source revision exists.
- [ ] Make package names and catalog names agree.
- [ ] Make versions and source revisions agree.
- [ ] Compare expected plugin IDs with every applicable native catalog inventory.
- [ ] Verify public and authorized private access separately.

### Package structure

- [ ] Use the common active-package structure.
- [ ] Use the explicit marketplace structure.
- [ ] Use the explicit retired-repository structure.
- [ ] Use the portable root manifest correctly.
- [ ] Keep only necessary host manifests.
- [ ] Keep one authoritative body for each skill.
- [ ] Keep necessary resources after installation.
- [ ] Keep stored templates out of native skill inventories.
- [ ] Remove unsupported external path dependencies.
- [ ] Remove duplicate definition pages.
- [ ] Remove obsolete executable adapters and copied frameworks.
- [ ] Keep required licenses and notices.

### Skill content and writing

- [ ] Complete each skill item in the appendices.
- [ ] Correct every applicable technical defect in Section 16.
- [ ] Give each skill's task and selection conditions clearly.
- [ ] Give inputs, procedure, output, and completion checks.
- [ ] Correct contradictory authority and Git rules.
- [ ] Keep valid user authority across related stages.
- [ ] Keep real external access controls.
- [ ] Separate Tailrocks choices from language and protocol requirements.
- [ ] Verify general words and technical terms.
- [ ] Keep exact commands, numbers, conditions, and uncertainty.
- [ ] Complete the strict ASD-STE100 editorial review.
- [ ] Correct the ASD-STE100 source and notice contradictions.

### Documentation

- [ ] Use the common README heading order.
- [ ] Give a correct entry for every current skill.
- [ ] Give every package an installation section for each of the eight agents.
- [ ] Use commands for the actual package.
- [ ] Keep shell commands separate from session commands.
- [ ] Give installation scope and required access.
- [ ] Give update, reload, and removal behavior.
- [ ] Give source versions and verification limits.
- [ ] Complete the documentation index and troubleshooting page.
- [ ] Remove stale names, links, commands, and custom rendering elements.

### alint and CI

- [ ] Use the correct alint project and pinned version.
- [ ] Validate every alint configuration.
- [ ] Use one maintained shared policy.
- [ ] Include the applicable profile checks in required CI for all 11 repositories.
- [ ] Use immutable policy references with integrity values.
- [ ] Reject unauthorized policy weakening.
- [ ] Verify required files and prohibited directories separately.
- [ ] Validate actual skill frontmatter with a suitable tool.
- [ ] Validate strict manifest syntax and duplicate keys.
- [ ] Verify active skill ID uniqueness.
- [ ] Verify local links and installed resource paths.
- [ ] Verify that each new structural gate rejects its intended defect.
- [ ] Keep required files through Velnor regeneration.
- [ ] Make the required status include all required checks.
- [ ] Run required checks for Markdown, templates, and assets.
- [ ] Pass the applicable PR and default-branch checks.
- [ ] Remove all active skill evaluation requirements and execution paths.

### Installation, review, and delivery

- [ ] Record results for every supported installation method.
- [ ] Compare expected skills with actual native inventories.
- [ ] Verify update and removal methods without model tasks.
- [ ] Record every check that did not run.
- [ ] Complete the first review pass.
- [ ] Complete the independent final review pass.
- [ ] Correct all required findings.
- [ ] Push every completed change.
- [ ] Complete the authorized PR and release work.
- [ ] Examine the final remote revisions.
- [ ] Remove only temporary work created for this goal.
- [ ] Give the final report with no false completion claims.

## Temporary paths

- `/tmp/<repository>-inventory.json` (11 files, Phase A evidence)
- `/tmp/phase-a-synthesis.md` (Phase A checkpoint)

## Phase D batch 2 checkpoint (2026-10-07)

All five package rewrites pass. Writers worked on
`standardize/package-rewrite` atop clean bases. The owner verified
the remote heads through the GitHub API, so no drift exists.

- rust: commits `8c45cff`, `b675e40`, `1fd1396`. alint 53/53 on
  HEAD. 15 skills, max 182 lines. Pushed.
- roadmap: commits `b1a9fcf`, `a617678`, `1528fd9`. alint 53/53
  on HEAD. 12 skills. Pushed.
- code-quality: commits `2e2ed28`, `fc66e03`, `26619ea`.
  alint 53/53 on HEAD. 14 skills: the improve trio merges to
  audit plus security-audit, with deep work as `--deep`.
  Vendored files are byte-identical. Pushed.
- typescript: commits `bcbfe48`, `e1f38ec`, `2d02c95`.
  alint 53/53 verified before commit. 12 skills, 114-163
  lines. Pushed.
- macos: commits `b496a7f`, `74af176`, `622834b`. alint 53/53
  verified before commit. 15 skills, 93-260 lines. Pushed.

Decision D19: accept 14 code-quality skills. The goal merges
improve-deep into improve-audit through a coverage option, so
the stale expectation of 15 does not apply.

The macOS residual STE vocabulary classes move to the Phase E
final editorial review. The Kimi pins move at release.

## Phase E renames (2026-10-07)

Both reviewed renames are complete on GitHub. The owner
verified that each target name was free before the rename.
Old URLs redirect to the new names.

- `tailrocks-open-source-skills` becomes
  `tailrocks-contribution-skills` (public). Reason: the
  package holds only contribution procedures. Plugin name
  changes with the repository. Skill IDs do not change.
  Branch commit `9de71a1`, pushed.
- `tailrocks/asd-ste100-skill` becomes
  `tailrocks-asd-ste100-skills` (private). Reason: the goal
  mandates the team name form. Only repository URLs change.
  The plugin name `asd-ste100-skill` and the skill ID
  `asd-ste100` do not change. Branch commit `cb54957`,
  pushed.

Affected consumers, all inside this work set: the two
package manifests, READMEs, and docs guides; the central
catalog files (names and revisions update with the final
catalog step); this work record. No outside consumer is
known. The local directory names do not change.

## Phase E first pass and corrections (2026-10-07)

The first review pass covered all nine rewritten packages
with a named record for each skill. It found one critical
defect: a section-15 comparison requirement in the macOS
agent-integration reference. The correction round fixed 199
findings, rejected 17 with evidence, and left 2 blocked on
Velnor regeneration. All nine correction commits are pushed:
authoring `7024993`, repository `be92ee0`, contribution
`9cfd02d`, asd `b9c8fe0`, typescript `aeaafd8`, macos
`217aaa2`, roadmap `0f64930`, code-quality `ae4b1f3`, rust
`2307bc4`.

Decision D20: regenerate with the locally built
`velnor-actions` 0.1.0 from `velnor-new` at `47c7b5b2e`
(the Velnor change branch). The owner verified the binary
identity and version. The post-release wave re-verifies
with the released binary.

The retire branch holds commits `b53e3f2` and `e69205a`,
pushed. The moved review criteria hold commit `21efdf0`
in the repository package, pushed.

## Phase E CI rollout (2026-10-07)

All 11 repositories now declare the alint verification job
in `.velnor/config.toml` and carry regenerated CI whose
required gate covers it. The generator is `velnor-actions`
0.1.0 from `velnor-new` at `47c7b5b2e`. Rollout commits:
authoring `93e0054`, repository `480f376`, contribution
`802b192`, typescript `019a0c6`, macos `54f6d13`, roadmap
`4ee6019`, code-quality `c298e9e`, rust `1b7e037`, asd
`485fb6c`, retire `9857806`, marketplace `86b4950`. All
pushed. The PR template header now records the proven
preserve behavior in all nine active packages (asd
`23e20f4`, rust `25a37cb`, rest inside the rollout
commits). The marketplace gained `docs/standards/`
(`3b7a24e`), which clears the last alint warning.

Decision D21: the marketplace keeps no PR template. Its
role structure does not list one, and its profile does
not require one.

Decision D22: keep `req-standards-docs` at warning level.
CI fails on warnings, so the rule still enforces. A
level change would churn the shared pin in all 11 repos.

Finding VELNOR-PIN-SKEW (post-release): generated CI pins
the alint action input at v0.16.1 while the local gate
uses v0.17.0. Both pins are fixed and deterministic. The
Velnor maintainer aligns them at release time.

Note: one transient generation-comparison mismatch
appeared in six runs with no input change and no
recurrence. Retries into fresh preview dirs pass. If it
recurs, investigate the generator before trusting a red
comparison.
