# Retrospective — <slug>

- **Item**: `roadmap/<slug>/README.md` at `<short SHA>`
- **Retirement**: `<short SHA>` <date> — the commit that deleted
  `roadmap/<slug>/`; every artifact below was read at `<short SHA>^` — or
  "none — the folder is still in the tree, and the item's Status is <status>"
- **Package**: `roadmap/<slug>/plan/` at `<short SHA>` — or "none"
- **Verification**: `roadmap/<slug>/verification/` — <n> rounds, latest
  `<NN>` verdict <verdict>, blocking defects <ids | none> — or "none"
- **Source**: <repository the evidence came from>
- **Evidence range**: `<base>..<head>` — <N> commits, <first date> to <last date>
- **Timezone**: all timestamps below are <zone>
- **Lanes**: <every stack this item's commits touched, and which skills ran
  on each — "none" for a lane the item never entered; step 5 widens against
  the siblings of each>
- **Run**: <YYYY-MM-DD>

## Invocation sequence

Ordered by author date. The trailers are the whole history — no artifact
carries one, so an unmarked commit is a hole, never a subject line to read.

| # | Timestamp | Commit | Skill | Paths |
|---|-----------|--------|-------|-------|
| 1 | <ts> | `<sha>` <subject> | <skill \| unattributed \| inferred:<skill> \| shared:<a>+<b>> | <top-level paths> |

Counts: <n> attributed, <n> unattributed, <n> inferred, <n> shared.
Parse: <n> by trailer key, <n> by full-message scan — every difference listed
with its SHA, because that gap measures dropped attributions rather than a
marking failure. Unattributed artifact commits, listed with their paths:
<list> — each one is the marking rule failing, reported as a finding rather
than filled in. Artifacts with no attributed commit behind them (a
`verification/` round, a plan package, a research topic): <list>.

## Detector results

| Detector | Result |
|---|---|
| D1 evidence after lock-in | <n findings \| none \| not applicable — <what this lane has none of> \| unrunnable over <n> commits \| not attributable — <lane>> |
| D2 rework loop | <n findings \| none \| not applicable — <what this lane has none of> \| unrunnable over <n> commits \| not attributable — <lane>> |
| D3 untraceable shipped scope | <n findings \| none \| not applicable — <what this lane has none of> \| unrunnable over <n> commits \| not attributable — <lane>> |
| D4 unconsumed or stale-consumed output | <n findings \| none \| not applicable — <what this lane has none of> \| unrunnable over <n> commits \| not attributable — <lane>> |
| D5 lifecycle inversion | <n findings \| none \| not applicable — <what this lane has none of> \| unrunnable over <n> commits \| not attributable — <lane>> |
| D6 write-scope breach | <n findings \| none \| not applicable — <what this lane has none of> \| unrunnable over <n> commits \| not attributable — <lane>> |

`none` means the check ran and found nothing. `not applicable` means the lane
carries no artifact of the kind the detector reads, and it names which.
`unrunnable` means the artifacts exist but the table could not show them —
commits the detector groups by skill were unattributed, or the fetch
truncated — and it names how many. `not attributable` means no skill in this
lane is required to mark its commits at all, so a skill-grouped detector had
nothing to group; it names the lane. The four are different evidence, and a
record that writes `none` for any of the others cannot be re-audited.

## Findings

Finding ids are `RF#`, cross-cutting ids `X#`. Bare `F#` and `D#` belong to
the coverage ledger's capabilities and Decisions; reusing them makes a
record's own references ambiguous against the item it audits.

### RF1 — <one-line divergence> (<detector>)

- **Evidence**: <commits, timestamps, paths, quoted artifact lines — each one
  opened this session>
- **What the pipeline did**: <the sequence, in two or three sentences>
- **The missing check**: <the skill, the layer, and the text that was supposed
  to catch this — quoted>
- **Classification**: skill defect | cross-cutting | gate | instruction file |
  non-conformance (no patch)
- **Sibling lanes checked**: <skill — same gap \| lane-specific reason \| n/a>

#### Proposed patch

```text
Target:   skills/<name>/SKILL.md
Shape:    <Boundaries bullet | appended step | final-gate clause | reference + router line>
Anchor:   after "<exact heading or bullet>"
Replaces: <nothing | the exact lines removed, and why>
Evals:    <case ids at risk>
```

<the exact text to insert>

## Cross-cutting proposals

### X1 — <rule name>

- **Findings behind it**: <RF ids>
- **Skills in scope**: <every skill that must link it, across every lane>
- **Proposed reference**: <path and the one router line each skill adds>

## Non-conformance, no patch

- <finding> — the rule existed at <skill, layer> and was signposted; recorded
  so a later run does not re-file it.

## Rejected candidates

- <candidate> — <why it did not survive re-opening its evidence>

## Hand-off

| Rank | Proposal | Owning skill | Record | Command | Evals to re-run |
|---|---|---|---|---|---|
| 1 | <RF id / X id> | <skill> | `retrospectives/<source>-<slug>.md#RF<id>` | `tailrocks-skill-update <skill>` | <case ids> |
