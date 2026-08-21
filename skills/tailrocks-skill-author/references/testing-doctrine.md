# Testing doctrine

Writing skills is test-driven development applied to process
documentation: the pressure scenario is the test, the skill is the
production code, the baseline run is the red bar, compliance is green,
and closing loopholes is the refactor.

## The iron law

**No new skill and no behavioral edit without a failing test first.**
The baseline run — the agent attempting the task *without* the skill (or
with the pre-edit version) — is not optional ceremony: it is the only
evidence that the skill teaches something the agent would not do anyway,
and its transcript is the raw material the skill is written from.
Document the baseline verbatim: the exact wrong choice, the exact
rationalization. A skill written before its baseline is deleted and
restarted, not retrofitted — "keeping it as reference" while writing the
test is the violation with extra steps. If the baseline does **not**
fail, stop: there is nothing to fix, and the skill would be dead weight.

Standard rationalizations, all invalid: "it's obviously clear" (clear to
the author is not clear to a fresh agent), "it's just a reference"
(references have gaps — test retrieval), "I'll test if problems emerge"
(problems are agents failing in production), "no time" (a bad skill
costs more than its test).

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

## Eval cases that earn their place

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

Baseline and with-skill runs, for every case, execute in CI — this
repository does not run `mise run evals` locally. Author cases so CI's
grading generalizes from failures rather than patching them: the evals
are a handful of examples standing in for thousands of future
invocations, a fix that only fits the eval is overfitting, and stacking
rigid MUSTs to pass one case is the documentation version of
hard-coding the test's answer. When reviewing CI transcripts, not only
outcomes: if the skill makes the agent do unproductive work, cut the
section causing it and let CI re-run. When every test run independently
rebuilds the same helper, ship the helper with the skill instead of the
instructions to rebuild it. The behavior the baseline documented should
no longer occur and re-runs should converge — that is when to stop
adding.

One skill at a time: written, proven, wired, before the next begins.
Batching skills defers every test to a future that will not run them.
