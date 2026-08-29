---
name: tailrocks-swift-best-practices
description: >-
  Apply Swift code policy when writing in-scope Swift, SwiftUI, concurrency, state ownership, accessibility, availability, or narrow AppKit bridges. Not review, refactoring, project setup, Rust-core boundary architecture, or visual-design authority.
argument-hint: "<Swift or SwiftUI writing task>"
license: Apache-2.0
user-invocable: true
---

# Swift Best Practices

Write native macOS/iOS Swift behavior for the active task. SwiftUI on Apple's
modern rendering stack is the default; AppKit is a narrow capability bridge.
Selection supplies policy, never mutation or tool authority.

Project tooling routes by outcome to the `tailrocks-swift-project-*` family;
visual/material
policy belongs to `tailrocks-macos-design`; Rust-core and Apple-platform effect
architecture belongs to `tailrocks-swift-rust-core-boundary`. Refuse findings-only
review and behavior-preserving refactor requests; route them to
`tailrocks-swift-review` or `tailrocks-swift-refactor`.

Apply [`runtime-trust.md`](references/runtime-trust.md). Load only the relevant
code reference:

| Decision | Reference |
|---|---|
| Actor isolation, Sendable values, tasks, cancellation | [`concurrency.md`](references/concurrency.md) |
| State ownership, view identity, body work, layout | [`swiftui.md`](references/swiftui.md) |
| Narrow capability-only AppKit bridge | [`appkit-interop.md`](references/appkit-interop.md) |
| Typed failure, API and availability | [`errors-and-api.md`](references/errors-and-api.md) |
| Semantics, focus, keyboard, verification IDs | [`accessibility.md`](references/accessibility.md) |
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Write

1. **Bind the platform contract.** Record approved paths/behavior, minimum target,
   current SDK lane, state/isolation owners, capability gaps, accessibility and
   fallback obligations, and existing gates. Never invent an absent symbol;
   label the verified-SDK replacement point. **Complete when:** authority and
   availability are explicit.
2. **Design ownership first.** Choose one isolation category per type, place
   state at the lowest spanning node, keep identity stable and work out of
   `body`, make tasks cancellable, and expose typed failures. **Complete when:**
   lifecycle and failure ownership are visible.
3. **Implement the smallest native behavior.** Use SwiftUI first; require a named
   current-stable SwiftUI capability gap for AppKit. Every newer symbol gets an
   availability guard, decided fallback, and removal condition. Business logic
   stays in Rust. **Complete when:** no second architecture or suppressed race exists.
4. **Verify and report.** Add failure/cancellation tests and complete label,
   value, role, focus order, identifier, keyboard, and menu parity. Run only
   task-authorized existing bounded gates. Report changes, SDK/target, fallbacks,
   outcomes, and skips. **Complete when:** every breakable path has evidence.

## Final gate

Strict concurrency, stable identity, guarded availability, typed failure,
complete accessibility/input parity, native rendering, and no domain behavior in Swift.
