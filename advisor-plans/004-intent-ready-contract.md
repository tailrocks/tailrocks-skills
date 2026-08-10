# Plan 004: Persist sensitivity-safe immutable sources

> **Executor instructions**: Finish the source-store seam in one session. Classify
> sensitivity before hashing or writing. Do not touch interactive skills or
> READY compilation; those belong to plans 015/016.

## Status

- **Priority**: P1
- **Dispatch**: BLOCKED until plan 003 has a current same-branch completion
  receipt; recut from its exact checkpoint
- **Effort**: M; one session
- **Risk**: HIGH
- **Depends on**: plan 003
- **Covers**: G01
- **Guardrails**: N06, N09, N13, N16
- **Research basis**: `advisor-plans/RESEARCH.md` F4-05, F4-07, F4-14
- **Planned at**: design baseline `1e809bd`; dependency recut required

## Why this matters

Verification cannot restore user words discarded during synthesis. Source
history must be immutable and rebuildable, but a pasted credential must never
become an immutable Git blob or even a low-entropy digest. This slice creates
the only canonical capture primitive and no higher-level workflow changes.

## Preconditions — run before anything else

After recut replaces placeholders with full SHAs:

```sh
rtk git fetch origin main
test "$(rtk git branch --show-current)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefName --jq .headRefName)" = "<implementation-branch>"
test "$(gh pr view <implementation-pr-number> --json headRefOid --jq .headRefOid)" = "$(rtk git rev-parse HEAD)"
test "$(gh pr view <implementation-pr-number> --json baseRefName --jq .baseRefName)" = main
test "$(gh pr view <implementation-pr-number> --json state --jq .state)" = OPEN
test "$(gh pr view <implementation-pr-number> --json isDraft --jq .isDraft)" = true
test -z "$(rtk git status --porcelain=v1)"
test "$(rtk git rev-parse HEAD)" = "<integration-sha>"
test "$(rtk git rev-parse origin/main)" = "<frozen-base-sha>"
test "$(rtk git merge-base HEAD "<frozen-base-sha>")" = "<frozen-base-sha>"
rtk git merge-base --is-ancestor <plan-003-completion-sha> HEAD
rtk git diff --stat <last-reviewed-sha>..HEAD -- Cargo.toml Cargo.lock crates/tailrocks-core/src/source_store crates/tailrocks-cli/src schemas/source-record.schema.json examples/source-store docs/source-provenance.md
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --mode scripted --require PASS
rtk cargo test --workspace --all-features
rtk mise run validate
```

Expected: exact shared-PR head/base and ancestry checks exit 0; scoped diff is
empty; tracer PASS; tests and 15-skill validation pass.

## Spec contract

### Requirement G01: safe primary-source persistence

Every accepted word, correction, attachment, or reference SHALL become an
immutable causal record before later synthesis. Sensitivity SHALL be classified
before repository persistence or hashing. Generated indexes/README sections
SHALL be deterministic projections, never authority.

#### Scenario: pasted credential

- **WHEN** input is or may contain a credential value
- **THEN** retain no value/preview/digest, record only type/location, advise
  rotation, and require a safe redacted restatement or external reference.

#### Scenario: interruption during append

- **WHEN** the process stops at any write boundary
- **THEN** no committed record references missing/wrong bytes; at worst one
  harmless unreferenced approved blob remains.

## Must NOT

- **N06**: sensitive/credential bytes cannot enter Git, logs, fixtures, or model
  tool output.
- **N09**: projections cannot be parsed back into source authority.
- **N13**: digests establish identity only, not completeness or consent.
- **N16**: source path/count/byte limits are checked before or during streamed
  capture; overflow retains no partial canonical record.

## Inputs to provide

None. Ambiguous sensitivity is `secret_refused` until the user supplies an
explicit safe representation; the executor must not ask tools to inspect the
suspected value.

## Starting state

- Roadmap items currently use one mutable README; no append-before-synthesis
  primitive exists.
- Plan 003 supplies Rust workspace, deterministic bytes, and failure conventions.
- Canonical item shape after this plan is `sources/records/*.json`, approved
  `sources/blobs/sha256/*`, generated `sources/index.json`, and generated README
  sections. `ready.intent.json` does not exist until plan 016.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Schema | `rtk cargo test -p tailrocks-core source_store::schema` | exit 0 |
| Append | `rtk cargo test -p tailrocks-core source_store::append` | exit 0 |
| Projection | `rtk cargo test -p tailrocks-core source_projection` | exit 0 |
| Full Rust | `rtk cargo test --workspace --all-features` | exit 0 |
| Repository | `rtk mise run validate` | exit 0 |

## Scope

**In scope**:

- `Cargo.toml`, `Cargo.lock` only for required source-store dependencies
- `crates/tailrocks-core/src/source_store/**`
- `crates/tailrocks-cli/src/**` only for `source append/rebuild/check`
- `schemas/source-record.schema.json`
- `examples/source-store/**`
- `docs/source-provenance.md`

**Out of scope**:

- Interactive skills, READY/compiler/runtime/provider behavior.
- A mutable authoritative index/counter or another source format.
- Cryptographic actor identity or secret storage/encryption.

## Git workflow

- Shared branch: `<implementation-branch>`; existing PR: `<implementation-pr-number>`
- Commit subject: `feat(delivery): preserve immutable source intent`
- One signed/co-authored checkpoint commit on that branch; do not open or merge another PR.

## Steps

### Step 1: Define storage classes before persistence

Define `SourceRecordV1` with `repository_plain`, `repository_redacted`,
`external_sensitive`, and `secret_refused`. Repository classes store only
approved bytes; external records store an opaque access-controlled reference;
refused records contain credential type/location only. Attachment fidelity is
`bytes | reference`. Never hash a refused or low-entropy secret.

**Verify**: Schema rejects unknown class, missing consent, unsafe digest/preview,
path traversal, malformed causal links, or reference claiming byte fidelity.

### Step 2: Append atomically without mutable identity

Use collision-resistant UUIDv7 IDs, blob-first/record-last create-new writes,
flush/fsync where supported, collision checks, and immutable supersedence.
Exact duplicates may share approved blobs but never rewrite records. Concurrent
writers require no authoritative counter.

**Verify**: Append tests cover concurrent writers, every crash boundary,
missing/wrong blob, duplicate, correction, redaction, external reference, and
credential refusal.

### Step 3: Rebuild and check deterministic projections

Validate the causal graph, sort by predecessors then ID, rebuild index/marked
README sections with CAS against the previous projection digest, and preserve
human sections outside markers. Second rebuild must be byte-identical.

**Verify**:

```sh
rtk cargo run -p tailrocks-cli -- source rebuild examples/source-store/basic
rtk cargo run -p tailrocks-cli -- source check examples/source-store/basic
rtk git diff --exit-code -- examples/source-store/basic
```

Expected: all exit 0 after the clean rebuild.

## Test plan

- Text/binary/reference attachments and exact duplicates.
- Redacted, external-sensitive, credential-refused, and no-secret-digest cases.
- Concurrent/interrupted writes, orphan blob, wrong blob, causal cycle.
- Stale projection CAS, stable rebuild, and source-ID retention.

## Done criteria

- [ ] Recut records full plan-003 and shared-branch final-head SHAs.
- [ ] Classification precedes every repository write/hash.
- [ ] Committed records are immutable, causal, and crash-safe.
- [ ] Projections rebuild byte-identically and remain non-authoritative.
- [ ] Commands, format, Clippy, rustdoc, diff, and scope checks pass.
- [ ] One signed/co-authored commit contains only Scope paths.

## STOP conditions

Stop on unresolved sensitivity, lossy fidelity, unsafe hashing, need for a
mutable authoritative index/counter, non-atomic committed record, Markdown
authority, stale/nonancestor dependency receipt, or work exceeding one session.

## Maintenance notes

Plan 015 is the only next owner of interactive capture. Schema migration must
preserve prior bytes/records and emit explicit new projections.
