# Coverage ledger

The traceability spine of `tailrocks-plan`. Every normative
statement in the roadmap item gets an ID at ingest, tracked
through spec, plans, and the final gate.

## Inventory pass

Read the roadmap item end to end before extraction. The sections
of the item map directly:

| Prefix | Source section | Meaning |
| --- | --- | --- |
| `S#` | Screens | One per screen and state |
| `F#` | Capabilities, Intent | One specifiable behavior |
| `W#` | Flows | One cross-screen journey |
| `N#` | Must not | One non-goal with reason |
| `E#` | Created here | One invocable surface |
| `R#` | References, Data | One external touchpoint |
| `D#` | Decisions | One settled choice |
| `A#` | Created here | One open assumption |
| `Q#` | Open research | One researchable fact |
| `B#` | Quality bar | One acceptance statement |

Create `E#` rows at ingest from Capabilities, Screens, and
Flows. One `E#` covers one binary, subcommand, window,
route, RPC method, or scheduled job. Create `A#` rows where
the item is silent and research never closes the gap. Each
`A#` names its falsifying signal. Each `B#` resolves to at
least one spec scenario.

Rules:

- Every normative sentence in the item maps to at least one ID.
  Leftovers turn into an `F#`, an `N#`, or a logged deferral.
  Never drop them silently.
- Deferred entries in the item carry their IDs too, marked
  `deferred (reason)` from birth.
- `D#` entries never reopen: they scope research and constrain
  the spec. A `D#` contradicted by repository reality is a
  surfaced conflict, not a silent correction.
- Additional invocation context, such as "focus on the
  read-only path first", folds in as ledger annotations, not as
  invented item content.

## The ledger file — `roadmap/<slug>/plan/coverage.md`

```markdown
# Coverage Ledger — <slug>

Item: ../README.md at commit `<short SHA>`, ingested <date>.
Override: <none | READY skipped by user — gaps: ...>

## Screens
| ID | Screen | Item anchor | Spec | Plans | Status |
|----|--------|-------------|------|-------|--------|
| S1 | Session list | §Screens | spec/sessions.md | 004 | covered |

## Capabilities
| ID | Capability | Item anchor | Spec | Plans | Status |

## Flows
| ID | Flow | Screens touched | Spec | Plans | Status |

## Entry points
| ID | Entry point | Kind | Item anchor | Registry |
|----|-------------|------|-------------|----------|
| E1 | `app run` | CLI subcommand | §Capabilities | spec/README.md |

The sole entry-point registry lives in `spec/README.md`, which
carries the owning plan and the end-to-end test. This ledger
keeps the item anchors only.

## Must-not anchors
| ID | Statement | Reason | Registry |
|----|-----------|--------|----------|
| N1 | ... | ... | spec/README.md |

The sole must-not registry lives in `spec/README.md`. This
ledger keeps the item anchors only.

## Quality bar
| ID | Statement anchor | Spec scenario(s) | Status |
|----|------------------|------------------|--------|

## Decisions (constraints)
| ID | Decision | Dated | Constrains |

## External references & integrations
| ID | Reference | Kind | Research topics |

## Assumptions
| ID | Assumption | Why safe | Falsified by | Status |
|----|------------|----------|---------------|--------|
| A1 | ... | ... | ... | holds |

## Research questions
| ID | Question | Research topic | Status |
```

Status values: `covered`, `deferred (reason)`, or `dropped
(reason)`. An empty cell is a planning defect. A deferral is a
decision on record. Assumption status values are `holds` or
`falsified (date, routed)`.

## How the pipeline uses the ledger

- **Research pass**: `Q#` and `R#` rows name the investigated
  facts. Each `Q#` and `R#` row links the research topic that
  answers it. Topics key on items, not ledger IDs. `Q#` rows
  close with a topic link or turn into `A#` assumptions.
- **Spec gate**: every `S#`, `F#`, `W#`, `N#`, `E#`, and `B#`
  resolves to a spec location or a logged deferral before
  slicing. Every `B#` resolves to a `#### Scenario:` or a logged
  deferral.
- **Plan gate**: the IDs of every requirement resolve to plan
  numbers. Every `N#` lists the plans that inline it as a
  guardrail. Every `E#` names the plan that creates the surface
  and the test that invokes it end to end. Every `A#` appears
  in the STOP conditions of the plans that lean on it.
- **Vocabulary** gets no IDs. It constrains naming in spec and
  plans. The spec gate checks that terms obey the Vocabulary
  section of the item.
- **Re-runs**: diff the updated item against the ledger. New
  statements get new IDs, changed ones keep their ID with a
  note, removed ones flip to `dropped (item revised)`. Never
  reuse IDs.

## Token discipline

The ledger holds pointers, not prose: anchors and IDs only. The
item stays the single source of full statements. Plans quote
only the load-bearing excerpts that they inline.
