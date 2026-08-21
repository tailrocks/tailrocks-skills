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
# Pass 1 — attribution. Scan the WHOLE message. Git's %(trailers:...) atom
# reads only the last contiguous trailer block, so a repository that separates
# the skill trailer from its sign-off block loses the attribution silently and
# the detector reports a marking failure that never happened.
TZ=<item-authoring-offset> git log --reverse --author-date-order \
  --date=iso-strict-local \
  --format='%x1e%H%x09%at%x09%ad%x09%s%x1f%B' <base>..<head>
# Split records on \x1e, fields on \x09 and \x1f, then take every line of the
# message matching ^Tailrocks-Skill:[[:space:]]*(.+)$.

# Pass 2 — changed paths per commit. A plain --name-only prints nothing at all
# for a merge commit, and so does `-m --first-parent`; --diff-merges is the
# spelling that actually emits them.
git log --reverse --author-date-order --diff-merges=first-parent --name-only \
  --format='%x1e%H' <base>..<head>

# The same table for a pull request. Its commits endpoint carries neither the
# message body — where the trailer lives — nor per-commit files, and the
# aggregate file list is per-file rather than per-commit, so it cannot map a
# path to a commit. Each sha is fetched on its own.
gh api --paginate repos/<owner>/<name>/pulls/<number>/commits --jq '.[].sha' \
| while read -r sha; do
    gh api repos/<owner>/<name>/commits/"$sha" \
      --jq '[.sha, .commit.author.date, .commit.message,
             ([.files[].filename] | join(","))] | @json'
  done
```

Rules for the table:

- **Order on the instant; render dates in the item's own frame.** `%at` is a
  Unix instant and is identical in every timezone, so every ordering claim D1
  and D5 make needs no frame at all. Calendar dates are a different question:
  the item's Log is written **date-only by an agent running in the author's
  offset**, so its granularity was minted in that frame and comparing it
  against any other frame is a category error — normalizing a lane to UTC can
  move a whole day of commits onto a date the Log never mentions and report a
  disagreement the pipeline never had. Render dates in the item's authoring
  offset, convert the pull-request lane's `Z` timestamps into that same frame
  before comparing, and name the frame in the record. Plain `--reverse` orders
  by *commit* date, which the pre-commit rebase the delivery contract mandates
  rewrites; `--author-date-order` is what makes the ordering claim evidence.
- **Changed paths per commit** (`--diff-merges=first-parent --name-only`, or
  one `commits/<sha>` fetch per pull-request commit) — five of the six
  detectors key on paths, not subjects. A plain `--name-only` prints nothing
  at all for a merge commit, and neither does `-m --first-parent`; only the
  `--diff-merges` spelling emits them.
- **A merge authored no lane work.** A merge-sync's first-parent paths are
  what the base branch brought *in*, not what this item shipped, so handing
  them to the path-keyed detectors turns every file the base happened to touch
  into untraceable shipped scope. Record merge commits as `merge` with their
  first-parent paths captured, so nothing vanishes; exclude them from D3, D5,
  and D6; and **state the exclusion in the record**, because a detector that
  quietly skipped rows is indistinguishable from one that found nothing.
- **Prove the table is complete before running a detector.** The pull-request
  commits endpoint caps its result however you paginate, and the file list
  caps too — both silently, both exit zero. Compare the fetched row count
  against the pull request's own declared commit total; if it is short, the
  record names the lane that truncated and stops. Six clean results over a
  partial table are worse than no record at all.
- **Name the lane's shape before trusting the table.** A merged item has no
  `roadmap/<slug>` branch left: resolve `<head>` from its pull request's merge
  commit and `<base>` from that commit's first parent. A squash-merged lane is
  a single commit carrying every skill's trailer at once — the per-commit
  detectors cannot run on it, and the record says so and stops rather than
  reporting six clean results over a table that was never built.
- **Reconcile every fetched count against its declared one.** Two pull-request
  reads truncate silently, with a success exit and no warning on either. The
  commits endpoint stops at 250 however far `--paginate` is pushed, so compare
  the rows fetched against `gh api repos/<owner>/<name>/pulls/<number> --jq
  '.commits'` and fall back to the git form over `<base>..<head>` when the
  declared count is higher. And never take paths from `gh pr view --json
  files`: it caps at 100 with no marker, and because a lane's source usually
  outnumbers its artifacts the surviving window can contain no `roadmap/`,
  `plans/`, or `research/` path at all — handing the path-keyed detectors an
  item that appears to have touched none of its own documents. Use
  `gh api --paginate repos/<owner>/<name>/pulls/<number>/files` for the union
  and the per-`commits/<sha>` fetch for attribution. A truncated table is an
  unrun detector, never a clean one.
- **Trailer first, inference second.** `Tailrocks-Skill` is the primary key.
  A commit without one that touches any artifact the item's own documents
  point at — `roadmap/`, `research/`, `plans/`, and the design package each
  `Design:` line resolves to — is recorded `unattributed`; a per-commit
  inference from paths and content is permitted only when marked `inferred`
  and never aggregated into counts of what a skill did. Two trailer values are
  not skill names: `recovered`, which the crash-recovery rule writes when the
  producer of inherited writes cannot be determined, and any value naming no
  directory under `skills/`. Both stand as their own rows and are never
  grouped with the skill they resemble; a value naming no skill is
  mechanically decidable, so it is filed as a validator check, not as prose.
- **Artifact paths are the ones a skill's own delivery contract lets it
  stage** — `roadmap/`, `research/`, `plans/`, and the design or prototype
  directories that contract names. Everything else is source. Where an
  artifact directory holds runnable or compiled code, classify by conventional
  type instead: `docs` is artifact; `feat`, `fix`, `refactor`, `build`, `ci`,
  `style`, `test`, and `perf` are source wherever they sit. State the
  classification in the record — three detectors key on it, and a lane with a
  runnable prototype under a design directory doubles its source count
  depending on which way it was read.
- **Cross-check the parse.** Count untrailered commits twice — once with
  git's trailer key and once by scanning the full message — and record both.
  The full-message count is authoritative; the difference is not a tie to
  break but a measurement of how many attributions a naive audit drops.
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
commit of the owing skill — or the absence of one. Order on the commit that
wrote the entry, never on the date the entry gives itself: a self-reported
date is part of the claim being checked. The owing skill is the one whose own
Steps claim that artifact, not the one whose name matches the surface; where
two skills could own a class, that is step 4's cross-cutting signal rather
than a choice to make.

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

**Query:** group the sequence by skill. Within each group, flag any pair where a
later commit of the same skill reverses or rewrites lines an earlier one
added. **The diff decides; the subject is corroboration only**, because
corrective vocabulary is repository-specific and a lane that says "revert",
"rework", or "adjust" matches no fixed word list. Separately record any run of
three or more consecutive commits by one skill over one artifact inside one
day, with its length — a run that long means the completion test passed on
something the skill kept changing.

**Evidence:** both commits, the shared path, and the reversed hunk or the
corrective subject.

**Defect class:** the skill's own completion test did not test what the
follow-up fixed. A gate that passes and then needs a correction is a gate
measuring the wrong property — the patch usually strengthens a **Complete
when** rather than adding a step.

**False positives:** a correction caused by new information from *another*
skill — or from the user, who is not a skill — is downstream propagation, not
a loop, and belongs to whichever skill owed that information earlier. A skill
whose contract is one commit per unit of input (one decision, one round, one
chapter range) is not looping when several inputs arrive together, and a
struck-and-superseded entry its own contract requires is the contract working.
Iterative artifacts whose contract is explicit rounds — a shaping interview, a
numbered research pass, a re-freeze a recorded re-blessing authorized — do not
hit on round count alone.

## D3 — Untraceable shipped scope

**Finds:** work that shipped under the item with nothing in the item or the
plan claiming it.

**Query:** take the changed paths of every non-artifact commit in the lane and
resolve each to a covering ID **in two hops**, because a coverage ledger keys
on item anchors and plan numbers, never on source paths: commit to the plan
row that claims the work, then plan to the ledger rows that plan covers — any
prefix the ledger defines, `S# F# W# N# R# A# B#`, or the Decision or Must-not
it enforces. A commit no plan row claims is the hit. Where no plan names paths
at all, say the forward direction has no evidence to stand on and run only the
reverse. Run the check in the other
direction too: every Decision and Must-not with no covering requirement and no
logged deferral is the same defect seen from the item's side.

**Evidence:** the commits and paths, the coverage ledger row that should have
claimed them, and the deferral or exception that would have made them legal.

**Defect class:** the planning skill's traceability gate proved package
structure without proving that shipped scope still maps to product intent;
or the executing skill had no boundary refusing work its plan never named.

**False positives:** mechanical repository upkeep the plan legitimately
implies — formatting, lockfiles, generated files, a rename following a
covered change — is in scope for its covered ID. One class of generated file
is never upkeep: a frozen rendered reference. Golden frames, screenshot
baselines, and captured window images are rewritten by a command whose misuse
is the named refusal in the producing skill's own final gate, so a commit that
regenerates them is a hit unless the same lane carries a re-blessing dated at
or after it — read the manifest's blessing row or the sign-off record, never
the commit subject. Work the item *deferred* by
name is out of scope but recorded, so it is not untraceable — provided the
commit that wrote the deferral predates the plan package. A deferral appended
after the package froze is un-shipped scope being relabelled, and it is a hit
in the other direction.

## D4 — Unconsumed or stale-consumed output

**Finds:** a skill's artifact that nothing downstream ever used, a consumer
that ran against a producer's output and never re-ran after the producer
changed it, or a consumer that shipped with no producer at all.

**The pairs, per lane.** Read the row before running the detector; the
mechanics are identical across lanes but the artifacts are not, and a run that
re-derives them each time derives them differently.

| Lane | Producer artifact | Blessing record | Freeze the consumer holds |
|---|---|---|---|
| Rust, headless | none | — | the spec scenario and its `B#` row |
| Rust, terminal | golden frames in the gallery crate | manifest blessing row | the frames themselves — design and freeze are one artifact |
| TanStack web | design routes and screen components | design manifest blessing row | screenshot baselines |
| macOS | the runnable prototype package | its sign-off record | window-ID captures under the region policy |

A dash is a real result. On a headless item the design-reference class has no
member, and the detector records that rather than reporting a clean pair set
it never had.

**Query:** for each producing skill, take the last commit that wrote its
artifact. Reading leaves no git trace, so date consumption by its citation:
the last commit that added or updated a reference to the producer's path in a
downstream artifact, or, where the consumer records its own freeze, the commit
that wrote that freeze line. State which proxy you used — a date derived from
a citation is weaker than a write date, and a staleness claim has to say which
it rests on. A produced artifact that no later artifact cites at all is
unconsumed.

Compare pins, not only timestamps, wherever a consumer records one. The
coverage ledger names the item commit it ingested; when that commit is no
longer the item's head at the end of the lane, the freeze is stale however
many times the consumer ran afterwards for unrelated reasons. A later consumer
commit clears the finding only when its own pin moved.

Then run the third arm, which is the only one that can see a producer that
never ran: take every `S#` in the ledger and read the item's `Design:` line
for that screen. A screen with an empty `Design:` line, in a lane whose row
above names a producer, whose implementation paths shipped anyway, is a hit —
the freeze that should have held the code was never earned. Finally, check the
Log's consumption claims against the artifact: an entry asserting a producer's
output was linked or ingested, where the named section is empty, is the same
defect read from the item's side — consumption reported, not performed.

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

**Query:** locate the commits that set each status and check the sequence
against the item status machine — its closed set of values, their owning
skills, and its transition rules belong to the item-format reference the
capture skill ships, and are read there rather than from a copy here that
drifts. Quote the set you checked against. Plan-row statuses are a different,
smaller vocabulary and never license an item status; an item wearing a
plan-row value is itself the hit.
Then check the commit types: source-touching commits earlier than the commit
that granted `READY`, or earlier than the plan package, are inversions. Also
read the item's status field itself: a value outside the machine's set is a
hit on its own.

**Evidence:** the status-setting commits, the earliest source-touching commit
before them, and the status string when it is off-machine.

**Defect class:** the skill that owns a status had no precondition refusing
to grant it after the work it gates already shipped; or the skill that wrote
the value never read the vocabulary its owner defines.

**False positives:** repository work that is not this item's implementation —
unrelated maintenance sharing the branch — is out of the item's scope; check
the paths against the item before counting it. An explicitly recorded user
override is a logged exception, not an inversion.

## D6 — Write-scope breach

**Finds:** a skill that wrote outside the scope its own Boundaries claim.

**Query:** for each attributed commit, read the target skill's declared write
scope **wherever that skill states it** — a `## Boundaries` section when it
has one, otherwise its `## Modes` block, its opening scope paragraph, any
standing refusal, and its final gate. Most stack-lane skills carry no
Boundaries heading, and a detector that reads only that heading reports "none"
for two lanes out of three. A skill that states its scope nowhere is itself
the finding, and a patch adding a Boundaries bullet has to create the section
first. Compare the declared scope against the commit's changed paths and its
conventional-commit type. An artifact-only skill carrying `feat`, `refactor`,
`ci`, or `build` commits, or touching source, is a hit. So is a scoped skill
whose commits reach a neighbouring skill's artifacts **without that area
appearing in its own declared scope** — several delivery skills legitimately
write one another's areas, and the declared scope, not the directory name,
decides.

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
  findings; the scope boundary is the single fix. That collapse holds only
  when one skill owns both gates. Where D3's evidence is a missing ledger row
  and D6's is a missing scope sentence, they are two skills — the planner that
  never required shipped scope to map back, and the executor that never
  refused work outside its own — and merging them keeps the boundary while
  losing the traceability gate.
- D2 plus D4 on the same artifact means the rework invalidated a freeze a
  consumer had already taken. That is one defect with one owner: the
  producer's final gate, which must state that a downstream freeze it
  invalidated has to be re-earned. Patch it once.
- D4 plus D5 means the pipeline ran its stages concurrently rather than in
  order; the patch belongs to whichever skill's precondition should have
  refused to start.

One body of evidence yields one finding. Where several detectors claim the
same commits, keep the one naming the earliest missing check — a producer's
invalidation duty outranks its own rework, which outranks a scope breach — and
record the others as the same finding seen from another angle, never as
separate proposals.

Where the same missing check would have to sit in more than one skill, stop
attributing it to any of them and file it as cross-cutting.
