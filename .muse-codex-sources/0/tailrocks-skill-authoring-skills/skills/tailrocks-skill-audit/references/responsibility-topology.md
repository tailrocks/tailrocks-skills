# Responsibility topology

Default to one independently invokable responsibility. When jobs
have separate triggers and any separate output, oracle, authority,
side effect, or independent failure path, split them. Rarely shared
or conflicting rules strengthen the split. Descriptions route
resulting intents exclusively. A mode-heavy umbrella is not one
responsibility merely because one command selects its modes.

When phases form one transaction whose shared state and invariants
make isolated invocation invalid, keep them together. Creation
stays one transaction: placement, scaffold, semantic content, and
wiring are invalid partial outcomes.

## Authoring placement

- **Create:** gather facts read-only. Snapshot the starting
  state. Inspect gates, instructions, catalogs, and sibling owners.
  Before the first durable write, accept a new, unowned
  responsibility. Rejection leaves the starting tree unchanged. A
  replacement-derived name, rename, split, merge, retirement,
  transfer, alias, or compatibility route is a contract migration,
  never a new owner.
- **Update:** inventory sibling descriptions and responsibility
  records. Before mutation, read every plausible owner full public
  contract. Existing ownership routes to that owner. A new
  independent responsibility routes to creation. An
  identical-contract ownership move routes to refactor.
- **Contract delta:** update stops with the tree unchanged and names
  the exact delta, compatibility, and rollback obligations.
  Refactor executes the delta only under a separately scoped,
  explicit user authorization in the named branch and pull request.
  Update never executes that migration under any selector or
  inherited authorization.

## Skill versus tool versus system prompt

Before authoring, route by shape. **System prompt and instruction
file:** global always-on behavior, safety boundaries, small stable
policies, never multi-step procedures. **Tool:** live external
data, side effects, current state, narrow scope, typed inputs,
explicit effects. **Skill:** a repeatable procedure where the how
matters: branching workflows, scripts, templates, formatting rules,
invoked sometimes, versioned independently. A one-off is an inline
script. A daily-changing procedure is not yet a skill. Every skill
states its workflow boundary: expected inputs, steps, outputs,
facts the agent must not infer, and when to ask, stop, or decline.
