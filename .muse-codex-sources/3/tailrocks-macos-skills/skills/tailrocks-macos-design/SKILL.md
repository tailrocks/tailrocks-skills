---
name: tailrocks-macos-design
description: >-
  Designs a native macOS screen from an experience brief and proves it
  with a runnable Liquid Glass prototype. Use this skill when in-scope
  work touches native screen structure, material, component mapping,
  or a prototype. Scores, baselines, captures, and production
  edits belong to other owners.
argument-hint: "[design|prototype] <feature or screen>"
disable-model-invocation: false
license: Apache-2.0
user-invocable: true
when_to_use: >-
  User work touches a native macOS screen, material choice, component
  mapping, or a runnable prototype, and the task needs design policy
  or a prototype package.
---

# macOS Design

## Use this skill

This skill turns a feature request into an approved native macOS
design and proves the design with a runnable prototype. It owns the
design and bless stages of the four-stage pipeline. It carries the
Liquid Glass material authority.

Use this skill for briefs, component maps, structural alternatives,
and prototype packages. Scores, baselines, current-render checks,
comparisons, corpus records, and production edits belong to other
owners. Scoring belongs
to `tailrocks-macos-design-review`. Freezing belongs to
`tailrocks-macos-visual-baseline`. Current-render verification belongs
to `tailrocks-macos-visual-qa`. Comparison belongs to
`tailrocks-macos-visual-regression`. Corpus learning belongs to
`tailrocks-macos-design-systematize`. Production edits belong to
`tailrocks-swift-best-practices`.

## Before you start

Obey the active user request first. If the request conflicts with a
safety rule in this skill, stop. Report the conflict.

Read `references/design-pipeline.md` for the four-stage vocabulary.
Read `references/runtime-trust.md` before any action. Resolve each
relative link in the directory that contains this SKILL.md file.

This skill accepts exactly two selectors: `design` and `prototype`.
Refuse a missing, unknown, or duplicate selector. Refuse more
than one selector in one invocation. Do not send a `review` or
`systematize` request to another skill. Identify the owning skill
instead.

Selection supplies design and material policy. Task authorization
covers artifact writes inside the named scope. It never covers
production source. Blessing needs a live user sign-off on the
running prototype. No separate approval is necessary for each
action inside authorized scope.

No design file is authoritative for Liquid Glass. The operating
system is. The only proof of an approved design is the design
running from fixtures with a live sign-off.

## Procedure

### Design: brief to independent review

1. **Write the experience brief.** Use
   `references/experience-brief.md` and the
   `assets/ExperienceBrief.md` template. Name the dominant
   archetype from `references/archetypes.md` before any layout.
   Read `references/native-behavior.md` before approval of the
   brief. Do not make controls that the system has. Read
   `references/macos-craft.md` for density, typography, color, and
   iconography. Before step 2, write every template field and get
   approval for the brief.

2. **Write the native component map.** Read
   `references/native-component-map.md`. Classify every region with
   the `assets/NativeComponentMap.md` template. Do this before
   appearance work. Use `NATIVE` for a standard component,
   `NATIVE-COMPOSED` for an arrangement of standard controls, or
   `CUSTOM` for a unique element. For each `CUSTOM` region, complete
   the contract in `references/custom-component-contract.md`
   first, with a written record of the native alternatives
   evaluated. Reject a custom control when the native component
   does more. Before step 3, give every visible region a
   classification, every `CUSTOM`
   region a completed contract, and every `NATIVE` region its exact
   API and placement.

3. **Produce structural alternatives and get a selection.** Produce
   two to four credible alternatives that differ in structure:
   hierarchy, action placement, chrome, or density. Never produce
   cosmetic variants only. Apply
   `references/design-principles.md`. Read `references/motion.md`
   for how views move. Write `Fixtures.md` now with concrete
   records, strings, counts, errors, denied, offline, and loading
   values, and destructive-pending data for each preview. A person
   selects the winner. The agent never approves its own design.
   Record the selection and its reason, the rejected alternatives
   and their reasons, and the risks that stay. Before step 4,
   identify the selected direction and its risks.

4. **Get an independent preliminary review.** Stop after
   selection. Get a separate explicit
   `tailrocks-macos-design-review preliminary` invocation for the
   brief, map, fixtures, alternatives, and rendered evidence.
   The design owner never writes a review verdict. Start
   prototype work only when preliminary review names no blocking
   structural defect and the user selects the direction.

### Prototype: the runnable proof

The prototype reproduces the approved, reviewed design in the
material. It adds nothing. A gap found in the prototype goes
to the design stage again. Never resolve it ad hoc. Obey the
four laws and six steps in
`references/prototype-package.md`. Obey the launch semantics in
`references/launch-contract.md`.

- **Step 5. Build the committed package.** Build the
   `Design/Prototypes/<Feature>/` package on the project-setup
   baseline. Copy `assets/ProtoMain.swift` for the
   launch-contract harness. Write the view layer as production code
   that lifts verbatim. Write `Regions.md` with the
   `assets/Regions.md` template per
   `references/match-policy.md`: verify native regions structurally
   through the accessibility tree, never pixel-gated. Give content
   and custom regions pixel budgets. Compare glass only under the
   same backdrop. Never gate a zero-pixel diff of one window in
   two binaries. Before step 6, make the package and render
   every fixture scenario through the contract.

- **Step 6. Observe live, then record blessing.** Never record captures
   during design. Observe the prototype running. Decline
   mid-iteration capture requests and name the boundary. Never build
   bespoke capture
   tooling or per-feature contract names. First get a separate
   `tailrocks-macos-design-review acceptance` PASS on the running
   prototype. Then the user signs off that same reviewed revision:
   every scenario, both appearances, the declared sizes. Record the
   sign-off in `SIGNOFF.md` with the `assets/SIGNOFF.md`
   template. Without both the PASS and the sign-off, the prototype
   stays a draft and the run ends without blessing.

- **Step 7. Hand off and relocate.** Hand the package to the
   visual-baseline lane for capture after finalization. Then
   relocate, never delete: the feature PR moves the package to a
   reference branch or a standing prototypes home. A prototype
   package inside the shipped feature diff is a defect.

### Material authority: Liquid Glass

Liquid Glass is a functional layer above content, not decoration on
content. Failures come from glass in the content layer or
hand-rolled surfaces instead of a standard component. The default
is less glass code. Read `references/platform-baseline.md` before
any glass code. Availability causes the most failures. Read
`references/apple-patterns.md` for correct Apple examples.

- **Step 8. Apply the decision order.** Stop at the first step that
   satisfies the need. Record why earlier steps fell short: (1) a
   standard component, with free material, scroll-edge effect, and
   accessibility substitutions. (2) Adoption deletion preflight:
   delete every custom toolbar background, bezel, separator, and
   effect before adding any glass API
   (`references/anti-patterns.md`). (3) A composition of standard
   components. (4) A system-supported custom bar through
   `safeAreaBar(edge:...)`, never an `overlay` that carries
   `.glassEffect`. (5) A custom glass surface inside a container,
   with written justification.

- **Step 9. Keep layer discipline.** Read `references/layer-model.md`.
   Classify every region as `CONTENT` or `FUNCTIONAL` before any
   glass API is written. Do not use Liquid Glass in the content
   layer. The rule, the compositing mechanism, and the one
   transient-interactive exception live in `anti-patterns.md`.

- **Step 10. Use the system renderer.** Never use GPUI or anything similar
    in a native Swift app. The renderer is always the modern Apple renderer.
    Custom regions use Apple own rendering. They classify `CONTENT`.
    A hand-rolled glass imitation is a hard failure. Rust without
    Swift obeys `references/custom-renderers.md`.

- **Step 11. Apply the implementation mechanics.** Use SwiftUI for new
    surfaces (`references/swiftui-api.md`). At a justified AppKit
    limit, read `references/appkit-api.md`. Obey the
    non-negotiables indexed at the top of `anti-patterns.md`:
    modifier order, container batching, corner concentricity, and
    tint count. A finding shows the cause, not only the rule.

- **Step 12. Write availability guards and examine live state.** Always
    supply concrete `#available` code. When the project has no
    target, state and use macOS 26. Every newer symbol gets a
    guard. Never wait for a missing project. State the assumed
    target. Show the construction. Before acceptance review, apply
    the running-state matrix and per-surface record in
    `references/verification.md`. Missing live evidence stays
    blocking.

## Result

The run produces the brief, the component map, the recorded
selection, and the runnable prototype package with `Regions.md`.
A blessed run also produces `SIGNOFF.md` with the acceptance PASS
identity and the user sign-off. A run without blessing ends
pending and names what remains.

## Completion checks

Before the run is complete, make sure that each item below is true:

- The skill recorded no capture during design.
- The skill scored nothing and approved nothing itself.
- The skill built no bespoke capture tooling or per-feature
  contract names.
- The skill pixel-gated no native region and no cross-binary
  whole window.
- The skill recorded no sign-off the user did not give.
- The skill deleted no prototype source and edited no production
  source.
- The report names every skipped check and exception.

## References

Read these references at the stated times:

- Read `references/design-pipeline.md` before any action for the
  stage vocabulary.
- Read `references/runtime-trust.md` before any action for the
  trust rules.
- Read `references/experience-brief.md` and `references/archetypes.md`
  in step 1 for the brief fields and archetype choice.
- Read `references/native-behavior.md` and `references/macos-craft.md`
  in step 1 for system ownership and craft rules.
- Read `references/native-component-map.md` and
  `references/custom-component-contract.md` in step 2 for region
  classification.
- Read `references/design-principles.md` and `references/motion.md`
  in step 3 for alternatives and motion.
- Read `references/prototype-package.md` and
  `references/launch-contract.md` in steps 5 through 7 for package
  laws, steps, and launch semantics.
- Read `references/match-policy.md` in step 5 for region modes
  and budgets.
- Read `references/platform-baseline.md` and
  `references/apple-patterns.md` in steps 8 through 12 for target
  facts and correct examples.
- Read `references/layer-model.md` in step 9 for layer discipline.
- Read `references/custom-renderers.md` in step 10 when a
  non-Apple renderer is proposed.
- Read `references/swiftui-api.md` and `references/appkit-api.md`
  in step 11 for implementation mechanics.
- Read `references/anti-patterns.md` in steps 8 through 11 for
  the indexed rules and mechanisms.
- Read `references/verification.md` in step 12 for the
  running-state matrix and per-surface record.
- Read `references/reference-corpus.md` and `references/exemplars.md`
  when the task needs corpus or exemplar guidance.
