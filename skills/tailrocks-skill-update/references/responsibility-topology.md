# Responsibility topology

Default to one independently invokable responsibility. Split jobs when they
have separate triggers and any separate output/oracle, authority, side effect,
or independent failure path. Rarely shared or conflicting rules strengthen the
split. Descriptions route resulting intents exclusively. A mode-heavy umbrella
is not one responsibility merely because one command selects its modes.

Keep phases together only when they form one transaction whose shared state and
invariants make isolated invocation invalid. Create stays one transaction:
evidence, contract, scaffold, semantic content, and wiring are invalid partial
outcomes.

## Authoring placement

- **Create:** gather evidence read-only, snapshot starting state, and inspect
  gates, instructions, catalogs, registries, and sibling owners. Accept a new,
  unowned responsibility before the first durable write. Rejection leaves the
  starting tree unchanged. A replacement-derived name, rename, split, merge,
  retirement, transfer, alias, or compatibility route is a contract migration,
  never a new owner.
- **Update:** inventory sibling descriptions and responsibility records, then
  read every plausible owner's full public contract before mutation. Existing
  ownership routes to that owner; a new independent responsibility routes to
  creation; an identical-contract ownership move routes to refactor.
- **Contract delta:** update and refactor stop with the tree unchanged and name
  the exact delta, compatibility, and rollback obligations. Execution requires
  a separately scoped, explicit user authorization for direct migration in the
  named branch and pull request. Do not create a migration plan, migration
  artifact, or migration product skill. Create, update, and refactor never
  execute that migration under any selector or inherited authorization.
