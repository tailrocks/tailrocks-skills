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

The verdict is advisory: this skill never clicks approve, never merges
(`tailrocks-merge-pr` owns that gate), and its output authorizes nothing
by itself.

## GitHub mechanics — only under `--comment`

- **One comment per unique issue.** Deduplicate against the report and
  against existing comments on the PR; if a prior run already posted for
  this head commit, add nothing.
- **Inline where the code is.** Each finding comments the exact lines via
  the PR review API; the terminal report's evidence travels with it,
  compressed to what the author needs.
- **Committable suggestion blocks only when the suggestion alone fixes
  the issue entirely.** A fix needing follow-up steps, six-plus lines, or
  edits in other locations gets a description instead — a half-fix a
  maintainer can merge with one click is a trap.
- **Permalinks render only in one exact shape:** the full 40-character
  commit SHA written literally (command substitution does not render in
  Markdown), the repository the PR belongs to, `#` after the file name,
  and an `L<start>-L<end>` range with at least one line of context on
  each side of the flagged lines.
- **Cite what you quote.** A rule violation links the instruction file
  the rule lives in; a bug links the code path it breaks.
- **Clean result:** post a single short comment naming what was checked,
  so the absence of findings is distinguishable from the absence of a
  review.
