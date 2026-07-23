# Coverage Ledger

The traceability spine of `tailrocks-plan`: every normative statement in the
roadmap item gets an ID at ingest, tracked through spec, plans, and the
final gate.

## Inventory pass

Read the roadmap item end to end before extracting. The item's sections map
directly:

| Prefix | Source section | Meaning |
|---|---|---|
| `S#` | Screens | One per screen, plus one per materially distinct state the item draws or names |
| `F#` | Capabilities (+ Intent) | One per specifiable behavior |
| `W#` | Flows | One per cross-screen journey |
| `N#` | Must not | One per non-goal / forbidden approach, with its reason |
| `R#` | References + Data & integrations | External repo, API, product, design source, integration |
| `D#` | Decisions | Settled choices — constraints, not questions |
| `A#` | (created here) | Assumption made where the item is silent and research cannot close it; each names its falsifying signal |
| `Q#` | Open research questions | Researchable facts the research pass must close |
| `B#` | Quality bar | One per acceptance statement; each must resolve to at least one spec scenario |

Rules:

- Every normative sentence in the item maps to at least one ID; leftovers
  become an `F#`, an `N#`, or a logged deferral — never silently dropped.
- Deferred entries in the item carry their IDs too, marked
  `deferred (reason)` from birth.
- `D#` entries are never re-litigated: they scope research and constrain
  the spec. A `D#` contradicted by repository reality is a surfaced
  conflict, not a silent correction.
- Additional invocation context ("focus on the read-only path first") is
  folded in as ledger annotations, not as invented item content.

## The ledger file — `plans/<slug>/coverage.md`

```markdown
# Coverage Ledger — <slug>

Item: roadmap/<slug>/README.md at commit `<short SHA>`, ingested <date>.
Override: <none | READY skipped by user — gaps: ...>

## Screens
| ID | Screen | Item anchor | Spec | Plans | Status |
|----|--------|-------------|------|-------|--------|
| S1 | Session list | §Screens/"Session list" | spec/sessions.md | 004 | covered |

## Capabilities
| ID | Capability | Item anchor | Spec | Plans | Status |

## Flows
| ID | Flow | Screens touched | Spec | Plans | Status |

## Must-not anchors
| ID | Statement | Reason | Registry |
|----|-----------|--------|----------|
| N1 | ... | ... | spec/README.md |

The sole must-not registry lives in `spec/README.md`; this ledger keeps the
item anchors only.

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

Status values: `covered` | `deferred (reason)` | `dropped (reason)`. An
empty cell is a planning defect; a deferral is a decision on record.
Assumption status values are `holds` or `falsified (date, routed)`.

## How the pipeline uses it

- **Research pass**: `Q#` and `R#` rows name what to investigate; each
  `Q#`/`R#` row links the research topic that answers it (topics key on
  items, not ledger IDs); `Q#` rows close with a topic link or become
  `A#` assumptions.
- **Spec gate**: every `S#`, `F#`, `W#`, `N#`, and `B#` resolves to a spec
  location or a logged deferral before slicing. Every `B#` resolves to a
  `#### Scenario:` or a logged deferral.
- **Plan gate**: every requirement's IDs resolve to plan numbers; every
  `N#` lists the plans that inline it as a guardrail; every `A#` appears
  in the STOP conditions of the plans that lean on it.
- **Vocabulary** gets no IDs — it constrains naming in spec and plans; the
  spec gate checks terms are used per the item's Vocabulary section.
- **Re-runs**: diff the updated item against the ledger — new statements
  get new IDs, changed ones keep their ID with a note, removed ones flip
  to `dropped (item revised)`. IDs are never reused.

## Token discipline

The ledger is pointers, not prose: anchors and IDs only. The item stays the
single source of full statements; plans quote only the load-bearing
excerpts they inline.
