---
name: tailrocks-macos-visual-regression
description: >-
  Use only when the user explicitly requests this skill. Compare current native macOS running-window captures against one approved baseline package with environment, structural-region, and pixel-budget gates. Read-only on project and baseline; never freezes or approves design.
argument-hint: "regress <feature or screens> --baseline <baseline directory>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# macOS Visual Regression

Accept only exact `regress <feature or screens> --baseline <baseline
directory>`. Refuse absent, unknown, duplicate, mixed, `verify`, `harness`,
`baseline`, and `freeze` selectors. There is no deprecated route. Baseline
creation belongs to `tailrocks-macos-visual-baseline`; current-render semantic
judgment belongs to `tailrocks-macos-visual-qa`.

This owner is read-only on repository source and baseline bytes. Candidate
captures and diffs live only in a newly created external temporary directory.
Read [`runtime-trust.md`](references/runtime-trust.md),
[`harness-contract.md`](references/harness-contract.md),
[`missing-project-policy.md`](references/missing-project-policy.md), and
[`regression.md`](references/regression.md), then apply the region oracle in
[`match-policy.md`](references/match-policy.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Compare transaction

1. Bind one canonical repository root/revision, app bundle and real executable,
   baseline directory identity, and `BASELINE.json` digest. Validate the exact
   schema, complete matrix, environment, unique safe relative files, bounds,
   and every declared digest before launch. Refuse symlinks, escapes, duplicate
   rows, missing bytes, unknown entries, or malformed budgets.
2. Require the hardened harness already installed and byte-bound; never install
   it. Require an interactive graphical session and prove the permissions used.
3. Create an external owner-only temporary directory and bind its identity.
   Snapshot the six-key appearance registry. Capture the current running app
   once per exact baseline row through the same fixed launch contract and exact
   PID/window-ID path. Detached snapshots and rectangle captures refuse.
4. Require exact scenario, appearance, size, backdrop, OS/SDK, scale, color
   profile, region, binary role, and harness compatibility before comparison.
   An incompatible environment is `BLOCKED`, never a visual difference.
5. Compare dimensions first, normalize only as recorded, then run the recorded
   tools and explicit per-region changed-pixel budgets. Native regions use the
   recorded structural accessibility oracle; content/custom regions use their
   recorded pixel budgets. A whole-window zero-diff across prototype and real
   app is not a valid gate.
6. Restore and verify every system setting. Re-read revision, executable,
   baseline identity/digest, and repository status after comparison. Any drift
   refuses the verdict; restore failure is `RECOVERY_REQUIRED`.
7. Remove temporary output only when its identity and complete contents still
   match; otherwise retain and name it as recovery. Never write a report file.

## Report

Return one conversation report with bound identities, permission facts,
environment compatibility, every matrix row and region result, exact tool and
budget evidence, changed-pixel counts, missing/skipped evidence, restoration,
repository immutability, and terminal `PASS`, `FAIL`, `BLOCKED`, `REFUSED`, or
`RECOVERY_REQUIRED`.

`PASS` means no captured rendering changed outside its recorded oracle. It does
not mean the experience is good or approved. Any design judgment routes to
`tailrocks-macos-visual-qa`; any baseline change requires a new explicit
baseline invocation and applicable re-blessing.
