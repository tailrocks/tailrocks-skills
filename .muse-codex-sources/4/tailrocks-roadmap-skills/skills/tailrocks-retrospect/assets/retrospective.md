# Retrospective — `<slug>`

- **Item**: `roadmap/<slug>/README.md` at `<short SHA>`
- **Retirement**: `<short SHA>` `<date>` — the commit that
  deleted `roadmap/<slug>/`. Every artifact below was read at
  `<short SHA>^` — or "none — the folder is still in the
  tree, and the item Status is `<status>`"
- **Package**: `roadmap/<slug>/plan/` at `<short SHA>` — or
  "none"
- **Verification**: `roadmap/<slug>/verification/` — `<n>`
  rounds, latest `<NN>`, blocking defects `<ids or none>` —
  or "none"
- **Source**: `<repository of the evidence>`
- **Evidence range**: `<base>..<head>` — `<N>` commits,
  `<first date>` to `<last date>`
- **Timezone**: all timestamps below are `<zone>`
- **Attribution**: `<full, partial, or uncertain>`
- **Lanes**: `<stacks and running skills per lane>`
- **Run**: `<YYYY-MM-DD>`

## Invocation sequence

Ordered by author date. The trailers are the whole history —
no artifact carries one, so an unmarked commit is a hole,
never a subject line to read.

| # | Timestamp | Commit | Skill | Paths |
| --- | --- | --- | --- | --- |
| 1 | `<ts>` | `<sha>` | `<skill>` | `<paths>` |

Counts: `<n>` attributed, `<n>` unattributed, `<n>` inferred,
`<n>` shared. Parse: `<n>` by trailer key, `<n>` by
full-message scan. Every difference is listed with its SHA,
because that gap measures dropped attributions, not a
marking failure. Unattributed artifact commits are listed
with their paths. Each one is the failed marking rule,
reported as a finding, never filled in. Artifacts with no
attributed commit behind them are listed: a `verification/`
round, a plan package, or a research topic.

## Detector results

| Detector | Result |
| --- | --- |
| D1 evidence after lock-in | `<result>` |
| D2 rework loop | `<result>` |
| D3 untraceable shipped scope | `<result>` |
| D4 unconsumed output | `<result>` |
| D5 lifecycle inversion | `<result>` |
| D6 write-scope breach | `<result>` |

Result is one of six: `<n>` findings, none, not applicable,
unrunnable, not attributable, uncertain attribution. Name
the missing artifact class, commit count, or lane with the
result. The six are different evidence, and a record that
writes none for any of the others never re-audits.

## Findings

Finding ids are `RF#`, cross-cutting ids `X#`. Bare `F#` and
`D#` belong to the capabilities and Decisions of the
coverage ledger. Their reuse makes the own references of a
record ambiguous against the audited item.

### RF1 — `<one-line divergence>` (`<detector>`)

- **Evidence**: `<commits, paths, quoted lines — each opened
  this session>`
- **The pipeline acts**: `<the sequence, two or three
  sentences>`
- **The missing check**: `<skill, layer, quoted text>`
- **Classification**: `<one class>`
- **Sibling lanes checked**: `<skill — verdict each>`

Classification is one of: skill defect, cross-cutting,
gate, instruction file, or non-conformance (no patch).

#### Proposed patch

```text
Target:   skills/<name>/SKILL.md
Shape:    <one of the six legal shapes>
Anchor:   after "<exact heading or bullet>"
Text:     <exact prose to insert>
Replaces: <nothing | removed lines, and why>
Checks:   <check or evidence IDs at risk>
```

`<the exact text to insert>`

## Cross-cutting proposals

### X1 — `<rule name>`

- **Findings behind it**: `<RF ids>`
- **Skills in scope**: `<every linked skill>`
- **Proposed reference**: `<path and router line>`

## Non-conformance, no patch

- `<finding>` — `<skill, layer>`. A later run never re-files it.

## Rejected candidates

- `<candidate>` — `<rejection reason>`

## Hand-off

| Rank | Proposal | Owner | Record | Command | Checks |
| --- | --- | --- | --- | --- | --- |
| 1 | `<id>` | `<skill>` | `<path>` | `<command>` | `<ids>` |
