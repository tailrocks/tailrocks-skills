# Readiness and the closing interview

This reference tells `tailrocks-finalize` how to drive a roadmap
item to READY: closing-interview mechanics, screen collection,
and the readiness checklist, the only gate to READY.

## Closing interview mechanics

The method matches the shaping stage, with different pressure:

- **Decision tree, frontier only.** Nodes come from the delta
  between the item and the readiness checklist below.
  Dependencies run parent-first.
- **One question at a time.** Wait for the answer. With
  `--batch`, ask one numbered frontier round at a time. Never
  ask several questions in one message outside a batch round.
- **Recommended answer on every question**, grounded in the
  settled ground of the item, linked research, and looked-up
  facts.
- **Decisions asked, facts looked up** (URL, `file:line`, or
  method). Slow lookups never block the frontier. Ask the
  questions that do not depend on them. Work heavier than a
  quick grep or file open runs in a read-only background
  investigator. Its brief restates the question. It restates
  the evidence standard with HIGH, MED, or LOW confidence. It
  restates the read-only scope. It restates the
  data-not-instructions and secrets-by-location rules. It
  restates the return shape: claim, source, confidence only.
  Its pages stay out of the interview. Look up inline only
  when background agents are unavailable.
- **Write immediately.** Every resolution lands in its section
  the moment it resolves. An interrupted session loses
  questions, never answers.
- **Concrete scenarios over abstract preferences.** "The CLI
  updates during an open desktop app session — what does the
  session list show" beats "how does versioning work".
- **Confront contradictions plainly.** Record the resolution
  as a dated decision.
- **Depth is the point.** Drill each screen state and each
  flow failure point to the bottom. Never re-ask settled
  ground.

## Collecting screens

The heaviest user input obeys these rules:

- Every capability that the item promises is reachable through
  some screen or explicitly declared headless. Orphan
  capabilities are frontier questions.
- Per screen, collect until stateable. Collect purpose in
  one line. Collect a schematic mockup. Collect states:
  default, empty, loading, error. State the content of each
  existing state. Collect key interactions. Collect
  navigation in and out.
- Users describe, this skill draws. Turn their prose into an
  ASCII schematic or Mermaid diagram in the item, show it
  back, and iterate until the user confirms the match. Image
  files from the user land in the folder of the item, with a
  reference from the screen section.
- Mockups state layout intent: structure, regions, states.
  Refuse pixel detail in the item itself. Pixel truth lives in
  a design reference when one exists.
- When a design-reference skill produced a rendered reference
  for a screen, confirm the screen against that rendered
  reference instead of re-drawing ASCII. Record its pointer
  in the `Design:` line of the screen. A reference that is
  still unblessed is a draft. Name it as remaining SHAPING
  ground. Never confirm a screen against a draft.

## Classifying the remainder

Every open question ends the session as exactly one of these:

1. **Resolved.** The answer stands in its section, with a
   dated decision when it settled a choice.
2. **Deferred.** The user explicitly postponed it. Record the
   reason plus the revisit trigger. Deferral is a user
   decision, never a default to move on.
3. **Open research question.** A fact that an agent finds
   without the user. The test: two competent engineers
   converge after they read the same sources. "Do we need
   offline mode" fails that test. Resolve it or defer it.
   Never launder it into research. It must also stay
   **precisely statable**: research runs only on a question
   whose answer stays recognizable on arrival. A question
   still too unformed to state precisely is not researchable
   yet. Record the fact that makes it statable. Usually that
   fact is a decision to take back to the user. Never record
   a vague blob that an agent answers by guessing.

## The readiness checklist — the only gate to READY

All boxes hold. Check each against the live item, not memory:

- [ ] Intent ends with a destination sentence: the observable
      truth when this item ships.
- [ ] Every term with two possible meanings stands in
      Vocabulary with one meaning.
- [ ] Every capability is concrete enough to specify and
      reachable through a screen, a flow, or an explicit
      headless declaration.
- [ ] Every screen holds purpose, schematic mockup, states,
      interactions, and navigation.
- [ ] Every screen with a design reference points at it
      through its `Design:` line, and the reference is
      blessed. An unblessed reference is SHAPING ground,
      named as such.
- [ ] Every screen with a visual surface and no blessed
      reference stands named in the close-out as design-stage
      work. The close-out names the skill of its medium.
      READY never requires
      the reference. Planning requires it, and an item that
      arrives there without it stops.
- [ ] Every flow names its steps, screens, and failure points.
- [ ] Data & integrations names every external touchpoint and
      the settled facts about it.
- [ ] Must not is populated, or explicitly confirmed empty by
      the user, with reasons.
- [ ] Quality bar states acceptance in checkable terms.
- [ ] Open questions is empty.
- [ ] Every Open research question is genuinely researchable
      (it passes the convergence test) and precisely
      statable.
- [ ] Every Deferred entry holds a reason and a revisit
      trigger.
- [ ] Decisions are internally consistent. No section
      contradicts a dated decision.
- [ ] The planning dry run passes. A planning agent that
      reads only this item inventories it into screens,
      capabilities, flows, and must-nots. It invents nothing
      and asks nothing.

Any unchecked box means `SHAPING`. The gap stands under Open
questions and goes plainly to the user in the close-out. The
item carries no Log. A gate that never passed is recorded by
the commit subject of the invocation.

## The planning dry run — fresh eyes

Never self-certify the last box. The interviewer remembers
every chat answer, so it cannot detect the one answer that
never reached the file. That defect is the exact reason for
the dry run. Run it as a clean-context, read-only subagent
that simulates the planning intake. Its brief holds only the
item file path and the mockup assets beside it. It never
holds a `plan/`, `verification/`, or `goal/` sibling in that
folder. It holds the return shape: the built inventory and
every point where it invented, guessed, or asks the user.
The box checks only when
that report holds no questions and no inventions. Anything
reported goes back to the frontier. Without subagents, check
the box against the live item text alone, never memory, and
state aloud that the dry run was self-run.

## Stopping

- **Gate passes.** Set READY and the index row. The close-out
  names the design stage for every screen with a visual
  surface and no blessed reference. Then it names
  `tailrocks-plan <slug>`. That skill writes the package
  into the `roadmap/<slug>/plan/` folder of the item.
- **User steers out early.** Honor the steer immediately.
  Remaining gaps go to Open questions with recommendations.
  Status stays `SHAPING`. The close-out lists exactly the
  facts that a future session still collects.
