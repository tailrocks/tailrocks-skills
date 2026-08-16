<!--
Base PR body template — the starting shape tailrocks-pr-template tailors
into a repository's own .github/PULL_REQUEST_TEMPLATE.md. Never lands in a
repository verbatim: every section survives only when the repository's
structure and merged-PR history earn it, and every <placeholder> command is
replaced with the repository's real gate.

Rules in one line each:
- One paragraph per section, no hard-wrap (GitHub flows the text).
- Explain the shipped feature shape, not every implementation detail.
- No design rationale narration here — link out to a contributor doc instead.
- No file-by-file changelog (use the diff). No function/struct inventory. No
  full test list (use the runner output).
- No deployed-docs URLs (they break post-merge). Refer to docs by name only.
- No mechanical CI-shaped checks — those belong in CI, not in the body.
- Verify-locally URLs use http://localhost:<port>/... only — never deployed.
- Every Verify-locally command is copy-pasteable and states its expected
  outcome when a bare exit code does not disambiguate pass from fail.
- Drop the headings you don't need. "Related pull requests" is only when the
  PR spans multiple repos. "Behavior changes" is only when it adds signal
  beyond "What ships". "Not included" is only when scope boundaries or
  deferred work are useful to call out. "Migration notes" can read "None"
  during pre-release.
-->

## Related pull requests

<When this PR is part of a coordinated set spanning multiple repositories,
list every PR here — just the link, no description. Drop this section
entirely when the PR stands alone.>

- <https://github.com/org/repo/pull/N>

## Summary

<One paragraph answering: what is this pull request for? Name the shipped
feature or behavior, who benefits, and how it changes their flow. Keep this
short; the feature-level detail goes in the next sections.>

## What ships

<Feature-level bullets grouped by user-visible or contributor-visible
outcome. Describe capabilities, behavior, configuration surfaces, docs, and
verification coverage in plain terms. Avoid function names, struct names,
raw fixture counts, and file lists — the diff already shows those.

Good:
- Operators can select `hardened` to drop container capabilities and run
  with a read-only root filesystem.

Too low-level:
- Added `capability_flags()` and `readonly_root_flags()`.>

- <Capability or behavior that now exists>
- <Configuration, documentation, or workflow change users can rely on>
- <Regression coverage added, stated as an outcome rather than a test list>

## Behavior changes

<User-visible or maintainer-visible deltas: changed defaults, validation,
errors, migration behavior, CI behavior, runtime consequences. Drop this
section when it would only repeat "What ships".>

- <Existing behavior that changes>
- <New default, validation, or runtime consequence>

## What this addresses

<Bullets naming the practical problem, gap, regression, or user pain now
resolved — "what in reality is addressed?", not a restatement of the
implementation. Name the issue or roadmap item when one exists.>

- <Problem or gap addressed>
- <Visible outcome>

## Not included

<Scope boundaries and deferred work so reviewers know what is intentionally
out of scope: follow-up PRs, research-stage work, related behavior this PR
deliberately leaves unchanged. Drop this section entirely when nothing
meaningful is excluded.>

- <Out-of-scope behavior or deferred follow-up>

## Verify locally

### Checkout

```sh
gh pr checkout <PR_NUMBER>
```

### Static checks

<The repository's format and lint gates, exactly as CI runs them.>

```sh
<format-check command>
<lint command>
```

### Tests

<The repository's test runner, with a scoped filter for this change first
when the suite is large. One sentence on what the tests cover when the
filter alone does not say it. Drop when the PR ships no testable code.>

```sh
<scoped test command>
<full test command>
```

### Smoke

<The shortest real-use path that exercises the changed behavior: the command
to launch, the clicks or inputs, and the expected output that disambiguates
a pass from a fail. Drop when the change has no runtime surface.>

```sh
<launch command>
```

Expected: <what the reviewer should see>.

### Documentation

<Drop this whole subsection when the PR does not touch documentation.>

```sh
<docs dev-server command>
```

Serves at `http://localhost:<port>/`. Pages to walk:

**http://localhost:<port>/<path>/**  
<NEW page | UPDATED>. <One sentence on what to look at on this page.>

## Migration notes

<One paragraph naming what users or operators must do — schema rename,
env-var addition, on-disk path move. "None." is fine; drop the section when
it would only say that.>
