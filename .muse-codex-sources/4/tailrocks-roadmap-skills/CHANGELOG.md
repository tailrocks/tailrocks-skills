# Changelog

## 0.28.1 - 2026-10-08

Applied the common active-package structure on branch
`standardize/package-rewrite`:

- Rewrote `plugin.json` as the portable Agent Plugins 1.0.0 manifest.
  It is now the source of truth for name, version, and description.
- Trimmed `.claude-plugin/plugin.json` to name, version, and
  description.
- Rewrote `.kimi-plugin/plugin.json` with `skills` set to `./skills/`
  and a four-field interface block.
- Removed the component marketplace file
  `.claude-plugin/marketplace.json`. The central `tailrocks`
  marketplace is now the only catalog.
- Removed the legacy host manifest `.codex-plugin/`. Codex uses the
  portable manifest.
- Removed the dead root file `catalog.json`. Nothing referenced it.
- Removed the scripts/ helper programs. The skills now use native
  file and Git operations plus the target product tools.
- Removed the generated docs/skills/ definition copies and
  docs/index.json. Each `SKILL.md` is now the single maintained
  procedure.
- Added `.alint.yml`, pinned to the shared active profile.
- Restructured `README.md` into the eight required sections.
- Replaced the old generated docs with the six standard guides
  under docs/.
- Rewrote `AGENTS.md` and added `.github/PULL_REQUEST_TEMPLATE.md`.
- Moved templates/ under each skill to assets/, per the common
  structure.

Rewrote all twelve kept skills in strict ASD-STE100 Issue 9 prose
with the common body order. Technical corrections:

- `tailrocks-idea`: replaced the required `idea-capture.ts` program
  with native file and Git operations.
- `tailrocks-brainstorm`: removed the required JSON program for
  question selection. The frontier method now runs natively.
- `tailrocks-finalize`: replaced the mandatory receipt program with
  a readiness review.
- `tailrocks-plan`: removed the required `plan-package.ts` program
  and the limit of two gates.
- `tailrocks-prove`: replaced the required capability program with
  native product tools and a disposable checkout.
- `tailrocks-record-decision` and `tailrocks-research`: removed the
  conflict between the Git prohibition and the required commits.
  Delivery skills commit per the delivery Git contract.
- `tailrocks-record-feedback`: kept one round number for the
  feedback file and its verification report.
- `tailrocks-reconcile`: kept the retirement-evidence rule. A
  missing folder is delivered only with its retiring commit.
- `tailrocks-retrospect`: permits a useful review when commit
  trailers are absent. Uncertain attribution is marked, not
  refused.
- Compared `tailrocks-idea` with `tailrocks-seed-roadmap`. The two
  input conditions stay distinct: raw user words versus verified
  findings or approved plans. Both skills stay separate.

Moved three skills to `tailrocks-code-quality-skills`. They are
deleted here, not rewritten:

- `tailrocks-improve-plan`
- `tailrocks-improve-execution`
- `tailrocks-improve-reconcile`

- Regenerated CI with Velnor Actions 0.1.4.
- Replaced the `.github/CLAUDE.md` symlink with a regular pointer
  file. Installers that reject symlinks now accept the package.

## 0.28.0 - 2026-10-06

Fifteen-skill package at commit `98d23280cd562c9298ce13ae40bd0eb73a3e376a`
("ci: adopt velnor-actions 0.1.0 (#2)"). Fourteen skills are
user-only and need an explicit human command. `tailrocks-grilling`
is model-selectable.
