# Wire skill eval execution into CI

- **Status**: DRAFT
- **Slug**: eval-execution-wiring
- **Created**: 2026-08-21 · **Updated**: 2026-08-21
- **Plan**: — (plans/eval-execution-wiring/ once planned)

## Intent

Every skill ships `evals/evals.json`, the skill-authoring law makes the
baselined eval the proof a skill teaches anything, and the release checklist
used to name a local eval run. That local run has now been deferred to CI —
and nothing in CI runs it. So between that deferral and this wiring, "eval
coverage" is a claim with no execution behind it: a skill can ship, and a
release can go out, with evals that have never been executed by any gate.

`skills/AGENTS.md` is honest that no gate in this repository runs the
harness, and a validator gate now stops `mise run evals` invocations
reappearing in skill content. Neither makes the harness run anywhere.

## Vocabulary

- **Eval harness**: the runner that executes a skill's `evals/evals.json`
  cases against an agent and grades the result. _Avoid_: "the validator",
  which checks skill structure and never executes a case.
- **Baselined eval**: a case proven to fail without the skill before it is
  accepted as evidence the skill works. _Avoid_: "passing eval".

## Decisions

- 2026-08-21 — **Eval execution is a CI concern, not a local one**. Because
  a local-only run is unauditable and skipped under time pressure; recorded
  here as the premise this item inherits, settled on the branch that
  deferred it.

## Capabilities

- Execute every skill's `evals/evals.json` on a schedule, and on pull
  requests that change a skill, without turning the pull-request lane into a
  model-billing surface nobody budgeted.
- Report per-case results as structured output a gate can read, so a
  regression names the skill and the case rather than failing a whole job.
- Distinguish a case that failed from a case that never ran; a silent skip
  must be indistinguishable from neither.

## Screens

## Flows

## Data & integrations

- **`claude plugin eval` already does most of this**, verified on Claude Code
  `2.1.233` on 2026-08-21 and independently on a second session: it runs eval
  cases against a plugin with `--ablation with-without` — a real no-plugin
  baseline arm, and the *default* when the target is a plugin name — plus
  `--judge-model` (default `haiku`), `--max-cost-usd` as a hard ceiling that
  exits 2 and bounds the overrun to a single agent run, `--case <glob>`,
  `--json [path]`, and `--allow-tools`. Budget was the stated reason execution
  was deferred; that flag answers it.
- **The gap is a format bridge, not a missing engine.** `claude plugin eval`
  reads `evals/**/case.yaml`, or `evals/**/prompt.md` plus `graders/*.md`;
  this repository writes one `evals/evals.json` per skill.
- **It publishes an HTML report by default** — `--no-publish` keeps it local.
  Where that report goes, and whether it should exist at all for a public
  repository, is a decision to make before wiring, not during the first
  scheduled run.
- Model access from CI: the harness needs a provider credential to run a case
  at all, which is why execution has no home today.
- `scripts/run-evals.ts` is the runner in the tree;
  `roadmap/eval-magic-skill-evals/` proposes a third engine. Which engine wins
  belongs to that item; this one is about execution having a home.

## References

- `skills/AGENTS.md` — states that no gate in this repository runs the eval
  harness.
- `.github/workflows/validate.yml` — where a scheduled lane would live.

## Research

## Must not

- MUST NOT let a release claim eval coverage while nothing executes the
  cases — that is overclaiming, and it is the condition this item exists to
  end.
- MUST NOT put an unbounded model-billed run on the blocking pull-request
  path — that is the same defect as the freshness gate closed in #67: a
  check whose answer depends on something outside the diff, blocking the
  diff.
- MUST NOT delete or weaken the eval requirement to make the gap go away —
  the policy is correct; the wiring is what is owed.

## Quality bar

A skill change that breaks its own eval is caught by a gate, names the skill
and the case, and cannot be merged silently. A release states which eval run
backs it.

## Open questions

- Does the eval lane block a pull request that changes a skill, or report
  into it and block only on the schedule?
- Which credential does CI use, and who owns its budget?
- Does the run publish its HTML report, and where? `claude plugin eval`
  publishes by default; a public repository publishing agent transcripts is a
  decision, not a default to inherit.
- One case format or two? A bridge that generates `case.yaml` from
  `evals.json` keeps one authored source; migrating the corpus drops the
  bridge but rewrites 38 skills' cases.

## Open research questions

- What does a skill-eval run actually cost per skill, and for the whole tree,
  at the current case counts and with `--judge-model` on its default?
- Can cases be selected by changed path so a one-skill change does not run
  all 38, and does `--case <glob>` reach that granularity?
- Which id scheme survives both engines? Today's cases use integer `id`s;
  `roadmap/eval-magic-skill-evals/README.md` records that a different
  candidate wanted kebab-case string ids. Two engines have now disagreed with
  the current scheme, so it is worth deciding once rather than per engine.

## Deferred

## Log

- 2026-08-21 — created (DRAFT), by hand rather than through `tailrocks-idea`.
  Captured from the gap surfaced while landing #63: eval execution was
  deferred from local runs to CI, and nothing in CI runs it. Evidence for the
  engine was gathered by running `claude plugin eval --help` on 2.1.233 and
  confirmed by a second session; the shaping gaps above are genuinely empty
  rather than assumed.
