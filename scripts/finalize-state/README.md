# Finalize state command

`finalize-state.ts` is the sole machine writer of the `SHAPING` to `READY`
transition. Run the installed command selected by the skill loader:

```sh
bun scripts/finalize-state.ts --skill-file <absolute-loader-skill> <roadmap-slug> [--batch] < input.json
```

With no input, the command reports lifecycle routing without mutation: `DRAFT`
routes to `tailrocks-brainstorm`, `READY` is idempotent, `SHAPING` asks for
evidence, and all later, malformed, or mismatched states refuse.

Input schema `tailrocks.finalize-readiness/v1` is closed and digest-bound. It
contains `action` (`assess` or `publish`), exact item and index SHA-256 digests,
the fifteen readiness checklist IDs with typed evidence pointers, a bounded
dependency graph, exact live-user answer receipts bound to the item digest, and
the optional planning dry-run receipt. The dry run identifies its reviewer,
inventories screens, capabilities, flows, and must-nots, and must contain zero
questions and inventions. Every checklist row must point at its allowed live
item section, and all four dry-run inventories must exactly equal deterministic
extraction from the digest-bound item. `publish` requires the complete
checklist, a fully answered graph, at least one live-human receipt, populated
core sections, and the mechanical item shape. Inventory, Deferred, and Open
research sections accept only complete Markdown bullet lists; unconsumed prose,
numbered entries, and malformed bullets refuse readiness.

Interactive and batch modes differ only in presentation: interactive returns
the first stable-ID ready node; batch returns the entire current frontier. The
command emits exactly one `tailrocks.finalize-state/v1` JSON receipt. READY is
published through a compare-and-swap transaction changing the anchored item and
index status fields together; a stale digest, unsafe path, race, incomplete
proof, or failed transaction grants nothing.
