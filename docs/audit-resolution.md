# Agent-format audit resolution

This record reconciles the 39 distinct findings in
[audit #135](https://github.com/tailrocks/tailrocks-skills/issues/135)
against the native package refactor and its follow-up corrections.
The audit describes an earlier snapshot. Its historical observations remain
available in the issue.

The [verification record](verification.md) identifies the tested versions,
merged source commits, installation coverage, and outstanding native checks.

## Cross-cutting findings

- **X1 — Resolved.** Canonical skills and the authoring template use the
  portable Tailrocks frontmatter subset. The shared validator enforces it.
- **X2 — Resolved by redesign.** Redundant invocation keys are removed. Native
  metadata and body-level intent guards carry the applicable policy.
- **X3 — Resolved.** Required name and description fields are identified as the
  Tailrocks portability contract.
- **X4 — Resolved.** omp and pi have native package routes and measured
  representative installation checks.
- **X5 — Resolved.** The false claim that Grok lacks a native manifest is
  removed. Tailrocks uses its verified Claude-compatible route.
- **X6 — Resolved.** Grok trust grants immediate trust and skips confirmation.
  The documented command matches the tested managed install.
- **X7 — Resolved for the selected route.** The tested managed Grok install
  enables the package. Its actual registry exposed the expected skills.
- **X8 — Selected route documented.** Kimi uses marketplace and pinned commit
  sources. Optional local-directory and single-session loader instructions are
  outside this package workflow.
- **X9 — Resolved.** The unsupported Kimi manifest-name pattern is removed.
  Tailrocks retains its own naming contract.
- **X10 — Resolved.** The incorrect Kimi interface-field allowlist is removed.
- **X11 — Resolved.** The false exclusion of Antigravity Git sources is
  removed. The reproducible pinned-checkout route passed native installation.
- **X12 — Resolved by redesign.** The documented Antigravity workflow uses its
  native plugin installer and no longer asserts the stale standalone skill
  root.
- **X13 — Resolved.** Native Antigravity manifest precedence and the ignored
  maintenance AGENTS.md warning are documented and observed.
- **X14 — Resolved.** The inaccurate fixed Codex context-budget formula is
  removed.
- **X15 — Resolved.** Codex uses the portable root plugin manifest in the
  chosen package contract.
- **X16 — Optional alternative not adopted.** Verification uses complete native
  package installs and registry discovery. A separate table of single-session
  skill loaders is unnecessary for that contract.
- **X17 — Resolved by redesign.** The stale cross-host field matrix is replaced
  with the portable contract, native registrars, and explicit invocation
  limitations.
- **X18 — Resolved.** Authoring references, central standards, and validation
  use at most 500 total SKILL.md lines, including frontmatter.
- **X19 — Resolved.** Current evidence records actual tested versions and
  official documentation sources. Dated older evidence stays historical.
- **X20 — Resolved.** Current guides no longer promise a fixed warning count.
  Older validation observations remain dated.
- **X21 — Resolved.** Muse and Codex use the catalog's full commit in
  source.ref. Claude, Grok, and omp share the SHA-pinned Claude catalog.
- **X22 — Resolved.** Kimi commit URLs and direct install commands derive from
  the central catalog, removing duplicated stale pins.

Several skills need package-root resources. The single-skill loader alternatives
in X8 and X16 cannot verify that those resources survive installation.
Antigravity also supports a Git source for a complete package. For X11,
Tailrocks verifies its pinned local-checkout route.

## Repository-specific findings

- **A1 — Resolved.** The authoring template defaults to portable frontmatter.
- **A2 — Resolved.** Authoring guidance no longer claims absent Kimi keys
  provide enforcement.
- **A3 — Resolved.** Authoring guidance no longer claims absent Kimi keys
  provide enforcement.
- **A4 — Resolved.** Amp guidance consistently uses the complete native
  directory plugin.
- **A5 — Resolved.** The shared package validator rejects literal angle
  brackets in description text.
- **A6 — Resolved.** Maintenance guides no longer describe the generated
  regular Claude import as a symlink.
- **M1 — Resolved.** All three macOS visual harness references resolve the
  installer from the installed skill and retain setup ownership.
- **RM1 — Resolved.** Roadmap descriptions use portable text. Angle-bracket
  placeholders remain permitted in instruction bodies.
- **RM2 — Resolved.** Invocation documentation describes the actual supported
  policies instead of absent camel-case keys.
- **C1 — Resolved.** Invocation documentation describes the actual supported
  policies instead of absent camel-case keys.
- **CQ1 — Resolved.** All three instruction workflows accept a verified native
  import of the canonical sibling AGENTS.md when its loader supports it.
- **RS1 — Resolved.** Publication follows the repository's procedure. The
  marketplace uses actual immutable commits and does not require a missing
  release object.
- **ASD1 — Resolved.** Catalog identity and version match the manifest at the
  pinned commit. PR #138 already corrected the older mismatch.
- **AP1 — Resolved.** The Kimi source is generated from the catalog instead of
  an unresolved release placeholder.
- **K2 — Resolved.** The Claude manifest is required by Tailrocks' distribution
  contract. Claude itself permits a standard layout without it.
- **K6 — Resolved.** The required Alint job invokes the shared validator to
  check the portable field subset and description characters. The generator's
  identity check remains a separate check.
- **K8 — Resolved.** Current catalog, validator, and ChatGPT installation
  inventory contain all eleven packages.

The remaining duplicate rows in the audit are instances of the findings above.
Authoring version instructions also now cover every generated native manifest
and the required npm package metadata.

## Evidence and follow-up

- A real-skill fixture accepted five valid YAML description forms and rejected
  five angle-bracket variants, including endpoint and block-content cases.
- The macOS setup example installed nine byte-matching harness files from an
  unrelated working directory into a project path containing spaces.
- The generated Claude import resolves to its regular sibling instruction file
  without adding a second policy.
- All eleven corrected packages pass the shared package validator and the
  seventy effective Alint rules.
- Representative live checks on public packages are tracked in
  [#141](https://github.com/tailrocks/tailrocks-skills/issues/141).

These findings are resolved by source changes, corrected claims, or explicit
distribution choices. Native test coverage keeps its stated scope; it does not
establish model-task outcomes.
