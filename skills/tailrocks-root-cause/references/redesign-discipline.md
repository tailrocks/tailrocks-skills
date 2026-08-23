# Redesign Discipline

## Excluded decision criteria

Price, schedule, engineering effort, diff size, file count, migration work, ROI,
sunk investment, familiarity, and convenience never select or shrink the target.
Translate vague “risk” into a concrete threatened invariant, data set, consumer,
or rollback boundary. A shared or old design can still be wrong.

## Demonstrated limits

A limit stops the design only when evidence identifies the absent platform
capability, binding legal term, unavailable historical data, external owner, or
authorization boundary. Large and difficult are not limits. Inspect, prototype,
or measure before accepting impossibility.

## Proof ranks

1. **Unrepresentable:** the failing value/state has no expression.
2. **Rejected at one boundary:** one producer mechanically rejects it.
3. **Class-verified:** a property/model/exhaustive check covers the bounded class.
4. **Example-tested:** one reported instance is detected, not eliminated.

Claim only the reached rank and verify evidenced siblings before claiming class
removal.

## Structural measures

Measure what changes: reachable/legal states, mutable/shared cells, dependency
edges and cycles, dependency strength/locality/degree, public interface surface,
convention-held invariants, and distinct places a caller must know a rule. Give
before/after values and name any worsening measure with the guarantee it buys.

## Break inventory

One row per observable break:

| Break | Observer | Approved mechanism | Slice invariant | End state |
|---|---|---|---|---|

Cover callers, stored data, wire contracts, operators, tests, and undocumented
observable behavior. Use a direct cut only when nothing outside the approved
change observes it. Every temporary bridge requires a removal condition.

## Correction discipline

- Fresh approval precedes code deletion, persisted-data rewrite, published
  contract break, credential use, or outward action.
- Unapproved behavior is preserved or the correction blocks.
- Capability stays fixed; new capability is a separate decision.
- Data migration is resumable, idempotent, checksum/backup verified, ordered
  expand-migrate-contract, and forward-recoverable.
- Repository gates must report commands and nonzero executed units; unavailable
  or vacuous evidence cannot prove correction.
- Unfinished contractions, migrations, residual exposure, and recovery artifacts
  remain explicit.

Refuse vague dissatisfaction with no failed guarantee and scope expansion that
bundles unrelated capability into the correction.
