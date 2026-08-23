# Merge transaction command

`merge-pr.ts` is the irreversible mechanism behind `tailrocks-merge-pr`. It
accepts one closed JSON request on stdin and emits one
`tailrocks.merge-pr/v1` receipt:

```sh
bun scripts/merge-pr.ts --skill-file <absolute-loader-SKILL.md> < merge-request.json
```

The request binds the repository, PR, local/remote head, base, merge base,
method, current PR title/body, merge subject/body, blast-radius decision,
reasoned named static-gate waivers, and optional single named admin bypass. High
blast radius and every admin bypass require a fresh confirmation in that same
request. A waiver is accepted only while its exact gate is blocking; unused or
duplicate waivers refuse.

The command runs the read-only preflight itself. A normal merge requires its
exact `ready` receipt. An admin merge permits only one failed or cancelled
required check whose name exactly matches the authorized check; delivery and
documentation blockers remain absolute. It then rechecks exact PR metadata and
invokes one expected-head GitHub GraphQL merge mutation with exact method and commit
text bytes. The successful mutation response is the authority-bearing receipt;
for merge and squash the commit subject/body are applied by that mutation. For
rebase, GitHub preserves the rebased commit series, so the receipt marks custom
commit text not applicable instead of claiming it was applied.

Every attempted merge must return its strict atomic mutation receipt. A nonzero,
timed-out, saturated, malformed, or non-merged receipt returns
`merge_uncertain`. A later state query cannot promote it because another actor
could have merged the same head with different method or commit text. Inspect
the named PR; never retry blindly.

The command does not choose blast radius, authorize bypass, run a pre-merge
worklist, edit metadata, choose a merge method, or perform post-merge work.
Those judgments remain with `tailrocks-merge-pr`.
