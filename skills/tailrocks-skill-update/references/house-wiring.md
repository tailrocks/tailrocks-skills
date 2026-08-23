# House wiring

What a finished skill touches beyond its own directory. Target repository policy
governs. Detect it from instruction files, existing skill siblings, validators,
manifests, catalogs, and generation commands. Persist discovered mechanical
policy in `.skill-authoring.json`; if evidence conflicts or required policy is
missing, stop without mutation. Never project this repository's metadata onto a
different tree.

## The skill directory

```text
skills/<name>/
├── SKILL.md            # router: frontmatter + body
├── agents/openai.yaml  # per-client invocation policy
├── references/         # depth, free until read
└── templates/          # copy-ready assets the skill ships (optional)
```

Tailrocks profile uses: `name`, `license: Apache-2.0`, a description
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

## Shared references

Skill-authoring doctrine has one authored source per subject under
`skill-authoring/references/`. Consumers load generated skill-local copies whose
destinations are declared by the generation manifest and checked byte-for-byte.
A sibling skill never links another sibling's private reference, and no local
copy may paraphrase or override its source.

## The repository files

Rows below define Tailrocks profile. Another repository maps only artifacts its
observed policy supports; absent client or catalog surfaces stay absent. Its
`.skill-authoring.json` names skill root, anchored name pattern, template, optional
display prefix, invocation registry, and optional catalog wiring. Scaffolding
defaults to `MANUAL_ONLY`; `MODEL_POLICY` requires a separately confirmed exact
trigger on that invocation and grants no new authority.

| Artifact | Obligation |
|---|---|
| `catalog.json` | Add the skill to exactly one group; validation fails until it appears once. |
| Generated docs | `mise run docs` writes the skill's public site pages and the root `README.md` row — never edit generated files by hand. |
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

Run each once. Validator repair permits at most two matched, in-scope passes.
Stop immediately for an unmatched error, unavailable tool, or exhausted bound;
preserve current state, report exact failure and prior mutations, and never
claim completion.

Per-skill eval trees are forbidden. Behavioral claims use durable evidence
records and deterministic acceptance checks.

## Update-mode obligations

Editing an existing skill adds constraints beyond the create path:

- **Check the cited evidence record before rewording** a gate, rejection rule,
  or "complete when" clause — load-bearing lines are not edited casually.
- **Strengthen over append.** Prefer making an existing section state
  the new obligation to adding a sibling section that gestures at it.
- **A router has at most 200 body lines.** At the limit, the next addition
  replaces or extracts existing material.
- **Rerun every affected deterministic acceptance check** after a router
  change — a new section changes every behavior in the file, so the check
  nearest the edit is not the only one at risk.
- A check that misses one element while everything else is correct usually
  exposes a signposting defect — look at where the
  requirement sits in the file before rewriting what it says.
- Generated public docs are refreshed by `mise run docs`, never edited.
