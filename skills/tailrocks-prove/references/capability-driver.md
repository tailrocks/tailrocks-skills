# Capability driver

`../../scripts/prove-driver.ts` is the sole machine execution boundary for a
prove round. Resolve it from this installed skill package and always pass
`--skill-file` with this canonical absolute `SKILL.md`. Requests are strict
JSON on stdin; success and refusal each print one typed JSON receipt.

The driver records facts. It never emits `WORKS`, `DEFECT`, `CONFIRMED`,
`REFUTED`, `WIDER`, `HELD`, or `VIOLATED`; those are semantic judgments made
from its receipts and independently challenged observations.

## Prepare

Send `schema: tailrocks.prove-driver-input/v1`, `operation: prepare`, the
canonical local Git `root`, exact full `head`, source `status_sha256`, unique inventory rows
(`id`, `capability: CLI | APPLICATION | BROWSER`, and `claims`), an optional
exact build argv, and declared build artifact paths. Each row binds exact
`argv`, `cwd`, `stdin`, `timeout_ms`, `maximum_output_bytes`,
`effect_authority`, `artifacts`, and `env_names`.

Preparation binds every source byte outside `.git`, creates a private
no-hardlink local checkout at the exact revision with smudge filters disabled, runs the build
once, hashes declared artifacts, and writes an identity-checked session
manifest outside the source tree. Retain its path and receipt exactly. A failed
build is evidence for the round and permits no surface runs.

## Run

Send `operation: run`, the exact `session_manifest` and `session_sha256`, one inventory
row id, the row's exact effect authority, an optional explicit
`not_executed_reason`, and the selected decisive stream and line index. The
prepared inventory already binds exact argv, relative working directory,
bounded stdin/time/output, allowed environment names, and artifact paths.

Arguments are an array, never a shell string. Each row runs in its own copy of
the immutable prepared checkout with driver-owned `HOME` and `TMPDIR`. The
executable, full checkout byte snapshots, HEAD, source bytes, stdin, named
environment value digests, streams, selected line, and artifacts are
identity-bound and hashed. Ambient environment is stripped except for named
variables. The driver owns the whole process group and bounds TERM/KILL cleanup.
This is process and filesystem isolation, not a general network sandbox.

- `CLI` runs the shipped command. Inventory rows that claim pipe behavior use
  a separate row with explicit stdin; a normal run cannot stand in for it.
- `APPLICATION` runs a one-shot local adapter. Its final stdout line follows
  `tailrocks.prove-application/v1` and records readiness, positive
  probe count, owned PID, cleanup, and artifacts. Native visual work delegates
  capture to the installed visual-QA harness and reports its receipt.
- `BROWSER` runs a one-shot local adapter. Its final stdout line follows
  `tailrocks.prove-browser/v1` and records an owned private loopback
  origin, positive navigation and assertion counts, blocked external request
  count, console/page errors, disposable-profile cleanup, and artifacts. Web
  visual work delegates capture to the guarded visual-QA harness.

Only locally authorized read-only or disposable-workspace effects enter the
prepared inventory. Production, external, irreversible, unavailable-device,
or otherwise unauthorized rows pass an exact `not_executed_reason`; the driver
returns `NOT_EXECUTED` without resolving or spawning their argv. After fresh
authorization, prepare a new session whose local adapter owns an isolated,
reversible target; never broaden an existing row after preparation.

## Assemble

Send `operation: assemble`, the exact manifest/session and each returned
`row_id`/`receipt_path`/`receipt_sha256` reference. Assembly loads machine-owned
receipt files instead of trusting submitted facts, requires a one-to-one
inventory partition, deeply validates every fact and digest, rechecks the
original source bytes, and emits `tailrocks.prove-evidence-bundle/v1` with the
inventory, build fact, prepared artifacts, receipts, and SHA-256. It then
removes only the owned disposable workspace. Missing, duplicate, foreign,
stale, tampered, or malformed evidence refuses. Any retained cleanup path is a
recovery artifact and blocks report publication.

Embed the returned bundle JSON byte-for-byte in the report. Never persist a
parallel evidence sidecar or a migration-plan artifact.
