# Verification procedure

Read this reference when step 9 verifies recovery. Use a separate
verification task. Verify the actual remote, not a local tracking ref
alone.

For every preserved Source:

1. Record the expected commit IDs and artifact hashes.
2. Read the current remote destination refs.
3. Fetch the required objects through the remote transport.
4. Verify them in an independent temporary repository.
5. Check required history, file content, and supplementary artifacts.
6. Download and check required LFS content independently.
7. Record the result in the recovery report.

Read refs with `git ls-remote <remote-url>` over the identical
non-local URL, and compare each returned ID with the manifest. A
`ls-remote` result alone is not enough.

Build the independent repository with `git init` in a temporary dir and
`git fetch` from the same remote URL. Never `--shared`, `--local`,
`--reference`, or `--no-hardlinks` bypasses. Never use a local-path
remote as proof of off-computer recovery: a local-path fetch masks
missing pushed objects through direct object access. Never borrow
objects or LFS content from the source clone during verification.

In the temporary repository, run `git fsck --full`. Compare fetched
refs with expected IDs. Check history, file content, and supplementary
artifacts. Fetch LFS content. Confirm that a sample file smudges to
real content, not a pointer. Never leave shallow or partial
verification gaps unreported.

Use one verifier per compatible repository group. Never create a
complete verifier clone for each branch. A push exit code alone is not
enough.

Publish the necessary recovery map before deleting its local Source.
Verify that the map is also retrievable remotely. Preserve required
permissions and sensitive metadata through suitable protected records.

Any mismatch means preservation FAILED. Never proceed to cleanup for
that Source. Report the evidence.
