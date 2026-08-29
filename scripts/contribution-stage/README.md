# Contribution stage protocol

The five contribution skills invoke their own installed entrypoint with
`--skill-file <loader-provided-absolute-SKILL.md>`. A minimal bootstrap checks
that trusted skill/package relationship before dynamically importing any local
core or helper. Each entrypoint accepts one bounded JSON object on stdin and
prints one `tailrocks.contribution-stage/v1` receipt.

The input schema is `tailrocks.contribution-stage-input/v1` with these exact
top-level fields:

- `contribution_id`: immutable UUID;
- `repository`: canonical `owner/repo`;
- `repo`: canonical absolute Git root, exact base and HEAD revisions, sorted
  changed paths, and exact HTTPS `origin` fork plus `upstream` target URLs;
- `handoff_root`: canonical absolute `contrib/<owner>-<repo>/` directory outside
  the target/fork tree; recon requires it to contain zero entries;
- `predecessors`: exact required handoff filename and SHA-256 pairs;
- `writes`: the stage's complete fixed output set, each with expected preimage
  SHA-256 (or `null`) and bounded content;
- `actions`, `approvals`, `receipts`: ordered external action bindings and their
  exact one-use proof triples;
- `now`: the UTC timestamp bound to approvals.

`recon` permits only `GET`. `propose` and `prepare` permit no external action or
receipt. `submit` requires `PUSH` and `CREATE_PR`; optional `GET` and `SIGN`
remain separately bound. `respond` requires `GET` and permits separately bound
`PUSH`, `REPLY`, `RETEST`, `CLOSE`, or `WITHDRAW` actions.

Every action hashes its complete `{id,kind,host,target,actor,credential_scope,
purpose,payload_sha256,before_sha256}` object. One unique approval and one unique
successful receipt must carry that hash. Approval windows cannot exceed five
minutes. The script does not mint user authority or perform remote work; it
verifies the immutable receipts produced at the skill's separately authorized
boundary.

The core invokes only a realpath-canonicalized, non-symlink Git executable
resolved from PATH under scrubbed
configuration, then proves a clean exact Git top level, target/fork remotes,
base ancestry, HEAD, base diff, and changed-path set before publication. It
rejects handoff or agent metadata in the target diff, symlinked/crossed trees,
stale or wrong-stage predecessors, malformed artifact identities, inexact
output sets, non-append log updates, stale preimages, and action/approval/receipt
replay. Writes use the shared anchored CAS transaction with the predecessor
read-set rechecked around every publication. A refusal reports no owned
mutation; interrupted rollback reports exact owned/foreign partial state,
`recovery_required`, and retained recovery artifacts. CLI success also hashes
the exact entrypoint, core, bounded runner, CAS helper, plugin manifest, and Git
binary into its receipt.
