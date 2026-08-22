# Skill portfolio audit and responsibility migration

- Audited at: 2626d51827747c3b3e0e76cd20a7d38363c82648 (2026-08-22)
- Scope: all 43 skills, their routers, references, templates/scripts, evals, client metadata, catalogs, generated documentation, validator, eval runner, and CI wiring
- Static gates: mise run lint passed (43 skills); mise run docs:check passed (133 files); mise run test passed (107 tests)
- Behavioral evidence: not measured; the repository stores no baseline runs, repeated trials, pass^k results, mutation results, tool traces, or complete runtime pins

## Verdict

The portfolio is mechanically well wired but responsibility-heavy and empirically uncertified.

- 22 current skills need a responsibility split.
- 1 current skill should merge into a clearer owner.
- 1 current skill should retire into a deterministic script.
- Six deterministic seam classes should move out of model prose while their judgment/authorization skill remains: audit IDs, PR checkout, PR review posting, merge preflight, visual harnessing, and agent symlinks. The visual class may have platform-specific implementations.
- 19 skills keep their core responsibility, though several need contract or eval repairs.
- The current 43 skills expose 258 authored eval cases. Only 10 skill fixture sets can establish every claimed normal path; 33 cannot.
- Seventeen routers expose explicit modes. Mode syntax is not itself a defect; a split is required where the branches differ in trigger, output/oracle, authority, side effects, or independent failure path.

The supplied research was applied as doctrine, not copied as provenance. Its strongest relevant conclusions are: one observable outcome, exclusive routing, program-owned decidable work, minimal sufficient context, structured external validation, and repeated mutation-aware evidence. Direct experiments comparing monolithic SKILL.md files with split skills do not yet exist. The split rule is therefore an evidence-backed engineering default, not a numeric law. The requested separate improve commands are a settled product contract and are proposed below.

## Cross-portfolio findings

### OVL-1 — Mode umbrellas cross responsibility boundaries

- **Defect:** Twenty-two skills combine independently invokable read-only judgment, mutation, lifecycle, or contract-change jobs. The user must select a mode before the skill has one observable outcome.
- **Evidence:** skills/tailrocks-improve/SKILL.md:23, skills/tailrocks-audit/SKILL.md:28, skills/tailrocks-contribute/SKILL.md:37, skills/tailrocks-macos-design/SKILL.md:30, skills/tailrocks-macos-visual-qa/SKILL.md:39, skills/tailrocks-rust-project-setup/SKILL.md:28, skills/tailrocks-typescript-best-practices/SKILL.md:36.
- **Fix:** execute the 43-row responsibility map below through a contract-breaking skill migration; keep true transactions together.
- **Dimensions:** contract, predictability, efficiency, topology, security.
- **Identity tuple:** overlap; one independently invokable responsibility; mode umbrella crosses authority/output/oracle; portfolio responsibility ownership; catalog.json groups and mode headings.
- **Action:** refactor.
- **Acceptance:** every public trigger resolves to exactly one owner; no resulting router selects between read-only and mutating authority or between different durable outputs.

### OVL-2 — Repository audit ownership is duplicated

- **Defect:** tailrocks-improve and tailrocks-audit both perform repository recon, parallel audit lanes, evidence vetting, ranking, planning, and backlog reconciliation. The delivery/pipeline distinction changes the destination, not the judgment owner.
- **Evidence:** skills/tailrocks-improve/SKILL.md:38-98 and skills/tailrocks-audit/SKILL.md:59-143. Audit additionally carries ask, next, execute, and sweep at skills/tailrocks-audit/SKILL.md:28-53 and 145-178.
- **Fix:** make the improve family the only repository-audit owner; route roadmap seeding to tailrocks-seed-roadmap, questions/direction to tailrocks-research, branch review to tailrocks-review-pr, execution/reconciliation to focused owners, and retire tailrocks-audit after a compatibility window.
- **Dimensions:** contract, efficiency, topology, predictability.
- **Identity tuple:** overlap; exclusive responsibility ownership; duplicate audit and planning pipeline; repository improvement audit; improve and audit workflows.
- **Action:** refactor.
- **Acceptance:** no audit rubric or lane is defined in two skills; pipeline choice occurs only after a verified audit artifact exists.

### REF-1 — Shared doctrine has multiple authoritative homes

- **Defect:** repository-audit lanes, delivery git rules, design-stage choreography, PR conventions, version policy, research shape, TypeScript/Oxc configuration, and runtime trust clauses are repeated or manually synchronized.
- **Evidence:** skills/tailrocks-plan/references/research-shape.md:3-5, skills/tailrocks-research/SKILL.md:68-115, skills/tailrocks-typescript-best-practices/references/compiler-lint-testing.md:1-64, skills/tailrocks-tanstack-project-setup/references/tooling-and-quality.md:14-41, and identical trust clauses found across nineteen routers.
- **Fix:** use the canonical-home map below. For the short runtime trust invariant, author it once and generate/byte-validate the packaged local clause so each standalone skill remains safe without maintaining divergent prose.
- **Dimensions:** efficiency, predictability, topology, portability, security.
- **Identity tuple:** references; one canonical statement per rule; duplicated shared policy; cross-skill common doctrine; cited reference and router paragraphs.
- **Action:** refactor.
- **Acceptance:** each shared fact has one authored source; generated local invariants are byte-identical and validator-owned; no manual “keep this copy matched” text remains.

### EVAL-1 — Authored cases are not reliability evidence

- **Defect:** The portfolio has case prose but no persisted baseline/control run, repeated-trial result, pass^k metric, mutation result, runtime lock, or tool trace. Single-run intent cannot certify predictable behavior.
- **Evidence:** mise.toml:51-53 says the runner is not wired; .github/workflows/validate.yml:27-31 runs static validation/tests only; scripts/run-evals.ts:458-460 defaults to one run and 521-525 deletes passing workspaces and prints the only result.
- **Fix:** use strict non-protected deterministic evidence, durable result
  envelopes, changed-skill and scheduled CI lanes, and capability-specific
  workflow runners directly; no evaluation product route exists.
- **Dimensions:** behavior, predictability, portability, security.
- **Identity tuple:** evals; repeated discriminating evidence; no stored behavioral execution; all skills; eval runner and CI wiring.
- **Action:** validator.
- **Acceptance:** each changed skill has a failing control/baseline when applicable, non-certifying 3/3 smoke candidate runs under an exact runtime lock, mutation cases, stable claim IDs, deterministic assertions, redacted tool traces, and a dated source-hash-bound evidence record. Release certification uses the target-derived campaign defined below; no fixed three-run or five-run result is presented as a reliability guarantee.

### EVAL-2 — The eval harness cannot observe many claimed outcomes

- **Defect:** The judge can accept its own empty claim list, the subject receives only directly linked Markdown under truncation caps, templates/scripts are absent, workflow cases never launch, and final prose/artifacts substitute for tool events and before/after state.
- **Evidence:** scripts/run-evals.ts:37-115, 370-399, 446-472, and 485-524; scripts/validate-skills.ts:377-411 validates only the shallow legacy case shape.
- **Fix:** atomize oracle claims with stable IDs; derive aggregate pass in code; stage the complete read-only skill package; record tool events and filesystem/git manifests; implement Linux, macOS GUI, and mocked-external runners.
- **Dimensions:** contract, behavior, predictability, security, portability.
- **Identity tuple:** evals; external oracle must observe outcome; judge and fixture blind spots; portfolio eval infrastructure; run-evals subject/judge path.
- **Action:** validator.
- **Acceptance:** zero checked claims fails; every state-changing assertion has a matching event/receipt; read-only cases prove zero mutation; no binding file is truncated; workflow cases return the same evidence envelope as single-subject cases.

## Reliability evidence contract

- Use pass^k when the claim is consistent execution: all k required trials must pass. Use pass@k only for explicitly labeled discovery or diversity tasks where one successful candidate is the intended outcome.
- Predeclare the reliability or maximum failure-rate target, confidence level or interval method, trial independence assumptions, runtime surface, and stopping rule before execution. Derive the required sample size from those values; never choose it from a fixed folklore count.
- Pin the exact subject model/version, settings, tool schemas, skill source hash, reference/template/script hashes, checker/judge versions, fixture hash, operating system or SDK image, and dependency lock. A result certifies only that pinned envelope.
- Include normal, boundary, safety, near-miss routing, and intent-preserving mutation cases. A model judge requires stable atomic claim IDs, aggregate-pass derivation in code, blinded control/candidate order where applicable, and a measured judge-versus-human agreement sample.
- Treat non-certifying 3/3 smoke and five-run exploratory variance as fast regression signals only. Promotion requires the target-derived pass^k campaign and its durable raw results; any changed binding input invalidates the certification.

The current per-skill baseline is enumerated in the [43-skill behavioral-evidence matrix](portfolio-evidence-matrix.md): 258 authored cases, 10 fixture-adequate normal-path sets, and no persisted baseline, repeated/pass^k, mutation, complete runtime-lock, or tool-trace evidence.

### RTR-1 — Decidable transforms and legal branches remain prose-owned

- **Defect:** Stable finding IDs, PR checkout/preflight, merge contradiction checks, visual capture setup, and symlink topology are described as model steps even though software can decide them exactly.
- **Evidence:** skills/tailrocks-skill-audit/references/report-format.md:47-63, skills/tailrocks-checkout-pr/SKILL.md:17-39, skills/tailrocks-merge-pr/SKILL.md:61-120, skills/tailrocks-macos-visual-qa/templates/window-id.swift:88-106, and skills/tailrocks-agents-md/SKILL.md:83-103.
- **Fix:** add deterministic scripts listed in the map; skills keep only semantic judgment, explicit authority, and interpretation of validated results.
- **Dimensions:** contract, predictability, efficiency, security.
- **Identity tuple:** router; deterministic work belongs in software; model owns exact legal transitions; portfolio mechanics; cited procedures.
- **Action:** validator.
- **Acceptance:** scripts reject invalid/unmatched state, have bounded retries and tests, print a machine-readable mutation set, and are the only path used by the corresponding skill.

### WIRE-1 — The authoring family cannot prove or execute the desired migration

- **Defect:** skill-refactor writes a migration handoff while claiming refactor-only scope; no skill owns approved contract-breaking execution; create/update exclude eval artifact edits even though house wiring requires them; the canonical doctrine lives under the audit skill.
- **Evidence:** skills/tailrocks-skill-refactor/SKILL.md:34-50, skills/tailrocks-skill-create/SKILL.md:71-96, skills/tailrocks-skill-update/SKILL.md:60-65, and skills/tailrocks-skill-audit/SKILL.md:84-94.
- **Fix:** keep create/update/refactor exclusive from contract migration, move
  canonical doctrine to repository-owned `skill-authoring/references`, and use
  separately scoped direct branch/PR authorization with no product route or
  migration artifact.
- **Dimensions:** contract, behavior, topology, portability.
- **Identity tuple:** wiring; complete authoring lifecycle; no owner for migration/evidence; skill authoring family; authoring routers and doctrine paths.
- **Action:** instruction.
- **Acceptance:** a contract-breaking split is performed directly in the named
  authorized branch/PR with rollback proof; no authoring skill, deprecated
  alias, dispatcher, product route, or migration artifact mediates it.

## Final improve family

The requested command shape becomes the public contract:

| Skill | One responsibility | Output |
|---|---|---|
| tailrocks-improve | Standard repo-neutral audit; orchestrates focused read-only lanes | One verified audit report |
| tailrocks-improve-deep | Exhaustive whole-repository audit with independent refutation | One verified exhaustive audit report |
| tailrocks-improve-security | Security-only audit with its own threat/evidence rubric | One security report; never fixes or publishes secrets |
| tailrocks-improve-plan | Convert one selected finding or described change into one executor-ready standalone plan | One plan plus index row |
| tailrocks-improve-execution | Execute one approved standalone plan in an isolated worktree and return a reviewed diff | One execution verdict and recoverable worktree/branch |
| tailrocks-improve-reconcile | Reverify, unblock, or retire the standalone plans backlog | Updated plans index only |
| tailrocks-seed-roadmap | Convert already-verified findings/plans into roadmap packages or DRAFT items | Roadmap artifacts only |

Routing removed from the current umbrellas:

- Current tailrocks-improve quick is folded into the bounded standard audit policy; it is not independently invokable.
- Current tailrocks-improve plan and reconcile move to their named skills.
- Current tailrocks-audit default/quick/non-security category routes move to improve; whole-repository deep moves to improve-deep; security routes move to improve-security.
- Current tailrocks-audit ask and next move to tailrocks-research.
- Current tailrocks-audit branch moves to tailrocks-review-pr.
- Current tailrocks-audit platform lanes route to web-design-audit, tui-design-audit, or macos-design-review.
- Current tailrocks-audit execute and sweep move to improve-execution and the appropriate reconcile skill.
- Current tailrocks-audit roadmap destination moves to seed-roadmap. Tailrocks-audit is then retired.

## 43-skill responsibility disposition

| Current skill | Decision | Resulting responsibility map |
|---|---|---|
| tailrocks-rust-project-setup | SPLIT | project-setup scaffolds; rust-project-audit reports gaps; rust-project-remediate closes approved gaps |
| tailrocks-rust-best-practices | SPLIT | best-practices writes Rust; rust-review reports; rust-refactor preserves behavior while restructuring |
| tailrocks-axum-best-practices | SPLIT | best-practices builds adapters; axum-review reports; axum-refactor preserves behavior |
| tailrocks-graphql-best-practices | SPLIT | best-practices evolves public GraphQL; graphql-review reports diff/whole-surface defects |
| tailrocks-grpc-best-practices | SPLIT | best-practices evolves internal gRPC; grpc-review reports diff/whole-surface defects |
| tailrocks-tanstack-project-setup | SPLIT | setup scaffolds; project-audit reports; project-migrate migrates; project-remediate closes gaps |
| tailrocks-typescript-best-practices | SPLIT | best-practices writes UI code; typescript-review reports; typescript-refactor preserves; typescript-migrate migrates |
| tailrocks-swift-best-practices | SPLIT | best-practices writes Swift; swift-review reports; swift-refactor preserves behavior; Rust-core/platform-shell architecture moves to one focused boundary owner |
| tailrocks-swift-project-setup | SPLIT | setup scaffolds; project-audit reports; project-remediate closes gaps; agent integration and Rust bridge setup become focused owners |
| tailrocks-macos-design | SPLIT | design + runnable prototype + blessing stay atomic; design-review independently scores; design-systematize promotes accepted rules |
| tailrocks-web-design | SPLIT | design produces/blesses routes; web-design-audit reports package defects |
| tailrocks-tui-design | SPLIT | design produces/blesses/freezes golden frames; tui-design-audit reports defects |
| tailrocks-macos-visual-qa | SPLIT | visual-qa drives/judges; visual-baseline freezes; visual-regression compares; harness mechanics move to script |
| tailrocks-web-visual-qa | SPLIT | web-visual-baseline freezes; web-visual-regression compares; harness mechanics move to script |
| tailrocks-code-health | SPLIT | code-health establishes/tightens one ratchet; code-health-audit measures read-only |
| tailrocks-improve | SPLIT | use the seven-skill improve family above |
| tailrocks-agents-md | SPLIT | agents-md adds one rule; agents-md-audit reports; agents-md-sync applies approved topology repair; symlinks move to script |
| tailrocks-retrospect | KEEP | reconstruct one delivered item and propose skill patches only |
| tailrocks-simplify | SPLIT | simplify-audit finds removals; simplify applies approved removals |
| tailrocks-remediate | SPLIT | root-cause proves/derives design; remediate implements the approved correction |
| tailrocks-rethink | MERGE/RETIRE | analysis merges into root-cause; authorized breaking rebuild merges into remediate |
| tailrocks-contribute | SPLIT | contribute-recon, contribute-propose, contribute-prepare, contribute-submit, contribute-respond; shared contrib folder is durable handoff |
| tailrocks-skill-create | KEEP/REPAIR | one atomic create transaction; decide placement before durable evidence; author eval cases |
| tailrocks-skill-update | KEEP/REPAIR | one semantic fixed-contract update; inventory sibling ownership; author full regression changes |
| tailrocks-skill-audit | KEEP/REPAIR | one read-only audit schema at one/all scale; deterministic ID reconciler |
| tailrocks-skill-refactor | SPLIT | behavior-preserving topology only; migration planning/execution move to new owners |
| tailrocks-create-pr | KEEP/REPAIR | one branch/commit/body/open transaction; run declared pre-open gates |
| tailrocks-refresh-pr | KEEP/REPAIR | one existing-PR metadata reconciliation; complete command arguments/recovery |
| tailrocks-checkout-pr | MOVE TO SCRIPT | scripts/checkout-pr.ts owns deterministic resolution/guard/switch/verification; retire skill |
| tailrocks-review-pr | KEEP + EXTRACT | verified read-only review only; scripts/post-pr-review.ts owns validated/deduplicated posting after fresh approval |
| tailrocks-merge-pr | KEEP + EXTRACT | authorization/judgment/merge transaction remains; scripts/merge-preflight.ts owns exact checks and bounded polling |
| tailrocks-document | KEEP/REPAIR | one final docs truth pass; align shared ordering predicate and add fixtures |
| tailrocks-pr-template | KEEP/REPAIR | one repository template derivation/reconciliation; resolve alternate existing path |
| tailrocks-audit | RETIRE/SPLIT | audit moves to improve family; remaining modes route to research, plan, execution, reconcile, or seed-roadmap |
| tailrocks-idea | KEEP | capture one raw idea as DRAFT |
| tailrocks-brainstorm | KEEP/REPAIR EVAL | shape one item with a live decision interview |
| tailrocks-research | KEEP/ABSORB | own reusable sourced research plus former audit ask/next; never decide |
| tailrocks-record-decision | KEEP/REPAIR EVAL | record and propagate one user decision |
| tailrocks-finalize | KEEP/REPAIR EVAL | close shaping and grant READY |
| tailrocks-plan | KEEP/REPAIR | one frozen READY-to-plan/goal transaction; research skill alone writes research topics |
| tailrocks-record-feedback | KEEP/REPAIR EVAL | capture one feedback round without judging |
| tailrocks-prove | KEEP/REPAIR EVAL | execute shipped surfaces and write one verification round |
| tailrocks-reconcile | KEEP/REPAIR EVAL | truth-sync and retire one item as one closer transaction |

## Canonical content homes

| Doctrine/content | Canonical home | Consumers |
|---|---|---|
| Operational contract, authority, retries, recovery, idempotency | skill-authoring/references/operational-contract.md | create, update, audit, refactor, migration, evaluate |
| Responsibility topology and exclusive routing | skill-authoring/references/responsibility-topology.md | all authoring skills and validator |
| Context economy, descriptions, progressive disclosure | skill-authoring/references/context-routing.md | create, update, audit |
| Statistical, mutation, tool-use, and regression evidence | skill-authoring/references/testing-reliability.md | create, update, audit, evaluate |
| House artifacts/client wiring | skill-authoring/references/house-wiring.md | create, update, refactor, migrate |
| Runtime trust/secrets invariant | shared/references/runtime-trust.md authored once; generated local clause | every packaged skill |
| Repository audit lanes | shared/references/repository-audit-lanes.md | improve and improve-deep; security/platform owners are routed, not copied |
| Contribution lifecycle handoff and trust boundary | shared/references/contribution-handoff.md | five contribution-stage skills |
| Delivery git transaction | current tailrocks-idea/references/delivery-git-contract.md | delivery writers link it directly |
| Design/bless/freeze/audit choreography | shared/references/design-pipeline.md | platform design and visual-baseline skills |
| Common PR conventions/precedence/section registry | shared/references/pr-conventions.md | create, refresh, review, merge, document, pr-template receive generated local copies; create keeps its owner-relative body adapter |
| Latest-stable base rule | shared/references/version-policy.md | ecosystem setup skills add only ecosystem facts |
| TypeScript/Oxc/Bun project configuration | tanstack project setup | TypeScript best practices owns code semantics only |
| Reusable research topic format | tailrocks-research | plan emits gaps and waits; never copies research procedure |

Current validation rejects links that escape a skill directory. Every shared/repository-owned source above is therefore packaged as a generated skill-local copy and byte-validated against its authored source. A sibling skill never links another sibling's private reference. Ecosystem files retain only ecosystem-specific adapters; common version/runtime clauses move to the shared authored source.

## Exact content movement plans

Every current skill marked `SPLIT`, `MERGE/RETIRE`, `MOVE TO SCRIPT`, `KEEP + EXTRACT`, or `RETIRE/SPLIT` above has a source-to-target manifest. Each manifest assigns `SKILL.md` sections, references, templates/scripts, eval IDs, fixtures, generated/client surfaces, aliases, and removal gates:

- [Stack, improvement, and authoring movement](content-movement-stack-authoring.md)
- [Design, visual QA, and pull-request movement](content-movement-design-pr.md)
- [`tailrocks-audit` retirement movement](content-movement-audit-retirement.md)

The manifests are migration specifications, not implementation. `KEEP`, `MOVE`, `COPY`, and `DELETE` are exhaustive ownership operations; `COPY` is used only when the consumers need independently enforceable boundary text or target-specific fixture/oracle behavior.

## Skill-authoring family after migration

| Skill | Sole responsibility |
|---|---|
| tailrocks-skill-create | Atomically create one evidenced, unowned skill and all supported wiring |
| tailrocks-skill-update | Change behavior inside one fixed responsibility/public contract and update non-protected deterministic evidence |
| tailrocks-skill-audit | Read-only report over one skill or portfolio; no edits |
| tailrocks-skill-refactor | Split/merge/extract while observable public contracts remain identical |

Authoring changes required before portfolio migration:

1. Move doctrine out of the audit skill so no operational skill owns shared policy by accident.
2. Make update inspect sibling ownership before editing; a delta already owned elsewhere routes to that owner, and a new separate responsibility routes to refactor/migration.
3. Make create decide placement before it writes durable evidence; rejected placement leaves no partial artifact.
4. Keep frozen legacy eval files inactive and untouched; author non-protected
   deterministic evidence instead.
5. Prove refactor split, keep-together, and contract-delta refusal through
   non-protected deterministic tests.
6. Remove old public names and routes directly in the authorized branch/PR; do
   not create migration or evaluation product owners.

## Migration sequence

### Wave 0 — Freeze and authorize

Bind explicit direct-migration authority to the named branch and pull request.
Map every old invocation to exactly one new owner, inventory durable artifacts,
define rollback, remove the old public names/routes in the same change, and prove
the final topology. No compatibility alias or delayed-removal route remains.

### Wave 1 — Build authoring/eval substrate

Land canonical authoring references, deterministic ID reconciliation,
non-protected evidence formats, capability registry, and CI lanes. Keep the four
authoring owners exhaustive and manual-only.

### Wave 2 — Remove duplicated sources

Move common audit, delivery, design-pipeline, PR, version, research, and runtime-trust rules to their canonical homes. Add generator/validator checks. Preserve each current public behavior during this wave.

### Wave 3 — Migrate improve first

Create the requested improve family and seed-roadmap. Rehome tailrocks-audit modes. Run old-route compatibility and direct new-route activation tests. Retire tailrocks-audit only after every old route has a tested target.

### Wave 4 — Split authority umbrellas

Migrate language/service/setup review versus mutation skills, then agents-md, simplify, remediate/rethink, and contribute. One skill migration per pull request or otherwise one independently reviewable commit series per skill; do not batch unproven behavior changes.

### Wave 5 — Split design/visual responsibilities

Keep real-substrate transactions intact, split independent reviewers/baselines/regression, and move capture/harness mechanics to tested scripts. Correct the macOS harness fail-closed defects before it becomes a shared primitive.

### Wave 6 — Extract deterministic PR/mechanical work

Extract six deterministic seam classes: checkout-pr, post-pr-review, merge-preflight, visual harness, agent-symlink, and audit-ID. Visual harnessing may use separate macOS and web scripts. Skills consume typed results and retain only judgment/authority.

### Wave 7 — Remove aliases and certify

After the compatibility window, remove old names/modes, regenerate all client/docs surfaces, run the full pinned portfolio suite, and publish evidence bound to the final source hashes.

## Completion gates

- Every old invocation maps to exactly one target; no orphan, duplicate, or silent contract loss.
- Every skill has one independently invokable responsibility and one observable output/oracle.
- In-scope, sibling, and none activation cases select exactly one skill.
- Every hard requirement maps to a program check, exact trace assertion, or frozen rubric.
- Decidable transforms and legal transitions are script/schema-owned.
- Shared rules have one authored home; deliberate packaged repetition is generated and byte-checked.
- Every changed skill has baseline/control evidence, normal/boundary/safety/near-miss/mutation coverage, non-certifying smoke results, exact runtime pins, tool/state evidence, and a predeclared target-derived pass^k certification campaign with durable raw results.
- No automatic retry exists for an uncertain mutation; every retry bound and recovery path is explicit.
- mise run lint, mise run docs:check, and mise run test pass; generated docs and all client manifests/catalogs contain each resulting skill exactly once.
- A fresh portfolio audit finds no topology, duplication, eval-freshness, or wiring finding.

## Killed candidates

- Split skill-create into evidence/scaffold/wiring — killed: those phases form one invalid-to-partialize creation transaction after placement is accepted.
- Split skill-audit one versus all — killed: same report schema, authority, and oracle; only scale differs.
- Split macOS design from runnable prototype/blessing — killed: Liquid Glass material and sign-off require the live runtime transaction.
- Split TUI design from golden freeze — killed: the application’s own renderer and golden artifact are one oracle.
- Split create-PR branch/commit/body/open — killed: one recoverable PR creation transaction.
- Split roadmap plan/spec/goal — killed: the frozen fingerprint makes partial output invalid.
- Split prove from its verification lanes — killed: lanes feed one read-only round report.
- Split reconcile truth-sync from retirement — killed: retirement is the terminal branch of one fail-closed closer.
- Treat generated README/docs duplication as a defect — killed: generated files have one source and docs:check is green.
- Treat local absence of mise run evals as permission to run it — killed: current policy makes execution CI-owned; the surviving defect is that CI is absent.
