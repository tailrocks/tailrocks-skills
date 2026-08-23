# Specialist lanes

Four lanes, each with a content trigger. Run a lane only when its trigger
fires in the diff; report skipped lanes with the reason. Lane findings pass
through the same verification and kill-list discipline as everything else
— a lane is a lens, not a lower bar.

## Test coverage — trigger: tests changed, or new behavior without them

Judge behavioral coverage, not line coverage. The critical gaps:

- Untested error-handling paths that could fail silently in production.
- Missing boundary and edge-case coverage for the new logic.
- Absent negative cases for validation the change introduces.
- Untested concurrent or async behavior where the change has any.

For each missing test, state the specific regression it would catch and
rate criticality 1–10 (9–10: data loss, security, system failure; 7–8:
user-facing errors; 5–6: confusion and minor issues). Report gaps rated 5
and above; below that is academic completeness.

Also judge the tests themselves: a test coupled to implementation details
fails on refactors instead of regressions and is a finding; a test that
cannot fail is a defect. Do not demand tests for trivial accessors, and
check whether an existing integration test already covers the scenario
before flagging the gap. House rule inherited from the stack lanes: a new
business rule without a test is unfinished work, not a suggestion.

## Silent failures — trigger: error handling, fallbacks, or retries touched

Locate every handler the diff adds or modifies: catch/except blocks,
`Result` discards, error callbacks, fallback values, optional chaining
that skips fallible operations, retry loops. For each:

- **Empty catch blocks are findings, always.** So is catch-log-continue
  when the operation's failure matters to the caller.
- **Specificity:** does the catch bind only the expected error types, or
  could it swallow an unrelated failure? Name the unexpected errors it
  would hide.
- **Log quality:** severity appropriate, context sufficient (operation,
  identifiers, state) to debug this six months from now.
- **Fallbacks are explicit and justified.** A fallback the user never
  learns about masks the underlying problem; a production fallback to a
  mock, stub, or fake implementation is an architectural finding, not a
  style note.
- **Propagation:** should this error bubble to a handler that can act,
  instead of dying here? Does catching here skip cleanup?
- **Messages:** a user-facing error states what failed and what the user
  can do; the house boundary rule applies — semantic error codes from the
  core, localized wording at the shell.

A silent-failure pattern repeated across the diff is a defect class: route it to
`tailrocks-root-cause` for diagnosis rather than listing each instance as an
independent nit. Only an approved correction routes to `tailrocks-remediate`.

## Type design — trigger: new or reshaped types

For each type the diff introduces or materially reshapes, identify its
invariants — data consistency, valid state transitions, field
relationships, encoded business rules — then judge four axes:

- **Encapsulation:** can the invariants be violated from outside; are
  internals exposed; is the interface minimal and complete?
- **Expression:** are invariants visible in the structure and enforced at
  compile time where possible — illegal states unrepresentable — or do
  they live in documentation?
- **Usefulness:** do the invariants prevent real bugs and match the
  business rule, neither too strict nor too loose?
- **Enforcement:** validated at construction, guarded at every mutation
  point, impossible to hold an invalid instance?

Anti-patterns to flag: anemic models with no behavior, exposed mutable
internals, doc-only invariants, missing construction validation,
enforcement that varies across mutation paths, types relying on callers to
maintain their invariants. Weigh the complexity cost of every suggestion —
a simpler type with fewer guarantees can beat a fortress that overreaches;
the stack lanes (`tailrocks-rust-best-practices`,
`tailrocks-typescript-best-practices`, `tailrocks-swift-best-practices`)
own the language-specific typed-failure and domain-value rules.

## Comment accuracy — trigger: comments or docs added or modified

Read every added or changed comment as the maintainer who arrives without
context, then verify it against the code:

- **Accuracy:** every claim cross-checked — signatures, described
  behavior, referenced symbols, claimed edge-case handling. A comment that
  is wrong is worse than no comment; comment rot compounds.
- **Value:** comments restating the code are flagged for removal; the
  house rule stands — a comment states a constraint the code cannot show,
  never narrates the next line or argues the change is correct.
- **Longevity:** flag comments bound to transitional states, stale TODOs
  the diff already resolved, and ambiguous phrasing with two readings.

This lane reports; it never rewrites.
