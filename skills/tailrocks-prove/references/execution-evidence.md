# Execution evidence

Every verdict in a round is backed by something that happened in this session.
The installed capability driver records the mechanical facts; this file fixes
their semantic projection, so a report can be re-derived by someone who was
not there. Prose never substitutes for a driver receipt.

## The contract, per surface

```markdown
### <surface> — <VERDICT>

- **Receipt**: `<surface receipt SHA-256 from the assembled bundle>`
- **Command**: `<exact argv from the receipt, without shell joining>`
- **Exit**: <receipt status> · **Duration**: <receipt milliseconds>
- **Decisive line**: `<the indexed, hashed line selected in the receipt>`
- **Artifact**: <receipt path, byte count, and SHA-256 — or "none">
- **Reference**: <the blessed design reference this was compared against, or
  "none — unblessed">
```

Semantic verdicts: `WORKS`, `DEFECT`, `NOT EXECUTED`. Driver outcomes are
mechanical facts only: `EXECUTED`, `FAILED`, `NOT_EXECUTED`; no exit code or
adapter assertion may promote itself to `WORKS`.

Rules that make the contract worth having:

- **The decisive line is quoted, never summarized.** It must be the exact line
  at the receipt's stream and index and match its SHA-256. A panic message, the
  count line, the empty output marker. "It crashed" is not evidence; the
  backtrace's first frame with its file and line is.
- **Absence gets a line too.** When the finding is that nothing happened, the
  evidence is the empty output and the command that produced it, plus what was
  expected in its place.
- **`NOT EXECUTED` names the obstacle**, and the report says which claims
  therefore remain unproven. A round that quietly drops a surface it could not
  reach is the same defect as a suite that never reached an entry point.
- **Never the full log.** The receipt carries byte counts and stream digests,
  not full logs; project secrets do not become report content. One decisive
  line and a path to an authorized retained artifact. A report
  that pastes a thousand lines of output is unreadable exactly where it needs
  to be read.

## Judging a proof, not just running it

A done criterion or gate that exits 0 has proven nothing until you know it
executed work. A gate that cannot distinguish "all tests passed" from "no
tests ran" is not a gate.

For each done criterion in the plan and each gate line in `goal/START.md`:

| Verdict | Meaning | Evidence |
|---|---|---|
| `PROVEN` | Exited 0 and executed a positive number of units | The count line: tests run, targets built, files checked |
| `VACUOUS` | Exited 0 having executed nothing | The zero-count line, or the resolution error the command swallowed |
| `FAILED` | Non-zero exit | The failing assertion or error line |

The shapes that produce `VACUOUS`, all seen in the field:

- a package, crate, or target filter that resolves to nothing — the runner
  reports zero tests and exits 0;
- a test-name filter with a typo, same outcome;
- a suite whose cases all skip under the current configuration;
- a check whose input file does not exist and whose "no findings" and "nothing
  to read" are the same output;
- a gate asserting an equality that the empty value also satisfies — a
  published-projection test that passes because both sides are empty.

A `VACUOUS` criterion is a defect of the plan, not of the executor who
satisfied it. Report it as such: the row it certified is unproven, and the
criterion needs replacing before that row can be believed.

## Comparing against a blessed reference

For a surface with a blessed reference, the comparison is per region or per
element, and both directions are checked:

- present in the artifact and wrong — the ordinary case;
- **present in the reference and absent from the artifact** — the case most
  gates miss, because a per-element check over what exists finds nothing to
  complain about. A missing meter, an empty column, a material that appears
  nowhere, a state that was never built.

Where the reference is unblessed or missing, say so and stop: an unblessed
reference cannot ratify what shipped, and treating it as one converts an
unanswered design question into a silent approval.

## Recording the environment

One block per round, not per surface: the SHA built from, the configuration or
data directory used, the platform and version, and the display or terminal
size where it matters. Two rounds against different data are not comparable,
and the report is read months later by someone who assumes they are.
