# Spec Format

How the `tailrocks-blueprint` skill writes the requirement spec: an
OpenSpec-compatible requirement grammar, extended with screen contracts, a
must-not registry, and ledger traceability. The spec is the contract between
the concept and the plans — plans implement requirements, never raw concept
prose.

The requirement and scenario grammar below intentionally matches OpenSpec
(`### Requirement:` / `#### Scenario:` heading shapes, SHALL/MUST bodies, delta
sections), so `openspec validate`-style tooling can be pointed at these files
later without rewrites.

## Layout

```
blueprints/<slug>/spec/
  README.md           ← purpose, capability index, must-not registry, change log
  <capability>.md     ← one file per capability, kebab-case
```

Capabilities partition the concept's `F#`/`S#`/`W#` entries into coherent,
independently specifiable areas (e.g. `session-management.md`,
`onboarding.md`). Every ledger ID lands in exactly one capability file or in
the deferral list in `spec/README.md`.

## Capability file

```markdown
# <Capability name>

## Purpose

2–4 sentences: what this capability is and why the concept wants it.
Anchors: <ledger IDs> · Evidence: <research chapters>

## Requirements

### Requirement: Session list ordering
The app SHALL list sessions newest-first, grouped by project.
Covers: F3, S1 · Evidence: research/02-target-codebase.md

#### Scenario: Two projects with sessions
- **GIVEN** sessions exist in two projects
- **WHEN** the list screen loads
- **THEN** sessions appear grouped by project, newest-first within each group

#### Scenario: No sessions yet
- **WHEN** the list screen loads with zero sessions
- **THEN** the empty state from S1's mockup is shown
```

Grammar rules (validator-compatible; violations break downstream tooling):

- Requirement heading: `### Requirement: <Name>` — exactly three hashes. The
  body MUST contain SHALL or MUST (RFC 2119: MUST/SHALL binding, SHOULD strong
  recommendation, MAY optional). One observable, externally verifiable behavior
  per requirement — no "gracefully", no "properly".
- Scenario heading: `#### Scenario: <Name>` — exactly four hashes; bullet-form
  or three-hash scenarios are invisible to parsers. Every requirement carries
  at least one scenario, written as a real test case with bolded
  `- **GIVEN**` / `- **WHEN**` / `- **THEN**` / `- **AND**` bullets — not a
  restatement of the requirement.
- Requirement identity is the trimmed heading text, case-sensitive. Plans, the
  ledger, and deltas reference requirements by exact heading; never rename
  casually.
- The `Covers:` / `Evidence:` trailer lines are the blueprint extension: every
  requirement names its ledger IDs and the vetted research chapter(s) that
  justify its shape.

## Screen contracts

For every `S#` the capability owns, after the requirements:

```markdown
## Screen: Session list (S1)

Mockup: concept §"Main window" — layout intent, not pixel truth.

- **Regions**: <the structural areas the mockup shows, top to bottom>
- **States**: default | empty | loading | error — what each shows; which are
  drawn in the concept and which are specified here (marked as such)
- **Interactions**: <element → behavior → requirement it exercises>
- **Navigation**: arrives from <screen/flow>, exits to <screen/flow>
```

Behavior stays in requirements; the screen contract binds structure, states,
and navigation to them. A screen with behavior not traceable to a requirement
means a missing requirement, not a longer screen section.

## Must-not registry — in `spec/README.md`

Every `N#` from the ledger, phrased as a binding statement:

```markdown
## Must-not registry

| ID | Statement | Reason | Enforced in plans |
|----|-----------|--------|-------------------|
| N1 | The app MUST NOT embed a web renderer for primary UI | concept §"Native" | 001, 004, 007 |
```

The "Enforced in plans" column is filled during planning: every plan whose
scope could tempt a violation inlines that must-not verbatim in its guardrails
section. An `N#` with an empty column at the final gate is a coverage failure.

## Deferrals — in `spec/README.md`

Ledger IDs consciously not specified, each with its reason and its trigger for
revisiting. A deferral is a decision; silence is a defect.

## Change log — re-runs only

When a re-run alters the spec, update the capability files in place and record
the delta in `spec/README.md` using OpenSpec delta section names, applied in
order RENAMED → REMOVED → MODIFIED → ADDED:

```markdown
## Change log

### <YYYY-MM-DD> — concept revised

#### MODIFIED Requirements
- `### Requirement: Session list ordering` — now flat, not grouped.
  Plans affected: 004 (marked stale).

#### REMOVED Requirements
- `### Requirement: iCloud sync` — **Reason**: cut from concept.
  **Migration**: plan 009 marked REJECTED.
```

MODIFIED entries mean the capability file now holds the full replacement text
with all scenarios; the log records that it changed and which plans went stale.

## Quality gate before planning

- Every `S#`, `F#`, `W#`, `N#` resolves to a spec location or a logged
  deferral.
- Every requirement: SHALL/MUST body, ≥1 four-hash scenario, `Covers:` and
  `Evidence:` trailers pointing at real IDs and vetted chapters.
- Every screen contract's interactions map to requirement headings that exist.
- The must-not registry is complete; enforcement columns may still be empty
  (planning fills them).
