# Placement and Topology

How agents actually load instruction files, where a rule belongs, and how the
one-content-file rule is enforced. Sources inspected 2026-08-16.

## What each agent reads

`AGENTS.md` is the cross-tool standard, stewarded by the Agentic AI Foundation
under the Linux Foundation since December 2025 and read natively by Codex,
Cursor, Copilot's coding agent, Gemini CLI, Aider, Windsurf, Amp, Zed, Jules,
Devin, and others (<https://agents.md/>).

**Claude Code does not read `AGENTS.md`.** It reads `CLAUDE.md`. That single
fact is why the symlink exists: one file of content, two names, no drift. An
`@AGENTS.md` import inside `CLAUDE.md` is the alternative where symlinks are
impractical — see the Windows note below.

Loading differs by agent, and both behaviors reward nesting:

- **Claude Code** loads the working directory's `CLAUDE.md` and every
  **ancestor** at launch. Files in **subdirectories load on demand**, only once
  it reads a file there. A nested rule therefore costs nothing until the agent
  works in that subtree.
  (<https://code.claude.com/docs/en/large-codebases>)
- **Codex** concatenates from the git root down to the working directory, later
  files winning conflicts, capped at 32 KiB. Distributing rules across
  directories is the supported way to stay under the cap rather than raising it.
  (<https://codex.danielvaughan.com/2026/03/26/agents-md-advanced-patterns/>)
- **Most others** take nearest-file-wins.

Where the merge order differs, write rules so they do not depend on it: a
descendant rule should stand alone, not amend a sentence in an ancestor.

## Finding the owning directory

Every unit is a candidate owner, not only the obvious ones: a Rust crate under
`crates/`, a workspace package, a service, a mobile or desktop app, a shared
library, a documentation site, an infrastructure module, a migrations
directory, a generated tree, a test suite, a scripts or tooling directory. If a
directory has conventions of its own, it can own rules. There is no category of
code that is exempt and no category that gets special treatment.

1. List the files the rule governs. If you cannot, the rule is too vague to
   write.
2. Take their deepest common ancestor directory.
3. Walk up only while the rule stays true of **everything** below the candidate
   directory. Stop at the first level where it does not.
4. That directory owns the rule. If it has no `AGENTS.md`, create one.

Worked cases:

| Rule | Owner |
|---|---|
| "Documentation pages are `.mdx`, never `.md`" | `docs/` — untrue of every other directory |
| "Commit with DCO signoff" | repository root — true of every commit |
| "Run tests from the package directory, not the root" | root, in a monorepo — it is a statement about the layout |
| "Database queries go through the query builder, never raw SQL" | the package that owns the database layer |
| "This vendored SDK is generated; edit the generator instead" | the vendored directory itself |
| "`unsafe` needs a `// SAFETY:` comment naming the invariant" | the crate that allows `unsafe`, not the workspace |
| "Terraform state is remote; never run `apply` locally" | the infrastructure module |
| "Migrations are append-only; never edit a shipped file" | the migrations directory |
| "Fixtures are recorded, not hand-written; re-record with the task" | the test directory that owns them |

The root file's legitimate content is small: what the repository is, how it is
laid out, and the conventions that genuinely span every package — commits,
branching, release. Anything naming one stack, one package, or one directory is
misplaced there.

## Nesting the tree

This applies to any repository, not only a monorepo. A single-tree project
nests by subsystem — `crates/parser/`, `src/db/`, `infra/`, `docs/` — exactly as
a workspace nests by package. Two levels is the common shape and usually
enough:

```text
AGENTS.md                 # what the repo is, layout, repo-wide conventions
CLAUDE.md -> AGENTS.md
packages/api/AGENTS.md    # this package's stack, commands, gotchas
packages/api/CLAUDE.md -> AGENTS.md
packages/web/AGENTS.md
packages/web/CLAUDE.md -> AGENTS.md
```

Rules for the tree:

- **Never restate an ancestor rule in a descendant.** Both files load together;
  the repetition is pure cost, and the two copies drift.
- **A descendant may override an ancestor** when its stack genuinely differs.
  Say so explicitly ("overrides root: …") because merge order is not uniform
  across agents.
- **Do not create a file per directory.** Create one where a real difference
  exists. An `AGENTS.md` holding a single obvious line is worse than no file.
- **Cross-package rules stay at the root**, even when only two packages are
  affected today, if the rule is about how packages relate.

When per-directory files stop scaling — conventions drifting, no owner, files
going stale — move reference content into skills or a plugin, which load on
demand, and leave only rules behind
(<https://code.claude.com/docs/en/large-codebases>).

## Creating a new file

The existing set of instruction files is a snapshot, not a constraint. When step
2 lands on a directory with no `AGENTS.md`, create one. Pushing the rule up to
the nearest existing file is the failure this skill exists to prevent — it is
how root files grow.

A new file is created as a pair, in the same change:

```sh
printf '# %s\n\n' "$(basename "$PWD")" > AGENTS.md
ln -s AGENTS.md CLAUDE.md
```

A directory never holds one without the other. Add both to the same commit so no
checkout ever sees a bare `AGENTS.md` that Claude Code cannot read.

Two things a new file must not do: repeat what an ancestor already says, and
exist to hold a single line that failed the non-obvious test. If the rule does
not survive step 3, the answer is no file, not a small one.

## One content file per directory

In any directory that has instructions:

- `AGENTS.md` is a regular file and holds all of it.
- `CLAUDE.md`, `GEMINI.md`, and any other client name are symlinks to
  `AGENTS.md` in the same directory.

Create and verify:

```sh
ln -s AGENTS.md CLAUDE.md
readlink CLAUDE.md          # AGENTS.md
git ls-files -s CLAUDE.md   # mode 120000 means git stored a symlink
```

The link target is the bare filename, never a path, so the pair stays valid
under any checkout, worktree, or copy.

Merging a client file that already holds content: move anything it says that
`AGENTS.md` does not into `AGENTS.md`, delete the client file, then create the
symlink. Never keep "just a few Claude-specific lines" — that is how the two
files diverged in the first place.

Two situations argue against the symlink, and only these two:

- **Windows checkouts without Developer Mode or `core.symlinks=true`**, where
  git materializes a symlink as a text file containing its target. Use
  `CLAUDE.md` containing exactly `@AGENTS.md` instead, for that repository.
- **A genuinely client-specific instruction** that would be wrong for other
  agents. Prefer deleting it; agent-specific behavior in a shared repository is
  usually a sign the rule belongs in that client's own configuration.

## Budget

Every line in an always-loaded file is paid on every request in that scope.
Treat these as review triggers, not hard limits:

- root file over ~100 lines: look for content that belongs deeper or in a skill;
- any file over ~200 lines: split by directory or move reference material out;
- Codex's 32 KiB cap applies to the whole concatenated chain, so a fat root file
  eats the budget of every package below it.

Report measured sizes, never estimates.

## Related mechanisms

Reach for these before growing a file:

- **Path-scoped rules** (`.claude/rules/` with a `paths:` glob) when the same
  rule applies to scattered paths that share no directory.
- **Per-directory skills** for procedures rather than constraints — they load
  only when relevant.
- **Settings** for what an agent may read or run; a permission is enforced,
  while a sentence asking it not to look is not.
