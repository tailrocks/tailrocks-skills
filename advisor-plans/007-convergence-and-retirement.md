# Plan 007: Converge on current evidence and retire packages explicitly

> **Executor instructions**: Extend the working multi-slice runtime. Deterministic
> truth runs first; unresolved semantic/human/external seams remain visible.
> PASS and retirement are separate transitions. Run every gate and stop on any
> ambiguous owner or destructive target.
>
> **Drift check (run first)**:
> `git diff --stat b629fb9..HEAD -- crates/ schemas/ skills/tailrocks-reconcile/ skills/tailrocks-{plan,record-decision}/ skills/tailrocks-idea/references/roadmap-item-format.md specs/ archives/ examples/plan-package/ docs/`
> Rebase onto plan 006, refresh this baseline, and prove its multi-slice example
> still reaches deterministic PASS.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: plan 006
- **Category**: feature, correctness
- **Planned at**: commit `b629fb9`, 2026-08-10; refresh after plan 006

## Why this matters

Real packages include semantics, design quality, visual judgment, and human or
external approvals that deterministic commands cannot prove. Repeating the
executor's checks or voting among reviewers is not independence. This plan
re-derives deterministic truth on the exact final tree, collects only declared
fresh attestations, routes each failure to its owner, and creates PASS only when
the conjunction is current.

Deletion is deliberately outside goal success. PASS remains valid if cleanup
fails; an explicit idempotent operator action syncs durable truth, archives the
active package, then removes only `plans/<slug>/`.

## Current state

- `skills/tailrocks-reconcile/SKILL.md:29-50` distrusts executor status and reruns
  done criteria, but those criteria may share the same blind spot.
- Plan 006 can PASS only deterministic-only fixtures. Its final receipt and
  journal are the extension points.
- Scope/path/effect checks are deterministic in v1; universally asking a model
  to repeat them adds correlation, not proof.
- Fresh Product and Engineering review can still find omissions not encoded in
  tests. Keep their verdicts distinct and conjunctive.
- Git branch history is not durable archive under squash/rebase/branch deletion;
  do not promise `<retirement-commit>^` will retain the package.

## Preconditions

```sh
rtk cargo run -p tailrocks-cli -- goal inspect --example examples/deterministic-goal/multi-slice --require PASS --require-slices 3
rtk cargo test --workspace --all-features
rtk mise run validate
```

Expected: deterministic multi-slice PASS, tests green, current skill count valid.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Reconcile tests | `cargo test -p tailrocks-core convergence` | exit 0 |
| Retirement tests | `cargo test -p tailrocks-core retirement` | exit 0 |
| Reconcile example | `cargo run -p tailrocks-cli -- goal reconcile --example examples/plan-package --final` | exact PASS or fixture-declared route |
| Preview | `cargo run -p tailrocks-cli -- plan retire goal-live-status --dry-run --json` | exit 0, exact paths, eligible true |
| Full gates | `cargo fmt --all --check && cargo clippy --workspace --all-targets --all-features -- -D warnings && cargo test --workspace --all-features && mise run validate` | exit 0 |

## Scope

**In scope**:

- `crates/tailrocks-core/src/convergence/**` (new)
- `crates/tailrocks-core/src/retirement/**` (new)
- `crates/tailrocks-cli/src/**` for reconcile/apply/retire/restore inspection
- `schemas/goal-contract.schema.json` review policy fields
- `schemas/receipt.schema.json` final/attestation fields
- `schemas/completion.schema.json` (new)
- `skills/tailrocks-reconcile/**`
- `skills/tailrocks-plan/**` review/retirement handoff only
- `skills/tailrocks-record-decision/**` reopen behavior
- `skills/tailrocks-idea/references/roadmap-item-format.md`
- `specs/**` (new durable shipped specification tree)
- `archives/plans/sha256/**` (new deterministic package archives)
- `examples/plan-package/**`
- `docs/pipeline-walkthrough.md`, `docs/deterministic-goal-trust.md`

**Out of scope**:

- Universal three-session review, reviewer votes/scores, or reviewer-authored
  deterministic expected values.
- Allowing a model to choose the authoritative backtrack destination.
- Automatic remote push/merge/release.
- Automatic retirement inside native `/goal`.
- Deleting roadmap sources, research, durable spec, completion, receipt, or
  archive.
- History rewrite or garbage collection.

## Git workflow

- Branch: `feat/verified-convergence`
- Commit subject: `feat(goal): add current-evidence convergence`.
- Retirement creates a separate explicit local commit only after `--apply` and
  operator authorization. All commits use DCO and Codex co-author trailer.
- Never push/open a PR without instruction.

## Steps

### Step 1: Re-derive deterministic truth on the exact final tree

At every nominal package completion, Stop checkpoint automatically invokes
final reconcile. In a fresh verifier clone at the exact proposed final commit:

1. revalidate READY and goal-contract digests;
2. validate slice receipt ancestry/dependency/invalidation;
3. rescan full tracked/untracked delta and path/effect mappings;
4. rerun every package-final deterministic gate and oracle-mutation sentinel;
5. verify exact tool/instruction/oracle/effective-hook resolution;
6. invalidate all downstream evidence on any mismatch.

Write results and derived state in one SQLite transaction, referencing immutable
evidence blobs. Do not add a separate convergence log/head.

**Verify**: `cargo test -p tailrocks-core convergence::deterministic` → exit 0;
stale contract, changed final tree, broken ancestry, unmapped delta, stale tool,
oracle tamper, missing trial, and idempotent clean rerun tests pass.

### Step 2: Dispatch only unresolved independent verdict axes

The contract declares each Product Contract, Scope, and Engineering Integrity
criterion as `deterministic`, `fresh_model`, `human`, or `external`.
Deterministic scope mapping is not sent to a model again. A fresh model session
is created only for criteria that genuinely require semantic judgment.

Each reviewer receives a read-only clean clone, frozen READY/spec/contract,
relevant house skill, and named evidence; it receives no executor transcript,
status table, prior verdict, or other review. One session may return separate
Product and Engineering sections unless the contract's risk policy explicitly
requires distinct sessions/providers. Every criterion is PASS/FAIL with concrete
file/requirement evidence; no score or majority.

Reviewer output is an attestation with provider/model/config/version and input
digests. It cannot change candidate, contract, oracle, journal, or expected
values. Same-provider/model correlation is labeled, not described as statistical
independence.

**Verify**: `cargo test -p tailrocks-core convergence::review` → exit 0; clean
context, leaked prior verdict, score/majority, missing criterion, candidate write,
one failing axis, and correlated-trust-label tests pass.

### Step 3: Collect visual, human, and external gates honestly

Visual artifacts must name viewport/state/input and immutable screenshot or
render digests. Human approval names the exact contract/final-tree/evidence
digest and available trust label. External gates record issuer, result, subject,
freshness/expiry, and retrieval evidence; they never embed credentials.

Any changed subject or expired evidence returns `AWAITING_ATTESTATION`, not PASS.
Local declared approval is not called cryptographic identity. V1 external
effects themselves remain operator-owned; their attestations may prove the
operator completed them, not that the model was sandboxed.

**Verify**: `cargo test -p tailrocks-core convergence::attestation` → exit 0;
stale screenshot, changed tree, expired external result, forged executor
approval, unavailable signer, and valid current evidence tests pass.

### Step 4: Derive PASS and one authoritative failure route

PASS exists only when every required deterministic result and attestation is
current and passing on the same final tree/contract. Persist one final receipt
and transition atomically. A concrete FAIL always wins over any PASS/score.

Map failure class deterministically:

| Failure class | Owner/route |
|---|---|
| implementation or slice gate | same plan/slice repair |
| incomplete/contradictory requirement or flow | Brainstorm/Finalize |
| changed user decision | Record Decision, then re-Finalize |
| missing documentary fact | Research |
| unresolved empirical fact | Prototype |
| coverage/DAG/oracle/plan defect | Plan |
| verifier or ground-truth defect | Remediate verifier; freeze acceptance |
| human/external requirement | named operator/issuer |

The model may explain this route but cannot override it. Generate the next
native GOAL prompt from state. Append only a new finding/evidence event inside
the existing transaction journal.

**Verify**: `cargo test -p tailrocks-core convergence::routing` → exit 0; every
failure enum maps to exactly one owner and unknown/multiple-owner input fails
closed.

### Step 5: Apply a PASS candidate by explicit compare-and-swap

PASS proves a controller-owned final candidate; it does not silently rewrite the
operator branch. Add `tailrocks goal apply --run <id> --target <feature-branch>
--expected <sha>`. Preflight clean target state, exact expected ref, final receipt,
and target-not-main policy. Import objects and fast-forward with ref CAS; never
reset a worktree, overwrite local changes, push, or merge remotely.

If target moved, PASS remains valid for its subject but apply fails with an exact
rebase/reverify route. If target already equals the candidate, apply is
idempotent.

**Verify**: `cargo test -p tailrocks-core convergence::apply` → exit 0; clean
fast-forward, already-applied, dirty worktree, main target, moved ref, non-FF,
and missing-object cases pass without destructive mutation.

### Step 6: Separate PASS from explicit retirement

Define `PASS -> RETIRING -> RETIRED`. Native `/goal` may stop at PASS. An
operator later runs `tailrocks plan retire <slug> --dry-run`, reviews exact
writes/deletion, then explicitly runs `--apply`.

Preflight requires applied final tree, current PASS, no active claim, exact
`plans/<slug>/` target, clean non-main feature branch, and expected-ref CAS.
Build before deletion:

- human-readable final spec under `specs/<slug>/`;
- `roadmap/<slug>/completion.json` bound to READY, final Git tree, final receipt,
  verifier/trust versions, and durable spec/archive digests;
- deterministic archive of exact active package bytes at
  `archives/plans/sha256/<digest>.tar.zst`.

Validate archive by extraction into a temp directory and byte comparison. Then
delete only `plans/<slug>/`, update roadmap/index links, run post-retirement
gates, and create one local Conventional Commit by CAS. A failure before CAS
leaves operator branch unchanged. A failure after PASS leaves state PASS plus
`retirement_pending`; it never revokes successful goal completion.

**Verify**: `cargo test -p tailrocks-core retirement` → exit 0; failure injection
at every phase, wrong/broad/symlink target, archive mismatch, moved ref, squash-
history fixture, retry/idempotency, and PASS-survives-failure tests pass.

### Step 7: Define restore/reopen without resurrecting stale truth

`tailrocks plan restore --archive <digest> --to <temp-path>` is forensic/read-
only by default and verifies the archive digest. It does not reactivate a plan.

Record Decision on a retired item preserves old spec/completion/archive, appends
the new decision, makes prior completion stale, and routes to SHAPING. After new
READY, Plan creates a new package generation from current sources/spec; it never
copies stale statuses/receipts as current.

Update Reconcile to delegate machine truth to `tailrocks goal reconcile` and
retain its manual recovery/audit role. Update artifact evals and the worked
example through full PASS, apply, retire, restore-inspect, reopen, and replan.

**Verify**: `mise run validate && bun test scripts/ && cargo test --workspace --all-features` → all exit 0; worked example has no dangling active-plan link after retirement.

## Test plan

- Exact final-tree deterministic rerun and evidence invalidation.
- Conditional fresh review contexts; separate conjunctive axes; no voting.
- Visual/human/external subject/freshness/trust binding.
- Exhaustive one-owner failure routing and verifier-defect freeze.
- PASS/apply CAS safety and non-main/dirty/non-FF guards.
- Explicit retirement preview/apply, phase failures, exact deletion target,
  deterministic archive recovery after branch history loss.
- PASS survives retirement failure; retirement retry is idempotent.
- Full retire/reopen/replan generation lifecycle.

## Done criteria

- [ ] Final reconcile is automatic on nominal completion and exact-tree bound.
- [ ] Review axes remain distinct; fresh sessions run only where required.
- [ ] One failed criterion blocks; no score/majority override exists.
- [ ] Every failure class has exactly one state-derived owner.
- [ ] PASS, branch apply, and retirement are separate explicit states/actions.
- [ ] Retirement removes only active package after spec/completion/archive proof.
- [ ] Archive recovery works in a fresh clone without feature-branch history.
- [ ] Full Rust/skill/eval/example/diff gates pass.

## STOP conditions

Stop if final checks do not share one exact subject, a reviewer can mutate proof
inputs, an axis needs subjective averaging, failure ownership is ambiguous,
apply requires destructive reset/non-FF branch mutation, retirement target is
not exact, or archive/spec/completion cannot be validated before deletion.

## Maintenance notes

Review policy is contract data, not a fixed reviewer count. New effect classes
need enforceable observation/sandboxing before they can become autonomous.
