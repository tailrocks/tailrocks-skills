# Standalone plan format

Use one file per finding: `plans/NNN-<slug>.md`, numbered in
recommended execution order. A fresh executor needs only that
plan and the repository. The plan therefore carries
self-contained context, proof commands that need no
invention, and hard boundaries with explicit escape hatches.

## Template

```markdown
> Executor: verify the complete Git state against
> `<planned-at-sha>` first, including tracked, staged,
> untracked, renamed, and deleted in-scope paths. Any
> unexplained drift means STOP. Run every proof command and
> compare its counted output with this plan. Do not improvise
> or expand authority.

## Status

- Priority: P1 | P2 | P3
- Effort: S | M | L
- Fix risk: LOW | MEDIUM | HIGH
- Depends on: <plan numbers or none>
- Lane: <verified audit lane or direct-change>
- Source: <finding identity or described change>
- Planned at: <commit SHA>, <date>

## Why this matters

Two to five sentences give the intent needed for a correct
judgment when a detail drifts.

## Current state

- Files and roles.
- Planner-re-read excerpts, fenced and labeled with
  `file:line`.
- Relevant repository constraints and one current exemplar.
- Dirty, staged, and untracked state observed during
  planning.

## Proven commands

| Purpose | Command | Expected output | Proof |
| --- | --- | --- | --- |

Every command ran in the authorized read-only sandbox during
recon. A guessed command, a zero-unit proof, and a command
that needs mutation are forbidden.

## Scope

Exact in-scope path allowlist. Explicit out-of-scope
neighbors with reasons.

## Git boundary

Expected base SHA and repository conventions. The plan
grants no commit, push, pull-request, merge, or
external-message authority.

## Steps

Order steps so each step ends with:

**Verify**: <command> ||| <proof with the real unit count>

## Test plan

New tests, their paths, cases, and current exemplar. Never
fabricate a test command. Never infer coverage from exit
zero.

## Done criteria

Machine-checkable checklist with removal proof and the exact
changed-path allowlist. Rewrite judgment-only criteria until
a command can decide them.

## Stop conditions

Plan-specific evidence that means stop and report: drift,
ambiguity, unexpected paths, missing dependency, violated
precondition, secret or network need, and an oracle that
cannot distinguish zero work.

## Maintenance notes

Interactions, reviewer focus, and deliberately deferred
follow-ups.

## Review receipts

Reviewer identity, verdict, and the digest of all final
candidate bytes outside this section. Every correction
invalidates all receipts and restarts review. `--deep`
carries two independent PASS receipts over the same digest.

The digest is lowercase SHA-256 over the exact UTF-8 byte
prefix that ends immediately before the one exact
`## Review receipts\n` heading. Never normalize line
endings, whitespace, or encoding. The heading occurs exactly
once and is the final section. Malformed or repeated
boundaries refuse publication.
```

## Index

Create `plans/README.md` with this exact initial shape when
it is absent:

```markdown
# Improvement plans

## Plans

| Plan | Title | Priority | Status | Planned at | Dependencies | Evidence |
| --- | --- | --- | --- | --- | --- | --- |

## Rejected findings

| Finding | Reason | Evidence | Observed at | Next owner |
| --- | --- | --- | --- | --- |
```

Each plan row uses the canonical relative plan path, the
title, `P1`, `P2`, or `P3`, and one closed status. It uses
the full planned SHA, comma-separated plan numbers or
`none`, and a concise evidence state. Status is `TODO`,
`IN_PROGRESS`, `BLOCKED`, `STALE`, or `RETIRED`. The index is the only
status surface. Each rejection row uses a stable secret-safe
finding ID, the reason, evidence locators, the full observed
SHA plus date, and the exact next owner. Re-read existing
rejection identities before adding one. Identical means no
change. One identity bound to different evidence is a
conflict. Changed evidence never rewrites an existing
rejection. Reconciliation returns a typed
`stale_rejection_evidence` refusal. Only planning adds a new
stable identity after re-deriving the finding.

Numbering is monotonic and never recycled. A changed approach
uses a new number. The prior row becomes `RETIRED` and points
at the replacement. Reconciliation never edits a plan body.
Create the directory and index only through a bound safe
parent. Reject symlinks, escapes, malformed headings and
tables, duplicate numbers, and noncanonical rows. Preserve
unrelated rows. Publish against the expected index preimage.
Rejected input creates no plan row, plan file, or empty
commit. Its index-only compare-and-swap and typed no-change
receipt are defined by `artifact-boundary.md`.
