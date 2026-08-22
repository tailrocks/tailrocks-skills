# Skill audit: tailrocks-swift-best-practices

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Verdict: RTR 2, EVAL 3, WIRE 1
- Topology: SPLIT write/review/refactor and extract Rust-core platform boundary

## Description

None.

## Router

### RTR-1 — Write, review, and refactor cross authority/oracle boundaries

- **Defect:** Review is read-only; write changes behavior; refactor preserves behavior.
- **Evidence:** skills/tailrocks-swift-best-practices/SKILL.md:31-35.
- **Fix:** keep best-practices for writing; create swift-review and swift-refactor.
- **Dimensions:** contract, predictability, topology.
- **Identity tuple:** router; separate authority/oracle; write-review-refactor; Swift code policy; Modes.
- **Action:** refactor.
- **Acceptance:** each resulting skill owns one observable code outcome.

### RTR-2 — Router duplicates depth and carries a separate Rust/platform architecture

- **Defect:** Concurrency, AppKit, accessibility, and Rust-core rules are summarized in the router; Rust-core/Apple effect architecture is independently invokable and far larger than Swift code style.
- **Evidence:** skills/tailrocks-swift-best-practices/SKILL.md:56-148; skills/tailrocks-swift-best-practices/references/concurrency.md:7-51; skills/tailrocks-swift-best-practices/references/rust-core-boundary.md:147-173.
- **Fix:** reduce the Swift router to branch pointers and one load-bearing rule; move Rust-core/platform-shell architecture to one focused boundary skill.
- **Dimensions:** efficiency, predictability, topology.
- **Identity tuple:** router; depth belongs in references and one responsibility; duplicated summaries plus FFI/platform architecture; Swift policy; Concurrency through Rust core boundary.
- **Action:** refactor.
- **Acceptance:** router no longer restates references; Rust-core requests route exclusively without loading unrelated Swift review rules.

## References

None.

## Evals

### EVAL-1 — Refactor and iOS scope lack normal evidence

- **Defect:** No refactor case exists and the expanded iOS scope has no iOS fixture.
- **Evidence:** skills/tailrocks-swift-best-practices/SKILL.md:4,12 and skills/tailrocks-swift-best-practices/evals/evals.json:4-47.
- **Fix:** add per-owner Swift/macOS/iOS fixtures after split.
- **Dimensions:** behavior, portability, predictability.
- **Identity tuple:** evals; exposed scope coverage; refactor/iOS missing; Swift practices; eval set.
- **Action:** update.
- **Acceptance:** iOS and preservation cases have platform-valid observable oracles.

### EVAL-2 — Eval set is stale after macOS+iOS scope change

- **Defect:** Router scope changed after the eval corpus.
- **Evidence:** skills/tailrocks-swift-best-practices/SKILL.md changed at 47d7247 (2026-08-22); skills/tailrocks-swift-best-practices/evals/evals.json last changed at a8f7707 (2026-08-16).
- **Fix:** refresh every case during migration.
- **Dimensions:** behavior, portability.
- **Identity tuple:** evals; changed scope regression; stale platform set; Swift practices; file history.
- **Action:** update.
- **Acceptance:** eval source is current and covers both supported platforms.

### EVAL-3 — Reliability is unmeasured

- **Defect:** No persisted control, repetitions, mutation result, runtime lock, or trace exists.
- **Evidence:** skills/tailrocks-swift-best-practices/evals/evals.json; mise.toml:51-53.
- **Fix:** evaluate each new owner under the pinned macOS-capable suite.
- **Dimensions:** behavior, predictability, portability.
- **Identity tuple:** evals; repeated evidence; absent results; Swift practices; eval infrastructure.
- **Action:** validator.
- **Acceptance:** control and non-certifying 3/3 smoke candidate results include exact SDK/model/tool pins.

## Wiring

### WIRE-1 — Mode-taking skill lacks argument-hint

- **Defect:** Frontmatter omits public selector syntax.
- **Evidence:** skills/tailrocks-swift-best-practices/SKILL.md:1-8.
- **Fix:** add hints and enforce them.
- **Dimensions:** contract, portability.
- **Identity tuple:** wiring; invocation metadata; missing hint; Swift practices; frontmatter.
- **Action:** validator.
- **Acceptance:** each resulting skill has complete client metadata.

## Overlap

None.

## Evidence states

| Dimension | State | Evidence / missing proof |
|---|---|---|
| Contract coherence | MEASURED | Router, references, outputs, and failure branches inspected statically. |
| Repeated-output variance | NOT MEASURED | No persisted repeated behavioral results. |
| Loaded context | NOT MEASURED | No runtime context-load trace; file sizes alone do not prove loaded context. |
| Tool use | NOT MEASURED | No persisted machine-readable tool-event trace. |
| Security | MEASURED | Authority, mutation, retry, recovery, trust, and secret rules inspected statically; this does not claim behavioral compliance. |
| Portability | MEASURED | Shared content and client metadata inspected across repository wiring. |
| Eval freshness | MEASURED | Current router contract was compared with the current case set and fixtures; behavioral execution remains absent. |
| Split/merge topology | MEASURED | Triggers, outputs/oracles, authority, side effects, and independent failures were compared. |

## Killed findings

- Split each Swift topic — killed: branch-loaded code rules share one write/review oracle after authority split.
