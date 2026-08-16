# PR body construction

How `tailrocks-create-pr` sources the body skeleton and what the prose in it
must and must not do. `tailrocks-refresh-pr` applies the same rules when it
reconciles a body, and `tailrocks-merge-pr` when it checks metadata at the
gate.

## Template discovery — default before config

Unless `.tailrocks/pr.md` names a generator command or another template path
under `## Body`, the body skeleton comes from the repository's own template,
looked up the way GitHub itself does:

1. `.github/PULL_REQUEST_TEMPLATE.md` — the default location; read this
   file relative to the repository root in every repository.
2. `PULL_REQUEST_TEMPLATE.md` or `docs/PULL_REQUEST_TEMPLATE.md` — GitHub's
   alternate locations (any of the three, case-insensitive).
3. `.github/PULL_REQUEST_TEMPLATE/` — a multi-template directory; ask which
   one applies when more than one fits the change.
4. None of the above → use the generic skeleton shipped beside this skill at
   `templates/PULL_REQUEST_TEMPLATE.md`, and offer to install it as the
   repository's `.github/PULL_REQUEST_TEMPLATE.md` so future PRs — from
   humans and agents alike — start from the same shape.

Read the template at runtime, every time. Never reconstruct it from memory:
repositories edit their templates, and a from-memory copy ships yesterday's
sections. HTML comments in the template are authoring instructions for you —
follow them, then strip them from the posted body along with every
`<placeholder>`.

## Section discipline

- One paragraph per section, no hard-wrap inside a paragraph — GitHub flows
  the text.
- **Summary** answers what the PR is for and who benefits — short; detail
  lives in the sections below it.
- **What ships** is feature-level outcomes. Not function names, not struct
  inventories, not fixture counts — the diff already shows those.
- **Behavior changes** exists only when it adds signal beyond What ships:
  changed defaults, validation, errors, migration or runtime consequences.
- Optional sections are dropped, not filled with "None" — except Migration
  notes, where an explicit "None." is meaningful while a project is
  pre-release.
- No design-rationale narration in the body; link a contributor doc by name.
- No file-by-file changelog and no full test list — the diff and the runner
  output are the record.
- No deployed-docs URLs — they break after merge. Refer to docs by name;
  verify-locally URLs are `http://localhost:<port>/...` only.
- No mechanical CI-shaped checks in the body. What CI enforces, CI reports.

## Verify locally

The one section a reviewer executes. Its blocks are selected by what the
diff touches — a docs block for a docs change, a migration block for a
schema change — never pasted wholesale:

- Every command is copy-pasteable exactly as written.
- State the expected outcome whenever a bare exit code does not
  disambiguate pass from fail.
- Scope test filters to the change first; the full suite command follows.
- A block the diff does not earn is dropped, not left as boilerplate.

`tailrocks-refresh-pr` treats this section's block set as derived state: the
current diff decides which blocks belong, while the fill inside a kept block
is the author's and survives reconciliation.
