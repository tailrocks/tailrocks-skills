# Take template pin freshness off the per-PR blocking path

- **Status**: DONE
- **Slug**: template-pin-drift-gate
- **Created**: 2026-08-21
- **Plan**: — shipped directly as #67, #68 and #69; small and mechanical
  enough that a plan package would have documented the work rather than
  decided anything. · **Verified**: — (shipped before the verification round
  existed)

## Intent

Every pull request in this repository goes red the moment an upstream
package ships a release, and the fix is never in the pull request that
failed. `resolve-package-versions.ts --check-template` asserts that the
pinned versions in `skills/tailrocks-tanstack-project-setup/templates/`
equal npm's live `latest`, and it runs as a blocking gate on every PR.
The gate's result therefore depends on when it ran and on upstream's
release schedule, not on the diff under review.

That is a bug class, not an incident. It has recurred at least twice
(happy-dom pins, then a ten-package sweep) and each fix was a symptom
patch: bump the pins, watch the gate go green, wait for the next
upstream release. The enabling condition is a **time-varying,
network-dependent assertion placed on the blocking per-PR path**, and
nothing removes it until that placement changes.

## Vocabulary

- **Deterministic check** — an assertion whose result depends only on the
  repository contents. Same tree in, same answer out, offline.
- **Freshness check** — an assertion comparing the repository against a
  live external source. Its answer changes without the repository
  changing.

## Decisions

- 2026-08-21 — **Weekly cadence, Monday 04:43 UTC**. Because the drift that
  caused this is measured in days, and a dependency webhook adds a delivery
  surface to maintain for an assertion that is not urgent.
- 2026-08-21 — **The bump pull request always waits for a human**. Because a
  pull request opened with `GITHUB_TOKEN` does not start its own checks, so
  an auto-merge would land a version bump nothing verified.
- 2026-08-21 — **The refresh never writes into `version-policy.md`**.
  Because that document carries primary release *sources*, not versions, and
  a refresh that wrote numbers back into it would recreate the second ledger
  it exists to forbid.

## Capabilities

- Split the assertion by kind. The blocking per-PR gate keeps only the
  deterministic half: pins are well-formed, consistent across every
  template and every document that quotes them, and not below a recorded
  floor. No network call on the blocking path.
- Move the freshness half to a scheduled job that opens an automated bump
  pull request when it finds drift, so drift arrives as a reviewable
  change rather than as a red check on unrelated work.
- Keep the house rule intact — every setup targets the latest stable
  release available at execution time. The scheduled refresh is what
  enforces it; the per-PR gate stops pretending to.

## Screens

## Flows

## Data & integrations

- `skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts`
  — carries both halves of the assertion today.
- `.github/workflows/validate.yml` and
  `.github/workflows/validate-public-unmerged.yml` — the two blocking
  gates that invoke `--check-template`.
- `skills/tailrocks-tanstack-project-setup/templates/package.json` and
  `references/version-policy.md` — the pinned surface, and the document
  that has conflicted on every refresh.
- npm registry `latest` dist-tags — the live source the freshness half
  reads.

## References

- `scripts/validate-skills.ts` — the deterministic-gate precedent in this
  repository: forge URLs, package-manager commands, design-file tools,
  model routes, and eval-harness invocations are all offline checks whose
  answer depends only on the tree.

## Research

## Must not

- MUST NOT drop the latest-stable rule to make the gate green. The rule
  is the point; only its enforcement placement is wrong.
- MUST NOT leave the freshness check unrun. Deleting it rather than
  rescheduling it trades a noisy gate for silent staleness, which is the
  failure the gate was added to prevent.

## Quality bar

- A pull request whose diff touches nothing in the tanstack template can
  never fail for a pin reason.

## Open questions

## Open research questions

## Deferred

- Whether other skills pin external versions on a blocking path — deferred
  because the tanstack template was the only `--check-template` caller and
  no other blocking gate reads a live source today. Revisit when a skill
  adds a network call to a pull-request gate.
- Whether a weekly cadence leaves the repository visibly stale between runs
  — deferred until the schedule has run often enough to measure rather than
  guess. Revisit after four scheduled runs.

## Remaining
