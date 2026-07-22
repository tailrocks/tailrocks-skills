# Coverage Ledger

The traceability spine of `tailrocks-plan`: every normative statement in the
roadmap item gets an ID at ingest, and that ID is tracked through spec,
plans, and the final gate. A statement without an ID is a statement an
executor will eventually guess about.

## Inventory pass

Read the roadmap item end to end before extracting. The item's structure
maps directly — the sections were designed for this intake:

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

Rules:

- Every normative sentence in the item maps to at least one ID; leftovers
  become an `F#`, an `N#`, or a logged deferral — never silently dropped.
- Deferred entries in the item carry their IDs too, marked
  `deferred (reason)` from birth — a conscious deferral travels visibly.
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

## Must-not registry (mirrored in spec/README.md)
| ID | Statement | Reason | Enforced in plans |

## Decisions (constraints)
| ID | Decision | Dated | Constrains |

## External references & integrations
| ID | Reference | Kind | Research topics |

## Assumptions
| ID | Assumption | Why safe | Falsified by |

## Research questions
| ID | Question | Research topic | Status |
```

Status values: `covered` | `deferred (reason)` | `dropped (reason)`. An
empty cell is a planning defect; a deferral is a decision on record.

## How the pipeline uses it

- **Research pass**: `Q#` and `R#` rows name what to investigate; each
  research topic lists the IDs it informs; `Q#` rows close with a topic
  link or become `A#` assumptions.
- **Spec gate**: every `S#`, `F#`, `W#`, `N#` resolves to a spec location
  or a logged deferral before slicing.
- **Plan gate**: every requirement's IDs resolve to plan numbers; every
  `N#` lists the plans that inline it as a guardrail; every `A#` appears
  in the STOP conditions of the plans that lean on it.
- **Re-runs**: diff the updated item against the ledger — new statements
  get new IDs, changed ones keep their ID with a note, removed ones flip
  to `dropped (item revised)`. IDs are never reused.

## Token discipline

The ledger is pointers, not prose: anchors and IDs only. The item stays the
single source of full statements; plans quote only the load-bearing
excerpts they inline.
