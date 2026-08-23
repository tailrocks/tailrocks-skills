# Testing doctrine

Writing skills is test-driven development applied to process
documentation: the pressure scenario is the test, the skill is the
production code, the baseline run is the red bar, compliance is green,
and closing loopholes is the refactor.

## The iron law

**No new skill and no behavioral edit without discriminating evidence first.**
For a claimed agent-behavior correction, the baseline run — the agent attempting
the task *without* the skill or with the pre-edit version — must fail for the
claimed reason. For an external-contract change or preventive security rule,
the red bar is a failing executable contract or security check plus an
irrelevant control; never fabricate an agent failure merely to satisfy form.
These are the evidence that the skill changes an outcome rather than adding prose.
For behavior evidence, document the baseline verbatim: exact wrong choice and
rationalization. A skill written before its evidence is deleted and
restarted, not retrofitted — "keeping it as reference" while writing the
test is the violation with extra steps. If the baseline does **not**
fail, stop: there is nothing to fix, and the skill would be dead weight.

Standard rationalizations, all invalid: "it's obviously clear" (clear to
the author is not clear to a fresh agent), "it's just a reference"
(references have gaps — test retrieval), "I'll test if problems emerge"
(problems are agents failing in production), "no time" (a bad skill
costs more than its test).

## Evidence and excluded infrastructure

Watching a fresh agent attempt a behavior task, or running an executable
contract/security check for a preventive task, establishes the evidence law's
red bar. Record the input, environment, observable result, and irrelevant
control in a durable evidence artifact. Per-skill eval trees are forbidden.

## Test to the skill's type

- **Discipline skills** (rules an agent is tempted to skip): pressure
  scenarios combining time pressure, sunk cost, authority, and
  exhaustion. Pass = the agent complies under maximum combined pressure.
  Every rationalization the baseline produced becomes an explicit
  counter in the skill; re-test until no new rationalization survives.
- **Technique skills** (how-to): application to a fresh scenario,
  variation cases, and gap-hunting — do the instructions assume context
  the agent will not have?
- **Pattern skills** (mental models): recognition (does the agent see
  when it applies), application, and counter-examples (does it know when
  *not* to apply).
- **Reference skills**: retrieval (can the agent find the fact) and
  application (use it correctly), across the common cases.

## Micro-test wording before full scenarios

Full scenario runs are the gate but are slow per iteration; verify
contested wording first. One fresh-context sample per call, the guidance
embedded in its realistic surroundings (the full router, not the sentence
in isolation), a task that tempts the failure. **Always include a
no-guidance control** — if the control does not fail, do not author the
guidance. Five or more repetitions per variant; single samples lie. Read
every flagged output manually — template echoes and quoted
counter-examples masquerade as hits. Treat variance as a metric: when
wording binds, repetitions converge on one shape; five interpretations
across five runs means the form is wrong, not the word count.

## Acceptance cases that earn their place

- **Realistic prompts.** The kind a user actually types — concrete
  files, half-remembered names, casual phrasing — not schematic
  category labels. A prompt too trivial to need the skill tests nothing.
- **Three case classes:** normal operation, a boundary (the mode gate,
  the scope edge), and a safety/refusal case proving the skill declines
  what it must. Audit- and review-shaped cases carry fixtures — a seeded
  artifact with known defects, including at least one deliberate
  non-finding trap.
- **Near-miss negatives for triggering.** Should-not-trigger prompts
  that share keywords with the skill but belong to a neighbor are the
  valuable ones; obviously irrelevant negatives test nothing.
- **Assertions are observable.** Each expected output names checkable
  behavior — what is produced, what is refused, what is routed — not a
  mood. An assertion that passes with and without the skill is
  non-discriminating; fix it or drop it.

## The improvement loop

Author acceptance cases so checks generalize from failures rather than
patching examples: a handful of observations stands in for thousands of future
invocations, so a fix that only fits one prompt is overfitting, and stacking
rigid MUSTs to pass one case is the documentation version of hard-coding the
answer. Read transcripts, not only outcomes: if the skill makes the agent do
unproductive work, cut the section causing it. When every test run independently
rebuilds the same helper, ship the helper with the skill instead of the
instructions to rebuild it. The behavior the baseline documented should
no longer occur and re-runs should converge — that is when to stop
adding.

One skill at a time: written, proven, wired, before the next begins.
Batching skills defers every test to a future that will not run them.
