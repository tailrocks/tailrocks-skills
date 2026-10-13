# Usage

Each skill has one owner task. Select the owner for the requested
work. One skill never borrows another skill task. All four skills
are manual-only. Invoke each one only through an explicit human
command.

## Select a skill

Use the selector of the installed client. See `installation.md` for
the exact install of each client. The audit skill shows the shape on
each client:

```text
/tailrocks-skill-authoring-skills:tailrocks-skill-audit tailrocks-review-pr
$tailrocks-skill-audit tailrocks-review-pr
/skill:tailrocks-skill-audit tailrocks-review-pr
/tailrocks-skill-audit tailrocks-review-pr
```

The first form fits Claude Code. The second form fits Codex. The
third form fits Kimi Code. The fourth form fits Muse, Antigravity,
and Grok pickers. OpenCode has no slash form. Request the skill in
prose. Amp has no slash invoke. Ask the thread for the exact
qualified skill by name.

## Skill owners

| Request | Owner |
| --- | --- |
| Audit one skill or the portfolio | `tailrocks-skill-audit` |
| Make a new skill for a new responsibility | `tailrocks-skill-create` |
| Fix a skill in place | `tailrocks-skill-update` |
| Split, merge, or rename skills | `tailrocks-skill-refactor` |

Read the skill body for the full procedure. Each body lives at
`skills/` plus the skill id plus `SKILL.md`. One example is
`skills/tailrocks-skill-audit/SKILL.md`.

## Example: audit a skill

Invoke the audit owner with the skill name:

```text
/tailrocks-skill-authoring-skills:tailrocks-skill-audit tailrocks-review-pr
```

The skill returns a report with findings, concrete evidence, and
named fixes. The skill is read-only. It never edits the audited
skill. To apply the findings, select the update owner or the
refactor owner in a separate explicit command.

## Example: create a skill

Invoke the create owner with the new responsibility:

```text
$tailrocks-skill-create review Terraform pull requests
```

The example uses the Codex selector. The selector list above shows
the form of each client.

The skill confirms that no sibling owns the responsibility, copies
the stored template, authors the smallest effective procedure, and
wires the repository. The skill refuses placement work that belongs
to a gate, an instruction file, or an existing owner.

## Example: update a skill

Invoke the update owner with the skill name and the defect:

```text
/skill:tailrocks-skill-update tailrocks-review-pr strengthen the evidence rule
```

The example uses the Kimi selector. The skill fixes the defect in
place. The responsibility and the public contract stay unchanged. A
split, merge, or rename belongs to the refactor owner instead.

## Example: refactor skills

Invoke the refactor owner with the skills and the transformation:

```text
/tailrocks-skill-refactor tailrocks-improve tailrocks-improve-deep merge
```

The skill maps every source responsibility to exactly one target,
preserves the behavior, and updates the wiring. After the skill
records every consumer of the changed names, it permits the
authorized change.

## Lifecycle boundary

New responsibilities belong to `tailrocks-skill-create`. Audits
belong to `tailrocks-skill-audit`. In-place fixes belong to
`tailrocks-skill-update`. Splits, merges, and renames belong to
`tailrocks-skill-refactor`. Each owner needs an explicit human
selection on every client.

The audit owner never edits. The create owner never changes an
existing skill. The update owner never changes the public contract.
The refactor owner never changes the behavior. A contract change
needs a separately scoped explicit authorization outside these four
skills.
