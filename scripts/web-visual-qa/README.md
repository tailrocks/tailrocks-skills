# Web visual-QA harness

Install with `bun scripts/web-visual-qa/install.ts --root /absolute/project`.
The installer refuses every existing target and installs the Playwright config,
guarded fixture, sample registry spec, and server-only TanStack guard route as one
transaction.

Run capture through `capture.ts`, never raw Playwright. The supervisor fingerprints
the Git-visible worktree, generates a private 256-bit session, launches the exact
project-local Vite entrypoint on strict loopback, and requires an exact no-cache
guard response containing its source revision, nonce, PID, and design-route flag.
It checks again before and after Playwright; every test checks before and after its
page work and refuses a changed origin. An existing, stale, redirected, proxied,
or replacement server never reaches screenshot execution.

`--update-snapshots` is explicit mutation authority. Without it, capture compares
only. Updates first land in private staging and publish with no-replace identity
checks only after the final guard and source proofs pass. The command bounds
readiness, child commands, and TERM/KILL cleanup. Its JSON receipt omits the
private nonce.
