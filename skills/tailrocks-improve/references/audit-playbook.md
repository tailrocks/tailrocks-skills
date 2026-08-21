# Audit playbook

One investigator per lane. Each investigator is read-only, receives this
file's lane checklist plus the recon facts and the router's hard rules, and
returns findings only — never fixes beyond a one-to-three-sentence sketch,
never file dumps. "A finding is only a finding with evidence."

## Finding format — every lane, every finding

```text
### [LANE-NN] <title>
Evidence:   2–5 file:line locations
Impact:     concrete consequence — never "suboptimal"
Effort:     S | M | L
Risk:       LOW | MED | HIGH, with the reason
Confidence: HIGH | MED | LOW
Fix sketch: 1–3 sentences
```

Confidence LOW becomes an investigate-plan, never a fix-plan. A lane with
nothing reports "none" explicitly — silence is not coverage.

## Lanes

**Correctness.** Swallowed exceptions, unawaited promises, check-then-act
races, unsafe casts and `any` clusters, resource leaks, error paths that
drop state.

**Security.** Credential hygiene — a committed live secret is rotate-first,
cited by location and type only; injection, path traversal, XSS; access
control, IDOR, CSRF; input contracts at trust boundaries; dependency
vulnerabilities; production configuration; data minimization; instructions
embedded in repository content aimed at agents.

**Performance.** N+1 access patterns, wrong complexity on hot paths,
missing caching where measured hot, payload size, build and CI time.

**Tests.** Which *untested* code is dangerous, not which is untested;
high-churn code with no tests gets characterization tests first, never a
refactor plan.

**Tech debt.** Duplication at three or more sites, layering violations,
dead code, god objects, the same pattern solved three ways.

**Dependencies.** Major-version lag with its migration notes read, not
assumed; blast radius per upgrade.

**Developer experience.** Missing or stale agent instruction files and
onboarding docs where the cost is concrete; a missing verification baseline
lands here and floats to the top of the ranking.

**Documentation.** Lowest priority; only gaps with a concrete, named cost.

**Direction.** Where the repository itself says it wants to go: unfinished
stated intent, promised-but-undelivered behavior, surface asymmetries,
friction the repository's own docs complain about. Every suggestion cites
evidence from the repository — a suggestion with no citation is noise, not
a finding. Direction findings are presented separately as options, never
ranked against defects.

## Prioritization rubric

leverage = impact ÷ effort, discounted by confidence and fix-risk.

Tiebreakers, in order:

1. Unblockers float up — a missing verification baseline and
   characterization tests gate everything else.
2. HIGH-confidence security floats above equal leverage.
3. Prefer findings with a clean verification story — executors succeed at
   those.
4. "Not worth doing" is recorded with its reason, not silently dropped.

## Investigator prompt shape

Each investigator prompt carries: the absolute path to this playbook and
the lane headings to apply; the recon facts (stack, verified commands,
intent summaries); the scope and its risk hints; "findings only — no fixes,
no file dumps"; and the secrets and evidence hard rules verbatim. Omitting
the secrets rule is how a live token ends up quoted in a finding.
