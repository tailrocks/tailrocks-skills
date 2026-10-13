# Usage

Each skill has one owner task. Select the owner for the requested
work. One skill never borrows another skill task.

## Select a skill

Use the selector of the installed client. See `installation.md` for
the exact install of each client. The review skill shows the shape on
each client:

```text
/tailrocks-typescript-skills:tailrocks-typescript-review src/auth/session.ts
$tailrocks-typescript-review src/auth/session.ts
/skill:tailrocks-typescript-review src/auth/session.ts
/tailrocks-typescript-review src/auth/session.ts
```

The first form fits Claude Code. The second form fits Codex. The
third form fits Kimi Code. The fourth form fits Muse, Antigravity,
and Grok pickers. Amp has no slash invoke: ask the thread
for the exact qualified skill by name. OpenCode has no slash invoke:
request the skill by name in the prompt.

The ten user-only skills need an explicit human command on every
client. A model must not select them from task similarity. The two
ordinary skills, `tailrocks-typescript-best-practices` and
`tailrocks-web-design`, accept model selection.

## Skill owners

| Request | Owner |
| --- | --- |
| Audit one application baseline | `tailrocks-tanstack-project-audit` |
| Migrate one app to the baseline | `tailrocks-tanstack-project-migrate` |
| Close approved baseline gaps | `tailrocks-tanstack-project-remediate` |
| Scaffold one new application | `tailrocks-tanstack-project-setup` |
| Write strict TypeScript and React | `tailrocks-typescript-best-practices` |
| Migrate source contracts | `tailrocks-typescript-migrate` |
| Restructure code without behavior change | `tailrocks-typescript-refactor` |
| Review code and report defects | `tailrocks-typescript-review` |
| Design web screens in the app | `tailrocks-web-design` |
| Audit screens against the blessed reference | `tailrocks-web-design-audit` |
| Freeze screenshot baselines | `tailrocks-web-visual-baseline` |
| Compare screens with frozen baselines | `tailrocks-web-visual-regression` |

Read the skill body for the full procedure. Each body lives at
`skills/` plus the skill id plus `SKILL.md`. One example is
`skills/tailrocks-typescript-review/SKILL.md`.

## Example: review TypeScript code

Invoke the review owner with the review target:

```text
/tailrocks-typescript-skills:tailrocks-typescript-review src/auth/session.ts
```

The skill returns a report with findings, concrete evidence, and
narrow corrections. The skill is read-only. It never edits, installs,
or migrates. A review report never authorizes a correction. To fix a
finding, select the refactor or remediation owner in a separate
explicit command.

## Example: scaffold a new application

Invoke the setup owner with the empty destination:

```text
/tailrocks-typescript-skills:tailrocks-tanstack-project-setup ./apps/shop
```

The skill uses the official TanStack Start generator, reconciles the
result with the canonical templates, resolves exact compatible pins,
and runs every project gate. The skill refuses an existing
application. Existing apps belong to the audit, migrate, or
remediate owner.

## Example: design a web screen

Invoke the design owner with the screen name:

```text
/tailrocks-typescript-skills:tailrocks-web-design design checkout
```

The skill builds a design route in the real application. It renders
the route with fixture data. It iterates with the user until the
user blesses the screen. The blessed component is the component the
real page
ships. Baseline freezing after finalization belongs to
`tailrocks-web-visual-baseline`.

## Family boundaries

Source migration belongs to `tailrocks-typescript-migrate`. That
skill changes language contracts only: types, parsers, state shapes,
and strict semantics. Framework migration belongs to
`tailrocks-tanstack-project-migrate`. That skill changes project
ownership only: package manager, framework, routing, tooling, and
layout. One migration never borrows the other task.

New applications belong to `tailrocks-tanstack-project-setup`.
Approved gap repair in an existing house-stack application belongs to
`tailrocks-tanstack-project-remediate`. The remediate skill closes
exact approved ledger rows only. It never scaffolds and never moves
a foreign stack. Foreign-stack transition belongs to
`tailrocks-tanstack-project-migrate`.

Read-only judgment belongs to the audit and review owners. The
project audit measures an application against the baseline. The
design audit compares screens with the blessed reference. The
TypeScript review reports language-contract defects. A finding never
grants correction authority.

Baseline publication belongs to `tailrocks-web-visual-baseline`.
That skill freezes blessed screens into durable reference images.
Regression comparison belongs to
`tailrocks-web-visual-regression`. That skill compares the current
screens with the frozen images. It never updates a reference image.
A red comparison routes to an implementation fix or to a new human
design decision.
