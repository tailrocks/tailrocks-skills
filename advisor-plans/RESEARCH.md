# Research Synthesis — Predictable Agent Delivery

Fifth adversarial pass, 2026-08-10, against design baseline `9af83c2` (the
fourth pass). The fifth-pass record is the section directly below; everything
from "Outcome and proof boundary" onward is the retained fourth-pass record —
its repository-defect evidence stands, its architecture is superseded where
the fifth pass says so. Context7 MCP remains unavailable; volatile provider
claims use official documentation and local CLI discovery, dated.

## Fifth adversarial pass

Method: independent reconstruction of the user goal from primary evidence,
line-verification of every repository claim the fourth pass anchored to, then
per-mechanism falsification of the fourth-pass architecture. New evidence not
available to earlier passes: the user's explicit directive — *"Simplify it as
much as we can, don't overengineer it, but achieve the goal of making
predictable planning which gives a predictable AI result."* That directive
restates the objective function; it does not waive correctness.

Re-verified and confirmed from the working tree this pass:

- `goal-handoff.md` success blocks still end `Or stop after <N> turns.`;
  the "Always bounded" rule mandates that shape. (F4-13 stands.)
- `run-evals.ts` judges `subject.text`, flattens fixture paths by basename,
  deletes every workspace in `finally`, and exits on `passed > runs / 2`.
- `validate-skills.ts:293` prints `Validated ${entries.length} skills.` — the
  third-pass PR comment's claim that the string is `Validated 15 skill(s).`
  is false against the tree.
- `tailrocks-reconcile/SKILL.md:29-50` already holds "executor claims are
  untrusted; DONE means criteria pass now."
- PR #6 `validate` is red: the live latest-stable gate reports 3 stale
  TanStack template packages (upstream drift after `b629fb9`) — a branch
  defect outside advisor write scope, reported not hidden.

### Findings

#### F5-01 — CRITICAL — The architecture's threat model has no user anchor

- **Evidence**: F4-45 asserts "The user requires the complete implementation
  in one branch, one PR, and one merge" with no file/commit/message anchor;
  PR #6's own body says "one branch or PR per plan"; the user's current
  directive says simplify. COVERAGE.md at `9af83c2` binds 30+ of 46 plans to
  release/protected/supply-chain guardrails (N19 alone lists 19 plans).
- **Impact**: ~85% of the corpus (release lanes, protected workflows, signed
  envelopes, OS principals, OCI evidence chains) defends claims made to third
  parties that no user requirement asked anyone to make.
- **Root cause**: unbounded threat-model recursion — each pass's "cold
  security review" attacked machinery the previous pass invented (F4-31
  through F4-50 all cite fourth-pass drafts as their own evidence), and no
  pass was permitted to question whether the defended component served the
  goal.
- **Resolution**: reconstruct the goal from primary evidence; retain only
  components whose invariant the goal requires. Chosen architecture in
  README.md.
- **Confidence**: HIGH. **Attribution**: introduced `f2e079f`-`9af83c2`,
  compounding.

#### F5-02 — CRITICAL — The corpus violates the repository contract it cites

- **Evidence**: `AGENTS.md` — "Token usage is a design criterion… never
  produce an artifact that will not be read." `skills/tailrocks-plan/SKILL.md:83-99`
  requires vertical one-session zero-context plans. At `9af83c2` the corpus
  is 46 plans / 14,263 lines; plan 018 is 818 lines, plan 023 is 623; 36
  plans embed `<implementation-branch>`/`<integration-sha>` placeholders that
  must be "recut" by a kickoff ritual before any precondition can run.
- **Impact**: no executor session can hold the corpus; the placeholder ritual
  makes every plan non-executable as written — the package maximizes the
  unpredictability it exists to remove. This is a correctness failure against
  the goal, not a cost complaint.
- **Root cause**: architecture dossiers styled as plans (the same defect
  F4-23 diagnosed, reproduced at 4× scale by the pass that diagnosed it).
- **Resolution**: 4 plans, 2 edges, zero placeholders, every precondition
  runnable verbatim.
- **Confidence**: HIGH. **Attribution**: introduced `9af83c2`.

#### F5-03 — CRITICAL — The privileged controller is the root enabling condition

- **Evidence**: dependency chain in fourth-pass RESEARCH: controller verdict
  must outlive the session → F4-01 demands OCI confinement → confinement
  needs a distributed verifier → F4-24/F4-31 demand GHCR/provenance →
  released trust needs protected workflows → F4-34/F4-38/F4-46 demand token
  scoping and Ed25519 envelopes → F4-50 demands OS principals.
- **Impact**: five layers of machinery, each existing to defend the layer
  above it; removing the root removes all five with zero loss of the goal
  invariant.
- **Root cause**: the acceptance verdict was modeled as a durable artifact
  that must survive a hostile executor, when the goal needs a *reproducible
  decision* any session can recompute. A verdict that is a deterministic
  function of the committed tree needs no custody chain — rerun it.
- **Resolution**: per-package `goal-check.sh` (Plan 002): the verdict is
  recomputed, never stored, never trusted across sessions. Gate execution
  trust is the client harness sandbox — the same boundary every dev command
  already crosses; a second boundary enforced nothing (label:
  `deterministic_local`, honestly non-adversarial).
- **Baseline correction (2026-08-12)**: a generated file cannot contain the
  SHA of the commit that contains it because Git hashes file contents into the
  commit identity. The package therefore stores a fingerprint in mutable
  `README.md`, computed from sorted path/blob-ID pairs for every other package
  file. This removes the hash cycle while making changes to GOAL.md, plans, or
  the checker itself deterministically visible.
- **Confidence**: HIGH. **Attribution**: introduced `f2e079f`, maximal at
  `9af83c2`.

#### F5-04 — MEDIUM — Coverage authority contradicts itself

- **Evidence**: `9af83c2:advisor-plans/COVERAGE.md:168` "46 numbered plans
  and 54 hard edges"; `:180` "All 53 dependencies are reciprocal". Manual
  count of the edge list is 54.
- **Impact**: the document claiming byte-for-byte bidirectional proof fails
  its own consistency bar — symptomatic of a corpus past maintainable scale.
- **Resolution**: fifth-pass COVERAGE has 2 edges, countable by eye.
- **Confidence**: HIGH. **Attribution**: introduced `9af83c2`.

#### F5-05 — LOW — Meta-claims drifted from the tree

- **Evidence**: PR #6 third-pass comment claims the precondition string was
  fixed to `Validated 15 skill(s).`; `validate-skills.ts:293` prints
  `Validated 15 skills.` (the plans were right, the comment wrong). PR body
  still describes ten plans and all-green checks while `validate` is red.
- **Impact**: reviewers reading PR metadata get a false inventory.
- **Resolution**: recorded here and in README handoff; PR metadata is outside
  advisor write scope.
- **Confidence**: HIGH. **Attribution**: accumulated; pre-existing (F4-17)
  and still true after `9af83c2`.

#### F5-06 — HIGH — The two real, user-facing defects (confirmed, pre-existing)

- **Evidence**: budget-as-success in `goal-handoff.md:109-115,132-134,187-189`;
  transcript-graded majority-pass workspace-deleting evals in
  `run-evals.ts:72-140`.
- **Impact**: these are the only defects in the whole record with direct
  user-goal impact — false completion and unmeasured skill behavior.
- **Resolution**: Plans 000 and 001 fix exactly these; they survive from the
  earlier passes essentially intact (000 de-ritualized, 001 rescoped).
- **Confidence**: HIGH. **Attribution**: pre-existing repository defects.

#### F5-07 — MEDIUM — Second-worktree verification was a false-safety trade

- **Evidence**: fourth-pass verification runs candidates in a second clean
  worktree/clone; house gates (`bun run test`, `cargo` suites) require
  installed dependency state a cold worktree lacks.
- **Impact**: cold-tree gate runs would fail on missing dependencies —
  false BLOCKED — or force dependency provisioning machinery (the fourth
  pass's read-only store) to exist at all.
- **Root cause**: "frozen evidence" was equated with "separate directory".
  The invariant is *evidence = committed tree*, which a clean-status check
  establishes in place.
- **Resolution**: `goal-check.sh` requires `git status --porcelain` empty and
  runs gates in place; dirty tree is BLOCKED before any gate runs.
- **Confidence**: MED-HIGH. **Attribution**: introduced `f2e079f`.

#### F5-08 — HIGH — Distribution dissolves structurally

- **Evidence**: fourth-pass plans 009/018/030/033/039-042 exist to ship a
  verifier binary/image; `AGENTS.md` and `INSTALL.md` show the plugin channel
  already delivers `skills/<name>/templates/**` to every supported client.
- **Impact**: a POSIX-sh check template generated into each plan package
  reaches every target project with zero new channels, so the entire
  release/supply-chain problem space never comes into existence.
- **Resolution**: Plan 002 ships `goal-check.sh` as a tailrocks-plan
  template.
- **Confidence**: HIGH. **Attribution**: fifth-pass design decision.

### Disposition of previously defended simplifications

The third pass recorded six simplifications as "failed adversarial defense".
Each verdict is re-examined under the corrected objective; none is restored
as it was rejected — the components they defended are dissolved, which is a
different move with new evidence:

| Rejected simplification | Fifth-pass disposition |
|---|---|
| Demote slice receipts | Receipts removed entirely: final-tree rerun (the fourth pass's own rule) is the acceptance authority; resume = rerun. |
| Move oracle negative controls into kernel suite | Preserved at correct scale: Plan 001's failing-run retention and Plan 002's failing-gate/tamper fixtures are the negative controls. |
| JSONL source store | Source store deferred wholly — no repository defect anchored it; prose pipeline owns intent today. |
| Drop retirement archives | Dropped with retirement itself — proof persistence beyond Git served third-party trust nobody required. |
| Drop journal replay-equality | Journal removed; nothing to replay. |
| Prune hostile-Git fixture matrix | Pruned to the one realistic case: tampered plan/GOAL bytes → `BLOCKED plan-drift`. |

### Before/after

| Measure | Fourth pass (`9af83c2`) | Fifth pass |
|---|---|---|
| Plan files / lines | 46 / 14,263 | 4 / ~700 |
| Hard dependency edges | 54 (self-reported 53) | 2 |
| Canonical authorities | 6 | 4 (frozen-package fingerprint, git identities, gate exit codes, verdict line) |
| Trust labels | 6 labels + 3 tiers | 3 labels |
| Placeholders requiring ritual | 36 files | 0 |
| New runtimes/channels | Rust controller, OCI verifier, GHCR, protected workflows, Ed25519, OS principals | one sh template + one TS test file |
| Pre-existing defects fixed | 000/001 equivalents present but kickoff-blocked | 000/001 executable today |

### What survives from earlier passes

Gate-first acceptance semantics; budget exhaustion as BLOCKED; "executor
claims are untrusted" (already the reconcile rule); artifact-grounded eval
grading; honest, dated, per-client capability claims (including the Grok
correction); oracle tamper-evidence; the principle that hashes/samples/
attestations are never semantic completeness. These are the load-bearing
ideas; the fifth pass keeps them and removes their scaffolding.

## Outcome and proof boundary

The user wants preserved intent, complete plans, bounded native-goal execution,
resume, independent checking, exact backtracking, safe retirement, and evidence
that measures real behavior. The enforceable acceptance function is narrower
than deterministic agent behavior:

```text
PASS(frozen evidence) =
    sealed contract current
AND exact final Git subject current
AND every requirement-discharge gate rerun and passing
AND every declared attestation current and passing
AND full final delta authorized
AND receipt issuer mode is explicitly accepted by the contract
```

This function is deterministic only for deterministic evaluators and frozen
inputs. Model/human/external judgments remain attestations. Hashes prove byte
identity, not semantic completeness. Samples estimate rates, never invariants.

## Primary repository evidence

- `scripts/run-evals.ts:72-76` flattens fixture destinations by basename.
- `scripts/run-evals.ts:90-130` grades `subject.text`, not retained artifacts.
- `scripts/run-evals.ts:132-140` deletes the workspace and accepts a majority.
- `skills/tailrocks-plan/references/goal-handoff.md:109-115` makes budget
  exhaustion an `OR` branch of success; `:174-188` otherwise treats exhausted
  budget as stopping.
- `skills/tailrocks-plan/references/goal-handoff.md:60-79` lets the executor
  update DONE and terminate from its own status/gate narrative.
- `skills/tailrocks-plan/SKILL.md:83-99` requires vertical, independently useful,
  one-session plans; several advisor plans still organize horizontal layers.
- `skills/tailrocks-plan/references/plan-template.md:1-181` requires inlined
  contracts, exact starting state, inputs, per-step commands, and STOP rules.
- `.github/workflows/validate.yml` runs repository-controlled validators/tests
  plus a live package-freshness query; it is not an independent verifier.

## Current provider evidence

- Local Codex is `codex-cli 0.147.0`; `goals` and `hooks` are stable/enabled.
  `codex --help` says `--strict-config` rejects unknown fields; it does not
  isolate the base config. Profiles layer on `$CODEX_HOME` base config.
- [Codex `/goal`](https://learn.chatgpt.com/use-cases/follow-goals) is a durable
  objective whose model decides when the condition appears satisfied.
- [Codex hooks](https://learn.chatgpt.com/docs/hooks) merge hook sources; Stop
  hooks can continue a goal, but hooks are a guardrail rather than a complete
  enforcement boundary. Managed-only hooks require managed requirements.
- Local Grok is `1.0.0`. Official
  [Grok commands](https://docs.x.ai/build/modes-and-commands) document `/plan`
  and `/loop`, not a built-in `/goal`.
- Local Claude Code is `2.1.226`.
  [Claude `/goal`](https://code.claude.com/docs/en/goal) evaluates from the
  transcript rather than independently reading files/running gates;
  [Claude hooks](https://code.claude.com/docs/en/hooks-guide) have provider-
  specific Stop-loop limits.
- Local Docker client/server is `29.4.0` on a Linux/arm64 OrbStack VM. That
  establishes backend availability, not confinement; plan 002 requires live
  non-root, mount, egress, process, memory, and CPU canaries.

Provider facts justify Codex-first live qualification. They do not establish
cross-provider equivalence or deterministic completion.

## Fourth-pass findings

Evidence below cites the pre-pass tree at commit `1e809bd`; attribution is
therefore stable even after these plans change.

### F4-01 — CRITICAL — Gate confinement was declared, not implemented

- **Evidence**: `1e809bd:advisor-plans/003-codex-acceptance-tracer.md:199-220`;
  `006-compiled-package-runtime.md:144-180`.
- **Impact**: candidate tests/build scripts/postinstall code could read/write
  host paths or use network while the plan still claimed confined verification.
- **Root cause**: clean clone, sanitized environment, and provider sandbox were
  substituted for an OS boundary around controller-launched child processes.
- **Alternatives/trade-offs**: current reuse is simple but false; minimal design
  labels gates unsandboxed; formal design uses a microVM; balanced design uses a
  pinned non-root OCI verifier with live hostile canaries.
- **Resolution**: balanced. Plan 002 proves a pinned, non-root OCI backend before
  plan 003; no supported backend means arbitrary autonomous gates remain
  blocked. Docker documents that containers have no resource limits by default
  and that rootless cgroup flags can be ignored without cgroup v2/systemd:
  [resource constraints](https://docs.docker.com/engine/containers/resource_constraints/),
  [rootless limits](https://docs.docker.com/engine/security/rootless/tips/).
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`; retained by `1e809bd`.

### F4-02 — CRITICAL — PR-head code certified itself as “strong”

- **Evidence**: `1e809bd:advisor-plans/008-artifact-evals-and-ci.md:169-179`.
- **Impact**: a PR could alter verifier, workflow, fixtures, and ground truth,
  then mint the receipt that supposedly judged it independently.
- **Root cause**: separate infrastructure was confused with separate authority.
- **Alternatives/trade-offs**: current lane catches accidents; minimal relabels
  it; formal uses an external attestation service; balanced uses a pinned
  released verifier with operator-owned policy/oracles and candidate-as-data.
- **Resolution**: PR CI is `pr_head_self_checked`. Plans 018/019/021 separately
  release exact protected-default artifacts, bootstrap operator policy, and
  verify one later candidate as data.
- **Confidence**: HIGH.
- **Attribution**: introduced `1e809bd`.

### F4-03 — CRITICAL — Advisory hook enabled mutable command injection

- **Evidence**: `1e809bd:advisor-plans/000-interim-prose-hardening.md:71-81`;
  mutable GOAL commands at `goal-handoff.md:109-139`.
- **Impact**: repository/model-writable Markdown could choose host commands run
  by an operator-configured Stop hook.
- **Root cause**: a weak trust label was treated as permission for unsafe command
  provenance.
- **Alternatives/trade-offs**: fixed operator argv is safe but cannot understand
  arbitrary prose; kernel checkpoint is safe later; omission is safest now.
- **Resolution**: remove the advisory executable hook. Plan 000 changes prose
  only.
- **Confidence**: HIGH.
- **Attribution**: introduced `1e809bd`.

### F4-04 — CRITICAL — Historical slice receipts could mask final regression

- **Evidence**: `1e809bd:advisor-plans/006-compiled-package-runtime.md:255-266`;
  `007-convergence-and-retirement.md:122-128`.
- **Impact**: a later authorized change can break an earlier requirement while
  ancestry and package-final-only gates still pass.
- **Root cause**: ancestry proves history, not current behavior.
- **Alternatives/trade-offs**: current avoids reruns; minimal reruns all gates;
  formal proves noninterference; balanced keeps slice rows for resume/audit and
  reruns every requirement-discharge gate at final.
- **Resolution**: balanced; one final receipt only.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`, defended in `1e809bd`.

### F4-05 — HIGH — Immutable capture could permanently commit secrets

- **Evidence**: `1e809bd:advisor-plans/004-intent-ready-contract.md:116-139`;
  `1e809bd:advisor-plans/004-intent-ready-contract.md:156-181`.
- **Impact**: a pasted credential or sensitive attachment could enter Git before
  redaction metadata existed.
- **Root cause**: capture-before-synthesis omitted classify-before-storage.
- **Alternatives/trade-offs**: refuse all risky input loses provenance; encrypted
  KMS storage is stronger but new infrastructure; balanced stores only approved
  non-sensitive/redacted bytes or an access-controlled reference.
- **Resolution**: sensitivity decision precedes repository write; credential
  values are never persisted and trigger rotation guidance.
- **Confidence**: HIGH.
- **Attribution**: raw store introduced `f2e079f`; reference fidelity in
  `1e809bd` did not solve sensitivity.

### F4-06 — HIGH — Codex configuration evidence was not isolated

- **Evidence**: `1e809bd:advisor-plans/002-codex-goal-feasibility.md:144-147`;
  local `codex 0.147.0 --help` definition of `--strict-config`.
- **Impact**: user/plugin hooks and config could influence supposedly controlled
  evidence.
- **Root cause**: strict schema parsing was mistaken for configuration isolation.
- **Alternatives/trade-offs**: managed-only hooks are strongest but not generally
  available; an isolated `$CODEX_HOME` is testable; ordinary profile layering is
  insufficient.
- **Resolution**: plan 032 creates a fresh `$CODEX_HOME`, captures effective
  hooks/config, and records containment and Stop control as separate axes.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`.

### F4-07 — HIGH — No-binary fallback created a second canonical writer

- **Evidence**: `1e809bd:advisor-plans/004-intent-ready-contract.md:168-176`.
- **Impact**: prose agents would emulate atomic/CAS semantics manually; later
  validation cannot recover lost or torn source.
- **Root cause**: migration availability was patched by duplicating authority.
- **Alternatives/trade-offs**: per-client writers multiply drift; blocking all
  users regresses service; balanced leaves the existing legacy path functional
  but explicitly noncanonical until the CLI exists.
- **Resolution**: absent binary means `advisory_prose`; it never emits canonical
  records/READY/runtime contracts.
- **Confidence**: HIGH.
- **Attribution**: introduced `1e809bd`.

### F4-08 — HIGH — Compiler claimed semantic facts and lacked oracle ownership

- **Evidence**: `1e809bd:advisor-plans/006-compiled-package-runtime.md:122-142`;
  `1e809bd:advisor-plans/006-compiled-package-runtime.md:182-209`; Plan is
  source-read-only at `skills/tailrocks-plan/SKILL.md:24-28`.
- **Impact**: a parser could not prove that prose is vertical/complete; tests
  authored by the executor could silently become protected expected truth.
- **Root cause**: structured validation, semantic attestation, and oracle
  provenance were collapsed.
- **Alternatives/trade-offs**: free-form Markdown parsing is flexible but
  ambiguous; fully formal specs exceed the goal; balanced makes typed draft the
  compiler input, generates Markdown, and assigns protected oracle adoption to
  the operator/planner before execution.
- **Resolution**: Rust validates structure only. Semantic quality is a labeled
  review. Executor tests remain candidate evidence until independently adopted.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`.

### F4-09 — HIGH — Hash claim exceeded controllable context

- **Evidence**: `1e809bd:advisor-plans/README.md:154-160`;
  `1e809bd:advisor-plans/003-codex-acceptance-tracer.md:245-247`.
- **Impact**: hidden provider prompts/tool schemas/dynamic results could change
  while receipt claimed every model-visible byte was frozen.
- **Root cause**: controlled payload identity was confused with complete context.
- **Alternatives/trade-offs**: provider-signed full traces would be strongest but
  unavailable; balanced narrows the claim and records exposed identities.
- **Resolution**: hash Tailrocks-controlled payload only; label ambient/provider
  context unbound.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`.

### F4-10 — HIGH — Shared writable cache crossed candidate subjects

- **Evidence**: `1e809bd:advisor-plans/006-compiled-package-runtime.md:271-284`.
- **Impact**: candidate build code could poison artifacts reused for another
  tree sharing toolchain/lockfile.
- **Root cause**: controller-owned path was mistaken for controller-authored
  bytes.
- **Alternatives/trade-offs**: cold execution is slower but correct; signed
  reproducible caches are strongest; balanced starts with immutable dependency
  sources and per-candidate writable overlays.
- **Resolution**: remove shared writable cache from V1.
- **Confidence**: HIGH.
- **Attribution**: introduced `1e809bd`.

### F4-11 — HIGH — Branch apply confused ref CAS with worktree safety

- **Evidence**: `1e809bd:advisor-plans/007-convergence-and-retirement.md:213-257`.
- **Impact**: directly moving a checked-out ref leaves index/worktree stale or
  dirty; retirement repeated the defect.
- **Root cause**: atomic ref update does not update checked-out state.
- **Alternatives/trade-offs**: require bare refs; use a dedicated integration
  worktree; balanced handles checked-out targets with guarded `merge --ff-only`
  and unchecked refs with `update-ref` CAS.
- **Resolution**: balanced with separate hostile fixtures.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`.

### F4-12 — MEDIUM — Tar archive added unsafe extraction and duplicate truth

- **Evidence**: `1e809bd:advisor-plans/007-convergence-and-retirement.md:229-274`.
- **Impact**: hostile members create extraction risk; copied `specs/`, archive,
  and completion views can disagree.
- **Root cause**: compression was treated as durability.
- **Alternatives/trade-offs**: history alone loses squash-only intermediate
  trees; custom blob manifests work but add protocol; plain Git move preserves
  exact readable bytes with existing Git safety.
- **Resolution**: atomically move the readable package and add immutable receipt,
  sanitized evidence closure, and exact-tree Git bundle under
  `archives/plans/<slug>/<generation>/`; completion points to that subtree.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`, retained `1e809bd`.

### F4-13 — HIGH — Budget exhaustion remained a success predicate

- **Evidence**: `skills/tailrocks-plan/references/goal-handoff.md:109-115`,
  `skills/tailrocks-plan/references/goal-handoff.md:132-134`, and
  `skills/tailrocks-plan/references/goal-handoff.md:174-188`; omission in
  `1e809bd:advisor-plans/000-interim-prose-hardening.md:56-66`.
- **Impact**: the goal can satisfy its logical `OR` after N turns with red gates.
- **Root cause**: liveness and acceptance share one Boolean condition.
- **Alternatives/trade-offs**: all correct designs separate them.
- **Resolution**: plan 000 makes only verified success satisfy the goal;
  exhaustion produces explicit BLOCKED.
- **Confidence**: HIGH.
- **Attribution**: pre-existing defect; remediation omission introduced
  `1e809bd`.

### F4-14 — HIGH — Coverage and dispatch readiness were not provable

- **Evidence**: `1e809bd:advisor-plans/README.md:107-150`;
  `1e809bd:advisor-plans/RESEARCH.md:160-180`; missing `Covers`/inlined contract
  in most plan files.
- **Impact**: no reverse mapping could prove full goal coverage or reject orphan
  machinery; downstream plans used stale imagined symbols.
- **Root cause**: architecture dossiers were presented as zero-context handoffs.
- **Alternatives/trade-offs**: mark everything draft, or add a stable ledger and
  fail-closed dependency preconditions. Balanced does both where appropriate.
- **Resolution**: add `COVERAGE.md`; plans name coverage/guardrails; dependent
  rows stay BLOCKED until observable dependency evidence exists and planned-at
  SHA is refreshed.
- **Confidence**: HIGH.
- **Attribution**: branch-introduced.

### F4-15 — HIGH — Trust ordering and compound failure routing were undefined

- **Evidence**: `1e809bd:advisor-plans/RESEARCH.md:14-22`;
  `1e809bd:advisor-plans/007-convergence-and-retirement.md:185-211`.
- **Impact**: incomparable provider/verifier/attestation labels could be ordered
  arbitrarily; multiple simultaneous root failures had no route.
- **Root cause**: heterogeneous evidence modeled as a scalar and one enum.
- **Alternatives/trade-offs**: a formal lattice is exact but unnecessary;
  balanced uses exact accepted sets and a failure set with causal precedence.
- **Resolution**: contract set-membership; retain all failures, route the
  earliest causal root, suspend dependents, ask operator only for incomparable
  roots.
- **Confidence**: HIGH.
- **Attribution**: branch-introduced.

### F4-16 — MEDIUM — Third pass left internal contradictions

- **Evidence**: `1e809bd:advisor-plans/005-empirical-prototype.md:173-181` says
  no bump while `1e809bd:advisor-plans/009-codex-distribution.md:34-35` expects
  `0.12.0`; `1e809bd:advisor-plans/006-compiled-package-runtime.md:341-342`
  still names removed selective invalidation; provider equivalence omits
  `NEXT`.
- **Impact**: a cold executor can restore rejected mechanisms or qualify an
  adapter unable to advance slices.
- **Root cause**: prose edits lacked consistency checks.
- **Alternatives/trade-offs**: manual reread is fragile; generated checks are
  exact for IDs/edges/terms but cannot prove semantics.
- **Resolution**: remove stale claims; validate DAG/coverage/forbidden terms;
  add `NEXT` to conformance.
- **Confidence**: HIGH.
- **Attribution**: contradictions survived `1e809bd`.

### F4-17 — MEDIUM — PR metadata no longer describes the branch

- **Evidence**: PR #6 body at 2026-08-10 says ten plans/two commits and reports
  all gates passing. Its remote baseline actually has four commits and eleven
  numbered plans; this pass defines 32. `validate` is red, no review exists,
  the pre-pass head `1e809bd` lacks the required Codex co-author trailer, and
  commit `b629fb9` is unrelated TanStack template work. The only PR discussion
  still advertises the removed advisory hook and enqueue/poll design.
- **Impact**: reviewers could approve from a false change inventory and stale
  verification statement.
- **Root cause**: plan iterations updated repository artifacts but never trued up
  the PR description against current diff/check state.
- **Alternatives/trade-offs**: silently edit external PR state (outside this
  audit's write scope), or report the mismatch and require the PR owner to
  refresh it. The latter preserves scope and authority.
- **Resolution**: record the mismatch here and in handoff; do not claim the PR
  description or unrelated source change was repaired.
- **Confidence**: HIGH.
- **Attribution**: accumulated after the first advisor commit.

### F4-18 — CRITICAL — Native checkpoint confused a command with a capability

- **Evidence**: `1e809bd:advisor-plans/003-codex-acceptance-tracer.md:168-170,
  222-239`; controller SQLite/Docker live outside the executor sandbox.
- **Impact**: checkpoint either cannot reach privileged resources or gives the
  model a general path to them; provider tool sandboxing does not create a
  narrow controller authority.
- **Root cause**: CLI/API naming was treated as privilege separation.
- **Resolution**: a controller-owned run-scoped broker exposes exactly three
  schema-closed, bounded, zero-path methods: submit/checkpoint/status. It chooses
  workspace/argv/state/Docker and offers no attest/apply/retire/admin surface.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`; unresolved at `1e809bd`.

### F4-19 — CRITICAL — Read-only protected oracle was still visible to candidate code

- **Evidence**: `1e809bd:advisor-plans/006-compiled-package-runtime.md:182-208`
  freezes protected reference files but defines no separate candidate/comparator
  namespace; dependency/reference mounts are described at `:154-164`.
- **Impact**: a malicious candidate can read expected answers and overfit while
  a read-only mount appears “protected.” Even after unmounting expectations, a
  repeatable pass/fail result is an adaptive comparison channel that may leak
  low-entropy truth across retries.
- **Root cause**: integrity/namespace separation was confused with
  confidentiality.
- **Resolution**: candidate workers receive only inputs and bounded outputs. A
  trusted comparator outside their namespace receives independently owned
  expectations and executes no candidate code. V1 labels every black-box gate
  `integrity_only`, enforces one cumulative contract query budget, and makes no
  secrecy claim. Confidential-oracle requirements are unsupported external
  gates and cannot mint autonomous PASS.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`.

### F4-20 — CRITICAL — Retirement did not preserve the proof dependency closure

- **Evidence**: `1e809bd:advisor-plans/007-convergence-and-retirement.md:239-253`
  archives package bytes while receipt-referenced evidence remains external;
  exact feature trees can disappear after squash/ref deletion/object pruning.
- **Impact**: a fresh clone may retain a receipt yet be unable to reconstruct
  its subject or validate referenced evidence.
- **Root cause**: readable package durability was mistaken for proof closure.
- **Resolution**: retirement stores readable package, immutable receipt, every
  referenced sanitized evidence blob, and a standalone Git bundle whose tree is
  the exact final subject. RETIRED requires protected-subtree confirmation.
- **Confidence**: HIGH.
- **Attribution**: archive behavior introduced `f2e079f`.

### F4-21 — HIGH — Operational Git metadata made deterministic receipt identity impossible

- **Evidence**: `1e809bd:advisor-plans/003-codex-acceptance-tracer.md:182-190,
  211-214` uses `commit-tree`, binds candidate commit, but freezes no author,
  committer, message, timestamp, timezone, or signing policy.
- **Impact**: identical executor bytes can produce different commits/receipts,
  contradicting stable-byte and scripted/native equivalence claims.
- **Root cause**: acceptance subject and apply carrier were one identifier.
- **Resolution**: receipt identity is base commit + exact final tree + complete
  delta and frozen evidence. Operational carrier commit metadata is journal/apply
  data; it cannot alter receipt bytes. Synthetic archive carriers freeze metadata.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`.

### F4-22 — CRITICAL — Autonomous support exceeded the same-user host boundary

- **Evidence**: `1e809bd:advisor-plans/README.md:59-75` and
  `002-codex-goal-feasibility.md:211-217` admit other same-user paths remain
  readable while later tiers advertised autonomous containment.
- **Impact**: unrelated credentials/controller data on an operator host could be
  read even when repository writes, tools, and egress were restricted.
- **Root cause**: write/tool confinement was generalized into read isolation.
- **Resolution**: record `host_read_isolation` independently. TIER 1/2 requires
  a dedicated OS principal, container/read namespace, or equivalent allowlisted
  mounts; ordinary same-user mode remains `local_non_adversarial` only.
- **Confidence**: HIGH.
- **Attribution**: limitation acknowledged but not enforced at `1e809bd`.

### F4-23 — HIGH — Architecture dossiers were not one-session dispatch units

- **Evidence**: `1e809bd:advisor-plans/README.md:141-145` explicitly says plans
  003/006/007 exceed one session; old plan 003 declares this at `:105-106` and
  plan 007 at `:98-104`.
- **Impact**: a cold executor must invent resume state, partial ownership, and
  commit boundaries; “TODO” no longer means one green vertical change.
- **Root cause**: horizontal architecture chapters were labeled plans.
- **Resolution**: split source/capture/READY, tracer/transport/runtime,
  convergence/apply/retirement, artifact/readiness/release/policy/proof, and
  Grok/Claude into independent one-session units. Operational units make no
  repository commit.
- **Confidence**: HIGH.
- **Attribution**: branch-wide through `1e809bd`.

### F4-24 — CRITICAL — Distribution omitted the verifier image and exact provenance

- **Evidence**: `1e809bd:advisor-plans/009-codex-distribution.md:93-124` packages
  only CLI binaries; live/default-branch workflow description at `:144-178`
  does not require exact source ref/digest, signer digest, platform-child digest,
  or hosted-runner attestation constraints.
- **Impact**: installed runtime cannot satisfy its pinned OCI prerequisite, and
  default-branch dispatch could accept artifacts from the wrong ref/workflow.
- **Root cause**: CLI delivery and verifier supply-chain identity were separated.
- **Resolution**: release-readiness covers raw CLI targets plus signed
  linux/amd64+linux/arm64 OCI index/children, exact provenance flags, atomic
  install/upgrade/uninstall, digest pull/remove/repull, and distinct protected
  release/bootstrap/later-candidate operations.
- **Confidence**: HIGH.
- **Attribution**: introduced `f2e079f`; still present `1e809bd`.

### F4-25 — HIGH — Hostile input/output had no universal resource envelope

- **Evidence**: `1e809bd:advisor-plans/003-codex-acceptance-tracer.md:182-219`
  enumerates workspace paths and captures process output without file/path/
  workspace/output/evidence caps; Docker has no limits by default.
- **Impact**: path bombs, oversized workspaces, process floods, or output/evidence
  exhaustion can deny service or cross an intended containment boundary.
- **Root cause**: effect allowlists omitted quantitative ingress/egress limits.
- **Resolution**: N16 applies closed path/file/byte/process/time/output/evidence
  caps at source, eval, candidate, broker, comparator, archive, and protected
  workflow boundaries. Overflow kills/fails; truncation never passes.
- **Confidence**: HIGH.
- **Attribution**: branch-wide omission through `1e809bd`.

### F4-26 — HIGH — Provider discovery and terminal verdicts contradicted evidence

- **Evidence**: the fourth-pass draft initially said local Grok exposed no goal
  skill, while sanitized `grok inspect --json` showed `jackin-goal-prompt`
  through two origins plus `tailrocks-plan`; its schema also removed then reused
  `UNSUPPORTED` beside tiers.
- **Impact**: a visible plugin/skill could be misclassified as built-in native
  control, and cold executors could emit a verdict the schema rejected.
- **Root cause**: clean-home/native discovery, effective-host inventory, and
  qualification verdict were collapsed.
- **Resolution**: retain both inventories and exact origins. Terminal verdicts
  are only TIER 0/1/2 or INCONCLUSIVE; current Grok remains TIER 0 unless new
  native lifecycle/isolation evidence proves more.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass drafting defect, corrected before handoff.

### F4-27 — CRITICAL — Protected workflows and run identity had no owner

- **Evidence**: the fourth-pass draft scoped protected workflow filenames in
  plan 009 but gave them no implementation contract; operational drafts called
  `gh workflow run` and then used an undefined `$RUN_ID`.
- **Impact**: a cold operator could watch/download a concurrent wrong run, while
  candidate/default/ref/signer authority remained ambiguous.
- **Root cause**: dispatch acceptance was mistaken for a returned immutable run
  identity, and workflow authority was treated as release packaging detail.
- **Resolution**: plan 022 owns both base workflows and one closed helper. A
  CSPRNG nonce is bound into run-name/context; workflow path/ref/head/event/
  actor/time/nonce must select exactly one run/attempt before watch/download.
  Direct signer `job_workflow_sha`, source `sha`, hosted runner, protected
  environment, output schema, and digest-addressed durability are explicit.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass drafting defect found by cold provider review.

### F4-28 — CRITICAL — Release and evidence closure stopped before distribution

- **Evidence**: early operational drafts left variables/publication commands
  unresolved, stored protected evidence only in expiring Actions artifacts, and
  ended after a post-Codex version bump without a release. They also advanced a
  compatibility verified date before published commands ran.
- **Impact**: exact qualified bytes could differ from published bytes; policy or
  provider evidence could expire; Grok/Claude changes could remain unreleased.
- **Root cause**: build, qualification, immutable publication, policy adoption,
  and post-release verification were collapsed or omitted.
- **Resolution**: plans 017/018 create one whole-stack software release;
  028/039/040 close its two-target Codex evidence. Plans 019/024/021/023 and
  029/041/042 then publish release-bound policy, synthetic-candidate proof,
  provider qualification, and support closures without another version,
  release, verified-date edit, or repository commit. GitHub release
  operations require repository-enforced immutable releases and verify releases
  plus local assets using the documented commands:
  [immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases),
  [release integrity](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/verify-release-integrity).
- **Confidence**: HIGH.
- **Attribution**: fourth-pass drafting defect found by cold provider/DAG review.

### F4-29 — HIGH — Protected proof consumed a candidate nobody produced

- **Evidence**: the fourth-pass draft ordered policy bootstrap directly before a
  “distinct later repository-owned candidate” operation while generally
  forbidding unmerged dependency tips.
- **Impact**: a merged candidate no longer proved untrusted PR bytes were data;
  an unmerged candidate violated dispatch rules and had no immutable handoff.
- **Root cause**: DAG acyclicity was checked without producer/consumer artifact
  closure.
- **Resolution**: plan 024 uses base-owned code at the atomic merge to create a
  hostile detached commit/tree in a new task-local object database, seals a
  standalone Git bundle, and publishes it as digest-addressed untrusted OCI.
  It creates no repository commit, ref, branch, or PR. Plan 021 consumes only
  that synthetic bundle as data and explicitly denies real-PR acquisition proof.
- **Confidence**: HIGH.
- **Attribution**: current uncommitted plan split.

### F4-30 — HIGH — Offline eval/CI work still exceeded one session

- **Evidence**: the first fourth-pass plan 008 combined the stable gate, all 15
  skill migrations, adversarial/mutation infrastructure, stochastic metrics,
  and CI workflow policy while claiming one session.
- **Impact**: its own STOP condition would fire before Done; every release plan
  downstream remained blocked.
- **Root cause**: a horizontal eval program retained one plan number after other
  architecture dossiers were split.
- **Resolution**: plan 008 owns kernel/adversarial gate; 025 and 026 own two
  bounded eval migration batches plus metrics; 027 alone owns honest PR CI.
- **Confidence**: HIGH.
- **Attribution**: broad scope pre-existed at `1e809bd`; explicit one-session
  contradiction was introduced during fourth-pass drafting.

### F4-31 — CRITICAL — Public OCI lifecycle assumed a nonexistent package

- **Evidence**: live GitHub package inventory on 2026-08-10 has no
  `tailrocks-verifier`; GitHub documents that first publication is private and
  GHCR visibility is package-wide. Public container packages allow anonymous
  pulls, and public visibility cannot be reversed to private:
  [package visibility](https://docs.github.com/en/enterprise-cloud@latest/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility),
  [container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
- **Impact**: a release workflow requiring public-before-first-push cannot run;
  tagging a private package cannot make its digest publicly installable.
- **Root cause**: tag lifecycle was substituted for package creation/visibility
  authority.
- **Resolution**: `package_preflight` may create the absent private package and
  then stops. Plan 030 requires explicit irreversible admin confirmation,
  attended UI visibility change, API readback, repository linkage, and an empty-
  `DOCKER_CONFIG` anonymous digest/index/child inspection. Release mode requires
  that public state before build.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass OCI lifecycle defect found by cold provider review.

### F4-32 — CRITICAL — Protected environment authority was referenced, not provisioned

- **Evidence**: early fourth-pass workflows named
  `tailrocks-protected-verifier`, while no plan created/read back its reviewers,
  self-review rule, or deployment branch policy.
- **Impact**: release/policy/candidate jobs could run without the attended
  reviewer boundary their evidence claimed, or every operation could remain
  permanently undispatchable.
- **Root cause**: workflow YAML environment name was treated as external policy
  existence.
- **Resolution**: plan 031 uses the documented environment REST contract to
  create only absent exact state or verify equality: one-to-six immutable
  reviewer IDs, `prevent_self_review=true`, zero wait, protected branches only,
  no V1 secrets. Every dispatch rebinds its configuration digest:
  [deployment environments API](https://docs.github.com/en/rest/deployments/environments?apiVersion=2026-03-10).
- **Confidence**: HIGH.
- **Attribution**: fourth-pass protected-workflow defect found by cold provider review.

### F4-33 — CRITICAL — Immutable-release enforcement was required but unowned

- **Evidence**: release plans require repository-enforced immutable releases,
  but live API readback on 2026-08-10 returns `enabled=false` and the earlier
  DAG had no authorized mutation owner.
- **Impact**: every release operation must stop forever, or a cold operator may
  publish replaceable assets while claiming immutable distribution.
- **Root cause**: a publication precondition was documented as external state
  instead of modeled as an exact authority transition.
- **Resolution**: plan 031 now owns one explicitly authorized enable-if-disabled
  PUT plus independent GET readback, alongside the protected environment admin
  bootstrap. Plans 018/023 recheck immediately before publication. GitHub
  documents the endpoint and required repository Administration permission:
  [immutable releases API](https://docs.github.com/en/rest/repos/repos?apiVersion=2026-03-10#enable-immutable-releases).
- **Confidence**: HIGH.
- **Attribution**: fourth-pass release-closure defect found by cold provider review.

### F4-34 — CRITICAL — Protected workflow token authority was implicit

- **Evidence**: release/bootstrap/candidate workflows need to read the source,
  push GHCR subjects, request OIDC, and write attestations, but the earlier
  plans specified no `permissions:` block.
- **Impact**: read-only defaults make the workflows undispatchable; broad
  defaults or `write-all` silently grant unrelated repository authority.
- **Root cause**: environment review, workflow provenance, and token capability
  were treated as one trust control.
- **Resolution**: plans 009/022 require and fixture-check only `contents: read`,
  `packages: write`, `id-token: write`, and `attestations: write`, with no
  job-level widening or other write scope. Environment approval and closed
  dispatch inputs remain separate gates.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass protected-workflow defect found by cold provider review.

### F4-35 — CRITICAL — Protected-branch authority could drift after bootstrap

- **Evidence**: the earlier plan 031 checked only `branches/main .protected`
  during environment setup; dispatches later rebound the environment but not
  active branch rules. GitHub warns that an environment restricted to protected
  branches permits every branch when no protection rule exists.
- **Impact**: removing or weakening main protection could let an unreviewed
  direct-push workflow run retain the `protected_verifier` label.
- **Root cause**: environment deployment policy and protected Git ref authority
  were collapsed into one stale bootstrap observation.
- **Resolution**: plans 022/031 now require current `.protected=true` plus an
  active repository ruleset targeting the default branch, zero bypass actors,
  and `pull_request`, `deletion`, and `non_fast_forward` rules. Every dispatch
  binds the complete current ruleset digest; plan 031 does not mutate it.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass protected-authority drift defect found by cold
  provider review.

### F4-36 — CRITICAL — Release publication did not bind tag immutability

- **Evidence**: early fourth-pass release operations pushed a tag, promoted OCI,
  then created a release without proving current tag rules or re-reading the
  remote target immediately before publication. Immutable-release enforcement
  starts at publication, not during draft asset preparation.
- **Impact**: a concurrently moved/deleted tag could bind qualified assets to
  the wrong immutable release target; post-publication detection is too late.
- **Root cause**: immutable assets were treated as immutable ref authority.
- **Resolution**: plans 022/031 bind the active all-tag ruleset with zero bypass
  actors plus deletion/non-fast-forward protection. Sole-release plan 018
  evaluates the exact proposed tag and reads its full remote SHA after push,
  immediately before release publication, and afterward.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass publication-race defect found by cold provider
  review.

### F4-37 — HIGH — Remote release absence failed open

- **Evidence**: early plans used `gh release view ... 2>/dev/null || true` and
  treated empty output as absence.
- **Impact**: auth/network/API failure could start publication against an
  existing or unknown release.
- **Root cause**: “not found” and “could not query” shared one shell value.
- **Resolution**: plan 034 implements the fixture-tested state helper; it accepts
  only exact remote-tag absence plus release REST 404 and blocks every other
  status/error. Sole-release plan 018 consumes it.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass operational precondition defect.

### F4-38 — CRITICAL — Workflow tokens could not independently read ruleset authority

- **Evidence**: unredacted ruleset `bypass_actors` requires ruleset-write access,
  while protected workflows intentionally have only contents/package/OIDC/
  attestation permissions. Earlier context claimed the workflow repeated the
  complete admin digest.
- **Impact**: the workflow was either undispatchable, falsely attested a redacted
  digest, or needed an overprivileged secret.
- **Root cause**: operator-admin observation and workflow-independent proof were
  conflated.
- **Resolution**: plan 022 uses a bounded canonical `operator_attested` authority
  envelope from unredacted local admin pre-read, protected approval, workflow
  byte/hash/context binding, and identical local post-read. It explicitly
  retains trusted-admin TOCTOU and grants no workflow admin secret:
  [ruleset API](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10#get-a-repository-ruleset).
- **Confidence**: HIGH.
- **Attribution**: fourth-pass protected-authority feasibility defect.

### F4-39 — CRITICAL — First GHCR push did not guarantee repository linkage

- **Evidence**: package bootstrap required source linkage, but earlier workflow
  text omitted ephemeral `GITHUB_TOKEN` login and the OCI source annotation.
- **Impact**: first publication could create an unlinked private package that
  plan 030 had no authority to repair.
- **Root cause**: package creation was treated as equivalent to workflow/repo
  linkage.
- **Resolution**: plan 009 requires hosted `${{ github.token }}` login, exact
  `org.opencontainers.image.source` annotation, API linkage readback, and
  fixtures rejecting PAT/other source/unlinked output:
  [GHCR workflow guidance](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
- **Confidence**: HIGH.
- **Attribution**: fourth-pass package-bootstrap defect.

### F4-40 — HIGH — Package-bootstrap evidence expired before its consumer

- **Evidence**: plan 030 originally left its manifest in `/tmp` plus an Actions
  artifact while separate-session plan 017 required that exact placeholder.
- **Impact**: a cold executor could not resolve which run/digest authorized
  release readiness after retention expired.
- **Root cause**: live package state and durable evidence identity were
  conflated.
- **Resolution**: protected preflight emits attested preflight evidence; after
  visibility, a no-build protected mode anonymously verifies exact subjects and
  publishes attested public bootstrap-evidence OCI. Its full digest URI/source
  SHA is sole-release plan 018's external handoff after the atomic merge.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass operational evidence-lifecycle defect.

### F4-41 — CRITICAL — Policy bootstrap could adopt the wrong release evidence

- **Evidence**: the bootstrap workflow lacked the operator-expected
  qualification digest input, and local checks omitted immutable-release/asset
  verification.
- **Impact**: protected policy could adopt substituted or incomplete operator
  qualification bytes.
- **Root cause**: tag identity was substituted for full release evidence
  closure.
- **Resolution**: plans 035/019 require the exact Plan-040 two-native-target
  Codex release-closure OCI ref/digest, verify its protected publication
  provenance plus repository immutable state/release/every asset, and bind the
  downloaded closure into policy.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass policy-adoption defect.

### F4-42 — HIGH — Post-release OCI attestation had no authenticated registry session

- **Evidence**: plans 017/028/029 required `gh attestation verify oci://...`
  while naming no GHCR login; anonymous image pull is a separate property.
- **Impact**: exact commands could not run, or ambient credentials could make an
  anonymous-pull claim falsely pass.
- **Root cause**: public distribution and authenticated attestation lookup were
  collapsed.
- **Resolution**: each external evidence plan uses a mode-0700 task Docker
  config with process-only read credential for attestation, a distinct empty
  config for anonymous pull, and explicit logout/no-auth verification. No auth
  survives into native/provider children or Git.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass post-release feasibility defect.

### F4-43 — HIGH — Provider-policy compatibility was transient

- **Evidence**: the earlier plan 023 checked semantic fields but produced no
  durable record; its qualification could not bind what was compared.
- **Impact**: redownload could not reproduce the claimed policy compatibility.
- **Root cause**: command success was mistaken for durable subject-bound
  evidence.
- **Resolution**: canonical `provider-qualification-v1` binds policy/proof/
  release-closure URI/digest/bytes, every compared field/value, evidence, and
  verdict. Rewritten plan 023 publishes it as one digest-only directly attested
  OCI bound to the existing sole release; no second release is created.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass provider-release closure defect.

### F4-44 — CRITICAL — External release authority could drift during qualification

- **Evidence**: environment/main/tag/immutable-release state was checked before
  a long build/provider run but not immediately before the first external
  publication mutation.
- **Impact**: a weakened authority could publish evidence qualified under an
  earlier policy snapshot.
- **Root cause**: dispatch-time authority was treated as a lease.
- **Resolution**: sole-release plan 018 and protected external-evidence
  publication require the same unredacted stable authority-state digest
  (excluding new envelope timestamps) plus immediate pre/post mutation
  readback; any redaction/drift blocks and partial state is reported.
- **Confidence**: HIGH.
- **Attribution**: fourth-pass external-authority TOCTOU defect.

### F4-45 — CRITICAL — Per-plan branches and post-merge commits violated atomic delivery

- **Evidence**: the earlier package assigned separate branches/commits to every
  plan, required dependency merges before downstream work, published one Codex
  version, then attempted provider code/version/docs commits and a second
  release. It also required a later unmerged canary PR. The user requires the
  complete implementation in one branch, one PR, and one merge.
- **Impact**: the package could not execute as requested. Protected facts exist
  only after merge, so putting them into later tracked evidence/docs would
  necessarily create another branch/PR. One final tree also cannot contain two
  successive current manifest versions. A real later unmerged PR cannot be the
  same already-merged implementation PR.
- **Root cause**: implementation checkpoints, protected activation, public
  evidence, and software releases were modeled as one merge-per-plan timeline.
- **Resolution**: every code/workflow/schema/test/static-doc plan now checkpoints
  only on one pre-existing shared branch/draft PR. Plan 043 replays every done
  criterion at one final head and performs the sole squash merge. There is one
  vNext and sole release. Post-merge plans make no tracked edit/branch/PR;
  native/provider facts publish as digest-addressed protected OCI closures via
  plan 044. The bootstrap canary is a sealed synthetic Git bundle labeled
  `synthetic_candidate_fixture`, not a false live-PR proof.
- **Confidence**: HIGH.
- **Attribution**: explicit user delivery invariant plus fourth-pass cold DAG/
  provider review.

### F4-46 — CRITICAL — Unsigned admin envelopes were forgeable workflow inputs

- **Evidence**: the control-plane draft passed operator-attested authority bytes
  and a self-hash through `workflow_dispatch`; protected workflows could not
  reproduce bypass state or authenticate who created those bytes.
- **Impact**: any repository dispatcher could submit a forged “zero bypass”
  envelope. Environment approval did not cryptographically bind what a reviewer
  meant to authorize.
- **Root cause**: integrity hashing and reviewer approval were substituted for
  origin authentication.
- **Resolution**: Plan 022 pins an independent Ed25519 operator public key. Its
  dispatcher signs a domain-separated nonce/purpose/input-bound envelope,
  scrubs the private key before child execution, and every workflow verifies the
  signer/signature before effects. Privileged facts remain honestly
  `operator_attested`.
- **Confidence**: HIGH.
- **Attribution**: final cold security review.

### F4-47 — CRITICAL — Draft recovery trusted mutable writer-controlled bytes

- **Evidence**: a local qualification bundle was self-digested, uploaded to a
  mutable draft, then later downloaded and used to authorize finalization.
- **Impact**: a release writer could replace the draft bundle and fabricate a
  new self-consistent generation before publication.
- **Root cause**: schema closure was mistaken for authentication.
- **Resolution**: Plan 034 signs a canonical full-generation subject under a
  distinct pinned operator key/namespace inside the recovery JSON. State,
  recovery, and finalization reject unsigned/foreign/altered bytes before any
  mutation; draft-writer authority cannot mint a replacement generation.
- **Confidence**: HIGH.
- **Attribution**: final cold security review.

### F4-48 — HIGH — Durable OCI receipts could reconstruct multiple run identities

- **Evidence**: evidence OCI bytes excluded request/run identity while their
  derived manifests included run ID/attempt and attestation subjects. Identical
  evidence could later receive another valid attestation.
- **Impact**: after Actions-artifact expiry, no unique canonical operation
  receipt could be reconstructed from the subject.
- **Root cause**: content deduplication was prioritized over operation identity.
- **Resolution**: policy/candidate/proof/evidence OCI subjects embed signed nonce,
  workflow, run ID, and attempt before hashing. Durable verification requires
  exactly one file/OCI attestation pair matching that tuple; zero/multiple fail.
- **Confidence**: HIGH.
- **Attribution**: final cold security review.

### F4-49 — CRITICAL — Final squash merge pinned neither head nor base movement

- **Evidence**: the finalizer checked PR head, waited, then invoked squash merge
  without `--match-head-commit`; post-merge tree equality detected base races only
  after the irreversible merge.
- **Impact**: a changed head or concurrent base commit could land a tree never
  replayed or approved, violating the one-attempt invariant.
- **Root cause**: client-side prechecks were treated as an atomic merge lock.
- **Resolution**: Plan 043 uses `--match-head-commit`, immediate head/base
  readback, and requires server-enforced strict up-to-date checks, stale-review
  dismissal, last-push approval, enforced admins, zero bypass, and no merge
  queue. GitHub documents strict checks as requiring the topic branch to be
  current before merge and the merge API/CLI as matching the expected head:
  [ruleset rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets),
  [merge API](https://docs.github.com/en/rest/pulls/pulls#merge-a-pull-request).
- **Confidence**: HIGH.
- **Attribution**: final cold security review.

### F4-50 — CRITICAL — Environment scrubbing did not isolate controller credentials

- **Evidence**: native Codex/provider commands ran under the controller OS UID
  while an operator signing-key file, GitHub/Git configuration, credential
  helpers, and agent sockets remained reachable. `env -u` removed names, not
  same-user filesystem/process authority.
- **Impact**: a compromised native client could recover controller credentials,
  sign an authority envelope/recovery generation, or mutate external state.
- **Root cause**: process-environment hygiene was substituted for an OS
  principal/capability boundary.
- **Resolution**: Plan 045 owns the fixed no-free-form-argv native-client
  broker/account/lease; Plans 009/020/034 add only closed product modes.
  Every native Codex/provider client runs as a distinct unprivileged principal
  with task-only home/auth, empty Git/GH state, controller-home/key/parent-env/
  helper/socket denial, and mandatory post-run process-group quiescence. Only
  after quiescence may the controller use its mode-0600 signing key or dispatch.
- **Confidence**: HIGH.
- **Attribution**: final cold security review.

## Architecture comparison

| Criterion | Third pass | Minimal prose | Formal strongest | Chosen balanced |
|---|---|---|---|---|
| Exact final subject | Yes | No | Yes | Yes |
| Host effect enforcement | Claimed, absent | No | MicroVM | Proven OCI boundary |
| Later-slice regression | Possible | Possible | Noninterference proof | Final all-gate rerun |
| Canonical writers | Binary + manual prose | Prose only | Dedicated service | Binary only; legacy stays noncanonical |
| CI independence | PR self-check mislabeled strong | None | External service | Self-check label + later released verifier |
| Resume/audit | Receipt DAG + journal | Status prose | Event-sourced proofs | One journal; progress rows; one receipt |
| Retirement | tar + copied spec | Delete/history | CAS blob store | Readable Git move + evidence closure + exact-tree bundle |
| Delivery atomicity | Per-plan merges | One edit, weak proof | Transactional rollout | One branch/PR/final-head replay/squash merge |

## Required rollout

1. Remove the live budget-as-success defect; harden prose without executable
   mutable hooks.
2. Retain artifact eval evidence and eliminate majority authority.
3. Prove Codex lifecycle/config isolation and the OCI verifier boundary.
4. Deliver a provider-free one-slice tracer and a separate narrow Codex broker
   transport only after executor/Stop/host-read axes pass.
5. Persist classified sources; separately migrate interactions; separately seal
   complete READY intent. Absent-CLI clients remain labeled legacy.
6. Route empirical uncertainty without automatic normative adoption while the
   package compiler seals typed zero-context plans.
7. Execute serial slices and rerun every requirement gate on exact final tree.
8. Converge attestations, apply through sanitized Git, then retire into a
   proof-closed archive.
9. On the same branch/PR, implement honest Grok/Claude adapters, release lanes,
   protected policy/candidate workflows, external-evidence publication, static
   verification docs, and exactly one whole-stack vNext.
10. Replay every tracked done criterion at one final PR head and perform one
    explicitly approved squash merge; no intermediate plan is merged.
11. From that atomic merge, bootstrap protected authority/package, publish one
    software release, then publish native Codex closure, policy, synthetic
    candidate proof, provider qualification, and native support closure as
    digest-addressed external evidence. Make no later Git change or PR.

## Baseline and PR facts

At audit start:

- `rtk mise run validate`: passed, 15 skills.
- `rtk bun test scripts/`: passed, 7 tests.
- `rtk git diff --check`: passed.
- PR #6 DCO: passed.
- PR #6 validate: failed because live TanStack Router/Start patches exceeded the
  unrelated pinned template versions.
- PR #6 remote baseline: four commits, no reviews, stale ten-plan/two-commit
  body, stale third-pass discussion, unrelated `b629fb9`, and pre-pass head
  `1e809bd` without the required Codex co-author trailer.
- Protected-release prerequisites: immutable releases disabled; zero repository
  environments; no distinct eligible reviewer yet proven; no
  `tailrocks-verifier` GHCR package; no attended GHCR write credential proven.
- Current active repository rulesets `protect-main` and `protect-tags` have zero
  bypass actors and satisfy the plan's PR-only/non-movable minimum; every
  operation still re-reads them because external settings can drift.

The advisor write scope does not authorize PR-body/comment repair, reviewer or
credential creation, repository-admin mutation, or package publication. Those
facts remain explicit handoff blockers rather than hidden verification success.
