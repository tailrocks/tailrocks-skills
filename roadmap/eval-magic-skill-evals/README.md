# Evaluate skills with eval-magic

- **Status**: DRAFT
- **Slug**: eval-magic-skill-evals
- **Created**: 2026-08-17
- **Plan**: — (`plan/` once planned) · **Verified**: — (`verification/` once run)

## Intent

Use eval-magic for skill evaluations, based on what was verified in the
capture session: the tool ran end-to-end against this repository's skills
through the z.ai GLM-5.2 backend and produced a clean with/without-skill
benchmark, so it is a viable engine for measuring whether a skill change
actually shifts agent behavior.

## Vocabulary

## Decisions

## Capabilities

- Run skill evaluations through eval-magic instead of, or alongside, the
  current `scripts/run-evals.ts` runner.
- Compare conditions natively: with-skill vs without-skill for new skills,
  and old vs new (`snapshot --ref <merge-base>` + `run --mode revision`)
  for skills changed in a pull request (both verified in session,
  2026-08-16).
- Grade with layered assertions: deterministic `command_check`,
  `transcript_check`, `diff_scope`, and `llm_judge` (schema read from
  eval-magic 0.9.1, 2026-08-16).
- Execute subject agents through the operator's chosen backend by
  exporting the env around the caller-run dispatch recipes (verified with
  the z.ai GLM-5.2 env; judge recipes can run under a different provider
  env the same way).

## Screens

## Flows

## Data & integrations

- eval-magic workspace artifacts (`dispatch.json`, `RUNBOOK.md`,
  `benchmark.json`, `grading.json`) under a `.eval-magic/` workspace dir —
  location in this repository not yet decided.
- Existing per-skill `evals/evals.json` files: format is near-compatible;
  eval-magic requires kebab-case string `id`s where this repository uses
  integers (verified with `eval-magic validate`, 2026-08-16).

## References

- <https://crates.io/crates/eval-magic> — the evaluated tool; verified
  version 0.9.1 (released 2026-08-16), Rust, MIT, installed via
  `cargo install eval-magic --version 0.9.1 --locked`.
- `scripts/run-evals.ts` — the current in-repo eval runner eval-magic
  would replace or complement.
- `skills/*/evals/evals.json` — the eval corpus that would migrate.

## Research

## Must not

- MUST NOT dispatch evaluations with the installed tailrocks-skills
  plugin visible to the subject agent — eval-magic's shadow preflight
  flags it as invalidating the comparison; isolation
  (`--setting-sources project,local` or equivalent) is required
  (observed in session, 2026-08-16).

## Quality bar

## Open questions

- Replace `scripts/run-evals.ts` with eval-magic, or run both (eval-magic
  for PR old-vs-new comparisons, the in-repo runner for quick checks)?
- Migrate all `evals/evals.json` `id` fields from integers to kebab-case
  strings — one sweep, or only as skills are touched?
- Where does the dispatch wrapper live (mise task, script under
  `scripts/`), and which backends does it officially support?
- Provider policy: subjects on the cheap gateway backend, judges on which
  model?

## Open research questions

- How should a PR changed-skill selector work (directly changed, renamed,
  deleted, shared-infrastructure impact) — eval-magic ships none?
- What runs-per-condition count gives useful statistical separation for
  this repository's eval corpus (eval-magic defaults to 1 and prints
  Fisher-exact floors)?

## Deferred

## Remaining
