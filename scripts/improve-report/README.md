# Improve report finalizer

Run the loader-bound installed entrypoint with one closed
`tailrocks.improve-report-input/v1` JSON object on stdin:

```sh
bun scripts/improve-report.ts --skill-file <absolute-loader-SKILL.md> < input.json
```

The object binds the canonical root, 40/64-character revision, dirty-state
SHA-256, existing improve route-resolver input, lane receipts, command receipts,
and candidates. Default requires all twelve lanes; a direct category requires
that one lane; quick requires at least one. A routed specialist invocation must
carry no audit work.

The dirty-state digest is SHA-256 over exact stdout from the same hardened
status command the finalizer uses: isolated environment,
`GIT_OPTIONAL_LOCKS=0`, system/global config disabled, and command-local
`core.fsmonitor=false`, `core.hooksPath=/dev/null`, `diff.external=`,
`core.attributesFile=/dev/null`, and `core.quotepath=true`, followed by
`status --porcelain=v1 --untracked-files=all`. The finalizer verifies canonical
Git top-level, HEAD, and this digest before and after evidence processing,
including for routed receipts. It rejects local include directives and
neutralizes every enumerated local clean/process filter before status. Never
compute the digest through ambient Git config.

Candidates use stable uppercase IDs, `defect|direction`, a closed lane, title,
impact, correctness/consistency/goal-fit booleans, severity, confidence,
fix-risk, effort, 2–5 unique `{path,line,line_sha256}` citations, disposition,
and next owner. Verified HIGH-confidence/LOW-risk defects route only to
`tailrocks-improve-plan`; other verified candidates route only to
`tailrocks-seed-roadmap`; rejected candidates use `next_owner: null` plus one
closed rejection reason and detail.

The one `tailrocks.improve-report/v1` receipt is read-only and carries
`mutations: []`. `reported` is success, `routed` is a terminal direct-owner
handoff, and `refused` is terminal evidence. The command reads citation lines
through canonical parent and file identities, rechecks inode, size, mtime,
ctime, and content digest, and never returns their contents. A line digest is
SHA-256 over the decoded UTF-8 line without its newline terminator.
