# Concept corpus

Match the observed shape. State the elimination mechanism.
Answer its falsification test. A named concept without a
mechanism is a slogan.

## Invalid values reach code that assumes validity

- **Mechanism:** parse once into a domain type whose only
  constructor enforces the invariant. Unchecked values cannot
  travel downstream.
- **Test:** confirm that no expression still constructs the
  invalid domain value.

## The same guard appears at many call sites

- **Mechanism:** move the obligation behind one narrow, deep
  interface, so a new caller cannot omit it.
- **Test:** confirm that a new caller needs no rule
  knowledge.

## The first design is anchored on current structure

- **Mechanism:** derive two structurally different candidates
  before selection.
- **Test:** confirm that the candidates differ in shape,
  not merely names.

## Distant code must agree by convention

- **Mechanism:** identify the exact shared dependency.
  Then weaken it, localize it, or reduce the number of
  participating components.
- **Test:** state the type, strength, locality, and degree of
  the dependency before and after.

## Two requirements force one coupled edit

- **Mechanism:** give each requirement its own design
  parameter, so independent requirements can change
  independently.
- **Test:** confirm that changing either requirement
  changes no other parameter.

## Order, timing, or stale-value failures surround mutable state

- **Mechanism:** separate essential from derived state.
  Compute the latter. Shrink remaining mutation ownership.
- **Test:** list the failing interleavings that remain after
  the mutable cells disappear.

## Every component passes while their interaction fails

- **Mechanism:** model controller, action, feedback, and
  process state. Assign the missing system constraint to one
  owner with observable feedback.
- **Test:** name the owning component and its observable
  feedback.

## The causal account ends at one line or person

- **Mechanism:** trace how all contributing conditions formed
  and why normal checks permitted them.
- **Test:** confirm that the account explains occurrence
  and escape without blame.

## The problem is presented as an unavoidable trade-off

- **Mechanism:** state the contradiction. Change the
  structure, so both correctness properties can hold.
- **Test:** prove that the eliminating structure is impossible
  before accepting compromise.

## A caller or operator can still take the harmful action

- **Mechanism:** shape types and interfaces, so the wrong
  action does not fit.
- **Test:** confirm that the harmful call cannot compile
  or execute.

## The rule lives only in prose or convention

- **Mechanism:** move it into an executable precondition,
  postcondition, type, or invariant at its owning boundary.
- **Test:** confirm that enforcement remains without the
  prose.

## Nobody knows what depends on current behavior

- **Mechanism:** inventory observable behavior as
  contract. Migrate every consumer. Then shrink the observable
  surface.
- **Test:** list the observable but unpromised behaviors that
  remain.

## A structure looks pointless

- **Mechanism:** recover its original purpose and dependent
  behavior before deciding whether the new design preserves or
  deliberately drops them.
- **Test:** state where each recovered purpose lives
  afterward.

## The replacement grows new capability

- **Mechanism:** freeze the capability set. Require a
  reduced structural measure. Move new capability to a
  separate product decision.
- **Test:** confirm that the target adds no new capability.

## A breaking design cannot land in one safe cut

- **Mechanism:** expand, migrate, and contract while every
  intermediate state preserves named invariants and every
  bridge has a removal condition.
- **Test:** confirm that every expansion has a mandatory
  contraction end state.

## Extension rule

Add a shape only when none above matches. Include one
mechanism and one falsification test. Merge overlapping
shapes. Preserve counterweights against speculative scope,
capability growth, and unknowingly deleted behavior.
