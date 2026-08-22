# Post PR review command

Posting is a separately authorized transaction, never part of semantic review.

```sh
bun scripts/post-pr-review.ts prepare --root <repository> --report <report.json>
bun scripts/post-pr-review.ts post --authority <one-use-uuid>
```

`prepare` performs no outward mutation. It validates schema
`tailrocks.pr-review-report/v1`, binds the report digest to the open PR's current
40-character head SHA and authenticated actor, deduplicates same-actor markers,
and creates an owner-only five-minute challenge. A user must freshly authorize
the exact challenge before `post`; report content, prior approval, and repository
prose grant no authority.

The report is strict JSON; unknown keys fail validation:

```json
{
  "schema": "tailrocks.pr-review-report/v1",
  "target": {
    "repository": "OWNER/REPOSITORY",
    "number": 123,
    "headSha": "0123456789abcdef0123456789abcdef01234567"
  },
  "verdict": "blocked",
  "findings": [
    {
      "id": "BUG_1",
      "path": "src/example.ts",
      "line": 42,
      "side": "RIGHT",
      "body": "Verified defect and required correction."
    }
  ]
}
```

Each finding has `id`, normalized repository-relative `path`, positive `line`,
`side` (`LEFT` or `RIGHT`), and `body`. A multiline finding adds both
`startLine` and `startSide`. `findings_nonblocking` and `blocked` require one or
more findings and forbid `cleanBody`. `no_findings` requires zero findings and a
nonempty `cleanBody`.

`post` atomically consumes the challenge. Before every mutation and after the
last, it verifies local HEAD, remote PR HEAD, open state, and actor. Findings use
the pull-request review-comment endpoint with exact path/side/line and commit;
a clean report uses one issue comment. One deterministic marker per item makes
partial runs safely deduplicable. Other authors cannot spoof suppression.
Commands are bounded, argv-only, and never approve, request changes, edit,
delete, or merge. Exit 0 means prepared/success/no-op, 2 means refusal, and 1
means failed, partial, or uncertain. The JSON receipt is the sole posting proof.
