# The custom component contract

A `CUSTOM` classification is a claim that no standard component and no
composition of standard components can express the need. That claim costs the
product platform consistency, accessibility that would otherwise be free, and
future compatibility with system changes. It must be paid for with a complete
contract.

**A custom component without this contract is not ready for implementation.**

## Contract

```
Name:
Design frame or reference:
Code component:

## Product reason
What unique user need requires this component?

## Native alternatives considered
Which native components were evaluated?
Why was each insufficient?

## Layer
Content layer or functional control layer?
If functional and glass is proposed, justify per the Liquid Glass decision order.

## Geometry
Minimum size:
Ideal size:
Maximum size:
Resize behavior:
Internal alignment:
Spacing:
Corner radius and how it is derived (concentric, or fixed with a reason):

## States
Default:
Hover:
Keyboard-focused:
Pressed:
Selected:
Disabled:
Loading:
Error:
Empty:
Inactive window:

## Input
Pointer:
Keyboard, including focus order and shortcuts:
Trackpad gestures:
Drag and drop:
Context menu:
Menu-bar command equivalent:

## Accessibility
Label:
Value:
Role:
Custom actions:
Focus order:
VoiceOver behavior:
Behavior under Differentiate Without Color:
Behavior under Increase Contrast:

## Material
Standard content material, or Liquid Glass?
If glass: why, and which surrounding surfaces share its container?
Substitution under Reduce Transparency:

## Motion
Trigger:
Purpose:
Duration or spring behavior:
Interruption and reversal:
Rapid repeated input:
Reduce Motion behavior:

## Localization
Maximum expected text expansion:
Right-to-left behavior:

## Fallback
Behavior on the minimum supported macOS version:
Behavior when a forward-only API is unavailable:

## Acceptance
Reference screenshots:
Required previews:
Required UI tests:
```

## Review questions for the contract

- Does the product reason describe a **user need**, or a visual preference? A
  visual preference is not a reason.
- Would a composition of two native components satisfy the need? Compositions are
  routinely overlooked because they require naming two components instead of one.
- Does the states list include keyboard focus and inactive window? These two are
  omitted more often than all the others combined.
- Does the accessibility section describe behavior, or does it name a modifier?
  Naming `accessibilityLabel` is not an accessibility design.
- Is the corner radius derived or chosen? A chosen radius adjacent to a system
  container will be wrong after the next OS update.
- Is there a menu-bar command equivalent for every action the component exposes?

## After approval

An approved custom component becomes durable product knowledge:

- a reusable implementation component with a stable name,
- a prototype scenario rendering every variant under that same name, so the
  next feature reads the component by running it rather than by reading a
  picture of it,
- an entry in the component map with its allowed and forbidden customizations,
- preview fixtures covering every state in the contract,
- a regression case in the visual suite.

Without that step the next feature re-invents it slightly differently and the
product acquires two of everything.
