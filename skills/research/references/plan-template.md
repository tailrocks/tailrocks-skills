# Handoff Plan Template

Every plan is written for an executor that has **zero context**: it has not seen
the proposal, the research, the other plans, or any prior conversation. It may be
a smaller or cheaper model, or you in a fresh session. Assume it is competent at
following explicit instructions and weak at filling gaps, recovering from
ambiguity, or knowing when to stop.

Four properties make a plan executable by a weaker model:

1. **Self-contained context** — everything needed is in the file: paths, code
   excerpts, conventions, commands.
2. **Explicit inputs** — every asset, credential, or decision the executor cannot
   derive is named up front, with a placeholder and a swap contract so a missing
   input never blocks progress.
3. **Verification gates** — every step ends with a command and its expected
   result. The executor never has to *judge* whether it succeeded.
4. **Hard boundaries and escape hatches** — an explicit out-of-scope list and
   "STOP and report" conditions instead of letting the model improvise when
   reality does not match the plan.

File naming: `proposals/<slug>/plans/NNN-short-slug.md`, numbered in recommended
execution order.

---

## Template

```markdown
# Plan NNN: <Imperative title — what will be true after this plan>

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in "STOP conditions" occurs, stop and report — do not
> improvise. When done, update this plan's status row in
> `proposals/<slug>/plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat <planned-at SHA>..HEAD -- <in-scope paths>`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1 | P2 | P3
- **Effort**: S | M | L
- **Risk**: LOW | MED | HIGH
- **Depends on**: plans/NNN-*.md (or "none")
- **Research basis**: ../research/00-summary.md and ../research/NN-*.md (the
  sourced evidence this plan rests on)
- **Planned at**: commit `<short SHA>`, <YYYY-MM-DD>

## Why this matters

2–5 sentences. The problem, its concrete cost, and what improves when this lands.
Written so the executor and a human reviewer understand the intent — intent is
what lets a correct judgment call happen when a detail is off.

## Inputs to provide

Everything the executor needs but cannot derive from the repo. For each: what it
is, why it is needed, and a **replacement contract** so a missing input never
blocks the build.

- `<INPUT_NAME>` — <what it is> (e.g. an API key for service X; a design token
  file; a decision on naming). Needed by step <N>.
  - If absent: use `<placeholder>` and <how the executor proceeds>; swap the real
    value later by <exact procedure>. Do NOT block waiting for it.

(If the plan needs no external inputs, write "None — fully self-contained.")

## Current state

The facts the executor needs, inlined — never "as discussed" or "see research":

- The relevant files, each with one line on its role:
  - `src/orders/api.ts` — order-list endpoint; contains the N+1 (lines 130–160)
- Excerpts of the code as it exists today (short, with `file:line` markers),
  enough that the executor can confirm it is looking at the right thing.
- The repo conventions that apply here, with a pointer to one exemplar file:
  "Error handling follows the Result pattern — see `src/lib/result.ts` and its
  use in `src/users/api.ts:40-60`. Match it."
- Any documented vocabulary or design constraints the plan must honor, inlined
  from the research and intent docs. Quote the specific lines — the executor has
  not read those docs.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `<repo's install cmd>`   | exit 0              |
| Typecheck | `<repo's typecheck cmd>` | exit 0, no errors   |
| Tests     | `<repo's test cmd>`      | all pass            |
| Lint      | `<repo's lint cmd>`      | exit 0              |

(Exact commands from this repo — verified during research, not guessed.)

## Scope

**In scope** (the only files you should modify):
- `src/orders/api.ts`
- `src/orders/api.test.ts` (create)

**Out of scope** (do NOT touch, even though they look related):
- `src/orders/legacy-api.ts` — deprecated path; changing it wastes effort and
  risks the v1 clients still pinned to it.
- Any change to the public response shape — clients depend on it.

## Git workflow

(Filled from research — match the repo's observed conventions.)

- Branch: `<repo's branch-naming convention, or a sensible default>`
- Commit per step or per logical unit; message style: <match repo — include an
  example from `git log`>
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: <imperative title>

What to do, precisely. Reference exact files and symbols. Include the target code
shape when it is load-bearing (the pattern to produce, not necessarily every
line).

**Verify**: `<command>` → <expected output>

### Step 2: ...

(Each step small enough to verify independently. Order steps so the codebase is
never broken between them — e.g. add the new path, switch callers, then remove
the old path.)

## Test plan

- New tests to write, in which file, covering which cases (happy path, the
  specific behavior/regression this plan targets, named edge cases).
- Which existing test to use as the structural pattern: "model after
  `src/users/api.test.ts`".
- Verification: `<test command>` → all pass, including the N new tests.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `<typecheck cmd>` exits 0
- [ ] `<test cmd>` exits 0; new tests for <X> exist and pass
- [ ] `grep -rn "<old pattern>" src/` returns no matches
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `proposals/<slug>/plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" does not match the excerpts (the
  codebase has drifted since this plan was written).
- A step's verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file.
- You discover the assumption "<key assumption>" is false.
- A required input from "Inputs to provide" is missing and has no replacement
  contract.

## Maintenance notes

For the human or agent who owns this code after the change lands:

- What future changes will interact with this.
- What a reviewer should scrutinize in the PR.
- Any follow-up explicitly deferred out of this plan (and why).
```

---

## Quality bar — check before finishing each plan

- Could a model that has never seen this repo execute this with only the plan file
  and the repo? If any step needs knowledge from the research session, inline it.
- Inlined only what a zero-context executor needs — an excerpt plus `file:line`,
  not the whole file. Self-contained, not bloated: over-copying costs tokens on
  every read and hides the load-bearing lines.
- Is every verification a command with an expected result, not a judgment ("make
  sure it works")?
- Does every step name exact files and symbols, not "the relevant module"?
- Is every external input named in "Inputs to provide" with a replacement
  contract, so a missing asset never stalls the build?
- Are the STOP conditions specific to this plan's actual risks, not boilerplate?
- Would a reviewer reading only "Why this matters" + "Done criteria" understand
  what they are approving?
- No secret values anywhere — locations and credential types only.
- "Planned at" SHA is filled in and the in-scope paths in the drift check match
  the Scope section.

Credit: the structure of this template is adapted from the shadcn `improve`
skill's handoff plan template, retargeted to the per-idea proposal folder and
extended with an explicit "Inputs to provide" contract.
