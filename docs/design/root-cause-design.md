# Root-cause ownership design

`tailrocks-root-cause` and `tailrocks-remediate` separate judgment from
mutation. A failed guarantee, not implementation age or taste, is the entry
gate. Diagnosis produces an approval-ready contract; only a later exact user
approval grants the executor authority.

## Diagnosis owner

`tailrocks-root-cause` is read-only. It proves the expected/observed
contradiction, explains occurrence and escape, bounds evidenced siblings, and
derives the capability from correctness constraints rather than current
implementation or cost. A real design frontier gets two structurally different
candidates. A single candidate requires a demonstrated constraint.

The selected design must remove the enabling condition or reject it at one
owned boundary. It keeps capability fixed, improves a named structural measure,
recovers the purpose of removed structures, and inventories every observable
break and migration mechanism. A guard or example test detects a failure; it
does not prove elimination.

## Correction owner

`tailrocks-remediate` accepts only a current diagnosis contract and explicit
approval bound to its identity, repository state, allowed paths, break
inventory, migration slices, and irreversible actions. It never edits the
diagnosis or widens the class.

The executor establishes the instance and class-prevention oracles before
production mutation, publishes each path sequentially by CAS, preserves
concurrent replacements, and reports partial state honestly. Compatibility may
break only where approved. Persisted-data and published-contract changes need
fresh action-specific approval and a forward-recovery path.

## Structural vocabulary

The diagnosis corpus is indexed by observable problem shape. Each entry carries
an elimination mechanism and a falsifiable application test. Useful measures
include reachable states, mutable cells, dependency edges, connascence,
interface surface, convention-held invariants, and places a caller must know a
rule. New entries merge into an existing shape when possible; the router does
not grow merely to name another technique.

Counterweights are part of the design: recover why a structure exists before
removing it, treat observable behavior as a contract, reject added capability,
and give every temporary bridge an explicit removal condition. These prevent
greenfield reasoning from becoming speculative rewrite authority.

## Refused shapes

- No concrete failed guarantee: refuse as churn.
- New capability bundled with correction: keep it outside this contract.
- Cost, effort, duration, size, ROI, or sunk investment used to select the
  destination: discard the argument.
- Claimed impossibility without a demonstrated platform, legal, data,
  authorization, or safety limit: investigate before accepting it.
- Diagnosis report treated as approval: refuse mutation.
