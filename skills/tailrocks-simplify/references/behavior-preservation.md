# Behavior Preservation

What "does not change behavior" has to mean before a removal ships, and how to
establish it.

## One hat at a time

Refactoring and changing behavior are separate activities, and a pass does one
of them. While refactoring you add no capability, fix no bug, and change no
output; the tests that passed before pass unchanged afterwards.

The consequence for this skill: a finding that requires a behavior change is not
a smaller finding, it is a different task. Record it — "this branch is
unreachable because the caller already validates, and removing that validation
would change behavior" — and leave the code alone.

Mixing the two also destroys reviewability. A diff that both restructures and
changes what the code does cannot be reviewed for either.

## What counts as observable

Wider than the return value:

- return values and thrown or returned error types, for every input class the
  code accepts, including empty, boundary, and malformed;
- side effects: writes, network calls, their order, and their count;
- timing where something depends on it — timeouts, retries, debounce;
- resource behavior: what is closed, when, and in what order on failure;
- anything another party parses — wire formats, persisted shapes, exit codes,
  and log lines with consumers;
- for interfaces: rendered semantics, focus order, and announced text.

Assume observable behavior is depended on even where it was never promised.
"That detail was incidental" is a reason to check who relies on it, not a
licence to change it.

## Establishing it

In increasing order of strength. Claim only the level you reached.

1. **Type-level identity** — the change cannot alter behavior because the
   compiler rejects any version that does. Strongest, and rare.
2. **Existing tests, green before and after.** Check that the tests actually
   enter the branch being removed; a green suite that never reaches the code is
   evidence of nothing.
3. **Characterization test written first.** Where the touched path has no
   coverage, pin the current behavior, watch it pass against the unmodified
   code, then refactor and watch it pass again.
4. **Reasoned equivalence** — a written argument covering every input class.
   Acceptable only for locally obvious removals, such as deleting an
   unreferenced export, and never for a path with error handling.

Order matters. A test written *after* the refactor pins the new behavior,
including anything you broke, so its green result means nothing.

## Working order in `apply`

1. Run the repository's gates first and record the baseline. A suite that was
   already red cannot certify anything afterwards.
2. Add characterization tests for untested touched paths. Confirm green against
   unmodified code.
3. Make **one** removal.
4. Run the focused tests for that area, then the fast gates.
5. Record the per-path CAS receipts, then take the next removal.
6. Run the full gate set once at the end.

Batching removals loses the property that makes this safe: when something goes
red, the cause is the last change.

Roll back rather than repair. If a removal turns a gate red, restore each preimage
only when current bytes still match the postimage installed by this invocation,
using CAS so a concurrent replacement survives. Record a fully restored removal
as rejected with the failure. If any owned postimage cannot be restored, stop,
name the surviving changed paths and recovery artifacts, and report
`RECOVERY_REQUIRED`. A simplification that needed debugging was not
behavior-preserving.

## Reporting honestly

- Name the gates that ran and the ones that could not, with the reason.
- State the preservation level reached per finding, using the ranking above.
- List every behavior difference discovered and not made.
- If the diff got smaller but a measure got worse — one fewer function, two more
  parameters — say so; that is a trade, not a simplification.
