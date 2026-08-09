# Research Synthesis — Predictable Agent Delivery

Reverified 2026-08-10 against Tailrocks commit `04987c8` and current upstream
sources. This document records the evidence and architecture decisions behind
the executable plans in this directory.

## Conclusion

General-purpose coding agents cannot promise the same patch from repeated runs.
Tailrocks can promise a stronger and useful property:

> Stochastic proposals are accepted only when a complete, current intent
> contract and an appropriately trusted verifier prove the resulting state is
> exactly within that contract.

“Exactly” is a conjunction, never a score or reviewer vote:

```text
accepted = no_uncovered_requirement
       AND no_unmapped_observable_effect
       AND all_required_oracles_current_and_passing
       AND all_required_semantic_human_external_checks_current
       AND verifier_trust_mode_satisfies_package_policy
```

This gives four different kinds of predictability:

1. **Intent predictability** — immutable user-source records, explicit
   supersedence, stable requirement IDs, and a user-approved READY contract.
2. **Workflow predictability** — typed state transitions, durable checkpoints,
   leases, idempotent recovery, and state-derived routing.
3. **Acceptance predictability** — fixed requirement/oracle/effect contracts,
   current content hashes, verifier-owned receipts, and fail-closed gates.
4. **Empirical reliability** — outcome-based repeated trials reported as
   pass@1/pass^k with every failure retained, not hidden by majority voting.

It also fixes the product boundary:

```text
Codex /goal (primary) | Grok /goal | Claude Code /goal
                         |
                         v
             generated GOAL.md + trusted hooks
                         |
                         v
        tailrocks goal (eligibility, scope, budget, verification)
                         |
                         v
               current PASS receipt or exact failure state
```

Native `/goal` owns persistence and model work. `tailrocks goal` never replaces
that loop or launches a competing agent workflow; it decides what native
`/goal` may work on and whether the resulting repository state is accepted.

The boundary is important. A schema can prove shape; a test can prove its
observable; a hash can prove identity. None can prove that an incomplete human
intent was secretly complete. Semantic and visual intent therefore require
explicit rubric/human ownership and must remain labeled non-deterministic.

## Sources inspected

| Source | Snapshot | Relevant evidence |
|---|---|---|
| Tailrocks | `04987c8` | All delivery SKILL files/references/evals, validator, eval runner, CI, example package, docs, and prior advisor history |
| [mattpocock/skills](https://github.com/mattpocock/skills) | [`84fdeffd`](https://github.com/mattpocock/skills/tree/84fdeffd12f2ee307994d1eb6feb48173b6e0502), 2026-08-06 | `ask-matt`, phase boundaries, grilling, research, prototype, `to-spec`, `to-tickets`, TDD, implementation, two-axis review, handoff, writing for agents |
| [shadcn/improve](https://github.com/shadcn/improve) | [`03369ee6`](https://github.com/shadcn/improve/tree/03369ee6d7cafbfcecc4346539b05b3dc0a603bb), 2026-06-15 | codebase audit, self-contained plans, verified commands, worktree execution, cold reconciliation |
| [github/spec-kit](https://github.com/github/spec-kit) | [`684b3d8e`](https://github.com/github/spec-kit/tree/684b3d8e05263a7c1948d3d0699ab1cb4f77c3d5), 2026-08-07 | clarify/analyze/checklist/tasks/implement/converge loop |
| [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | [`e50bd098`](https://github.com/Fission-AI/OpenSpec/tree/e50bd0983dc8dc48250e3181f36e28450542f2ab), 2026-08-07 | current specs vs active changes, validation, verification, sync, archive |

Current provider and evaluation contracts were checked against official
documentation: [Claude `/goal`](https://code.claude.com/docs/en/goal),
[Claude hooks](https://code.claude.com/docs/en/hooks-guide),
[Codex `/goal`](https://learn.chatgpt.com/use-cases/follow-goals),
[Codex hooks](https://learn.chatgpt.com/docs/hooks),
[Grok Build modes and commands](https://docs.x.ai/build/modes-and-commands),
[OpenAI skill evals](https://developers.openai.com/blog/eval-skills), and
[Anthropic agent evals](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents).
Installed read-only checks on 2026-08-10 found Claude Code `2.1.226`, Codex CLI
`0.147.0` with stable `goals` and `hooks` features, and Grok Build `1.0.0`.
Codex officially describes `/goal` as a durable long-running objective but says
it stops when Codex is confident the condition holds. Claude documents that its
`/goal` evaluator reads the conversation rather than files or commands, and
that resume restores the condition while resetting turn/time/token counters.
Grok's current official command reference documents `/plan`, `/loop`, sessions,
worktrees, hooks, and user-invocable slash-command skills, but does not list a
built-in `/goal`. The operator reports a strong working Grok `/goal`; the Grok
adapter therefore records the live command's actual origin (`native`, plugin,
or skill), version, hook behavior, and resume behavior instead of denying the
capability or inferring undocumented parity.

## Deterministic acceptance evidence

- [On Randomness in Agentic Evals](https://arxiv.org/html/2602.07150v1)
  collected 60,000 trajectories, 25.58 billion tokens, and 1.88 million tool
  calls. Identical configurations varied by 2.2–6.0 pass@1 percentage points;
  temperature zero did not remove variance; trajectories diverged within the
  first 1% of tokens. One configuration measured pass@1 34.4%, pass@5 52.9%,
  and pass^5 15.5%. Retries increase discovery, not consistency.
- [From Plan to Action](https://arxiv.org/html/2604.12147v1) analyzed 16,991
  SWE-agent trajectories. A subpar plan was worse than no plan, adding plausible
  phases could hurt, and reinjecting the concise plan every five trajectory
  steps improved compliance and success in the studied setting. Tailrocks must
  enforce a short active-slice contract, not inflate `GOAL.md` with generic
  process prose.
- [AgentLens](https://arxiv.org/abs/2605.12925) classified 10.7% of passing
  trajectories in its evaluation subset as lucky passes, including missing
  verification and blind retries. Passing output alone does not establish a
  trustworthy process or current proof.
- [SWE-Marathon](https://arxiv.org/html/2606.07682v1) found exploit-shaped
  actions in 13.8% of 1,300 audited rollouts and a shipped verifier bypass in
  10.2%; layered defenses caught all 132 shipped bypasses in that corpus. The
  executor must not be able to rewrite the oracle, checker, hook, or receipt.
- The statistical [rule of three](https://jamanetwork.com/journals/jama/article-abstract/385438)
  gives an approximate 95% upper failure-rate bound of `3/n` after zero failures
  in `n` independent representative trials. Zero failures in 300 trials means
  approximately “below 1%,” not “impossible.”

Operational metrics distinguish a premature claim from an escaped terminal
failure. The first is any agent/native evaluator success claim while the trusted
checker is not PASS; hooks should intercept it and the rate remains visible.
The second occurs only if the run is allowed to terminate or appear accepted
without PASS. Adversarial tests deliberately induce the first and require zero
instances of the second. Collapsing both into one zero-rate metric would make an
interception test count its expected attack as a product failure.

## Tailrocks audit

### What is already structurally right

- The macro lifecycle matches the user's real thinking loop: capture, shape,
  research, decide/finalize, plan, execute, reconcile, and return upstream.
- Delivery artifacts are durable and skills have narrow write ownership.
- Finalize is the sole READY authority; Plan requires READY.
- Plan already favors vertical slices, dependency DAGs, traceability, cold
  review, zero-context handoffs, and explicit STOP conditions.
- Reconcile already distrusts executor claims and reruns stated done criteria.
- Research stays reusable and independent from individual roadmap items.

### Enabling conditions for false completion

| Enabling condition | Current consequence | Structural correction |
|---|---|---|
| Raw user words are immediately rewritten into one mutable README | Later checks cannot detect lost nuance or invented intent | Append-only source/blob records plus approved, content-addressed READY contract |
| Interactive skills are tested by one prompt and a summary | Brainstorm/finalize behavior is not actually exercised; lying summaries can pass | Scripted multi-turn scenario driver; grade workspace, trace, and state |
| Coverage, status, dependencies, assumptions, and DONE are Markdown interpreted by agents | Same stochastic actor proposes and certifies truth | Strict Rust control plane; generated Markdown projections only |
| Plan may create `A#` assumptions after READY | Observable product behavior can enter after intent was supposedly frozen | Only behavior-invariant implementation discretion; otherwise route upstream |
| Scope is mostly a path list | Non-file effects and scope creep can pass | Default-deny effect contract plus enforceability class and sandbox/observer |
| Acceptance tests/rubrics are writable with the candidate | Executor can move the goalposts | Oracle specification/materialization phase and operator/CI-owned hash anchor |
| Executor writes `DONE`; `REJECTED` can satisfy one goal path | False terminal state and contradiction with Reconcile | Candidate-only executor; DONE derived from current PASS receipts; no rejection bypass |
| Receipts tied to literal current HEAD | Administrative status/retirement commits invalidate verified code | Hash the repository subject tree excluding only frozen control paths; hash control generation separately |
| The executor can alter tests, gate wrappers, hooks, ignored inputs, or runtime state that proves success | A convincing self-created oracle can pass | Installed trusted controller/hook, protected artifact hashes, complete tracked/untracked/effect scan, and verification in a second clean worktree |
| Goal bounds live only in prompt/native session counters | Resume can reset or lose the effective budget | Durable controller-owned slice/attempt/tool/time counters outside the worktree |
| Native goal evaluator may stop on confidence/transcript | Premature native completion can bypass incomplete work | Deterministic Stop hook calls `tailrocks goal checkpoint`; only current PASS permits stop |
| Reconcile repeats executor-authored checks | Shared blind spots survive | Deterministic checks plus fresh Product, Scope, and Engineering axes |
| Reconcile is separately invoked and routing is agent-chosen | Nominal completion can skip final truth sync | Stop-hook-owned `tailrocks goal reconcile --final`; pure `tailrocks goal next` feeds the native loop |
| A completed package is retained forever or deleted raw | Either active clutter or lost shipped truth | Sync durable spec + completion attestation, then guarded retirement |
| k=3 majority is treated as the stochastic summary | One concrete failure can disappear | Preserve every trial; report pass@1, pass^k, intervals, and verifier defects |

## Current upstream flows

```text
Matt:
ask-matt -> grill-with-docs -> [research | prototype | handoff] -> to-spec
         -> to-tickets -> fresh-context implement/TDD -> two-axis code review

shadcn/improve:
repository audit -> prioritized self-contained plans -> isolated execution
                 -> fresh-context reconcile -> DONE/BLOCKED/TODO truth sync

GitHub Spec Kit:
constitution -> specify -> clarify -> plan -> checklist/tasks/analyze
             -> implement -> converge -> implement/converge until clean

OpenSpec:
propose -> human artifact review -> apply -> verify -> spec sync -> archive
```

Matt's phase-boundary guidance explicitly decides whether to continue, clear,
handoff, fork, or compact and favors primary artifact pointers over lossy
summaries. shadcn/improve stops at advisory plans and reconciliation rather than
providing a durable runtime. Spec Kit's convergence is append-only but remains
agent-judged. OpenSpec's verification is advisory and archive can proceed after
warning confirmation. Tailrocks adopts their useful shapes while adding typed
authority and refusing warning/majority completion bypasses.

## Comparison

| Concern | Matt Pocock | shadcn/improve | Spec Kit / OpenSpec | Tailrocks target |
|---|---|---|---|---|
| Raw intent | Grilling and primary-source handoffs preserve context socially | Audit reads repository truth | Specs/change artifacts become shared intent | Immutable source provenance and explicit supersedence |
| Phase choice | `ask-matt` and phase-boundary choices reduce context loss | One audit-to-plan boundary | Named commands and artifact status route stages | State-derived router; model never guesses the authoritative next stage |
| Requirement quality | User agrees public seams before spec/TDD | Plans include done criteria and STOPs | Spec Kit checklist is “unit tests for English” | READY compiler requires coverage of primary/alternate/error/recovery/NFR classes or sourced exclusion |
| Planning | Tracer-bullet tickets and expand/contract sequencing | Weak-executor, zero-context plans with verified commands | Tasks map to specs/design | Typed coverage/DAG/effect/oracle package plus readable zero-context plans |
| Empirical unknowns | One-question disposable prototype retained as primary source | Not central | Exploration remains separate from apply | Isolated one-question experiment with retained reproducible evidence; never production by default |
| Execution | Fresh context per ticket, agreed TDD seams | Isolated worktree execution | Apply tasks iteratively | Native `/goal` is the required actuator; provider-neutral controller leases one slice, constrains effects, clean-room verifies it, and returns continuation state |
| Verification | Separate Standards and Spec reviewers | Fresh-context reconciliation reruns criteria | Spec Kit convergence finds missing/partial/contradicting/unrequested work; OpenSpec verify is advisory | Deterministic verifier first; Product, Scope, Engineering, integration, visual, human, external gates all conjunctive |
| Completion lifecycle | Handoff/issue history | DONE/BLOCKED/TODO plan status | OpenSpec syncs current spec then archives change, even with explicit warning override | No warning override: preserve shipped spec/attestation, then delete only fully proven active package |

## Ideas adopted

### From Matt Pocock

- Predictable process, not identical generation.
- Primary sources at context boundaries; handoffs point to them instead of
  replacing them with lossy summaries.
- One state-derived router entry point, equivalent in purpose to `ask-matt`.
- One-question prototypes with evidence retained outside production.
- Pre-agreed public verification seams and independently sourced expected
  values.
- Vertical tracer bullets and expand-contract sequencing for wide changes.
- Separate spec-compliance and engineering-quality review axes.
- Lean skill bodies with progressive disclosure and one source of truth.

### From shadcn/improve

- Plans written for a fresh, weaker executor: exact paths, current-state facts,
  verified commands, expected results, scope, STOPs, and commit workflow.
- Planning from inspected repository facts instead of generic advice.
- Cold review in a fresh context and explicit drift reconciliation.
- Isolated worktrees for source-mutating execution.

### From Spec Kit and OpenSpec

- Pre-execution analysis across spec/plan/tasks.
- Requirements checklists that test completeness, clarity, consistency,
  measurability, scenario coverage, and explicit exclusions—not code behavior.
- Append-only convergence findings; a clean rerun leaves the task artifact
  byte-identical.
- Separate durable shipped specs from active change/execution packages.
- Explicit deltas when a shipped contract changes.

### From agent-runtime and eval practice

- LangGraph's durable-execution rule is the right analogy: keep orchestration
  deterministic, isolate stochastic/side-effecting work in checkpointed tasks,
  and make retries idempotent. Tailrocks adopts the pattern, not the framework:
  [LangGraph durable execution](https://docs.langchain.com/oss/javascript/langgraph/functional-api).
- Grade final environment outcomes, not transcript claims; retain traces for
  diagnosis. OpenAI describes a skill eval as prompt → captured trace/artifacts
  → checks; Anthropic distinguishes trials, graders, transcripts, and outcomes.
- Use pass@1 for first-try success and pass^k for consistency. Majority is not
  evidence that all runs are reliable.
- Reinject only the current concise slice contract on a measured cadence. The
  plan-compliance result used five trajectory steps; Tailrocks treats that as a
  starting hypothesis to evaluate per provider, not a universal constant.
- Treat every coding agent as an untrusted candidate generator. Scope scans,
  protected-path checks, and clean verifier replay remain mandatory even when
  PreToolUse hooks appeared to prevent forbidden writes.
- Audit the grader itself. OpenAI's 2026 SWE-Bench Pro audit found broad classes
  of overly strict, underspecified, and low-coverage tasks:
  [evaluation audit](https://openai.com/index/separating-signal-from-noise-coding-evaluations/).

## User-goal coverage

| Requested property | Owning plan(s) | Acceptance evidence |
|---|---|---|
| Preserve original idea/voice as first truth | 003 | append-only text/blob source hashes; loss/invention fixtures |
| Interview until intent is shaped without losing answers | 001, 003 | scripted multi-turn/correction/resume evals; source supersedence |
| Research unknown facts and feed them back safely | 003 | stable cited research facts with freshness/invalidation; facts remain non-normative |
| Resolve empirical unknowns instead of guessing | 008 | isolated one-question experiment; retained runnable evidence; explicit decision route |
| Finalize flows/screens/quality bars before implementation | 003, 007 | scenario-class requirements checklist; typed visual/human seams; approval attestation |
| Record/reverse decisions explicitly | 003 | immutable decision sources, tombstones, selective invalidation |
| Produce complete ordered implementation plans | 004 | requirement/gate/plan coverage graph, DAG, vertical-slice and prerequisite checks |
| Get neither less nor more | 004, 005, 007 | bidirectional requirement evidence plus default-deny enforceable effect budgets and Scope review |
| Execute repeatedly through native `/goal` | 006 | Codex-first, Grok, and Claude native-goal adapters over one verifier; no standalone loop replacement |
| Resume after failure without trusting agent status | 005, 006 | leases, candidates, idempotent state events, hash-bound receipts, bounded repair |
| Independently verify each completed item and whole package | 007 | fresh Product/Scope/Engineering reviewers plus deterministic/integration/visual/human gates |
| Backtrack to the right earlier skill | 007 | pure `tailrocks goal next` route consumed by native `/goal`; append-only findings |
| Keep GOAL current after incomplete reconciliation | 004, 007 | canonical state invalidates receipts; generated GOAL reopens existing plans or blocks for replan |
| Delete fully completed active plans without losing truth | 009 | durable spec/completion attestation; guarded temporary-worktree retirement; Git recovery |
| Measure actual predictability and improve monotonically | 001, 010 | outcome artifacts/traces, pass@1/pass^k, paired utility, verifier-defect regressions |
| Preserve strict Rust/TypeScript/React/TanStack house rules | 007 | separate Engineering Integrity axis driven by the existing house-stack skills |

## Explicit non-goals and trust limits

- No promise of identical patches, prose, interview questions, or reviewer
  conclusions across runs.
- No requirement to replace native Codex/Grok/Claude `/goal` with a standalone
  agent supervisor. Headless provider commands exist for conformance testing,
  not as the primary user workflow.
- No score, average, or reviewer majority may override one current concrete
  failure.
- No model-authored summary, checkbox, or transcript-only `/goal` evaluator is
  completion proof.
- No adversary-resistant claim when executor and verifier share an unrestricted
  host or writable trust root. Such evidence is labeled `local_non_adversarial`;
  stronger packages require operator- or CI-owned attestation.
- No framework migration to LangGraph, Spec Kit, or OpenSpec. Their proven
  control patterns are implemented in the fixed Rust/Bun Tailrocks stack.
- No autonomous external/irreversible effect unless the effect is explicitly
  authorized, observable, idempotent where possible, and protected by the
  required operator boundary.

## Plan changes caused by this re-verification

The plans now require:

- scripted multi-turn and interruption/resume eval scenarios;
- RFC 8785 canonical JSON and cross-language golden vectors;
- multimodal source blobs, stable identity tombstones, requirement-quality
  coverage, and honest approval trust modes;
- enforceability classes for effects and staged acceptance-oracle anchoring;
- subject-tree receipts that survive control-only retirement commits;
- a compiled `goal.contract.json`, thin generated `GOAL.md`, and persistent
  controller-owned state/budgets outside the executor worktree;
- explicit CLI discovery/version/digest bootstrap and portable release assets;
- native `/goal` as the required Codex-first/Grok/Claude execution surface,
  with no standalone supervisor fallback;
- isolated executor worktrees, second clean verifier worktrees, complete
  tracked/untracked/effect scans, and controller-owned verified commits;
- a state-derived `tailrocks goal next` router, automatic final reconcile, and
  append-only convergence ledger;
- retained prototype source/evidence instead of discarding the sole primary
  artifact;
- non-self-referential completion attestations and staged retirement;
- adversarial forged-status/oracle-tamper/scope/resume fixtures; pass@1/pass^k,
  confidence-aware sampling, and false-completion gates, never majority proof.
