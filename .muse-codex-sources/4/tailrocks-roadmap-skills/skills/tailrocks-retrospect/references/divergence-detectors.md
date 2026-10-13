# Divergence detectors

Six checks over the delivery history of one item.
Deliberately mechanical: the same queries run identically
whether the item shipped a Rust service, a TanStack
application, or a native macOS surface. The lane changes the
skills where the findings land, never the found method.

Run all six. Record a result for each, with "none". An unrun
detector and a clean detector stay indistinguishable in a
record that omits both. A detector whose inputs are
unattributed reports `unrunnable over <n> commits`, never
`none`. D2 and D4 group by skill. D6 reads only
attributed commits. An untrailered stretch forms no group
and skips silently instead of found clean. The partial-table
check below applies the same rule, for the same reason: a
detector that never saw the commits never cleared them.

## Build the sequence first

Every detector reads the same table, built once.

```sh
# Pass 1 — attribution. Scan the WHOLE message. The
# %(trailers:...) atom of Git reads only the last contiguous
# trailer block, so a repository that separates the skill trailer
# from its sign-off block loses the attribution silently, and the
# detector reports a marking failure that never happened.
TZ=<item-authoring-offset> git log --reverse --author-date-order \
  --date=iso-strict-local \
  --format='%x1e%H%x09%at%x09%ad%x09%s%x1f%B' <base>..<head>
# Split records on \x1e, fields on \x09 and \x1f, then take every
# message line that matches ^Tailrocks-Skill:[[:space:]]*(.+)$.

# Pass 2 — changed paths per commit. A plain --name-only prints
# nothing at all for a merge commit, so a merge-synced lane hands the
# path-keyed detectors an empty set; --diff-merges=first-parent
# (equivalently -m --first-parent) emits them.
git log --reverse --author-date-order --diff-merges=first-parent --name-only \
  --format='%x1e%H' <base>..<head>

# The same table for a pull request. Its commits endpoint carries the
# full message body, so trailers survive there — but it carries no
# per-commit files, and the aggregate file list is per-file, not
# per-commit, so no path maps to a commit. Fetch each sha alone for
# the paths.
gh api --paginate repos/<owner>/<name>/pulls/<number>/commits --jq '.[].sha' \
| while read -r sha; do
    gh api repos/<owner>/<name>/commits/"$sha" \
      --jq '[.sha, .commit.author.date, .commit.message,
             ([.files[].filename] | join(","))] | @json'
  done
```

Rules for the table:

- **Order on the instant. Render dates in the own frame of
  the item.** `%at` is a Unix instant and is identical in
  every timezone, so every ordering claim of D1 and D5 needs
  no frame at all. Calendar dates are a different question.
  The dated lines inside an item use date-only values.
  Examples: a Decisions entry `<YYYY-MM-DD>`, a verification
  round run date. An agent that runs in the author offset
  writes them. Their granularity was minted in that frame.
  Comparison against a different frame is a category error.
  Normalization of a lane to UTC moves a whole day of
  commits onto a date that no artifact mentions. It reports
  a disagreement that the pipeline never held. Render dates
  in the authoring offset of the item. Convert the `Z`
  timestamps of the pull-request lane into that same frame
  before comparison. Name the frame in the record.
  Plain `--reverse` orders by *commit* date, which the
  pre-commit rebase mandated by the delivery contract
  rewrites. `--author-date-order` is the evidence of the
  ordering claim.
- **Changed paths per commit** (`--diff-merges=first-parent
  --name-only`, or one `commits/<sha>` fetch per
  pull-request commit). Five of the six detectors key on
  paths, not subjects. A plain `--name-only` prints nothing
  at all for a merge commit. A merge-synced lane hands the
  path-keyed detectors an empty set. They report clean.
  `--diff-merges=first-parent`, equivalently `-m
  --first-parent`, emits them.
- **A merge authored no lane work.** The first-parent paths
  of a merge-sync are the files that the base branch
  brought *in*. They are not the shipped work of this item.
  Paths handed to the path-keyed detectors turn every file
  that the base happened to touch into untraceable shipped
  scope. Record merge commits as `merge` with their
  first-parent paths captured, so nothing vanishes.
  Exclude them from D3, D5, and D6. **State the exclusion
  in the record.** A detector that quietly skipped rows is
  indistinguishable from one that found nothing.
- **Prove table completeness before any detector runs.**
  The pull-request commits endpoint caps its result however
  pagination runs, and the file list caps too, both
  silently, both exit zero. Compare the fetched row count
  against the own declared commit total of the pull
  request. When short, the record names the truncated lane
  and stops. Six clean results over a partial table are
  worse than no record at all.
- **Name the lane shape before trusting the table.** A
  merged item holds no `roadmap/<slug>` branch. Resolve
  `<head>` from the merge commit of its pull request.
  Resolve `<base>` from the first parent of that commit. A
  squash-merged lane collapses to a single commit that
  carries the trailer of every skill at once. The git range
  never feeds the per-commit detectors. But the
  squash discards the commits only from the branch, not
  from the forge. The pull request still serves them: build
  the table from `pulls/<number>/commits`, or fetch
  `refs/pull/<number>/head` and range against that. Only
  when neither is reachable does the record name the squash
  and stop, instead of six clean results over a never-built
  table. A repository where every item squash-merges is the
  common case, not the exception. A skill that stopped
  there stays inert on every item that it ever audits.
- **A delivered item holds no folder, and every artifact
  read below resolves at the parent of the retirement
  commit.** `roadmap/<slug>/` leaves whole in the pull
  request that set `DONE`. On a shipped item, the normal
  subject of this skill, the working tree holds nothing to
  open. That absence is evidence of delivery, not a missing
  input. Pathspec history keeps all of it:

  ```sh
  # the retirement commit, and the snapshot for every read
  git log --diff-filter=D --format='%H %at %s' -- roadmap/<slug>/
  git ls-tree -r --name-only <retirement>^ -- roadmap/<slug>/
  git show <retirement>^:roadmap/<slug>/README.md
  ```

  That snapshot holds the item, the plan manifest and its
  numbered plans, `spec/`, `coverage.md`, every
  `verification/NN-*.md`, and the `goal/` prompts. Wherever
  a detector states "read the item", "open the ledger", or
  "take the latest round", this read applies. Over `gh`
  with no clone, resolve the parent first: `gh api
  repos/<owner>/<name>/commits/<retirement> --jq
  '.parents[0].sha'`, and pass it as the `ref` to the
  contents endpoint. A `^` suffix is not a ref that the API
  accepts. Record the retirement SHA in the record beside
  the bind SHA. It is the own delivery claim that the item
  finished, and D5 checks that claim. The retirement commit
  is an **artifact** commit. Its changed paths delete the
  own documents of the item, never shipped scope. D3 never
  counts them. It is the one commit where path-keyed
  detectors read the tree of the parent, not the diff.
- **Reconcile every fetched count against its declared
  one.** Two pull-request reads truncate silently, with a
  success exit and no warning on either. The commits
  endpoint stops at 250 however far `--paginate` pushes.
  Compare the fetched rows against `gh api
  repos/<owner>/<name>/pulls/<number> --jq '.commits'`.
  Fall back to the git form over `<base>..<head>` when the
  declared count is higher. Never take paths from `gh pr
  view --json files`. It caps at 100 with no marker. The
  source of a lane usually outnumbers its artifacts. The
  surviving window holds no `roadmap/` or `research/` path
  at all. It hands the path-keyed detectors an item that
  touched none of its own documents. Use `gh api --paginate
  repos/<owner>/<name>/pulls/<number>/files` for the union
  and the per-`commits/<sha>` fetch for attribution. A
  truncated table is an unrun detector, never a clean one.
- **Trailer first, inference second.**
  `Tailrocks-Skill` is the primary key. A commit without
  one that touches a pointed artifact records
  `unattributed`. Pointed artifacts are everything under
  `roadmap/<slug>/`: the item, its `plan/` package, its
  `verification/` rounds, its `goal/` prompts. They include
  `research/` and the design package that each `Design:`
  line resolves to. A per-commit inference from paths and
  content is permitted only when marked `inferred`, and
  never aggregates into counts of skill acts. Two trailer
  values are not skill names. `recovered`: the
  crash-recovery rule writes it when the producer of
  inherited writes stays undeterminable. Any value that
  names no directory under `skills/`. Both stand as their
  own rows and never group with the resembled skill. A
  value that names no skill is mechanically decidable, so
  it files as a validator check, not as prose.
- **Artifact paths are the paths that the own delivery
  contract of a skill lets it stage.** They are `roadmap/`
  in all its depth, `research/`, and the design or
  prototype directories that the contract names. Everything
  else is source. Where an artifact directory holds runnable
  or compiled code, classify by conventional type instead.
  `docs` is artifact. `feat`, `fix`, `refactor`, `build`,
  `ci`, `style`, `test`, and `perf` are source wherever
  they sit. State the classification in the record. Three
  detectors key on it, and a lane with a runnable prototype
  under a design directory doubles its source count by the
  reading direction.
- **Cross-check the parse.** Count untrailered commits
  twice: once with the trailer key of git and once by a
  scan of the full message. Record both. The full-message
  count is authoritative. The difference is not a tie to
  break but a measurement of the attributions that a naive
  audit drops.
- **The trailers are the only history.** No artifact
  carries a log of its own events. The Status of an item is
  a current value. The status of a plan row is a current
  value. A verification round is a current verdict. The run
  order comes from the commit series and its trailers
  alone. No second narrative exists to diff against, and an
  unmarked commit is a hole in the record, never patched by
  a subject line. Dated lines *inside* artifacts are claims
  about facts, not attributions. Check the date of a
  Decisions entry against the commit that wrote the entry
  (D1). Never accept it as the decision time.
- **Attribution has a floor, and the floor is
  lane-shaped.** Before the detectors that group by skill
  run (D2, D4, D6), state the skills in this lane that
  attribution ever reaches. Only the delivery family and
  the design-reference skills mark their commits today. No
  project setup, best practices, or visual QA skill stamps
  the trailer. The family covers the verification loop
  too. `tailrocks-record-feedback` marks the reported half
  of a round. `tailrocks-prove` marks the executed half. A
  `verification/` round with no attributed commit behind it
  is a marking failure, not an unattributable lane. Where
  none of the stack skills of a lane accept marking, those
  detectors report `not attributable` and name the gap,
  never `none`. `none` claims a check that the marking rule
  never permitted. A trailer that names a skill unbound by
  the contract is the inverse. It is evidence about the
  contract. Record it as a finding. Never quietly accept it
  as attribution.
- **Uncertain attribution never blocks a useful review.**
  A lane whose commits carry no `Tailrocks-Skill` trailer
  at all still permits the artifact-keyed detectors (D1,
  D3, D5, and the artifact arms of D4). Run them and mark
  every skill-grouped result `uncertain attribution`.
  Skill-grouped detectors (D2, D6, and the grouped arms of
  D4) report `unrunnable` with the unattributed count.
  Never infer a lane history from subjects to fill the
  gap.

## D1 — Evidence after lock-in

**Finds:** a settled choice recorded before the informing
work existed.

**Query:** for each entry in the Decisions of the item, take
its date and the commit that wrote it. Compare against the
first commit of the skills that owe its fact class. Research
topics answer platform, integration, and library facts.
Design artifacts answer structure and component
classification. Prototype or visual evidence answers
interaction claims. A verification round report answers a
claim about the behavior of the shipped thing. A Decisions
entry whose supporting class holds no earlier commit **on
the own fact of this decision** is a hit. So is one with no
linked evidence in the Research or Screens sections of the
item. Join on the fact, not the skill. Open and read the
topic tied to this decision by the Research section of the
item. Or use the `Q#` or `R#` row of the ledger. An earlier
commit by the owing skill on a different subject is not
coverage. Chronology alone lets an unrelated topic vouch
for an unstudied fact.

**Evidence:** the decision text, its commit and timestamp,
and the earliest commit of the owing skill, or the absence
of one. Order on the commit that wrote the entry, never on
the self-given date of the entry: a self-reported date is
part of the checked claim. The owing skill is the one whose
own Steps claim that artifact, not the one whose name
matches the surface. Where two skills own one class, that
fact is the cross-cutting signal of step 4, not a choice to
make.

**Defect class:** the recording skill held no precondition
that ties a fact-shaped decision to its settling evidence.
Or the shaping skill held no gate that stops the item from
carrying unevidenced facts forward.

**False positives:** preference and scope choices that the
user simply makes ("weekly windows first") are not
fact-shaped and never hit. An explicit "decide now, evidence
later" recorded in the item is a sequencing decision, not a
divergence. Evidence produced in the research topic of a
previous item counts as earlier evidence when it closes the
fact of this decision.

## D2 — Rework loop

**Finds:** the own output of a skill corrected by a later
commit of the same skill inside one item. The skill shipped
work that it then undid.

**Query:** group the sequence by skill. Within each group,
flag any pair where a later commit of the same skill
reverses or rewrites lines that an earlier one added. **The
diff decides. The subject is corroboration only**, because
corrective vocabulary is repository-specific and a lane that
states "revert", "rework", or "adjust" matches no fixed word
list. Separately record any run of three or more consecutive
commits by one skill over one artifact inside one day, with
its length. A run that long means the completion test passed
on work that the skill kept changing.

**Evidence:** both commits, the shared path, and the
reversed hunk or the corrective subject.

**Defect class:** the own completion test of the skill never
tested the fixed property. A gate that passes and then needs
a correction measures the wrong property. The patch usually
strengthens a completion check, not a step.

**False positives:** a correction caused by new
information from *a different* skill is downstream
propagation, not a loop. The same holds for new information
from the user, who is not a skill. It belongs to the skill
that owed that information earlier. A skill whose contract
is one commit per unit of input never loops when several
inputs arrive together. One unit is one decision, one round,
or one chapter range. A struck-and-superseded entry required
by its own contract is the working contract. Iterative
artifacts whose contract is explicit rounds never hit on
round count alone. Examples: a shaping interview, a
numbered research pass, a re-freeze authorized by a recorded
re-blessing.

## D3 — Untraceable shipped scope

**Finds:** work shipped under the item with nothing in the
item or the plan that claims it.

**Query:** take the changed paths of every non-artifact
commit in the lane. Resolve each to a covering ID **in two
hops**. A coverage ledger keys on item anchors and plan
numbers, never on source paths. First hop: commit to the
plan row that claims the work. Second hop: plan to the
covered ledger rows. Rows use any defined prefix, or the
enforced Decision or Must-not. A commit that no plan row
claims is the hit. Where no plan names paths at all, state
that the forward direction holds no evidence to stand on
and run only the reverse. Run the check in the other
direction too. Every Decision and Must-not with no covering
requirement and no logged deferral is the same defect seen
from the side of the item.

**Evidence:** the commits and paths, the coverage ledger
row that claims them, and the deferral or exception that
legalizes them.

**Defect class:** the traceability gate of the planning
skill proved package structure without proving that shipped
scope still maps to product intent. Or the executing skill
held no boundary that refuses work unnamed by its plan.

**False positives:** mechanical repository upkeep implied
by the plan is in scope for its covered ID. Examples:
formatting, lockfiles, generated files, a rename after a
covered change. One class of generated file is never upkeep:
a frozen rendered reference. Golden frames, screenshot
baselines, and captured window images rewrite by a command.
Misuse of that command is the named refusal in the own
completion gate of the producing skill. A regenerating
commit is a hit unless the same lane carries a re-blessing
dated at or after it. Read the blessing row of the manifest
or the sign-off record, never the commit subject. Work
*deferred* by name in the item is out of scope but recorded,
so never untraceable, provided the deferral-writing commit
predates the plan package. A deferral appended after the
frozen package is unshipped scope relabelled, and a hit in
the other direction.

## D4 — Unconsumed or stale-consumed output

**Finds:** the artifact of a skill that nothing downstream
ever used. Or a consumer that ran against the output of a
producer and never re-ran after the producer changed it. Or
a consumer that shipped with no producer at all.

**The pairs, per lane.** Read the row before the detector
runs. The mechanics are identical across lanes but the
artifacts differ, and a run that re-derives them each time
derives them differently.

| Lane | Producer artifact | Freeze held |
| --- | --- | --- |
| Rust, headless | none | spec scenario, `B#` row |
| Rust, terminal | golden frames | the frames themselves |
| TanStack web | design routes | screenshot baselines |
| macOS | prototype package | window-ID captures |
| Any, after execution | `NN-report.md` | Remaining and Status |

The blessing record per lane: the manifest blessing row, the
design manifest blessing row, or the sign-off record of the
prototype. On a headless item the design-reference class
holds no member. The completion case is the D5 case, filed
there once. On the terminal lane, design and freeze are one
artifact.

A dash is a real result. On a headless item the
design-reference class holds no member. The detector records
that fact instead of a clean pair set that it never held.

**Query:** for each producing skill, take the last commit
that wrote its artifact. Reads leave no git trace. Date
consumption by its citation. The citation is the last commit
that added or updated a reference to the path of the
producer in a downstream artifact. Where the consumer
records its own freeze, the citation is the commit that
wrote that freeze line. State the used proxy. A
citation-derived date is weaker than a write date, and a
staleness claim states its basis. A produced artifact that
no later artifact cites at all is unconsumed.

Compare pins, not only timestamps, wherever a consumer
records one. The coverage ledger names the ingested item
commit. When that commit is no longer the head of the item
at the end of the lane, the freeze is stale. It stays stale
however many times the consumer ran afterwards for
unrelated reasons. A later consumer commit clears the
finding only when its own pin moved.

Then run the third arm, the only one that sees an unrun
producer. Take every `S#` in the ledger. Read the `Design:`
line of the item for that screen. A screen with an empty
`Design:` line, in a lane whose row above names a producer,
whose implementation paths shipped anyway, is a hit. The
freeze that holds the code was never earned. Finally, check
the own pointers of the item against their named artifacts.
A header `Plan:` or `Verified:` line where the pointed
section is empty is the same defect. So is a Research link
where the pointed section is empty. So is a ledger row that
marks a question closed against a topic where the named file
never exists. The defect reads from the side of the item:
consumption recorded, not performed. A verification round
whose blocking defects reached neither Remaining nor Status
is the completion case of that defect. File it under D5 as
the lifecycle hit, never twice.

**Evidence:** both timestamps, the artifact, and the
downstream file that cites it.

**Defect class:** neither side owned the invalidation. The
patch belongs on the skill whose completion gate names the
other, usually the producer, whose gate states that an
invalidated downstream freeze needs re-earning.

**False positives:** a deliberately kept standing reference,
such as a research topic that serves future items, is not
unconsumed. A producer commit that only fixes prose in an
artifact never invalidates a freeze. The diff decides, not
the timestamp.

## D5 — Lifecycle inversion

**Finds:** the own status machine of the pipeline run out of
order.

**Query:** locate the commits that set each status and check
the sequence against the item status machine. Its closed set
of values, owning skills, and transition rules belong to the
item-format reference shipped by the capture skill. Read
them there, never from a copy here that drifts. Quote the
checked set. Plan-row statuses are a different, smaller
vocabulary and never license an item status. An item that
wears a plan-row value is itself the hit. Then check the
commit types: source-touching commits earlier than the
`READY`-granting commit, or earlier than the plan package
under `roadmap/<slug>/plan/`, are inversions. Also read the
status field of the item itself: a value outside the set of
the machine is a hit on its own.

**Verification rounds decide completion, and this detector
reads them.** Take `roadmap/<slug>/verification/` in round
order, with the verdict of the latest round and its named
blocking defects. Five hits live here:

- **The item stands at `DONE` with a blocking defect in
  its latest round.** `DONE` needs every plan row done,
  the goal condition met, *and* the last round clean. The
  third conjunct is the dropped one, and an off-machine
  value like `SHIPPED` is the same claim in a word outside
  the machine.
- **A blocking defect proved by the latest round appears in
  no Remaining statement.** Remaining is the landing place
  of verification evidence. A proved defect never carried
  into the item leaves the item asserting a completeness
  contradicted by its own round. An empty Remaining under a
  completion-claiming status is exactly that assertion.
- **A round exists with no attributed commit behind it.**
  Both halves mark: `tailrocks-record-feedback` the
  reported defects, `tailrocks-prove` the proven execution.
  A round that nobody marked is the marking rule failed on
  the newest artifact in the folder.
- **The folder retired with no clean round behind it.**
  Retirement is the strongest completion claim that the
  pipeline makes. It destroys its own evidence in the same
  commit. Judge it at `<retirement>^`, never against the
  tree. Four shapes, all hits. The latest
  `verification/NN-report.md` at that parent names a
  blocking defect. The folder holds no round at all. The
  Status of the item there is anything but `DONE`. Its
  Remaining still carries an open statement. A retirement
  commit with no `Tailrocks-Skill` trailer is the same
  defect from the other side. So is one that names a skill
  unowned by the `DONE` transition. The most destructive
  step of the pipeline was taken by nobody accountable for
  it.
- **An item stands at `DONE` with its folder still in the
  tree.** `DONE` is a transition, not a resting place. The
  invocation that sets it retires the item in the next
  commit of the same pull request. A `DONE` item still on
  disk at the end of the lane means the retiring half never
  ran. The merge gate that refuses exactly that shape let
  the lane through.

One body of evidence, one finding: the same round read as
an unconsumed producer belongs here, not additionally under
D4.

**Evidence:** the status-setting commits, the earliest
source-touching commit before them, and the off-machine
status string. For a completion claim, add the round file,
its verdict line, the quoted blocking defect, and the
standing Remaining of the item. For a retirement: the
deletion commit with its trailer, and the item, Status,
Remaining, and latest round quoted from `<retirement>^`,
their only remaining home.

**Defect class:** the owning skill of a status held no
precondition that refuses its grant after the gated work
already shipped. Or the writing skill of the value never
read the vocabulary that its owner defines. Or the owning
skill of the `DONE` transition proved completion from plan
rows alone. It never made the verdict of the latest round a
precondition of it. The same missing precondition deletes a
folder before its evidence reads.

**False positives:** repository work outside the
implementation of this item, such as unrelated maintenance
that shares the branch, is outside the scope of the item.
Check the paths against the item before counting. An
explicitly recorded user override is a logged exception,
not an inversion. Only the **latest** round decides. A
blocking defect raised by an earlier round and cleared by a
later one is the working loop. So is an item back at
`IN EXECUTION` that carries the defects of that round as
its Remaining. **A cleanly retired item is not a hit.**
Absence is the shape of delivery, and the check is the
round at `<retirement>^`, never the empty tree. A folder
deleted under an explicitly recorded user instruction to
abandon the item is a logged exception too. The instruction
stands in the commit or the item, never inferred from the
deletion.

## D6 — Write-scope breach

**Finds:** a skill that wrote outside the scope declared by
its own definition.

**Query:** for each attributed commit, read the declared
write scope of the target skill **wherever that skill states
it**. Read a scope section when one exists. Otherwise read
its modes block, its opening scope paragraph, any standing
refusal, and its completion checks. Most stack-lane skills
carry no scope heading, and a detector that reads only that
heading reports "none" for two lanes out of three. A skill
that states its scope nowhere is itself the finding, and a
patch that adds a scope bullet creates the section first.
Compare the declared scope against the changed paths and the
conventional-commit type of the commit. An artifact-only
skill that carries `feat`, `refactor`, `ci`, or `build`
commits, or touches source, is a hit. So is a commit that
edits a frozen file after the freezing package. Frozen files
are the numbered plans, the spec, the coverage ledger, and
the goal prompts under `roadmap/<slug>/plan/` and
`roadmap/<slug>/goal/`. Unless the same commit rewrote the
package as a whole under a re-plan. A contract edited to
match the shipped result is the moved gate of the executor
itself. The fingerprint gate exists because that edit is
otherwise invisible. So is a scoped skill whose commits
reach the artifacts of a neighboring skill **without that
area in its own declared scope**. Several delivery skills
legitimately write the areas of each other, and the
declared scope, not the directory name, decides.

**Evidence:** the commit, its paths and type, the
contradicted sentence, and **the section of that sentence**.
A scope read from a modes bullet or a completion check is
weaker evidence than a declared boundary. A verdict that
hides its basis never audits.

**Reach:** D6 fires only on commits attributed by the
trailer contract, and `delivery-git-contract.md` binds the
delivery family alone. Source written under a stack-lane
skill is `execution`, not a marking failure, so D6 holds
nothing to attribute there. State `not attributable — no
stack-lane skill stamps the trailer` instead of a clean
lane. Silence and absence read identically otherwise, and
that confusion is the failure that this detector exists to
catch.

**Defect class:** the boundary covered the primary
invocation of the skill. It stayed silent on the occurred
case, most often a skill invoked mid-feature that behaves
as if invoked on an empty repository. The patch names the
mid-flight case and routes it to reporting instead of
fixing.

**False positives:** an explicit user instruction recorded
in the item or the plan authorizes the wider scope. A skill
whose contract genuinely owns source never breaches by
touching it.

## Reading the results together

Findings interact, and the interaction is usually the real
defect:

- D1 plus D2 on the same artifact means the missing
  evidence caused the rework. Write one patch on the
  recording skill, not two.
- D3 plus D6 attributed to the same skill is one unbounded
  mandate, not two findings. The scope boundary is the
  single fix. That collapse holds only when one skill owns
  both gates. Where the evidence of D3 is a missing ledger
  row and the evidence of D6 is a missing scope sentence,
  two skills own them. The planner never required shipped
  scope to map back. The executor never refused work
  outside its own scope. A merge there keeps the boundary
  and loses the traceability gate.
- D2 plus D4 on the same artifact means the rework
  invalidated a freeze already taken by a consumer. That
  defect holds one owner: the completion gate of the
  producer, which states that an invalidated downstream
  freeze needs re-earning. Patch it once.
- D4 plus D5 means the pipeline ran its stages concurrently
  instead of in order. The patch belongs to the skill whose
  precondition refuses the early start.

One body of evidence yields one finding. Where several
detectors claim the same commits, keep the one that names
the earliest missing check. The invalidation duty of a
producer outranks its own rework. Its own rework outranks a
scope breach. Record the others as the same finding seen
from a different angle, never as separate proposals.

Where the same missing check sits in more than one skill,
stop attribution to any of them and file it as
cross-cutting.
