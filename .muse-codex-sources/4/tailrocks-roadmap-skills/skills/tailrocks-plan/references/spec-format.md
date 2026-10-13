# Spec format

This reference tells `tailrocks-plan` how to write the
requirement spec: an OpenSpec-compatible grammar extended with
screen contracts, a must-not registry, and ledger
traceability. The spec is the contract between the roadmap item
and the plans. Plans implement requirements, never raw item
prose.

The grammar uses OpenSpec-compatible `### Requirement:` and
`#### Scenario:` heading shapes with SHALL and MUST bodies, so
structural tooling validates it without preserving obsolete
deltas.

## Layout

```text
roadmap/<slug>/plan/spec/
  README.md           <- purpose, capability index, must-not registry,
                        entry-point registry, deferrals
  <capability>.md     <- one file per capability, kebab-case
  decisions.md        <- the Decisions of the item, snapshotted verbatim
```

Capabilities partition the `F#`, `S#`, and `W#` entries of the
ledger into coherent, independently specifiable areas. Every
ledger ID lands in exactly one capability file or in the
deferral list in `spec/README.md`.

## Decisions snapshot — `decisions.md`

The `## Decisions` section of the item is writable, because
`tailrocks-record-decision` appends to it, so it cannot sit
inside the frozen fingerprint directly. The snapshot still
turns a decision into unfalsifiable contract ground. At
planning time, copy the section **body** into `decisions.md`.
Copy every line between the `## Decisions` heading and the
next `##` heading. Copy verbatim, then strip every blank
line.
(`check.sh` compares blank-stripped content, so store the file
pre-stripped. An empty section snapshots as an empty file.)

From then on `check.sh` answers `BLOCKED decisions-drift`
whenever the live section differs from the snapshot. A silent
edit by any hand, agent or human, trips the gate. A legitimate
decision change travels `tailrocks-record-decision` to
affected rows `STALE` to `tailrocks-plan` re-run to snapshot
re-stamped, in that order. The re-run refreshes `decisions.md`
from the live section after the refreshed spec is final, never
before. Plans and verification rounds treat the snapshot as
the decision ground truth that the package was built against.
The live section of the item is the latest word of the user.
A difference between them is itself a finding: the package
predates a recorded decision. Report it. Never reconcile it by
hand.

## Capability file

```markdown
# <Capability name>

## Purpose

2–4 sentences: the identity and reason of this capability.
Anchors: <ledger IDs> · Evidence: <research/<topic>/NN-*.md>

## Requirements

### Requirement: Session list ordering
The app SHALL list sessions newest-first, grouped by project.
Covers: F3, S1 · Evidence: research/cli-ipc-surfaces/02-session-store.md

#### Scenario: Two projects with sessions
- **GIVEN** sessions exist in two projects
- **WHEN** the list screen loads
- **THEN** sessions appear grouped by project, newest-first within each group

#### Scenario: No sessions yet
- **WHEN** the list screen loads with zero sessions
- **THEN** the empty state from the mockup of S1 shows
```

Grammar rules (violations break downstream tooling):

- Requirement heading: `### Requirement: <Name>`, exactly
  three hashes. The body MUST hold SHALL or MUST (RFC 2119).
  One observable, externally verifiable behavior per
  requirement. No "gracefully", no "properly".
- Scenario heading: `#### Scenario: <Name>`, exactly four
  hashes. Bullet-form or three-hash scenarios stay invisible
  to parsers. Every requirement carries at least one scenario
  written as a real test case. Use bolded `- **GIVEN**`,
  `- **WHEN**`, `- **THEN**`, and `- **AND**` bullets. Never
  write a restatement of the requirement.
- Requirement identity is the trimmed heading text,
  case-sensitive. The ledger, plans, and deltas reference
  requirements by exact heading. Never rename casually.
- The `Covers:` and `Evidence:` trailers are the house
  extension. Every requirement names its ledger IDs and the
  vetted research chapters that justify its shape.

## Screen contracts

For every `S#` that the capability owns, after the
requirements:

```markdown
## Screen: Session list (S1)

Mockup: roadmap item §Screens/"Session list" — layout intent, not pixel
truth.
Reference: <the blessed design reference of the screen by path.
Required for a screen with a visual surface. The only substitute
is the recorded deferral of the user, cited here as
`deferred <date> — <reason>`.>

- **Regions**: <structural areas, top to bottom>
- **States**: default | empty | loading | error — the content of each, and
  the drawn or specified source of each (marked as such)
- **Interactions**: <element → behavior → exercised requirement>
- **Navigation**: arrives from <screen/flow>, exits to <screen/flow>
```

**The Reference line is a gate, not a field.** The design
stage runs between READY and planning. `tailrocks-tui-design`
covers a terminal screen. `tailrocks-web-design` covers a web
screen. `tailrocks-macos-design` covers a macOS window:
design, then the running prototype. A screen with a visual
surface
and neither a blessed reference nor a recorded deferral stops
planning. Name the screens, name the skill, and hand the
decision back. Planning around it converts pixel questions
into implementer guesses, and the implementer resolves them
alone and late.

Behavior stays in requirements. The screen contract binds
structure, states, and navigation to them. Screen behavior
untraceable to a requirement means a missing requirement, not
a longer screen section.

## Must-not registry — in `spec/README.md`

Every `N#`, phrased bindingly:

```markdown
## Must-not registry

| ID | Statement | Reason | Enforced in plans |
|----|-----------|--------|-------------------|
| N1 | The app MUST NOT embed a web renderer | item §Must not | 001, 004 |
```

This registry is the sole must-not registry. The orchestrator
fills "Enforced in plans" during plan writing: every plan
whose scope tempts a violation inlines that must-not verbatim.
An `N#` with an empty column at the final gate is a coverage
failure.

## Entry-point registry — in `spec/README.md`

Every surface that a user or a different system invokes from
outside counts. Examples: a binary, a subcommand, a window, a
route, an RPC method, a scheduled job. One `E#` each, carried
from the ledger.

```markdown
## Entry-point registry

| ID | Entry point | Kind | Created by plan | End-to-end test |
|----|-------------|------|-----------------|-----------------|
| E1 | `app run` | CLI subcommand | 003 | cli_run.rs::clean_checkout |
```

**The test column names a test that invokes the surface the
way its user does.** It spawns the binary, opens the window,
or issues the request, and asserts the first useful output.
Unit coverage of the code behind the surface never fills that
column. In one delivery 2,232 unit tests passed, but three
entry points panicked at startup, because no test ever started
the program.

The orchestrator fills "Created by plan" and "End-to-end test"
during plan writing, from the plan that owns the surface. An
`E#` with either column empty at the final gate is a coverage
failure, exactly like an unenforced `N#`. An entry point
discovered during slicing gets a new ID here and in the
ledger, in the same edit.

## Deferrals — in `spec/README.md`

Ledger IDs consciously not specified: reason plus revisit
trigger each. A deferral is a decision. Silence is a defect.

## Quality gate before slicing

- Every `S#`, `F#`, `W#`, `N#`, `E#`, and `B#` resolves to a
  spec location or a logged deferral.
- Every `E#` names the plan that creates the surface and the
  test that invokes it end to end.
- Every requirement holds a SHALL or MUST body. It holds at
  least one four-hash scenario. It holds `Covers:` and
  `Evidence:` trailers that point at real IDs and vetted
  chapters.
- The interactions of every screen contract map to
  requirement headings that exist.
- No requirement contradicts a `D#` decision or an `N#` entry.
- `decisions.md` holds the current Decisions body of the
  item, blank-stripped, written fresh at every planning run,
  never carried over from a previous package.
