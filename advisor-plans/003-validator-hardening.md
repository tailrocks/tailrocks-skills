# Plan 003: Make the validator enforce the documented contract

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on.
> If anything in "STOP conditions" occurs, stop and report. When done,
> update this plan's status row in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- scripts/validate-skills.ts README.md CLAUDE.md .kimi-plugin/plugin.json`
> On any change, compare "Current state" excerpts against live files; on a
> mismatch, treat as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (validator rewrite can produce false failures across 14
  skills; every new check must pass on the current tree after the in-repo
  fixes in steps 5–6)
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

`scripts/validate-skills.ts` is the repo's only automated gate, and its
highest-value check is a false-pass: every SKILL.md writes `description`
as a YAML folded scalar (`description: >-`), and the validator's line
regex captures the literal string `>-` — so the documented ≤1024-char
limit and the guard-sentence rule are never checked. Several other
documented house rules (INSTALL.md rules 5–7, AGENTS.md steps 1–5) have
no check at all. Two live drifts prove it: the README layout tree omits
`tailrocks-remediate`, and the kimi manifest description diverged from the
other four.

## Current state

All excerpts verified at commit `f2c4be5`.

- `scripts/validate-skills.ts` (139 lines, Bun, no deps):
  - Lines 13–16: `field()` uses `^${name}:\\s*(.+)$` per line — on
    `description: >-` (all 14 skills) it returns `">-"`.
  - Line 47: `if (!description || description.length > 1024)` — passes
    trivially on `">-"` (length 2). Guard sentence never checked.
  - Lines 57–58: openai check is `^policy:\n\s+allow_implicit_invocation:\s+false$`
    plus `openai.includes("$" + directory)` — the latter matches anywhere,
    not specifically `default_prompt`.
  - Lines 61–65: markdown link scan on SKILL.md only; resolves `../`
    targets happily (rule 7 ban unenforced); `references/*.md` files never
    scanned for links.
  - Lines 80–84: evals check = `skill_name` match + `evals.length >= 3`;
    per-case shape (`id`/`prompt`/`expected_output`/`files`) unchecked.
  - Lines 90–92: forbidden package-manager scan runs on SKILL.md lines
    only (`^\s*(?:npm|npx|pnpm|yarn)`), not references/ or templates/.
  - Lines 116–118: version lockstep — checked (works).
  - Lines 128–131: catalog loop covers `["README.md", "AGENTS.md"]` only —
    CLAUDE.md's list (CLAUDE.md:12–17) unguarded. Manifest description
    equality unchecked.
- Documented contract the validator should enforce:
  - INSTALL.md:275–277 (rule 5): description ≤1024 chars, starts with the
    explicit-request guard sentence. All 14 descriptions currently start
    with "Use only when the user explicitly requests this skill."
  - INSTALL.md:282–284 (rule 7): reference paths relative to the skill
    directory — no `../` escapes (plugin cache breaks them).
  - AGENTS.md:156–166: openai.yaml with policy, evals with ≥3 realistic
    cases, references linked, README + AGENTS tables updated.
- Live drift to fix so new checks pass:
  - `README.md` repository-layout tree (lines ~115–186) lists 13 skill
    dirs; `tailrocks-remediate/` absent (`grep -n remediate README.md` →
    only line 24, the table). The tree also shows `references/` and
    `agents/` per skill but omits `evals/` everywhere, and omits
    `scripts/` under the two setup skills.
  - `.kimi-plugin/plugin.json` description contains "correctness-first
    remediation"; `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`,
    root `plugin.json`, and the marketplace entry omit it (verified:
    claude + marketplace read directly — both end "…TanStack, code-health
    ratchets, and the roadmap delivery pipeline (…)").

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Run validator | `bun run scripts/validate-skills.ts` | exit 0, `Validated 14 skills.` |
| Negative test | (step 7 fixtures) | exit 1 with named errors |

Bun via mise; if not on PATH use `~/.local/share/mise/installs/bun/*/bin/bun`.

## Scope

**In scope**:
- `scripts/validate-skills.ts`
- `README.md` (layout tree only)
- `CLAUDE.md` (only if the catalog check requires text normalization)
- `.kimi-plugin/plugin.json`, `.codex-plugin/plugin.json` (description
  equality — pick the canonical string, see step 6)
- `scripts/validate-skills.test.ts` (create)

**Out of scope**:
- Any SKILL.md content (plans 001/002/006/009 own those).
- `.github/` workflow — plan 004.
- Eval case content — plan 005.

## Git workflow

- Branch: `advisor/003-validator-hardening`.
- Conventional Commits, DCO (`git commit -s`). Main is PR-only; do NOT
  push or open a PR unless instructed.

## Steps

### Step 1: Parse frontmatter properly

Replace `field()`'s per-line regex with real YAML handling for the
frontmatter block. Bun ships `Bun.YAML.parse` (available since 1.2;
verify with `bun --version` ≥ 1.3). Parse `block[1]`, read `name`,
`description`, `license`, `disable-model-invocation`, `user-invocable`
from the object. Folded scalars now resolve to full text.

**Verify**: temporarily `console.log(description.length)` for one skill →
a realistic length (> 100), then remove the log.
`bun run scripts/validate-skills.ts` → exit 0.

### Step 2: Enforce description rules for real

After step 1: keep the ≤1024 check (now meaningful) and add: description
must start with the exact guard sentence "Use only when the user
explicitly requests this skill." (error otherwise).

**Verify**: `bun run scripts/validate-skills.ts` → exit 0 on current tree.

### Step 3: Enforce link rules

- Reject any SKILL.md link target starting with `../` or resolving
  outside the skill directory (`path.resolve` + prefix check against
  `skillDir + path.sep`).
- Extend the same link scan (existence + no-escape) to every
  `references/*.md` file. Exception: allow `../` inside fenced code
  blocks and template literals only if implementing that distinction is
  trivial; otherwise scan raw and fix any template hits by exempting
  lines inside triple-backtick fences (the roadmap-item template at
  `skills/tailrocks-idea/references/roadmap-item-format.md:93` contains a
  `../../research/` link inside a fenced template — it must NOT fail).

**Verify**: `bun run scripts/validate-skills.ts` → exit 0 on current tree.

### Step 4: Tighten sidecar, evals, and PM checks; add CLAUDE.md catalog

- openai.yaml: parse YAML; assert `interface.display_name`,
  `interface.short_description`, `interface.default_prompt` present and
  that `default_prompt` (specifically) contains `$<directory>`.
- evals: assert every case has non-empty string `prompt` and
  `expected_output`, numeric `id`, array `files`.
- Package-manager scan: extend to `references/*.md` and `templates/*`
  files, and drop the line-start anchor (match `(?:^|[\s$(`])(?:npm|npx|pnpm|yarn)\s`),
  keeping an allowlist for prose that *names* the tools without invoking
  them (e.g. INSTALL/AGENTS-style mentions inside skills, "No alternative
  package managers"). If the allowlist grows past ~5 patterns, scope the
  check to fenced code blocks only — report which choice you made.
- Catalog loop: add `"CLAUDE.md"`.

**Verify**: `bun run scripts/validate-skills.ts` → exit 0 on current tree
(after step 5 fixes any true positives it finds; report each one it
flags before fixing).

### Step 5: Fix the README layout tree

Add to the tree (README.md ~115–186): `tailrocks-remediate/` entry
(SKILL.md, references/, agents/ — it has no templates/), an `evals/` line
under the first skill entry with a `# per-skill evals (all skills)`
comment or add `evals/` to each listed skill consistently, and
`scripts/` under the two setup skills. Keep alphabetical/tree order
consistent with the existing listing style.

**Verify**: `grep -n "tailrocks-remediate/" README.md` → 1 hit inside the
tree block; validator exit 0.

### Step 6: Manifest description equality

Add a validator check: the `description` field must be byte-identical
across `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`,
`.kimi-plugin/plugin.json`, root `plugin.json`, and the marketplace
entry. Canonical string: the current `.claude-plugin/plugin.json` text —
"Cross-agent Tailrocks skills for strict Rust, Axum, TypeScript,
TanStack, code-health ratchets, and the roadmap delivery pipeline (idea,
brainstorm, research, record-decision, finalize, plan, reconcile, /goal
handoff)". Update `.kimi-plugin/plugin.json` (remove "correctness-first
remediation, ") and any other divergent field (check codex
`interface.longDescription` — if the validator can't reasonably assert
optional long fields, scope the check to `description` only and say so).

**Verify**: `bun run scripts/validate-skills.ts` → exit 0.

### Step 7: Self-test the validator

Create `scripts/validate-skills.test.ts` (bun:test): build a temp
directory fixture with (a) a valid minimal skill that passes, and broken
variants: (b) description missing guard sentence, (c) overlong
description, (d) `../` link, (e) evals with 2 cases, (f) evals case
missing `expected_output`, (g) mismatched manifest description. Refactor
`validate-skills.ts` minimally to export a `validate(root): string[]`
function (keep the CLI entry working via `import.meta.main`).

**Verify**: `bun test scripts/validate-skills.test.ts` → all pass
(≥ 7 tests); `bun run scripts/validate-skills.ts` → exit 0,
`Validated 14 skills.`

## Test plan

- The new `scripts/validate-skills.test.ts` is the test suite: one
  positive fixture, six negative fixtures (list in step 7), each
  asserting the specific error string.
- Model the test style on bun:test defaults (no existing test files in
  this repo to imitate).

## Done criteria

- [ ] `bun run scripts/validate-skills.ts` exits 0, `Validated 14 skills.`
- [ ] `bun test scripts/validate-skills.test.ts` exits 0 with ≥ 7 passing tests
- [ ] Deliberately corrupting one description (add 1100 chars locally,
      revert after) makes the validator exit 1 — spot-check performed and
      reverted
- [ ] `grep -n "tailrocks-remediate/" README.md` → 1 hit in the tree
- [ ] All five manifest descriptions byte-identical
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `Bun.YAML` is unavailable in the installed Bun — report the version;
  do not add an npm dependency without saying so first (repo has no
  package.json; adding one is a structural decision).
- Step 4's PM scan flags more than ~10 true positives across
  references/templates — that volume suggests the rule needs a policy
  decision, not a bigger allowlist.
- Any new check fails on the current tree for a reason not listed in
  steps 5–6 — report the finding; it may be a real drift worth its own
  fix.

## Maintenance notes

- Plan 004 wires this validator into CI; land 003 first.
- Future skill additions: the guard-sentence and description checks now
  bite — AGENTS.md "Adding a Skill" flow stays accurate.
- Reviewer focus: the fenced-code exemption in step 3 (don't let it
  swallow real escapes) and the PM-scan allowlist (don't let it
  neutralize the rule).
