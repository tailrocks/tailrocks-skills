# Execution evidence

Every verdict in a round rests on an event of this session.
Native runs record the mechanical facts. This file fixes
their semantic projection, so a reader that was not there
re-derives the report. Prose never substitutes for executed
output.

## The contract, per surface

```markdown
### <surface> — <VERDICT>

- **Command**: `<the exact argv that ran, without shell joining>`
- **Exit**: <exit status> · **Duration**: <milliseconds>
- **Decisive line**: `<the quoted output line that decided it>`
- **Artifact**: <capture path, byte count, and SHA-256 — or "none">
- **Reference**: <the blessed design reference of comparison, or
  "none — unblessed">
```

Semantic verdicts: `WORKS`, `DEFECT`, `NOT EXECUTED`. No exit
code and no harness assertion promotes itself to `WORKS`.

Rules that make the contract worth its cost:

- **Quote the decisive line, never summarize it.** It is the
  exact output line: a panic message, the count line, the
  empty output marker. "It crashed" is not evidence. The
  first frame of the backtrace with its file and line is.
- **Absence gets a line too.** When the finding is that
  nothing happened, the evidence is the empty output and the
  command that produced it. Add the expected content in its
  place.
- **`NOT EXECUTED` names the obstacle**, and the report
  states the unproven claims. A round that quietly drops an
  unreachable surface repeats the defect of a suite that
  never reached an entry point.
- **Never the full log.** One decisive line and a path to an
  authorized retained artifact. Project secrets never turn
  into report content. A report that pastes a thousand
  output lines is unreadable exactly where it needs a read.

## Judging a proof, not only running it

A done criterion or gate that exits 0 proved nothing until
its executed work is known. A gate that never distinguishes
"all tests passed" from "no tests ran" is not a gate.

Judge each done criterion in the plan and each gate line in
`goal/START.md`:

| Verdict | Meaning | Evidence |
| --- | --- | --- |
| `PROVEN` | Ran units, exit 0 | The count line |
| `VACUOUS` | Ran nothing, exit 0 | The zero-count line |
| `FAILED` | Non-zero exit | The error line |

The `VACUOUS` shapes, all seen in the field:

- a package, crate, or target filter that resolves to
  nothing: the runner reports zero tests and exits 0.
- a test-name filter with a typo, same outcome.
- a suite whose cases all skip under the current
  configuration.
- a check whose input file never existed, and whose "no
  findings" and "nothing to read" are the same output.
- a gate that asserts an equality that the empty value also
  satisfies: a published-projection test that passes because
  both sides are empty.

A `VACUOUS` criterion is a defect of the plan, not of the
executor that satisfied it. Report it as such: the row that
it certified is unproven, and the criterion needs a
replacement before belief in that row returns.

## Comparing against a blessed reference

For a surface with a blessed reference, compare per region
or per element, and check both directions:

- present in the artifact and wrong, the ordinary case.
- **present in the reference and absent from the artifact.**
  This case is the one that most gates miss. A per-element
  check over the current content finds nothing to fault. A
  missing
  meter, an empty column, a material that appears nowhere, a
  state never built.

Where the reference is unblessed or missing, state that fact
and stop. An unblessed reference never ratifies the shipped
result. Its use as ratification converts an unanswered design
question into a silent approval.

## Recording the environment

One block per round, not per surface. It records the built
SHA. It records the configuration or data directory in use.
It records the platform and version. It records the display
or terminal size where it matters. Two rounds against
different data never compare, and the report reads months
later by a reader that assumes they do.
