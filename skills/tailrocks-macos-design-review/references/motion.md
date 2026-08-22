# Motion

Motion is the axis where "feels right" has an actual mechanical definition, so
it is the axis where a review can be decisive rather than aesthetic.

Apple's motion guidance carries the note *"No additional considerations for iOS,
iPadOS, macOS, or tvOS"* — the general rules **are** the macOS rules.

## Purpose

> Beautiful, fluid motions bring the interface to life, conveying status,
> providing feedback and instruction, and enriching the visual experience.

Distinguish, and require a stated purpose for each: state-transition continuity,
spatial explanation, direct-manipulation feedback, focus transition, navigation
transition, selection feedback, loading, error recovery — and decoration. Only
the last is optional, and it is the one an agent adds by default.

## The prohibitions, verbatim

> **Add motion purposefully, supporting the experience without overshadowing
> it.** Don't add motion for the sake of adding motion. Gratuitous or excessive
> animation can distract people and may make them feel disconnected or physically
> uncomfortable.

> **Make motion optional.** Not everyone can or wants to experience the motion in
> your app or game, so it's essential to avoid using it as the only way to
> communicate important information.

> **Strive for realistic feedback motion that follows people's gestures and
> expectations.** … For example, if someone reveals a view by sliding it down from
> the top, they don't expect to dismiss the view by sliding it to the side.

> **Aim for brevity and precision in feedback animations.** When animated feedback
> is brief and precise, it tends to feel lightweight and unobtrusive, and it can
> often convey information more effectively than prominent animation.

> **In apps, generally avoid adding motion to UI interactions that occur
> frequently.** The system already provides subtle animations for interactions
> with standard interface elements.

> **Let people cancel motion.** As much as possible, don't make people wait for an
> animation to complete before they can do anything, especially if they have to
> experience the animation more than once.

Two of these are testable pass/fail rather than judgement calls:

- **The reversal criterion.** Dismissal must reverse the reveal along the same
  axis. A sheet that slides down from the top and dismisses sideways is a defect.
- **The cancellation criterion.** Any animation a person must sit through twice
  is a defect.

## The physics criterion — why springs, not durations

This is the part that turns motion review from taste into mechanics. Apple's
statement of what "natural" means:

> If an object starts in one place, and then suddenly appears somewhere else, it
> feels jarring, and can sometimes be confusing. … But it's not just about the
> position. **If an object's velocity suddenly changes, that also feels
> unnatural.** … So one goal we have is to make our animations have **continuous
> position and velocity.**

> Springs are the only type of animation that maintains continuity both for static
> cases and cases with an initial velocity.

And on interruption:

> Sometimes, while an animation hasn't yet finished, a new animation begins that
> changes to a new target value. When that happens, a spring animation uses the
> velocity it had when it was retargeted as the initial velocity towards its new
> destination, and **this same velocity preservation makes these kind of
> interruptions feel smooth and natural.**

**The reviewable consequence:** a duration-based easing curve cannot preserve
velocity through an interruption. So any interruptible, gesture-driven, or
retargetable motion implemented with an easing curve plus a duration is a defect
**by Apple's own stated criterion**, not a preference. That is a finding a review
can state flatly.

Bounce calibration, for the cases where a spring is right:

> A small bounce, like around 15%, doesn't feel very bouncy yet … for larger
> bounce values like 30%, you do start to feel some noticeable bounciness.

On transitions specifically: a zoom transition *"can increase the sense of
continuity in your app by keeping the same UI elements on screen across the
transition."* Prefer spring-based animation *"especially in UI where maintaining
continuous velocity is important."*

## Input sensitivity on the Mac

Liquid Glass itself responds differently by input:

> [It] responds to direct touch interaction with greater emphasis to reinforce
> the feeling of a tactile experience, but produces a **more subdued effect when a
> person interacts using a trackpad.**

Motion tuned on a touch device will read as overdone on a Mac. Tune on the Mac,
with a trackpad and with a mouse.

## Reduce Motion

The obligations live in the accessibility guidance, not the motion guidance —
which is why they are routinely missed.

> Be cautious with fast-moving and blinking animations. When you use these effects
> in excess, it can be distracting, cause dizziness, and in some cases even result
> in epileptic episodes. … When this setting is active, ensure your app or game
> responds by **reducing automatic and repetitive animations, including zooming,
> scaling, and peripheral motion.**

Apple's own list of what to do:

- > Tightening animation springs to reduce bounce effects
- > Tracking animations directly with people's gestures
- > Avoiding animating depth changes in z-axis layers
- > **Replacing transitions in x-, y-, and z-axes with fades to avoid motion**
- > **Avoiding animating into and out of blurs**

That last one is directly a Liquid Glass instruction: a glass morph is an
animated blur. Under Reduce Motion it becomes a fade.

Read it with SwiftUI's `accessibilityReduceMotion`, or AppKit's
`NSWorkspace.accessibilityDisplayShouldReduceMotion` plus the
accessibility-display-options change notification. Reading it once at launch is
wrong — people change it while your app is running.

Related: *"Let people control audio and video playback. Avoid autoplaying audio
and video content without also providing controls."*

## The motion specification

Every animation in a design carries this. An animation without it is decoration
until proven otherwise.

```
Trigger:
User-visible causal relationship (what does this explain?):
Spring, and why not a duration curve:
Interruption behavior:
Reversal behavior, and the axis it reverses along:
Behavior on rapid repeated input:
Behavior during window resize:
Reduce Motion behavior:
Performance constraint (frame pacing on the lowest-spec machine supported):
```

## Review questions

- Does this animation explain something, or decorate something?
- Can it be interrupted mid-flight, and does it retarget from its current
  velocity?
- Does the dismissal reverse the reveal along the same axis?
- What happens on the fifth rapid repeat?
- What happens if the window is resized mid-animation?
- Is there a fade path under Reduce Motion, and does it cover every blur
  animation including glass morphs?
- Was it tuned on a Mac with a trackpad, or on a touch device?
- Would anything be lost by deleting it?

The last question retires more animations than all the others combined.
