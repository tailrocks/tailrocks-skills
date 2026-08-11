# The handoff package

Never hand an agent a link to the whole design file. It produces context the
agent cannot use and hides the structure it needs.

Hand it a package.

## Contents

```
Design/
├── README.md                  what this is, and the source-of-truth order
├── ExperienceBrief.md         from tailrocks-macos-design
├── NativeComponentMap.md      from tailrocks-macos-design
├── DesignSource.md            approved frame links, version, date
├── DESIGN_MAP.md              symbol path → implementation
├── Tokens/                    pointer + provenance for Sources/DesignTokens/
├── RequiredStates.md          pre-implementation states from the design brief
├── MotionSpec.md              per animation: trigger, purpose, reduce-motion
├── CustomComponents/          one contract per custom component
├── Fixtures/                  normal, empty, large, long-strings, errors
├── Screenshots/
│   ├── approved/              paired light and dark
│   └── rejected/              with reasons
└── Acceptance/
    ├── Rubric.md
    └── CompletionCriteria.md
```

`RequiredStates.md` is produced from `tailrocks-macos-design`'s brief before
implementation; it is not the rendered capture matrix owned by
`tailrocks-macos-visual-qa`.

Generated Swift tokens live in the app target at `Sources/DesignTokens/`, so a
removed name fails the build. `Design/Tokens/` records that path and generation
provenance; it does not hold an uncompiled duplicate.

## Source-of-truth order

State this explicitly in the package README, because without it an agent will
follow a screenshot even where the screenshot contradicts platform behavior.

```
1. Current SDK behavior and the Human Interface Guidelines
2. Product purpose and user workflow
3. The native component map
4. The runnable native prototype
5. The approved design frames
6. Written geometry, token, and state specifications
7. Static screenshots
8. Inspiration and mood-board references
```

Consequences worth spelling out:

- Screenshot versus native toolbar behavior — **native behavior wins**.
- Design specifies a glass opacity, the framework provides the material — **the
  framework wins**.
- An intentionally approved custom visualization — **its specification wins,
  within that component**.
- The system appearance changes between OS versions — **the native component
  follows the system**, unless the product deliberately owns that appearance and
  says so in a contract.

## Screenshot specification

- Scoped per frame, not per page.
- 2x.
- **Always paired light and dark.** Apple's kit added dark mode for macOS
  specifically; a light-only set misses half the states.
- One directory per state, named for the state, so a reviewer navigates without
  opening files.
- Approved and rejected kept separately, with the rejection reason recorded next
  to the rejected image.

## Prompt for the implementing agent

```
Implement the approved macOS design from Design/.

Sources of truth, in the order given in Design/README.md.

Do not generate HTML, CSS, or web-style layout.

Classify each region using Design/NativeComponentMap.md.

For NATIVE regions:
  use the API named in Design/DESIGN_MAP.md
  do not reproduce Liquid Glass with custom blur, opacity, borders, gradients,
    shadows, or fixed corner radii
  preserve platform keyboard, focus, menu, accessibility, and resize behavior
  add the menu-bar command for every toolbar action

For NATIVE-COMPOSED regions:
  compose the standard components named in the map
  preserve the hierarchy and spacing roles
  add no cards or containers the composition does not need

For CUSTOM regions:
  follow the component contract, including every documented state
  provide keyboard and accessibility behavior
  respect Reduce Motion, Reduce Transparency, Increase Contrast, and
    Differentiate Without Color

Guard every symbol newer than the minimum deployment target and decide the
fallback.

Do not report the feature complete without rendered evidence per
Design/Acceptance/RequiredStates.md, an accessibility audit result, and a review
by an agent that did not implement it.
```

## What "pixel-perfect" means here

Literal pixel equality is the wrong target for a native app, and chasing it
produces worse software.

**For custom content, exact is right.** Spacing, alignment, custom graphics,
chart geometry, custom component dimensions, text roles, image cropping, icon
placement, and animation endpoints can be checked exactly at the canonical window
sizes. A reasonable internal target: custom geometry exact or within one point;
semantic spacing exact; text style exact; asset exact; state exact.

**For native controls, system-correct is right.** Do not require an agent to
reproduce the internal pixels of toolbar material, sidebar material, menu
shadows, button lensing, glass refraction, field geometry, or window chrome.
Require instead: correct component, correct placement, correct semantic role,
correct content and symbol, correct enabled and disabled state, correct keyboard
behavior, correct resizing, correct accessibility behavior, and no unsupported
custom appearance.

Because the material continuously adapts, static pixel matching actively
encourages the wrong implementation — a fixed imitation of one screenshot instead
of the correct dynamic system material.

The completion definition to use:

> Reference-exact at the agreed canonical states, and system-correct across every
> dynamic state.

## Corrections flow both ways

The native prototype will find things the design could not: a toolbar that does
not fit, a title that clips, a sidebar that is too wide, an inspector that ruins
the minimum width, a motion that feels wrong, a glass relationship that fails
over real content.

Update the design. Do not force the implementation to reproduce a static frame
that is structurally wrong for a resizable window. A design file that never
changes after handoff is not a source of truth, it is a historical document.
