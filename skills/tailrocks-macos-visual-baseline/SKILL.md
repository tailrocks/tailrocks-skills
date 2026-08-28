---
name: tailrocks-macos-visual-baseline
description: >-
  Use only when the user explicitly requests this skill. Freeze or explicitly re-freeze one blessed native macOS prototype into a reproducible full-matrix baseline package. Never judges production, compares candidates, installs harnesses, or blesses designs.
argument-hint: "baseline <blessed prototype package> --output <baseline directory>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# macOS Visual Baseline

Accept only exact `baseline <blessed prototype package> --output <baseline
directory>`. Refuse absent, unknown, duplicate, mixed, `verify`, `harness`,
`freeze`, and `regress` selectors. This owner alone freezes a macOS visual
baseline. It does not judge production, compare a candidate, install a harness,
or bless a design.

Read [`runtime-trust.md`](references/runtime-trust.md),
[`harness-contract.md`](references/harness-contract.md), and
[`missing-project-policy.md`](references/missing-project-policy.md), then apply
the region oracle in [`match-policy.md`](references/match-policy.md).

## Authority and preconditions

- Baseline authorization permits only the named baseline directory and its
  transaction-owned sibling stage/recovery paths. It grants no production,
  prototype, harness, approval, commit, or system-setting authority beyond the
  temporary restored state transaction.
- Require canonical repository root and revision, one real prototype package,
  exact executable identity, `Regions.md`, and `SIGNOFF.md` binding a separate
  acceptance-review PASS plus the user's date/revision/scenario/appearance/size
  sign-off. Missing, malformed, incomplete, or revision-mismatched blessing is
  `BLOCKED`; an agent never repairs or supplies it.
- Require the hardened harness already installed and byte-bound. A missing or
  mismatched harness blocks and prints its exact installer command; never infer
  installation permission.
- Require the graphical session and permission proofs named by the harness
  contract. Snapshot the six-key appearance registry before mutation.
- An absent output is an initial freeze. An existing output requires the user's
  explicit re-freeze request, a new blessing after the old baseline record, and
  an exact preimage digest. Otherwise refuse without mutation.

## Freeze transaction

1. Derive the complete matrix from the blessing and
   [`state-matrix.md`](references/state-matrix.md). Every signed-off scenario,
   appearance, size, backdrop, accessibility axis, and region is mandatory.
2. Create one same-parent stage directory exclusively. Bound its directory
   identity and an exact allowlist before capture. Refuse symlinks, path escape,
   nested unknown entries, unbounded files, and parent or revision drift.
3. Drive the blessed prototype through the fixed `--tr-*` launch contract.
   Capture each running window by exact PID/window ID. Capture twice per row and
   require deterministic dimensions and bytes before accepting the frame.
4. Write only allowlisted PNGs, capture sidecars, and `BASELINE.json`. The record
   binds repository/prototype/blessing revisions and digests; binary/version;
   scenario/appearance/size/backdrop; OS build, SDK, scale, color profile;
   region class and pixel budget; every file digest; harness source digest;
   producing user; and UTC time. Read
   [`baseline-metadata.md`](references/baseline-metadata.md).
   Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.
5. Restore and verify all system settings before publication. Restoration
   failure is `RECOVERY_REQUIRED`; no baseline publishes.
6. Re-snapshot the stage, blessing, revision, parent identity, and expected
   destination preimage. Publish the complete directory with an OS atomic
   no-replace swap. Re-freeze first moves the exact old directory to an
   exclusive recovery sibling; any failed final proof restores only on exact
   identities, otherwise preserves recovery and stops.
7. Re-read the published package and prove its identity, allowlist, digests,
   matrix completeness, and record. Remove an owned old directory only by
   atomic quarantine followed by identity/content revalidation.

## Receipt

Return one receipt naming the bound revisions, blessing digest, output,
preimage/new package digests, matrix/frame counts, setting restoration,
mutations, recovery artifacts, and terminal `FROZEN`, `BLOCKED`, `REFUSED`, or
`RECOVERY_REQUIRED`. `FROZEN` requires the complete blessed matrix and final
published-byte proof. Never describe a partial package as frozen.
