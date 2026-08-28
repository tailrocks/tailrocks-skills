---
name: tailrocks-contribute-propose
description: >-
  Use only when the user explicitly requests this skill. Turn one current contribution recon into a locally stored venue proposal or hard-stop redirect. Never edits the fork, contacts maintainers, claims work, posts, or treats a draft as approval.
argument-hint: "<contrib handoff and proposed change>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# Contribute Propose

Choose the least-burdensome allowed venue for one evidenced contribution and
write a draft only. This owner performs no network access; stale recon routes
back to `tailrocks-contribute-recon` without invoking it.

Apply [`runtime-trust.md`](references/runtime-trust.md),
[`contribution-handoff.md`](references/contribution-handoff.md), and
[`etiquette-and-hard-stops.md`](references/etiquette-and-hard-stops.md).
Resolve every relative link in this file against the directory containing this SKILL.md, never the plugin skills root.

## Propose

1. Bind canonical handoff root, target/recon hashes, checked revision/time,
   issue/claim evidence, assistance policy, security/governance channel, pacing,
   and exact proposed outcome. Reject stale, contradictory, symlinked, escaping,
   incomplete, security-shaped, or already-in-flight input.
2. Prove the claim is real and scoped: reproduce from local/current evidence,
   distinguish a defect from preference, recover prior attempts and ownership,
   and state what maintainer burden the proposal avoids. Unverified claims stop.
3. Apply every hard stop. A stop writes the named redirect/blocked result plus
   concrete unclaimed or non-code alternatives; it never creates pressure,
   circumvents policy, competes with assigned work, or opens a public security
   path.
4. Select exactly one allowed venue—issue, discussion, governance proposal, or
   direct change—and explain why. When policy requires prior agreement, draft
   that request; never claim work or reserve an issue.
5. Draft `proposal.md` with target identity, claim/evidence, bounded scope,
   alternatives, disclosure text, venue fields, requested maintainer decision,
   and `DRAFT_NOT_APPROVED`. The user's voice and legal attestations are never
   fabricated.
6. Publish only proposal/hard-stop and log bytes by per-file CAS after rechecking
   predecessor hashes. Preserve concurrent replacements and expose partial
   mutation/recovery artifacts.

## Machine transition

Obtain the loader-provided absolute path of this installed `SKILL.md`; ignore
ambient path variables and target-repository lookalikes. Run its sibling
`scripts/contribute-propose.ts --skill-file <that-absolute-SKILL.md>` with exactly one bounded
`tailrocks.contribution-stage-input/v1` JSON object on stdin. The helper proves
the canonical clean Git identity and exact changed-path set, rejects every
approval, external action, and remote receipt, binds the immutable contribution
plus exact recon predecessors, and publishes exactly `proposal.md` and
append-only `log.md` bytes by CAS. Only its
`tailrocks.contribution-stage/v1` success receipt permits `PROPOSED` or the
recorded hard-stop result; refusal or recovery state is terminal.

## Output and final gate

Return exactly one `PROPOSED`, `REDIRECTED`, `BLOCKED`, or `REFUSED` receipt with exact
inputs, written paths, rejected alternatives, CAS receipts, partial state, and
recovery. Any partial local publication is `BLOCKED` with surviving paths. No
fork edit, branch, commit, network, claim, issue, discussion,
message, signature, push, PR, or other outward action; the draft grants none.
