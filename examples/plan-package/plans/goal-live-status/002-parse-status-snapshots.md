# Plan 002: Parse status snapshots safely

## Status

- Priority: P1
- Effort: M
- Risk: MED
- Depends on: 001
- Covers: F2–F4, B1–B2
- Guardrails: N1, N2
- Planned at: `example001`, 2026-07-23

## Why this matters

A typed reader removes the enabling condition for guessed or partial state.

## Preconditions

- `mise run check` → exit 0 and both skeleton crates compile.

## Spec contract

### Requirement: Parse versioned snapshots
The core MUST parse supported snapshot envelopes and reject unsupported versions.

#### Scenario: Valid snapshot loads
- **GIVEN** a supported complete snapshot
- **WHEN** the reader loads it
- **THEN** typed state is returned within 250 ms

### Requirement: Preserve the last valid view
The core MUST preserve the last valid state when a refresh is corrupt.

#### Scenario: Corrupt refresh
- **GIVEN** one valid snapshot was rendered
- **WHEN** the next snapshot is truncated
- **THEN** prior state remains with an actionable error

## Must NOT

- N1: viewer MUST NOT mutate executor state.
- N2: viewer MUST NOT infer progress from liveness.

## Inputs to provide

None — schema version 1 is inlined here.

## Starting state

Plan 001 created `status-core`, exact workspace `serde`/`serde_json`
dependencies, and all cited gates; no parser exists.

Assumption A1 means the snapshot is supplied from a local filesystem path.
Remote URLs, sockets, authentication, and executor changes are outside this
slice and falsify A1.

## Schema and public contract

Version 1 is UTF-8 JSON with this complete shape:

```json
{
  "version": 1,
  "runs": [
    {
      "id": "docs",
      "slice": "002",
      "state": "active",
      "updated_at": "2026-07-23T12:00:00Z"
    }
  ]
}
```

- Root fields `version` and `runs` are required. Run fields `id`, `slice`,
  `state`, and `updated_at` are required. Unknown fields are rejected at both
  levels with `#[serde(deny_unknown_fields)]`.
- `version` is the literal non-negative integer `1`; another non-negative
  integer is `SnapshotErrorKind::UnsupportedVersion`, while a negative or
  non-integer JSON value is `InvalidJson`.
- `id` and `slice` are trimmed before storage and must then be non-empty.
  Duplicate detection uses the trimmed `id`, so `"x"` and `" x "` conflict.
- `state` is the closed enum `queued | active | blocked | done | rejected`;
  unknown strings are validation errors.
- `updated_at` must use RFC 3339's literal `Z` UTC form; numeric offsets are
  rejected rather than normalized. Parse it with the workspace's pinned time
  dependency from plan 001. `runs: []` is valid.

Create these private serde DTOs and public types in
`crates/status-core/src/snapshot.rs`:

```rust
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct SnapshotDto { version: u64, runs: Vec<RunDto> }
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct RunDto { id: String, slice: String, state: RunState, updated_at: String }

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RunState { Queued, Active, Blocked, Done, Rejected }
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RunSnapshot {
    pub id: String,
    pub slice: String,
    pub state: RunState,
    pub updated_at: time::OffsetDateTime,
}
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Snapshot { pub runs: Vec<RunSnapshot> }
#[derive(Debug)]
pub struct SnapshotError { pub path: PathBuf, pub kind: SnapshotErrorKind }
#[derive(Debug)]
pub enum SnapshotErrorKind {
    Io(io::Error),
    InvalidJson(serde_json::Error),
    UnsupportedVersion(u64),
    InvalidRun { index: usize, field: &'static str, reason: &'static str },
    DuplicateRunId(String),
}
#[derive(Debug, Default)]
pub struct SnapshotReader { last_valid: Option<Arc<Snapshot>> }
```

`SnapshotReader::refresh(&mut self, path: &Path) ->
Result<Arc<Snapshot>, SnapshotError>` synchronously reads bytes from the local
path, parses and validates a complete temporary DTO, then atomically replaces
`last_valid`. On error it returns the typed error and leaves
`last_valid()` unchanged. `last_valid(&self) -> Option<Arc<Snapshot>>` exposes
the cache read-only. `new() -> Self` returns `Self::default()`. Implement
`Display` and `std::error::Error` for `SnapshotError`; `source()` exposes only
the wrapped I/O or serde error. `Display` messages include the path plus
actionable cause; they never include file contents. In `lib.rs`, declare
`mod snapshot;` and root-re-export every public type above with
`pub use snapshot::{...};`; downstream imports are `status_core::SnapshotReader`
and peers.

I/O failures map to `Io`; malformed JSON, missing/extra fields, wrong JSON
types, and unknown `state` strings map to `InvalidJson`; unsupported numeric
versions map to `UnsupportedVersion`; blank trimmed `id`/`slice` and invalid
RFC 3339 timestamps map to `InvalidRun` with field plus a fixed reason;
duplicate trimmed IDs map to `DuplicateRunId`. `SnapshotError.path` supplies
the path for every `Display` message. Fixed `InvalidRun.reason` values are
`"must not be blank"` and `"must be an RFC 3339 UTC timestamp ending in Z"`.
Validation order is deterministic: deserialize the whole DTO; check version;
then visit runs in array order and check trimmed ID, trimmed slice, timestamp,
then duplicate ID. Return the first failure.
Use these exact `Display` forms:

- `failed to read snapshot {path}: {source}`
- `invalid snapshot JSON at {path}: {source}`
- `unsupported snapshot version {version} at {path}; supported version: 1`
- `invalid run {index} field {field} at {path}: {reason}`
- `duplicate run id {id} at {path}`

Here “actionable” means every message identifies the file, failing boundary,
and correction category without echoing snapshot contents.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Core tests | `mise run test` | all workspace tests pass |
| Lint | `mise run lint` | exit 0 |

Evidence: example://workspace-gates.

## Scope

In: `crates/status-core/src/**`, `crates/status-core/tests/**`.
Out: terminal rendering (003), executor writer, remote transport.

## Git workflow

Stay on the branch already checked out by the executor; do not create or switch
branches. Commit this logical slice with a
Conventional Commit and DCO signoff; do not push without operator instruction.

## Steps

1. Add `snapshot.rs` with the exact DTO, domain, error, and validation contract
   above; export it from `crates/status-core/src/lib.rs`.
   Verify: valid-v1, empty-runs, invalid-field, invalid-state, duplicate-ID,
   blank-ID, and unknown-version unit tests pass.
2. Add `SnapshotReader` with parse-before-swap cache ownership.
   Verify: truncated, invalid, and unknown-version refresh tests compare
   `Arc::ptr_eq` before/after failure and prove the prior snapshot survives.
3. Add a deterministic timing test using a committed 100-run JSON fixture.
   Read and parse it once for warm-up, then time 20 complete `refresh` calls
   with `std::time::Instant`; assert every call is below 250 ms. The bound is
   per complete local read+parse+validate+swap operation, not an average.
   Verify: the timing test passes under `mise run test`.

## Test plan

Independent fixtures: valid v1; unknown v2; negative version; truncated JSON;
empty runs; missing root field; missing run field; wrong root/run types;
unknown root field; unknown run field; unknown state; duplicate trimmed ID;
blank ID; blank slice; offset and malformed timestamps; and 100-run timing
input. Inline JSON strings are acceptable for one-assertion cases; the valid,
truncated, empty, and timing inputs are committed as
`crates/status-core/tests/fixtures/{valid-v1,truncated,empty-runs,timing-100-runs}.json`.
The timing fixture contains IDs `run-000` through `run-099`, slice `"001"`,
state `"active"`, and timestamp `"2026-07-23T12:00:00Z"` for every run.

## Done criteria

- [ ] Every fixture category in Test plan has tests and passes.
- [ ] Every schema rule above has a positive or negative test.
- [ ] Failed refresh leaves `last_valid()` pointer-identical to the prior
      successful snapshot.
- [ ] Twenty timed complete refreshes each finish below 250 ms.
- [ ] `mise run lint` exits 0.
- [ ] No files outside Scope changed, excluding protocol writes.
- [ ] `plans/goal-live-status/README.md` row 002 changes from IN PROGRESS to
      DONE in the same commit; this Status-column edit is the permitted
      protocol write.

## STOP conditions

- Plan 001 gates fail.
- A1 is falsified by a remote-transport requirement.
- Correct parsing requires changing executor output.

## Maintenance notes

Add schema versions without widening unknown values into strings.
