# Usage

Each skill has one owner task. Select the owner for the requested
work. One skill never borrows another skill task.

## Select a skill

Use the selector of the installed client. See `installation.md` for
the exact install of each client. The recon skill shows the shape on
each client:

```text
/tailrocks-contribution-skills:tailrocks-contribute-recon OWNER/REPO
$tailrocks-contribute-recon OWNER/REPO
/skill:tailrocks-contribute-recon OWNER/REPO
/tailrocks-contribute-recon OWNER/REPO
```

The first form fits Claude Code. The second form fits Codex. The
third form fits Kimi Code. The fourth form fits Muse, Antigravity,
and Grok pickers. For OpenCode, request the skill by name in the
prompt (see `installation.md`). Amp has no slash invoke: ask the
thread for the exact qualified skill by name.

All five skills need an explicit human command on every client. A
model must not select a contribution skill from task similarity.

## Skill owners

| Request | Owner |
| --- | --- |
| Examine one external project | `tailrocks-contribute-recon` |
| Draft one venue proposal | `tailrocks-contribute-propose` |
| Implement one authorized proposal | `tailrocks-contribute-prepare` |
| Publish one prepared contribution | `tailrocks-contribute-submit` |
| Answer one review round | `tailrocks-contribute-respond` |

Read the skill body for the full procedure. Each body lives at
`skills/` plus the skill id plus `SKILL.md`. One example is
`skills/tailrocks-contribute-recon/SKILL.md`.

## Example: examine one project

Invoke the recon owner with the project identity:

```text
/tailrocks-contribution-skills:tailrocks-contribute-recon OWNER/REPO
```

The skill returns a handoff with the contribution contract,
classifications, and one outcome: examined, blocked, or refused. The
skill is read-only. It never proposes, edits, or submits. A
reconnaissance report never authorizes a submission. To propose a
venue, select the propose owner in a separate explicit command.

## Example: publish one contribution

Invoke the submit owner with the prepared handoff:

```text
$tailrocks-contribute-submit contrib/OWNER-REPO
```

The example uses the Codex selector. The selector list above shows
the form of each client.

The explicit submission request authorizes the named push and
pull-request actions. A signoff or legal acceptance needs separate
explicit authorization. The skill revalidates remote state before each action. It
reports partial publication honestly.

## Lifecycle boundary

Reconnaissance belongs to `tailrocks-contribute-recon`. Venue
proposals belong to `tailrocks-contribute-propose`. Fork
implementation belongs to `tailrocks-contribute-prepare`. Publication
belongs to `tailrocks-contribute-submit`. Review answers belong to
`tailrocks-contribute-respond`. Each owner needs an explicit
selection.

Local handoff state lives under `contrib/<owner>-<repo>/`. Never
place it inside the target diff. Never commit it. Never publish it.
One contribution remains in flight per project.

Read-only inspection uses native `gh` only. Authenticate with `gh
auth login` first:

```sh
gh api repos/OWNER/REPO --method GET
gh pr view 12 --repo OWNER/REPO --json number,title,headRefOid,baseRefName
```

An inspection result never authorizes mutation. Do not use `gh push`, a
hosting API mutation, or a direct ref update to avoid the submit owner.
