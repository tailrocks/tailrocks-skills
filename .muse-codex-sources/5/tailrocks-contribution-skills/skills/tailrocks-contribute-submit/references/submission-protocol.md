# Submission Protocol

1. Immediately before authorization, revalidate target, fork,
   remotes, base, head, policy, ownership, and pacing. Revalidate
   checks, the exact diff and commits, disclosure, and the
   pull-request body in the same pass.
2. Present the exact identities from step 1. Confirm that the explicit
   submission request covers these exact actions. Record the
   confirmation as evidence.
3. Before a signoff or agreement, request distinct human attestation. An
   amended commit invalidates the step 2 confirmation. After signing, repeat
   step 2.
4. Immediately before the push, revalidate. Push once without force.
   Verify the remote branch and commit identity.
5. Revalidate that no equivalent pull request exists. Create the pull
   request from an exact body file. Verify the returned repository,
   base, head, body, and URL.
6. After uncertain or partial success, delay retry. Before retry,
   discover remote branch and pull-request state. Never duplicate a push or pull
   request. Never claim rollback of remote state.
7. Before the next authorization, persist each transition and its
   safe resume action.

The confirmed submission request covers the presented push and
pull-request actions only. Signing needs separate attestation. Drift
invalidates the confirmation.
