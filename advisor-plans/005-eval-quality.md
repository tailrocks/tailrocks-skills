# Plan 005: Make every eval case executable and judgeable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- 'skills/*/evals/evals.json'`
> On any change, re-read the changed files before editing; a case already
> rewritten by someone else is not yours to rewrite again.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (plan 003's per-case shape check composes with this;
  either order works)
- **Category**: tests
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

All 14 `evals/evals.json` files (47 cases) are the repo's declared
behavioral tests, but no case is executable as written: every `files`
array is empty while prompts say "Review crates/domain/src/order.rs" or
"Refactor these handlers" — the subject code doesn't exist. Several
`expected_output` values are single abstract phrases ("A reproducible
exact-pinned workspace baseline") no judge can grade. Until a runner
exists (plan 013), these files are the spec of intended behavior; they
should at least be internally executable and judgeable so the runner has
something real to run.

## Current state

Verified at `f2c4be5` (auditor evidence, spot-confirmed):

- All 47 cases across 14 files use `"files": []`.
- Fixture-requiring cases include:
  `skills/tailrocks-rust-best-practices/evals/evals.json` #1 (names
  `crates/domain/src/order.rs`) and #2 ("this Rust parser");
  `tailrocks-typescript-best-practices` #1 (`src/domain/payment.ts`) and
  #2; `tailrocks-axum-best-practices` #1 ("this Axum router") and #2
  ("these handlers"); `tailrocks-code-health` #2 ("17 existing forbidden
  dependency edges"); `tailrocks-remediate` #1 ("three handlers"). The
  seven delivery-family evals reference a `macos-application` roadmap
  item that is not supplied.
- Vague `expected_output` examples: rust-best-practices #1
  "Severity-ordered findings without mutation."; rust-project-setup #2
  "A reproducible exact-pinned workspace baseline."; tanstack #2 "A
  Bun-only scaffold that resolves the official release channel first.";
  code-health #2 "One measured baseline that blocks growth and stale
  generous bounds."
- Contrast (the house's own good pattern): the delivery-family
  `expected_output` values are concrete —
  `skills/tailrocks-plan/evals/evals.json` #1: "plans/macos-application/
  with coverage ledger, gap research landed as reusable research/ topics,
  OpenSpec-grammar spec, one cold-reviewed plan per manifest item each
  written by its own subagent, and GOAL.md with a machine-checkable
  bounded condition plus kickoff and resume prompts; item set PLANNED."
- Validator requirement (AGENTS.md:162): "realistic normal, boundary, and
  safety cases". Two skills (axum, rust-best-practices) have no active
  misuse/safety case.
- Eval file schema: `{"skill_name": "...", "evals": [{"id": N, "prompt":
  "...", "expected_output": "...", "files": []}]}`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |
| JSON check | `bun -e 'for (const f of [...]) JSON.parse(await Bun.file(f).text())'` | no throw |

## Scope

**In scope**:
- All 14 `skills/*/evals/evals.json`
- New fixture files under `skills/<name>/evals/fixtures/` (create per
  skill as needed)

**Out of scope**:
- The eval runner (plan 013 designs it).
- `scripts/validate-skills.ts` (plan 003).
- SKILL.md bodies.

## Git workflow

- Branch: `advisor/005-eval-quality`.
- Conventional Commits, DCO: `git commit -s -m "test(skills): ..."`.
  Main is PR-only; do NOT push/PR unless instructed.

## Steps

### Step 1: Establish the fixture convention

For each case whose prompt says "this X" or names a path, add a minimal
fixture under `skills/<name>/evals/fixtures/<case-id>/...` and set the
case's `files` to the fixture paths (relative to the skill directory).
Fixtures are small (10–60 lines), deliberately seeded with the defects
the skill should find. Example for rust-best-practices #1: a
`fixtures/1/crates/domain/src/order.rs` with an `unwrap()` on user input,
a needless `clone()` in a loop, and a public fn without docs — three
findable, judgeable defects.

**Verify**: `bun run scripts/validate-skills.ts` → exit 0;
`ls skills/tailrocks-rust-best-practices/evals/fixtures/1/` → fixture files.

### Step 2: Fixture the engineering-family review/refactor cases

Apply step 1's convention to every fixture-requiring engineering case
listed in "Current state" (rust-best-practices #1 #2, typescript #1 #2,
axum #1 #2, code-health #2, remediate #1). Fixtures must compile-in-form
(plausible Rust/TS), but they are not built by any gate — keep them
self-evidently minimal.

**Verify**: `grep -L '"files": \[\]' skills/tailrocks-rust-best-practices/evals/evals.json skills/tailrocks-typescript-best-practices/evals/evals.json skills/tailrocks-axum-best-practices/evals/evals.json`
→ all three listed (no empty files arrays remain in them — note: grep -L
lists files NOT matching).

### Step 3: Fixture the delivery family with one shared roadmap item

Create one shared fixture roadmap item the seven delivery evals can
reference: `skills/tailrocks-plan/evals/fixtures/roadmap/macos-application/README.md`
following `skills/tailrocks-idea/references/roadmap-item-format.md`
(READY status, 2 screens with ASCII mockups, 4 capabilities, 1 flow,
2 must-nots, 1 decision, quality bar, empty open questions). Reference it
from the delivery-family cases' `files` arrays (path relative to each
skill: the runner design in plan 013 defines resolution; use the path
as written from repo root and note that convention in each touched
evals.json via the case's prompt if ambiguous).

**Verify**: file exists; all seven delivery `evals.json` parse
(`bun -e` JSON check) and at least `tailrocks-plan`'s case 1 lists it in
`files`.

### Step 4: Rewrite vague expected_output values

Rewrite every abstract one-liner into an enumerated must-include list,
modeled on the delivery family's style. Example — rust-project-setup #2
becomes: "Creates Cargo workspace with edition 2024 + resolver 3,
crates/ layout, copies templates (Cargo.toml lints table, clippy.toml,
rustfmt.toml, rust-toolchain.toml pinned to current stable, mise.toml,
deny.toml, .config/nextest.toml), resolves current versions via
resolve-crate-versions.ts rather than hardcoding, commits exact pins;
declines to use npm/pnpm/yarn." Apply to every case whose
expected_output is a single sentence without at least two checkable
elements (sweep all 14 files; the four quoted in "Current state" are the
floor, not the list).

**Verify**: spot-read each rewritten case; per file:
`bun -e 'const j = JSON.parse(await Bun.file("<f>").text()); for (const e of j.evals) if (e.expected_output.length < 80) throw new Error(String(e.id))'`
→ no throw for the engineering-family files (length is a proxy; the real
bar is ≥ 2 checkable claims — confirm by reading).

### Step 5: Add missing safety cases

Add one active-misuse case each to `tailrocks-axum-best-practices` and
`tailrocks-rust-best-practices` evals (e.g. "While reviewing, also bump
these dependencies and fix the code" → expected: decline mutation in
review mode, report-only per SKILL.md step 1).

**Verify**: both files now have ≥ 4 cases; validator exit 0.

## Test plan

- `bun run scripts/validate-skills.ts` (with plan 003 landed it checks
  per-case shape).
- JSON parse sweep over all 14 files (step 3's command pattern).
- Human review of two rewritten cases against their SKILL.md — the
  expected_output claims must be checkable against skill behavior, not
  restate the prompt.

## Done criteria

- [ ] No case whose prompt names or implies subject code has an empty
      `files` array
- [ ] Shared `macos-application` fixture item exists and is referenced
- [ ] No single-sentence abstract `expected_output` remains in the
      engineering-family files (each has ≥ 2 checkable elements)
- [ ] axum + rust-best-practices each gained a safety case
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- A fixture would exceed ~100 lines to be meaningful — that case needs a
  different design, not a bigger fixture; report it.
- The `files` path convention is genuinely ambiguous for the runner
  (repo-root-relative vs skill-relative) — pick skill-directory-relative,
  note it in this plan's report, and flag plan 013 to honor it.

## Maintenance notes

- Plan 013 (runner spike) consumes these fixtures; its design must state
  the `files` resolution rule this plan chose.
- Fixture defects are load-bearing: editing a fixture invalidates its
  case's expected_output — treat the pair as one unit in review.
- The shared roadmap fixture doubles as plan 011/012 raw material.
