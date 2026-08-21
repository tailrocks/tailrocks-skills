# Divergence detectors

Six checks over one item's delivery history. They are deliberately mechanical:
the same queries run identically whether the item shipped a Rust service, a
TanStack application, or a native macOS surface. The lane changes which skills
the findings land on, never how the findings are found.

Run all six. Record a result for each, including "none" — an unrun detector
and a clean detector are indistinguishable in a record that omits both. A
detector whose inputs are unattributed reports `unrunnable over <n> commits`,
never `none`: D2 and D4 group by skill and D6 reads only attributed commits,
so an untrailered stretch forms no group and is silently skipped rather than
found clean. This is the same rule the partial-table check applies below, for
the same reason — a detector that could not see the commits has not cleared
them.

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
# for a merge commit, so a merge-synced lane hands the path-keyed detectors an
# empty set; --diff-merges=first-parent (equivalently -m --first-parent) emits
# them.
git log --reverse --author-date-order --diff-merges=first-parent --name-only \
  --format='%x1e%H' <base>..<head>

# The same table for a pull request. Its commits endpoint does carry the full
# message body, so trailers survive there — but it carries no per-commit files,
# and the aggregate file list is per-file rather than per-commit, so it cannot
# map a path to a commit. Each sha is fetched on its own for the paths.
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
  the dated lines inside an item — a Decisions entry's `<YYYY-MM-DD>`, a
  verification round's run date — are written **date-only by an agent running
  in the author's offset**, so their granularity was minted in that frame and
  comparing them against any other frame is a category error — normalizing a
  lane to UTC can move a whole day of commits onto a date no artifact
  mentions and report a disagreement the pipeline never had. Render dates in
  the item's authoring offset, convert the pull-request lane's `Z` timestamps
  into that same frame before comparing, and name the frame in the record. Plain `--reverse` orders
  by *commit* date, which the pre-commit rebase the delivery contract mandates
  rewrites; `--author-date-order` is what makes the ordering claim evidence.
- **Changed paths per commit** (`--diff-merges=first-parent --name-only`, or
  one `commits/<sha>` fetch per pull-request commit) — five of the six
  detectors key on paths, not subjects. A plain `--name-only` prints nothing
  at all for a merge commit, so a merge-synced lane hands the path-keyed
  detectors an empty set and they report clean.
  `--diff-merges=first-parent`, equivalently `-m --first-parent`, is what
  emits them.
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
  commit and `<base>` from that commit's first parent. A squash-merged lane
  collapses to a single commit carrying every skill's trailer at once, so the
  git range cannot feed the per-commit detectors — but the squash discards the
  commits only from the branch, not from the forge. The pull request still
  serves them: build the table from `pulls/<number>/commits`, or fetch
  `refs/pull/<number>/head` and range against that. Only when neither is
  reachable does the record name the squash and stop, rather than reporting
  six clean results over a table that was never built. A repository whose
  every item squash-merges is the common case, not the exception — a skill
  that stopped there would be inert on every item it will ever audit.
- **A delivered item has no folder, and every artifact read below resolves at
  the retirement commit's parent.** `roadmap/<slug>/` is deleted whole in the
  pull request that set `DONE`, so on a shipped item — the normal subject of
  this skill — the working tree holds nothing to open, and that absence is
  evidence of delivery rather than a missing input. Pathspec history keeps all
  of it:

  ```sh
  # the retirement commit, and the snapshot to read everything from
  git log --diff-filter=D --format='%H %at %s' -- roadmap/<slug>/
  git ls-tree -r --name-only <retirement>^ -- roadmap/<slug>/
  git show <retirement>^:roadmap/<slug>/README.md
  ```

  That snapshot holds the item, the plan manifest and its numbered plans,
  `spec/`, `coverage.md`, every `verification/NN-*.md`, and the `goal/`
  prompts. Wherever a detector says "read the item", "open the ledger", or
  "take the latest round", this is the read. Over `gh` with no clone, resolve
  the parent first — `gh api repos/<owner>/<name>/commits/<retirement> --jq
  '.parents[0].sha'` — and pass it as the `ref` to the contents endpoint;
  a `^` suffix is not a ref the API accepts. Record the retirement SHA in the
  record beside the bind SHA: it is delivery's own claim that the item was
  finished, and D5 checks that claim. The retirement commit is an **artifact**
  commit whose changed paths are deletions of the item's own documents — never
  shipped scope, so D3 does not count them, and it is the one commit for which
  path-keyed detectors read the parent's tree rather than the diff.
- **Reconcile every fetched count against its declared one.** Two pull-request
  reads truncate silently, with a success exit and no warning on either. The
  commits endpoint stops at 250 however far `--paginate` is pushed, so compare
  the rows fetched against `gh api repos/<owner>/<name>/pulls/<number> --jq
  '.commits'` and fall back to the git form over `<base>..<head>` when the
  declared count is higher. And never take paths from `gh pr view --json
  files`: it caps at 100 with no marker, and because a lane's source usually
  outnumbers its artifacts the surviving window can contain no `roadmap/`
  or `research/` path at all — handing the path-keyed detectors an
  item that appears to have touched none of its own documents. Use
  `gh api --paginate repos/<owner>/<name>/pulls/<number>/files` for the union
  and the per-`commits/<sha>` fetch for attribution. A truncated table is an
  unrun detector, never a clean one.
- **Trailer first, inference second.** `Tailrocks-Skill` is the primary key.
  A commit without one that touches any artifact the item's own documents
  point at — everything under `roadmap/<slug>/` (the item, its `plan/`
  package, its `verification/` rounds, its `goal/` prompts), `research/`, and
  the design package each `Design:` line resolves to — is recorded
  `unattributed`; a per-commit
  inference from paths and content is permitted only when marked `inferred`
  and never aggregated into counts of what a skill did. Two trailer values are
  not skill names: `recovered`, which the crash-recovery rule writes when the
  producer of inherited writes cannot be determined, and any value naming no
  directory under `skills/`. Both stand as their own rows and are never
  grouped with the skill they resemble; a value naming no skill is
  mechanically decidable, so it is filed as a validator check, not as prose.
- **Artifact paths are the ones a skill's own delivery contract lets it
  stage** — `roadmap/` in all its depth, `research/`, and the design or
  prototype directories that contract names. Everything else is source. Where an
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
- **The trailers are the only history.** No artifact carries a log of what
  happened to it: an item's Status is a current value, a plan row's status is
  a current value, a verification round is a current verdict. What ran, when,
  and in what order comes from the commit series and its trailers alone —
  there is no second narrative to diff against, and an unmarked commit is a
  hole in the record rather than something a subject line can patch. Dated
  lines *inside* artifacts are claims about facts, not attributions: a
  Decisions entry's date is checked against the commit that wrote the entry
  (D1), never accepted as when the decision happened.
- **Attribution has a floor, and the floor is lane-shaped.** Before running
  the detectors that group by skill — D2, D4, D6 — state which skills in this
  item's lane could have been attributed at all. Only the delivery family and
  the design-reference skills are required to mark their commits; no project
  setup, best practices, or visual QA skill stamps the trailer today. The
  family covers the verification loop too: `tailrocks-record-feedback` marks
  the reported half of a round and `tailrocks-prove` the executed half, so a
  `verification/` round with no attributed commit behind it is a marking
  failure, not an unattributable lane. Where
  none of a lane's stack skills could be marked, those detectors report
  `not attributable` and name the gap, never `none` — `none` claims a check
  that the marking rule never permitted. A trailer naming a skill the contract
  does not bind is the inverse: it is evidence about the contract, recorded as
  a finding, not quietly accepted as attribution.

## D1 — Evidence after lock-in

**Finds:** a settled choice recorded before the work that was supposed to
inform it existed.

**Query:** for each entry in the item's Decisions, take its date and the
commit that wrote it. Compare against the first commit of the skills that owe
its fact class — research topics for platform, integration, and library facts;
design artifacts for structure and component classification; prototype or
visual evidence for interaction claims; a verification round's report for a
claim about how the shipped thing behaves. A Decisions entry whose supporting
class has no earlier commit **on this decision's own fact**, and no linked
evidence in the item's Research or Screens sections, is a hit. The join is on
the fact, not the skill: the topic the item's Research section or the ledger's
`Q#`/`R#` row ties to this decision, opened and read. An earlier commit by the
owing skill on some other subject is not coverage — chronology alone lets an
unrelated topic vouch for a fact nobody studied.

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
topic counts as earlier evidence when it closes this decision's fact.

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
| Any lane, after execution | `verification/NN-report.md` | the round's verdict | the item's Remaining and Status — the completion case is D5's, filed there once |

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
the freeze that should have held the code was never earned. Finally, check
the item's own pointers against the artifacts they name: a header
`Plan:` or `Verified:`
line, a Research link, or a ledger row marking a question closed against a
topic, where the section it points into is empty or the file it names does
not exist, is the same defect read from the item's side — consumption
recorded, not performed. A verification round whose blocking defects reached
neither Remaining nor the Status is the completion case of that, and it is
filed under D5 as the lifecycle hit rather than twice.

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
that granted `READY`, or earlier than the plan package under
`roadmap/<slug>/plan/`, are inversions. Also read the item's status field
itself: a value outside the machine's set is a hit on its own.

**Verification rounds decide completion, and this is where they are read.**
Take `roadmap/<slug>/verification/` in round order, and the latest round's
verdict with the blocking defects it names. Five hits live here:

- **The item stands at `DONE` while its latest round names a blocking
  defect.** `DONE` requires every plan row done, the goal condition met, *and*
  the last round clean; the third conjunct is the one that gets dropped, and
  an off-machine value like `SHIPPED` is the same claim wearing a word the
  machine does not contain.
- **A blocking defect the latest round proved appears in no Remaining
  statement.** Remaining is where verification evidence lands. A defect
  proved and never carried into the item leaves the item asserting a
  completeness its own round contradicts — and an empty Remaining under a
  completion-claiming status is exactly that assertion.
- **A round exists with no attributed commit behind it.** Both halves are
  marked — `tailrocks-record-feedback` for the reported defects,
  `tailrocks-prove` for what execution proved — so a round nobody marked is
  the marking rule failing on the newest artifact in the folder.
- **The folder was retired with no clean round behind it.** Retirement is the
  strongest completion claim the pipeline can make, and it destroys its own
  evidence in the same commit — so it is judged at `<retirement>^`, never
  against the tree. Four shapes, all hits: the latest
  `verification/NN-report.md` at that parent names a blocking defect; the
  folder holds no round at all; the item's Status there is anything other than
  `DONE`; or its Remaining still carries an open statement. A retirement
  commit with no `Tailrocks-Skill` trailer, or one naming a skill that does
  not own the `DONE` transition, is the same defect from the other side — the
  pipeline's most destructive step taken by nobody accountable for it.
- **An item stands at `DONE` with its folder still in the tree.** `DONE` is a
  transition, not a resting place: the invocation that sets it retires the
  item in the next commit of the same pull request. A `DONE` item still on
  disk at the end of the lane means the retiring half never ran, and the merge
  gate that refuses exactly that let the lane through.

One body of evidence, one finding: the same round read as a producer nothing
consumed belongs here, not additionally under D4.

**Evidence:** the status-setting commits, the earliest source-touching commit
before them, the status string when it is off-machine, and — for a completion
claim — the round file, its verdict line, the blocking defect quoted, and the
item's Remaining as it stands. For a retirement: the deletion commit with its
trailer, and the item, Status, Remaining, and latest round quoted from
`<retirement>^`, which is the only place they still exist.

**Defect class:** the skill that owns a status had no precondition refusing
to grant it after the work it gates already shipped; the skill that wrote the
value never read the vocabulary its owner defines; or the skill that owns the
`DONE` transition proved completion from plan rows alone and never made the
latest round's verdict a precondition of it — the same missing precondition
that lets a folder be deleted before its evidence is read.

**False positives:** repository work that is not this item's implementation —
unrelated maintenance sharing the branch — is out of the item's scope; check
the paths against the item before counting it. An explicitly recorded user
override is a logged exception, not an inversion. Only the **latest** round
decides: a blocking defect an earlier round raised and a later one cleared is
the loop working, and so is an item back at `IN EXECUTION` carrying that
round's defects as its Remaining. **A cleanly retired item is not a hit** —
absence is what delivery looks like, and the check is the round at
`<retirement>^`, never the empty tree. A folder deleted under an explicitly
recorded user instruction to abandon the item is a logged exception too; the
instruction has to be in the commit or the item, not inferred from the
deletion.

## D6 — Write-scope breach

**Finds:** a skill that wrote outside the scope its own definition declares.

**Query:** for each attributed commit, read the target skill's declared write
scope **wherever that skill states it** — a `## Boundaries` section when it
has one, otherwise its `## Modes` block, its opening scope paragraph, any
standing refusal, and its final gate. Most stack-lane skills carry no
Boundaries heading, and a detector that reads only that heading reports "none"
for two lanes out of three. A skill that states its scope nowhere is itself
the finding, and a patch adding a Boundaries bullet has to create the section
first. Compare the declared scope against the commit's changed paths and its
conventional-commit type. An artifact-only skill carrying `feat`, `refactor`,
`ci`, or `build` commits, or touching source, is a hit. So is a commit that
edits a frozen file after the package that froze it — the numbered plans, the
spec, the coverage ledger, and the goal prompts under `roadmap/<slug>/plan/`
and `roadmap/<slug>/goal/` — unless the same commit rewrote the package as a
whole under a re-plan: a contract edited to match what shipped is the
executor's own gate being moved, and the fingerprint gate exists because that
edit is otherwise invisible. So is a scoped skill
whose commits reach a neighbouring skill's artifacts **without that area
appearing in its own declared scope** — several delivery skills legitimately
write one another's areas, and the declared scope, not the directory name,
decides.

**Evidence:** the commit, its paths and type, the sentence it contradicts, and
**which section that sentence came from**. A scope read from a `## Modes`
bullet or a final gate is weaker evidence than a declared boundary, and a
verdict that hides which one it rests on cannot be audited.

**Reach:** D6 fires only on commits the trailer contract attributes, and
`delivery-git-contract.md` binds the delivery family alone. Source written
under a stack-lane skill is `execution`, not a marking failure, so D6 has
nothing to attribute there — say `not attributable — no stack-lane skill
stamps the trailer` rather than reporting the lane clean. Silence and
absence read identically otherwise, which is the failure this detector
exists to catch.

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
