# Plan 011: Ship a worked example plan package as the quality anchor

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**: confirm in `advisor-plans/README.md` that
> plans 001 and 002 are DONE — the example must demonstrate the corrected
> contract, not the pre-fix one. If either is not DONE: STOP.
> Then `git diff --stat f2c4be5..HEAD -- skills/tailrocks-plan/references/`
> and re-read any changed reference before writing example content
> against it.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: LOW (additive; risk is drift if templates evolve — see
  Maintenance)
- **Depends on**: advisor-plans/001, advisor-plans/002
- **Category**: direction
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

The maintainer's benchmark for tailrocks-plan is the shadcn improve
skill, which ships `examples/001-*.md` as its concrete quality anchor.
tailrocks-plan's writer subagents and cold reviewers currently imitate
abstract template prose only; the "enormously detailed" bar exists in the
maintainer's head, not in a file an agent can open. One small, complete,
internally consistent example package raises the output floor of every
future run and doubles as fixture material for the eval work.

## Current state

Verified at `f2c4be5` (re-check post-001/002 versions before writing):

- No `examples/` directory exists anywhere in the repo.
- The contract files the example must obey (all under
  `skills/tailrocks-plan/references/`): `coverage-ledger.md` (prefix
  table + ledger file template; post-002 includes the `B#` Quality-bar
  prefix and the registry pointer), `spec-format.md` (OpenSpec grammar:
  `### Requirement:` exactly three hashes with SHALL/MUST, `#### Scenario:`
  exactly four hashes with bolded GIVEN/WHEN/THEN bullets, `Covers:`/
  `Evidence:` trailers, screen contracts, must-not registry in
  spec/README.md, deferrals), `plan-template.md` (full plan skeleton:
  preconditions, spec contract inlined verbatim, Must NOT, Inputs with
  replacement contracts, starting state, commands table, scope, steps
  with verify, test plan, done criteria, STOP conditions, maintenance),
  `goal-handoff.md` (hub with manifest + item briefs + executor protocol;
  GOAL.md three blocks — post-001 predicate "DONE or REJECTED, no row
  STALE/BLOCKED/IN PROGRESS", protocol-writes paragraph, per-plan turn
  estimates).
- Roadmap item format: `skills/tailrocks-idea/references/roadmap-item-format.md`
  (template with Status/Intent/Vocabulary/Decisions/Capabilities/Screens/
  Flows/Data & integrations/References/Research/Must not/Quality bar/
  Open questions/Open research questions/Deferred/Log).
- Possible synergy: plan 005 step 3 creates a fixture item at
  `skills/tailrocks-plan/evals/fixtures/roadmap/macos-application/README.md`.
  If it exists when this plan runs, reuse that item as the example's
  source (copy, do not move); otherwise author the item here per the
  format.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |
| Grammar check | `grep -c "^### Requirement:" examples/plan-package/plans/goal-live-status/spec/*.md` | ≥ 4 |

## Scope

**In scope** (create only):
- `examples/plan-package/README.md` — what this example is, how it maps
  to the skill's steps, "do not execute — format anchor" banner (model
  the banner on shadcn improve's example header idea: sample output,
  repo has moved on, run the skill instead).
- `examples/plan-package/roadmap/goal-live-status/README.md` — a small
  READY item (invented but realistic: e.g. "live status board for /goal
  loops" — a CLI/TUI feature over the house Rust stack; 2 screens with
  ASCII mockups, 4–6 capabilities, 1 flow, 2 must-nots, 2 decisions,
  quality bar with 3 acceptance statements, one linked research topic).
- `examples/plan-package/research/goal-status-ipc/README.md` + one
  `01-status-sources.md` chapter (vetted-format, fabricated-but-plausible
  sources marked `example://` so nobody mistakes them for real citations).
- `examples/plan-package/plans/goal-live-status/` — the package:
  `coverage.md` (every prefix incl. `B#`, every ID resolved),
  `spec/README.md` (capability index, must-not registry with
  "Enforced in plans" filled, one deferral), `spec/status-board.md`
  (≥ 4 requirements, each with ≥ 1 four-hash scenario, Covers/Evidence
  trailers), `README.md` hub (manifest ≥ 3 plans, item briefs, dependency
  notes, executor protocol per post-001 goal-handoff), `001-*.md`,
  `002-*.md`, `003-*.md` (full plan-template instances; 001 must be the
  verification-baseline slice per post-002 rule), `GOAL.md` (three
  blocks, post-001 predicate, bounds with the per-plan turn estimates).
- One line in `README.md` (repo root) linking the example from the
  delivery-family section.

**Out of scope**:
- Any edit to `skills/**` (the example must conform to the references,
  never the other way — a conflict is a STOP).
- Real research citations (use `example://` placeholders; the example
  teaches shape, not facts).

## Git workflow

- Branch: `advisor/011-example-plan-package`.
- Conventional Commits, DCO: `git commit -s -m "docs: add worked plan-package example"`.
  Main PR-only; no push/PR unless instructed.

## Steps

### Step 1: Author the roadmap item (or copy plan 005's fixture)

Per the format reference, READY status, Log entries showing the
idea→brainstorm→finalize path. Keep it ≤ 120 lines.

**Verify**: item has every section from the format template, none absent
(empty allowed): `grep -c "^## " examples/plan-package/roadmap/goal-live-status/README.md`
→ ≥ 14.

### Step 2: Author the research topic

Summary + one chapter per the chapter contract (Questions/Informs/Method
header, Findings with `example://` sources + confidence tags, Dead ends,
Open unknowns, `Vetted:` line).

**Verify**: `grep -n "Vetted:" examples/plan-package/research/goal-status-ipc/01-status-sources.md` → 1 hit.

### Step 3: Build the package — ledger, spec, hub

Write `coverage.md` first (every normative item statement → ID; include
at least one `deferred (reason)` and one `A#` with falsifying signal),
then the spec (every S/F/W/N/B ID resolved), then the hub (manifest with
Covers column tracing requirement headings + IDs; briefs; protocol
copied from post-001 goal-handoff).

**Verify**: every ledger ID string in `coverage.md` appears in either a
spec file or the deferral list:
spot-check three IDs with grep; `grep -c "^#### Scenario:" examples/plan-package/plans/goal-live-status/spec/status-board.md` → ≥ 4.

### Step 4: Write the three plans + GOAL.md

Full template instances. 001 = verification baseline (workspace + gates
green on skeleton). Each plan inlines its spec contract verbatim, its
must-nots, preconditions proving the prior plan, and a test plan with an
independent source of truth. GOAL.md's three blocks use the post-001
predicate and bounds formula.

**Verify**: `grep -c "DONE or REJECTED" examples/plan-package/plans/goal-live-status/GOAL.md`
→ ≥ 2 (block 1 + block 2); `grep -n "Preconditions" examples/plan-package/plans/goal-live-status/00*.md`
→ 1 hit per plan.

### Step 5: Wire the entry points

`examples/plan-package/README.md` banner + map; root README link line.

**Verify**: `bun run scripts/validate-skills.ts` → exit 0 (examples/ is
outside skills/, validator untouched); `grep -n "examples/plan-package" README.md` → 1 hit.

## Test plan

Machine checks above (grammar greps, ID spot-checks). Human check: a
fresh-context reader (or subagent) reads ONLY
`examples/plan-package/plans/goal-live-status/002-*.md` and lists what
they'd have to guess — the list should be empty; fix what isn't.

## Done criteria

- [ ] Complete package: item, topic, ledger, spec (README + 1 capability),
      hub, 3 plans, GOAL.md, banner README — all internally consistent
- [ ] Plan 001 of the example is the verification-baseline slice
- [ ] All step greps pass; fresh-context read reports no guesses
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- 001 or 002 not DONE (the example would encode the broken contract).
- Writing the example exposes a contradiction in the (post-fix)
  references — that's a real finding; report it rather than bending the
  example around it.

## Maintenance notes

- The example is coupled to the plan-template/goal-handoff format;
  future format changes must update it (add to plan 003's test wishlist:
  a check that example GOAL.md matches the current predicate wording).
- Plan 012's walkthrough should link sections of this example rather
  than restate them.
- Consider (future) pointing the writer-brief at
  `examples/plan-package/plans/goal-live-status/002-*.md` as the
  "passing plan looks like this" anchor — needs a SKILL.md edit, out of
  scope here.
