# Plan 003: Preserve raw intent and freeze a verifiable READY contract

> **Executor instructions**: Implement append-only source provenance and the
> READY compiler together. Do not let a generated summary replace user input,
> and do not let unverifiable normative intent pass READY. Run all gates and
> stop on the conditions below.
> Before editing, run `rtk git status --short --branch` and `rtk git rev-parse
> HEAD`, then recheck every cited Current state fact. If repository drift
> invalidates one, revise/review this plan first; preserve unrelated user work.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH — changes durable roadmap format and READY semantics
- **Depends on**: `advisor-plans/002-rust-control-plane-foundation.md`
- **Category**: correctness / architecture
- **Planned at**: commit `04987c8`, 2026-08-09

## Why this matters

`tailrocks-idea` promises preservation, but immediately restructures input into
mutable sections. If wording or nuance is lost there, later coverage cannot
detect it. Finalize also requires “checkable” acceptance without assigning
explicit verification types or preventing product assumptions after READY.
This plan makes original user statements immutable sources and makes READY a
frozen, content-addressed contract with known verification seams.

## Current state

- `skills/tailrocks-idea/SKILL.md:19-20` says preserve the user's words and
  arrange them into the item template.
- `skills/tailrocks-idea/SKILL.md:46-52` writes every statement into exactly one
  mutable section; no immutable raw artifact/source ID is created.
- `skills/tailrocks-brainstorm/SKILL.md:35-38` records answers in semantic
  sections but keeps no append-only answer source.
- `skills/tailrocks-record-decision/SKILL.md:42-47` appends dated decisions,
  but downstream links cannot prove which user statement authorized them.
- `skills/tailrocks-finalize/references/readiness-and-grilling.md:62-90`
  requires a checkable quality bar and planning dry-run, not a typed verifier
  route for each normative statement.
- `skills/tailrocks-plan/references/coverage-ledger.md:20,88-97` permits `A#`
  when item/research are silent and later turns research questions into
  assumptions. That can silently create product behavior after READY.
- `skills/tailrocks-idea/references/roadmap-item-format.md:41-126` has no
  source index or contract lock.

## Research basis

- [Matt Pocock `to-spec`](https://github.com/mattpocock/skills/blob/main/skills/engineering/to-spec/SKILL.md)
  settles public test seams before specification. This plan adopts that idea at
  READY while adding source provenance and typed verification ownership.

## Target artifact shape

```text
roadmap/<slug>/
  README.md
  sources/
    index.json
    identities.json
    records/SRC-0001.json
    records/SRC-0002.json
    blobs/sha256-<digest>
  contract.lock.json
```

- A source record preserves the exact text/blob bytes available to the skill,
  except mandatory credential redaction. It records media type, capture form,
  sanitized original name when applicable, and the retained blob digest.
- Source records/blobs are append-only and never edited or reused.
- `sources/index.json` records kind, timestamp, content hash, redactions,
  supersedence, and derived roadmap anchors. `identities.json` allocates
  monotonic source/requirement identities and retains tombstones.
- `README.md` remains the readable, mutable synthesis.
- `contract.lock.json` is generated only on READY and maps every normative
  requirement to source IDs, item anchors, verification kind/seam, and hash.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Full verification | `mise run verify` | all Bun/Rust/package gates pass |
| Intent compile | `cargo run -p tailrocks-cli -- compile intent examples/plan-package/roadmap/goal-live-status --json` | `ready: true`; lock hash returned |
| Intent check | `cargo run -p tailrocks-cli -- check intent examples/plan-package/roadmap/goal-live-status --json` | no unmapped sources or unverifiable normative entries |
| Skill evals | `bun scripts/run-evals.ts --skill tailrocks-idea --case 1 --preflight-only` | contract, fixtures, rubrics, and assertion definitions validate |

## Scope

**In scope**:

- `crates/tailrocks-core/**` and `crates/tailrocks-cli/**` intent compiler/checks
- `schemas/v1/**` source and intent-contract schemas
- `skills/tailrocks-idea/SKILL.md`
- `skills/tailrocks-idea/references/roadmap-item-format.md`
- `skills/tailrocks-brainstorm/SKILL.md`
- `skills/tailrocks-record-decision/SKILL.md`
- `skills/tailrocks-research/SKILL.md`
- `skills/tailrocks-research/references/research-playbook.md`
- `skills/tailrocks-finalize/SKILL.md`
- `skills/tailrocks-finalize/references/readiness-and-grilling.md`
- `skills/tailrocks-plan/references/coverage-ledger.md` assumption policy only
- evals for those six skills and their fixtures/rubrics
- `examples/plan-package/roadmap/goal-live-status/**`
- `docs/pipeline-walkthrough.md` stages 1–5 only

**Out of scope**:

- Plan manifests, effect budgets, or GOAL generation; plan 004.
- Executor state and receipts; plan 005.
- Prototype experiments; plan 008.
- Editing production/source projects outside this skills repository.

## Git workflow

- Branch: `advisor/003-intent-provenance-ready-contract`
- Conventional commits, for example `feat(delivery): freeze READY intent`;
  `git commit -s` plus `Co-authored-by: Codex <codex@openai.com>`.
- Do not push/open PR without operator instruction.

## Steps

### Step 1: Add append-only source records

Extend the v1 model with strict source-index entries. Source kinds:

- `idea_input`
- `interview_answer`
- `explicit_decision`
- `user_deferral`
- `user_correction`

Each record contains a stable `SRC-NNNN`, captured timestamp, SHA-256 digest,
media type, capture form (`conversation_text`, `attached_bytes`,
`external_reference`, or `legacy_import`), sanitized display metadata, optional
supersedes IDs, redaction metadata, and one or more derived item anchors. Blob
paths are content-addressed and cannot escape the item. IDs are allocated from
`identities.json`, monotonic, never inferred from text similarity, and never
reused; removed IDs leave tombstones. Existing records may be superseded but
never edited/deleted.

Do not store secrets verbatim. Replace a detected credential in text with
`[REDACTED:<credential type>]`, record that redaction occurred, and tell the
user; never retain the value or a brute-forceable original-value digest in
blobs, logs, receipts, or tests. Refuse binary attachments that cannot be safely
redacted when they plausibly contain secrets.

**Verify**: Rust tests reject edited digest, reused/tombstoned ID, dangling
supersedes, path/media mismatch, blob traversal, unknown kind, missing derived
anchor, and unredacted credential fixtures; text and binary fixtures round-trip
the retained bytes exactly.

### Step 2: Make delivery skills append sources before synthesis

- Idea writes a source record/blob from the original request and every supplied
  attachment, then derives README sections and links every derived statement
  back through `sources/index.json`.
- Brainstorm writes each accepted user answer as a new source before updating
  sections.
- Record Decision writes the exact accepted decision/reason as a new source;
  reversals supersede old sources without deleting them.
- Finalize writes explicit deferral/approval answers as sources and records
  confirmed flow/screen/mockup artifacts as hashed attachments linked to the
  scenario and viewport/state they define.

If a tool interruption happens after source append but before synthesis, the
next invocation detects the unprojected source and resumes; it must not append a
duplicate.

**Verify**: typed multi-turn evals prove retained text/attachment bytes survive,
section statements map to sources, interruption recovery is idempotent,
corrections supersede instead of overwrite, and invented content is rejected.

### Step 3: Classify every unresolved point before READY

Use exactly these classes:

- `product_decision`: only user can resolve or defer;
- `researchable_fact`: research can resolve with evidence;
- `empirical_uncertainty`: prototype/experiment can resolve (plan 008 later);
- `implementation_discretion`: multiple implementations preserve all observable
  behavior and effect budgets;
- `intentional_deferral`: explicit user decision with reason and trigger.

Product decisions and empirical uncertainties cannot become `A#` assumptions.
After READY, only behavior-invariant technical assumptions are allowed; each
must name a falsifier and prove that either outcome preserves the frozen
contract. Otherwise reopen SHAPING through Record Decision/Finalize.

**Verify**: finalize evals refuse READY for unresolved product choice,
misclassified research, empirical uncertainty without prototype/deferral, or a
technical assumption that changes observable behavior.

### Step 4: Give contract-relevant research facts stable identities

Extend research topics so each load-bearing fact consumed by an intent contract
has a stable `RF-NNNN` record containing claim, primary-source citation,
verified date, confidence, applicable product/tool versions, content hash, and
explicit invalidation signals such as source revision, version range, or expiry.
Contradictory facts remain separate records with disposition; never average
them. Research remains informative, not normative: a fact can constrain what is
possible, but product direction still requires a user decision/source.

Contract locks reference exact research-fact IDs/hashes. A changed or expired
fact invalidates only contracts that consume it and routes back to Research and
Finalize. Unsourced/LOW-confidence material cannot support READY.

**Verify**: research and intent tests cover stable no-op IDs, changed source,
version expiry, contradiction, missing primary citation, and selective contract
invalidation.

### Step 5: Add requirements-quality coverage before READY

Treat the candidate contract as code written in English. Generate a strict
readiness checklist that tests the requirements—not the implementation—for:

- completeness, clarity, consistency, and measurable acceptance;
- primary, alternate, exception, recovery, empty/boundary, and relevant
  non-functional scenario classes;
- explicit Must-NOT and out-of-scope boundaries;
- terminology and entity consistency across sources, README, decisions, and
  research facts;
- every explicit exclusion carrying a source ID and reason rather than being
  silently omitted.

The checklist is evidence for human approval, not a model-owned proof. Each
applicable class must map to requirement IDs; each inapplicable class needs an
approved exclusion source. Finalize refuses READY while any item is unresolved.

**Verify**: fixtures catch a happy-path-only contract, vague quality adjective,
missing failure/recovery flow, inconsistent term, unsourced exclusion, and a
complete explicitly bounded contract.

### Step 6: Agree on verification seams during Finalize

For every normative capability, flow, screen state, Must-NOT, and quality-bar
entry, record:

- verification kind: `deterministic`, `semantic`, `human`, or `external`;
- observable seam: API, domain service, UI flow, persisted state, emitted event,
  CLI output, visual approval, performance budget, or named external check;
- whether the seam already exists or its creation is authorized work;
- required evidence shape and owner.

Finalize must refuse READY when a normative statement has no credible
verification route. Semantic/human/external checks must be labeled honestly;
never disguise them as deterministic.

**Verify**: intent checker reports stable codes for missing kind/seam/owner and
accepts the fully classified example.

### Step 7: Compile and human-approve `contract.lock.json`

Implement `tailrocks compile intent <roadmap-dir>`. It must:

- validate source hashes and README/source mappings;
- allocate stable requirement and Must-NOT IDs through `identities.json`, retain
  tombstones, and never infer identity from reordered/similar prose;
- capture verbatim normative text, source IDs, item anchors, verification
  metadata, decisions, deferrals, and contract version;
- compute the content hash using plan 002 canonicalization;
- write a candidate lock and show a human-readable source-to-contract diff plus
  readiness checklist before requesting approval;
- record approval through a control-plane channel the executor cannot edit when
  available; otherwise label it `local_non_adversarial` and never claim
  malicious-agent resistance;
- distinguish `user_confirmed_in_session`, operator-signed, and CI/policy
  attestations, and require the package's declared minimum trust mode.

Only Finalize may request creation of an approved READY lock; only the control
plane records the approval. Model-generated prose, files, or guessed tokens
cannot approve. A later source/decision change invalidates the lock immediately
and reopens the item; Record Decision invokes the checker and marks downstream
packages stale by hash.

**Verify**: compile/check tests cover stable rerun, source edit, decision
reversal, added/removed/reordered requirement, tombstone preservation, forged
worktree approval, insufficient trust mode, and valid operator/session approval.

### Step 8: Migrate the example and documentation

Add source records and a valid lock to the example item. Update roadmap format,
walkthrough, and skill boundaries so source records are the immutable origin,
README is the readable synthesis, and lock is the normative READY contract.
Document migration: existing items without sources remain pre-READY until an
operator imports their current README as one `legacy_import` source and reviews
the generated mapping.

**Verify**: `mise run verify` and all affected skill evals pass; example intent
check returns `ready: true`.

## Test plan

- Source integrity: exact text/blob preservation, redaction, media/path safety,
  stable hashes, append-only IDs/tombstones, supersedence, interrupted
  projection recovery.
- Intent loss: remove one original sentence from README mapping; check fails.
- Intent invention: add normative README text without source; check fails.
- Classification: all five classes; illegal assumption routes.
- Requirements quality: scenario-class completeness, explicit exclusions,
  clarity/measurability, and terminology consistency.
- Research facts: stable identity, primary source, version/freshness boundary,
  contradiction, and invalidation.
- Verification seam: missing/invalid kind, missing owner, semantic mislabeled as
  deterministic.
- Lock invalidation: changed source, decision, requirement, seam, or deferral.
- Legacy import: explicit human review required; no silent automatic READY.

## Done criteria

- [ ] `mise run verify` exits 0.
- [ ] Every new idea/interview/decision answer gets immutable source ID/hash.
- [ ] All derived normative item statements map to source IDs.
- [ ] Text and attachments use safe append-only records/blobs with monotonic ID
      allocation and tombstones.
- [ ] Every applicable scenario class is covered or explicitly excluded by an
      approved source before READY.
- [ ] READY cannot be granted without explicit verification kind/seam/owner for
      every normative statement.
- [ ] Product assumptions after READY are impossible by schema and skill rule.
- [ ] Every contract-relevant research fact has a stable ID, source, version/
      freshness boundary, hash, and invalidation signal.
- [ ] Approved `contract.lock.json` is stable on no-op reruns and invalidates on
      normative change.
- [ ] Approval trust mode is explicit; writable model output cannot self-approve
      READY.
- [ ] Example and typed evals demonstrate loss/invention detection.
- [ ] No files outside Scope changed except advisor status.

## STOP conditions

- Source capture would persist a credential or private value verbatim.
- An attachment cannot be preserved/redacted without retaining sensitive bytes.
- Stable IDs cannot be preserved across a no-op rerun or explicit supersedence.
- READY compilation requires the model to infer whether a statement is
  normative without exposing the candidate mapping to the user for approval.
- The available approval channel is model-writable but the package requires
  operator/CI trust; stop instead of downgrading silently.
- A verifier seam depends on implementation details the user has not authorized;
  route back to Finalize instead of inventing it.
- Migration would silently treat legacy synthesized prose as original raw input.

## Maintenance notes

Original sources are evidence, not automatically current truth; supersedence and
the approved lock decide which statements are normative. Reviewers should check
that source IDs remain append-only and that no skill edits `contract.lock.json`
directly. All later invalidation depends on trustworthy hashes and mappings.
