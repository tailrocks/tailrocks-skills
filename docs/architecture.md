# Architecture

The marketplace lists independently maintained plugin packages.
Each package owns its domain instructions and runtime resources.
The marketplace owns shared standards, distribution templates, and catalog pins.

## Maintained sources

| Source | Responsibility |
| --- | --- |
| `catalog.json` | Approved package IDs, revisions, versions, and visibility |
| `standards/alint/` | Shared rules for active, marketplace, and retired repositories |
| `standards/models/model-routing.md` | Provider identities and model selection guidance |
| `standards/native/` | Native registrars, installation guides, and package validator |
| `scripts/generate-catalogs.py` | Native marketplace catalogs |
| `scripts/sync-packages.py` | Shared files in checked-out component repositories |
| `scripts/install-command.py` | Native commands for one approved package revision |
| `.velnor/config.toml` | CI generation inputs |

## Component packages

Each component keeps its identity in its root `plugin.json`.
Each skill keeps its procedure in `skills/<id>/SKILL.md`.
References, assets, and scripts stay beside their maintained owner.
Package-root resources remain in their original locations.

Host manifests and registrars expose that same skill tree.
OpenCode and Amp require small registration modules.
Those modules register skills without model calls, hooks, or background work.
Other hosts discover the canonical tree through native manifests.

The shared model reference ships inside each skill.
Installation does not depend on a separate policy plugin or a live documentation
fetch.
Skills read the reference when model selection, effort, or delegation is relevant.

## Generation boundaries

Run package generation against local checkouts.
The generator preserves domain instructions, existing developer tooling, and
explicit invocation policies.
It does not fetch repositories, select release versions, or change catalog pins.

Publish component changes before updating their catalog revisions.
Generate all native catalogs from the same approved inventory.
Keep the marketplace free of copied active skills and plugin manifests.

See [distribution](standards/distribution.md) for each host's native format.
