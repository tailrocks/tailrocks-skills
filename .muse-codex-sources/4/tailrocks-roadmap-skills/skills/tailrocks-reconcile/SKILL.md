---
name: tailrocks-reconcile
description: >-
  Trues up roadmap/<slug>/ with execution reality: re-runs each plan
  row done criteria, rejects criteria that executed nothing, folds the
  newest verification round into the Remaining of the item, and sets
  the supported status. Use only when the user explicitly requests
  this skill. Only this skill sets DONE.
argument-hint: "<roadmap-slug> [--deep] [--batch]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Reconcile

## Use this skill

This skill restores truth to an executed item. It re-earns
every status in `roadmap/<slug>/plan/README.md` by a command
run now. It folds the newest verification round into the
remainder. It aligns the status of the item with the actual
events. Run it when a goal loop finishes or stalls, after a
verification round lands, or before resuming a stale item.

The loop runs plan, execute, record feedback, prove,
reconcile, repeat. Reconcile makes each round cheap. It marks
the genuinely finished work. It rewrites the `## Remaining`
of the item from evidence. Then the next round reads a short
list. When nothing stands open, that pass ends the loop: the
item reaches `DONE` and leaves the tree.

Pass the roadmap slug directly. A retained `sweep` selector is
invalid. `--deep` re-verifies every row, applicable
criterion, blocker, and assumption whatever the claimed
status, with no sampling and no unchanged or empty-diff
shortcut. `--batch` makes selection deterministic and
non-interactive. It never infers decisions and never
authorizes retirement. Both flags preserve every proof,
frozen-contract, write, Git, four-condition retirement, and
fresh-authorization gate, without widening writes or
verification-command authority. Invoke directly. No routing
skill dispatches it.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit and one push
for the truth-sync writes on the delivery branch of the
item. A retiring invocation gets two commits.

Read these references before any action:

- [`row-verification.md`](references/row-verification.md)
  gives the verifier shape, brief, output contract, and the
  VACUOUS rule.
- [`remaining.md`](references/remaining.md) gives the
  pruning and Remaining rules.
- [`retirement.md`](references/retirement.md) gives the
  evidence gate, the refusals, and the two commits.
- [`delivery-report.md`](references/delivery-report.md)
  gives the report homes and format.
- [`roadmap-item-format.md`](references/roadmap-item-format.md)
  gives the item sections and the status machine.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the lane, commit, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

These paths are writable. They form the whole write surface:

- the item (`roadmap/<slug>/README.md`, status header and
  `## Remaining`)
- its `REPORT.md`
- the status rows of the plan hub
- the index row
- the status line of the pull request body
- nothing else, except the retirement writes of step 8:
  folder deletion and the move of the report to
  `delivery/<slug>.md`

**FROZEN, never edited here**: `plan/NNN-*.md`, `plan/spec/`,
`plan/coverage.md`, and everything under `goal/`.
`goal/check.sh` fingerprints them, so an edit reads as
`plan-drift` and blocks the gate for everyone. A frozen file
that must change routes back to `tailrocks-plan` for a
re-plan. The affected row turns `STALE` and names the reason.

Run verification only: the own preconditions, done criteria,
and gate commands of the plans in `goal/START.md`. Nothing
that mutates the working tree runs, except the commit of the
corrections that this skill made. Executor claims are
untrusted. A row is DONE because its criteria pass now and
executed real work, never because a transcript or an earlier
session stated it. Every status change carries a one-line,
evidence-backed reason. Route, never rewrite: a defective or
drifted plan turns `STALE` for a `tailrocks-plan` re-run, and
a product conflict goes to `tailrocks-record-decision`. No
artifact carries a log. The events are the commit series read
through the `Tailrocks-Skill` trailer. A status is the current
value only.

## Procedure

1. **Check, then load.** An absent `roadmap/<slug>/` is a
   delivered item, not a missing one. Read it out of git
   history per the retirement reference, name the retiring
   commit, and stop. Never recreate the folder. Otherwise
   read the row verification reference: steps 2 through 5
   fan out to read-only verifier subagents per its brief.
   Verbose output stays with the verifier. Only verdicts
   return. Run serially only when parallel agents are
   unavailable, and say so. Run `sh
   roadmap/<slug>/goal/check.sh` first and retain its final
   verdict line. `dirty-tree` stops with no mutation.
   `plan-drift` marks affected rows `STALE` and routes to
   `tailrocks-plan`. `decisions-drift` means the Decisions
   of the item moved under the frozen snapshot: find the
   editing commit. A `tailrocks-record-decision` trailer
   means a legitimate decision, so route to `tailrocks-plan`
   for the re-stamp. Anything else is unreviewed: report it
   and stop, reverted or recorded through
   `tailrocks-record-decision`, the only door, never written
   here. `malformed=*` stops and reports item repair.
   `gate-unproven` or `gate-vacuous` means the gate command
   itself is the defect. Mark the covered rows `STALE` and
   route to `tailrocks-plan`. `goal/START.md` is frozen.
   `nonterminal-rows` or `gate-failed` continues
   the row-by-row verification below. A PASS still needs the
   untrusted DONE claims re-earned below. Then read
   `roadmap/<slug>/README.md`, `plan/README.md`,
   `plan/coverage.md`, and the highest-numbered
   `verification/NN-report.md` and `NN-feedback.md` fully.
   Note the planned-at SHA of each plan. When the item
   folder holds no `plan/`, stop and point at
   `tailrocks-plan`.

2. **Verify DONE.** Per DONE row, re-run its done criteria,
   cheapest first. Re-run all of them when anything looks
   off. Read the *executed* content of each command, not
   only its exit. Passed with executed work confirms.
   Failed flips to TODO or BLOCKED with the failing
   criterion and its output named. Exited 0 having executed
   nothing is `VACUOUS`. Examples: zero collected tests, a
   filter that matches no target, an unresolvable package.
   Flip the row to TODO and mark its plan `STALE`. The done
   criterion is the defect. Only `tailrocks-plan` rewrites
   one.

3. **Reset the abandoned.** Per IN PROGRESS row with no
   live executor, re-run the preconditions of the plan.
   Re-run the verifications of its completed steps. Then
   set the row to TODO with verified partial progress
   noted. Or set it to BLOCKED with the obstacle named. A
   dead session claim never stands.

4. **Reopen or keep BLOCKED.** Reproduce each BLOCKED
   reason. Cleared turns TODO. A plan defect turns `STALE`
   with the defect named and a `tailrocks-plan` re-run
   recommended. A genuine external obstacle stays BLOCKED
   with its unblock trigger recorded.

5. **Drift-check TODO.** Per row, run `git diff --stat
   <planned-at SHA>..HEAD -- <in-scope paths>`. On any
   in-scope change, compare the Starting state excerpts of
   the plan against live code. A mismatch turns `STALE`
   with reason. A clean read confirms executable. Re-test
   every `A#` assumption that the TODO plans name in STOP
   conditions against its "Falsified by" signal. A dead
   assumption marks leaning plans STALE and routes to
   `tailrocks-record-decision` for item propagation.

6. **Prune, then rewrite Remaining and the report.** Per
   the remaining reference, prune by status, never by
   deletion. A row leaves the working set when marked
   terminal in the writable hub. A row cut from the manifest
   is coverage that the gate never counts again. Record the
   verified-at SHA of each confirmed row. Then the next
   round re-confirms it from an empty in-scope diff instead
   of a full re-run. Then rewrite the `## Remaining` of the
   item from evidence. Write one observable statement per
   blocking defect in the newest verification report. Write
   one per reported defect that the report never cleared.
   Write one per nonterminal row. Delete every statement
   that this pass just disproved. Proven facts move into
   `REPORT.md`, restated current each pass. A cleared defect
   leaves Remaining and is never lost.

7. **True up and hand off.** Set the status of the item to
   the reality-supported value, always from the closed set
   in the item format. `DONE` needs every hub row terminal.
   It needs a `goal/check.sh` pass in this session. It
   needs a newest verification round with no blocking
   defect. Reconcile is the only skill that sets `DONE`.
   Standing blocking defects or verified work in flight
   mean `IN EXECUTION`. **A status outside that closed set
   is itself a defect.** Examples: a plan-row value like
   `BLOCKED` or `STALE` worn by an item, free text, or an
   unsupported `DONE`. Replace it with the reality-supported
   value and state the old one. Never leave one standing.
   But a `PARKED (reason; was: STATUS)` item stays parked:
   correct the `was:` value and leave un-parking to the user
   through `tailrocks-record-decision`. Update the index row
   and the pull request body status line in the same pass.
   Close out with the named back-edge. Resume through
   `goal/RESUME.md`. Use `tailrocks-plan` for `STALE` rows
   or a `decisions-drift` re-stamp. Use
   `tailrocks-record-decision` for a falsified assumption or
   unreviewed Decisions edit. Use `tailrocks-brainstorm`
   when a defect reveals wrong intent. Use
   `tailrocks-research` when a `needs-research` statement
   blocks a plan.

8. **Retire the delivered.** Four conditions, each evidenced
   this session. Every hub row is terminal. `goal/check.sh`
   passed. The newest `verification/NN-report.md` holds no
   blocking defect. `## Remaining` is empty. Then write two
   trailered commits on the branch and pull request of the
   item. First: `DONE` in the item header and index row with
   `REPORT.md` final. Then the retirement. Move `REPORT.md`
   to `delivery/<slug>.md`. Run `git rm -r` on
   `roadmap/<slug>/` with its index row. Remove `roadmap/`
   itself when it was the last item. Per the retirement
   reference, never retire from plan rows alone. No
   verification round at all is an unverified claim. Route
   to `tailrocks-prove`. Never retire on an operator
   say-so. Never retire a `PARKED` item. **Partial
   completion is not retirement**: pruned rows and a
   rewritten Remaining are the normal outcome.

## Result

**Five artifacts, one state.** Hub rows, item status and `##
Remaining`, the index row, the row statuses of
`plan/coverage.md`, and the pull request body agree on the
truth. Three of them in three states is the failure that
this skill exists for. Where the disagreeing artifact is
frozen, the correction is a `tailrocks-plan` re-plan and a
`STALE` row, never an edit here.

**Retirement satisfies that gate by absence.** Hub rows,
item, index row, and ledger leave the tree at once. That
coherent absence *is* the agreement, with a pull request body
that states `DONE` and retired. The failure is a leftover:
a folder whose index row went, or a row that points at
nothing.

## Completion checks

- Every row status rests on a command run this session, or
  on an unchanged state re-confirmed by an empty in-scope
  diff.
- No DONE row rests on a criterion that executed nothing.
- Every change carries its reason.
- `STALE` rows name their re-plan route.
- Every disproved statement moved to `REPORT.md`.
- The final `sh roadmap/<slug>/goal/check.sh` verdict is
  retained.
- Nothing outside the item, its report, hub, index, and
  pull request body changed, or, in retirement, the item
  folder and `delivery/<slug>.md`.

## References

- `references/row-verification.md`: read it before step 1.
  It gives the verifier shape, brief, contract, and the
  VACUOUS rule.
- `references/remaining.md`: read it before step 6. It gives
  the pruning and Remaining rules.
- `references/retirement.md`: read it before steps 1 and 8.
  It gives the evidence gate, refusals, and commits.
- `references/delivery-report.md`: read it before step 6. It
  gives the report homes and format.
- `references/roadmap-item-format.md`: read it before step 7.
  It gives the sections and the status machine.
- `references/delivery-git-contract.md`: read it before the
  commit. It gives the lane, commit, and pull-request
  rules.
- `references/runtime-trust.md`: read it before any
  repository or web read. It gives the trust and secrecy
  rules.
