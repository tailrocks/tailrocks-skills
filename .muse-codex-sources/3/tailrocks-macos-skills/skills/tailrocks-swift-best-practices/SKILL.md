---
name: tailrocks-swift-best-practices
description: >-
  Writes Swift and SwiftUI behavior under the native code policy:
  concurrency, state ownership, typed failure, availability,
  accessibility, and one-gap AppKit bridges. Use this skill when
  the active task writes in-scope Swift code. Review, structure
  changes, project setup, and boundary architecture are out of
  scope.
argument-hint: "<Swift or SwiftUI writing task>"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User writes or changes Swift or SwiftUI code and the task needs
  concurrency, state, failure, availability, accessibility, or
  interop policy.
---

# Swift Best Practices

## Use this skill

This skill writes native macOS Swift behavior for the active task.
SwiftUI on the modern Apple rendering stack is the default. AppKit
is a narrow capability bridge. Selection supplies policy, never
mutation or tool authority.

Use this skill when the active task writes in-scope Swift code:
SwiftUI, concurrency, state ownership, accessibility, availability,
or one-gap AppKit bridges. Do not use this skill for findings-only
review, structure changes, project setup, Rust-core
boundary architecture, or visual-design authority. Review belongs
to `tailrocks-swift-review`. Refactor belongs to
`tailrocks-swift-refactor`. Project tooling belongs to the
`tailrocks-swift-project-*` family. Rust-core and Apple-platform
effect architecture belongs to
`tailrocks-swift-rust-core-boundary`. Visual and material policy
belongs to `tailrocks-macos-design`.

## Before you start

Obey the active user request first. If the request conflicts with a
safety rule in this skill, stop. Report the conflict.

Apply `references/runtime-trust.md`. Resolve each relative link
in the directory that contains this SKILL.md file.

## Procedure

1. **Record the platform contract.** Record approved paths and
   behavior, minimum target, shipping SDK lane, state and isolation
   owners, capability gaps, accessibility and fallback obligations,
   and committed gates. Never invent a missing symbol. Label the
   verified-SDK replacement point. Before step 2, make authority
   and availability explicit.

2. **Design ownership first.** Select one isolation category per
   type. Put state at the lowest spanning node. Keep identity
   stable. Keep work out of `body`. Make tasks cancellable. Use
   typed failures. Before step 3, make lifecycle and failure
   ownership visible. Read `references/concurrency.md` for
   isolation, tasks, and cancellation. Read `references/swiftui.md`
   for state ownership, view identity, body work, and layout.

3. **Write the smallest native behavior.** Use SwiftUI first.
   Record the SwiftUI capability gap in the current-stable SDK
   before AppKit. Give every newer symbol an availability guard, a
   recorded fallback, and a removal condition. Keep business logic
   in Rust: no database, network, or domain behavior in Swift.
   That split is a Tailrocks architecture rule, not a Swift
   language rule. Read `references/appkit-interop.md` for a
   one-gap bridge. Read `references/errors-and-api.md` for typed
   failure, API shape, and availability. Before step 4, remove any
   second architecture and fix any race.

4. **Do the checks and report.** Add failure and cancellation
   tests. Complete label, value, role, focus order, identifier,
   keyboard, and menu parity. Read `references/accessibility.md`.
   Run only task-authorized committed gates. Report changes, SDK
   and target, fallbacks, results, and skips. Before the report,
   give every failure path evidence.

## Result

The run writes the smallest native Swift behavior for the task
with strict concurrency, stable identity, guarded availability,
typed failure, and complete accessibility and input parity. The
report gives changes, SDK and target, fallbacks, results, and
skips.

## Completion checks

Before the report is complete, make sure that each item below holds:

- The skill used SwiftUI first and recorded the SwiftUI
  capability gap for each AppKit bridge.
- Each type has one isolation category and each task cancels.
- Every newer symbol has a guard, a fallback, and a removal
  condition.
- Failures are typed and accessibility parity is complete.
- No domain behavior moved into Swift. The code holds one
  architecture and no known race.
- The report gives results and skips.

## References

Read these references at the stated times:

- Read `references/runtime-trust.md` before any action for the
  trust rules.
- Read `references/concurrency.md` in step 2 for actor isolation,
  Sendable values, tasks, and cancellation.
- Read `references/swiftui.md` in step 2 for state ownership, view
  identity, body work, and layout.
- Read `references/appkit-interop.md` in step 3 for one-gap
  AppKit bridges.
- Read `references/errors-and-api.md` in step 3 for typed failure,
  API shape, and availability.
- Read `references/accessibility.md` in step 4 for semantics,
  focus, keyboard, and verification ids.
