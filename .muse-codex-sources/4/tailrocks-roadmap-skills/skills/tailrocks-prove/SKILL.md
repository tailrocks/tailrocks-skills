---
name: tailrocks-prove
description: >-
  Executes every surface that a roadmap item claims to ship, confirms
  or refutes each reported defect, and writes the verification round
  with subagent fan-out, evidence per surface, and a vacuous-proof
  audit. Use only when the user explicitly requests this skill. Judges
  only: never fixes, never writes status.
argument-hint: "<roadmap-slug> [--deep]"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Prove

## Use this skill

A passing suite is a claim about the code paths that someone
thought to test. It is not a claim that the thing runs. One
real delivery shipped with 2,232 green tests. Three entry
points panicked before their first frame. Nothing in the
pipeline ever started the binary.

This skill starts the binary. It executes every surface that
the item claims, against real data. It reports the actual
events. It returns the verdict that the proof commands of the
item proved nothing. Machine execution facts come only from
native runs in this session. The model judges the meaning of
those facts.

The loop after execution runs `tailrocks-record-feedback` to
capture the user findings. Then prove executes and judges.
Then `tailrocks-reconcile` prunes the plan and rewrites the
Remaining of the item. Then execution resumes, until
Remaining is empty. This skill writes exactly one file per
round,
`roadmap/<slug>/verification/NN-report.md`, and hands off:
reconcile writes status, `tailrocks-retrospect` turns the
round into skill patches. The report embeds the execution log.
No second evidence file exists to drift.

Use this skill only on explicit request with a planned,
executed item. It never fixes and never writes status.

## Before you start

This skill is user-only. It runs only on an explicit human
command. The invocation authorizes one commit and one push for
the round report on the delivery branch of the item. It never
authorizes production, external, or irreversible effects.
Those need explicit authorization immediately before each
execution.

Read these references before any action:

- [`surface-inventory.md`](references/surface-inventory.md)
  gives the row sources and the executed standard.
- [`native-execution.md`](references/native-execution.md)
  gives the disposable checkout and the run rules.
- [`subagent-fanout.md`](references/subagent-fanout.md) gives
  the briefs, the decisions lane, the refute pass, and the
  finding order.
- [`execution-evidence.md`](references/execution-evidence.md)
  gives the evidence contract and the proof verdicts.
- [`report-format.md`](references/report-format.md) gives the
  report order and the verdict tables.
- [`delivery-git-contract.md`](references/delivery-git-contract.md)
  gives the lane, commit, and pull-request rules.
- [`runtime-trust.md`](references/runtime-trust.md) gives the
  trust rules for repository, tool, and web content.

Resolve every relative link in this file against the directory
that contains this SKILL.md file.

Obey three laws:

- **Executed, not read.** A verdict rests on a command that
  ran in this session and the output line that it produced.
  A read implementation with a concluded result is the
  failure that this skill exists to replace.
- **Silence is not proof.** A surface never executed is
  reported `NOT EXECUTED` with the reason, never as passing.
  An empty result and a clean result are the same text and
  opposite facts.
- **Absence is a defect.** An element that the blessed
  reference carries and the running artifact lacks is a
  finding. Gates that only detect wrong content pass
  vacuously on missing content: zero glass surfaces satisfy
  every per-surface glass check.

## Procedure

1. **Bind the round.** Read `roadmap/<slug>/README.md`, the
   plan manifest `plan/README.md`, `plan/coverage.md`, and
   the latest `verification/NN-feedback.md` when one exists.
   When the package carries `plan/spec/decisions.md`, read
   it too: it is the decision ground truth that the package
   was built against. When it differs from the live `##
   Decisions` of the item, verify against the live section.
   Report the difference itself as contract drift. The
   package predates a recorded decision. Fix the branch and
   `HEAD` short SHA now. Every claim in the report describes
   that commit. This round is the highest number in place
   plus one.

2. **Inventory the surfaces.** Read the surface inventory
   reference. Enumerate every path where a user reaches this
   work: binary, subcommand, window, route, service method.
   Use the entry-point registry of the spec, the Screens of
   the item, and the manifest. A claimed surface that the
   inventory never finds is already a finding.

3. **Build once, clean.** Per the native execution
   reference, create a disposable checkout at the bound SHA.
   Run the exact build command of the repository there.
   Hash every declared built artifact. Never build or
   execute in the source tree of the user, and never
   substitute an artifact from a different checkout. A
   failed build ends the round: report it, because nothing
   downstream is knowable. Before surface execution,
   inventory side effects. Use a user-authorized
   non-production target or isolated reversible data.
   Without explicit authorization for production,
   external, or irreversible effects, record that surface
   as `NOT EXECUTED`.

4. **Fan out, one subagent per surface.** Read the fan-out
   reference. Each agent executes its surface with the
   native tool. It returns the execution block plus the
   evidence projection from the evidence reference. The
   projection holds command, exit status, decisive output
   line, and capture path. For a visual surface it holds
   the comparison against the blessed reference. Agents
   never fix anything and never read the findings of a
   different agent. One additional agent runs the decisions
   lane. It checks every recorded decision against the
   shipped result: `HELD`, `VIOLATED`, or `NOT VERIFIABLE`,
   with evidence. A `VIOLATED`
   decision blocks the round like a blocking defect,
   because the artifact broke a user choice that nobody
   re-opened.

5. **Audit the proofs.** Re-run the own done criteria of the
   plan and the gates in `goal/START.md`. Judge the
   *strength* of each, not only its exit status. Watch for
   a test command that collects zero tests. Watch for a
   filter that matches no target. Watch for a package name
   that never resolves. A criterion that passes without
   executing
   anything is a defect of the plan. Report it as `VACUOUS`
   with the count line as its evidence. A green goal
   condition with a broken product stops its compatibility
   here.

6. **Refute before reporting.** Every defect and every clean
   verdict gets an independent pass that tries to break it.
   A defect irreproducible from its own evidence downgrades.
   A surface reported working gets one attempt to fail the
   way that the user described. Reconcile each reported
   statement to `CONFIRMED`, `REFUTED`, or `WIDER` (real,
   and larger than reported), each with the deciding
   evidence line. `--deep` runs the refute pass with
   several independent lenses.

7. **Write, commit, and hand off.** Use
   [`assets/report.md`](assets/report.md). Its shape comes
   from the report format reference. Start with blocking
   defects with their evidence. Then decision compliance.
   Then contract drift. Then the holding parts. Then the
   recommended order. Then the unexecuted parts. Then the
   execution log. Commit on the branch of the item:
   `docs(roadmap): <slug> verification round <NN>`, with
   the trailer `Tailrocks-Skill: tailrocks-prove`. Push.
   Remove the disposable checkout. Name `tailrocks-reconcile
   <slug>` next.

Refuse these acts:

- **Fixing.** Never edit source, not even a one-line fix for
  a just-proven defect. The round is the deliverable.
  `tailrocks-root-cause` diagnoses the class, and only an
  approved correction reaches `tailrocks-remediate`.
- **Writing status.** Remaining, the status of the item, and
  plan rows belong to `tailrocks-reconcile`. A round that
  rewrote them judges its own evidence.
- **Passing the unrunnable.** No environment, no credential,
  no device: the surface is `NOT EXECUTED` with the reason,
  and the round states the unproven claims.
- **Green as approval.** A matching capture answers "did it
  change", not "is it right". Where the design reference is
  unblessed, state that fact instead of ratifying the
  shipped result.
- **Deciding the end of the item.** The round reports
  evidence. `DONE` is the write of reconcile, and it needs a
  round with no blocking defect.

## Result

Every claimed surface ran or stands explicitly reported
`NOT EXECUTED` with its reason. Every verdict cites output
produced in this session. Every reported statement carries
`CONFIRMED`, `REFUTED`, or `WIDER`. Every recorded decision
carries `HELD`, `VIOLATED`, or `NOT VERIFIABLE`. Every done
criterion and gate carries `PROVEN`, `VACUOUS`, or `FAILED`.
No finding survived on one unchallenged observation. The
round sits committed on the branch of the item. No source
file and no status changed.

## Completion checks

- Every claimed surface ran or stands `NOT EXECUTED` with
  its reason.
- Every verdict cites output produced in this session.
- Every `U#` from the feedback round holds a verdict.
- Every recorded decision holds one of its three semantic
  verdicts.
- Every done criterion and gate holds `PROVEN`, `VACUOUS`,
  or `FAILED`.
- No finding rests on one unchallenged observation.
- The disposable checkout is gone with no recovery
  artifact.
- No source file and no status changed.
- The round sits committed with its `Tailrocks-Skill`
  trailer on the branch of the item.

## References

- `references/surface-inventory.md`: read it before step 2.
  It gives the row sources and the executed standard.
- `references/native-execution.md`: read it before step 3.
  It gives the checkout, run, and cleanup rules.
- `references/subagent-fanout.md`: read it before step 4. It
  gives the briefs, decisions lane, refute, and order.
- `references/execution-evidence.md`: read it before steps 4
  and 5. It gives the evidence contract and proof verdicts.
- `references/report-format.md`: read it before step 7. It
  gives the report order and verdict tables.
- `references/delivery-git-contract.md`: read it before step
  7. It gives the lane, commit, and pull-request rules.
- `references/runtime-trust.md`: read it before any
  repository or web read. It gives the trust and secrecy
  rules.
- `assets/report.md`: use it in step 7. It gives the round
  report shape.
