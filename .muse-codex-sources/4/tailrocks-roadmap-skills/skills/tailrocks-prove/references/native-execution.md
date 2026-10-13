# Native execution

This reference tells `tailrocks-prove` how to execute
surfaces with native product tools. No capability program
stands between the round and the run. The shell, the
repository build, and the product harnesses are the execution
boundary. Recorded facts come from commands that ran in this
session. The model judges the meaning of those facts.

The round never emits a verdict without a run behind it.
`WORKS`, `DEFECT`, `CONFIRMED`, `REFUTED`, `WIDER`, `HELD`,
and `VIOLATED` are semantic judgments. They rest on executed
output and independently challenged observations.

## Prepare a disposable checkout

Build and execute outside the source tree of the user. Create
a disposable checkout at the exact bound commit:

```sh
git worktree add --detach /tmp/prove-<slug>-NN <full-SHA>
```

Record the worktree path, the full SHA, and the clean-tree
state. Build there with the exact build command of the
repository. Record the command, its exit status, and the
paths of the declared built artifacts with byte counts and
SHA-256 hashes. Never build or execute in the source tree of
the user, and never substitute an artifact from a different
checkout. A failed build ends the round: report it, because
nothing downstream is knowable.

Remove the worktree at the end of the round:

```sh
git worktree remove --force /tmp/prove-<slug>-NN
```

A cleanup failure names its recovery path and blocks report
publication.

## Run one surface

Run each inventory row with the native tool of its medium:

- `CLI`: invoke the shipped command from the disposable
  checkout with an argument array, never a shell string.
  Bound stdin, time, and output. Capture stdout and stderr
  separately with exit status and duration. Rows that claim
  pipe behavior run as a separate invocation with explicit
  stdin. A normal run never stands in for it.
- `APPLICATION`: run a one-shot local harness that owns
  readiness, probes, process id, and cleanup. Record probe
  count, owned process id, cleanup result, and artifacts.
  Native visual work delegates capture to the installed
  visual-QA harness and records its result.
- `BROWSER`: run a one-shot local harness against an owned
  private loopback origin with a disposable profile. Record
  navigation and assertion counts, blocked external request
  count, console and page errors, profile cleanup, and
  artifacts. Web visual work delegates capture to the
  guarded visual-QA harness.

Before execution, inventory the side effects of the
surfaces. Use a user-authorized non-production target or
isolated reversible data. Production, external, or
irreversible effects need explicit authorization immediately
before execution. Without it, record that surface as `NOT
EXECUTED` with the reason. After fresh authorization, run
the newly authorized rows in the same checkout. Never widen
a bound row after the run.

## Record the run

Record every run as one execution block with the command,
exit status, duration, decisive output line, and artifacts.
Quote the decisive line exactly. Never summarize it. The
evidence projection rules live in
[`execution-evidence.md`](execution-evidence.md).

Convergence between two runs is not verification when both
ran the same command in the same environment. When two
independent verdicts agree, check that independent reasons
stand behind them.
