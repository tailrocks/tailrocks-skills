---
name: tailrocks-checkout-pr
description: >-
  Use only when the user explicitly requests this skill. Compatibility alias for
  the deterministic pull-request checkout command. Do not use to create,
  refresh, review, merge, or otherwise mutate pull requests.
argument-hint: "<PR number | URL | branch> [--confirm-closed <number>]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Checkout PR Compatibility Alias

This name is deprecated during the compatibility window. It contains no checkout
logic. Read [`runtime-trust.md`](references/runtime-trust.md), then route exactly
once to the collection-owned command.

Resolve the real path of this installed `SKILL.md`; its collection root is two
directories above its containing directory. Resolve the checkout-pr TypeScript
entrypoint under that root's scripts directory, require the joined path itself
to be non-symlink and the resolved entrypoint to be regular, then run:

```sh
bun "$CHECKOUT_SCRIPT" --root "$TARGET_REPOSITORY" <arguments>
```

Set `TARGET_REPOSITORY` to the real repository root. Forward the user's one
identifier unchanged. Forward `--confirm-closed <number>` only after the user
explicitly confirms the exact number reported by a
`closed_confirmation_required` receipt. Never infer or carry confirmation.

Return the command's typed receipt verbatim. Exit 0 is success; exit 2 is a
state refusal requiring operator action; exit 1 is a command, verification, or
recovery failure. Never run `gh pr checkout`, `git checkout`, `git switch`, or
auto-stash outside the command.

**Complete when:** the command returns `switched` or `already_current`. Any
other code is terminal for this invocation.
