# Readiness and the Closing Interview

How `tailrocks-finalize` drives a roadmap item to READY: closing-interview
mechanics, screen collection, and the readiness checklist — the only gate to
READY.

## Closing interview mechanics

Same core method as the shaping stage, different pressure:

- **Decision tree, frontier only.** Nodes come from the delta between the
  item and the readiness checklist below. Dependencies parent-first.
- **One question at a time**, wait for the answer; `--batch` = one numbered
  frontier round at a time. Never several questions in one message outside
  a batch round.
- **Recommended answer on every question**, grounded in the item's settled
  ground, linked research, and looked-up facts.
- **Decisions asked, facts looked up** (URL, `file:line`, or method).
  Slow lookups do not block the frontier — ask what does not depend on
  them.
- **Write immediately.** Every resolution lands in its section the moment
  it resolves. An interrupted session loses questions, never answers.
- **Concrete scenarios over abstract preferences.** "The CLI updates while
  the desktop app is open — what does the session list show?" beats "how
  should versioning work?".
- **Confront contradictions plainly**; record the resolution as a dated
  decision.
- **Depth is the point.** Closing drills each screen's states and each
  flow's failure points to the bottom. Never re-ask settled ground.

## Collecting screens

The heaviest user input:

- Every capability the item promises must be reachable through some screen
  or explicitly declared headless. Orphan capabilities are frontier
  questions.
- Per screen, collect until stateable: purpose (one line), a schematic
  mockup, states (default / empty / loading / error — which exist, what
  each shows), key interactions, navigation in and out.
- Users describe; you draw. Turn their prose into an ASCII schematic (or
  Mermaid) in the item, show it back, and iterate until they say it matches
  what they see in their head. Image files they provide land in the item's
  folder and are referenced from the screen section.
- Mockups are layout intent — structure, regions, states. Refuse pixel
  detail.

## Classifying the remainder

Every open question ends the session as exactly one of:

1. **Resolved** — answer in its section, decision dated if it settled a
   choice.
2. **Deferred** — the user explicitly postponed it: reason + revisit
   trigger recorded. Deferral is a user decision, never a default you
   apply to move on.
3. **Open research question** — a fact an agent can find without the user.
   The test: would two competent engineers converge after reading the same
   sources? Then it is researchable. "Do we need offline mode?" fails that
   test and must be resolved or deferred, not laundered into research.

## The readiness checklist — the only gate to READY

All must hold; check each against the live item, not memory:

- [ ] Intent ends with a destination sentence — what is observably true
      when this ships.
- [ ] Every term with two possible meanings is in Vocabulary with one.
- [ ] Every capability is concrete enough to specify and reachable through
      a screen, a flow, or an explicit headless declaration.
- [ ] Every screen has purpose, schematic mockup, states, interactions,
      and navigation.
- [ ] Every flow names its steps, screens, and failure points.
- [ ] Data & integrations names every external touchpoint and what is
      settled about it.
- [ ] Must not is populated (or explicitly confirmed empty by the user)
      with reasons.
- [ ] Quality bar states what acceptance means in checkable terms.
- [ ] Open questions is empty.
- [ ] Every Open research question is genuinely researchable (passes the
      convergence test).
- [ ] Every Deferred entry has a reason and revisit trigger.
- [ ] Decisions log is consistent — no section contradicts a dated
      decision.
- [ ] The planning dry run passes: a planning agent reading only this item
      could inventory it into screens, capabilities, flows, and must-nots
      without inventing or asking anything.

Any unchecked box means `SHAPING`, named in the Log, said plainly to the
user.

## Stopping

- **Gate passes** → READY, Log, index, close-out pointing at
  `tailrocks-plan <slug>`.
- **User steers out early** → honor immediately; remaining gaps go to Open
  questions with recommendations, status stays `SHAPING`, close-out lists
  exactly what a future session must still collect.
