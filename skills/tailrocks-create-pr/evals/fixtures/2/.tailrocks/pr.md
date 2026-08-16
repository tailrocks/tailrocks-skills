# Pull request conventions

## Branching

Branches are `<type>/<ticket-id>-<summary>`, e.g. `fix/TR-142-token-expiry`.
A ticket id is mandatory; ask for it when the change has none.

## Commits

Conventional Commits subjects. Every commit carries DCO sign-off
(`git commit -s`) and a `Ticket:` trailer with the ticket id.

## Body

Required sections: Summary, What changed, How to verify.
How to verify carries the exact commands a reviewer runs locally.
