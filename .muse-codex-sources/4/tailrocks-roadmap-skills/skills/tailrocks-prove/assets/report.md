# Verification round `<NN>`

- **Item**: `roadmap/<slug>/README.md`
- **Branch**: `<branch>` · **Built from**: `<short SHA>`
- **Run**: `<YYYY-MM-DD>`
- **Answers**: `verification/<NN>-feedback.md` (or "no
  feedback round — run on request")
- **Environment**: `<data or config>` · `<platform>`

## Reported statements

| ID | Reported | Verdict | Evidence |
| --- | --- | --- | --- |
| U1 | `<claim, one line>` | `<verdict>` | `<defect or line>` |

Verdict is CONFIRMED, REFUTED, or WIDER.

## Blocking defects

### B1 — `<one sentence: the blocked user act>`

- **Command**: `<the exact run>`
- **Exit**: `<status>` · **Duration**: `<when it matters>`
- **Decisive line**: `<quoted deciding output line>`
- **Artifact**: `<capture path or file, or "none">`
- **Cause**: `<file:line and mechanism, when located>`
- **Instead of**: `<stated item behavior>`

## Decision compliance

Every recorded decision against the shipped result. A
`VIOLATED` row is blocking.

| Decision | Verdict | Evidence |
| --- | --- | --- |
| `<date — decision>` | `<verdict>` | `<evidence>` |

Verdict is HELD, VIOLATED, or NOT VERIFIABLE. For NOT
VERIFIABLE, name the settling sign.

## Contract drift

The running result that is not the blessed or specified
result.

- **`<surface>`** — `<shipped behavior>` against `<reference
  content>`, reference `<path>`, blessed `<date>`.
- **Decisions snapshot** — `<difference note, or omit on a
  match>`.

## Proof defects

Done criteria and gates that certified a row without
exercising it.

| Criterion or gate | Verdict | Decisive line |
| --- | --- | --- |
| `<command>` | VACUOUS | `<zero-count line>` |

## What holds up

Named explicitly — the parts that the next round never
breaks.

- `<the working part, and its evidence>`

## Recommended order

1. `<the first act, and its unblocked successors>`
2. `<…>`

State gating relations: an act whose fix gates others goes
first even when one of the others is more severe.

## Not executed

| Surface | Obstacle | Claims left unproven |
| --- | --- | --- |
| `<surface>` | `<obstacle>` | `<unknown facts>` |

## Execution evidence

The run log of every surface row, one execution block each,
quoted without edits. It holds mechanical execution facts,
not semantic verdicts.

```text
<command, exit, duration, decisive line, artifacts per row>
```
