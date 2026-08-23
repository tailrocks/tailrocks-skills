# Code-health predicate

Pure machine owner for shrink-only comparisons. Run the trusted installed
entrypoint with no arguments and one JSON object on stdin. It emits one
`tailrocks.code-health-predicate/v1` receipt; exit 0 is exact/pass, exit 1 is a
semantic violation, and exit 2 is invalid input. It never reads or writes the
target repository.

Every input has schema `tailrocks.code-health-predicate-input/v1` and one kind:

- `numeric`: `operation` (`audit`, `establish`, or `tighten`), safe `oracle` and `id`,
  nonnegative integer `measured`; audit also has `bound`, tighten also has
  `bound`, `proposed`, and matching `proposedOracle`.
- `presence`: `operation`, safe `oracle`, and sorted-by-receipt safe-identity
  `measured`; audit also has `listed`, tighten also has `listed`, `proposed`, and
  matching `proposedOracle`.
- `version`: `entries` of `{id,current,latestStable,highestFixed,compatible,delayed}`.
  Versions are normalized semantic versions; comparison sources and fixed
  versions must be stable, while a prerelease current pin is a violation.

Schemas are closed. Duplicate or unsafe identities, unsafe counts, unknown
fields, unstable comparison sources, more than 10,000 entries, and stdin over
1,000,000 bytes are refused.
