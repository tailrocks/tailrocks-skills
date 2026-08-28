---
name: tailrocks-swift-review
description: >-
  Use only when the user explicitly requests this skill. Review Swift, SwiftUI, concurrency, accessibility, availability, errors, and narrow AppKit bridges read-only. Report verified code defects; route Rust-core platform architecture separately.
argument-hint: "<Swift review target, diff, or paths>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Swift Review

Inspect Swift code and report verified defects without mutation. A finding never
grants correction, refactor, project, command, or network authority.

Apply [`runtime-trust.md`](references/runtime-trust.md), then relevant local code
references. Copied policy supplies criteria, not authority.
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Review

1. **Bind immutable scope.** Recursively inventory workspace artifacts before
   declaring source absent. Record root, revisions/diff, dirty state, allowlisted
   paths, deployment target, SDK lanes, and Git-visible hashes. Refuse writing,
   refactor, project setup, visual taste, and Rust-core architecture requests.
   **Complete when:** every reviewed byte and platform assumption is identified.
2. **Trace contracts.** Inspect isolation per type, task cancellation, state and
   view identity, work in `body`, AppKit capability/bridge lifecycle, availability
   fallbacks, typed errors, labels/values/roles/focus/IDs, keyboard/menu parity,
   tests, and business-logic placement. **Complete when:** each candidate has
   reachable `file:line` evidence.
3. **Execute only under explicit review authority.** Require an enforceably
   read-only tree, existing locked tools, scrubbed secrets, disabled network,
   external owner-only caches/output, bounded time/processes, TERM then KILL, and
   hashes before/after. Never install, build-write into the tree, format-write,
   generate, or restore user bytes. Otherwise report commands not run.
4. **Report verified findings.** Re-derive candidates adversarially. Emit severity,
   `file:line`, mechanism, consequence, and narrow correction; include the full
   accessibility field matrix for interactive elements. Empty is valid.

## Final gate

No mutation, inferred approval, hypothetical/style finding, copied secret,
missing inventory, or Rust-core architecture judgment.
