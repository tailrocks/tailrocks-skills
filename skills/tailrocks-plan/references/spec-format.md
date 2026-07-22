# Spec Format

How `tailrocks-plan` writes the requirement spec: an OpenSpec-compatible
grammar extended with screen contracts, a must-not registry, and ledger
traceability. The spec is the contract between the roadmap item and the
plans — plans implement requirements, never raw item prose.

The grammar intentionally matches OpenSpec (`### Requirement:` /
`#### Scenario:` heading shapes, SHALL/MUST bodies, delta sections), so
`openspec validate`-style tooling can be pointed at these files later
without rewrites.

## Layout

```
plans/<slug>/spec/
  README.md           ← purpose, capability index, must-not registry,
                        deferrals, change log
  <capability>.md     ← one file per capability, kebab-case
```

Capabilities partition the ledger's `F#`/`S#`/`W#` entries into coherent,
independently specifiable areas. Every ledger ID lands in exactly one
capability file or in the deferral list in `spec/README.md`.

## Capability file

```markdown
# <Capability name>

## Purpose

2–4 sentences: what this capability is and why the item wants it.
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
- **THEN** the empty state from S1's mockup is shown
```

Grammar rules (violations break downstream tooling):

- Requirement heading: `### Requirement: <Name>` — exactly three hashes.
  The body MUST contain SHALL or MUST (RFC 2119). One observable,
  externally verifiable behavior per requirement — no "gracefully", no
  "properly".
- Scenario heading: `#### Scenario: <Name>` — exactly four hashes;
  bullet-form or three-hash scenarios are invisible to parsers. Every
  requirement carries at least one scenario written as a real test case
  with bolded `- **GIVEN**` / `- **WHEN**` / `- **THEN**` / `- **AND**`
  bullets — not a restatement of the requirement.
- Requirement identity is the trimmed heading text, case-sensitive. The
  ledger, plans, and deltas reference requirements by exact heading; never
  rename casually.
- The `Covers:` / `Evidence:` trailers are the house extension: every
  requirement names its ledger IDs and the vetted research chapters that
  justify its shape.

## Screen contracts

For every `S#` the capability owns, after the requirements:

```markdown
## Screen: Session list (S1)

Mockup: roadmap item §Screens/"Session list" — layout intent, not pixel
truth.

- **Regions**: <structural areas, top to bottom>
- **States**: default | empty | loading | error — what each shows; which
  the item draws and which are specified here (marked as such)
- **Interactions**: <element → behavior → requirement it exercises>
- **Navigation**: arrives from <screen/flow>, exits to <screen/flow>
```

Behavior stays in requirements; the screen contract binds structure,
states, and navigation to them. Screen behavior not traceable to a
requirement means a missing requirement, not a longer screen section.

## Must-not registry — in `spec/README.md`

Every `N#`, phrased bindingly:

```markdown
## Must-not registry

| ID | Statement | Reason | Enforced in plans |
|----|-----------|--------|-------------------|
| N1 | The app MUST NOT embed a web renderer for primary UI | item §Must not | 001, 004, 007 |
```

The "Enforced in plans" column fills during plan writing: every plan whose
scope could tempt a violation inlines that must-not verbatim. An `N#` with
an empty column at the final gate is a coverage failure.

## Deferrals — in `spec/README.md`

Ledger IDs consciously not specified: reason + revisit trigger each. A
deferral is a decision; silence is a defect.

## Change log — re-runs only

On a re-run (typically after `tailrocks-decision` marked plans stale),
update capability files in place and record the delta in `spec/README.md`
using OpenSpec delta sections, applied RENAMED → REMOVED → MODIFIED →
ADDED:

```markdown
## Change log

### <YYYY-MM-DD> — decision D7 (Swift UI reversal)

#### MODIFIED Requirements
- `### Requirement: Session list ordering` — now flat, not grouped.
  Plans affected: 004 (STALE).

#### REMOVED Requirements
- `### Requirement: iCloud sync` — **Reason**: cut by D8.
  **Migration**: plan 009 marked REJECTED.
```

MODIFIED means the capability file now holds the full replacement text with
all scenarios; the log records that it changed and which plans went stale.

## Quality gate before slicing

- Every `S#`, `F#`, `W#`, `N#` resolves to a spec location or a logged
  deferral.
- Every requirement: SHALL/MUST body, ≥1 four-hash scenario, `Covers:` and
  `Evidence:` trailers pointing at real IDs and vetted chapters.
- Every screen contract's interactions map to requirement headings that
  exist.
- No requirement contradicts a `D#` decision or an `N#` entry.
