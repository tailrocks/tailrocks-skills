---
name: tailrocks-macos-visual-regression
description: >-
  Compares current native macOS running-window captures with one
  approved baseline package. Use this skill only when the user
  explicitly requests it. It is read-only on project and baseline.
  A baseline freeze and design approval belong to other owners.
argument-hint: "regress <feature or screens> --baseline <baseline directory>"
disable-model-invocation: true
disableModelInvocation: true
license: Apache-2.0
user-invocable: true
---

# macOS Visual Regression

## Use this skill

This skill compares current running-window captures with one
approved baseline package with environment, structural-region, and
pixel-budget gates.

Accept only exact `regress <feature or screens> --baseline
<baseline directory>`. Refuse a missing, unknown, or duplicate
selector. Refuse more than one selector in one invocation. Refuse
`verify`, `harness`, `baseline`, and `freeze` selectors. There is
no deprecated route. Baseline creation belongs to
`tailrocks-macos-visual-baseline`. Current-render semantic judgment
belongs to `tailrocks-macos-visual-qa`.

## Before you start

Obey the active user request first. If the request conflicts with a
safety rule in this skill, stop. Report the conflict.

Read `references/runtime-trust.md`,
`references/harness-contract.md`,
`references/missing-project-policy.md`, and
`references/regression.md` before any action. Apply the region
oracle in `references/match-policy.md`. Resolve each relative link
in the directory that contains this SKILL.md file.

This owner is read-only on repository source and baseline bytes.
Candidate captures and diffs live only in a newly created external
temporary directory. Never write a report file.

## Procedure

1. **Record and validate the baseline.** Record one canonical
   repository root and revision, app bundle and real executable,
   baseline directory identity, and `BASELINE.json` digest. Validate
   the exact schema, complete matrix, environment, unique safe
   relative files, bounds, and every declared digest before launch.
   Refuse symlinks, escapes, duplicate rows, missing bytes, unknown
   entries, or malformed budgets. Before step 2, hold a valid
   baseline.

2. **Get harness and session.** Get the hardened harness
   already installed and byte-bound. Never install it. Get an
   interactive graphical session and verify the permissions used.
   Before step 3, hold harness identity and permission facts.

3. **Record the candidate.** Create an external owner-only
   temporary directory and record its identity. Record the six-key
   appearance registry. Record the current running app once per
   exact baseline row through the same fixed launch contract and
   exact PID and window-ID path. Refuse detached snapshots and
   rectangle captures. Before step 4, record every baseline row.

4. **Require environment match.** Require exact scenario,
   appearance, size, backdrop, OS and SDK, scale, color profile,
   region, binary role, and harness compatibility before comparison.
   An incompatible environment is `BLOCKED`, never a visual
   difference. Before step 5, verify compatibility or stop blocked.

5. **Compare per region.** Compare dimensions first, normalize only
   as recorded, then run the recorded tools and explicit per-region
   changed-pixel budgets. Compare native regions through the
   recorded structural accessibility oracle. Compare content and
   custom regions through their recorded pixel budgets. A zero-diff
   of one window in two binaries is no gate. Before step 6, give
   every row and region one result.

6. **Restore and compare.** Restore every system setting. Read
   revision, executable, baseline identity and digest, and
   repository status again after comparison. Any change refuses the
   verdict. Restore failure is `RECOVERY_REQUIRED`. Before step 7,
   compare settings and identity with the record.

7. **Clean temporary output.** Remove temporary output only when
   its identity and complete contents still match. If not, keep it
   and identify it as recovery.

## Result

The conversation shows one report with bound identities, permission
facts, environment compatibility, every matrix row and region
result, exact tool and budget evidence, changed-pixel counts,
missing and skipped evidence, restoration, repository immutability,
and terminal `PASS`, `FAIL`, `BLOCKED`, `REFUSED`, or
`RECOVERY_REQUIRED`.

`PASS` means no captured rendering changed outside its recorded
oracle. It does not mean the experience is good or approved. Any
design judgment belongs to `tailrocks-macos-visual-qa`. Any baseline
change starts with a new explicit baseline invocation and
re-blessing after a design change.

## Completion checks

Before the report is complete, make sure that each item below is true:

- The skill wrote no project source and no baseline bytes.
- The skill froze no baseline and approved no design.
- Every matrix row has one result or one exact block.
- The report shows no incompatible environment as a visual
  difference.
- The skill restored every system setting. It compared settings
  and identity with the record.
- The report gives missing and skipped evidence.

## References

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the
  trust rules.
- Read `references/harness-contract.md` before any action for the
  harness interfaces and permission proofs.
- Read `references/missing-project-policy.md` before any action
  for the missing-project procedure.
- Read `references/regression.md` in steps 4 and 5 for comparison
  mechanics and meaning.
- Read `references/match-policy.md` in step 5 for the region
  oracle, modes, and budgets.
- Read `references/state-matrix.md` in step 3 for matrix rows
  and capture order.
- Read `references/launch-contract.md` in step 3 for the fixed
  launch arguments.
- Read `references/verification.md` in step 3 for the canonical
  state axes.
- Read `references/interaction.md` when the task needs driving
  or audit guidance.
