# Acceptance rubric

This is an engineering rubric for internal acceptance. It is not an official
Apple scoring system, and it should be tuned to the product rather than treated
as fixed.

Score against **rendered evidence**. A design scored from source code has not
been scored — the model will otherwise write flattering prose about work it
cannot see.

The scoring agent must not be the implementing agent. A model reviewing its own
output rationalizes rather than reviews.

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

Acceptance:

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
used where complexity warrants it? Is anything present that could be deleted?

**macOS nativeness.** Native components where native components exist. Menu-bar
commands. Keyboard and focus order. Window and resize behavior. Density
appropriate to sustained desktop work. Correct control geometry for control size.
No iOS pattern enlarged to desktop scale.

**Visual hierarchy and composition.** Does content dominate chrome? Alignment,
rhythm, optical balance, negative space. Is the first thing perceived the correct
thing?

**Liquid Glass correctness and restraint.** Glass confined to the functional
layer. No glass-on-glass. Containers for clusters. Concentric geometry. One
prominent tint. Scroll edge effects structural rather than decorative.

**Typography, color, and iconography.** Semantic roles rather than literals.
System font and system colors. SF Symbols first with labels where meaning is
ambiguous. Consistent symbol rendering.

**Interaction and motion.** Every animation explains causality. Interruption and
reversal behave. Hover has keyboard and menu equivalents. Selection, focus,
loading, and error states are all designed.

**Accessibility, localization, and input.** VoiceOver semantics, keyboard-only
operation, focus visibility, contrast, color independence, Reduce Motion and
Reduce Transparency behavior, text expansion, right-to-left.

**Performance, edge cases, and finish.** Large datasets, long strings, missing
values, offline, permission denied, destructive-pending. Glass effect count and
container batching. Frame pacing during resize.

## Hard failures

Any one of these rejects the feature regardless of score.

- Pervasive glass content cards.
- Independently overlapping or nested glass surfaces.
- Unreadable content over complex or bright backgrounds.
- Clipping or unusable behavior at the declared minimum window width.
- A keyboard-navigation dead end.
- A custom control weaker than an available native component.
- State communicated by color alone.
- Missing empty, loading, or error handling.
- Broken behavior under Reduce Motion, Reduce Transparency, or Increase Contrast.
- A destructive action with no confirmation, undo, or recovery.
- A toolbar action with no menu-bar command.
- No validation of the inactive-window appearance.
- No rendered output.
- The implementing agent is also the only approving reviewer.

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
