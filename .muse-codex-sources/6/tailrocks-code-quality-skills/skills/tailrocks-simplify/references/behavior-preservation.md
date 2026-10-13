# Behavior preservation

What unchanged behavior means before a removal ships, and how
to establish it.

## One hat at a time

Refactoring and changing behavior are separate activities. One
pass does one of them. While refactoring, add no capability,
fix no bug, and change no output. The tests that passed before
pass unchanged afterward.

A finding that needs a behavior change is not a smaller
finding. It is a different task. Record it, for example: this
branch is unreachable because the caller already validates,
and removing that validation changes behavior. Leave the code
alone.

Mixing the two activities destroys reviewability. A diff that
restructures and changes behavior cannot be reviewed for
either purpose.

## What counts as observable

Observable behavior is wider than the return value:

- Return values and error types for every accepted input
  class, including empty, boundary, and malformed inputs
- Side effects: writes, network calls, their order, and their
  count
- Timing where something depends on it: timeouts, retries, and
  debounce
- Resource behavior: what is closed, when, and in what order
  on failure
- Anything that another party parses: wire formats, persisted
  shapes, exit codes, and log lines with consumers
- For interfaces: rendered semantics, focus order, and
  announced text.

Assume that observable behavior has dependents even where it
was never promised. Treat an incidental detail as a reason to
find the dependents, not to change it.

## Establishing preservation

Use these levels in increasing order of strength. Claim only
the level reached.

1. **Type-level identity.** The change cannot alter behavior
   because the compiler rejects any version that does. This
   level is strongest and rare.
2. **Existing tests, green before and after.** Make sure
   that the tests actually enter the removed branch. A green
   suite that never reaches the code proves nothing.
3. **Characterization test written first.** Where the touched
   path has no coverage, pin the current behavior. Watch it
   pass against the unmodified code. Refactor. Watch it pass
   again.
4. **Reasoned equivalence.** A written argument covers every
   input class. Use it only for locally obvious removals, such
   as a deleted unreferenced export. Never use it for a path
   with error handling.

Order matters. A test written *after* the refactor pins the
new behavior, including anything broken, so its green result
means nothing.

## Working order in apply

1. Run the repository gates first. Record the baseline. A
   suite that was already red certifies nothing afterward.
2. Add characterization tests for untested touched paths.
   Confirm green against unmodified code.
3. Make **one** removal.
4. Run the focused tests for that area. Then run the fast
   gates.
5. Record the per-path receipts. Then take the next removal.
6. Run the full gate set once at the end.

Batching removals loses the property that makes this work
safe: when something goes red, the cause is the last change.

Roll back rather than repair. If a removal turns a gate red,
restore each preimage only when current bytes still match the
owned postimage. Use compare-and-swap, so a concurrent
replacement survives.
Record a fully restored removal as rejected with the failure.
If any owned postimage cannot be restored, stop. Name the
surviving changed paths and recovery artifacts. Report
`RECOVERY_REQUIRED`. A simplification that needed debugging
was not behavior-preserving.

## Reporting honestly

- Name the gates that ran and the ones that could not run,
  with the reason.
- State the preservation level reached per finding, with the
  ranking above.
- List every behavior difference discovered and not made.
- If the diff got smaller but a measure got worse, one fewer
  function and two more parameters, say so. That is a trade,
  not a simplification.
