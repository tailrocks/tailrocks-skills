# Review Response and Follow-through

## Cadence

At session start fetch PR reviews, checks, issue comments, and inline comments.
Every reviewer comment is answered, fixed with commit reference, or respectfully
declined with evidence. Silence is not a response.

## Human voice

Draft responses for approval in the user's words; never auto-post. Reviewers
expect accountable humans, and some projects ban generated review prose.

## Revision regime

- GitHub incremental-review projects: append fixups during active review;
  force-push would destroy the reviewer’s incremental diff.
- Kernel/git-style projects: clean v2/v3 reroll with change notes.

Use the regime recorded by recon and re-check before the first revision.

## CI

Fix failures promptly. Use `/retest` only for documented known flakes.

## Patience, rejection, and escalation

Use the project's window; one polite ping after it. Never argue with rejection,
relitigate closed decisions, publish a hit-piece, or escalate publicly. The
Rathbun maintainer-targeting incident is the explicit anti-pattern:
<https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/>.
Thank maintainers, ask at most one clarifying question, close, and let the user
fork privately if needed.

## Withdrawal and post-merge

Close abandoned or superseded PRs with a short honest note; never ghost. After
merge, watch for reverts/regressions naming the change, offer requested
backports, finish release-note work, and close the contribution record.

## `log.md` format

Per contribution record issue, venue decision, dated approvals, PR URL, review
rounds, checks, revision regime, pings, and final outcome. This persistent
pacing memory enforces one contribution in flight across fresh sessions.
