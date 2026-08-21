# The Design-Reference Substrate

One decision, stated once: **a design reference is real code running on the
real substrate.** A design-file tool is never the reference. This note records
the decision and where it is enforced; the skills themselves are the contract.

## The rule

A screen designed outside the application is a picture of a design. A screen
the application rendered is the design. Every design-reference skill in the
house produces the second kind, on the substrate the product ships on:

| Medium | Substrate | The reference is |
|---|---|---|
| Web | the real TanStack Start app — Vite, Tailwind, the installed shadcn/ui components | a guarded `/design/<screen>/<state>` route rendering the same pure screen component the real page ships, from typed fixtures |
| Native macOS | a real SwiftUI app on the real operating system | a small SwiftPM executable rendering the approved design's scenarios from fixture data, reviewed running |
| Terminal | ratatui through `TestBackend` | a golden frame produced by the application's own view functions |

Three properties follow, and they are the reason for the rule.

**The design cannot lie about the platform.** Apple's own UI kit contains zero
enabled blur effects, and Liquid Glass surfaces snapshot fully transparent from
a detached view. No file can be authoritative for a material the operating
system computes at composite time. The same holds more quietly on the web: a
drawn screen cannot tell you that a container queries its own width, that a
focus ring inherits a token, or that a component the library already ships
handles the state you were about to hand-draw.

**The reference is copyable.** Because the artifact is code on the shipping
substrate, "matches the design" stops being a review and becomes a mechanical
check. The web design route renders the component the real route renders. The
macOS prototype's view layer lifts verbatim into the app. Nothing is
transcribed, so nothing is transcribed wrongly.

**Fixtures are the only mock.** The prototype mocks its data and nothing else —
no persistence, no networking, no real services. Mocking the *renderer* is what
produces a frozen imitation of one screenshot; mocking the *data* is what makes
the design reviewable before the feature exists.

## What this rejects

A design-file tool as the reference — the exported artboard, the symbol
library, the component with variants, the handoff package, the spec sheet.
Rejected in every medium, not only where a material makes it obviously wrong.

The rejection is about the artifact's *role*, not about anyone's taste in
tools. Sketching on paper, in a whiteboard app, or in a design tool to think is
untouched: that is thinking, and it produces no artifact anything downstream is
measured against. The moment an artifact becomes the thing an implementation
must match, it has to be renderable by the product's own substrate, or the
match is a human judgment call forever.

Two failure modes make this worth a rule rather than a preference. A design
file that hard-codes appearance produces a frozen imitation of one screenshot,
and it drifts silently the first time the platform or the token set moves. And
a reference nobody can run gets "matched" by eye, once, by whoever implemented
it — which is how a design becomes a suggestion.

## How it is enforced

**Mechanically.** `scripts/validate-skills.ts` rejects design-file tool names
and artifact vocabulary in shipped skill content — `SKILL.md`, `references/`,
`templates/`. A line may name a tool in order to forbid it, since a prohibition
has to say what it prohibits; a line that names one without a negation reads as
an instruction to use it and fails. Bare "sketch" is an ordinary English verb
and is deliberately not matched.

The gate catches the mechanical half: a tool named, a file extension, an
artboard. It cannot catch an instruction that describes a design-file artifact
without naming a tool. That half is prose, and it belongs in each design
skill's own substrate law.

**In prose.** Each medium states the rule against its own rival, because the
tempting shortcut differs by medium: for the web it is a standalone HTML file
with hand-frozen CSS, for the terminal a hand-typed grid or a generator script,
for native macOS a screenshot or a drawn spec. Those laws are load-bearing and
carry rationalization counters, so they get a named section rather than a
mid-paragraph clause.

## The neighbouring rule it is not

"Real code only" does not mean *any* real code. An HTML prototype is not a
design source for a native macOS screen, and a native mock is not one for a web
page. The substrate has to be the one the feature ships on; a second renderer
is still a second renderer even when it compiles.

Nor does it collapse the design and verification skills into one. The design
reference is iterated live and blessed by a person. Freezing pixels from it is
a separate, later job with its own owner — and on native surfaces it must
screen-capture the running app, because a detached snapshot of a glass surface
is transparent.
