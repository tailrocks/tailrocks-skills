# Execution loop

`execute <slug>` hands a `PLANNED` package to a `bounded-executor` and
reviews the result — the only mode in this skill that produces a source
diff, and even then only inside a disposable worktree.

## Model routing

Route by capability role, never by model brand. The role names are the
delivery family's own — do not invent a second routing vocabulary. Three
of them matter here:

- **`frontier-judgment`** — recon, lane fan-out, adversarial
  verification, prioritization, and review of the executor's diff. This
  is the route already running the skill, and it is the most capable one
  available, not the cheapest one that seems adequate.
- **`bounded-executor`** — one self-contained plan with exact scope,
  commands, done criteria, and STOP conditions. The cheapest route that
  can follow mechanical instructions at that plan's scope.
- **`fast-mechanical`** — search, extraction, formatting, deterministic
  transforms inside a plan step. Narrower than `bounded-executor`.

A fourth applies under `--deep`: **`independent-verifier`**, a
fresh-context route that re-derives a candidate from its cited location
and claim without the lane's reasoning, and never edits what it judges.

**Verify the ladder before you assign a role; never infer it from a
model's name, release order, or recency.** This file names no models on
purpose — a hard-coded list rots silently, and the newest or
best-marketed name is regularly the *most* capable and *most* expensive
route, not the cheapest. Read the provider's current capability and
pricing table at execution time and map the three roles onto it then. If
that table is not available in the session, say so and ask rather than
guessing: a wrong guess here pays the top rate in the ladder for
mechanical work, or silently runs judgment on a route that cannot do it.

The role is a scope judgment, not a fixed name: a plan with unusually
dense STOP conditions or many interacting files may need
`bounded-executor` to move up a route; a trivially mechanical plan (one
file, one substitution, one verification command) is exactly what
`fast-mechanical` exists for. Never dispatch the `frontier-judgment`
route as executor — that defeats the point of separating judgment from
mechanical work.

## Dispatch

One executor per plan file, in an isolated worktree (never the working
tree this session is in). Hand the executor only the plan file's content
— it inherits nothing from this conversation, matching `tailrocks-plan`'s
"subagents inherit nothing" rule. The plan must be genuinely
self-contained for this to work: if the executor asks a question the plan
should have answered, that is a plan defect, not an executor failure —
route back to `tailrocks-plan`, do not patch it by feeding the executor
extra context out of band.

**Create the worktree; never assume one.** `git worktree add` a throwaway
branch off the commit the plan is stamped against (`plan-seeding.md`
records it), name the branch after the plan slug, and review with
`git diff <base>...` inside that worktree. Report its path in the verdict
so the user can inspect or discard it; this skill never removes a
worktree holding an unreviewed diff.

**Dispatch through the client's own subagent mechanism with an explicit
route override to `bounded-executor`.** If the client cannot set a
subagent's route, say so and stop — report that `execute` is unavailable
here and hand the plan back for manual execution. Never run the executor
on the `frontier-judgment` route and call it an execute run: the whole point of the
mode is that judgment and mechanical work ran on different routes, and a
run that quietly collapses them proves nothing about the plan.

## Tech-lead review

After the executor reports, review its diff yourself, on the
`frontier-judgment` route, against the plan — never take the executor's
own "done" claim:

- Re-run every done criterion the plan named; a criterion that was
  supposed to pass and did not is a blocker, not a note.
- Check scope compliance against the plan's out-of-scope list; anything
  outside it is a blocker regardless of quality.
- Read the diff against the plan's intent, not just its literal steps —
  an executor that satisfies the letter while missing the point is still
  wrong.

Verdict is one of:

- **Approve.** Report it; merging the worktree branch stays the user's
  call, never automatic.
- **Send back.** Name the specific gap, re-dispatch the same executor
  with that gap appended to its brief. Two rounds maximum; **a third
  failure is a Block, not a third send-back** — the plan itself is
  unclear or wrong, not the executor, and the verdict says so.
- **Block.** The plan does not match reality or the STOP conditions
  fired. Route to `tailrocks-plan` (or `tailrocks-reconcile` if the
  package already exists) with the mismatch named; never patch the plan
  inline mid-execution.

## Worktree hygiene

The worktree is disposable: never work in the session's own checkout,
never push the worktree branch, and report its path so the user can
inspect or discard it. An approved diff is a recommendation, not a merge —
this skill never merges.
