# Plan 004 eval run record

Run 2026-08-11 on `advisor/execute-audit-plans`, one run per case. The two
refusal spot runs are included. All 37 cases completed without infrastructure
errors. Failed-run workspaces were retained by `scripts/run-evals.ts`.

| Skill | Case | Result | Judge note / owner |
|---|---:|---|---|
| macos-design | 1 | PASS | Brief, map, alternatives, selection gate |
| macos-design | 2 | PASS | Refused score without rendered states |
| macos-design | 3 | PASS | Enforced Stage-4 decision record |
| macos-design | 4 | PASS | Rejected unjustified custom control |
| macos-design | 5 | FAIL | Extract mode procedure absent — 008 |
| macos-design | 6 | PASS | Final gate and Preserve list |
| liquid-glass | 1 | FAIL | Missed second tint and availability check — 005 |
| liquid-glass | 2 | PASS | Decision order and custom surface contract |
| liquid-glass | 3 | PASS | Refused content-layer row glass |
| liquid-glass | 4 | PASS | Rejected three unavailable/wrong APIs |
| liquid-glass | 5 | PASS | Deleted custom background first |
| liquid-glass | 6 | PASS | Refused unapproved remediation |
| liquid-glass | 7 | PASS | Required `safeAreaBar(edge:)` |
| swift-best-practices | 1 | PASS | Found identity and body-work defects |
| swift-best-practices | 2 | FAIL | Did not ask for isolation category — 010 |
| swift-best-practices | 3 | PASS | Narrow coordinator boundary |
| swift-best-practices | 4 | PASS | Availability fallback gate |
| swift-best-practices | 5 | FAIL | Missed required accessibility value/role detail — 010 |
| swift-best-practices | 6 | FAIL | Missed cancellation-path test — 010 |
| swift-project-setup | 1 | PASS | Scaffold artifacts satisfied baseline |
| swift-project-setup | 2 | PASS | Fixture-backed audit found seeded gaps |
| swift-project-setup | 3 | PASS | Rejected package-only app |
| swift-project-setup | 4 | FAIL | Compatibility-key nuance wrong — 009 |
| swift-project-setup | 5 | PASS | Refused unapproved remediation |
| swift-project-setup | 6 | PASS | Enforced mise/CI task parity |
| macos-visual-qa | 1 | PASS | Honest refusal without runnable app |
| macos-visual-qa | 2 | PASS | State/restore procedure |
| macos-visual-qa | 3 | FAIL | Omitted detached-glass transparency mechanism — 007 |
| macos-visual-qa | 4 | PASS | Required all three permissions |
| macos-visual-qa | 5 | PASS | Reported failed restore |
| macos-visual-qa | 6 | PASS | Harness prerequisite and final gate |
| sketch-handoff | 1 | PASS | Refused bare-link implementation |
| sketch-handoff | 2 | PASS | Refused material token extraction |
| sketch-handoff | 3 | PASS | Rejected HTML handoff source |
| sketch-handoff | 4 | PASS | Honest refusal without Sketch input |
| sketch-handoff | 5 | FAIL | Missed forbidden-column omission — 011 |
| sketch-handoff | 6 | FAIL | Incomplete final-gate enumeration — 011 |

Summary: **28/37 PASS**. These failures are intentional regression evidence;
plans 005–011 own the corresponding router/reference corrections.
