# Decide whether stack-lane skills mark their commits

- **Status**: DRAFT
- **Slug**: stack-lane-commit-attribution
- **Created**: 2026-08-21
- **Plan**: — (`plan/` once planned) · **Verified**: — (`verification/` once run)

## Intent

`delivery-git-contract.md` binds eight delivery skills to the
`Tailrocks-Skill` trailer, and nothing else in the collection. Every
stack-lane skill — the project-setup, best-practices, design and visual-QA
skills across Rust, TypeScript and Swift — writes source without marking it.

That is a deliberate split (artifacts are marked, source is `execution`), and
it has a consequence nobody decided: **a field retrospective cannot attribute
a single source commit to the skill that shaped it.** D6's headline case, a
skill writing outside its declared scope, can only fire on the delivery
family; on a stack lane there is nothing to attribute, so the detector's
strongest finding is unreachable from real data. The same limit applies to D2
and D4.

The question is which way to close it: widen the contract so stack-lane
skills mark their commits too, or state the limit in the detectors and accept
that source is audited by other means. Both are defensible; drifting between
them is not.

## Vocabulary

- **Attributed commit** — a commit carrying a `Tailrocks-Skill` trailer naming
  the skill that produced it. _Avoid_: "signed", which is DCO.
- **Execution** — source written under a plan by an executor, which the
  retrospect skill classifies as unowned rather than as a marking failure.

## Decisions

## Capabilities

- A field retrospective can say which skill shaped a source commit, or can
  say plainly that it cannot and why — never report an unauditable lane as
  clean.
- Whichever way the contract lands, the retrospect detectors and the
  contract document agree, and one of them is the single source.

## Screens

## Flows

## Data & integrations

- `skills/tailrocks-idea/references/delivery-git-contract.md:3-8` — the
  binding list, eight skills.
- `skills/tailrocks-retrospect/SKILL.md` — classifies unmarked source as
  `execution` rather than `unattributed`, which is what makes the gap silent.
- `skills/tailrocks-retrospect/references/divergence-detectors.md` — D2, D4
  and D6 all key on attribution.
- A retrospect eval fixture had seeded a `Tailrocks-Skill` trailer on a
  stack-lane skill's commit — asserting a world the pipeline cannot produce,
  which is how the gap was found.

## References

- v0.23.0 — the release where the limit was found, by a session reading the
  detector against the contract rather than against its own fixture.

## Research

## Must not

- MUST NOT let a detector report a lane clean when it could not attribute a
  commit in it. Silence and absence read identically, and that is the failure
  the retrospect skill exists to catch.
- MUST NOT widen the trailer to source commits without deciding what a
  multi-skill commit means — an executor may work under a project-setup skill
  and a best-practices skill in the same change.

## Quality bar

A retrospective on a shipped feature says, for every lane, either which skill
produced each commit or exactly why it cannot tell.

## Open questions

- Does the trailer widen to stack-lane skills, or do the detectors state the
  limit?
- If it widens: what marks a commit written under two skills, and does the
  executor or the skill stamp it?
- If it does not: is source attribution recovered another way — plan row IDs
  in the commit, or the branch's plan package?

## Open research questions

- How many commits in a typical shipped item are source rather than artifact?
  That ratio decides whether the gap is marginal or the majority of the work.

## Deferred

## Remaining
