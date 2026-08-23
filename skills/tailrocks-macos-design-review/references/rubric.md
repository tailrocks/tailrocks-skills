# Acceptance rubric

This is an engineering rubric for internal acceptance. It is not an official
Apple scoring system, and it should be tuned to the product rather than treated
as fixed.

Score against **rendered evidence**. A design scored from source code has not
been scored — the model will otherwise write flattering prose about work it
cannot see.

Rendered evidence is the design *running*: the prototype app
judged live, or captures `tailrocks-macos-visual-baseline` froze from it after
finalization, or the shipped screen itself. A design file, an exported image,
and a mockup are none of these — they are a picture of the screen, and a
picture cannot show a material the operating system renders.

Two passes share the rubric. A `preliminary` direction has no prototype yet:
score its brief, map, fixtures, alternatives, and any live evidence; mark
unassessable categories zero. Its verdict is `PRELIMINARY` when no blocking
structural defect remains, never PASS. An `acceptance` review drives the running
prototype and requires the complete evidence matrix; only it can return PASS.

**Evidence integrity:** a named capture matches its declared window size exactly
(pixels = backing scale × logical size, with chrome height noted); verify
dimensions, not filenames. Every non-inactive capture shows colored traffic
lights, or it cannot support appearance, selection, or enabled-state claims.

The scoring agent must not be the implementing agent. A model reviewing its own
output rationalizes rather than reviews.

## Evidence classes

Every finding states how it is known. This is the difference between a review
and an opinion, and it stops the two most common review lies in both directions:
claiming a behavior is broken from reading source, and claiming a layout works
without ever rendering it.

| Class | Means |
|---|---|
| **code-certain** | directly visible in source or project configuration |
| **render-certain** | directly visible in a capture or preview |
| **behavior-tested** | reproduced by driving the running app |
| **inferred** | plausible, unverified |

**Never present an inferred behavior as a fact.** An inferred finding is a
question for the next pass, not a defect to fix.

Note which classes a finding can even reach. "The toolbar action has no menu
equivalent" is code-certain. "The focus ring is invisible on glass" is
render-certain at best. "Undo restores the selection" is behavior-tested or it
is nothing.

## Finding format

```text
[P1] Missing menu equivalent for Export
Evidence:       code-certain + behavior-tested
Location:       MainWindow toolbar / File menu
Impact:         the toolbar can be hidden or customized, so keyboard users
                cannot discover or reach the action
Recommendation: add File ▸ Export…, and route the toolbar item and the menu
                item to one command
Verification:   hide the toolbar, invoke the menu item, confirm the shortcut
                appears and the disabled state is correct
```

The `Verification` line is the one that is always omitted and the one that makes
the finding actionable — it tells the next agent how to know the fix worked.

Severity:

- **P0** — blocking. Data loss, an inaccessible core task, unreadable content or
  material, broken destructive semantics, unusable at a supported window size.
- **P1** — major. A platform-model violation, a missing important command or
  state, weak architecture or selection, a serious consistency or accessibility
  failure.
- **P2** — minor. Friction, ambiguity, or a visible craft defect with a
  workaround.
- **P3** — polish. A refinement with no meaningful task impact.

## Categories

| Category | Weight |
|---|---|
| Product clarity and information architecture | 15 |
| macOS nativeness | 20 |
| Visual hierarchy and composition | 15 |
| Liquid Glass correctness and restraint | 15 |
| Typography, color, and iconography | 10 |
| Interaction and motion | 10 |
| Accessibility, localization, and input | 10 |
| Performance, edge cases, and finish | 5 |
| **Total** | **100** |

Acceptance PASS:

```
Total score:      at least 90 / 100
Any one category: at least 60% of its available points
Hard failures:    zero
Rendered evidence: mandatory
Reviewer:         not the implementing agent
```

A category minimum matters as much as the total. A 92 built from a perfect visual
score and a failing accessibility score is a worse product than an 88 that is
even.

## What each category is asking

**Product clarity and information architecture.** Is the primary job obvious from
the screen? Does the layout reflect the object model? Is progressive disclosure
limited to advanced or rare controls, with nothing primary hidden? Is anything
present that could be deleted?

Full: primary job and object model are immediate. Partial: one secondary ambiguity. Failing: primary workflow or hierarchy is hidden.

**macOS nativeness.** Native components where native components exist. Menu-bar
commands, with every toolbar action present as one. Keyboard completeness and
focus order, with the focus ring always visible. Standard selection, context
menus, drag and drop. Window and resize behavior across the supported range.
Density appropriate to sustained desktop work. Correct control geometry for
control size — capsules reserved for prominent controls, rounded rectangles for
dense ones. No iOS pattern enlarged to desktop scale. No command palette standing
in for the menu bar.

The full contract is in `native-behavior.md`; this category scores against it.
Continuity belongs to this category.

Full: native behavior and restoration are complete. Partial: one minor convention gap. Failing: non-native core behavior or lost window state.

**Visual hierarchy and composition.** Does content dominate chrome? Alignment,
rhythm, optical balance, negative space. Is the first thing perceived the correct
thing?

Full: content dominance and rhythm are clear. Partial: local imbalance. Failing: chrome dominates or hierarchy reverses.

**Liquid Glass correctness and restraint.** Score glass violations against
the layer model and anti-patterns (`layer-model.md`, `anti-patterns.md`); hard failures there are
hard failures here. Keep this category's weight unchanged.

Full: every glass rule is verified. Partial: one bounded correction. Failing: content glass, overlap, or unreadability.

**Typography, color, and iconography.** Semantic roles rather than literals.
System font and system colors. SF Symbols first with labels where meaning is
ambiguous. Consistent symbol rendering.

Full: semantic type, color, and icons throughout. Partial: isolated literal. Failing: illegible or misleading visual language.

**Interaction and motion.** Every animation explains causality. Interruption and
reversal behave. Hover has keyboard and menu equivalents. Selection, focus,
loading, and error states are all designed. Interaction latency belongs here.

Full: causal motion and immediate response. Partial: minor lag or motion gap. Failing: blocked input or decorative motion obscures state.

**Accessibility, localization, and input.** VoiceOver semantics, keyboard-only
operation, focus visibility, contrast, color independence, Reduce Motion and
Reduce Transparency behavior, text expansion, right-to-left.

Full: all modes and inputs verified. Partial: one recorded gap. Failing: inaccessible core task or color-only state.

**Performance, edge cases, and finish.** Large datasets, long strings, missing
values, offline, permission denied, destructive-pending. Glass effect count and
container batching. Frame pacing during resize.

Full: adverse fixtures and resize stay sound. Partial: bounded edge defect. Failing: ideal-data-only review or unusable supported state.

Two axes are explicitly owned above because failing either makes every other
score irrelevant to the person using the app:

- **Interaction latency**, distinct from frame rate. A control acknowledges input
  the moment it is used, even when the work behind it is asynchronous. Menus open
  immediately, selection changes immediately, loading does not move the layout.
- **Continuity.** Windows, positions, sizes, sidebar width, inspector state,
  expanded sections, selection, sort, filters, and search scope all survive a
  quit and relaunch — per window, not per app.

## Hard failures

Any one of these rejects the feature regardless of score.

- Glass violations that `verification.md` classifies as hard failures.
- Unreadable content over complex or bright backgrounds.
- Clipping or unusable behavior at the declared minimum window width.
- A keyboard-navigation dead end.
- A custom control weaker than an available native component.
- State communicated by color alone.
- Missing empty, loading, or error handling.
- Broken behavior under Reduce Motion, Reduce Transparency, or Increase Contrast.
- A destructive action with no confirmation, undo, or recovery.
- **A path by which a person can lose work.** This outranks every visual finding
  in the list.
- **Window state not restored across quit and relaunch** — position, size,
  sidebar width, open documents.
- A command reachable only through a command palette, with no menu equivalent.
- A function reachable only by hover, or only by drag and drop.
- A toolbar action with no menu-bar command.
- No validation of the inactive-window appearance.
- No rendered output.
- The implementing agent is also the only approving reviewer.

## Score caps

Hard failures void acceptance; the capped score is still computed and reported
for planning. Caps are the graded companion: they say *how far
from shippable* a feature is when the failure is real but the work is otherwise
sound, which is more useful for planning than a bare rejection.

Regardless of the points actually earned:

| Condition | Cap |
|---|---:|
| A person can lose work, or restoration is critically broken | **49** |
| A core task is not reachable by keyboard | **59** |
| Material is unreadable under a supported accessibility setting | **59** |
| A major window fails at a supported size | **59** |
| The menu and command model is incomplete | **69** |
| Only ideal placeholder data was reviewed | **69** |
| The implementing agent is the only reviewer | **79** |

The last two are process caps rather than product caps, and they are the ones a
team is most tempted to waive. Do not. A 92 scored on placeholder data by the
agent that wrote it is not a 92; it is an unreviewed design with a number
attached.

## Preserve

Every review includes a **Preserve** section naming what must *not* change:

- strong incumbent patterns,
- correct native behavior already in place,
- effective identity,
- good use of restraint,
- components that should not be redesigned.

Without it, review drives churn: each pass rewrites the previous pass's
intentional decisions because nothing recorded that they were intentional. An
agent handed a findings list with no Preserve section will treat every unmodified
thing as fair game.

## Stopping

The polish loop is bounded:

1. Collect every P0 and P1, plus the high-value P2s.
2. Fix by system, not one pixel at a time — a finding that recurs in six places
   is one systemic fix, not six.
3. Re-render the state matrix and re-run the behavior checks.
4. One confirmation review.
5. **Stop** when no hard failure and no cap remains, and further change is
   subjective or low value.

Step 5 is a real instruction. Unbounded polishing is its own failure mode: it
consumes the budget that the next feature's structural work needed, and it
produces changes no one asked for on a design that was already accepted.

## Correction order

Severity order, not convenience order:

1. Broken user workflow.
2. Incorrect information architecture.
3. Non-native interaction.
4. Accessibility failure.
5. Content hierarchy.
6. Resize behavior.
7. Liquid Glass misuse.
8. Typography and spacing.
9. Motion and micro-polish.

Do not spend three iterations tuning corner radii while the workflow is
structurally wrong. Nine is where taste finally shows, and it is worthless before
one through four are clean.

## Pairwise comparison

When choosing between alternatives, "is this beautiful?" produces noise. Ask
instead:

```
Which of A and B better satisfies the primary job, and why?

Evaluate in order:
1. task clarity
2. macOS nativeness
3. content hierarchy
4. Liquid Glass restraint
5. resize behavior
6. accessibility
7. visual coherence
```

Compare **matched states** — the same content, the same window size, the same
appearance. Comparing A in light at full width against B in dark at minimum width
measures nothing.

Record the winner, the reason, and the rejected alternative. Over time this is
what the product's taste is actually made of.

## Operating metrics

Track these across features rather than judging any single screen:

```
100% of material UI changes have named previews
100% have minimum-width and dark-appearance validation
100% have independent visual and accessibility review
  0 custom components without a written contract
  0 accepted changes with hard failures
Every repeated rejection becomes a documented anti-pattern or a rubric line
```
