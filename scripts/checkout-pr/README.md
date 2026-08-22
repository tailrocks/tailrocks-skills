# Checkout PR command

Deterministically resolve and switch to a pull request without model judgment.

```sh
bun scripts/checkout-pr.ts --root <repository> [--confirm-closed <number>] <number|URL|branch>
```

The command validates the identifier, refuses a dirty or concurrently changed
tree, resolves an exact pull request, requires number-bound confirmation for a
closed or merged request, calls `gh pr checkout` once, and verifies the exact
head branch and commit. It never auto-stashes or falls back to raw checkout. JSON receipts
use schema `tailrocks.checkout-pr/v1`; success exits 0, state refusals exit 2,
and command, verification, or recovery failures exit 1.
