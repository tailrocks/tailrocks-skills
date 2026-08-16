# docs

Fumadocs on TanStack Start, built by Vite into a static bundle, published to
<https://skills.tailrocks.com> from GitHub Pages. Commands and the deployment
contract: `README.md`.

Never edit a generated page. `content/docs/skills/*.mdx`,
`content/docs/skills/index.mdx`, `content/docs/skills/meta.json`, and
`content/docs/install.mdx` come from `SKILL.md`, `catalog.json`, and
`INSTALL.md` through `mise run docs` at the repository root. Edit the source,
regenerate.

Hand-written pages: `content/docs/index.mdx` and `content/docs/choosing.mdx`.

Every page under `content/` is `.mdx`, never `.md`. A `.md` page renders
without component support, and the difference stays invisible until a page
needs one. `mise run docs:check` rejects it.

Diagrams are ```mermaid fences. A remark plugin rewrites them into the Mermaid
component, which renders in the browser after hydration — so the diagram is
absent from the prerendered HTML. Never put meaning only in a diagram; the
surrounding prose carries it.

`design/` holds repository design notes. Not published, not part of the site.

The build asserts a prerendered page for every directory in `skills/`. A new
skill that reaches no page fails `bun run build`, not review.
