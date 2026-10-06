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
- Phase C (distribution and checks): part 1 complete (central
  catalogs, shared policy, Velnor vectors).
  Evidence: `docs/verification.md`. Next action: representative
  package check, then Phase D package rewrites.
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
