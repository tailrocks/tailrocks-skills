# Coverage Ledger — Verifiable Native-Goal Delivery

This is the fourth-pass bidirectional coverage authority. IDs are stable. Every
outcome has a source anchor, exact owners, and observable evidence. Every plan
owns a required outcome and one unique capability. Header ownership and the
tables below must match byte-for-byte after range expansion.

The tracked implementation is one indivisible attempt: one frozen base, one
shared branch, one draft PR, checkpoint commits only, and Plan 043's one final
squash merge. Plans downstream of Plan 043 in the dependency DAG are external
activation operations in the same
attempt. They may establish Plan 031's two exact repository settings, publish
the one release, or publish digest-addressed evidence, but may not create
tracked edits, commits, implementation branches, or PRs. Plan 018's exact
software tag is the sole post-merge Git-ref exception.

## Outcome requirements

| ID | Required outcome | Source anchor | Exact owners | Observable acceptance evidence |
|---|---|---|---|---|
| G01 | Preserve user words, corrections, attachments, and voice without persisting secrets. | [RESEARCH outcome](RESEARCH.md#outcome-and-proof-boundary), F4-05 | 004, 015 | classify-before-write; append/crash/supersedence/fidelity fixtures |
| G02 | Keep research informative until explicit adoption. | [RESEARCH outcome](RESEARCH.md#outcome-and-proof-boundary), F4-07 | 015, 016 | adopted/unadopted/reversal/sourced-deferral fixtures |
| G03 | Route empirical uncertainty to bounded reproducible evidence. | [RESEARCH outcome](RESEARCH.md#outcome-and-proof-boundary) | 005 | local/external experiment plus adopt/defer fixtures |
| G04 | Freeze complete READY intent: flows, screens/states/mockups, quality bars, exclusions, and seams. | Finalize/plan contract; F4-08, F4-14 | 016 | typed UI contracts, sourced non-UI N/A, approval/staleness tests |
| G05 | Produce exact acyclic vertical zero-context one-session plans with no missing or extra scope. | `skills/tailrocks-plan/SKILL.md:83-99`; F4-08, F4-14 | 006 | typed coverage/DAG/scope validation plus digest-bound semantic attestation |
| G06 | Use provider-native goal control only where proven and label manual/operator handoff honestly. | [Provider evidence](RESEARCH.md#current-provider-evidence); F4-03, F4-06, F4-16 | 000, 009, 010, 011, 012, 017, 018, 020, 023, 028, 029, 032, 034, 039, 040, 041, 042, 044, 045 | exact version/origin/config/lifecycle or TIER 0; release-bound external closures |
| G07 | Resume without trusting executor status, Git metadata, or budget exhaustion. | `goal-handoff.md:60-79,109-115`; F4-03, F4-13 | 000, 003, 012 | external journal replay/budget/crash and forged-status/Git cases |
| G08 | Verify exact candidates outside executor and PR-head authority. | F4-01, F4-02, F4-10, F4-24, F4-27, F4-34-F4-45, F4-50 | 002, 003, 009, 012, 018, 019, 021, 022, 023, 024, 030, 031, 032, 033, 034, 035, 036, 044, 045 | live confinement, protected authority, signed artifacts, policy, candidate-as-data proof |
| G09 | Prevent later slices from regressing earlier accepted behavior. | F4-04 | 007, 012 | complete requirement-gate union rerun on exact final tree |
| G10 | Keep semantic, visual, human, and external judgment current, subject-bound, and conjunctive. | [Proof boundary](RESEARCH.md#outcome-and-proof-boundary), F4-15 | 007 | subject/freshness/failing-axis/reviewer-capability fixtures |
| G11 | Retain compound failures and route earliest causal owners. | F4-15 | 007 | complete failure-set/routing/incomparable-root tests |
| G12 | Keep GOAL/status current while only the kernel issues PASS. | F4-03, F4-09 | 003, 007, 011, 012 | payload/journal/session/broker mismatch and provider equivalence |
| G13 | Apply safely, retire a readable proof closure, and reopen after squash/ref deletion. | F4-11, F4-12, F4-20 | 013, 014 | guarded apply, hostile Git, evidence+bundle closure, fresh clone |
| G14 | Measure artifacts/trials honestly; no score, majority, sample, or attestation alone is proof. | `scripts/run-evals.ts:72-140`; F4-02, F4-16, F4-30, F4-33-F4-45 | 001, 008, 009, 017, 018, 019, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 044 | retained trials, exact provenance, one recoverable release, native/evidence fan-in |
| G15 | Preserve house gates and qualify/distribute Codex, Grok, and Claude only where proven. | `AGENTS.md`; [Provider evidence](RESEARCH.md#current-provider-evidence); F4-28, F4-31-F4-45, F4-50 | 002, 006, 008, 009, 010, 012, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 044, 045 | offline gate, protected authority, public CLI/OCI lifecycle, exact target matrix |
| G16 | Fully implement the whole system in one attempt, on one branch and one PR, then merge it once as one final tree. | User delivery invariant; F4-45 | 010, 017, 018, 019, 020, 034, 043, 044 | one branch/PR/base/head receipt set; final-head replay; one squash merge; no later tracked implementation |

## Guardrails

Every owner below inlines the ID in metadata and its Must NOT section.

| ID | Must NOT | Exact owning plans |
|---|---|---|
| N01 | Executor/model status, transcript, score, or majority creates PASS. | 000, 001, 003, 006, 007, 008, 010, 011, 012, 020, 021, 025, 026, 029, 032, 036, 037, 038, 041, 042, 044 |
| N02 | Budget exhaustion satisfies acceptance. | 000, 012 |
| N03 | Mutable repository prose/config selects privileged controller, hook, Git, or workflow argv. | 000, 006, 010, 011, 012, 013, 018, 020, 022, 023, 024, 032, 034, 036, 044, 045 |
| N04 | Clean clone, sanitized environment, or provider sandbox is called child-process confinement. | 002, 003, 006, 010, 011, 012, 018, 020, 023, 032, 036, 045 |
| N05 | Candidate code runs outside a proven verifier sandbox for autonomous gates. | 001, 002, 003, 005, 006, 008, 009, 010, 011, 012, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 030, 032, 033, 034, 035, 036, 037, 044, 045 |
| N06 | Credentials or sensitive bytes enter Git, evidence, model tools, or candidate processes. | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 043, 044, 045 |
| N07 | PR-head verifier mints protected evidence for its own PR. | 002, 003, 006, 007, 009, 010, 012, 017, 018, 019, 020, 021, 022, 023, 024, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 039, 040, 041, 042, 043, 044, 045 |
| N08 | Historical slice/intermediate results discharge final-tree requirements. | 003, 006, 007, 008, 009, 010, 011, 012, 014, 017, 018, 019, 020, 021, 022, 023, 024, 027, 032, 033, 034, 035, 036, 043, 044 |
| N09 | Runtime parses free-form Markdown into canonical authority. | 004, 006, 007, 012, 016 |
| N10 | Skills without the binary emulate canonical source/journal/contract writers. | 005, 006, 015, 016 |
| N11 | PASS automatically applies, pushes, merges, publishes, or retires. | 002, 005, 007, 009, 013, 014, 017, 018, 019, 020, 021, 022, 023, 024, 027, 028, 029, 030, 031, 033, 034, 035, 036, 039, 040, 041, 042, 043, 044 |
| N12 | Provider/reviewer state forks contract, journal, or receipt authority. | 003, 005, 006, 007, 010, 011, 012, 018, 020, 023, 029, 032, 041, 042, 044 |
| N13 | Hashes, samples, or attestations are described as completeness, semantic truth, or full hidden context. | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 043, 044, 045 |
| N14 | Shared writable build/result caches cross candidates in V1. | 003, 006, 007, 008, 012, 014, 021, 024, 027, 036 |
| N15 | Proof depends on feature-ref reachability, object cache, or unsafe extraction. | 014, 021, 024, 036 |
| N16 | Untrusted paths, files, processes, outputs, evidence, or retries are unbounded or overflow passes. | 001, 002, 003, 004, 005, 006, 007, 008, 009, 010, 011, 012, 013, 014, 017, 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 029, 030, 031, 032, 033, 034, 035, 036, 037, 038, 039, 040, 041, 042, 043, 044, 045 |
| N17 | Autonomous provider claims same-user host-read confidentiality. | 002, 009, 010, 011, 012, 018, 020, 022, 023, 029, 032, 033, 034, 035, 036, 041, 042, 044, 045 |
| N18 | Unmounted expected bytes or bounded pass/fail access is called confidential. | 003, 006, 008, 010, 011, 012, 018, 019, 020, 021, 023, 024, 029, 032, 034, 035, 036, 041, 042, 044 |
| N19 | Any second implementation branch/PR, intermediate merge, post-merge tracked fix/docs/evidence commit, second version, or second software release completes this attempt. | 010, 017, 018, 019, 020, 021, 023, 024, 028, 029, 030, 031, 034, 039, 040, 041, 042, 043, 044 |

## Plan reverse mapping

| Plan | Covers | Immediate dependency | Phase | Unique delivered capability |
|---|---|---|---|---|
| 000 | G06,G07 | — | tracked | gate-first advisory legacy handoff |
| 001 | G14 | — | tracked | bounded retained-artifact eval-v2 verdict |
| 002 | G08,G15 | — | tracked | provider-neutral live OCI confinement proof |
| 003 | G07,G08,G12 | 002 | tracked | provider-free exact-tree acceptance tracer |
| 004 | G01 | 003 | tracked | sensitivity-safe immutable source store |
| 005 | G03 | 016 | tracked | bounded empirical prototype route |
| 006 | G05,G15 | 000,016 | tracked | typed package compiler and generated views |
| 007 | G09-G12 | 012 | tracked | current convergence and causal routing |
| 008 | G14,G15 | 005,014 | tracked | offline kernel/adversarial gate |
| 009 | G06,G08,G14,G15 | 027,045 | tracked | release-candidate binary/OCI/provenance lane |
| 010 | G06,G15,G16 | 012 | tracked | honest Grok origin/tier/adapter implementation |
| 011 | G06,G12 | 003,032 | tracked | three-method native Codex transport |
| 012 | G06-G09,G12,G15 | 006,011 | tracked | serial multi-slice exact-final-tree runtime |
| 013 | G13 | 007 | tracked | worktree-consistent sanitized-Git apply |
| 014 | G13 | 013 | tracked | proof-closed archive and reopen |
| 015 | G01,G02 | 001,004 | tracked | append-before-synthesis capture |
| 016 | G02,G04 | 015 | tracked | complete source-anchored READY authority |
| 017 | G06,G14-G16 | 036,044 | tracked | sole whole-stack version and truthful static docs |
| 018 | G06,G08,G14-G16 | 030 | external | sole recoverable immutable software release/tag |
| 019 | G08,G14-G16 | 040 | external | policy publication from exact Codex release closure |
| 020 | G06,G15,G16 | 010,045 | tracked | Claude adapter and support/evidence schemas |
| 021 | G08,G14,G15 | 024 | external | proof-closed synthetic candidate evidence OCI |
| 022 | G08,G14,G15 | 034 | tracked | protected dispatch and authority control plane |
| 023 | G06,G08,G14,G15 | 021 | external | release-bound provider qualification OCI |
| 024 | G08,G14,G15 | 019 | external | sealed synthetic candidate-bundle OCI |
| 025 | G14,G15 | 008 | tracked | delivery-family eval-v2 migration |
| 026 | G14,G15 | 025 | tracked | house-stack eval-v2 migration |
| 027 | G14,G15 | 038 | tracked | credential-free honest PR self-check CI |
| 028 | G06,G14,G15 | 018 | external | macOS arm64 Codex evidence OCI |
| 029 | G06,G14,G15 | 023 | external | macOS arm64 provider evidence OCI |
| 030 | G08,G14,G15 | 031 | external | public source-linked GHCR bootstrap |
| 031 | G08,G14,G15 | 043 | external | protected environment/ref/immutability bootstrap |
| 032 | G06,G08 | 002 | tracked | Codex transport and host-read feasibility |
| 033 | G08,G14,G15 | 009 | tracked | GHCR package bootstrap workflow lanes |
| 034 | G06,G08,G14-G16 | 033 | tracked | one-release recovery plus external provider sealing |
| 035 | G08,G14,G15 | 022 | tracked | base-owned policy bootstrap workflow |
| 036 | G08,G14,G15 | 035 | tracked | candidate-as-data verifier and synthetic fixture workflow |
| 037 | G14,G15 | 026 | tracked | governance eval migration and v1 removal |
| 038 | G14,G15 | 037 | tracked | retained-trial statistical metrics |
| 039 | G06,G14,G15 | 018 | external | Linux x86_64 Codex evidence OCI |
| 040 | G06,G14,G15 | 028,039 | external | two-target Codex release-closure OCI |
| 041 | G06,G14,G15 | 023 | external | Linux x86_64 provider evidence OCI |
| 042 | G06,G14,G15 | 029,041 | external | final provider support-matrix closure OCI |
| 043 | G16 | 017 | tracked/finalizer | atomic-attempt validator, final-head replay, one merge |
| 044 | G06,G08,G14-G16 | 020,022 | tracked | protected digest-only external-evidence publisher |
| 045 | G06,G08,G15 | 032 | tracked | exclusive native-client OS-principal broker |

All tracked rows are `BLOCKED` until the single branch/draft PR/frozen base is
recorded or their same-branch dependency receipts are current. Every external
row is `BLOCKED` until Plan 043's atomic merge and its exact immutable inputs and
authority exist. A BLOCKED activation row is not permission for later code.

## Dependency edges

```text
003 <- 002
004 <- 003
015 <- 001,004
016 <- 015
005 <- 016
006 <- 000,016
032 <- 002
011 <- 003,032
012 <- 006,011
007 <- 012
013 <- 007
014 <- 013
008 <- 005,014
025 <- 008
026 <- 025
037 <- 026
038 <- 037
027 <- 038
045 <- 032
009 <- 027,045
033 <- 009
034 <- 033
022 <- 034
035 <- 022
036 <- 035
010 <- 012
020 <- 010,045
044 <- 020,022
017 <- 036,044
043 <- 017
031 <- 043
030 <- 031
018 <- 030
028 <- 018
039 <- 018
040 <- 028,039
019 <- 040
024 <- 019
021 <- 024
023 <- 021
029 <- 023
041 <- 023
042 <- 029,041
```

There are **46 numbered plans and 54 hard edges**. The graph is acyclic and
transitively reduced. Same-branch edges consume completion receipts/ancestor
SHAs, never prior merges. The single phase cut is `017 -> 043 -> 031`: Plan 043
is the only repository merge; every later edge consumes the atomic merge and
immutable external identities. External fan-in publishes digest-addressed OCI
closures, not Git commits.

## Completeness checks

- G01-G16 each have stable anchors, exact owners, and observable evidence.
- N01-N19 ownership exactly matches plan metadata and Must NOT sections.
- Every plan owns at least one G-ID and one unique capability; no orphan exists.
- All 53 dependencies are reciprocal with metadata; graph is acyclic/reduced.
- Every plan step has an explicit executable Verify block and expected result.
- Tracked plans name the one existing branch/PR, clean head, frozen base, scoped
  drift anchor, dependency receipts, one checkpoint, and Plan 043 final replay.
- External plans require clean detached `HEAD == origin/main == atomic merge`,
  exact merged-PR readback, immutable prior subjects, and zero tracked mutation.
- Plan 018 alone may create the one exact release tag. No plan creates another
  implementation branch/PR, second version/release, or post-merge Git truth.
