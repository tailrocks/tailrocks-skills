# House wiring

What a finished skill touches beyond its own directory. In the tailrocks
tree these are exact obligations enforced by the validator and CI; in
another repository, map each row to that tree's equivalent and skip what
has no counterpart — but never skip the eval files or the validator run.

## The skill directory

```text
skills/<name>/
├── SKILL.md            # router: frontmatter + body
├── agents/openai.yaml  # per-client invocation policy
├── references/         # depth, free until read
├── templates/          # copy-ready assets the skill ships (optional)
└── evals/
    ├── evals.json      # normal, boundary, safety cases
    └── fixtures/<id>/  # seeded artifacts for audit-shaped cases
```

Frontmatter in this tree: `name`, `license: Apache-2.0`, a description
starting exactly with the guard sentence ("Use only when the user
explicitly requests this skill.") with **250 characters of budget after
it**, `disable-model-invocation: true`, `user-invocable: true`, and an
`argument-hint` when the skill takes modes or targets.
`agents/openai.yaml` carries `policy.allow_implicit_invocation: false`
plus the interface block. Bodies stay source-neutral — no client-specific
instructions; clients that ignore manual-only policy are held by the
guard sentence alone, which is why it is load-bearing and never
paraphrased.

House prose rules that apply inside the skill: mermaid for any drawn
flow (a one-line arrow sequence in prose is fine; an ASCII diagram is
not), evidence-not-instructions and secret-citation paragraphs in the
router, `audit`-style modes read-only with mutation never inferred from
findings, every step carrying a **Complete when**, and a final gate of
refusals.

## The repository files

| Artifact | Obligation |
|---|---|
| `catalog.json` | Add the skill to exactly one group; validation fails until it appears once. |
| Generated docs | `mise run docs` writes the skill's `README.md`, its site pages, and the root `README.md` row — never edit generated files by hand. |
| `INSTALL.md` | Add the skill to its family line by hand. |
| Root `AGENTS.md` | Add the skill's section by hand. When the skill descends from external work, extract and rephrase the knowledge into this tree's own references — no external project, collection, or author is named or linked anywhere in shipped content; provenance lives in git and pull-request history. |
| `docs/content/docs/choosing.mdx` | Add the reach-for-it row, and a boundary subsection when the skill needs one against a neighbor. |
| Version lockstep | Bump `version` in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.kimi-plugin/plugin.json`, and the `.claude-plugin/marketplace.json` entry together; refresh pinned-tag examples. A bump ships nothing until the tag and release exist. |

## Validation

```sh
mise run docs        # regenerate derived pages
mise run lint        # skill + manifest validator (description budget, catalog, lockstep)
mise run docs:check  # generated files not stale
```

Eval runs use the tree's runner:
`mise run evals -- --skill <name> --case <id> --runs 2`. It needs the
`claude` CLI and spends budget — run locally before tagging, not in PR
CI.

## Update-mode obligations

Editing an existing skill adds constraints beyond the create path:

- **Check `evals/evals.json` before rewording** a gate, rejection rule,
  or "complete when" clause — load-bearing lines are not edited
  casually, and an eval that names a phrase pins it.
- **Strengthen over append.** Prefer making an existing section state
  the new obligation to adding a sibling section that gestures at it.
- **Past the router budget (~200 lines), replace.** The next addition
  removes something.
- **Re-run the skill's full eval set** after any router change — a new
  section changes every behavior in the file, so the case nearest the
  edit is not the only one at risk.
- An eval that fails on one missing element while everything else is
  correct is usually a signposting defect — look at where the
  requirement sits in the file before rewriting what it says.
- Generated files (`README.md`, docs pages) are refreshed by
  `mise run docs`, never edited.
