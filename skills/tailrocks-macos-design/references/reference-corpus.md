# Building taste that persists

Taste that lives only in a prompt evaporates between sessions. Taste encoded as a
corpus, a decision log, and rubric lines compounds.

**The starting corpus already exists** — read `exemplars.md` in this skill first.
It carries the Apple first-party reference models by app shape, the third-party
Mac exemplars, Apple's only two endorsed native-Mac Liquid Glass examples, a
practitioner postmortem, and the documented counter-examples. This file is how
you extend it with your own product's references and, more importantly, with your
own rejected output.

## Three corpora

### Positive references

Twenty to fifty annotated examples, starting from the ones in `exemplars.md`.
Screenshots in a folder are not a corpus — the annotation is the artifact.

For each reference record:

```
Application:
Screen:
User job:

What works:
- information hierarchy
- native structure
- density
- interaction model
- typography
- motion
- content presentation
- accessibility

Liquid Glass:
- where it appears
- where it deliberately does not appear
- the relationship between controls and content

Applicable to our product:
- ...

Do not copy:
- product-specific identity
- decorative styling
- interaction that does not match our user job
```

Four classes of source:

1. Apple first-party Mac applications that share your workflow shape.
2. Apple Design Award winners and finalists.
3. The strongest direct competitors.
4. Your own accepted screens.

Study restraint, hierarchy, onboarding, and cross-platform adaptation — never the
subject matter or the exact appearance. The award categories (interaction,
visuals and graphics, inclusivity, innovation, delight, social impact) are useful
as benchmark dimensions, but the product's own rubric stays more operational.

Award-level design includes VoiceOver, Increased Contrast, and Differentiate
Without Color — not only attractive screenshots. A reference that only documents
the default light appearance teaches the wrong lesson.

### Anti-references

More effective than any number of additional adjectives. For every recurring
failure, record the rejected output, the state it was in, why it was rejected,
the corrected version, and the principle learned.

```
Rejected:  Six independent glass cards inside a glass sidebar.
Reason:    Glass became content decoration; layer hierarchy collapsed; each
           card sampled the sidebar's refracted output rather than content.
Correction: Plain content sections inside one native sidebar material.

Rejected:  Every toolbar action rendered as a tinted glass capsule.
Reason:    No primary action was identifiable; controls competed with content.
Correction: Standard toolbar items plus exactly one prominent tinted action on
           the trailing side.

Rejected:  Dashboard of four equal cards despite one dominant workflow.
Reason:    Web-dashboard pattern obscured the product's information hierarchy.
Correction: One dominant workspace with a supporting inspector.
```

The standing anti-pattern list for macOS agent output:

- Glassmorphism cards used as ordinary content containers.
- Large floating capsules for every action.
- A card grid used because the product contains several concepts.
- Decorative gradients placed behind glass to make the material more visible.
- Custom blur imitating a system material.
- Excessive borders and shadows around every region.
- iPhone navigation patterns enlarged to desktop size.
- Hover-only actions with no keyboard or menu equivalent.
- Icon-only controls with ambiguous meaning.
- Small low-contrast text over translucent backgrounds.
- A fixed canvas instead of a resizable window.
- A modal sheet for information people need while working.
- A custom sidebar weaker than the native sidebar.
- A custom table built from stacks where native table behavior is required.
- Animated transitions with no Reduce Motion behavior.
- Designs reviewed only with placeholder content.
- Designs approved without screenshots.
- The same model generating and approving its own solution.
- "Premium", "luxury", or "futuristic" standing in for an explicit hierarchy.

### Decision log

Short records, one per settled question:

```
Decision:  Use an inspector rather than a modal settings sheet for record-level
           metadata.

Reason:    People inspect and edit metadata frequently while keeping context in
           the primary table.

Rejected alternatives:
- modal sheet
- expandable content cards
- a permanent third column

Consequences:
- the inspector must collapse at narrow widths
- a keyboard command toggles the inspector
- the selected record stays visible
```

This is how a product acquires one coherent visual language instead of being
redesigned from scratch on every agent invocation.

## Feeding the loop

After every approved feature:

1. Save the selected screenshots to the positive corpus with annotations.
2. Save the rejected alternatives with their reasons to the anti-reference
   corpus.
3. Add a decision record for anything that was genuinely contested.
4. Extract reusable components and tokens.
5. Add regression previews.
6. If a failure class appeared that no anti-pattern covered, add the anti-pattern
   or the rubric line.

Step 6 is the one that is always skipped and the only one that prevents the same
review comment being written a fourth time.

## A caution about accumulating guidance

More design guidance does not monotonically improve output. Focused, narrow
guidance outperforms comprehensive documentation, and the returns turn negative
once the material is large enough that the relevant part stops surfacing. A
corpus is a working reference, not an archive.

Practical policy:

- **One owner per responsibility.** Visual direction, material policy, framework
  correctness, and verification each have exactly one. Two sources of aesthetic
  judgement conflict, and the conflict is invisible in the output — it surfaces
  as inconsistency across features rather than as an error.
- **Reject web design defaults on sight.** Guidance written for the web commonly
  says to avoid system fonts, avoid neutral grays, and avoid spring easing. All
  three are reasonable there and wrong here: on Apple platforms the system font,
  semantic neutrals, and interruptible springs are the correct tools. A rule
  that cannot name why it applies to macOS does not apply to macOS.
- **Prune on the same cadence you add.** An entry that no longer changes a
  decision is deleted, not archived. When a reference is superseded by an OS
  release, replace it — a corpus documenting a superseded appearance teaches the
  superseded appearance.
- **Re-derive before adopting.** Any borrowed idea earns its place only after it
  is confirmed against current Apple documentation or an SDK probe. An idea that
  cannot be re-derived is an opinion, and it goes in the decision log with an
  owner rather than into the rules.
