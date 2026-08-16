# Concept Corpus

Established engineering concepts, indexed by the problem shape they dissolve.
Match the shape first, then apply the concept's mechanism. Every entry states
how the failure stops being expressible — an entry without a mechanism is a
slogan and does not belong here.

Sources inspected 2026-08-16.

## How to read an entry

- **Shape** — the observable pattern in the current implementation.
- **Concept** — the named idea and who established it.
- **Mechanism** — why the failure can no longer be written after applying it.
- **Test** — the question that falsifies a claim to have applied it.

## Invalid values reach code that assumes they are valid

- **Concept:** *Make illegal states unrepresentable* (Yaron Minsky, Jane Street,
  2010) and *Parse, don't validate* (Alexis King, 2019).
- **Mechanism:** the only constructor for the domain type performs the check, so
  the unchecked value has no type to travel in. Downstream code cannot ask the
  question because the answer is carried in the type.
- **Test:** can you write an expression that produces the invalid value at all?
  If yes, you added a check, not a type.
- <https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/>
- <https://functional-architecture.org/make_illegal_states_unrepresentable/>

## The same guard is repeated at many call sites

- **Concept:** *Deep modules* and *complexity is dependencies plus obscurity*
  (John Ousterhout, *A Philosophy of Software Design*).
- **Mechanism:** the repeated guard is the interface leaking its implementation
  obligation to every caller. A deep module absorbs the obligation behind a
  narrow interface, so there is one place where the obligation can be missed and
  it cannot be missed there.
- **Test:** after the change, does adding a new caller require the author to
  know the rule? If yes, the module is still shallow.
- <https://web.stanford.edu/~ouster/cgi-bin/book.php>

## Two designs are needed before one can be judged

- **Concept:** *Design it twice* (Ousterhout).
- **Mechanism:** the first design is anchored on the existing structure and on
  the first idea; producing a structurally different second candidate exposes
  which properties were incidental to the first.
- **Test:** are the two candidates structurally different, or the same design
  with different names?
- <https://web.stanford.edu/~ouster/cgi-bin/book.php>

## Distant code must agree, and nothing enforces the agreement

- **Concept:** *Connascence* (Meilir Page-Jones), graded by strength, locality,
  and degree.
- **Mechanism:** name the exact connascence (position, meaning, timing,
  execution order, identity), then convert it to a weaker static form, move it
  into one module to improve locality, or reduce how many components share it.
- **Test:** can you state the connascence type and its before/after strength,
  locality, and degree? "Reduced coupling" without those three is unmeasured.
- <https://connascence.io/>
- <https://en.wikipedia.org/wiki/Connascence>

## "We cannot change X without also changing Y"

- **Concept:** *Complecting versus composing* (Rich Hickey, *Simple Made Easy*,
  2011) and the *Independence Axiom* (Nam Pyo Suh, *Axiomatic Design*).
- **Mechanism:** two functional requirements are being satisfied by one design
  parameter. Split the parameter so each requirement is served independently;
  the coupled edit disappears because the edits address different parameters.
- **Test:** write the requirements against the parameters as a matrix. Is it
  diagonal (uncoupled), triangular (decoupled, order-dependent), or full?
- <https://www.infoq.com/presentations/Simple-Made-Easy/>
- <https://en.wikipedia.org/wiki/Axiomatic_design>

## Easy today, entangled later

- **Concept:** *Simple is not easy* (Hickey).
- **Mechanism:** "easy" measures familiarity and proximity to hand; "simple"
  measures how few things are braided together. This skill selects on simple.
  Any argument of the form "this way is easier" is out of scope by construction.
- **Test:** does the argument for the design mention effort, familiarity, or
  convenience? Then it is an ease argument and carries no weight here.
- <https://github.com/matthiasn/talk-transcripts/blob/master/Hickey_Rich/SimpleMadeEasy-mostly-text.md>

## Order, timing, and stale-value bugs around shared mutable state

- **Concept:** *Out of the Tar Pit* (Ben Moseley, Peter Marks, 2006): most
  complexity is accidental, and mutable state is its primary source.
- **Mechanism:** separate essential state from derived state, compute the
  derived part instead of storing it, and shrink what remains mutable. States
  that are not stored cannot go stale, and interleavings that cannot mutate
  cannot race.
- **Test:** how many mutable cells does the target design have, and which of the
  reported failure's preconditions still exist without them?
- <https://curtclifton.net/papers/MoseleyMarks06a.pdf>

## Every component worked; the interaction failed

- **Concept:** *STAMP / STPA* (Nancy Leveson, MIT): accidents come from
  inadequate control and missing constraints, not only component failure.
- **Mechanism:** model the control structure — controllers, control actions,
  feedback, process models — and find the unsafe control action and the
  constraint that no component was responsible for enforcing. Give that
  constraint an owner in the design.
- **Test:** which component owns the violated constraint in the target design,
  and what feedback tells it the constraint holds?
- <http://sunnyday.mit.edu/STAMP-publications.html>
- <https://www.flighttestsafety.org/images/STPA_Handbook.pdf>

## The chain of "why" ends at one line or one person

- **Concept:** *The infinite hows* (John Allspaw), drawing on Dekker, Cook, and
  Leveson: real failures have multiple contributors, and "why" collapses them
  into a single blameable cause.
- **Mechanism:** ask how the conditions were produced and how they normally
  succeed, which surfaces the design conditions that made the failure
  reasonable at the time.
- **Test:** does the account name more than one contributing condition, and does
  it explain why existing checks did not catch it?
- <https://www.kitchensoap.com/2014/11/14/the-infinite-hows-or-the-dangers-of-the-five-whys/>

## The problem is stated as an unavoidable trade-off

- **Concept:** *Ideal Final Result* and *contradiction resolution* (Genrich
  Altshuller, TRIZ).
- **Mechanism:** state the ideal outcome — all of the benefit, none of the harm,
  none of the cost — then treat the trade-off as a contradiction to be
  dissolved by changing the structure rather than by picking a point on the
  curve. Compromise is the failure mode TRIZ exists to prevent.
- **Test:** was a trade-off accepted? Then name the contradiction and the
  structural change that was rejected, and why it is impossible rather than
  large.
- <https://en.wikipedia.org/wiki/TRIZ>

## A caller or operator can still do the wrong thing

- **Concept:** *Poka-yoke* (Shigeo Shingo).
- **Mechanism:** shape the interface so the wrong action does not fit —
  mandatory arguments, non-defaultable choices, distinct types for
  interchangeable positions, an API that has no method for the harmful call.
- **Test:** what does the wrong call look like now? If it compiles and runs, the
  fixture does not fit.
- <https://gojko.net/2007/05/09/the-poka-yoke-principle-and-how-to-write-better-software/>

## The rule lives in documentation, comments, or convention

- **Concept:** *Design by Contract* (Bertrand Meyer): preconditions,
  postconditions, and invariants belong to the code, not the prose.
- **Mechanism:** move each documented rule to a place that executes or type-checks
  it, and delete the prose that duplicated it.
- **Test:** if the documentation were deleted, would the rule still be enforced?
- <https://en.wikipedia.org/wiki/Design_by_contract>

## Nobody knows what depends on the current behavior

- **Concept:** *Hyrum's Law*: with enough consumers, every observable behavior
  becomes someone's contract.
- **Mechanism:** treat the break inventory as behavior, not as intent; then
  shrink the observable surface in the target design so the next redesign has
  fewer implicit consumers to discover.
- **Test:** after the change, which behaviors are observable but unpromised?
  Those are the next set of accidental contracts.
- <https://www.hyrumslaw.com/>

## The structure looks pointless

- **Concept:** *Chesterton's fence* (G. K. Chesterton, *The Thing*, 1929).
- **Mechanism:** recover why the structure was built before removing it. In this
  skill the recovery is not a reason to preserve it — it is what turns a
  gamble into a decision.
- **Test:** for each removed structure, can you state its original purpose and
  where that purpose now lives, or that it is deliberately dropped?
- <https://en.wikipedia.org/wiki/G._K._Chesterton#Chesterton's_fence>

## The redesign is growing more capable than the thing it replaces

- **Concept:** the *second-system effect* (Fred Brooks, *The Mythical
  Man-Month*), and Joel Spolsky's rewrite warning.
- **Mechanism:** the failure mode of a rewrite is added generality, not added
  size. Require the target design to reduce a structural measure and to keep the
  capability set fixed; the accumulated behavior that Spolsky defends is
  preserved through the break inventory, not through keeping the old structure.
- **Test:** does the target design do anything the current one does not? If yes,
  that part is a separate product decision and leaves this change.
- <https://www.joelonsoftware.com/2000/04/06/things-you-should-never-do-part-i/>

## Getting to the new design without a stop-the-world cut

- **Concept:** *Parallel change* (expand, migrate, contract) and the *strangler
  fig* (Martin Fowler).
- **Mechanism:** add the new form, move consumers, remove the old form. This is
  the delivery technique for a break that must not be observed mid-flight. It is
  never a reason to choose a smaller destination, and the contract phase is part
  of the work, not an optional follow-up.
- **Test:** does every expand step have a dated contract step and a removal
  condition?
- <https://martinfowler.com/bliki/ParallelChange.html>
- <https://martinfowler.com/bliki/StranglerFigApplication.html>

## Extending this corpus

Add an entry when a redesign needed a concept that no shape here covers. The
entry is the unit of extension; the skill router never grows for a new concept.

Requirements for a new entry:

1. **Start from the shape, not the concept.** The heading is the symptom pattern
   an engineer would recognize in their own code. Concept-first entries are
   never found at the moment they are needed.
2. **The concept is named and externally sourced.** A person, paper, book, or
   talk, with a link. House conventions belong in the language and stack skills,
   not here.
3. **State a mechanism.** Say why the failure stops being expressible. "Improves
   maintainability" is not a mechanism.
4. **State a falsifiable test.** One question whose answer proves the concept
   was applied rather than name-dropped.
5. **Merge, do not stack.** If an existing shape already matches, extend that
   entry. Two entries for one shape make the corpus unusable at match time.
6. **Keep counterweights in the corpus.** Entries that constrain the redesign —
   Chesterton's fence, the second-system effect, Hyrum's Law — are load-bearing.
   A corpus of only expansive ideas produces confident rewrites.
7. **Date the sources.** Update the inspection date at the top when links are
   re-verified.
