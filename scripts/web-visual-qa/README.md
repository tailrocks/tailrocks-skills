<!-- tailrocks-web-harness-contract:start -->

# Web visual-QA harness contract

Resolve the installed skill and canonical harness without searching or trusting
same-named project files:

```sh
SKILL_DIR=/absolute/path/to/installed/skills/tailrocks-web-visual-baseline
HARNESS_ROOT=$(realpath "$SKILL_DIR/../../scripts/web-visual-qa")
bun "$HARNESS_ROOT/install.ts" --root /absolute/project
bun "$HARNESS_ROOT/capture.ts" baseline --root /absolute/project
bun "$HARNESS_ROOT/capture.ts" regress --root /absolute/project
```

The installer refuses every existing target and installs the Playwright config,
guarded fixture, sample registry spec, and server-only TanStack guard route as one
transaction.

Run `capture.ts baseline` for explicitly authorized baseline publication or
`capture.ts regress` for read-only comparison; never use raw Playwright. The supervisor fingerprints
the Git-visible worktree, generates a private 256-bit session, launches the exact
project-local Vite entrypoint on strict loopback, and requires an exact no-cache
guard response containing its source revision, nonce, PID, and design-route flag.
It checks again before and after Playwright; every test checks before and after its
page work and refuses a changed origin. An existing, stale, redirected, proxied,
or replacement server never reaches screenshot execution.

Only the `baseline` operation carries snapshot mutation authority. `regress`
compares only. Updates first land in private staging and publish with no-replace identity
checks only after the final guard and source proofs pass. The command bounds
readiness, child commands, and TERM/KILL cleanup. Its JSON receipt omits the
private nonce.

<!-- tailrocks-web-harness-contract:end -->
