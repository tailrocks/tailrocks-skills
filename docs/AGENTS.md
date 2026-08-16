# docs

Fumadocs on TanStack Start, built by Vite into a static bundle, published to
<https://skills.tailrocks.com> from GitHub Pages. Commands and the deployment
contract: `README.md`.

Never edit a generated page. `content/docs/skills/<name>/`,
`content/docs/skills/index.mdx`, `content/docs/skills/meta.json`, and
`content/docs/install.mdx` come from `SKILL.md`, `catalog.json`, and
`INSTALL.md` through `mise run docs` at the repository root. Edit the source,
regenerate.

Hand-written pages: `content/docs/index.mdx` and `content/docs/choosing.mdx`.

Every page under `content/` is `.mdx`, never `.md`. A `.md` page renders
without component support, and the difference stays invisible until a page
needs one. `mise run docs:check` rejects it.

Invocation examples are `<Invoke skill="…" args="…" />`, never a hand-written
slash command. The component writes the syntax of whichever client the reader
selected — Claude Code takes `/tailrocks-skills:name`, Codex takes `$name`,
Kimi takes `/skill:name`, OpenCode and Amp take prose — and renders it through
Fumadocs' own `CodeBlock`, so it carries the same copy button as every other
command on the site.

The selector lives once in the sidebar banner, not in the page body: the choice
is made once and applies everywhere, and pages stay free of a control that
would repeat on all of them. The default renders server-side, so a prerendered
page always shows a real command. Adding a client means editing
`src/lib/agents.ts` and nothing else.

**Every diagram is a ```mermaid fence.** Never draw a flow with arrows and
spaces in a `text` block: it wraps badly, reads as a puzzle, and cannot be
restyled. `mise run docs:check` fails on a multi-line fenced block that uses
flow arrows and is not Mermaid.

Two things are not diagrams and stay literal: a directory tree, which draws a
filesystem rather than a flow, and captured output. Both are exempt from the
check — a tree by its box-drawing characters, output by having no arrows.

A remark plugin rewrites Mermaid fences into the Mermaid component, which
renders in the browser after hydration, so the diagram is absent from the
prerendered HTML. Never put meaning only in a diagram; the surrounding prose
carries it.

A skill gets two pages: the overview at `/docs/skills/<name>` carries what it
is, when to reach for it, and how to invoke it; the verbatim body lives one
level deeper at `/definition`. Nobody reads a 200-line router to decide whether
a skill applies, and the overview is what that decision needs.

`design/` holds repository design notes. Not published, not part of the site.

The build asserts a prerendered page for every directory in `skills/`. A new
skill that reaches no page fails `bun run build`, not review.
