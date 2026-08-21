# Execution loop

`execute <slug>` hands a `PLANNED` package to a cheap-tier executor and
reviews the result — the only mode in this skill that produces a source
diff, and even then only inside a disposable worktree.

## Model tiers

Judgment (recon, lane fan-out, verification, prioritization, plan review)
runs on the capable tier already running this skill — Opus 5 or Sonnet 5.
Execution runs on the cheapest tier capable of mechanical
instruction-following for that plan's scope — Haiku 4.5 or Fable 5 today.
The tier is a scope judgment, not a fixed name: a plan with unusually
dense STOP conditions or many interacting files may need the next tier up
even at execute time; a trivially mechanical plan (one file, one
substitution, one verification command) is exactly what the cheap tier
exists for. Never dispatch the capable tier as executor — that defeats
the point of separating judgment from mechanical work.

## Dispatch

One executor per plan file, in an isolated worktree (never the working
tree this session is in). Hand the executor only the plan file's content
— it inherits nothing from this conversation, matching `tailrocks-plan`'s
"subagents inherit nothing" rule. The plan must be genuinely
self-contained for this to work: if the executor asks a question the plan
should have answered, that is a plan defect, not an executor failure —
route back to `tailrocks-plan`, do not patch it by feeding the executor
extra context out of band.

## Tech-lead review

After the executor reports, review its diff yourself, on the capable
tier, against the plan — never take the executor's own "done" claim:

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
  with that gap appended to its brief. Two rounds maximum — a third
  failure means the plan itself is unclear or wrong, not the executor.
- **Block.** The plan does not match reality or the STOP conditions
  fired. Route to `tailrocks-plan` (or `tailrocks-reconcile` if the
  package already exists) with the mismatch named; never patch the plan
  inline mid-execution.

## Worktree hygiene

The worktree is disposable: never work in the session's own checkout,
never push the worktree branch, and report its path so the user can
inspect or discard it. An approved diff is a recommendation, not a merge —
this skill never merges.
