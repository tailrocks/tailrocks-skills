# Web screen craft

Taste rules for screens in the house web stack. The recurring failures:
improvised markup where a component exists, states nobody designed, light
theme treated as the design and dark as an afterthought, and copy invented
at implementation time.

## Composition

- **Installed components first.** Every region maps to a shadcn/ui
  component or a composition of them before any custom markup is
  considered; missing components are added with the pinned CLI. A
  hand-rolled card, dialog, or switch forfeits the library's accessibility,
  keyboard behavior, and future fixes.
- Spacing and sizing come from the Tailwind scale; arbitrary values
  (`p-[13px]`) are a design smell that the manifest must justify or the
  screen must lose.
- Layout is flex and grid with `max-w-*` content columns; wide content
  scrolls in its own container, never the page sideways.

## States

Every screen designs four states or records why one cannot exist:

- **default** — realistic fixture data at realistic volume.
- **empty** — teaches the next action; never a bare blank region.
- **loading** — skeletons or placeholders that occupy the final layout, so
  arrival does not reflow.
- **error** — names the failure, preserves what still works, and offers
  recovery. Destructive flows design their confirmation state explicitly.

## Themes and viewports

- Light and dark are equal citizens: every state is designed and captured
  in both, through the app's token system — never per-screen color
  overrides. A screen that only works in one theme is half a screen.
- Two pinned viewports (desktop and mobile) per screen; responsive
  behavior is rules — what stacks, what collapses, what drops — pinned by
  the two baselines, not a baseline per width.

## Copy and content

- Copy is design: headings, helper text, button labels, empty-state
  guidance, and error messages are fixture values the user blesses, not
  strings the implementer invents later.
- Fixtures include a too-long value and a unicode value so truncation and
  wrapping are designed, not discovered.

## Accessibility

The screen component ships, so its markup is the product's markup: labels
bound to inputs, real roles on interactive elements, landmarks and heading
order, focus-visible states, and readable contrast in both themes through
the token system. The design route is where these are cheapest to get
right and where review sees them rendered.
