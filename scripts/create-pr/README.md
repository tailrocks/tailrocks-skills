# Create PR command

Open one pull request only after bounded local gates prove positive execution.

```sh
bun scripts/create-pr.ts --skill-file <absolute-loader-skill> < input.json
```

Input schema `tailrocks.create-pr-input/v1` binds the repository, authenticated
actor, remote, base and head refs and SHAs, title, external body file and digest,
draft state, required commit trailers, and gate command/proof pairs. Each proof
must emit exactly one `tailrocks.gate-proof/v1` JSON object with positive
`units`. A failed or vacuous gate performs no remote mutation.

Gates run from an exact-revision local clone materialized with Git configuration,
templates, and LFS smudge disabled; network is denied, ambient secrets are
scrubbed, and writes stay confined to the clone. The command then proves
the target base SHA and that no open PR owns the exact head, rechecks local
identity, pushes the immutable SHA to the bound
HTTPS URL without force, and verifies the remote ref. It repeats the remote
proof, rechecks the remote head immediately before creation, streams the
fatal-UTF-8-validated body bytes through `--body-file -`, and verifies
the rendered body plus all PR identity fields. Its
single JSON receipt uses schema `tailrocks.create-pr/v1`; partial or uncertain
remote work returns `recovery_required` with the completed action receipts.
