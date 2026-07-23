# Plan 008: Verify four external-tool claims, then fix what fails

> **Executor instructions**: This is an INVESTIGATE plan: verify each
> claim against the primary source, record the verdict, then apply the
> fix only where the claim is confirmed false. Run every verification
> command and record its output. If anything in "STOP conditions" occurs,
> stop and report. When done, update this plan's status row in
> `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat f2c4be5..HEAD -- skills/tailrocks-tanstack-project-setup skills/tailrocks-code-health/templates/renovate.json skills/tailrocks-code-health/references/versions-and-dependencies.md`
> On any change, compare excerpts before editing; mismatch = STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW (each fix is a small config/prose change, applied only on
  confirmed evidence)
- **Depends on**: none (file overlap with plan 007 is zero)
- **Category**: bug (LOW-confidence — investigate first)
- **Planned at**: commit `f2c4be5`, 2026-07-23

## Why this matters

Four claims in shipped templates/guidance could not be confirmed from the
repo alone and, if wrong, silently break scaffolded projects: a CI
command that may not exist, a Vite option that may be a no-op, a shadcn
style token that may be rejected, and two Renovate keys that may be
ignored. Each needs one primary-source check; guessing is what the house
rules forbid.

## Current state

Verified in-repo at `f2c4be5` (the *claims* are verified present; their
*truth* is what this plan tests):

1. **`bun ci`** — `skills/tailrocks-tanstack-project-setup/references/tooling-and-quality.md:6`
   "Use `bun ci` in CI; lockfile drift fails." and :39 "After `bun ci`,
   run `format:check`, …". `SKILL.md` final gate also names `bun ci`.
   `templates/package.json` defines no `ci` script, so this must be a Bun
   builtin. Known Bun form: `bun install --frozen-lockfile`; whether
   `bun ci` exists as an alias in Bun 1.3.x is the question.
2. **`resolve.tsconfigPaths`** — `skills/tailrocks-tanstack-project-setup/templates/vite.config.ts:7-9`:
   ```ts
   resolve: {
     tsconfigPaths: true,
   },
   ```
   Not a documented Vite `resolve` option historically; aliasing normally
   needs the `vite-tsconfig-paths` plugin or `resolve.alias`. The
   TanStack Start plugin may or may not register tsconfig paths itself.
   `templates/tsconfig.json` defines `"@/*": ["./src/*"]`.
3. **shadcn style `"base-nova"`** — `skills/tailrocks-tanstack-project-setup/templates/components.json:3`
   `"style": "base-nova"`; `references/shadcn-ui.md:6` mentions honoring
   "base (`radix`/`base`)" though components.json has no `base` field.
   Historic styles were `default`/`new-york`.
4. **Renovate keys** — `skills/tailrocks-code-health/templates/renovate.json:5-7`
   `"vulnerabilityAlerts": { "vulnerabilityFixStrategy": "highest" }` and
   :14-19 `"matchManagers": ["rust-toolchain"], "matchDepTypes":
   ["toolchain"]`. `references/versions-and-dependencies.md:5` and
   `skills/tailrocks-rust-project-setup/references/version-policy.md:41`
   claim Renovate tracks Rust toolchains natively.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Bun subcommand check | `bun ci --help` (and `bun --help \| grep -i ci`) | exists or errors |
| Bun docs | WebFetch https://bun.com/docs/cli/install (or current docs URL) | frozen-lockfile guidance |
| Vite docs | WebFetch https://vite.dev/config/shared-options (resolve section) | option list |
| TanStack Start source | WebFetch the `@tanstack/react-start` plugin docs/repo | tsconfig-paths behavior |
| shadcn schema | WebFetch https://ui.shadcn.com/schema.json and shadcn CLI docs | valid style values |
| Renovate docs | WebFetch https://docs.renovatebot.com/modules/manager/ and configuration-options | manager list, vulnerabilityAlerts fields |
| Validate | `bun run scripts/validate-skills.ts` | exit 0 |

Record every verdict with its URL in this plan's report.

## Scope

**In scope** (modify only on a confirmed-false verdict):
- `skills/tailrocks-tanstack-project-setup/references/tooling-and-quality.md`
- `skills/tailrocks-tanstack-project-setup/SKILL.md` (final-gate `bun ci`
  wording only)
- `skills/tailrocks-tanstack-project-setup/templates/vite.config.ts`
- `skills/tailrocks-tanstack-project-setup/templates/package.json`
  (only if adding a `ci` script or the tsconfig-paths dev dependency)
- `skills/tailrocks-tanstack-project-setup/templates/components.json`
- `skills/tailrocks-tanstack-project-setup/references/shadcn-ui.md`
- `skills/tailrocks-code-health/templates/renovate.json`
- `skills/tailrocks-code-health/references/versions-and-dependencies.md`
- `skills/tailrocks-rust-project-setup/references/version-policy.md`
  (the "tracks toolchains natively" sentence only)

**Out of scope**:
- Everything plan 007 owns (resolver scripts, mise.toml, MSRV prose,
  panic policy, devtools pin).
- Version bumps unrelated to the four claims.

## Git workflow

- Branch: `advisor/008-external-claims-verification`.
- Conventional Commits, DCO (`git commit -s`); one commit per confirmed
  fix, none for confirmed-true claims. Main is PR-only; no push/PR unless
  instructed.

## Steps

### Step 1: Verify `bun ci`

Run `bun ci --help`. If it exists and means frozen-lockfile install:
record verdict TRUE, change nothing. If not: replace `bun ci` in
`tooling-and-quality.md` (:6, :39) and the SKILL.md final gate with
`bun install --frozen-lockfile` (or add `"ci": "bun install
--frozen-lockfile"` to the template scripts and reference `bun run ci` —
pick the form Bun's docs recommend and say which).

**Verify**: `grep -rn "bun ci" skills/tailrocks-tanstack-project-setup/`
→ 0 hits if verdict FALSE, unchanged if TRUE.

### Step 2: Verify `resolve.tsconfigPaths`

Check Vite's current shared-options docs and the TanStack Start plugin's
documented behavior. Verdicts: (a) real Vite option now → record TRUE,
done; (b) Start plugin handles tsconfig paths itself → remove the dead
`resolve` block, note "Start plugin resolves tsconfig paths" comment;
(c) neither → replace with the documented mechanism (`vite-tsconfig-paths`
plugin added to `plugins` and `devDependencies` at its current version,
resolved via the resolver script — record the version and source).

**Verify**: `bun -e 'await import("./skills/tailrocks-tanstack-project-setup/templates/vite.config.ts")'`
is NOT expected to run (template imports aren't installed here); instead
`grep -n "tsconfigPaths" skills/tailrocks-tanstack-project-setup/templates/vite.config.ts`
matches the chosen verdict's end-state.

### Step 3: Verify shadcn style `base-nova`

Fetch the shadcn components.json schema / CLI docs for the pinned CLI
line (`templates/package.json` scripts use `bunx --bun shadcn`). If
`base-nova` is a valid current style: record TRUE. If not: set the
documented default style and align `references/shadcn-ui.md:6`'s
base/`radix` sentence with the actual schema fields.

**Verify**: `grep -n "style" skills/tailrocks-tanstack-project-setup/templates/components.json`
→ a value the schema accepts (named in the report with source URL).

### Step 4: Verify the Renovate keys

Check Renovate's manager list for `rust-toolchain` and configuration
docs for `vulnerabilityAlerts.vulnerabilityFixStrategy`. For each: TRUE →
unchanged; FALSE → replace with the documented mechanism (e.g. a
`customManagers` regex entry for `rust-toolchain.toml`; the correct
vulnerability-strategy key) and soften the two "tracks natively" prose
claims to match reality.

**Verify**: `bun -e 'JSON.parse(await Bun.file("skills/tailrocks-code-health/templates/renovate.json").text()); console.log("ok")'`
→ `ok`; prose claims match the verdict.

### Step 5: Validate and report

**Verify**: `bun run scripts/validate-skills.ts` → exit 0. Report all
four verdicts (TRUE/FALSE + URL + what changed).

## Test plan

This plan's product is verified verdicts + minimal fixes. Machine checks:
JSON validity (step 4), grep end-states (steps 1–3), validator (step 5).
No scaffold is built here — note in the report that a real `bun create`
smoke test of the template remains future work for plan 013's harness.

## Done criteria

- [ ] Four verdicts recorded, each with a primary-source URL
- [ ] Every FALSE verdict has its fix applied; every TRUE verdict left
      untouched
- [ ] `bun run scripts/validate-skills.ts` exits 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `advisor-plans/README.md` status row updated (include verdict
      summary in the row note)

## STOP conditions

Stop and report back if:

- Primary sources are unreachable (offline) — record which checks ran.
- A verdict is genuinely ambiguous (docs contradict behavior) — report
  both sources; do not pick silently.
- A fix requires bumping unrelated pinned versions — report instead.

## Maintenance notes

- These four claims rot with upstream releases; the INSTALL.md re-check
  cadence (plan 010) should name them.
- Reviewer focus: verify the report's URLs actually support each verdict
  — this plan exists because unverified claims shipped once already.
