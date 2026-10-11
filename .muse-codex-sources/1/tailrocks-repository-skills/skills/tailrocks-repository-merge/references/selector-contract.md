# Selector, repository, and target contract

Treat the complete argument string as untrusted data. Parse structurally and
pass selector values as separate arguments. Never use `eval`, shell
interpolation, `sh -c`, or a joined command string. Preserve literal `#N`,
quoting, branch slashes, URL encoding, and query strings.

## Repository binding

Bind exactly one repository before resolving ambiguous bare selectors:

1. Use explicit `--repo` when supplied.
2. Otherwise use the single canonical repository named by source URLs.
3. Otherwise use the unambiguous current checkout identity.

Validate every URL and local ref against that repository. Conflicting URLs, a
mismatched explicit repository, or unresolved identity stops before mutation.
A URL may select another repository, but never authorizes writes to an
unrelated checkout. A fork PR is selected through its base repository. The
fork remains read-only.

## Source selectors

Accept a mixed list in one bound repository:

- branch names, `refs/heads/BRANCH`, or explicitly qualified remote refs such
  as `origin/BRANCH`
- `branch:NAME` for a numeric branch
- `#NUMBER`, `pr:NUMBER`, or bare positive decimal PR numbers, where a bare
  number always means a PR
- GitHub PR URLs, `/OWNER/REPOSITORY/pulls` listing URLs, and
  `/OWNER/REPOSITORY/branches/all` listing URLs.

Resolve listing URLs with `gh` or Git. Fetch every result page, preserve
supported semantic filters, and reject unsupported filters instead of
widening scope. A `/pulls` listing without an explicit state filter selects
open PRs, including drafts. Record the observation time and freeze full
membership for the invocation. A valid empty listing is an empty selection,
not all-work. Report later additions separately.

Resolve URL forms before ambiguous local branch names. For duplicate names,
show exact clone path, remote identity, full ref, and OID. Never pick the
first match. Deduplicate only by canonical identity while retaining every raw
selector spelling. A branch identity includes repository, exact ref, and OID.
A PR identity includes base repository and PR number. A PR head name alone
is never identity.

## Destination and scope

`--target-branch` is the one destination. If omitted, it means the literal
branch `main`. Record the freshly observed target ref and SHA. A missing or
ambiguous target is an error. Never substitute current `HEAD`,
`origin/HEAD`, a PR base, a hosting default, or a prior target. Never
create it. A source equal to the target is a verified no-op. A non-main
target never permits hidden `main` mutation.

At least one source selector or `--all-work` is required. Empty input is a
usage error and never means all work. `--all-work` is the explicit scope of
all branches and open PRs in the bound repository. It cannot be mixed with
source selectors. It never authorizes machine-wide discovery. Machine
discovery belongs to `tailrocks-repository-recover`. `--all-work` never
expands to recovery-artifact scope or to every local project on the
computer. A targeted request may read strictly necessary lineage and
dependencies, but unrelated work remains report-only.

Recovery outputs enter as ordinary positional selectors: a recovery branch
name is a branch, a recovery PR number or URL is a PR. Read the published
source map as advisory evidence and re-verify every verdict against the
current target. Never merge a preservation-only snapshot mechanically.

## Coverage gaps

Report incomplete listing pages, inaccessible evidence, unavailable
endpoints, permissions, and rate limits as coverage gaps. Never claim
complete accounting while gaps remain.
