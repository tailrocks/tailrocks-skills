---
name: tailrocks-macos-visual-baseline
description: >-
  Writes one reproducible baseline package across the state matrix
  from one blessed native macOS prototype. Use this skill only when
  the user
  explicitly requests it. Production judgment, candidate comparison,
  harness installation, and blessing belong to other owners.
argument-hint: "baseline <blessed prototype package> --output <baseline directory>"
disable-model-invocation: true
disableModelInvocation: true
license: Apache-2.0
user-invocable: true
---

# macOS Visual Baseline

## Use this skill

This skill writes one reproducible baseline package across the
state matrix from one blessed native macOS prototype. This owner
alone writes a macOS visual baseline.

Accept only exact `baseline <blessed prototype package> --output
<baseline directory>`. Refuse a missing, unknown, or duplicate
selector. Refuse more than one selector in one invocation. Refuse
`verify`, `harness`, `freeze`, and `regress` selectors.
Production judgment, candidate comparison, harness installation,
and blessing belong to other owners. Current-render judgment
belongs to `tailrocks-macos-visual-qa`. Comparison belongs to
`tailrocks-macos-visual-regression`.

## Before you start

Obey the active user request first. If the request conflicts with a
safety rule in this skill, stop. Report the conflict.

Read `references/runtime-trust.md`,
`references/design-pipeline.md`,
`references/harness-contract.md`, and
`references/missing-project-policy.md` before any action. Apply the
region oracle in `references/match-policy.md`. Resolve each
relative link in the directory that contains this SKILL.md file.

Baseline authorization permits only the named baseline directory
and its transaction-owned sibling stage and recovery paths. It
grants no production, prototype, harness, approval, commit, or
system-setting authority beyond the temporary restored state
transaction.

The canonical repository root and revision, one
real prototype package, exact executable identity, `Regions.md`,
and `SIGNOFF.md` that identifies a separate acceptance-review PASS
plus the user date, revision, scenario, appearance, and size
sign-off are necessary. Missing, malformed, incomplete, or
revision-mismatched blessing is `BLOCKED`. An agent never repairs
it.

The hardened harness, already installed and byte-bound, is
necessary. A missing or mismatched harness stops the run. It shows
its exact installer command. Installation permission comes from the
user only. The graphical session and permission proofs from the
harness contract are necessary. Record the six-key appearance
registry before any change.

When the output path holds no baseline, the run is a first
freeze. When the output path holds a baseline, the explicit user
re-freeze request, a new blessing after the old baseline record,
and an exact preimage digest are necessary. If not, refuse.
Change nothing.

## Procedure

1. **Write the matrix.** Write the complete matrix from the
   blessing and `references/state-matrix.md`. Every signed-off
   scenario, appearance, size, backdrop, accessibility axis, and
   region is mandatory. Before step 2, name every mandatory row.

2. **Create the stage.** Create one same-parent stage directory
   exclusively. Record its directory identity and an exact allowlist
   before capture. Refuse symlinks, path escape, nested unknown
   entries, unbounded files, and parent or revision change.
   Before step 3, make sure that the stage identity and allowlist
   are recorded.

3. **Run and record.** Run the blessed prototype through the
   fixed launch contract in `references/launch-contract.md`.
   Record each running window by exact PID and window ID. Record
   two captures per row. Both give the same dimensions and bytes.
   Accept the frame after that. Before step 4, hold two matching
   captures for every row.

4. **Write the record.** Write only allowlisted PNGs, capture
   sidecars, and `BASELINE.json`. The record binds repository,
   prototype, and blessing revisions and digests, binary and
   version, scenario, appearance, size, and backdrop, OS build, SDK,
   scale, color profile, region class and pixel budget, every file
   digest, harness source digest, producing user, and UTC time. Read
   `references/baseline-metadata.md`. Before step 5, complete every
   record field.

5. **Restore settings.** Restore and verify all system settings
   before publication. Restoration failure is `RECOVERY_REQUIRED`.
   No baseline publishes. Before step 6, verify restoration.

6. **Publish atomically.** Record the stage, blessing,
   revision, parent identity, and expected destination preimage
   again. Publish the complete directory with an OS atomic
   no-replace swap. For re-freeze, first move the exact old
   directory to an exclusive recovery sibling. Any failed final
   verification restores only on exact identities, otherwise keeps
   recovery and stops. Before step 7, publish the complete
   directory or stop with recovery named.

7. **Verify the published package.** Read the published package
   again. Verify its identity, allowlist, digests, matrix
   completeness, and record. Remove an owned old directory only by
   atomic quarantine followed by identity and content revalidation.

## Result

The run returns one receipt. It names the bound revisions, blessing
digest, output, preimage and new package digests, matrix and frame
counts, setting restoration, mutations, recovery artifacts, and
final `FROZEN`, `BLOCKED`, `REFUSED`, or `RECOVERY_REQUIRED`.
`FROZEN` needs the complete blessed matrix and final
published-byte evidence. Never record a partial package as frozen.

## Completion checks

Before the report is complete, make sure that each item below is true:

- The skill judged no production and compared no candidate.
- The skill installed no harness and blessed no design.
- The package holds the complete blessed matrix, no more and
  no less.
- The skill restored every system setting and proved it.
- The skill published nothing partial as frozen.
- The receipt names mutations and recovery artifacts.

## References

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the
  trust rules.
- Read `references/design-pipeline.md` before any action for the
  stage vocabulary.
- Read `references/harness-contract.md` before any action for the
  harness interfaces and permission proofs.
- Read `references/missing-project-policy.md` before any action
  for the missing-project procedure.
- Read `references/match-policy.md` in steps 1 and 4 for the
  region oracle, modes, and budgets.
- Read `references/state-matrix.md` in step 1 for matrix rows
  and capture order.
- Read `references/launch-contract.md` in step 3 for the fixed
  launch arguments.
- Read `references/baseline-metadata.md` in step 4 for record
  fields and package validity.
- Read `references/verification.md` in step 1 for the canonical
  state axes.
- Read `references/interaction.md` when the task needs driving
  or audit guidance.
