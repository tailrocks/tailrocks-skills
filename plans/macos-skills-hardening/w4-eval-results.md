# W4 — Eval results (2026-08-11)

Runner: `bun scripts/run-evals.ts --skill <s> --case <c> --runs 1` (subject +
judge, sonnet, per the repo's eval-runner design). Round 1 ran all 24 cases as
merged; every failure was analyzed, classified, and — where substantive —
traced to a specific SKILL.md prose gap, fixed, and rerun in round 2.
`expected_output` fields were never modified.

## Round 1 (pre-fix baseline)

7 PASS / 17 not passing (14 substantive or stall-shaped failures, 3 infra
crashes where the nested `claude -p` exited 1 with empty stderr:
design-c3, setup-c1, sketch-c4).

## Failure classes → prose fixes (traceability)

| Failed case(s) | Root cause | Fix (file, section) |
|---|---|---|
| design-c1 | Stage-1 gate read as "produce nothing" on a styling request | macos-design SKILL.md Modes: draft-first rule — gates order work, never justify empty output |
| design-c4 | contract fields and weaker-native hard failure not enumerated in router | macos-design SKILL.md Stage 2 (contract field list, weaker-custom = hard failure) + Stage 5 (inline hard-failure list) |
| liquid-glass-c2 | `apply` mode stalled asking for a justification the decision-order walk would establish | liquid-glass SKILL.md Modes: request-is-permission rule |
| liquid-glass-c3 | mechanisms (scroll-edge compositing, per-row render cost) not inline | liquid-glass SKILL.md decision-order step 2 + new per-row mechanics bullet |
| liquid-glass-c4 | cross-platform hallucination list not inline | liquid-glass SKILL.md "Cross-platform spellings" block with correct SwiftUI forms + guard rule |
| swift-best-practices-c3 | bridge rules (typed boundary, idempotent update, callbacks, coordinator lifetime, justification) not inline | swift-best-practices SKILL.md AppKit interop: mandatory bridge-rules list |
| swift-best-practices-c4 | availability guidance allowed stalling on known platform facts; no removal-condition rule | swift-best-practices SKILL.md Before-writing-code: proceed-on-recorded-facts + removal condition |
| setup-c2 | audit checklist areas (signing, derived data, pinned knowledge, both traps) not enumerated | swift-project-setup SKILL.md audit section: minimum gap-report checklist |
| setup-c3 | package-only disqualifier not inline; subject argued the opposite | swift-project-setup SKILL.md step 1: SPM-disqualified-for-apps rationale |
| setup-c4 | /tmp-derived-data and compatibility-key reasons not inline | swift-project-setup SKILL.md "Two standing refusals, with the reasons" |
| visual-qa-c3 | no-project request treated as total decline | visual-qa SKILL.md Modes: policy-vs-execution rule |
| visual-qa-c4 | report did not state session/permission environment | visual-qa SKILL.md Final gate: mandatory environment statement |
| sketch-c1 | package contents present but source-of-truth order not inline | sketch-handoff SKILL.md handoff section: explicit order + precedence sentences |
| sketch-c3 | "Sketch + native prototype pair" not explicit | sketch-handoff SKILL.md intro: the pair that actually works |

## Round 2 (post-fix)

(to be filled from round2-summary)
