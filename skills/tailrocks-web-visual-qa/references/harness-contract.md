# Owned-server harness contract

Resolve the installed skill's real directory and derive the shared installer and
capture entrypoints without searching or trusting same-named target files:

```sh
SKILL_DIR=/absolute/path/to/installed/skills/tailrocks-web-visual-qa
HARNESS_ROOT=$(realpath "$SKILL_DIR/../../scripts/web-visual-qa")
bun "$HARNESS_ROOT/install.ts" --root /absolute/project
bun "$HARNESS_ROOT/capture.ts" --root /absolute/project
```

The installer refuses existing targets. Capture fingerprints every Git-visible
source/configuration byte plus HEAD, creates a private 256-bit session, and
launches the canonical project-local Vite entrypoint on strict loopback. It never
reuses an existing server or accepts a caller-selected origin.

The server-only guard route exists only under the explicit visual-QA environment.
Its no-cache response must exactly match the source revision, private nonce,
spawned PID, schema, and design-route flag. Existing HTTP on the port refuses
before launch. Wrong, stale, redirected, malformed, replacement, or disappeared
guards refuse before capture or invalidate the run afterward.

The guarded Playwright fixture rechecks server identity before and after every
test and verifies the final page origin. Service workers are blocked. The
supervisor rechecks both guard and source fingerprint before and after the suite,
bounds readiness to ten seconds, and bounds owned TERM/KILL cleanup.

Snapshot mutation occurs only with an explicit update request. Without it the
same path compares committed baselines. Updates first land in private staging;
the supervisor publishes them with no-replace identity checks only after the
final guard and source proofs pass. A passing pixel comparison proves only that
pixels did not drift; it never blesses design quality.
