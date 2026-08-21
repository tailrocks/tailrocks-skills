# Divergence detectors

Six checks over one item's delivery history. They are deliberately mechanical:
the same queries run identically whether the item shipped a Rust service, a
TanStack application, or a native macOS surface. The lane changes which skills
the findings land on, never how the findings are found.

Run all six. Record a result for each, including "none" — an unrun detector
and a clean detector are indistinguishable in a record that omits both.

## Building the sequence first

Every detector reads the same table, built once.

```sh
# Attribution for a delivery branch or a merged range.
git log --reverse --date=iso-strict \
  --format='%H%x09%ad%x09%s%x09%(trailers:key=Tailrocks-Skill,valueonly)' \
  <base>..<head>

# The same table for a pull request that is still open elsewhere.
gh api --paginate repos/<owner>/<name>/pulls/<number>/commits \
  --jq '.[] | [.sha, .commit.author.date, (.commit.message | split("\n")[0])] | @tsv'
```

Rules for the table:

- **Author date, one timezone, stated in the record.** Commit dates and the
  item's date-only Log entries disagree across a UTC boundary constantly; an
  ordering claim built on the wrong one is not evidence.
- **Changed paths per commit** (`--name-only`, or the pull request's file
  list) — four of the six detectors key on paths, not subjects.
- **Trailer first, inference second.** `Tailrocks-Skill` is the primary key.
  A commit without one that touches `roadmap/`, `research/`, or `plans/` is
  recorded `unattributed`; a per-commit inference from paths and content is
  permitted only when marked `inferred` and never aggregated into counts of
  what a skill did.
- **The Log is a claim.** The item's Log is the narrative the pipeline told
  about itself; the trailers are what it did. Both belong in the table, in
  separate columns, so the diff between them is visible.

## D1 — Evidence after lock-in

**Finds:** a settled choice recorded before the work that was supposed to
inform it existed.

**Query:** for each entry in the item's Decisions, take its date and the
commit that wrote it. Compare against the first commit of the skills that owe
its fact class — research topics for platform, integration, and library facts;
design artifacts for structure and component classification; prototype or
visual evidence for interaction claims. A Decisions entry whose supporting
class has no earlier commit, and no linked evidence in the item's Research or
Screens sections, is a hit.

**Evidence:** the decision text, its commit and timestamp, and the earliest
commit of the owing skill — or the absence of one.

**Defect class:** the recording skill had no precondition tying a fact-shaped
decision to the evidence that settles it, or the shaping skill had no gate
stopping the item from carrying unevidenced facts forward.

**False positives:** preference and scope choices the user is simply making
("weekly windows first") are not fact-shaped and never hit. An explicit
"decide now, evidence later" recorded in the item is a decision about
sequencing, not a divergence. Evidence produced in a previous item's research
topic counts as earlier evidence.

## D2 — Rework loop

**Finds:** a skill's own output corrected by a later commit of the same skill
inside one item — the skill shipped something it then had to undo.

**Query:** group the sequence by skill. Within each group, flag any pair where
a later commit modifies files an earlier commit of the same skill created, and
either the later subject is corrective (fix, correct, clarify, stabilize,
close gaps, honor, remove) or the diff reverses an earlier hunk. Count
consecutive runs: a skill with many same-day commits over one artifact is a
loop even when no single subject admits it.

**Evidence:** both commits, the shared path, and the reversed hunk or the
corrective subject.

**Defect class:** the skill's own completion test did not test what the
follow-up fixed. A gate that passes and then needs a correction is a gate
measuring the wrong property — the patch usually strengthens a **Complete
when** rather than adding a step.

**False positives:** a correction caused by new information from *another*
skill is downstream propagation, not a loop, and belongs to whichever skill
owed that information earlier. Iterative artifacts whose contract is explicit
rounds (a shaping interview, a numbered research pass) do not hit on round
count alone.

## D3 — Untraceable shipped scope

**Finds:** work that shipped under the item with nothing in the item or the
plan claiming it.

**Query:** take the changed paths of every non-artifact commit in the lane.
For each, find the covering ID in `plans/<slug>/coverage.md` — `S#`, `F#`,
`W#`, `N#`, `B#` — or the Decision or Must-not it enforces. Paths with no
covering ID and no covering Decision are hits. Run the check in the other
direction too: every Decision and Must-not with no covering requirement and no
logged deferral is the same defect seen from the item's side.

**Evidence:** the commits and paths, the coverage ledger row that should have
claimed them, and the deferral or exception that would have made them legal.

**Defect class:** the planning skill's traceability gate proved package
structure without proving that shipped scope still maps to product intent;
or the executing skill had no boundary refusing work its plan never named.

**False positives:** mechanical repository upkeep the plan legitimately
implies — formatting, lockfiles, generated files, a rename following a
covered change — is in scope for its covered ID. Work the item *deferred* by
name is out of scope but recorded, so it is not untraceable.

## D4 — Unconsumed or stale-consumed output

**Finds:** a skill's artifact that nothing downstream ever used, or a
consumer that ran against a producer's output and never re-ran after the
producer changed it.

**Query:** for each producing skill, take the last commit that wrote its
artifact. For each consuming skill, take the last commit that read it —
baseline freezes, plan citations, spec references, prototype sign-offs. A
producer's last write later than its consumer's last run is a stale
consumption. A produced artifact that no later artifact cites at all is
unconsumed.

**Evidence:** both timestamps, the artifact, and the downstream file that
should have cited it.

**Defect class:** neither side owned the invalidation. The patch belongs on
whichever skill's final gate can name the other — usually the producer, whose
gate must state that a downstream freeze it invalidated has to be re-earned.

**False positives:** an artifact deliberately kept as a standing reference
(a research topic serving future items) is not unconsumed. A producer commit
that only fixes prose in an artifact does not invalidate a freeze; the diff
decides, not the timestamp.

## D5 — Lifecycle inversion

**Finds:** the pipeline's own status machine run out of order.

**Query:** locate the commits that set each status — capture, shaping,
`READY`, `PLANNED`, execution — and check the sequence against the machine.
Then check the commit types: source-touching commits earlier than the commit
that granted `READY`, or earlier than the plan package, are inversions. Also
read the item's status field itself: a value outside the machine's set is a
hit on its own.

**Evidence:** the status-setting commits, the earliest source-touching commit
before them, and the status string when it is off-machine.

**Defect class:** the skill that owns a status had no precondition refusing
to grant it after the work it gates already shipped; or no skill owned the
status vocabulary, so an ad-hoc value survived.

**False positives:** repository work that is not this item's implementation —
unrelated maintenance sharing the branch — is out of the item's scope; check
the paths against the item before counting it. An explicitly recorded user
override is a logged exception, not an inversion.

## D6 — Write-scope breach

**Finds:** a skill that wrote outside the scope its own Boundaries claim.

**Query:** for each attributed commit, read the target skill's Boundaries
section and compare its declared write scope against the commit's changed
paths and its conventional-commit type. An artifact-only skill carrying
`feat`, `refactor`, `ci`, or `build` commits, or touching source, is a hit.
So is a scoped skill whose commits reach a neighbouring skill's artifacts.

**Evidence:** the commit, its paths and type, and the Boundaries sentence it
contradicts.

**Defect class:** the boundary was stated for the skill's primary invocation
and left silent for the case that actually occurred — most often a skill
invoked mid-feature that behaves as if invoked on an empty repository. The
patch names the mid-flight case and routes it to reporting instead of fixing.

**False positives:** an explicit user instruction recorded in the item or the
plan authorizes the wider scope. A skill whose contract genuinely owns source
is not breached by touching it.

## Reading the results together

Findings interact, and the interaction is usually the real defect:

- D1 plus D2 on the same artifact means the rework was caused by the missing
  evidence — one patch on the recording skill, not two.
- D3 plus D6 attributed to the same skill is one unbounded mandate, not two
  findings; the scope boundary is the single fix.
- D4 plus D5 means the pipeline ran its stages concurrently rather than in
  order; the patch belongs to whichever skill's precondition should have
  refused to start.

Where the same missing check would have to sit in more than one skill, stop
attributing it to any of them and file it as cross-cutting.
