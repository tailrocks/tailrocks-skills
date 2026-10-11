# Simplification ladder

This file gives the question order, the protected constructs,
and false simplification candidates.

## Protect first

Mark these constructs before searching for removals. They
frequently look redundant. They never qualify as redundancy:

- **Trust-boundary validation.** Checks on data from outside
  the process, even when an inner layer checks it again.
- **Authorization and authentication** checks, including the
  ones that look unreachable.
- **Error and failure paths**, typed errors, and branches that
  convert a failure into a response.
- **Durability handling:** transactions, retries, idempotency
  keys, ordering guarantees, and cleanup on failure.
- **Concurrency guards:** locks, atomics, ordering constraints,
  and cancellation.
- **Accessibility semantics:** roles, labels, focus management,
  and live regions.
- **Security limits:** body and rate limits, timeouts, and
  header policy.

Two rules apply on top:

- **Keep a guard that you cannot explain.** This is not a
  reason to stop and investigate mid-review. It is a reason to
  leave the guard and say so.
- **Redundant differs from duplicated.** Defense in depth is
  deliberate. Two validations of the same field at different
  boundaries are two decisions, not one mistake.

## The ladder

For each piece of code that the diff adds, stop at the first
yes.

1. **Does this code need to exist?** The strongest
   simplification is deletion. Remove unused exports.
   Remove options that nothing passes. Remove defensive
   branches for states that the type system already
   excludes. Remove configuration with one caller. Remove
   abstractions with one implementation. Remove
   commented-out code. Remove TODO scaffolding for work
   that never arrived.
   *Test:* delete it. Describe what breaks. Nothing breaks,
   so it goes.
2. **Does this repository already do it?** Reuse beats
   reimplementation. The second implementation is where
   behavior drifts.
   *Test:* name the existing function with its path. A reuse
   claim without a path is a guess.
3. **Does the language or standard library do it?**
   Hand-rolled grouping, deduplication, deep equality, date
   arithmetic, clamping, chunking, sorting with a comparator
   that the runtime provides, and string padding.
   *Test:* name the exact API. Confirm that it exists in
   the pinned version.
4. **Does the platform or framework do it?** Router, form
   validation, query cache, HTTP client, structured
   concurrency, and the own error boundary of the framework.
   Re-implemented framework behavior beside the framework is
   the most expensive duplication.
   *Test:* name the framework feature and why the code
   bypassed it.
5. **Does an installed dependency do it?** The dependency
   is already in the lockfile. Its cost is already paid. A
   *new* dependency to delete ten lines is not
   simplification. It moves complexity to a place with its
   own upgrades and advisories.
   *Test:* confirm that it is already a direct dependency.
   If it is not a direct dependency, this rung does not
   apply.
6. **Can it be one expression?** Examples are a branch
   that assigns then returns, a loop that a comprehension or
   map replaces, and an if-else that returns booleans.
   *Test:* confirm that the one-liner stays readable without
   a comment. If it needs one, keep the branch.
7. **Otherwise, use the minimum that works.** Bespoke code is
   the answer only after the six questions above fail, and
   then only as much as the current requirement needs.

## Not simplification

Each candidate below makes a diff look tidier and the codebase
worse. Reject them by name.

- **Extracting a helper used once.** Indirection with a name.
  The reader now visits two places instead of one.
- **Abstracting two similar blocks.** Two occurrences are not
  a pattern. Wait for the third. The boundary is not visible
  yet.
- **Introducing a base class, generic, or config flag to merge
  near-duplicates.** The wrong abstraction costs more than the
  removed duplication, and the cost grows as callers diverge.
- **Renaming for taste.** Churn. Renaming for correctness, a
  name that lies, is a real finding. State which one.
- **Reordering functions, splitting files.** Movement, not
  removal. Nothing measures better afterward.
- **Replacing an explicit branch with a clever expression.** If
  it needs a comment to read, the branch was simpler.
- **Collapsing a switch into a lookup table with one entry per
  branch.** Same branches, new layer.
- **Removing an intermediate variable that names a
  computation.** Names are documentation that cannot go
  stale. Removing one costs clarity to save a line.

On abstraction specifically: duplication is cheaper than the
wrong abstraction. Duplication costs a linear edit in two
places. A premature shared abstraction accumulates parameters
and flags as its callers diverge, and every one of those is a
change that touches every caller. Wait for the third
occurrence, when the real boundary is visible.

## Measures

A finding carries a counted delta, or it is dropped. Use the
measure that the change actually moves:

- Lines removed, net of added lines
- Branches removed: `if`, `match`, ternary, early return
- Names removed: functions, variables, types, files
- Parameters, options, and configuration keys removed
- Maximum nesting depth
- Direct dependencies removed.

Cleaner, more idiomatic, and easier to read are not measures.
If none of the measures above moves, the finding is taste and
does not ship.
