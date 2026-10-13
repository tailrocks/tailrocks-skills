# Research-gap manifest

Planning owns one closed manifest at
`roadmap/<slug>/plan/research-gaps.json`. It records missing
evidence. It never holds findings and never authorizes writes
under `research/`.

```json
{
  "$schema": "tailrocks.plan-research-gaps/v1",
  "item": "<slug>",
  "plannedAt": "<40-character commit SHA>",
  "gaps": [{
    "id": "RG1",
    "question": "<one answerable question>",
    "requiredEvidence": ["<claim or measurement that planning needs>"],
    "status": "OPEN",
    "resolution": null,
    "deferral": null
  }]
}
```

The root object and every row are closed: no extra keys. IDs are
monotonic and rows stay sorted numerically. `status` is exactly
`OPEN`, `RESOLVED`, or `DEFERRED`:

- `OPEN`: `resolution` and `deferral` are null. Stop planning
  and hand the question plus required evidence to
  `tailrocks-research`.
- `RESOLVED`: `resolution` is a non-empty array of
  `research/...` file paths and precise anchors that the
  planner re-opened. `deferral` is null.
- `DEFERRED`: `deferral` holds `{ "decision": "D#", "reason":
  "...", "revisitWhen": "..." }`. `resolution` is null.

On rerun, retain IDs, re-open every resolution, demote missing
or unsupported evidence to `OPEN`, append newly discovered gaps,
and process the first open ID. Never delete a row, never create
a second manifest, never write the answer into this file, and
never write reusable research. When no row is open, planning
resumes at spec generation with only cited resolutions and
recorded deferrals.

After every refresh, validate the manifest by hand. Bind
`item` to `roadmap/<item>/README.md`. Require `plannedAt` to
equal the exact current HEAD. Open every
`research/...#heading` or `research/...:line` resolution.
Reject traversal, missing anchors, and symlinks. With an OPEN
gap, command planning starts only after all gaps close.
