# Plan 004: Preserve primary intent and freeze one READY contract

> **Executor instructions**: Extend the working Rust kernel; do not create a
> second state authority in skill prose. Every interactive answer must be durable
> before synthesis. Run all gates and honor STOP conditions.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- crates/ schemas/ skills/tailrocks-{idea,brainstorm,research,record-decision,finalize}/ skills/tailrocks-plan/references/coverage-ledger.md examples/plan-package/ docs/pipeline-walkthrough.md`
> Rebase onto plan 003, update this baseline, and verify its tracer remains green.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: plans 001 and 003 (step 3's skill fixtures verify through plan
  001's artifact-grounded runner)
- **Category**: feature, migration
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after plan 003

## Why this matters

Verification cannot recover words discarded during capture. Today interactive
skills rewrite one mutable roadmap README, so later agents cannot distinguish
the user's voice from synthesis. This plan makes raw inputs immutable, derived
views rebuildable, research non-normative by default, and READY one approved,
content-addressed intent contract.

## Current state

- `skills/tailrocks-idea/references/roadmap-item-format.md` defines one mutable
  `roadmap/<slug>/README.md` as the item.
- Idea, Brainstorm, Research, Record Decision, and Finalize write summaries but
  do not share an append-before-synthesis primitive.
- Finalize alone grants READY; preserve that authority.
- `skills/tailrocks-plan/SKILL.md:78-81` expects stable `S#`, `F#`, `W#`, `N#`,
  `B#`, decision/research/assumption/question anchors. Keep those readable IDs.
- Plan 003 provides the Rust workspace, deterministic bytes, SQLite journal
  pattern, and CLI failure conventions. Reuse them.

Canonical item shape after this plan:

```text
roadmap/<slug>/
  README.md                         # generated human projection
  sources/
    records/<uuidv7>.json           # immutable metadata, written last
    blobs/sha256/<digest>            # immutable raw text/image/file bytes
    index.json                       # generated; never primary
  ready.intent.json                  # sole frozen READY intent contract
```

## Preconditions

```sh
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/tracer --require PASS
rtk cargo test --workspace --all-features
rtk mise run validate
```

Expected: tracer PASS, Rust tests green, 15 skills valid.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Source tests | `cargo test -p tailrocks-core source_store` | exit 0 |
| READY tests | `cargo test -p tailrocks-core ready_contract` | exit 0 |
| Eval tests | `bun test scripts/` | exit 0 |
| Skills | `mise run validate` | 15 skills valid |
| Rust gates | `cargo fmt --all --check && cargo clippy --workspace --all-targets --all-features -- -D warnings && cargo test --workspace --all-features` | exit 0 |

## Suggested executor toolkit

Invoke `tailrocks-rust-best-practices` for the storage/API work. Use the
repository's existing delivery skills as the protocol authority; do not replace
their narrow write ownership or one-question interview behavior.

## Scope

**In scope**:

- `crates/tailrocks-core/src/source_store/**` (new)
- `crates/tailrocks-core/src/ready_contract/**` (new)
- `crates/tailrocks-cli/src/**` for `source` and `ready` commands
- `schemas/source-record.schema.json` (new)
- `schemas/ready-intent.schema.json` (new)
- `skills/tailrocks-idea/**`
- `skills/tailrocks-brainstorm/**`
- `skills/tailrocks-research/**`
- `skills/tailrocks-record-decision/**`
- `skills/tailrocks-finalize/**`
- `skills/tailrocks-plan/references/coverage-ledger.md`
- `examples/plan-package/**`
- `docs/pipeline-walkthrough.md`

**Out of scope**:

- `tailrocks-prototype` (plan 005).
- Executable plan/runtime contract compilation (plan 006).
- Replacing roadmap README or research chapters with opaque JSON.
- Treating research facts, model summaries, or inferred preferences as user
  decisions.
- Cryptographic user identity. Local approvals are labeled
  `declared_user_approval`, not adversary-resistant signatures.

## Git workflow

- Branch: `feat/immutable-intent-ready`
- Commit subject: `feat(delivery): preserve intent through READY`.
- Use `git commit -s` and the Codex co-author trailer. Do not push/open a PR
  without operator instruction.

## Steps

### Step 1: Implement atomic immutable source capture

Add `tailrocks source append`. Generate collision-resistant UUIDv7 record IDs;
do not allocate from a shared mutable counter. Store raw UTF-8 or binary input as
`sources/blobs/sha256/<digest>`, then atomically write the immutable record last.
The record includes schema version, ID, media type, byte length, digest,
timestamp, source kind, actor trust label, predecessor/supersedes IDs, and
redaction metadata. It never duplicates raw content.

Records carry `capture_fidelity: bytes | reference`. Several clients expose
pasted images or attachments to the model without a re-exportable original
file; such inputs are captured as `reference` (client, description, digest if
available) rather than pretending byte fidelity exists. Only `bytes` records
reference blobs.

Use temp-write, flush/fsync where supported, atomic rename, and create-new
semantics. A crash after blob write creates only a harmless orphan; a committed
record may never reference a missing/wrong blob. Multiple writers can create
unique records concurrently. Acquire an item-scoped lease only for rebuilding
derived index/README, with compare-and-swap against the prior projection digest.

**Verify**: `cargo test -p tailrocks-core source_store` → exit 0; duplicate
content, concurrent append, blob collision, crash at each write boundary,
missing blob, stale projection CAS, supersedence, and redaction tests pass.

### Step 2: Make projections fully derivable and drift-detectable

Add `tailrocks source rebuild <item>`. Sort records deterministically by causal
predecessor then ID, validate the graph, emit `sources/index.json`, and update
only generated source/decision/log sections of README. Preserve explicitly
human-authored sections outside generated markers. A second clean rebuild must
be byte-identical.

Add `tailrocks source check <item>` that fails for orphan references, cycles,
stale projections, invented projection text without a source anchor, or a
normative statement sourced only from model synthesis.

**Verify**: `cargo test -p tailrocks-core source_projection` → exit 0; clean
rebuild is idempotent and every rendered normative line has a source ID.

### Step 3: Change interactive skills to append before synthesis

Update Idea, Brainstorm, Research, Record Decision, and Finalize:

1. capture each user answer/correction/attachment through `tailrocks source
   append` before interpreting it;
2. cite source IDs in every derived statement;
3. use supersedence for corrections; never edit old record/blob bytes;
4. rebuild projections after synthesis;
5. on interruption after append, resume from durable source rather than asking
   the user to reconstruct it.

**No-binary fallback is mandatory.** These skills ship to every plugin channel
(Claude, Codex, Grok, Kimi, Antigravity and manual installs) while the
`tailrocks` binary is user-installable only after plan 009. Every changed skill
must detect an absent binary and follow a documented manual path: write the
same record/blob files directly per a `references/source-record-format.md`
authored here, with `tailrocks source check` validating them later. A skill
that instructs agents to run a nonexistent command is a release-blocking
defect, not a forward reference. The existing interview behavior must remain
fully functional on clients where the binary is never present.

Research fact records include source URL/path, retrieval time, quoted/derived
boundary, and freshness rule. They remain `informative` until a user decision
adopts them. Never let a model-authored research conclusion become normative by
itself.

**Verify**: `bun test scripts/` → exit 0 with artifact-grounded Idea,
Brainstorm-correction/resume, Research, Decision reversal, and Finalize fixtures.

### Step 4: Compile and approve one READY intent contract

Add `tailrocks ready compile` and `tailrocks ready approve`. The compiler emits
exact deterministic bytes to `ready.intent.json` containing:

- item ID and digest of the complete source-record set;
- stable requirement IDs and exact normative text/source anchors;
- primary, alternate, error, recovery, accessibility, performance/security, and
  explicit-exclusion coverage or sourced deferral reasons;
- decisions, unresolved research facts, empirical uncertainties, and explicit
  assumptions;
- declared deterministic, semantic, visual, human, and external verification
  seams;
- approval evidence/trust label and schema version.

READY is refused while a normative statement lacks primary source, a scenario
class is silently absent, an empirical uncertainty lacks prototype/defer route,
or an external effect lacks operator ownership. `approve` may not be invoked by
the later goal executor capability. Any newer/superseding normative source makes
the READY contract stale; recompilation requires renewed approval.

Do not create `contract.lock.json` plus another READY file. This one file is the
sole stage authority; plan 006 references its digest rather than copying intent
text.

**Verify**: `cargo test -p tailrocks-core ready_contract` → exit 0; missing
class/source, adopted fact, empirical route, correction invalidation, forged
executor approval, stable bytes, and reapproval cases pass.

### Step 5: Migrate the worked example and document the boundary

Migrate `examples/plan-package/` to immutable source records, generated
projection, and `ready.intent.json`. Preserve the current human-readable
walkthrough. Add one correction and one research fact so supersedence and
informative-vs-normative behavior are visible.

Update `docs/pipeline-walkthrough.md` and coverage-ledger guidance. State that
hashes prove identity, not completeness; Finalize's checklist and user approval
remain the completeness boundary.

**Verify**:

```sh
cargo run -p tailrocks-cli -- source check examples/plan-package/roadmap/goal-live-status
cargo run -p tailrocks-cli -- ready verify examples/plan-package/roadmap/goal-live-status --require READY
git diff --exit-code -- examples/plan-package/roadmap/goal-live-status/sources/index.json examples/plan-package/roadmap/goal-live-status/README.md
```

Expected: all exit 0 after a clean rebuild.

## Test plan

- Concurrent/interrupt/crash source-write tests and projection idempotency.
- Text, image/blob, correction, exact duplicate, redaction, missing/corrupt blob.
- Interactive multi-turn capture-before-synthesis and resume fixtures.
- Research facts remain informative until an anchored decision adopts them.
- READY coverage classes, verification seams, assumptions, empirical routes,
  approval capability, invalidation, and deterministic-byte tests.
- Full worked-example rebuild from sources only.

## Done criteria

- [ ] Raw sources/decisions are immutable; derived views rebuild byte-identically.
- [ ] Concurrent/interrupted capture cannot lose a committed record.
- [ ] Every normative READY requirement cites primary user/decision sources.
- [ ] Research is non-normative until adopted.
- [ ] READY has one canonical file and becomes stale on relevant source change.
- [ ] Executor capability cannot approve READY.
- [ ] Worked example rebuild/verify commands pass.
- [ ] Rust, script, skill-validator, and diff gates pass.

## STOP conditions

Stop if source capture requires a mutable global ID/index to be authoritative,
README synthesis cannot be derived without losing human text boundaries,
approval identity is represented as stronger than available trust, or READY
would permit unresolved empirical uncertainty without evidence or sourced defer.

## Maintenance notes

Plan 005 adds that empirical route; plan 006 consumes only the digest and stable
IDs from `ready.intent.json`. Schema migration must preserve old source bytes and
emit an explicit new approval, never silently rewrite records.
