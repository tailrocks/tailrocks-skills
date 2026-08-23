# Merge preflight command

Run every machine-decidable merge gate without granting or exercising merge
authority:

```sh
bun scripts/merge-preflight.ts --root <repository> --pr <number> [--no-poll]
bun scripts/merge-preflight.ts documentation --root <repository> --pr <number>
```

The full preflight binds an open pull request to the exact local HEAD, remote
HEAD, base SHA, and computed merge base. It evaluates the raw delivery and
documentation predicates, samples required hosted checks, and re-verifies the
binding before `ready`. Pending checks use at most 30 samples, exactly 10
seconds apart, and a 300-second monotonic wall limit. Exhaustion is terminal
`pending` (exit 8), never success or failure.

Static blockers normally permit one check sample and no waiting. After the
merge skill applies a repository or freshly instructed waiver to every static
finding, it may use `--poll-with-static-blockers` to collect the bounded hosted
check result without changing the raw blocker fields. This flag grants no
waiver and cannot merge.

The documentation subcommand binds the same ancestry-based predicate to the
live PR's repository, base, merge base, and exact local/remote head. Its typed
discovery inventories documentation surfaces, rules, navigation, generator
markers, and command sources from both merge-base and HEAD trees, including
deleted base-only paths. Unknown paths are doc-worthy; commit labels never suppress an obligation. When any
doc-worthy commit exists, a document trailer must descend from every doc-worthy
and documentation-surface commit. Later tests, CI, and delivery artifacts do
not stale it; later source or documentation does. With no doc-worthy commit,
the result is `not_needed`.

JSON uses schema `tailrocks.merge-preflight/v1`. Exit 0 means raw `ready`, 8
means terminal `pending`, 2 means blocked/refused, and 1 means operational or
unmatched-state failure. The command never fetches, edits metadata, posts,
approves, pushes, or merges. A `ready` receipt is evidence only; fresh merge
authority stays with the merge skill.
