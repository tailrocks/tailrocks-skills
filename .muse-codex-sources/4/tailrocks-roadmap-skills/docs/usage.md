# Usage

Each skill has one owner task. Select the owner for the requested
work. One skill never borrows another skill task.

## Select a skill

Use the selector of the installed client. See `installation.md` for
the exact install of each client. The idea skill shows the shape on
each client:

```text
/tailrocks-roadmap-skills:tailrocks-idea Add offline mode to the CLI
$tailrocks-idea Add offline mode to the CLI
/skill:tailrocks-idea Add offline mode to the CLI
/tailrocks-idea Add offline mode to the CLI
```

The first form fits Claude Code. The second form fits Codex. The
third form fits Kimi Code. The fourth form fits Muse, Antigravity,
and Grok pickers. Amp has no slash invoke: ask the thread
for the exact qualified skill by name.

The eleven user-only skills need an explicit human command on every
client. A model must not select them from task similarity. Only
`tailrocks-grilling` is model-selectable.

## Skill owners

| Request | Owner |
| --- | --- |
| Capture a raw idea as a DRAFT item | `tailrocks-idea` |
| Seed one verified finding as a DRAFT item | `tailrocks-seed-roadmap` |
| Shape a young item in an interview | `tailrocks-brainstorm` |
| Stress-test a choice without artifacts | `tailrocks-grilling` |
| Produce vetted reusable research | `tailrocks-research` |
| Record one user decision | `tailrocks-record-decision` |
| Capture one feedback round | `tailrocks-record-feedback` |
| Close shaping and grant READY | `tailrocks-finalize` |
| Write the plan package and goal handoff | `tailrocks-plan` |
| Execute surfaces and judge the round | `tailrocks-prove` |
| True up status with execution reality | `tailrocks-reconcile` |
| Propose skill patches from one history | `tailrocks-retrospect` |

Read the skill body for the full procedure. Each body lives at
`skills/` plus the skill id plus `SKILL.md`. One example is
`skills/tailrocks-idea/SKILL.md`.

## Idea or seed: the input boundary

`tailrocks-idea` and `tailrocks-seed-roadmap` both create one DRAFT
item on one delivery branch with one draft pull request. Their
inputs differ, so both skills stay:

- Use `tailrocks-idea` for raw user words: a sentence, a paragraph,
  or pasted notes. The skill preserves the words and asks nothing.
- Use `tailrocks-seed-roadmap` for one already-verified finding or
  one approved standalone plan. The skill checks eligibility and
  duplicate guards before it writes.

Raw input never routes to the seed skill. Verified input never
routes to the idea skill.

## Example: capture an idea

Invoke the idea owner with the raw words:

```text
/tailrocks-roadmap-skills:tailrocks-idea Add offline mode to the CLI
```

The skill derives the slug `cli-offline-mode`. It writes
`roadmap/cli-offline-mode/README.md` with status DRAFT and
registers the index row. It commits both files with the trailer
`Tailrocks-Skill: tailrocks-idea`. It pushes the delivery branch
`roadmap/cli-offline-mode` and opens one draft pull request. The
next step is `tailrocks-brainstorm cli-offline-mode`.

## Example: shape an item

Invoke the brainstorm owner with the slug:

```text
/tailrocks-roadmap-skills:tailrocks-brainstorm cli-offline-mode
```

The skill moves the item to SHAPING and interviews the user, one
question at a time. Every answer lands in the item file the moment
it resolves. The skill commits the session writes with the trailer
`Tailrocks-Skill: tailrocks-brainstorm` and pushes. Without a live
human, the skill stops.

## Example: prove shipped work

Invoke the prove owner with the slug:

```text
/tailrocks-roadmap-skills:tailrocks-prove cli-offline-mode
```

The skill builds the bound commit in a disposable checkout,
executes every claimed surface with the product tools, and writes
one round report under `roadmap/cli-offline-mode/verification/`.
The skill judges only. It never fixes source and never writes
status. The next step is `tailrocks-reconcile cli-offline-mode`.

## Lifecycle boundary

Capture belongs to `tailrocks-idea` and `tailrocks-seed-roadmap`.
Shaping interviews belong to `tailrocks-brainstorm`. The closing
interview and READY belong to `tailrocks-finalize`. Research
belongs to `tailrocks-research`. Decisions belong to
`tailrocks-record-decision`. Plan packages belong to
`tailrocks-plan`. Feedback capture belongs to
`tailrocks-record-feedback`. Execution proof belongs to
`tailrocks-prove`. Status truth belongs to `tailrocks-reconcile`.
Field retrospection belongs to `tailrocks-retrospect`. Challenge
conversations without artifacts belong to `tailrocks-grilling`.

One item lives on one branch with one pull request, from capture
through every verification round. No delivery skill opens a second
pull request for an item that already has one. Each invocation ends
with one marked commit that carries the trailer `Tailrocks-Skill:
<skill-id>`. That commit series is the item history. No artifact
carries a log of its own.

Only `tailrocks-finalize` grants READY. Only `tailrocks-plan` sets
PLANNED. Only `tailrocks-reconcile` sets DONE, and it retires the
item out of the tree in the same invocation.
