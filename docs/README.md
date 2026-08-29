# Documentation site

The published site at <https://skills.tailrocks.com>. Fumadocs on TanStack Start,
built by Vite into a static bundle and served by GitHub Pages.

From the repository root, through mise:

```sh
mise run docs:dev      # run the site locally on http://localhost:5173
mise run build         # static build, type check, shell promotion, output smoke check
mise run docs:preview  # serve the built output
mise run docs          # regenerate the pages derived from SKILL.md
```

Directly, from this directory:

```sh
bun install
bun run dev
bun run types:check    # MDX collections + tsc
bun run build
```

## What is generated and what is written

Most pages under `content/docs/` are **generated** and must not be edited:

| Path | Source |
|---|---|
| `content/docs/skills/<name>/index.mdx` | `skills/<name>/SKILL.md` frontmatter |
| `content/docs/skills/<name>/definition.mdx` | that skill's body, verbatim |
| `content/docs/skills/index.mdx` | every skill's frontmatter description, grouped by `catalog.json` |
| `content/docs/skills/meta.json` | `catalog.json` group order, as sidebar separators |
| `content/docs/install.mdx` | `INSTALL.md` |

Regenerate from the repository root with `mise run docs`. CI runs
`bun run scripts/generate-docs.ts --check` and fails when a generated file is
out of date, so edit the source and regenerate rather than the page.

Every page under `content/` is `.mdx`, never `.md` — the generator's `--check`
mode fails on a plain-markdown page.

Hand-written pages: `content/docs/index.mdx` and `content/docs/choosing.mdx`.
Repository design notes live in [`design/`](design/) and are not published.

## Deployment

`.github/workflows/docs.yml` builds and deploys `main` to GitHub Pages.
Pull requests verify the same `mise run build` gate once per commit in the
generated CI lane, so the docs workflow runs only where its artifact is
consumed. `public/CNAME` holds the custom domain; the workflow then fetches
the live site and fails if the deployed HTML does not contain the expected
content. The build asserts that every skill has a prerendered page, so a new
skill cannot silently miss the site.
