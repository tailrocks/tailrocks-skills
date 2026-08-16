# Redesign Discipline

How to hold the posture without turning it into recklessness. Sources inspected
2026-08-16.

## Why the posture is inverted

Incrementalism is a response to the price of change. Most engineering advice
about avoiding restructuring was written when producing a new implementation was
the expensive part, so preserving the existing shape was usually the cheaper
route to a working system. When implementation is no longer the scarce resource,
the argument that supported the caution weakens, and the design that would have
been chosen on a blank page becomes reachable.

Do not lean on that reasoning to make decisions, and do not repeat it as a
finding. The evidence on how much machine assistance actually changes delivery
speed is mixed — a 2025 randomized trial of experienced developers on mature
repositories measured a slowdown while participants believed they had been sped
up (<https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/>).
The rule this skill enforces does not depend on that question: cost is excluded
from the decision, so no estimate of cost — lower or higher — can enter it. The
economics explain why the exclusion is affordable; correctness is why it is
right.

## Cost language, translated

Each phrase on the left is inadmissible. The question on the right is the
legitimate concern hiding behind it, and it is the one to answer.

| Inadmissible | Answer this instead |
|---|---|
| "Too big a change for this bug" | Which structural condition produced the bug? |
| "Not worth the refactor" | Does the target design eliminate the class, or not? |
| "That would take weeks" | Is it demonstrated to be impossible, or merely large? |
| "Touches too many files" | How many distinct decisions change? File count is a rendering. |
| "Risky refactor" | Which specific invariant, data set, or consumer is at risk, and what protects it? |
| "Keep the diff minimal" | Minimal against which measure — reachable states, dependencies, connascence? |
| "Let's not over-engineer" | Does the target design add capability? If not, the objection is about size. |
| "Ship the patch now, redesign later" | Is there active harm? If not, this is cost reasoning with a schedule attached. |
| "The old code has been battle-tested" | Which behaviors did that testing establish? Those go in the break inventory. |
| "Nobody else does it that way" | Irrelevant. A shared mistake is still a mistake. |

Risk deserves a separate warning: it is the most common disguise for cost. Real
risk names a mechanism — this data cannot be reconstructed, this consumer cannot
be contacted, this rollback has no path. Unnamed risk is size anxiety.

## Difficulty versus impossibility

A limit stops the design only when it has been demonstrated. Before accepting
one, produce the evidence: the API that does not exist, the platform guarantee
that is absent, the license term, the authorization you do not hold, the data
that was never recorded. "I expect this is hard" and "this would require
changing a lot" are not limits. When the evidence is not in hand, get it —
inspect, prototype, measure — before recording an impossibility.

## What genuinely binds

- **Safety and data integrity.** Corruption, loss, and unrecoverable states are
  correctness failures; a redesign that risks them is not a better design.
- **Authorization.** Repositories, services, and contracts you do not own.
- **Promises to outside parties.** A published API, a documented wire format, a
  supported version policy. Internal callers you can change are not this.
- **Legal and licensing terms.**
- **Demonstrated platform limits.**

Everything else — internal compatibility, migration work, the number of teams
touched, the age of the code — is work to be planned, not a constraint on the
destination.

## Proving elimination

Rank the proof; claim only the rank you reached.

1. **Unrepresentable.** The failing value or state has no expression in the
   type system or data model. Strongest, and the target.
2. **Rejected at one boundary.** Exactly one place can produce the value, and it
   rejects the bad case. Acceptable when the language or platform cannot express
   the constraint.
3. **Property-verified.** A property test, model check, or exhaustive state
   enumeration covers the class. This is evidence about the class, not a
   structural guarantee.
4. **Example-tested.** A regression test for the reported instance. This is
   never elimination; report it as detection of one case.

Also verify the siblings. Search the repository for the same shape before
claiming the class is gone, and bound the claim to what the search covered.

## Structural measures

Pick the ones the design actually moves and give both values.

- Reachable states, and how many are legal.
- Mutable cells, and how many are shared across tasks or requests.
- Dependency edges between modules, and the depth of the deepest cycle.
- Connascence: type, strength, locality, degree.
- Public interface surface: exported symbols, parameters, configuration knobs.
- Invariants enforced by convention or documentation rather than by code.
- Distinct places a rule must be known to add a caller.

A design where none of these improves is not a redesign. Say so and stop rather
than restructuring for its own sake.

## The break inventory

One row per break. Effort never appears in this table.

| Break | Who observes it | Mechanism | End state |
|---|---|---|---|

- **Break** — the behavior, signature, format, or guarantee that changes.
- **Who observes it** — callers, stored data, other services, operators, tests.
  Assume observable behavior is depended on even when it was never promised.
- **Mechanism** — parallel change (expand, migrate, contract), data migration
  with a reversible step, a version bump with a deprecation window, a strangler
  path, or a direct cut when nothing outside this change observes it.
- **End state** — what is true when the mechanism finishes, including the date
  or condition on which the old form is removed.

Staged delivery exists to protect data, safety, and rollback. It never changes
the destination, and an expand step without a contract step is an unfinished
change, not a completed one.

## Executing a rebuild

- Get explicit approval before an irreversible step: deleting a code path,
  migrating or rewriting persisted data, breaking a published contract,
  removing a public symbol.
- Preserve behavior that is not part of the class being eliminated, or list it
  in the break inventory. Silent behavior changes are defects regardless of how
  much better the new design is.
- Keep the capability set fixed. New capability discovered during a rebuild is a
  separate product decision; record it and leave it out.
- Run the repository's own gates and report exact results, including gates that
  could not run.
- Report what remains: unfinished contract steps, deferred migrations, and any
  temporary bridge with its removal condition.

## Refusals

Decline and ask for a concrete symptom when the request is only that code feels
old, unfashionable, or unlike a preferred style. This skill needs a failed
guarantee to aim at; without one, restructuring is churn and the corpus cannot
be matched to a shape.

Decline the scope expansion, not the redesign, when the request bundles new
capability with the fix. Deliver the eliminating design and record the new
capability as a separate decision.
