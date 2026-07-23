# Etiquette and Hard Stops

## Hard stops

- **AI ban:** write `contribution-blocked.md` quoting the policy and offer a
  non-AI path. Never disguise assistance. Evidence:
  <https://llvm.org/docs/AIToolPolicy.html>.
- **Claimed/assigned issue:** write `redirect-report.md` with claimant, date,
  quote, and concrete alternatives. Competing PRs waste review.
- **Reserved newcomer issue:** redirect when the project excludes assisted
  work from `good first issue`.
- **Rejected direction:** cite prior PRs and maintainer reasoning; proceed only
  when the new approach materially differs.
- **Security-shaped finding:** use SECURITY.md only.
- **Scale gate:** follow the project's RFC/proposal process before code.

## Binding do-nots

1. Do not submit plausible-but-unverified claims; review cost is asymmetric.
   <https://daniel.haxx.se/blog/2024/01/02/the-i-in-llm-stands-for-intelligence/>
2. Do not submit code the user cannot explain line by line.
   <https://kubernetes.dev/blog/2026/06/26/open-source-maintainership-in-the-age-of-ai/>
3. Do not send unreviewed generated output.
   <https://llvm.org/docs/AIToolPolicy.html>
4. Do not open drive-by PRs where issue-first is expected.
   <https://github.com/ghostty-org/ghostty/blob/main/CONTRIBUTING.md>
5. Do not farm newcomer-labelled issues.
   <https://llvm.org/docs/AIToolPolicy.html>
6. Do not generate human communication without user review.
   <https://book.servo.org/contributing/getting-started.html>
7. Do not mass-open work; open one and wait.
   <https://sethmlarson.dev/slop-security-reports>
8. Do not report fabricated vulnerabilities.
   <https://daniel.haxx.se/blog/2025/01/14/death-of-a-bug-bounty/>
9. Do not hide required AI disclosure.
   <https://apache.org/legal/generative-tooling.html>
10. Do not farm contribution credit or financial rewards.
    <https://drewdevault.com/2020/10/01/Spamtoberfest.html>
11. Do not escalate publicly after rejection.
    <https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/>
12. Do not exceed platform pacing limits.
    <https://github.blog/changelog/2026-06-17-limit-open-pull-requests-for-users-without-write-access/>

## Redirect with alternatives

A stop always lists concrete unclaimed issues or non-code help the user can
perform. Never say only “do not do this.”

## Pacing and identity

One in-flight contribution per project; await its verdict before another.
Use the user's accountable account. A standalone bot account still needs a
vouching human responsible for every action.

## Disclosure

Use project wording verbatim. When silent: “Prepared with assistance from
<tool>; I reviewed, tested, and take responsibility for every line.” Render as
prose unless the project specifies another format. Attribution trailers are
not disclosure.

Every behavior must reduce review burden; a rule that only helps the
contributor is wrong.
