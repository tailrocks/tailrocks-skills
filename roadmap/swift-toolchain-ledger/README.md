# Give the Swift toolchain versions an owner and a gate

- **Status**: DRAFT
- **Slug**: swift-toolchain-ledger
- **Created**: 2026-08-21 · **Updated**: 2026-08-21
- **Plan**: — (plans/swift-toolchain-ledger/ once planned)

## Intent

`skills/tailrocks-swift-project-setup/references/toolchain.md` carries a
three-row version table in prose — macOS, Xcode, Swift — with no source
URL, no verification date, and no gate reading it. It is the last
undated, ungated version ledger in the tree, and it is already wrong:

| Document | Says latest shipping macOS is |
|---|---|
| `tailrocks-swift-project-setup/references/toolchain.md` | 26.6.1 "Tahoe" |
| `tailrocks-liquid-glass/references/platform-baseline.md` | 26.6.2 "Tahoe", `gdmf.apple.com/v2/pmv`, verified 2026-08-21 |

Two skills in one repository disagree about the current macOS version
today. The liquid-glass baseline was refreshed and the Swift toolchain
document was not, which is the same split-refresh failure the Rust
policy had: the half with a reader stayed current, the half without one
drifted and kept reading as fact.

## Vocabulary

- **Pin** — a version an artifact commits to, which some tool reads.
- **Baseline stamp** — a version plus its source and the date it was
  checked. Stays honest as the world moves, because it claims only what
  was true when verified.
- **Ledger** — a version with neither. Cannot be verified or refuted by
  anything, so it rots silently.

## Decisions

## Capabilities

- Decide, per row, which of the two honest forms it takes: a **pin** in
  an artifact a gate reads, or a **baseline stamp** carrying its source
  and verification date.
- macOS already has an owner — `tailrocks-liquid-glass`'s
  `platform-baseline.md`, sourced from `gdmf.apple.com/v2/pmv` and aged
  by `scripts/check-baseline-age.ts`. The Swift document should cite it
  rather than restate it.
- Xcode and Swift have no owner yet. Either they get a stamped baseline
  with a source of truth, or the document stops naming versions and
  points at the toolchain file that pins them.

## Screens

## Flows

## Data & integrations

- `skills/tailrocks-swift-project-setup/references/toolchain.md:17-19` —
  the ledger.
- `skills/tailrocks-liquid-glass/references/platform-baseline.md:28` —
  the gated macOS baseline it contradicts.
- `scripts/check-baseline-age.ts` — the existing age gate, already run by
  `validate.yml`.
- `scripts/refresh-template-pins.ts --check-consistency` — rejects a
  version in a policy table for the Rust and TanStack skills; the same
  check has no Swift equivalent because there is no artifact to compare
  against yet.

## References

- `roadmap/template-pin-drift-gate/README.md` — the same class for npm
  pins, DONE. Its three decisions apply here and should be inherited
  rather than re-derived: weekly cadence, human-reviewed bump, and the
  refresh never writes into a policy document.

## Research

## Must not

- MUST NOT guess Apple version numbers to make the two documents agree.
  The macOS row is provably stale against the repository's own gated
  source; Xcode and Swift are not verified here and need a real check
  before anything is written.
- MUST NOT solve it by copying the liquid-glass numbers into the Swift
  document. That creates a second copy of a gated value, which is the
  defect, not the fix.

## Quality bar

- No version in this repository is stated without either a gate that
  reads it or a source and date that let a reader check it.

## Open questions

- Do Xcode and Swift have a machine-readable source of truth comparable
  to `gdmf.apple.com/v2/pmv`, or is a dated manual stamp the honest
  ceiling for them?
- Should the Swift skill pin a toolchain in an artifact at all — the way
  the Rust skill pins `rust-toolchain.toml` — or is Xcode selection
  genuinely the developer's, making a stamp the right form?

## Open research questions

## Deferred

## Log

- 2026-08-21 — captured while gating the Rust and TanStack policy
  documents; found by scanning every skill for version-shaped table rows.
  Two other tables were checked and are **not** this defect:
  `tailrocks-plan/references/goal-handoff.md` records client versions
  with verification dates as evidence of what was tested, and
  `tailrocks-liquid-glass/references/platform-baseline.md` carries its
  source and date and is aged by a gate. Both are stamps, not ledgers.
