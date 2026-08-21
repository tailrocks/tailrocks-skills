# Plan 001: Brand every skill surface

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. If a
> STOP condition occurs, stop and report; do not improvise. When done, update
> the status row for this plan in `advisor-plans/README.md`.
>
> **Drift check (run first)**:
> `rtk git diff --stat 13a5ee5..HEAD -- 'skills/*/agents/openai.yaml' 'skills/*/README.md' scripts/validate-skills.ts scripts/validate-skills.test.ts scripts/generate-docs.ts scripts/generate-docs.test.ts INSTALL.md 'docs/content/docs/skills/*/index.mdx' 'docs/content/docs/skills/*/definition.mdx' docs/content/docs/install.mdx`
> If any in-scope file changed, compare the current-state excerpts below with
> live code before proceeding. A load-bearing mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx
- **Planned at**: commit `13a5ee5`, 2026-08-20

## Why this matters

Stable skill IDs already carry `tailrocks-*`, but all 37 Codex-facing display
labels omit the brand. Generic labels such as “Plan”, “Research”, and “Review
PR” are ambiguous beside unrelated installed skills. Generated documentation
titles have the same defect. This plan makes `Tailrocks: ` a checked invariant
without renaming any skill ID or changing invocation syntax.

## Current state

- Every shipped directory and `SKILL.md` frontmatter name is already
  `tailrocks-*`; preserve that compatibility surface.
- `skills/tailrocks-idea/agents/openai.yaml:2` says:

  ```yaml
  display_name: "Idea"
  ```

- `skills/tailrocks-plan/agents/openai.yaml:2` says:

  ```yaml
  display_name: "Plan"
  ```

- The same unbranded pattern exists in all 37 `agents/openai.yaml` files.
- `scripts/validate-skills.ts:158-163` checks only directory equality and a
  generic kebab-case name. It does not require `tailrocks-`.
- `scripts/validate-skills.ts:197-207` checks that Codex interface strings are
  nonempty and that the default prompt names `$<directory>`; it does not check
  the display-label prefix.
- `scripts/validate-skills.test.ts:6-40` deliberately creates
  `sample-skill` with `display_name: Sample`, and the valid-fixture test accepts
  it.
- `scripts/generate-docs.ts:121-123` derives a bare title from the skill H1.
  `renderSkillOverview` writes that bare value to frontmatter.
- `scripts/generate-docs.test.ts:118-145` currently asserts
  `title: Rethink` for the generated `tailrocks-rethink` page.
- `scripts/generate-docs.ts:218-224` renders every generated skill README with
  a bare `# ${skill.title}` H1; `skills/tailrocks-rethink/README.md:3` is
  currently `# Rethink`.
- `scripts/generate-docs.ts:272-280` gives every generated definition page the
  generic primary title `Skill definition`, so that subpage also omits the
  Tailrocks identity.
- Codex documents `interface.display_name` as the user-facing name in
  `agents/openai.yaml`: <https://learn.chatgpt.com/docs/build-skills>.
- Repository law: shared `SKILL.md` bodies stay agent-neutral. Do not add
  branding prose to their bodies; use metadata and generated UI titles.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Targeted validator tests | `rtk bun test scripts/validate-skills.test.ts` | all tests pass |
| Targeted docs tests | `rtk bun test scripts/generate-docs.test.ts` | all tests pass |
| Regenerate docs | `rtk mise run docs` | generated files updated, exit 0 |
| Validate skills | `rtk mise run lint` | validator reports all skills valid |
| Full test suite | `rtk mise run test` | all tests pass |
| Format check | `rtk mise run fmt` | exit 0 |
| Full CI contract | `rtk mise run ci` | exit 0 |

## Scope

**In scope** — only these files/patterns may change:

- `skills/*/agents/openai.yaml` — all 37 Codex display labels.
- `scripts/validate-skills.ts`
- `scripts/validate-skills.test.ts`
- `scripts/generate-docs.ts`
- `scripts/generate-docs.test.ts`
- `INSTALL.md`
- Generated `skills/*/README.md`
- Generated `docs/content/docs/skills/*/index.mdx`
- Generated `docs/content/docs/skills/*/definition.mdx`
- Generated `docs/content/docs/install.mdx`
- `advisor-plans/README.md` status row

**Out of scope**:

- Skill directory names and `SKILL.md` `name` values — they are already the
  stable, correct canonical IDs.
- Skill H1 headings and body prose — shared source stays agent-neutral and
  concise.
- Invocation adapters in `docs/src/lib/agents.ts` — all already preserve the
  canonical `tailrocks-*` identifier.
- Plugin/package names and versions — manifests are already Tailrocks-branded;
  this is not a release change by itself.

## Git workflow

- Branch: `advisor/001-tailrocks-brand-surfaces` when executed separately; if
  executing this package on one implementation branch, follow repository law.
- Commit message: `fix(skills): brand every skill surface`.
- Commit with `git commit -s` and add
  `Co-authored-by: Codex <codex@openai.com>`.
- Do not push or open a PR unless the operator requests it.

## Steps

### Step 1: Establish the red bar

Before editing production files, change the temporary validator fixture from
`sample-skill` to `tailrocks-sample-skill`, keep its display name unbranded,
and add two regression tests:

1. an otherwise-valid skill whose name/directory lacks `tailrocks-` is
   rejected;
2. an otherwise-valid sidecar whose `display_name` lacks `Tailrocks: ` is
   rejected.

Update `scripts/generate-docs.test.ts` to expect the overview title
`Tailrocks: Rethink`. Run both targeted suites before production edits and
record that the new assertions fail for the expected reasons. This is the
required baseline failure for a behavioral skill-system change.

**Verify**:
`rtk bun test scripts/validate-skills.test.ts scripts/generate-docs.test.ts`
→ nonzero; failures mention the missing name/display prefix and bare generated
title, not syntax or fixture setup errors.

### Step 2: Enforce canonical IDs and Codex display labels

In `scripts/validate-skills.ts`:

- require every shipped skill directory/frontmatter name to start with exact
  lowercase `tailrocks-` after the existing equality check;
- require every `interface.display_name` to match `^Tailrocks: \\S`;
- emit stable, specific errors naming the violated field.

Update the valid test fixture to use `tailrocks-sample-skill` and
`display_name: Tailrocks: Sample`. Keep negative fixtures narrowly scoped so a
test fails for only the invariant it names.

**Verify**: `rtk bun test scripts/validate-skills.test.ts` → all pass.

### Step 3: Migrate every Codex label

Prefix the existing human-readable suffix in all 37
`skills/*/agents/openai.yaml` files with exact `Tailrocks: `. Examples:

```yaml
display_name: "Tailrocks: Idea"
display_name: "Tailrocks: Plan"
display_name: "Tailrocks: Rust Best Practices"
```

Do not modify `short_description`, `default_prompt`, policy, IDs, or filenames.
Then count and validate the migration.

**Verify**:

```sh
test "$(rtk rg -l '^  display_name: "Tailrocks: ' skills/*/agents/openai.yaml | wc -l | tr -d ' ')" = "$(rtk rg -l '^name: tailrocks-' skills/*/SKILL.md | wc -l | tr -d ' ')"
rtk mise run lint
```

→ both commands exit 0; counts are equal and the validator reports every skill
valid.

### Step 4: Brand every generated per-skill title

Keep `Skill.title` and the source H1 bare for prose use. In
`renderSkillOverview`, serialize the frontmatter title as
`Tailrocks: ${skill.title}` using JSON/YAML-safe quoting; a raw colon in
unquoted YAML is not acceptable. In `renderReadme`, render
`# Tailrocks: ${skill.title}`. In `renderSkillDefinition`, render a specific
frontmatter title such as `Tailrocks: ${skill.title} — Skill definition`, also
quoted safely. Update generator regression tests for all three surfaces and
retain the existing assertion that `<Invoke skill="tailrocks-rethink"` uses
the canonical ID.

Run the docs generator. Do not hand-edit generated MDX.

**Verify**:

```sh
rtk bun test scripts/generate-docs.test.ts
rtk mise run docs
rtk mise run docs:check
```

→ all pass; every generated skill overview, definition page, and skill README
begins with a branded primary title.

### Step 5: Document the invariant

In the Codex section of `INSTALL.md`, state:

- canonical skill IDs and invocations remain `tailrocks-*`;
- Codex display labels use `Tailrocks: <label>`;
- validation rejects unbranded names and labels.

Do not claim that non-Codex clients consume `agents/openai.yaml`; their visible
identity comes from canonical IDs and invocation adapters. Regenerate docs
because `docs/content/docs/install.mdx` is derived from `INSTALL.md`.

**Verify**:

```sh
rtk mise run docs
rtk mise run docs:check
```

→ both commands exit 0.

### Step 6: Run the repository gates

Run the full fixed task contract and inspect the final diff for accidental
skill-body or ID changes.

**Verify**:

```sh
rtk mise run lint
rtk mise run test
rtk mise run fmt
rtk mise run ci
rtk git diff --check
rtk git diff --name-only
```

→ all gates exit 0; changed paths are only those allowed by Scope.

## Test plan

- `scripts/validate-skills.test.ts`:
  - accepts `tailrocks-sample-skill` + `Tailrocks: Sample`;
  - rejects a canonical name without `tailrocks-`;
  - rejects an empty suffix (`Tailrocks: `);
  - rejects an unbranded display label;
  - preserves the existing `$tailrocks-sample-skill` default-prompt rule.
- `scripts/generate-docs.test.ts`:
  - generated overview title is YAML-safe `Tailrocks: Rethink`;
  - generated definition title is YAML-safe and begins `Tailrocks: Rethink`;
  - generated skill README H1 is `# Tailrocks: Rethink`;
  - invocation still contains `tailrocks-rethink`;
  - the shared `SKILL.md` body H1 remains bare.
- Existing generator drift check proves all 37 generated pages match.

## Done criteria

- [ ] Every shipped skill ID begins with `tailrocks-` and validator tests make
      the invariant fail closed.
- [ ] Every `agents/openai.yaml` display name begins with exact `Tailrocks: `.
- [ ] Every generated skill overview, definition page, and skill README has a
      primary title beginning with `Tailrocks: `.
- [ ] No skill directory, canonical ID, invocation string, short description,
      default prompt, or body was renamed merely for presentation.
- [ ] `rtk mise run lint`, `test`, `fmt`, and `ci` all exit 0.
- [ ] `rtk git diff --check` exits 0.
- [ ] No file outside Scope changed, excluding the permitted status-row update.
- [ ] `advisor-plans/README.md` marks plan 001 `DONE`.

## STOP conditions

- A shipped client is found to expose neither the canonical ID nor the Codex
  `display_name`; add evidence to plan 003 instead of inventing another body
  label here.
- Any existing consumer depends on an unbranded `display_name` value as a
  machine identifier. Report the consumer and preserve stable IDs.
- The docs generator cannot serialize a colon-bearing title without changing
  shared source H1s.
- A new skill appears after the planned-at SHA and its sidecar/title behavior
  cannot be reconciled with the same invariant.
- A verification fails twice after a reasonable correction.

## Maintenance notes

- Review future skills for three distinct surfaces: canonical ID,
  client-specific display label, generated docs title.
- Do not weaken the validator to permit mixed separators or optional branding;
  one exact convention prevents drift.
- Model-routing changes in later plans must consume canonical IDs, never display
  labels.
