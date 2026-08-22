# Reporting

## Severity model

Three tiers, and a finding's tier is decided by evidence, not by how it
sounds:

- **Blocker** — a verified correctness finding, or a presumptive
  structural blocker without a recorded justification. Blockers are stated
  as blockers; softening a verified defect into a "consider…" is a
  reporting defect.
- **Important** — a verified finding the change should fix before merge
  but that does not make the merged state wrong: a criticality-7 test
  gap, a silent fallback with a justification that only covers half the
  paths, a structural regression below the blocker line.
- **Suggestion** — a named improvement with its measure, offered without
  pressure. Suggestions never appear when a blocker in the same area is
  unresolved: fix the wall before discussing the paint.

Order the report: verified bugs, then structural regressions and missed
dramatic simplifications, then lane findings, then suggestions. A short
strengths note is welcome when genuine; padding praise is not.

## The approval bar

The verdict is one of three sentences, each earned:

- **No findings.** State what was checked — the lanes run, the rule sets
  applied — so the clean bill has content. Behavior-seems-correct alone
  never earns it: the structural pass ran too.
- **Findings, none blocking.** List them with routes; the change may merge
  as judged by its owners.
- **Blocked.** Name each blocker and its route. A blocker plus "but the
  author says fixing it is expensive" is still blocked — cost arguments
  route to `tailrocks-remediate`'s doctrine, they do not lower the bar.

The verdict is advisory: this skill never clicks approve, never posts, and never
merges (`tailrocks-merge-pr` owns that gate). Its output authorizes nothing by
itself. Posting mechanics and their separate authority contract belong only to
the collection's post-pr-review command.
