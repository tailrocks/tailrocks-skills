# tailrocks-rethink: design notes

Why the skill exists, what it deliberately does not do, and how to extend it.
Sources inspected 2026-08-16.

## The gap

`tailrocks-remediate` already refuses to price a correction: it forbids ROI,
effort, duration, and sunk-cost language, derives a greenfield counterfactual,
and prefers removing the enabling condition over guarding the symptom. Three of
its properties, all correct for its job, leave a different job uncovered.

1. **It requires proven wrongness.** A falsifiable expected state and an
   observed contradiction are its entry gate, and it rejects requests that
   cannot produce them. Reported friction, an awkward interface, or a design an
   engineer cannot reason about has no such contradiction to cite.
2. **Compatibility is a constraint.** Remediate treats compatibility promises as
   correctness constraints and plans never-broken migrations. That is right when
   the system must keep its promises while being corrected, and wrong when the
   promise itself is the defective shape.
3. **The counterfactual is bounded by the proven class.** Remediate explicitly
   forbids unrelated modernization. That guard prevents speculative churn and
   also prevents re-deriving the capability as a whole.

`tailrocks-rethink` takes the uncovered job: the current implementation is the
subject of review, a reported symptom is the anchor rather than the boundary,
and breaking changes are expected outputs. Both skills exclude cost from the
decision; they differ on what the decision is allowed to reach.

## The two guards that keep it honest

An instruction to restructure freely, given without guards, produces confident
rewrites. Two guards are load-bearing, and both are correctness arguments rather
than cost arguments — otherwise the skill would contradict its own rule.

- **A failed guarantee is required.** Without a property the current design does
  not hold, there is no failure class to eliminate and no problem shape to match
  against the corpus. "It feels dated" is refused.
- **The redesign must subtract.** The documented failure mode of a rewrite is
  added generality, not added size — Brooks's second-system effect, and
  Spolsky's warning that accumulated behavior encodes real bug fixes. The skill
  answers both structurally: capability stays fixed, a named structural measure
  must improve, and the accumulated behavior is preserved through an explicit
  break inventory rather than by keeping the old structure.

## Research basis

The corpus in `skills/tailrocks-rethink/references/concept-corpus.md` is indexed
by problem shape, because a concept-first index is never found at the moment it
is needed. The initial entries were selected to cover the shapes that produce
the most common "just add a guard" patches, plus the counterweights.

- **Elimination by construction** — *Parse, don't validate* (Alexis King, 2019)
  and *make illegal states unrepresentable* (Yaron Minsky, 2010) give the
  strongest form of the skill's central test: the failing value has no
  expression. <https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/>
- **Boundary ownership** — Ousterhout's deep modules and the definition of
  complexity as dependencies plus obscurity supply the vocabulary for "the guard
  is repeated because the interface leaks its obligation". *Design it twice*
  became step 2's requirement for two independent candidates.
  <https://web.stanford.edu/~ouster/cgi-bin/book.php>
- **Measurable coupling** — Page-Jones's connascence supplies strength,
  locality, and degree, so "reduced coupling" can be stated with numbers rather
  than asserted. <https://connascence.io/>
- **What to select on** — Hickey's simple-versus-easy separates the axis the
  skill optimizes (how few things are braided together) from the axis it
  forbids (familiarity, convenience, effort).
  <https://www.infoq.com/presentations/Simple-Made-Easy/>
- **Where complexity comes from** — *Out of the Tar Pit* (Moseley and Marks,
  2006) identifies mutable state as the primary source, which is why mutable
  cells are a first-class structural measure.
  <https://curtclifton.net/papers/MoseleyMarks06a.pdf>
- **Interaction failures** — Leveson's STAMP/STPA reframes failure as a missing
  constraint in the control structure rather than a broken component, covering
  the shape where every unit test passes.
  <http://sunnyday.mit.edu/STAMP-publications.html>
- **Refusing the trade-off** — TRIZ's ideal final result and contradiction
  resolution are the formal version of "derive the ideal design first"; TRIZ
  exists specifically to prevent compromise from being the default answer.
  <https://en.wikipedia.org/wiki/TRIZ>
- **Causal honesty** — Allspaw's *The infinite hows* prevents the causal chain
  from collapsing into one line or one person.
  <https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/>
- **Counterweights** — Chesterton's fence (recover the purpose before deleting),
  Hyrum's Law (observable behavior is the real contract, so the break inventory
  is behavior-based), and parallel change plus strangler fig as the delivery
  technique for a break — never as a reason to choose a smaller destination.
  <https://www.hyrumslaw.com/> and
  <https://martinfowler.com/bliki/ParallelChange.html>

### On the post-AI economics argument

The rationale for inverting the default caution is that incrementalism was a
response to the price of producing a new implementation. The skill records that
rationale but does not decide with it, because the empirical picture is
contested: a 2025 randomized trial measured experienced developers working 19%
slower with early-2025 AI tooling on mature repositories while believing they
were 20% faster (<https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/>).
Making the rule depend on a cost claim would reintroduce the exact reasoning the
skill bans. Excluding cost entirely is immune to the estimate being wrong in
either direction.

## Extension model

Three axes, in increasing cost to the router. Prefer the first.

1. **Add a corpus entry.** The normal way to teach the skill a new concept. The
   entry format and its seven requirements are documented at the end of
   `skills/tailrocks-rethink/references/concept-corpus.md`: shape-first heading,
   named and externally sourced concept, stated mechanism, falsifiable test,
   merge rather than stack, keep counterweights, date the sources. The router
   never grows for a new concept, so this is free in attention terms.
2. **Add a discipline rule.** New inadmissible phrasing, a new structural
   measure, or a new break mechanism goes into
   `skills/tailrocks-rethink/references/redesign-discipline.md`. Only promote a
   rule to `SKILL.md` when an eval case demonstrates that the reference version
   is not reached in practice, and follow the router-budget rules in AGENTS.md —
   a load-bearing requirement needs its own named bullet, not a mid-paragraph
   clause.
3. **Add a sibling skill.** Warranted only when the new job has a different
   entry gate or a different permission posture, the way rethink differs from
   remediate. Two skills that both decide how much restructuring is allowed
   would conflict, and the conflict surfaces as inconsistency between features
   rather than as an error. State the boundary in README.md and AGENTS.md when
   one is added.

## Rejected alternatives

- **Extending `tailrocks-remediate` with a breaking-change mode.** Rejected: its
  entry gate (proven wrongness), its compatibility constraint, and its
  never-broken migration requirement are the parts that would have to be
  conditionally disabled. A skill whose central rules are mode-dependent
  enforces none of them reliably.
- **A general "apply first principles" skill with no anchor.** Rejected: without
  a failed guarantee the skill has no failure class to eliminate, no shape to
  match, and no way to distinguish a redesign from churn.
- **Encoding the house stack's tactics in the corpus.** Rejected: Rust,
  TypeScript, and Swift specifics belong to the language skills. The corpus
  stays language-neutral so a shape matches wherever it appears.
