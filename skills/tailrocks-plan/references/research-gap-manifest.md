# Research-gap Manifest

Planning owns one closed manifest at
`roadmap/<slug>/plan/research-gaps.json`. It records missing evidence; it never
contains findings and never authorizes writes under `research/`.

```json
{
  "$schema": "tailrocks.plan-research-gaps/v1",
  "item": "<slug>",
  "plannedAt": "<40-character commit SHA>",
  "gaps": [{
    "id": "RG1",
    "question": "<one answerable question>",
    "requiredEvidence": ["<claim or measurement planning needs>"],
    "status": "OPEN",
    "resolution": null,
    "deferral": null
  }]
}
```

The root object and every row are closed: no extra keys. IDs are monotonic and
rows stay sorted numerically. `status` is exactly `OPEN`, `RESOLVED`, or
`DEFERRED`:

- `OPEN`: `resolution` and `deferral` are null. Stop planning and hand the
  question plus required evidence to `tailrocks-research`.
- `RESOLVED`: `resolution` is a non-empty array of `research/...` file paths
  and precise anchors the planner re-opened; `deferral` is null.
- `DEFERRED`: `deferral` is `{ "decision": "D#", "reason": "...",
  "revisitWhen": "..." }`; `resolution` is null.

On rerun, retain IDs, re-open every resolution, demote missing or unsupported
evidence to `OPEN`, append newly discovered gaps, and process the first open ID.
Never delete a row, create another manifest, write the answer into this file,
or write reusable research. When no row is open, planning resumes at spec
generation using only cited resolutions and recorded deferrals.

Run the installed plan-package `validate` operation after every refresh. It
binds `item` to `roadmap/<item>/README.md`, requires `plannedAt` to equal the
exact current HEAD, opens every `research/...#heading` or `research/...:line`
resolution, and rejects traversal, missing anchors, and symlinks. With an OPEN
gap, `commands` and `receipts` may both be empty and the only successful outcome
is `RESEARCH_REQUIRED`; command planning starts only after all gaps close.
