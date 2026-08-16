# The structural pass

Correctness findings protect the next release; structural findings protect
the next year. This pass is deliberately ambitious: do not stop at "this
could be a bit cleaner." Search for the restructure that preserves behavior
while making the implementation dramatically simpler — the move that makes
whole branches, helpers, modes, conditionals, or layers disappear and
leaves code that feels inevitable in hindsight. If a path exists to
*delete* complexity rather than rearrange it, push for that path; a
refactor that moves the same complexity around is not a finding, it is
churn with a longer diff.

Every structural finding names two things: **the move** (what gets
restructured, concretely) and **the measure that disappears** (branches,
special cases, layers, duplicated logic, a file split). A finding with
neither is taste, and taste is out of scope — the same discipline
`tailrocks-simplify` applies to removals.

## Presumptive blockers

Each of these blocks approval unless the author records a justification:

- **The file-size ratchet.** The diff pushes a file from under 1,000 lines
  to over. Default answer: decompose first. Waive only for a compelling
  structural reason with the file still clearly organized.
- **Spaghetti growth.** New ad-hoc conditionals, scattered special cases,
  or one-off branches inserted into flows that did not know about the
  feature. A "weird if in a shared path" is a design problem, not a
  stylistic nit — the logic belongs behind its own abstraction, state
  machine, policy object, or module.
- **Feature logic leaking into shared code.** Solving a local problem by
  scattering feature checks across canonical paths normalizes
  architectural drift.
- **Canonical-helper duplication.** A bespoke near-duplicate of a helper
  the repository already owns, or logic landed in the wrong layer when a
  canonical home exists. Name the existing thing with its path.
- **Indirection without clarity.** Thin abstractions, identity wrappers,
  pass-through helpers, and generic mechanisms that hide simple data-shape
  assumptions. Magic is a maintainability defect; prefer direct, boring
  code.
- **Boundary erosion.** Unnecessary optionality, `unknown`/`any`, cast
  churn, or a silent fallback papering over an unclear invariant, where an
  explicit typed boundary would make the control flow simpler. The house
  best-practices lanes own the language-specific rules; this pass flags
  the structural symptom.
- **Complexity preserved when a judo move is visible.** The change works
  but keeps incidental complexity a visible reframing would delete.
- **Needless serialization and non-atomic updates.** Independent work
  serialized for no reason, or related updates that can leave state
  half-applied, when the cleaner structure is obvious.

## Preferred remedies

When suggesting the fix, prefer the deleting move over the polishing move:

- Delete a layer of indirection rather than improving it.
- Reframe the state model so the conditionals disappear instead of getting
  centralized.
- Move the ownership boundary so the feature becomes a natural extension
  of an existing abstraction.
- Turn special-case logic into a simpler default flow with fewer
  exceptions.
- Replace a condition chain with a typed model or explicit dispatch.
- Split the oversized file into focused modules; separate orchestration
  from business logic.
- Reuse the canonical helper; move logic to the layer that owns the
  concept.
- Make the type boundary explicit so the control flow simplifies.

## Routing

Structural findings route by what the fix may disturb, mirroring the house
three-skill order:

- The fix removes code from this diff with behavior frozen →
  `tailrocks-simplify` (its ladder, protected constructs, and measured
  deltas govern; do not duplicate its analysis here).
- The finding is a proven defect class — the structure *caused* wrongness
  and will again → `tailrocks-remediate`, which refuses cost as a
  counter-argument.
- The finding is a failed guarantee whose design needs re-derivation →
  `tailrocks-rethink`.
- A behavior-preserving restructure larger than this diff → record it as
  separate work with its named move; do not demand it inside this PR
  unless it is a presumptive blocker above.

## Tone

Direct, serious, and demanding — never rude, and never softened. If the
change makes the codebase messier, say so plainly; if it missed a dramatic
simplification, say that too. Prioritize a small number of high-conviction
structural findings over a long list of cosmetic notes; when a structural
regression stands, the cosmetics do not get reported at all.
