# Verification evidence

This file records verification evidence for the standardization work.
`docs/migration.md` records decisions and the completion checklist.

## Final component adoption (2026-11-20)

All eleven corrected component pull requests merged after Required CI, Bun
verification, and DCO passed at their exact heads.
Vitalik Mode also passed its security quality gate with zero annotations.
Each actual merge commit has the same Git tree as its independently reviewed
release candidate.
Authenticated GitHub reads confirmed every pinned manifest's identity, version,
description, and repository visibility: nine public sources and two private ones.

The marketplace adopts these immutable commits:

| Component | Version | Merged change | Source commit |
| --- | --- | --- | --- |
| Skill Authoring Skills | 0.29.2 | [#18](https://github.com/tailrocks/tailrocks-skill-authoring-skills/pull/18) | [c32581071fd9](https://github.com/tailrocks/tailrocks-skill-authoring-skills/commit/c32581071fd9b3d2a327a6b01cfe4e365df8a3d3) |
| Repository Skills | 0.6.2 | [#40](https://github.com/tailrocks/tailrocks-repository-skills/pull/40) | [fd2a47ca25d0](https://github.com/tailrocks/tailrocks-repository-skills/commit/fd2a47ca25d04527e38ca20ffcaf57bbf9653811) |
| Vitalik Mode | 0.2.1 | [#6](https://github.com/tailrocks/tailrocks-vitalik-mode-skills/pull/6) | [d1e57b5ec051](https://github.com/tailrocks/tailrocks-vitalik-mode-skills/commit/d1e57b5ec0516c23b2c18d77846d7f2ee96674d3) |
| TypeScript Skills | 0.29.2 | [#14](https://github.com/tailrocks/tailrocks-typescript-skills/pull/14) | [4c13f9c634b6](https://github.com/tailrocks/tailrocks-typescript-skills/commit/4c13f9c634b6d065184b54664e3d1a76619eda7f) |
| macOS Skills | 0.29.2 | [#14](https://github.com/tailrocks/tailrocks-macos-skills/pull/14) | [9a178fe129b8](https://github.com/tailrocks/tailrocks-macos-skills/commit/9a178fe129b83ed94c6ca1a09ffe51a3d5a45ead) |
| Roadmap Skills | 0.29.2 | [#14](https://github.com/tailrocks/tailrocks-roadmap-skills/pull/14) | [8bf6289976bc](https://github.com/tailrocks/tailrocks-roadmap-skills/commit/8bf6289976bc822a0b9a22682e3661af0b07110e) |
| Contribution Skills | 0.29.2 | [#13](https://github.com/tailrocks/tailrocks-contribution-skills/pull/13) | [0f79bfb848cc](https://github.com/tailrocks/tailrocks-contribution-skills/commit/0f79bfb848cc48ca38e9df081cce42999f4b73f1) |
| Code Quality Skills | 0.29.2 | [#14](https://github.com/tailrocks/tailrocks-code-quality-skills/pull/14) | [c62b336b15ba](https://github.com/tailrocks/tailrocks-code-quality-skills/commit/c62b336b15baead7ac1880602c22261445169fb4) |
| Rust Skills | 0.30.1 | [#14](https://github.com/tailrocks/tailrocks-rust-skills/pull/14) | [8a4496558168](https://github.com/tailrocks/tailrocks-rust-skills/commit/8a4496558168dad4e4e7d34b9c8b1c206eecd305) |
| ASD-STE100: Clear Technical English | 0.3.1 | [#13](https://github.com/tailrocks/tailrocks-asd-ste100-skills/pull/13) | [0ec06542f12f](https://github.com/tailrocks/tailrocks-asd-ste100-skills/commit/0ec06542f12f0e5cdab73c0596e66a98595ef888) |
| Agent Policy Skills | 0.4.1 | [#2](https://github.com/tailrocks/tailrocks-agent-policy-skills/pull/2) | [b8b3fe96d74a](https://github.com/tailrocks/tailrocks-agent-policy-skills/commit/b8b3fe96d74ac5b1755053fc570239b2d8479c40) |

The shared foundation merged in [PR #139](https://github.com/tailrocks/tailrocks-skills/pull/139)
at `5b2fc308a6f5a48d0c0e85c18e8db43c97e06433`.
Its package integrity correction merged in [PR #140](https://github.com/tailrocks/tailrocks-skills/pull/140)
at `d7ace6576342d796094ab6f52cd2f6f5a4823ede`.
Every component pins that corrected shared profile and its verified digest.

The integrity-correction archive fixture packed all eleven candidates.
All 1,666 required files matched their source bytes, including every Bun lockfile.
This archive count is separate from the earlier four-client installation count.
The repository runtime suite passed 1,389 tests with 4,158 assertions.

Native installation evidence retains the limits recorded below.
Kimi's current route has no native runtime verification in this round.
No model task was part of the installation tests.

## Native distribution foundation (2026-11-20)

PR #138 merged at `10e9ab1e59c220eacfea19ef2142d469d9925275`.
DCO and the required CI checks passed before merge.
The catalogs now use verified immutable source formats.

The shared native package generator produces 295 files across eleven component
repositories and 98 skills.
A second generation pass found no drift.
Portable frontmatter validation preserved 71 explicit-only policies and 27
implicit policies.
The npm file inventory included every declared runtime resource.
Private maintainer directories were excluded from the archive inventory.

The shared package validator passed a clean fixture.
Sixteen deliberate changes failed validation.
They covered malformed JSON, mismatched identity, missing resources, altered
registrars, invocation policies, model identities, and symlinks.
A separate Vitalik fixture rejected loss of its activation and goal guards.

The [distribution guide](standards/distribution.md#native-evidence) records four
actual client pin-selection experiments.
A separate OpenCode 2.3.2 fixture loaded an installed three-skill package through
its live registry.
The Amp registrar used an API test double.
These checks establish installation and discovery behavior, not model outcomes.

All twelve repositories use Velnor Actions 0.1.80.
Fresh generator previews matched their generated files.
Jactionlint, ShellCheck, and local file-and-fragment link checks passed.
The marketplace's updated Alint profile passed all 57 applicable rules.

Component publication and final catalog adoption are recorded in the subsequent
release evidence.

## Candidate native installation (2026-11-20)

The eleven release candidates installed successfully in four native clients.
Claude Code 2.1.328, Codex 0.167.0-alpha.4, Grok Build 1.0.89, and Muse Code
1.4.24-R9131.1 each loaded all eleven packages.
Their actual registries reported all 98 expected plugin and skill pairs.
The installed copies preserved all 1,655 compared runtime, skill, and manifest
files with no digest differences.
Muse offered eleven marketplace entries and skipped none.

The fixtures used isolated local mirrors and synthetic immutable commits of the
candidate trees.
They did not claim new public release commits or private GitHub authentication.
No model task ran.

Codex returned qualified skill names in the form `plugin-id:skill-id`.
The installation guides use those qualified names for explicit selection.
Grok returned bare skill names for globally distinct IDs.
Its `invocableAs` field provides the resolved shortcut when names collide.

OpenCode 2.3.2 loaded all eleven packed candidates in its live loopback server.
Its registry returned the exact 98 installed paths, descriptions, and bodies.
It preserved 71 explicit-only flags and 27 implicit-selection flags.
All bundled model references resolved from those installed paths.
Both visual harness contracts and 21 package-root resource files matched.
The server could not start outbound connections and made no model calls.
This run covers local package registration, not eleven remote Git installs.

## Additional native routes (2026-11-20)

omp 19.0.0 installed the contribution package through the shared Claude catalog.
Its native registry returned all five expected skills at installed paths.
Pi 1.5.2 installed the same package from a full-commit Git source.
Its resource loader returned all five expected skills at installed paths.
Both runs used isolated local Git mirrors and made no model calls.
These runs establish representative route behavior, not eleven-package coverage.

All eleven Antigravity manifests passed Google's official Draft 2020-12 schema.
The downloaded schema SHA-256 was
`0eea5e483af6f03fa099f32b065d2924a323f1a616ed0323cfa0b7a74ff9543c`.
A later native check used Antigravity CLI 1.5.12 and the public contribution
package at `f8a276a401ca58855e2c687f2bb60c120e25acc4` (version 0.29.1).
The official Linux executable matched its published SHA-512.
Native validate, install, and list commands succeeded in a disposable profile.
The enabled registry entry contained all five expected skills, whose installed
bodies matched the source bytes.
This is representative route coverage, not eleven native Antigravity installs.
The validator warned that its native manifest takes precedence over the portable
root manifest and that root AGENTS.md is not a native rules file.
No login, browser, or model task was required.

Amp's registrar passed its API fixture.
Amp's CLI could not complete native registry discovery in the offline profile.
Its global plugin service required network access.
Representative live checks on public packages are tracked in
[#141](https://github.com/tailrocks/tailrocks-skills/issues/141).

## Package integrity correction (2026-11-20)

The security scan on Vitalik PR #5 identified three backtracking regexes in the
shared validator and a missing dependency lockfile.
The correction applies to every component through the shared source.
No scanner exclusion or rating suppression was added.

The validator now parses YAML keys, fenced text, and inline link targets with
bounded forward scans.
The new link parser preserved destinations across thirty actual Vitalik documents.
It continued to reject missing paths, encoded traversal, absolute paths, and
escaping symlinks.
Adversarial inputs up to five million characters completed within 0.31 seconds
in the local fixture.
The fixture compared several input sizes to examine scaling.

Every package now pins Bun 1.4.4 and commits and ships its dependency lockfile.
Offline frozen-lock verification passed without dependency lifecycle scripts.
A deliberately stale dependency failed the frozen check.
Missing, non-file, or omitted lockfiles and an incorrect manager also failed
package validation.
At this phase, native skill bodies and registrar behavior remained as measured
in the candidate installation checks.

## Existing audit reconciliation (2026-11-20)

The refactor was checked against all findings in
[issue #135](https://github.com/tailrocks/tailrocks-skills/issues/135).
The [resolution record](audit-resolution.md) accounts for every distinct finding.
The follow-up correction aligned authoring guidance with the shared package
contract and enforced literal angle-bracket rejection in skill descriptions.
It also corrected three macOS harness references and three code-quality
instruction-policy workflows.

The documented macOS setup command ran from an unrelated directory into a
project path with spaces.
All nine installed harness files matched their packaged templates.
The code-quality policy now recognizes a verified native import of the canonical
sibling AGENTS.md when its loader supports that syntax.
The generated eleven-byte Claude import satisfied that policy.

These source and resource checks complement the earlier native client fixtures.
Later instruction-body and reference changes are not presented as new full-client
installation runs.

## Phase A evidence (2026-10-07 UTC)

Method: one inventory workflow with 11 parallel read-only agents plus
one synthesis agent, plus inline `git` and `gh` checks.

- All 11 working trees clean (`git status --porcelain` empty).
- 10 of 11 HEAD revisions match Appendix A exactly.
- `tailrocks-repository-skills` `origin/main` is `7598497`
  (baseline `a2a13ff` is its ancestor; PR #17 merged 2026-10-06).
- Local checkout moved from `feat/repository-recover-skill`
  (`51c910b`) to `main` (`7598497`) after inventory reads finished.
- Open PRs: 0 in all repositories
  (`gh pr list --state open` returns empty, exit 0).
- PR #17 state: MERGED. PR #14 state: MERGED.
- Installable skills: 92 files at `skills/<id>/SKILL.md`.
- Template asset found separately (authoring package).
- CI generation: Velnor Actions 0.1.0 in all repositories
  (release manifest `tailrocks/velnor-new` commit `c57c7004`).

Tool versions on macOS (darwin):

- `gh` 2.102.0, `claude` 2.1.289, `codex` 0.160.0,
  `muse` 1.4.3, `node` v24.20.0, `cargo` 1.99.0, `jq` 1.7.1.
- Absent: `alint`, `velnor`, `amp`, `opencode`, `grok`, `kimi`.

Evidence files (temporary, kept until final cleanup):

- `/tmp/phase-a-synthesis.md` (147 lines)
- `/tmp/<repository>-inventory.json` (11 files)

No skill evaluation ran. No model task ran during checks.

## Phase B evidence (2026-10-07 UTC)

Method: one research workflow (8 agent-install tracks plus alint,
Velnor, name-review, and STE tracks), one design author, one
independent reviewer (REJECT with 15 defects), one reviser, one
fresh re-reviewer (ACCEPT).

- Research: 12 files at `/tmp/phase-b-agent-*.md`,
  `/tmp/phase-b-alint.md`, `/tmp/phase-b-velnor.md`,
  `/tmp/phase-b-names.md`, `/tmp/phase-b-ste.md`.
- Design: `/tmp/phase-b-design.md` (v1, rejected),
  `/tmp/phase-b-design-v2.md` (accepted, 101 lines).
- Reviews: `/tmp/phase-b-design-review.md` (REJECT, 15 defects),
  `/tmp/phase-b-design-review-v2.md` (ACCEPT, all 15 fixed,
  4 minor implementation notes).
- Name availability: both `gh repo view` checks return exit 1
  with the exact GraphQL not-found output on 2026-10-07.
- alint v0.17.0 confirmed as latest release on 2026-10-07.
- All 16 cited rule kinds verified in the v0.17.0 schema.

No skill evaluation ran. No model task ran during checks.

## Phase C part 1 evidence (2026-10-07 UTC)

- Central catalogs: commit `b08398d` (`catalog.json` with 9
  plugins and pinned revs, `scripts/generate-catalogs.py`, 3
  native catalogs). Generator runs are byte-identical.
  Strict JSON parse passes for all 4 files.
- Shared policy: commit `d54adec` (`standards/alint/` active,
  marketplace, and retired profiles, plus `.alint.yml`).
  `alint check` passes with 0 errors and 36 passing rules.
- Velnor vectors: `tailrocks/velnor-new` branch
  `standardize/verify-vectors`, commit `47c7b5b2e` (29 files,
  new `[workflow.verify]` vectors with tests). `cargo test`
  passes for all three generator crates.
- Synthesis: `/tmp/phase-c-part1-synthesis.md` (all PASS).

No skill evaluation ran. No model task ran during checks.

## Phase C part 2 evidence (2026-10-07 UTC)

- Representative package: `tailrocks-repository-skills` branch
  `standardize/common-package`, commits `af60546`, `bdf5f20`,
  `7178bfc` (manifests plus policy, docs, link repair).
- `alint check` passes: 53/53 rules, exit 0 (confirmed by an
  independent verifier and a parent re-run).
- Strict JSON: 4/4 files pass. Frontmatter: 7/7 names match
  directories. markdownlint 0.23.3: 0 issues in new files.
- Trial install lifecycle with Claude Code 2.1.289 in an
  isolated HOME: add, install, list (7 skills), uninstall,
  and remove all pass. `muse validate` returns valid true.
- Velnor PR: `tailrocks/velnor-new` PR #98 opened for the
  verify vectors. Regeneration waits for merge plus release.
- Synthesis: `/tmp/phase-c-part2-synthesis.md` (both PASS).

No skill evaluation ran. No model task ran during checks.

## Phase D batch 1 evidence (2026-10-07 UTC)

- Authoring: `tailrocks-skill-authoring-skills` branch
  `standardize/package-rewrite`, commits `6f779b5`, `25ca59f`,
  `6ad844e`. alint 53/53, 4/4 frontmatter, template moved.
- Repository content: `tailrocks-repository-skills` branch
  `standardize/common-package`, commit `a635822` (7 skills).
  alint 53/53, 7/7 frontmatter, `--method GET` and `--draft`
  fixes present.
- Open-source: `tailrocks-open-source-skills` branch
  `standardize/package-rewrite`, commits `2fa4c72`,
  `f7b1f21`, `1ad116b`. alint 53/53, 5/5 frontmatter.
- asd-ste100: `asd-ste100-skill` branch
  `standardize/package-rewrite`, commits `15fcd7b`, `9d9b400`.
  alint 53/53, body order applied per D16, modes distinct.
  Metadata only in this record.
- Synthesis: `/tmp/phase-d-b1-synthesis.md` (3 PASS, 1 PASS
  with the §10 deviation now in fix-up).
- Push note: SSH signing through the 1Password agent started
  to refuse; pushes use gh HTTPS auth per D18.

No skill evaluation ran. No model task ran during checks.

## Later phases

No evidence yet. This section grows with each phase.

## Phase D batch 2 (2026-10-07)

- rust: PASS. alint 53/53 on `1fd1396`. Strict JSON x3.
  Frontmatter 15/15. Max 182 lines. 16 keys verified.
- roadmap: PASS. alint 53/53. Strict JSON x3. Frontmatter
  12/12. Native probes match the expected state.
- code-quality: PASS with an owner ruling. alint 53/53.
  Strict JSON x4 with 0.28.0 agreement. Frontmatter 14/14.
  markdownlint 0/69. Vendored copies byte-identical. The
  count is 14, not 15, per decision D19.
- typescript: PASS. alint 53/53 re-run by the owner. Strict
  JSON x3. Frontmatter 12/12. Links 0 broken. markdownlint
  0/87. Native probes pass with the expected warning.
- macos: PASS. alint 53/53 re-run by the owner. Strict JSON
  3/3. Frontmatter 15/15. Refs 200/200. markdownlint 0/24.
  Residual STE classes stay open for Phase E.
- Drift: the owner checked all five remote heads through
  the GitHub API. No drift exists.
- Install checks: not run. Compatibility rows stay not-run
  with reasons. No skill evaluations, per the goal.

## Phase E renames (2026-10-07)

- Both target names returned HTTP 404 before the rename.
- After the rename, both new names resolve with the
  expected visibility (contribution public, asd private).
- alint 53/53 passes on both rename commits (`9de71a1`,
  `cb54957`). No skill evaluation ran.

## Phase E first pass and corrections (2026-10-07)

- First pass: 9/9 branches reviewed with named skill
  coverage. No-eval CLEAN in 8 branches; 1 violation in
  macos, now deleted and verified absent.
- Corrections: alint 53/53 re-run by the owner on all 9
  trees before commit. Strict JSON, frontmatter, and
  markdownlint gates pass per writer evidence. Added-line
  eval greps are clean.
- Blocked: asd-F16 (absent CI workflows) and rust-F7
  (absent alint job) wait on supported regeneration,
  now in progress with the verified local binary.
- Install checks: not run, by plan. No skill evaluations.

## Phase E CI rollout (2026-10-07)

- Generation comparisons: clean in all 11 repos,
  re-verified by the owner in 9 after the template
  header refresh. PR template sha identical in all
  nine active packages (`44a7c92b6d1b`).
- alint re-run by the owner: 53/53 in all nine active
  packages, 15/15 retired, 37/37 marketplace.
- Required gates cover the alint job in all 11
  generated workflows. No release-manifest warnings.
- docs/standards: 3 files, markdownlint 0 issues, no
  semicolons or contractions. No skill evaluations.

## Phase E second pass and final corrections (2026-10-07)

- Second-pass corrections verified in tree by direct
  read before commit: 18/18 docs fixes, then all five
  mapped install, CI, and naming fixes.
- Gate re-run by the owner after all corrections: alint
  53/53 in all nine actives, 37/37 marketplace, 15/15
  retired. Strict JSON passes on all 27 manifests.
  Frontmatter and ID agreement passes on all 85 skills.
  markdownlint reports 0 issues in all nine actives.
- Generation comparison: empty diff in all 11 repos
  with `velnor-actions` 0.1.0 (`61df27df...ecb36`).
- Measured roadmap maxima: longest name 25 characters,
  longest description 342 characters (`tailrocks-idea`).
- No skill evaluations ran.

## Velnor release evidence (2026-10-07)

- PR #99 merged to main as `8f1b7f02a`. All
  checks passed except informational DCO. PR #98
  closed as superseded.
- Independent port review: APPROVE-WITH-NOTES.
  The scope note is accepted after verification.
- Generator acceptance: 11/11 consumer repos
  generate cleanly. The alint job emission is
  byte-identical.
- PR #100 refreshed freshness evidence and
  merged as `6f06bb95c`. Local gate: 215 rows,
  0 failing.
- Release run 37641126742 fails at
  `build-macos-intel`. Upstream `mr-boxington`
  provides no Intel-Mac artifact.
- Linux and macos-arm builds passed. Images and
  velnor-host graphs fail independently and do
  not block v0.1.1.
- PR #101 (Intel cross-compile) merges as
  `8b2b5527e`. Review verdict: Ready. CI is
  fully green, including DCO.
- Release run 37652850835: all three builds
  pass, including `build-macos-intel`. All
  three qualify jobs fail with `FATAL: release
  candidate generate failed for nested`.
- Generator graph needs only eligibility and
  prepare jobs. Host and images failures do
  not block v0.1.1.
- PR #102 (qualify tools + commit
  normalization) merges as `1255ef672`.
  Review verdict: Ready. CI is fully green.
- Release run 37663014979: all builds pass,
  all 4 fixtures match, hostile negative
  matches. Dogfood `generate` fails on all
  3 platforms.
- PR #103 (dogfood cargo fetch) merges as
  `c9554ab14`. Review verdict: Ready. CI is
  green after an inline clippy-lint fix.
- Release run 37675185350: all three builds
  pass, all three qualifies pass,
  attest-linux passes. Both macOS attest
  legs fail with `timeout: command not
  found`.
- GNU `timeout` is absent on macOS runners.
  The same wrapper also fails the velnor-host
  publish job. A portable wrapper fix is in
  progress on `standardize/attest-timeout`.
- PR #104 (portable bash watchdog) merges
  as `2c23e4c95`. Review verdict: Ready
  with zero blocking findings. CI is fully
  green (21 checks).
- Release dispatch from `2c23e4c95` is next.
  Freshness evidence of 14:38Z stays valid.
- Release run 37689782569: all generator
  builds, qualifies, and attests pass.
  Velnor-host publishes. Runner-images
  build fails independently.
- `publish-generator` waits for donbeave
  environment approval. Agent approval is
  blocked by self-review prevention.
- v0.1.1 publishes as release 406234998
  from `2c23e4c95`. Tag, immutable mode,
  20/20 assets, and acceptance verify.
- Linux SHA:
  `3cb6e96e04c34e325a55c28f89d477a7c092808842ef8625ab3e7b157a26d7a2`.
- ARM64 SHA:
  `9377495853678ea5d47a45adc09291b27b9cfc17afc2540ab158d1261d039c74`.
- Intel SHA:
  `abd721a1a4ae982bc50980b7d14b530d6a84f983c23a6469db8afd59c2c055e4`.
- No skill evaluations ran.

## Phase E release and install evidence (2026-10-08 UTC)

- Velnor v0.1.4: release 406452151
  from `d3590d32`. All 20 assets verify
  byte identical with sidecars.
- Regen v3: 11/11 PRs merged on all
  package mains.
- Patch releases: `v0.28.1` on 7
  packages, `v0.4.1` on repository,
  `v0.1.1` on ASD. All tags point at
  their final main SHAs.
- Catalog #125 merged as `e0c09d1`.
  All 9 entries pin tag plus revision.
- Tagref fix #126 merged as `0d7c9e7`.
  Re-pin #127 merged as `4eec8d1`.
  Profile hash `c0d650d6...` verified
  against the raw fetch.
- Claude Code 2.1.289, macOS 27.0.1:
  9/9 PASS through catalog `4eec8d1`.
  Two-revision cycles on roadmap, rust,
  and contribution show genuine updates.
  Logs: `/tmp/iso-claude/_logs/`.
- Muse Code 1.4.3 (1.4.3-R5018.1),
  macOS 27.0.1 build 26A434: 9/9 PASS
  through catalog `4eec8d1`. All 9
  digests match round 1. Installs pin
  to SHAs, not floating tags. Logs:
  `/tmp/iso-muse/logs/`.
- Codex 0.161.0: 9/9 PASS stands. Its
  catalog is byte identical across the
  tagref change.
- File checks: 85/85 inventoried for
  Amp, OpenCode, and Antigravity.
  Native discovery stays unverified.
- Grok and Kimi: not run. Their CLIs
  are absent.
- Marketplace main CI: success on
  `e0c09d1`, `0d7c9e7`, `4eec8d1`.
- No skill evaluations ran.
