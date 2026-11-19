# Maintenance

## Package ownership

Maintain the procedure in [the skill](../skills/vitalik-mode/SKILL.md).
Keep its references and assets inside the same directory.
The package requires no runtime script, hook, server, or background process.
The Python command below serves package maintenance only.

Use
[the shared structure](https://github.com/tailrocks/tailrocks-skills/blob/main/docs/standards/structure.md)
.
Obey
[the shared writing rules](https://github.com/tailrocks/tailrocks-skills/blob/main/docs/standards/writing.md)
.
Keep human installation steps separate from the skill procedure.

## Local verification

Run these commands from the package root:

```sh
python3 scripts/validate-package.py
alint check
```

Python 3.9 or newer is sufficient for the maintenance command.
The command uses only the standard library.
It examines duplicate JSON keys, manifest agreement, portable frontmatter, skill
identity, heading order, explicit activation, and local resource paths.
It does not run a model or exercise an agent.
Expected result: one `OK` line and exit code zero.

The alint command applies the shared active-package profile.
Expected result: no errors.
Its rules cover required files, package boundaries, manifest agreement, file
names, and skill length.

For Markdown formatting, run:

```sh
npx --yes markdownlint-cli2@0.23.3 "**/*.md"
```

Expected result: no formatting issues.
The Markdown configuration excludes two generator-owned instruction files.
It permits long table rows and literal code lines.
Review prose separately for meaning and instruction quality.
A formatting result does not prove language conformity or agent behavior.

## Shared policy pin

The `.alint.yml` file selects the central active-package profile.
Its source revision is `7b2f3cb6b7896621696b49a43a7d00c96cb48e42`.
Its SHA-256 is
`dae9e8f91ac3f5e6a28fb56d67f230fc4c23cc4fbab4763ecc5cc5477a903fba` .

When the shared profile changes, update the revision and digest together.
Read the profile changes before the update.
Repeat the local verification commands afterward.

## Generated CI

Use Velnor Actions 0.1.80 to generate the GitHub files.
The `.velnor/release-manifest.json` file records its source and binary digests.
The `.velnor/config.toml` file selects these verification jobs:

- `alint`
- `strict-json`
- `frontmatter-id`
- `link-check`

Run the supported generator after a configuration change:

```sh
velnor-actions generate
```

Generation requires the generator's documented validation tools, including Mise.
Keep the generated files together with the changed input.
Do not patch a generated workflow to repair a generator defect.
The repository owns `.github/PULL_REQUEST_TEMPLATE.md`.
The generator preserves that template.

For a generation comparison, use a fresh temporary directory:

```sh
vitalik_preview="$(mktemp -d)"
velnor-actions generate --output-dir "$vitalik_preview"
diff -r .github "$vitalik_preview/.github"
```

Expected result: no generated-file differences.
The preview does not change the package.

## Review evidence

Record which review models actually ran and which reasoning settings the host
accepted.
Distinguish requested model settings from effective settings.
Report installation results only for agents and versions that were exercised.
Keep compatibility limits in [the compatibility guide](compatibility.md).
Do not treat a source review or sample command as execution proof.

### Version 0.1.0 review

Two separate reviewers examined the skill on 2026-11-19:

- `gpt-6.2-astra`, launched with `ultra` reasoning effort.
- `gpt-6.2-sol`, launched with `ultra` reasoning effort.

The delegation interface accepted those model and effort settings.
Both reviewers examined the revised files and reported no remaining blocker
within their review scope.

The revisions addressed explicit activation in the skill body, same-goal
continuation, stale planner results, and active tracking for unresolved findings.
They also addressed concurrent PR changes, parallel review identities,
effort-only commands, and the reporting of an authorized inline fallback.

A separate offline continuation review kept a disabled mode off when an old
merge plan arrived.
It retained useful findings whose issue tracking was unavailable.
This review performed no repository operations.

Static verification passed the package validator, skill validator, and all
56 shared active-package rules.
Generated CI matched a second generation without differences.
These checks do not establish a successful installation on each supported host.

## Release

1. Update the version in the portable manifest.
2. Update the two host manifests to the same version.
3. Describe the change in `CHANGELOG.md`.
4. Run the local verification commands.
5. Regenerate CI if its inputs changed.
6. Publish the release commit and its `vVERSION` tag.
7. Record that exact revision in the central marketplace catalog.
8. Regenerate all native catalogs in the marketplace.
9. Verify the published tag, revision, and catalog entry.

Use the actual release version in place of `VERSION`.
Do not publish a catalog entry before its source and tag exist.
The first release uses version `0.1.0` and tag `v0.1.0`.
