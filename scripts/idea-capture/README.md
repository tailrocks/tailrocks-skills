# Idea capture command

The installed command owns the complete first-item lane:

```sh
bun scripts/idea-capture.ts --skill-file <absolute-loader-skill> <roadmap-slug> < input.json
```

Input schema `tailrocks.idea-capture-input/v1` is closed and bounded. It binds
the GitHub repository, actor/head owner, canonical remote, base branch and SHA,
title, ISO date, raw intent, thirteen named section arrays, expected roadmap
index digest (or exact absence), and any repository-required extra trailers.
The command constructs the canonical item and linked index row; it never accepts
whole-file bytes.

Preflight proves a clean exact base and absence of item, index-row, local branch,
remote branch, and open-PR collisions. Branch `roadmap/<slug>` exists before the
first artifact write. Item and index publish together through anchored
compare-and-swap, the commit stages exactly those two files and carries exactly
one `Tailrocks-Skill: tailrocks-idea`, and the hardened PR transaction verifies
immutable push, draft creation, and rendered identity. No force push occurs.

One `tailrocks.idea-capture/v1` receipt reports `captured`, `refused`, or
`recovery_required`. Refusal cleans only directories and refs whose identities
still match the command's own creation. Uncertain commit, push, or PR state is
retained and named for reconciliation; reruns must not create a second lane.
