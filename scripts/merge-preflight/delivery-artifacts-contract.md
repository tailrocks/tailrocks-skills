# Delivery-artifact machine contract

The predicate activates only when the merge-base-to-head diff touches exact
`roadmap/` paths. It reads regular blobs from the exact merge-base and head
trees; renames are represented as delete plus add. Missing or malformed shapes
never become a vacuous pass.

Recognized shapes:

- `roadmap/<slug>/README.md`: exact status header and `## Remaining` section.
- `roadmap/<slug>/plan/README.md`: at least one parsed status row before an
  all-terminal or all-DONE claim. Terminal means `DONE` or `REJECTED (...)`.
- `roadmap/<slug>/verification/NN-report.md`: numerically newest zero-padded
  round and exact `## Blocking defects` section with boundary-form `B#` IDs.
- `roadmap/README.md`: exact item links to `<slug>/README.md`.
- `delivery/<slug>.md`: must be added by the retirement diff, not merely exist
  from unrelated history.

Every contradiction blocks and includes disagreeing paths plus its fixer route:

1. A finished item remains present → `tailrocks-reconcile`.
2. A deleted item still has Remaining work or blocking defects →
   `tailrocks-prove` or `tailrocks-reconcile` according to present evidence.
3. Every plan row says DONE while the newest round has blockers →
   `tailrocks-reconcile`.
4. Status DONE has no verification round → `tailrocks-prove`.
5. Index and recognized item folders disagree in either direction, or an empty
   board index survives → `tailrocks-reconcile`.
6. A deleted recognized item has no diff-added delivery report →
   `tailrocks-reconcile`.

The implementation and focused fixtures in this directory are the executable
authority. This document names their stable input/output contract; it carries
no waiver, editing, deletion, commit, push, or merge authority.
