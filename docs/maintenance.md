# Maintenance

Use the same source ownership and verification approach in every repository.
Keep marketplace files here and domain instructions in their component packages.

## Change shared package files

1. Edit the maintained sources under `standards/native/` or `standards/models/`.
2. Edit each affected package's root manifest when its version changes.
3. Generate the shared files in local component checkouts.

   ```sh
   python3 scripts/sync-packages.py --workspace ..
   python3 scripts/sync-packages.py --workspace .. --check
   ```

4. Run each package's native validator and required domain checks.
5. Examine the actual installation payload and native discovery for changed routes.
6. Publish the shared profile before pinning it in component configurations.
7. Update each component's immutable profile revision and SHA-256 together.

Use repeated `--only <plugin-id>` arguments for a subset of local checkouts.
Keep private source material inside its private repository.
Publish only public templates and metadata in this marketplace.

## Update the marketplace

Merge validated component changes first.
Read the manifest at each resulting commit.
Update its revision, version, description, and visibility in `catalog.json`.

```sh
python3 scripts/generate-catalogs.py
python3 scripts/validate-marketplace.py
alint check
```

The optional `--verify-github` validator flag examines remote manifests.
Private entries require an authenticated read route.
When the CLI cannot authenticate, use the available GitHub connection for that
read.
Keep full commit pins in every native catalog.
Use DCO sign-offs for authored commits.

## Generated CI

Velnor Actions `0.1.80` owns generated files under `.github/`.
The release source is `b71a0045e42f6a8b620aa9283d0106bed622fe3b`.
Its release manifest SHA-256 is
`759bbd571b0ccc90802cdffd0084b081ebc8072c8e51267d646daaea6244a4ba`.

Change `.velnor/config.toml` and the release manifest before regeneration.
Run the supported `velnor-actions generate` workflow.
Do not hand-edit generated workflows or scripts.
Preserve the generated `Required` status and the existing branch rules.

The shared jobs validate structure, strict JSON, and local Markdown links and
fragments.
Component jobs also validate skill frontmatter and their required runtime checks.
External documentation research is separate from the deterministic offline link
gate.

## Record evidence

Distinguish static validation, native installation, registry discovery, and skill
execution.
Record tool versions and the tested package revision or tree.
Keep account, permission, and host-specific limits explicit.
Do not present a simulated API or a registry listing as a completed model task.
