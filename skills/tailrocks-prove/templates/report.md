# Verification round <NN>

- **Item**: roadmap/<slug>/README.md
- **Branch**: <branch> · **Built from**: `<short SHA>`
- **Run**: <YYYY-MM-DD>
- **Answers**: `verification/<NN>-feedback.md` (or "no feedback round — run on request")
- **Environment**: <data directory or configuration used> · <platform and version>

## Reported statements

| ID | Reported | Verdict | Evidence |
|----|----------|---------|----------|
| U1 | <the user's claim, one line> | CONFIRMED \| REFUTED \| WIDER | <defect id, or the line that decided it> |

## Blocking defects

### B1 — <one sentence: what a user cannot do>

- **Command**: `<exactly what ran>`
- **Exit**: <status> · **Duration**: <when it matters>
- **Decisive line**: `<the quoted output line that decided it>`
- **Artifact**: <capture path or written file, or "none">
- **Cause**: <file:line and the mechanism, when the evidence locates it>
- **Instead of**: <what the item says this surface does>

## Decision compliance

Every recorded decision against what shipped. A `VIOLATED` row is blocking.

| Decision | Verdict | Evidence |
|----------|---------|----------|
| <date — the decision, one line> | HELD \| VIOLATED \| NOT VERIFIABLE | <command output or file:line; for NOT VERIFIABLE, what would settle it> |

## Contract drift

It runs, and it is not what was blessed or specified.

- **<surface>** — <what shipped> against <what the reference carries>,
  reference `<path>`, blessed <date>. <Present-and-wrong, or
  present-in-reference-and-absent.>
- **Decisions snapshot** — <when `plan/spec/decisions.md` differs from the
  item's live `## Decisions`: the package predates a recorded decision; this
  round verified against the live section. Omit this line when they match.>

## Proof defects

Done criteria and gates that certified a row without exercising it.

| Criterion or gate | Verdict | Decisive line |
|---|---|---|
| `<command>` | VACUOUS | `<the zero-count or resolution-error line>` |

## What holds up

Named explicitly — these are what the next round must not break.

- <the thing, and the evidence that it works>

## Recommended order

1. <the first thing, and what it unblocks>
2. <…>

State gating relationships: an item whose fix is a precondition for others goes
first even when one of the others is more severe.

## Not executed

| Surface | Obstacle | Claims left unproven |
|---|---|---|
| <surface> | <no device, no credential, no environment> | <what nobody knows yet> |

## Machine evidence

Exact stdout bundle from `prove-driver assemble`; do not reformat or truncate
it. The bundle contains mechanical execution facts, not semantic verdicts.

```json
<tailrocks.prove-evidence-bundle/v1 JSON>
```
