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

## Rounds 2–5 (post-fix)

- Round 2 (17 reruns): 12 PASS. New near-misses fixed: layer-mechanism
  sentence (liquid-glass c3), capsule-vs-concentric rule (c2), bare-link
  handoff answer (sketch c1); two infra crashes (`claude exited 1`).
- Round 3 (5 reruns): liquid-glass c2, c3, sketch c1, swift-best-practices c3
  PASS. swift-project-setup c1 kept failing on truncation: the runner's
  $0.75 subject budget cuts a full scaffold short (`scripts/` is outside
  this effort's allowed edit paths, so the budget could not be raised).
  Fixes that made the case complete within budget, all real skill
  improvements: verified-baseline versions inline (no stale placeholders —
  also mandated by the maintainer's latest-versions directive), CI-parity
  statement front-loaded, and a smallest-files-first scaffold order so an
  interrupted scaffold still leaves a coherent baseline. PASS.
- Provenance reruns on the final merged routers (after the parallel
  session's 86fad2e/c8fab9d/19a4391 landed): macos-design c4 initially
  regressed — the grown router diluted the contract-enumeration demand —
  fixed by requiring the enumeration at the rejection site itself; c4 and c1
  then PASS on the final state. Liquid-glass, visual-qa, sketch-handoff, and
  the remaining setup/best-practices rows were already verified against
  their current SKILL.md contents (the parallel session's later commits
  touched references only, which the eval subject never receives).

## Final tally

**24 / 24 PASS.** Eval concurrency note: nested `claude -p` runs from two
sessions sharing the account made long cases crash-prone; the final runs were
sequenced solo by agreement with the parallel session.

## Addendum (post-close, same day)

The parallel session's router-compression experiment surfaced one recorded
FAIL of liquid-glass case 3 on a file identical, in every line the case
depends on, to the state behind the round-3 green — i.e. the case was flaky,
not regressed. Root cause: the compositing-mechanism requirement sat as the
third idea of a four-idea paragraph in Layer discipline, with no structural
cue. Fixed by promoting rule / mechanism / exception into named bullets
(no wording changed); glass-3 then passed twice consecutively on the
restructured router. Parallel session's four macos-design verdicts against
its compressed router (359de41): cases 1–4 all PASS.

## Addendum 2 — router growth at 71554af

`feat(macos-design): add app archetypes, evidence classes, and score caps`
(71554af, squashed into main as 64df333) grew the `tailrocks-macos-design`
router from 220 to 228 lines by strengthening Stage 1 with archetype selection.

Per the router budget rule in `AGENTS.md`, a router change is a change to every
behavior in that file, so all four cases were rerun rather than only the one
related to the edit. The run was still in flight when PR #7 was merged, and the
merge commit records it as a known open item.

Verdicts, against the merged state:

| Case | Result |
|---|---|
| 1 | PASS |
| 2 | PASS |
| 3 | PASS |
| 4 | PASS |

No regression. The open item noted in 64df333 is closed; no follow-up fix was
required.
