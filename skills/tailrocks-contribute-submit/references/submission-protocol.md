# Submission Protocol

1. Revalidate target/fork/remotes, base/head, policy, ownership, pacing, checks,
   exact diff/commits, disclosure, and PR body immediately before approval.
2. Present those exact identities and request contribution approval. Record it as
   evidence only; it authorizes no separate action.
3. Request distinct human attestation before a signoff/agreement. Any amended
   commit invalidates later approvals.
4. Request exact push approval, revalidate, push once without force, and verify
   remote ref/commit identity.
5. Request exact PR-creation approval, revalidate no equivalent PR exists, create
   from an exact body file, and verify returned repository/base/head/body/URL.
6. After uncertain or partial success, discover remote ref and PR state before
   retry. Never duplicate a push or PR and never claim rollback of remote state.
7. Persist each transition and safe resume action before requesting the next.

No approval carries across signing, push, or PR creation. Drift invalidates the
approval that was bound to the prior bytes or remote state.
