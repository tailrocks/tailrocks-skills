# Design routes

The design route is the rendering half of the contract: a guarded route
group inside the real application that renders each designed screen from
fixture data. It exists so the reference is produced by the same pipeline —
Vite, Tailwind, tokens, installed components — that produces the product.

## The screen component is the shipped component

Each screen lives as one **pure presentational component**: props in,
markup out, no data fetching, no router coupling, no side effects.

```tsx
// src/components/screens/settings-screen.tsx
export interface SettingsScreenProps {
  profile: ProfileFixture;
  notifications: NotificationPrefs;
  state: "default" | "empty" | "loading" | "error";
}

export function SettingsScreen(props: SettingsScreenProps) { … }
```

- The design route renders it from fixtures; the real route later renders
  the same component from live loader data. That shared component is the
  structural half of 1:1 — there is no translation step where drift can
  hide.
- Because the component ships, it is production code: accessible markup
  (labels, roles, landmarks), real focus behavior, and strict types are
  design obligations, not implementation polish.
- Design mode may create the component and its prop types. Loaders,
  mutations, server functions, and route wiring for the real page stay
  unwritten.

## Route group and guard

```text
src/routes/design/route.tsx          # guard: 404 outside design mode
src/routes/design/index.tsx          # registry index: every screen × state
src/routes/design/$screen.$state.tsx # renders from the fixture registry
```

The guard is one rule: design routes respond only when
`import.meta.env.DEV` or `VITE_DESIGN_ROUTES=1`; otherwise they throw
`notFound()`. The env flag exists so the visual suite can run against a
production build; nothing else ever sets it.

## Fixtures

`src/design/fixtures/<screen>.ts` exports one fixture per state, keyed by
the state name the route consumes:

- Deterministic: fixed dates, ordered collections, no randomness — every
  derived string in a baseline flows from a fixture value.
- Realistic: real-length names, one too-long value, one unicode value, an
  error with a real message. A screen blessed on `foo` has not met its
  layout.
- Typed with the screen component's own prop types, so a design-time shape
  change is a compile error in the fixtures, not a surprise in the real
  loader.

The registry — one module listing every screen, its states, and its
fixture map — is the single enumeration the index route, the state route,
and the visual suite all walk. A state that exists only as a route param
string is a state the suite will silently skip.

## Components come from the library

Build screens from the installed shadcn/ui components; add missing ones
with the pinned CLI rather than approximating them. When a region genuinely
has no component answer, the custom markup lives inside the screen
component with a comment naming what was evaluated and why it fell short —
the same record a custom control owes anywhere else. Restyle by
composition and Tailwind utilities at the use site; never edit a generated
component's internals as a design decision without saying so in the
manifest, because that edit changes every screen that uses it.
