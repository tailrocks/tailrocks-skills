# Concept Corpus

Match the observed shape, state the elimination mechanism, and answer its
falsification test. A named concept without a mechanism is a slogan.

## Invalid values reach code that assumes validity

- **Mechanism:** parse once into a domain type whose only constructor enforces
  the invariant; unchecked values cannot travel downstream.
- **Test:** can any expression still construct the invalid domain value?

## The same guard appears at many call sites

- **Mechanism:** move the obligation behind one narrow, deep interface so a new
  caller cannot omit it.
- **Test:** must a new caller know or repeat the rule?

## The first design is anchored on current structure

- **Mechanism:** derive two structurally different candidates before selection.
- **Test:** are the candidates different in ownership/state/boundary shape, not
  merely names?

## Distant code must agree by convention

- **Mechanism:** identify the exact shared dependency, then weaken it, localize
  it, or reduce the number of components participating.
- **Test:** can the dependency's type, strength, locality, and degree be stated
  before and after?

## Two requirements force one coupled edit

- **Mechanism:** give each requirement its own design parameter so independent
  requirements can change independently.
- **Test:** does changing either requirement still force the other parameter to
  change?

## Order, timing, or stale-value failures surround mutable state

- **Mechanism:** separate essential from derived state, compute the latter, and
  shrink remaining mutation ownership.
- **Test:** which failing interleavings remain after the mutable cells disappear?

## Every component passes while their interaction fails

- **Mechanism:** model controller, action, feedback, and process state; assign
  the missing system constraint to one owner with observable feedback.
- **Test:** which component owns the constraint and how does it know it holds?

## The causal account ends at one line or person

- **Mechanism:** trace how all contributing conditions formed and why normal
  checks permitted them.
- **Test:** does the account explain both occurrence and escape without blame as
  mechanism?

## The problem is presented as an unavoidable trade-off

- **Mechanism:** state the contradiction and change the structure so both
  correctness properties can hold.
- **Test:** was compromise accepted without proving the eliminating structure
  impossible?

## A caller or operator can still take the harmful action

- **Mechanism:** shape types and interfaces so the wrong action does not fit.
- **Test:** can the harmful call still compile or execute?

## The rule lives only in prose or convention

- **Mechanism:** move it into an executable precondition, postcondition, type,
  or invariant at its owning boundary.
- **Test:** if the prose vanished, would enforcement remain?

## Nobody knows what depends on current behavior

- **Mechanism:** inventory observable behavior as contract, migrate every
  consumer, then shrink the observable surface.
- **Test:** which observable but unpromised behaviors remain?

## A structure looks pointless

- **Mechanism:** recover its original purpose and dependent behavior before
  deciding whether the new design preserves or deliberately drops them.
- **Test:** where does each recovered purpose live afterward?

## The replacement grows new capability

- **Mechanism:** freeze the capability set, require a reduced structural
  measure, and move new capability to a separate product decision.
- **Test:** does the target do anything the current capability does not?

## A breaking design cannot land in one safe cut

- **Mechanism:** expand, migrate, and contract while every intermediate state
  preserves named invariants and every bridge has a removal condition.
- **Test:** does every expansion have a mandatory contraction end state?

## Extension rule

Add a shape only when none above matches. Include one mechanism and one
falsification test; merge overlapping shapes. Preserve counterweights against
speculative scope, capability growth, and unknowingly deleted behavior.
