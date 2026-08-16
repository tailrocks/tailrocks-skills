# Effort Tiers Design Spike

## Invariant

All tiers: every ledger gate, the full plan template, and cold review per plan — tiers scale investigation breadth and critic rounds, never plan quality or coverage gates.

## Plan tier table

| Tier | Suggested shape | Gap research | Writers | Cold review | Critics |
|---|---|---|---|---|---|
| light | ≤3 spec-bearing manifest items | Reuse vetted topics; new research only for missing verification commands or load-bearing unknowns | One per plan | One fresh pass per plan; fixes rechecked | None |
| standard | Default | Current question-cluster fan-out | One per plan | One fresh pass plus re-review of structural fixes | None |
| deep | Explicit high-assurance request | Standard plus reslicing | One per plan | Standard | Completeness rounds until nothing load-bearing |

Light changes orchestration breadth, not evidence requirements. An unresolved
ledger unknown still becomes vetted evidence, a named `A#`, an explicit
deferral, or a STOP.

## Suggest-only sizing

After ledger construction, count spec-bearing IDs and likely manifest slices.
At ≤3 slices, report: “This item sizes as light; proceeding standard unless
you pass `--light`.” At 4–8, suggest standard. At ≥9, suggest deep. Never
auto-apply a tier. An explicit `--light` or `--deep` always wins, subject to
the invariant.

## Research tier semantics

Add the same surface to research: `--light`, absence for standard, `--deep`.
Light reuses linked vetted topics and avoids exploratory fan-out, but must
research any fact needed to prove verification commands or resolve a
load-bearing unknown. Standard retains current per-cluster investigators.
Deep retains the completeness critic and reslicing rule. No tier converts an
unknown into silence.

## Flag surface

Both argument hints gain `[--light | --deep]`; the flags are mutually
exclusive. No flag means current standard behavior. Re-runs preserve the
previously recorded tier unless the user supplies another flag, and record a
tier change in the package/topic log.

## Proposed tailrocks-plan diff

```diff
-argument-hint: "<roadmap-slug> [additional context] [--deep]"
+argument-hint: "<roadmap-slug> [additional context] [--light | --deep]"
```

```diff
 2. **Research the gaps.** Collect the item's linked `research/` topics;
+  After the ledger exists, suggest a tier from expected manifest size:
+  light at ≤3 slices, standard at 4–8, deep at ≥9. Never apply the
+  suggestion without a flag; no flag remains standard.
...
-  Fan out investigators per
+  With `--light`, reuse vetted linked topics and create research only for
+  missing verification commands or load-bearing unknowns. Otherwise fan out
+  investigators per
...
   With `--deep`, run a completeness critic and reslice until a round
   surfaces nothing load-bearing.
```

```diff
 6. **Cold review and gate.** Fresh-context reviewers read each plan with
-  only the plan file and the repository; fix every reported gap. Then the
+  only the plan file and the repository; fix every reported gap. Every tier
+  performs at least one cold review per plan. Standard and deep re-review
+  structural fixes; light verifies the fix in the same fresh review pass.
+  Then the
```

```diff
 ## Re-runs

 When `plans/<slug>/` exists, reconcile instead of duplicating: refresh
...
+Preserve the recorded effort tier unless the invocation supplies `--light`
+or `--deep`; record any tier change before work begins.
```

## Proposed tailrocks-research diff

```diff
-argument-hint: "<question | roadmap-slug> [--slug <topic-name>] [--for <roadmap-slug>] [--deep]"
+argument-hint: "<question | roadmap-slug> [--slug <topic-name>] [--for <roadmap-slug>] [--light | --deep]"
```

```diff
 2. **Fan out.** Dispatch independent parallel investigators, one per
-  question cluster, each writing its own `research/<topic>/NN-<chapter>.md`
+  question cluster, each writing its own `research/<topic>/NN-<chapter>.md`.
+  With `--light`, reuse vetted linked topics and investigate only missing
+  verification commands or load-bearing unknowns; unresolved facts become
+  a named assumption, explicit dead end, or STOP — never silence.
```

```diff
 4. **Synthesize.** Write `research/<topic>/README.md`:
...
   With `--deep`, run a completeness critic first and reslice
   until a round surfaces nothing load-bearing.
+  Without a tier flag use standard behavior. Record the chosen tier in the
+  summary so re-runs preserve it unless explicitly changed.
```

## Goal-live-status dry run

| Tier | Plans | Writer calls | Initial review calls | Critic rounds | Calls saved vs standard |
|---|---:|---:|---:|---:|---:|
| light | 3 | 3 | 3 | 0 | About 2 research investigators |
| standard | 3 | 3 | 3 | 0 | 0 |
| deep | 3 | 3 | 3 | 1+ | Negative: adds ≥1 critic |

All three still produce three complete plans and three cold reviews. The
example's existing vetted IPC topic makes light plausible.

## Twelve-plan epic dry run

| Tier | Plans | Writer calls | Initial review calls | Research investigators | Critic rounds |
|---|---:|---:|---:|---:|---:|
| light, explicit | 12 | 12 | 12 | 1–2 load-bearing only | 0 |
| standard | 12 | 12 | 12 | Estimated 5 clusters | 0 |
| deep | 12 | 12 | 12 | Estimated 5 plus reslices | ≥1 |

Light may save roughly 3–4 investigator calls, never writer or reviewer
calls. Size alone would suggest deep, but suggestion remains non-binding.

## Open questions

- Should light skip screen contracts for screenless items? No: screenless
  items already omit them; this is not a tier decision.
- Record tier in the plan hub or roadmap Log? Recommend both hub metadata and
  one Log entry only when the tier changes.
- Can light's same-pass fix verification remain fresh-context? Recommend the
  reviewer continue with only its original inputs; structural rewrites trigger
  a new reviewer even in light.
- Use the eval runner to A/B the example package before shipping these diffs.
