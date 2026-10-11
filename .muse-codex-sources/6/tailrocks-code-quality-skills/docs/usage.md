# Usage

Each skill has one owner task. Select the owner for the
requested work. One skill never borrows another skill task.

## Select a skill

Use the selector of the installed client. See
`installation.md` for the exact install of each client. The
audit skill shows the shape on each client:

```text
/tailrocks-code-quality-skills:tailrocks-improve-audit ./my-repo
$tailrocks-improve-audit ./my-repo
/skill:tailrocks-improve-audit ./my-repo
/tailrocks-improve-audit ./my-repo
```

The first form fits Claude Code. The second form fits Codex.
The third form fits Kimi Code. The fourth form fits Muse,
Antigravity, and Grok pickers. OpenCode uses a prompt
sentence instead. Amp has no slash
invoke: ask the thread for the exact qualified skill by name.

Thirteen skills need an explicit human command on every
client. Only `tailrocks-agents-md` is model-selectable, and
it supplies policy only. A model must not select a user-only
skill from task similarity.

## Skill owners

| Request | Owner |
| --- | --- |
| Audit a repository for quality | `tailrocks-improve-audit` |
| Audit a repository for security | `tailrocks-improve-security-audit` |
| Turn a finding into a standalone plan | `tailrocks-improve-plan` |
| Execute one approved plan in isolation | `tailrocks-improve-execution` |
| Reconcile the plan backlog | `tailrocks-improve-reconcile` |
| Measure one debt class | `tailrocks-code-health-audit` |
| Establish or tighten one quality bound | `tailrocks-code-health` |
| Diagnose one defect | `tailrocks-root-cause` |
| Apply one approved correction | `tailrocks-remediate` |
| Find measured code removals | `tailrocks-simplify-audit` |
| Apply approved removals | `tailrocks-simplify` |
| Add one instruction rule | `tailrocks-agents-md` |
| Audit instruction files | `tailrocks-agents-md-audit` |
| Apply one approved instruction repair | `tailrocks-agents-md-sync` |

Read the skill body for the full procedure. Each body lives
at `skills/` plus the skill id plus `SKILL.md`. One example
is `skills/tailrocks-improve-audit/SKILL.md`.

## Example: audit a repository

Invoke the audit owner with the target path:

```text
/tailrocks-code-quality-skills:tailrocks-improve-audit ./my-repo
```

The skill returns one evidence-ranked report with verified
defects, direction options, and rejected candidates. The
skill is read-only. It never plans, implements, or changes
source. Each finding names at most one next owner. No owner
is invoked.

## Example: plan, execute, and reconcile

Invoke the plan owner with one verified finding:

```text
$tailrocks-improve-plan "unbounded retry loop in sync worker"
```

The example uses the Codex selector. The selector list above
shows the form of each client.

The skill writes one executor-ready plan under `plans/` and
one index row. It never implements. To execute the approved
plan in isolation, select the execution owner with the plan
path in a separate explicit command. The execution owner
returns `APPROVE`, `SEND_BACK`, or `BLOCKED_PLAN`. It never
merges. It pushes only with separate explicit authorization.
To synchronize backlog status with repository truth, select
the reconcile owner. It updates only `plans/README.md`.

## Example: diagnose and remediate

Invoke the diagnosis owner with one proven defect:

```text
/tailrocks-code-quality-skills:tailrocks-root-cause "checkout drops items"
```

The skill returns a `DIAGNOSED` or `NOT_PROVEN` report with
the causal chain, the bounded class, and ranked correction
options. The report grants no mutation authority. To apply
the approved correction, select the remediate owner. Pass
explicit `fix` with the exact current contract. Use a
separate explicit command.

## Lifecycle boundary

Audits report only. `tailrocks-improve-audit`,
`tailrocks-improve-security-audit`,
`tailrocks-code-health-audit`, `tailrocks-root-cause`,
`tailrocks-simplify-audit`, and `tailrocks-agents-md-audit`
change nothing. Plans describe work. `tailrocks-improve-plan`
writes one plan and one index row. Mutations need separate
explicit commands with their own approvals:
`tailrocks-improve-execution`, `tailrocks-remediate`,
`tailrocks-simplify`, `tailrocks-code-health`, and
`tailrocks-agents-md-sync`.

An audit report never authorizes a mutation. A diagnosis
report never authorizes a correction. A plan never grants
network, secret, merge, or push authority. Each run needs
its own human invocation.
