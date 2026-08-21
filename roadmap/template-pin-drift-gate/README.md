# Take template pin freshness off the per-PR blocking path

- **Status**: DRAFT
- **Slug**: template-pin-drift-gate
- **Created**: 2026-08-21 · **Updated**: 2026-08-21
- **Plan**: — (plans/template-pin-drift-gate/ once planned)

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

- Which cadence for the scheduled refresh — weekly, or on a dependency
  webhook?
- Does the bump PR land automatically when its own gates pass, or always
  wait for a human?
- Do other skills pin external versions on the same blocking path, or is
  the tanstack template the only one?

## Open research questions

- Does any pinned package's `latest` move often enough that a weekly
  cadence still leaves the repository visibly stale between runs?

## Deferred

## Log

- 2026-08-21 — captured by hand from a recurring CI failure, not through
  `tailrocks-idea`; the item is DRAFT and unshaped, and the gaps above are
  genuinely empty rather than assumed.
