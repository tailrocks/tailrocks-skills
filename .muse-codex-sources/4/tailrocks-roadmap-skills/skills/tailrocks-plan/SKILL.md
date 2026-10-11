---
name: tailrocks-plan
description: >-
  Converts a READY roadmap item into roadmap/<slug>/plan/ and goal/: a
  coverage ledger, a research-gap manifest, an OpenSpec-grammar spec,
  one zero-context plan per work item, and the goal handoff. Use only
  when the user explicitly requests this skill with a READY item. Do
  not use on unshaped items or on one-session changes.
argument-hint: "<roadmap-slug> [additional context] [--deep]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Plan

## Use this skill

This skill turns one READY roadmap item into everything that an
autonomous executor needs. Product intent traces
statement-by-statement into requirements. Requirements trace
into self-contained plans. The `goal/START.md` block fronts the
package for the user to hand to a goal loop. File paths, code
shapes,
verification commands, and a loop protocol survive fresh
sessions there. A host with no goal loop consumes the same
blocks as manual prompts.

One item fills one folder: `roadmap/<slug>/plan/` (hub, plans,
`spec/`, `coverage.md`) and `roadmap/<slug>/goal/` (`START.md`,
`RESUME.md`, `check.sh`). Several items need an explicit
request, recorded as the exception.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit and one push for
the plan package on the delivery branch of the item.

Read these references before any action:

- [`coverage-ledger.md`](references/coverage-ledger.md) gives
  the ID inventory and the traceability spine.
- [`research-gap-manifest.md`](references/research-gap-manifest.md)
  gives the closed gap manifest.
- [`spec-format.md`](references/spec-format.md) gives the
  requirement grammar and the registries.
- [`plan-template.md`](references/plan-template.md) gives the
  plan shape, the writer and reviewer briefs, and the quality
  bar.
- [`goal-handoff.md`](references/goal-handoff.md) gives the hub
  and the goal package.
- [`execution-roles.md`](references/execution-roles.md) gives
  the role predicates for each assignment.
- [`roadmap-item-format.md`](references/roadmap-item-format.md)
  gives the item sections and the status values.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the lane, commit, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Write only under `roadmap/<slug>/plan/`,
`roadmap/<slug>/goal/`, and the status, Plan link, and `## Run`
section of the item. Never write
`roadmap/<slug>/verification/`. Rounds belong to the skills
that capture reported defects and prove shipped work. Keep
source, configuration, and dependencies unchanged. Never
implement. The package is the deliverable.

Require `READY`. Otherwise name the missing stage and stop.
Record deferrals through the owning shaping skill, then retry
only after it grants `READY`. The Decisions, Vocabulary, and
Must not of the item are fixed constraints. Repository
reality that contradicts them is surfaced, never silently
resolved.

Apply the evidence standard everywhere: URL, `file:line`, or
method. Commands written into plans, gates, and done criteria
come from the verification-tooling research and **ran once
during planning**. A package, target, or path that never
resolves is a planning defect.

Planning never writes reusable research. Unresolved evidence
turns into the plan-owned manifest from the gap reference.
Then planning stops and routes that manifest to
`tailrocks-research`.

Refresh a current `plan/` in place, never duplicate it. The
re-run rules live in the plan template reference. Subagents
inherit nothing: every brief restates its rules, and one
plan-writer subagent writes exactly one plan, never two.
Clone reference projects into a disposable directory outside
the repository, read-only, cited as `file:line` plus
repository URL and commit.

## Procedure

1. **Ingest.** Read the roadmap item end to end, then the
   coverage ledger reference. Fold in additional context from
   the invocation. Write `roadmap/<slug>/plan/coverage.md`.
   Give every screen, capability, flow, must-not, entry
   point, reference, assumption, and open research question
   an ID. Map every normative statement in the item to one.

2. **Resolve research gaps.** Read linked research read-only.
   Derive the missing planning evidence. Get platform facts,
   integration seams, and reference-project practice. Get
   exact build, test, and lint commands for the target stack.
   Write or deterministically refresh
   `roadmap/<slug>/plan/research-gaps.json` per the gap
   manifest reference. When any gap is open, stop without
   setting `PLANNED` and route the manifest to
   `tailrocks-research`. That skill alone writes and indexes
   reusable research. On rerun, reconcile gaps in ID order
   against the named evidence of the manifest. Never infer
   resolution from prose and never create a second manifest.
   With `--deep`, add completeness-critic findings as new gap
   rows until one round adds none.

3. **Write the spec.** Read the spec format reference. Write
   `roadmap/<slug>/plan/spec/README.md` with capability
   index, must-not registry, entry-point registry, and
   deferrals. Write one capability file per area:
   requirements with scenarios, screen contracts per mockup.
   Snapshot the `## Decisions` body of the item verbatim
   into `plan/spec/decisions.md`. Strip blank lines per the
   format reference. Then a decision that moves under the
   package trips `check.sh` as `decisions-drift`. **A screen
   with a visual surface and no blessed design reference
   stops planning here.** State the screens, name the design
   skill of the medium, and let the user run it or record
   the deferral. A schematic mockup is layout intent, never
   pixel truth.

4. **Slice the manifest.** Decompose the spec into ordered,
   never-broken increments. Use vertical tracer-bullet
   slices. Each slice runs through a complete, independently
   verifiable path through every layer that it touches. Size
   each slice to one fresh executor session. Never slice one
   layer across the whole surface. Wide refactors use
   expand-contract. Expand the new form. Migrate call sites
   in batches that keep the build green. Contract the old
   form last. Greenfield chains start slice 001 with the
   verification baseline. Task runner, build, test, and lint
   gates stand green on an empty skeleton. Start this slice
   before any feature slice. The goal gates and every later
   precondition reference only tooling that an earlier slice
   guarantees. For current repositories with working gates,
   note the proven commands instead. Keep slice scopes
   disjoint wherever the design allows. Non-overlapping
   in-scope path sets are the condition where the executor
   protocol runs concurrently. Record every unavoidable
   overlap in the Dependency notes of the hub as a forced
   sequence. Write `roadmap/<slug>/plan/README.md` first.
   It holds manifest table, one-line item briefs, the repo
   law that binds every plan, dependency notes, and executor
   protocol. Copy `assets/check.sh` to
   `roadmap/<slug>/goal/check.sh` per the goal handoff
   reference.

5. **Write plans through subagents.** Read the plan template
   reference with its writer brief. Read the execution roles
   reference for the assignment of each work part. Dispatch
   one subagent per manifest item, parallel where
   dependencies allow, each producing
   `roadmap/<slug>/plan/NNN-<slug>.md`. A plan that asks its
   executor to choose an architecture is not a
   `bounded-executor` plan. That decision stays with
   `frontier-judgment` and settles before the plan ships.
   Verify each returned plan per the verifier brief of the
   template. Use a fresh-context, read-only
   `independent-verifier`, blind to the reasoning of the
   writer. It opens every cited source and reports excerpt
   mismatches. On any reported mismatch the orchestrator
   re-opens the sources of that plan and re-verifies all of
   them. With no fresh context available, record the
   assurance as `DEGRADED`, name the missing independence
   property, and never set `PLANNED`. After each accepted
   plan, the orchestrator backfills the Plans columns of the
   ledger and the must-not and entry-point registries.
   Writer subagents never touch shared files. Record every
   named command in the command-proof table of the hub.
   Runnable commands ran once during planning with a
   positive unit count from their dedicated proof command.
   Legitimately dependency-blocked commands name the
   enabling slice and record an executed precondition that
   proves the dependency absent. Invalid targets, missing
   paths, unresolved packages, and commands without positive
   proof are planning defects, never dependency blocks.

6. **Cold review and gate.** Fresh-context, read-only
   reviewers read each plan with only the plan file and the
   repository. Fix every reported gap. Then run the
   traceability gate with a fresh-context, read-only checker
   over the ledger, spec, and plans. Cover every
   requirement. Inline every must-not in each plan that it
   tempts. Give every entry point an owning plan and an
   end-to-end test. Back every dependency edge with a
   precondition check. It reports uncovered IDs and missing
   edges. The orchestrator fixes them and re-runs the gate.
   Run inline when parallel agents are unavailable.

7. **Write the goal handoff.** Per the goal handoff
   reference, write `roadmap/<slug>/goal/START.md` (the
   machine-checkable, gate-first goal condition, the gates
   block, the kickoff prompt) and
   `roadmap/<slug>/goal/RESUME.md`. Derive the current row or
   exact blocking state from the manifest by the protocol
   rules. Then stamp the frozen contract fingerprint of the
   hub. **Every gate line is `<command> ||| <proof>`.**
   The proof prints the executed unit count, because a gate
   that never tells "everything passed" from "nothing ran" is
   not a gate. Write the `## Run` section of the item with
   client-neutral start and resume paths per the handoff
   reference. Refresh it on every re-plan. Never point at a
   missing file. Set the item `PLANNED` with its Plan link
   and index row per the item format. Then commit the
   package as the final act.

`goal/check.sh` proves the structure of the package. It
checks clean tree, frozen-contract fingerprint, and
status-table completeness. It checks gates that both
succeeded and executed work. It never proves that the
package still matches the item. Before the handoff, confirm
the trace of each plan requirement. Each requirement traces
by ID to a Decision, a Vocabulary term, or a Must not. No
requirement lacks an ID. No Decision or Must-not stands
uncovered. Executor-side scope that traces to neither is a
named exception in the hub, never a silent inclusion.

**Commit and push.** Commit `plan/`, `goal/`, and the
status flip of the item on the delivery branch of the item.
Use the trailer `Tailrocks-Skill: tailrocks-plan`. Push.
Refresh the status line of the pull request body. One
invocation ends with one marked commit.

## Result

Never plan pixel truth from a schematic mockup. A screen
with a visual surface needs its blessed design reference or
the recorded deferral of the user first.

The package is complete: ledger, spec, plans, goal handoff,
and the `PLANNED` item with consistent links and index. A
host or operator obeys the blocks, and the executor
completes without this conversation. Source is untouched.

## Completion checks

- The ledger shows every spec-bearing ID covered or
  deferred aloud. Every other prefix stands resolved per
  the pipeline table of the ledger.
- Every plan passed cold review, with done criteria that
  assert executed work and specific STOP conditions.
- Every currently runnable command ran once during planning
  with positive-unit proof.
- Every dependency-blocked command names its enabling slice
  and an executed blocker-precondition proof.
- The goal condition is machine-checkable and gate-first,
  with a proof expression on every gate.
- The traceability gate passed.
- The item is `PLANNED` with consistent links and index.
- The work sits committed with its `Tailrocks-Skill` trailer
  on the delivery branch of the item.

## References

- `references/coverage-ledger.md`: read it before step 1. It
  gives the ID inventory and the pipeline table.
- `references/research-gap-manifest.md`: read it before step
  2. It gives the closed manifest shape.
- `references/spec-format.md`: read it before step 3. It
  gives the grammar and the registries.
- `references/goal-handoff.md`: read it before steps 4 and 7.
  It gives the hub, gates, fingerprint, and handoff.
- `references/plan-template.md`: read it before step 5. It
  gives the plan shape, briefs, and quality bar.
- `references/execution-roles.md`: read it before step 5. It
  gives the role predicates.
- `references/roadmap-item-format.md`: read it before step 7.
  It gives the sections and the status values.
- `references/delivery-git-contract.md`: read it before the
  commit. It gives the lane, commit, and pull-request rules.
- `references/runtime-trust.md`: read it before any
  repository or web read. It gives the trust and secrecy
  rules.
- `assets/START.md`, `assets/RESUME.md`, `assets/check.sh`:
  use them in step 7. They give the goal package shape.
