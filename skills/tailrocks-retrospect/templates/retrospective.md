# Retrospective — <slug>

- **Item**: `roadmap/<slug>/README.md` at `<short SHA>`
- **Package**: `plans/<slug>/` at `<short SHA>` — or "none"
- **Source**: <repository the evidence came from>
- **Evidence range**: `<base>..<head>` — <N> commits, <first date> to <last date>
- **Timezone**: all timestamps below are <zone>
- **Lane**: <the stack this item shipped on>
- **Run**: <YYYY-MM-DD>

## Invocation sequence

Ordered by author date. `Log` is what the item claims; `Skill` is what the
trailers show.

| # | Timestamp | Commit | Skill | Paths | Log entry |
|---|-----------|--------|-------|-------|-----------|
| 1 | <ts> | `<sha>` <subject> | <skill \| unattributed \| inferred:<skill>> | <top-level paths> | <matched \| none> |

Counts: <n> attributed, <n> unattributed, <n> inferred. Log entries with no
invocation: <list>. Invocations with no Log entry: <list>. Log actors that are
not skills: <list>.

## Detector results

| Detector | Result |
|---|---|
| D1 evidence after lock-in | <n findings \| none> |
| D2 rework loop | <n findings \| none> |
| D3 untraceable shipped scope | <n findings \| none> |
| D4 unconsumed or stale-consumed output | <n findings \| none> |
| D5 lifecycle inversion | <n findings \| none> |
| D6 write-scope breach | <n findings \| none> |

## Findings

### F1 — <one-line divergence> (<detector>)

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

- **Findings behind it**: <F ids>
- **Skills in scope**: <every skill that must link it, across every lane>
- **Proposed reference**: <path and the one router line each skill adds>

## Non-conformance, no patch

- <finding> — the rule existed at <skill, layer> and was signposted; recorded
  so a later run does not re-file it.

## Rejected candidates

- <candidate> — <why it did not survive re-opening its evidence>

## Hand-off

| Rank | Proposal | Owning skill | Command | Evals to re-run |
|---|---|---|---|---|
| 1 | <F id / X id> | <skill> | `tailrocks-skill-author update <skill>` | <case ids> |
