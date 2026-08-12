# AppKit interop

A modern Mac app is SwiftUI-native. Existing AppKit apps migrate incrementally
toward SwiftUI app, scene, and UI ownership; AppKit remains only behind narrow,
replaceable bridges for capabilities current stable SwiftUI does not express.

## When AppKit is the right answer

- Mature table and outline behavior: column reordering and resizing, very large
  data sets, complex selection, inline editing.
- Advanced text editing beyond what the SwiftUI text views express.
- Window management beyond what scenes express.
- Responder-chain integration and services.
- Specialized drag and drop, including promised files.
- Precise pointer behavior and tracking areas.

## When it is the wrong answer

- Because SwiftUI's version needed learning.
- To reproduce a design that should have been a native component.
- To hand-build a control the system already provides.
- To hand-roll a material. The system renders the real one; an imitation freezes
  one appearance and stops adapting.

## Bridge narrowly

A representable view that wraps **one control with a typed boundary** is a good
trade. A representable view that owns a large surface of behavior is a second
architecture hiding inside the first.

Rules for a bridge:

- Inputs enter through the typed initializer and `makeNSView(context:)` /
  `updateNSView(_:context:)`. Outputs leave through a coordinator and typed
  callbacks — never a shared mutable reference.
- `updateNSView(_:context:)` is called often. Make it idempotent, and compare before
  assigning so an assignment does not trigger a change notification that
  re-enters the update.
- The coordinator owns delegate conformance and observation. `makeCoordinator()`
  creates it once per represented view; it survives re-created representable
  values while view identity holds. Tear down in
  `dismantleNSView(_:coordinator:)`, never `updateNSView`.
- Size through `sizeThatFits(_:nsView:context:)`, not a fixed frame.

## Isolation across the bridge

AppKit is main-actor bound. State the isolation of anything crossing the bridge
rather than letting inference decide, and do not let a coordinator become the
place where background work quietly hops to the main actor for every event.

## Material at the boundary

Two mistakes recur at the interop boundary:

- Placing a glass view **behind** content as a sibling. On AppKit, content goes
  **inside** the glass view's content view. A sibling arrangement does not
  composite as a glass surface.
- Leaving a visual-effect view inside a popover or sheet content view. Those
  custom backgrounds are exactly what the adoption guidance says to remove.

Corner geometry is the other trap: AppKit had no concentric-corner API before
macOS 27. On macOS 26 either host the surface in SwiftUI, or derive the radius
explicitly and record that it must be revisited when the window corner radius
changes — which it did in 26 and does again in 27.

## Bridging the other direction

`NSHostingView` embeds a SwiftUI view in an AppKit hierarchy;
`NSHostingController` is for view-controller containment. Use `sizingOptions`
when intrinsic-size reporting must be selected explicitly.

Hosting SwiftUI inside AppKit is the correct move for incremental modernization
and for getting SwiftUI-only capabilities into an existing Mac app. Two notes:

- A hosting controller's view participates in the AppKit layout system; give it
  real constraints rather than a fixed frame.
- Environment values do not cross the boundary automatically. Anything the hosted
  hierarchy needs must be injected explicitly at the hosting point, and a missing
  injection surfaces as a subtly wrong appearance rather than a compile error.

## Apple direction

- [SwiftUI](https://developer.apple.com/swiftui/) — Apple's primary declarative UI framework, designed to coexist with AppKit during adoption.
- [App organization](https://developer.apple.com/documentation/swiftui/app-organization) — `App` and `Scene` define modern app structure.
- [AppKit integration](https://developer.apple.com/documentation/swiftui/appkit-integration) — hosting and representable APIs define the bridge boundary.
- [Use SwiftUI with AppKit and UIKit (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/272/) — Apple's current incremental migration path, including SwiftUI scenes in AppKit apps.

## Review questions

- Could this be a native SwiftUI component? Name the one evaluated and why it was
  insufficient.
- Is the bridge one control, or an architecture?
- Is the update method idempotent, and does it avoid re-entrant notifications?
- Who owns the coordinator's lifetime?
- Does anything cross the bridge without stated isolation?
- Is a material being hand-rolled where the system would render it?
