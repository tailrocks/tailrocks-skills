# Research Synthesis — Predictable Agent Delivery

Reverified 2026-08-10 against Tailrocks commit `b629fb9`, the first advisor
draft at `d388b77`, current installed clients, official provider documentation,
and three independent cold reviews. Context7 MCP was unavailable in this
session; current product behavior was checked against official documentation
and local CLI discovery instead.

## Decision

General-purpose agents cannot promise identical patches or judgments. Tailrocks
can make a smaller claim that is both enforceable and valuable:

```text
decision(frozen evidence) =
    contract complete
AND candidate exactly identified
AND every deterministic gate current and passing
AND every required attestation current and passing
AND every observable repository delta authorized
AND verifier trust >= contract policy
```

This function is deterministic only when its inputs and evaluators are. A model,
human, visual review, or external service produces a labeled attestation; it does
not become deterministic because the controller stores it. Any current concrete
failure blocks. Majority and aggregate scores never erase a failure.

The selected design is a thin trusted acceptance kernel grown through vertical
slices. It rejects two tempting extremes: prompt/hook-only enforcement is too
weak, while the original ten-layer platform delayed its existential provider
test and duplicated canonical state.

## Repository evidence

The macro delivery lifecycle is strong: capture, shape, research, finalize,
plan, execute, reconcile, and backtrack. The defect class sits at the proof
boundary:

- `scripts/run-evals.ts:72-76` stages every fixture by basename, losing nested
  destinations and allowing collisions.
- `scripts/run-evals.ts:90-130` grades the agent's summary rather than retained
  workspace state, trace, and diff. `:132-134` then deletes the workspace.
- `scripts/run-evals.ts:137-140` makes a majority the process exit result, so a
  concrete failing trial can disappear.
- `skills/tailrocks-plan/references/goal-handoff.md:60-79` lets the executor set
  `DONE`, commit it, and finish when every row is `DONE` or `REJECTED`.
- `skills/tailrocks-reconcile/SKILL.md:29-50` distrusts claims but reruns the
  same plan-authored criteria; shared blind spots remain.
- `skills/tailrocks-plan/SKILL.md:83-99` correctly requires vertical,
  independently verifiable, one-session tracer bullets. The first advisor draft
  instead put five horizontal control-plane layers before a useful slice.

Baseline checks on 2026-08-10:

- `mise run validate` passed: 15 skills validated.
- `bun test scripts/` passed: 7 tests.
- The package freshness check failed after commit `b629fb9`: at audit time
  `@tanstack/react-router` and `@tanstack/react-start` already had newer patch
  releases. The version table in
  `skills/tailrocks-tanstack-project-setup/references/version-policy.md` also
  still contains the older 2026-07-23 snapshot despite requiring table and
  template updates together.

## Devil's-advocate findings and resolution

| Finding | Evidence in first draft (`d388b77`) | Consequence | Resolution |
|---|---|---|---|
| Impossible dependency cycle | 004 requires an external anchor owned by 005; 005 consumes clean replay owned by 006; 006 depends on 005 | A compliant cold executor must stop or invent an interface | Plan 003 delivers anchor, replay, receipt, and Codex checkpoint together as one tracer bullet |
| Provider feasibility arrives too late | Codex/Grok/Claude behavior first becomes load-bearing in 006 after large schema/runtime plans | Five plans can land before discovering native `/goal` cannot be controlled | Plan 002 is a disposable, evidence-retaining Codex feasibility gate; failure stops runtime work |
| Horizontal waterfall contradicts project planning rules | Plans 002–007 each build a layer; final PASS appears only in 007 | No independently useful intermediate state | Every new plan crosses the full path needed for one user-visible capability |
| Canonical fields duplicated | `manifest.json`, coverage/effect/resolution/oracle locks, and `goal.contract.json` repeat order, scope, gates, and hashes | Valid-looking artifacts can disagree | One runtime `goal.contract.json`; readable projections are generated and checked |
| Hash/copy-edit contradiction | Plan Markdown is hashed, yet non-normative copy edits allegedly do not invalidate | Executor-visible instruction can change without invalidation, or every edit invalidates anyway | Treat every executor-visible byte as normative and hash it |
| RFC 8785/cross-language validation is machinery without a second authority | Only the Rust controller authorizes state | More implementations increase mismatch surface | Rust emits deterministic bytes; receipts hash exact bytes and referenced files |
| Custom subject-tree logic reimplements Git | First draft excludes selected control paths from a custom SHA-256 tree | Exclusions can hide real changes and administrative commits complicate identity | Use Git commit/tree identities; slice receipts bind base+delta, final receipt binds final tree |
| Slice receipts cannot all equal the current tree | Each later slice changes the repository subject | Earlier receipt becomes stale; multi-plan PASS can deadlock | Slice receipt proves candidate delta and dependency inclusion; one final receipt proves exact package tree |
| Linked worktrees are called isolation | Executor and verifier linked worktrees share common Git config, refs, hooks, objects | Executor can alter trusted replay before post-hoc scan | Disposable full clones, sanitized Git config, no writable remote, controller-owned import/CAS; still label local mode non-adversarial |
| Three independent append-only histories | State events, receipts, and convergence findings each have a head | Crashes leave cross-log partial truth | One SQLite WAL transaction; immutable evidence blobs referenced from it |
| External state merely lives outside worktree | Same unrestricted user can read/modify it and credentials | Location is not authorization; secret reads are unobservable | Capability-scoped actor API; v1 allows repository-local effects only; strong mode needs separate principal/CI |
| Effect budget observes writes too late | Network/database/deploy effects occur before checkpoint | Clean replay cannot detect or undo them | No autonomous external effects in v1; human/external gate until sandbox/broker exists |
| Parallel candidates lack integration semantics | Disjoint path claims do not cover read dependencies, base drift, or ref races | Silent semantic conflict/lost update | Serialize v1 implementation; parallelize only independent review |
| Provider lifecycle implemented in Bun and Rust | Plan 001 adds session/resume adapters; 006 adds them again | Eval/runtime can disagree | Plan 001 builds artifact assertions with a fake/replay driver; live eval later drives the Rust adapter |
| Three reviewer sessions universally required | Scope is often deterministic; fresh contexts remain provider-correlated | Added false-block surface without real independence | Preserve Product/Scope/Engineering verdict fields; dispatch only unresolved semantic axes |
| Source capture writes record/index/identity/projection separately | Interruptions or concurrent sessions can create duplicate IDs and divergent indexes | Provenance layer can lose provenance | Immutable collision-resistant record IDs, blob-first/record-last atomic writes, item CAS/lease, derived indexes |
| Retirement is automatic and Git history is the archive | PASS then deletion has ambiguous crash behavior; squash/branch deletion can make parent unreachable | Goal may falsely fail after PASS; evidence may disappear | PASS is terminal; explicit idempotent retirement follows; archive a content-addressed bundle and final receipt |
| Fixed 300-run bar is misread as proof | Rule of three only estimates an upper failure bound under representative independent trials | A statistical sample is mistaken for invariant evidence | Mutation/property tests prove deterministic invariants; adaptive samples report intervals for stochastic behavior |
| False completion is defined by the checker under test | A broken checker returning PASS hides its own false accepts | Release metric can claim zero escapes while wrong | Measure checkpoint bypass separately from false acceptance against blinded/independent ground truth |
| Credentialed PR-head smoke | Same-repo PR code can control scripts/hooks | Compromised branch can exfiltrate credentials | Base-owned workflow/approved environment treats PR artifact as data; never execute PR-head code with secrets |
| Grok `/goal` assumed | Official Grok command docs do not list built-in `/goal`; local origin is unknown | Adapter could target a command that is a plugin/skill or lacks Stop control | Codex ships first; Grok/Claude require recorded origin/version/hook/resume conformance or remain unsupported |
| Unrelated TanStack refresh shares the PR | Commit `b629fb9` has no plan dependency and its table is stale | Review scope expands; moving target fails again | Split it; add table/template consistency validation in that separate change |

## Why the first draft was overengineered

The first draft had the right trust direction but made formal machinery a goal:
six lock artifacts, RFC 8785, cross-language golden vectors, custom subject-tree
hashing, three journals, leases/parallel writers, three reviewers per plan, and
fixed 300-run campaigns. Several pieces were individually defensible; together
they created more consistency obligations than they removed.

The better test is not “could this be useful?” It is “which invariant fails if
this component is absent?” The revised kernel keeps only mechanisms with direct
answers:

| Mechanism kept | Invariant it enforces |
|---|---|
| Single contract | No divergent runtime authorities |
| Git candidate/final identities | Evidence names exact repository state |
| Transactional journal | State/receipt/finding transitions cannot partially commit |
| Clean disposable verifier clone | Candidate-local caches/config do not define proof |
| Protected oracle digests | Executor cannot move goalposts unnoticed |
| Effective-hook preflight | Native stop semantics match the accepted controller path |
| Independent/human attestations when declared | Unautomatable intent is not silently called proven |

## Provider facts

Installed discovery found Codex CLI `0.147.0` with stable `goals` and `hooks`
features, Claude Code `2.1.226`, and Grok Build `1.0.0`. Official documentation
currently establishes:

- [Codex `/goal`](https://learn.chatgpt.com/use-cases/follow-goals) is a durable
  objective but terminates when Codex is confident the condition holds.
- [Codex hooks](https://learn.chatgpt.com/docs/hooks) can block stopping and
  return a continuation prompt. The complete effective hook/config set matters,
  not only Tailrocks' hook file.
- [Claude `/goal`](https://code.claude.com/docs/en/goal) evaluates from the
  transcript, not independent file/command access; resume resets turn/time/token
  counters.
- [Claude hooks](https://code.claude.com/docs/en/hooks-guide) have provider-
  specific stop-loop limits and precedence.
- [Grok commands](https://docs.x.ai/build/modes-and-commands) document `/plan`
  and `/loop` but not a built-in `/goal`. A user-visible `/goal` may come from a
  plugin or skill and must be discovered, not inferred.

These facts justify an early Codex-only conformance proof and provider-neutral
contract, followed by separate qualification. They do not justify pretending all
three clients expose equivalent control.

## Empirical evidence

- [On Randomness in Agentic Evals](https://arxiv.org/html/2602.07150v1)
  reports 60,000 trajectories and 2.2–6.0 pass@1 percentage-point variation;
  temperature zero did not remove divergence. Retries improve discovery, not
  reproducibility.
- [From Plan to Action](https://arxiv.org/html/2604.12147v1) finds that poor
  plans can be worse than no plan and extra phases can hurt. Concise active
  slices beat process inflation.
- [AgentLens](https://arxiv.org/abs/2605.12925) identifies lucky passes,
  including successful outputs without trustworthy verification.
- [SWE-Marathon](https://arxiv.org/html/2606.07682v1) finds verifier-bypass
  behavior and shows the value of layered independent defenses.
- The statistical [rule of three](https://jamanetwork.com/journals/jama/article-abstract/385438)
  says zero failures in `n` representative independent trials gives an
  approximate 95% upper failure-rate bound of `3/n`; it never proves zero risk.
- [OpenAI skill eval guidance](https://developers.openai.com/blog/eval-skills)
  and [Anthropic agent eval guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
  separate trials, traces/artifacts, graders, and outcomes. Tailrocks therefore
  retains workspace evidence and every trial instead of grading summaries or
  reporting majority alone.

## User-goal coverage

| Requested property | Owning plan(s) | Concrete acceptance evidence |
|---|---|---|
| Preserve original idea/voice | 004 | immutable source records/blobs; derived index; loss/invention/concurrency fixtures |
| Interview without losing corrections/resume state | 001, 004 | artifact-based multi-turn fixtures; supersedence and interruption tests |
| Research unknown facts safely | 004 | cited fact records stay non-normative until a user decision references them |
| Resolve empirical unknowns instead of guessing | 005 | isolated one-question prototype, retained inputs/commands/results, explicit adopt/defer/reject decision |
| Finalize flows/screens/quality bars | 004 | scenario-class checklist, verification seams, human/visual attestation declarations |
| Record and reverse decisions | 004 | immutable superseding decision records; compiled contract invalidation |
| Produce complete ordered plans | 006 | requirement↔plan↔gate graph and acyclic serial DAG in one contract |
| Get neither less nor more | 006, 007 | requirement evidence plus path allowlist, candidate delta mapping, Product/Scope/Engineering verdicts |
| Execute repeatedly through native `/goal` | 002, 003, 006 | proven Codex Stop lifecycle, durable controller budgets, `CONTINUE/BLOCKED/PASS` |
| Resume without trusting agent status | 003, 006 | controller journal, candidate-only executor capability, idempotent checkpoint tests |
| Independently verify slices and package | 003, 007 | clean-clone gates, slice receipts, exact final-tree receipt, conditional cold attestations |
| Backtrack to correct earlier skill | 007 | deterministic failure-owner routing; no agent-selected authoritative stage |
| Keep GOAL current | 006, 007 | generated projection from contract+journal; stale evidence invalidates PASS |
| Remove completed active plans without losing truth | 007 | PASS-independent explicit retirement, durable bundle/spec/receipt, reopen tests |
| Measure real predictability | 001, 008 | retained per-trial outcomes, pass@1/pass^k intervals, blinded false-acceptance fixtures |
| Preserve Rust/TypeScript/TanStack house rules | 006–008 | existing house-skill gates referenced by exact digest and rerun in clean verifier |
| Support Grok then Claude when true | 010 | provider-origin/version/hook/resume conformance matrix; tier 0/1/2 verdicts with containment mandatory; no tier advertised as another |

## Trust and scope limits

- No identical-patch, identical-interview, or identical-review promise.
- No model transcript, checkbox, score, or majority is completion proof.
- No adversary-resistant local claim under one unrestricted OS user.
- No autonomous external effect in v1. Network, secret, database, deploy, device,
  or irreversible work requires a declared external/human gate.
- No credentialed job executes code controlled by an untrusted PR head.
- No fallback standalone supervisor when a provider lacks a controllable native
  `/goal`; that provider remains unsupported.
- No package retirement hidden inside native goal success. PASS is preserved,
  cleanup is explicit, and archived evidence does not depend on branch reachability.

## Third adversarial pass (2026-08-10, PR #6 review)

Method: the second draft's repository evidence was re-verified line by line
against the working tree (all claims accurate; one literal mismatch found —
plans quoted `Validated 15 skill(s).` where `scripts/validate-skills.ts:293`
prints `Validated 15 skills.`, enough to STOP a compliant cold executor).
Then two independent cold reviews ran in parallel: one instructed to defend the
second draft against ten proposed simplifications (steelman), one instructed to
find what the second draft still gets wrong without echoing its own resolved
findings. Their disagreements were adjudicated on concrete failure scenarios,
not vote counts.

### Adopted findings

| Finding | Resolution (owning plan) |
|---|---|
| Stop-hook wall-time budget never measured; slow honest checkpoints could become uncontrolled stops | 002 measures budget and on-timeout behavior; checkpoint is enqueue-and-poll when gates exceed it; PASS releases at a later Stop (003, 006, 007) |
| "No egress" contradicted by cargo/bun dependency fetches in clean clones | Controller-provisioned read-only dependency store keyed to lockfile digests; warming is a labeled controller effect (006, tested in 002) |
| Plans 004-007 rewrite shipped skills to require a binary users cannot install until 009; Claude/Grok flows regress before 010 | Mandatory no-binary fallback and dual-path skills; prose-path removal is an explicit recorded deprecation decision (004, 006, 007) |
| Dependent plans' preconditions require PASS state living only in one machine's journal | Defined journal location; scripted provider-free tracer mode is the committed re-runnable proof; `inspect --require PASS` re-derives (003) |
| 002 sized S despite ~15 human-attended TTY scenarios; 009 assumed the same lifecycle headlessly in scheduled CI | 002 resized M; 009 split into operator-run TTY runbook plus protected workflow validating evidence and running the automatable subset |
| Effective hook sources inside the executor-writable clone let the executor delete its own checkpoint | Placement invariant: all effective hook/config bytes outside executor-writable roots; in-clone source is preflight rejection; checkpoint re-hashes the set (002, 003) |
| Flaky gates had no detection, policy, or routing owner | Anchor-time k-run stability, identical-subject divergence sentinel, dedicated routing row freezing the gate (006, 007) |
| Replay evals graded as if they proved skill behavior | Labeled `fixture-validated`; live credentialed smoke is the only skill proof (008) |
| Trust-bearing strong mode had no plan number | CI receipt revalidation lane: credential-free `goal reconcile --final` rerun on PRs; merge-authoritative receipt is the CI-validated one (008) |
| 003/006/007 violate the one-session slice doctrine the package cites | Explicit session seams at green step boundaries (003, 006, 007) |
| 001→002 dependency was artificial; the existential gate ran second | 002 depends on nothing and runs first; a 30-minute manual spike precedes harness code; staleness is caught by a live-version check in `validate-research` (001, 002, 003) |
| The diagnosed live false-completion hole stayed open for the whole runway | New plan 000: gate-first prose protocol, reconcile-before-done, opt-in advisory Stop hook, trust label `advisory_prose` |
| "Selective invalidation trigger" had no defined grammar | Removed; validity = run-ref ancestry + final-tree rerun with full-delta authorization; slice receipts stay as audit evidence (006, 007) |
| Reviewer transport, credentials, and AWAITING_ATTESTATION native-goal behavior unowned | Named headless exec-mode transport under capability preflight with cost bound; AWAITING_ATTESTATION maps to BLOCKED(owner) plus `tailrocks attest` (007) |
| Controller-regenerated GOAL.md would appear in executor deltas | Controller commits on the run ref before next prepare; GOAL.md in an executor delta is a rejection (006) |
| Version-bump policy self-contradictory (0.12.0/0.13.0 arithmetic) | Per-release bumping derived from live manifests only; 005's mid-stream bump removed (005, 009) |
| Kernel workspace/fixtures/archives ship inside every plugin install across all channels | 009 payload deliverable measures per-channel installs; open decision D1 executes there if unacceptable |
| Five speculative release targets | Two real targets; `aarch64-unknown-linux-gnu` named next for Apple-silicon devcontainers; Windows blocked on tooling port scope (009) |
| Embedded example repositories cannot be committed as written | `git bundle` plus materialize script (003, 006) |
| "Sanitized evidence" overclaimed scrub-side detection | Relabeled capture-side allowlisting: only enumerated schema fields are written at source (002) |
| Pasted attachments may have no re-exportable original bytes | `capture_fidelity: bytes\|reference` on source records (004) |
| Two goals against one repository had no concurrency semantics | One journal per repository plus a repo-wide execution lease (003) |
| Binary SUPPORTED/UNSUPPORTED wastes the kernel on weaker clients | Qualification tiers 0/1/2: containment gates every autonomous tier; stop-control decides attended vs unattended; invariants identical (010) |
| Per-package oracle proofs looked prohibitively expensive | Kept (see rejected table) but cost-bounded: reusable perturb templates for standard house gates; bespoke fixtures only for novel oracles (006) |

### Proposed simplifications rejected under steelman

These cuts were argued for and lost; recording why prevents relitigating them.

| Proposed cut | Why it lost |
|---|---|
| Demote slice receipts to journal notes; final receipt as sole proof | A mid-package rebase that drops a slice commit leaves free-floating "done" booleans; slice-scoped gates are not rerun at final, so their evidence must survive as bound receipts. Ancestry validation plus dual receipts is the draft-1 deadlock fix, not decoration. |
| Move per-package oracle negative controls into the kernel's own test suite | Kernel tests never see a future package's oracles. A gate whose test filter matches zero tests exits 0 and becomes a frozen, digested nothing; only an anchor-time seeded-defect proof catches it — "false completion defined by the checker under test" otherwise returns. |
| Replace UUIDv7 records + CAS blobs + projection lease with an append-only JSONL log | Serial execution does not make capture serial: concurrent interview sessions exist by design. Torn-tail appends corrupt a JSONL log permanently; multi-KB answers exceed atomic-append sizes; temp-write+rename is the committed/uncommitted boundary the promises require; the lease only guards projection rebuilds that would otherwise clobber human-authored README sections. |
| Drop committed tar.zst retirement archives (rely on specs/ + main history) | A package created and retired within one PR squash-merges to main as a single commit whose tree never contained the package; the pre-deletion bytes die with the feature branch and `completion.json` holds digests with no recoverable preimage. Kept, with destination/size options and documented merge-dependency. |
| Drop journal replay/derived-state equality (keep transactions only) | Replay equality is the kernel's only self-audit: a bugged or page-corrupted state row claiming PASS without a supporting event chain is detected fail-closed at startup and routed as a verifier defect. Cheapest invariant in the system; sole detector of its class. |
| Prune hostile-Git fixtures to observed model-shortcut behaviors | The matrix is mechanism-based protection against ambient accidental hazards squarely inside `local_non_adversarial`: git-lfs smudge/clean divergence between executor and sanitized verifier, `core.autocrlf` flipping byte-exact gates, local-clone alternates sharing objects with a mutable source repo. Behavior lists are open sets; mechanism closure is not. |
| Reclassify hook enforcement as pure liveness (weak hooks ⇒ attended tier for everyone) | Adopted only in refined form: hook verification and capability containment share one introspection machinery, so a provider that cannot enumerate its effective config cannot prove containment either — containment stays mandatory for any autonomous tier; only stop-control became the attended/unattended axis, and Codex keeps the zero stop-without-PASS release bar. |

## Revised rollout

0. Harden the existing prose loop today (gate-first condition, reconcile before
   done, advisory hook) — the known hole does not wait for the kernel.
1. Prove Codex native stop/continue/resume behavior, the hook time budget, and
   hook placement with retained evidence (before or alongside step 2).
2. Make eval assertions inspect actual artifacts.
3. Deliver one complete Codex slice — scripted mode as committed proof, native
   mode as qualification evidence — before general schemas.
4. Preserve intent and empirical evidence through READY, dual-path on every
   client.
5. Generalize one canonical contract and serial runtime, with
   controller-provisioned dependencies and anchor-time oracle proofs.
6. Add current-evidence convergence and explicit recoverable retirement.
7. Converge through declared semantic/human evidence and retire explicitly.
8. Complete artifact evals, credential-free deterministic CI, and the CI
   receipt-revalidation lane that makes merge-authoritative PASS independent.
9. Distribute and qualify Codex from protected code; measure plugin payloads
   and execute the repo-split decision if needed.
10. Assign Grok and Claude qualification tiers independently; containment gates
    every autonomous tier and no tier is advertised as another.
