# Correction options

## Excluded decision criteria

Price, schedule, engineering effort, diff size, file count,
migration work, ROI, sunk investment, familiarity, and
convenience never select or shrink the target. Translate vague
risk into a concrete threatened invariant, data set, consumer,
or rollback boundary. A shared or old design can still be
wrong.

## Demonstrated limits

A limit stops the design only when evidence identifies the
absent platform capability, binding legal term, unavailable
historical data, external owner, or authorization boundary.
Large and difficult are not limits. Inspect, prototype, or
measure before accepting impossibility.

## Option ranks

1. **Local fix:** the correction touches the failing site and
   removes the evidenced class there.
2. **Boundary fix:** one producer or boundary rejects the class
   mechanically for all callers.
3. **Structural redesign:** ownership, state, or boundary shape
   changes so the class cannot recur.

Select the lowest rank that removes the evidenced class. A
complete redesign is one option, never a requirement in every
case.

## Proof ranks

1. **Unrepresentable:** the failing value or state has no
   expression.
2. **Rejected at one boundary:** one producer mechanically
   rejects it.
3. **Class-verified:** a property, model, or exhaustive check
   covers the bounded class.
4. **Example-tested:** one reported instance is detected, not
   eliminated.

Claim only the reached rank. Verify evidenced siblings before
claiming class removal.

## Structural measures

Measure what changes. Cover each item below:

- Reachable and legal states
- Mutable and shared cells
- Dependency edges and cycles
- Dependency strength, locality, and degree
- Public interface surface
- Convention-held invariants
- Distinct places where a caller must know a rule.

Give before and after values. Name any worsening measure with
the guarantee it buys.

## Break inventory

Use one row per observable break:

| Break | Observer | Approved mechanism | Slice invariant | End state |
| --- | --- | --- | --- | --- |

Cover callers, stored data, wire contracts, operators, tests,
and undocumented observable behavior. Use a direct cut only
when nothing outside the approved change observes it. Every
temporary bridge needs a removal condition.

## Correction discipline

- Fresh approval precedes code deletion, persisted-data
  rewrite, published-contract break, credential use, and
  outward action.
- Unapproved behavior is preserved, or the correction blocks.
- Capability stays fixed. New capability is a separate
  decision.
- Data migration is resumable, idempotent, checksum and backup
  verified, ordered expand-migrate-contract, and
  forward-recoverable.
- Repository gates report commands and nonzero executed units.
  Unavailable or vacuous evidence cannot prove correction.
- Unfinished contractions, migrations, residual exposure, and
  recovery artifacts stay explicit.

Refuse vague dissatisfaction with no failed guarantee. Refuse
scope expansion that bundles unrelated capability into the
correction.
