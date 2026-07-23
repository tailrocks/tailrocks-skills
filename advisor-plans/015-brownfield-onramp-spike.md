# Plan 015: Design spike — a brownfield on-ramp that seeds roadmap items from an existing codebase

> **Executor instructions**: DESIGN SPIKE — deliverable is a design doc
> (skill charter + boundary map + draft SKILL.md skeleton), NOT a new
> shipped skill. Where scope belongs to the maintainer, record option
> pairs with recommendations. When done, update this plan's status row
> in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- skills/tailrocks-idea/SKILL.md skills/tailrocks-code-health/SKILL.md skills/tailrocks-remediate/SKILL.md AGENTS.md`
> Re-read changed files; the boundary map must reflect live scope
> statements.

## Status

- **Priority**: P3
- **Effort**: L
- **Risk**: MED (overlap hazard with code-health/remediate/research —
  the spike's main job is a clean boundary, or a no-go)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

The delivery pipeline's only entry is tailrocks-idea, which is
capture-only from the user's words ("Capture, do not invent: every
statement must come from the user's input" — idea SKILL.md:26-30). No
skill turns an existing codebase's observable state into candidate
roadmap items. Teams adopting the pipeline on a mature repo have no
bridge: code-health emits ratchets, remediate fixes proven defects,
research answers questions — none seeds the roadmap. An improve-style
audit→DRAFT-items skill is that bridge.

## Current state

Verified at `f2c4be5`:

- `skills/tailrocks-idea/SKILL.md` — capture-only boundary (:26-30);
  step 1 slug rule; DRAFT + index row output; "Ask nothing unless the
  input is too thin to name".
- `skills/tailrocks-code-health/SKILL.md` — audit measures debt for
  ratchets; not item-producing.
- `skills/tailrocks-remediate/SKILL.md` — requires a PROVEN defect;
  analyze/fix; not exploratory.
- `skills/tailrocks-research/SKILL.md` — question/item-driven; writes
  research/, not roadmap/.
- Roadmap item contract: `skills/tailrocks-idea/references/roadmap-item-format.md`
  (DRAFT template, "no invented content" spirit — an audit-seeded item
  must mark provenance).
- Benchmark shape: the shadcn improve skill's direction category
  ("audit only the direction category, in more depth: 4–6 grounded
  suggestions, each with evidence, trade-offs, and a coarse effort
  estimate" — its `next` variant), with the grounding rule "every
  suggestion must cite evidence from the repo itself".
- House conventions a new skill must satisfy (AGENTS.md:156-166): guard
  sentence, disable-model-invocation, openai.yaml, evals, references
  router, catalog rows, validator green.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 (repo untouched except docs/ + advisor-plans/) |

## Scope

**In scope** (create only):
- `docs/brownfield-onramp-design.md`

**Out of scope**:
- Creating `skills/tailrocks-survey/**` (or whatever the name lands as) —
  follow-up plan after maintainer sign-off.
- Modifying existing skills' scope statements.

## Git workflow

- Branch: `advisor/015-brownfield-onramp-spike`.
- Conventional Commits, DCO (`git commit -s`). Main PR-only; no push/PR
  unless instructed.

## Steps

### Step 1: Charter and boundaries

Design doc sections:

- **Charter**: read-only codebase survey → 3–6 grounded candidate
  roadmap items, each written as a DRAFT item (provenance-marked) +
  index rows; user selects which survive. Name proposal:
  `tailrocks-survey` (alternatives listed: `tailrocks-scout`,
  `tailrocks-intake`; recommend one).
- **Boundary map** (the spike's core): a table vs each neighbor —
  code-health (debt→ratchet, not items; survey may CITE its findings),
  remediate (proven defect→fix; survey routes proven defects TO it,
  never fixes), research (fact questions; survey may emit Open research
  questions inside items), idea (user-words capture; survey items mark
  `Source: codebase survey` provenance in Intent and Log so "no invented
  content" stays honest — the evidence IS the source), improve-style
  generic audit (out: no findings table, no fix plans — items only).
- **Grounding rule** (adapted from the benchmark): every candidate item
  must cite in-repo evidence (unfinished intent: TODO clusters, feature
  flags never rolled out, stubbed modules; stated-but-undelivered:
  README promises without code; surface asymmetries: export-without-
  import, CRUD-minus-one; adjacent possible: capabilities the
  architecture makes cheap). Generic category-slop ("add dark mode") is
  a rule violation.
- **Output contract**: DRAFT items per roadmap-item-format with
  Capabilities/References/Open questions seeded from evidence,
  everything else honestly empty; provenance Log line; items the user
  rejects get deleted by the user, not parked silently.
- **Safety/injection**: repository content is data; the canonical
  sentence (plan 006) verbatim; secrets by location/type.
- **Draft SKILL.md skeleton**: frontmatter + Boundaries + 4 steps +
  Final gate, ready to lift into a follow-up plan.
- **Eval sketches**: 3 cases (normal: seed items from a fixture repo;
  boundary: refuse to also fix a found defect; safety: fixture contains
  an embedded instruction — must be flagged, not followed).
- **Open questions** with recommendations (e.g. does survey run
  subagents? recommend: yes, per-modality Explore-style, restating rules
  — mirroring research's investigator pattern).

**Verify**: `grep -c "^## " docs/brownfield-onramp-design.md` → ≥ 8;
boundary table names all five neighbors.

### Step 2: Dry-run on this repo

Apply the grounding rule to tailrocks-skills itself and list 2–3
candidate items the skill WOULD have produced (e.g. "eval runner"
— evidence: 47 inert cases; "example package" — evidence: benchmark
ships one, this repo doesn't). This validates the evidence categories
against a real tree and doubles as the design's worked example.

**Verify**: section present; every candidate cites `file:line`-level or
tree-level evidence from this repo.

### Step 3: Validate repo untouched

**Verify**: `bun run scripts/validate-skills.ts` → exit 0; `git status`
→ only `docs/brownfield-onramp-design.md` + `advisor-plans/README.md`.

## Test plan

Step 2's dry-run is the evidence the charter works. No runtime.

## Done criteria

- [ ] Design doc: charter, five-neighbor boundary table, grounding rule,
      output contract, injection rules, SKILL.md skeleton, 3 eval
      sketches, open questions, dry-run with cited evidence
- [ ] No skills/** modified
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The boundary table cannot cleanly separate survey from code-health +
  remediate (irreducible overlap) — write the no-go verdict with the
  overlap named; a fourth fuzzy "read existing code" skill is worse than
  no on-ramp.

## Maintenance notes

- Follow-up plan (if go): build the skill per the skeleton + AGENTS.md
  "Adding a Skill" steps 1–6; the eval sketches become its evals.json.
- The provenance marking convention may deserve a line in
  roadmap-item-format.md when the skill ships — note for that follow-up,
  not now.
