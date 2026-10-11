# Usage

Each skill has one owner task. Select the owner for the requested
work. One skill never borrows another skill task.

## Select a skill

Use the selector of the installed client. See `installation.md` for
the exact install of each client. The review skill shows the shape on
each client:

```text
/tailrocks-macos-skills:tailrocks-swift-review Sources/
/skill:tailrocks-swift-review Sources/
$tailrocks-swift-review Sources/
/tailrocks-swift-review Sources/
```

The first form fits Claude Code. The second form fits Kimi Code.
The third form fits Codex. The fourth form fits Muse, Antigravity,
and Grok pickers. OpenCode has no slash form: request the skill by
name in the prompt. Amp has no slash invoke: ask the thread
for the exact qualified skill by name.

The thirteen user-only skills need an explicit human command on every
client. A model must not select them from task similarity.

## Skill owners

| Request | Owner |
| --- | --- |
| Design a native screen and prototype it | `tailrocks-macos-design` |
| Score a rendered screen | `tailrocks-macos-design-review` |
| Persist approved design learning | `tailrocks-macos-design-systematize` |
| Freeze a visual baseline | `tailrocks-macos-visual-baseline` |
| Verify the current render | `tailrocks-macos-visual-qa` |
| Compare captures with a baseline | `tailrocks-macos-visual-regression` |
| Wire Xcode for agent work | `tailrocks-swift-agent-integration` |
| Write Swift and SwiftUI code | `tailrocks-swift-best-practices` |
| Audit a project baseline | `tailrocks-swift-project-audit` |
| Close approved baseline gaps | `tailrocks-swift-project-remediate` |
| Scaffold a new project baseline | `tailrocks-swift-project-setup` |
| Restructure Swift code | `tailrocks-swift-refactor` |
| Review Swift code | `tailrocks-swift-review` |
| Design the Swift and Rust boundary | `tailrocks-swift-rust-core-boundary` |
| Wire the Rust core lane | `tailrocks-swift-rust-core-setup` |

Read the skill body for the full procedure. Each body lives at
`skills/` plus the skill id plus `SKILL.md`. One example is
`skills/tailrocks-swift-review/SKILL.md`.

## Example: review Swift sources

Invoke the review owner with the target paths:

```text
/tailrocks-macos-skills:tailrocks-swift-review Sources/
```

The skill returns verified findings with file and line evidence,
the failure mechanism, and a narrow correction. The skill is
read-only. It never edits, refactors, or approves. A review report
never authorizes a correction. To restructure the code, select the
refactor owner in a separate explicit command.

## Example: design a native screen

Invoke the design owner with the mode and the screen:

```text
/tailrocks-macos-skills:tailrocks-macos-design design "Settings screen"
```

The skill writes the experience brief, the native component map,
and two to four structural alternatives from realistic fixtures.
It stops at the human-selection gate. A person selects the winning
direction. The skill never approves its own design. Blessing needs
a live user sign-off on the running prototype in a separate step.

## Example: scaffold a new project

Invoke the setup owner with the project requirements. The skill is
user-only, so the command must come from a person:

```text
/tailrocks-macos-skills:tailrocks-swift-project-setup "Menu bar timer app"
```

The skill writes one reproducible baseline from the canonical
templates: declarative generation, exact tool pins, shipping and
forward SDK lanes, ad-hoc signing, strict format and lint gates,
and counted tests. It refuses a non-empty target and sends that
work to the audit owner.

## Family boundaries

Design work moves through design, independent review, user blessing,
and baseline freeze. Current-render verification judges the running
app. Regression compares new captures with a frozen baseline. Only
approved learning with a passing review enters the product corpus.

Project work moves through setup, audit, and remediation. Setup
scaffolds new projects only. Audit measures an existing project and
emits a fixed gap ledger. Remediation closes approved ledger rows
only.

Code work separates writing, review, and restructuring. The
best-practices skill writes new behavior. The review skill inspects
without mutation. The refactor skill restructures under a frozen
behavior contract.

Rust core work separates architecture from wiring. The boundary
skill designs the message contract and the responsibility split.
The setup skill wires generation, packaging, and gates. Agent
integration wires the Xcode bridge and vendors upstream knowledge
read-only.
