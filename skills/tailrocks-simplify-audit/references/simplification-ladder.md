# Simplification Ladder

The order to ask questions in, what may never be removed, and the candidates
that look like simplification and are not.

## Protect first

Mark these before looking for anything to remove. They are frequently the code
that looks redundant, and they are never removed as redundancy:

- **Trust-boundary validation.** Anything checking data that came from outside
  the process, even when an inner layer checks it again.
- **Authorization and authentication** checks, including the ones that look
  unreachable.
- **Error and failure paths**, typed errors, and the branches that convert a
  failure into a response.
- **Durability handling**: transactions, retries, idempotency keys, ordering
  guarantees, cleanup on failure.
- **Concurrency guards**: locks, atomics, ordering constraints, cancellation.
- **Accessibility semantics**: roles, labels, focus management, live regions.
- **Security limits**: body and rate limits, timeouts, header policy.

Two rules on top:

- **A guard you cannot explain is a guard you keep.** Not a reason to stop and
  investigate mid-review; a reason to leave it and say so.
- **Redundant is not the same as duplicated.** Defense in depth is deliberate.
  Two validations of the same field at different boundaries are two decisions,
  not one mistake.

## The ladder

For each piece of code the diff adds, stop at the first yes.

1. **Does this need to exist?** The strongest simplification is deletion.
   Unused exports, options nothing passes, defensive branches for states the
   type system already excludes, configuration with one caller, abstractions
   with one implementation, commented-out code, and TODO scaffolding for work
   that never arrived.
   *Test:* delete it and describe what breaks. Nothing? It goes.

2. **Does this repository already do it?** Reuse beats reimplementation, and
   the second implementation is where behavior drifts.
   *Test:* name the existing function with its path. A reuse claim without a
   path is a guess.

3. **Does the language or standard library do it?** Hand-rolled grouping,
   deduplication, deep equality, date arithmetic, clamping, chunking, sorting
   with a comparator the runtime provides, string padding.
   *Test:* name the exact API and confirm it exists in the pinned version.

4. **Does the platform or framework do it?** Router, form validation, query
   cache, HTTP client, structured concurrency, the framework's own error
   boundary. Re-implementing framework behavior beside the framework is the
   most expensive kind of duplication.
   *Test:* name the framework feature and why it was bypassed.

5. **Does an installed dependency do it?** Already in the lockfile, already
   paid for. Adding a *new* dependency to delete ten lines is not
   simplification — it moves complexity somewhere with its own upgrades and
   advisories.
   *Test:* is it already a direct dependency? If not, this rung does not apply.

6. **Can it be one expression?** A branch that assigns then returns, a loop
   that builds a list a comprehension or map produces, an if/else returning
   booleans.
   *Test:* is the one-liner still readable without a comment? If it needs one,
   keep the branch.

7. **Otherwise, the minimum that works.** Bespoke code is the answer only after
   the six questions above fail, and then only as much of it as the current
   requirement needs.

## Not simplification

Each of these makes a diff look tidier and the codebase worse. Reject them by
name.

| Candidate | Why it is rejected |
|---|---|
| Extracting a helper used once | Indirection with a name. The reader now visits two places instead of one |
| Abstracting two similar blocks | Two occurrences are not a pattern. Wait for the third; the boundary is not visible yet |
| Introducing a base class, generic, or config flag to merge near-duplicates | The wrong abstraction costs more than the duplication it removed, and the cost is non-linear as callers diverge |
| Renaming for taste | Churn. Renaming for correctness — a name that lies — is a real finding; state which |
| Reordering functions, splitting files | Movement, not removal. Nothing is measured better afterwards |
| Replacing an explicit branch with a clever expression | If it needs a comment to read, the branch was simpler |
| Collapsing a switch into a lookup table with one entry per branch | Same branches, new layer |
| Removing an intermediate variable that names a computation | Names are documentation that cannot go stale. Removing one costs clarity to save a line |

On abstraction specifically: duplication is cheaper than the wrong abstraction.
Duplication costs a linear edit in two places. A premature shared abstraction
accumulates parameters and flags as its callers diverge, and every one of those
is a change that touches every caller. Wait for the third occurrence, when the
real boundary is visible.

## Measures

A finding carries a counted delta or it is dropped. Pick whichever the change
actually moves:

- lines removed, net of anything added;
- branches (`if`, `match`, ternary, early return) removed;
- names removed — functions, variables, types, files;
- parameters, options, and configuration keys removed;
- maximum nesting depth;
- direct dependencies removed.

"Cleaner", "more idiomatic", and "easier to read" are not measures. If none of
the above moves, the finding is taste and does not ship.
