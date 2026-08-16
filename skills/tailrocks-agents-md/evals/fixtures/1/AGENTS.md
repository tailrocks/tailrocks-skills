# Example Monorepo

Bun workspace. Packages under `packages/`, documentation site under `docs/`.

Commit with DCO signoff (`git commit -s`). Main is protected; open a pull
request.

Run tests from the package directory. Root run picks the wrong tsconfig.

Documentation site: `docs/` is a Fumadocs site built by Vite. Run
`bun run build` inside `docs/`. Never edit `docs/content/docs/api/` — it is
generated from the OpenAPI schema. Documentation pages use the `.mdx`
extension. Prettier does not run over `docs/content/`, so wrap prose at 80
columns there by hand.
