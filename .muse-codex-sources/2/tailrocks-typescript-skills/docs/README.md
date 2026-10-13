# TypeScript skills guides

This package holds twelve skills. The skills write, review, refactor,
migrate, and audit TypeScript 7 and React code. They scaffold and
migrate TanStack Start applications on the Tailrocks baseline. They
also design web screens and verify them against frozen references.

Two skills are model-selectable. Ten skills are user-only and need an
explicit human command:

- `tailrocks-tanstack-project-audit` audits one application baseline.
- `tailrocks-tanstack-project-migrate` migrates one application to
  the baseline.
- `tailrocks-tanstack-project-remediate` closes approved baseline
  gaps.
- `tailrocks-tanstack-project-setup` scaffolds one new application.
- `tailrocks-typescript-migrate` migrates source contracts.
- `tailrocks-typescript-refactor` restructures code without behavior
  change.
- `tailrocks-typescript-review` reviews code and reports defects.
- `tailrocks-web-design-audit` audits screens against the reference.
- `tailrocks-web-visual-baseline` freezes screenshot baselines.
- `tailrocks-web-visual-regression` compares screens with baselines.

## Guides

- `installation.md` installs the package on eight coding agents.
- `usage.md` shows how to select each skill and what each skill
  returns.
- `compatibility.md` records the test result of each client route.
- `maintenance.md` lists the checks, the policy version, and the
  release procedure.
- `troubleshooting.md` fixes common install and selection failures.

## Skills

| Skill | Task |
| --- | --- |
| [`tailrocks-tanstack-project-audit`](../skills/tailrocks-tanstack-project-audit/SKILL.md) | Audit one app baseline. User-only. Read-only. |
| [`tailrocks-tanstack-project-migrate`](../skills/tailrocks-tanstack-project-migrate/SKILL.md) | Migrate one app to the baseline. User-only. |
| [`tailrocks-tanstack-project-remediate`](../skills/tailrocks-tanstack-project-remediate/SKILL.md) | Close approved baseline gaps. User-only. |
| [`tailrocks-tanstack-project-setup`](../skills/tailrocks-tanstack-project-setup/SKILL.md) | Scaffold one new app. User-only. |
| [`tailrocks-typescript-best-practices`](../skills/tailrocks-typescript-best-practices/SKILL.md) | Write strict TypeScript and React. |
| [`tailrocks-typescript-migrate`](../skills/tailrocks-typescript-migrate/SKILL.md) | Migrate source contracts. User-only. |
| [`tailrocks-typescript-refactor`](../skills/tailrocks-typescript-refactor/SKILL.md) | Restructure without behavior change. User-only. |
| [`tailrocks-typescript-review`](../skills/tailrocks-typescript-review/SKILL.md) | Review and report. User-only. Read-only. |
| [`tailrocks-web-design`](../skills/tailrocks-web-design/SKILL.md) | Design screens in the app. |
| [`tailrocks-web-design-audit`](../skills/tailrocks-web-design-audit/SKILL.md) | Audit screens against the reference. User-only. Read-only. |
| [`tailrocks-web-visual-baseline`](../skills/tailrocks-web-visual-baseline/SKILL.md) | Freeze screenshot baselines. User-only. |
| [`tailrocks-web-visual-regression`](../skills/tailrocks-web-visual-regression/SKILL.md) | Compare screens with baselines. User-only. Read-only. |

Each skill body lives in its own directory under `skills/`. Read
`skills/tailrocks-typescript-review/SKILL.md` for one complete
example.

## Requirements

Project work needs Bun and Git. The TanStack family runs project
gates through Bun. Visual skills need the pinned Playwright browser.
Directory-copy installs must copy the complete package: the skills
use helpers under `scripts/`. See `installation.md`.
