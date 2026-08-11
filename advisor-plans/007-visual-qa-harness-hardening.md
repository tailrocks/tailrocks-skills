# Plan 007: Make the visual-qa harness restore-safe, failure-loud, and complete

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `advisor-plans/README.md` — unless a reviewer dispatched you and told
> you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat 64df333..HEAD -- skills/tailrocks-macos-visual-qa .gitignore`
> On any in-scope change, compare "Current state" excerpts first; mismatch = STOP.

## Status

- **Priority**: P1
- **Effort**: M–L
- **Risk**: LOW (template/reference work; the scripts are copied by users, not executed by this repo's CI — but see plan 012 for parse checks)
- **Depends on**: none (004 recommended first for the eval rerun; 012 adds CI parsing)
- **Category**: bug
- **Planned at**: commit `64df333`, 2026-08-11

## Why this matters

This skill flips the operator's *real* accessibility and appearance settings, and its restore story is two sentences of prose: an interrupted run leaves Reduce Transparency, Increase Contrast, Reduce Motion, and dark mode changed on a user's machine with no record. Its documented restore command (`defaults delete`) actively disables settings a user genuinely had on — the file's own caveat forbids exactly that. The capture path reports success without checking that a capture happened, misdiagnoses a missing Screen Recording grant as "no window found", can capture the wrong window after re-activation, and the promised "drive" half of the harness plus the mandatory accessibility-audit gate have no shipped mechanism at all.

## Current state

Paths relative to `skills/tailrocks-macos-visual-qa/` unless noted. Verified at `64df333`.

**Restore (worst class — modifies the user's machine):**

- `references/state-matrix.md:6-8`: "**These commands change the user's real system settings.** Snapshot the original values first, restore them at the end including on failure" — prose only; no script, no trap. `templates/` contains only `capture.sh` and `window-id.swift`; `SKILL.md:47-48` itself says state "does not survive reliably between separate tool calls", which is exactly the model the prose-restore depends on.
- `references/state-matrix.md:32-36`: "Restore by deleting the key rather than writing false … `defaults delete com.apple.universalaccess increaseContrast`" — directly contradicted by `:44-46`: "Some of these will already be on for the person whose machine this is, and a blind restore-to-false is a real change to their environment."
- `references/state-matrix.md:41-47`: "Writing these succeeds without a permission prompt … Nothing here is blocked by system integrity protection." The gate for `com.apple.universalaccess` is TCC (not SIP), and the no-prompt claim is unverified — the w6 dogfood *skipped* these rows rather than run them. Add a read-back verification and correct the claim after testing on a real Mac.
- `references/state-matrix.md:72-73` requires `auto` appearance, VoiceOver, and Full Keyboard Access rows, but the commands section has only the dark-mode boolean (`:15-18`) and the no-programmatic-control table (`:54-62`) lists none of the three. A user on Auto appearance gets pinned to explicit light/dark by `set dark mode to false` with no documented restore — the relevant keys are `AppleInterfaceStyle` and `AppleInterfaceStyleSwitchesAutomatically` in `NSGlobalDomain`.

**Capture (`templates/capture.sh`, 75 lines, mode 644):**

```sh
# :26-32 — temp guard misses $TMPDIR (/var/folders/…/T/), relative paths, symlinks
case "$APP" in
    /tmp/*|/private/tmp/*) … exit 2 ;;
esac
# :36-37 — kill result discarded; fixed sleep; regex from basename
pkill -9 -f "$(basename "$APP")/Contents/MacOS" 2>/dev/null || true
sleep 1
# :42-53 — $WID resolved in retry loop … then:
# :67-68 — SECOND open (re-activation) after WID resolved; never re-resolved
open "$APP"
sleep 1
# :73-75 — no existence/size/dimension check on the capture
screencapture -x -o -l "$WID" "$OUT"
echo "$OUT"
```

Also: `mkdir -p "$(dirname "$OUT")"` at `:61` runs *after* the `pkill` at `:36` — a bad output path kills the app first; `$WID` is never validated numeric; both helper invocations append `2>/dev/null` (`:46-48`), discarding the helper's diagnostics; the script builds `window-id` next to itself (`:19-24`), dropping an untracked Mach-O into the skills repo when dogfooded in place (root `.gitignore` covers only `.DS_Store`, `target/`, `tmp/`, `*.log`), and an installed skill dir may be read-only.

**Window resolver (`templates/window-id.swift`):**

```swift
// :43 — missing title (Screen Recording not granted) silently becomes ""
let name = entry[kCGWindowName as String] as? String ?? ""
// :49 — the file's only force-cast
bounds = CGRect(dictionaryRepresentation: dictionary as! CFDictionary) ?? .zero
// :67, :78-80 — first match wins; no size filter, no multi-candidate warning
let candidates = windows(ownedBy: owner).filter { $0.layer == 0 }
let matches = filter.map { wanted in candidates.filter { $0.name == wanted } } ?? candidates
guard let window = matches.first else { … }
```

`kCGWindowName` is permission-gated (macOS 10.15+): without Screen Recording, entries appear with no titles, so a missing TCC grant surfaces as "no window found for owner" after a 10-second retry — the wrong diagnosis, in a skill whose report contract (`SKILL.md:122-125`) turns on stating which grants were held.

**Loop described 3 ways:** `references/build-and-launch.md:57-65` (inline snippet) and `SKILL.md:51` (pipeline list) both omit the pre-capture re-activation that `capture.sh:62-68`'s comment calls load-bearing ("a window that lost key status renders the inactive appearance — gray traffic lights, no vibrancy").

**Regression (`references/regression.md:40-50`):**

```sh
magick compare -metric AE -fuzz 2% baseline.png candidate.png diff.png
```
"Both report a non-zero exit on difference" — with `-metric AE`, one differing pixel = non-zero exit; `-fuzz` is a per-pixel color tolerance, not a changed-pixel budget, so the snippet delivers exactly the fails-on-every-run suite the following paragraph warns against. AE's count prints to stderr. Baseline metadata (`:69-71`) records macOS version/SDK/scale/appearance but not color profile; no dimension pre-check — a baseline from a 2x/P3 display vs 1x/sRGB differs in every pixel or every dimension. The liquid-glass gate (`skills/tailrocks-liquid-glass/references/verification.md:39`) makes sRGB-vs-P3 a required axis.

**Missing harness halves:**

- `references/interaction.md:3-12` — the recommended "fast loop" ("find an element by identifier and send it a press action") names no tool, API, or CLI. AppleScript `System Events` cannot address `AXIdentifier`; only `AXUIElement` code can. `SKILL.md:35` promises `harness` mode installs "the capture **and drive** harness" — no drive tool ships.
- `SKILL.md:121` requires "an accessibility audit result" every run; `references/interaction.md:84` says the audit runs through a UI test (`performAccessibilityAudit`), and `harness` mode installs no UI-test target — in a project without one the gate is unsatisfiable and will be routinely "skipped".

**House constraints:** router at 126 lines (headroom exists but keep additions to pointers); new depth goes to `references/` and `templates/`; re-run the skill's evals after router edits; never weaken `expected_output`.

## Commands you will need

| Purpose | Command | Expected |
|---|---|---|
| Validate | `mise run validate` | `Validated 21 skills.` exit 0 |
| Shell parse | `sh -n skills/tailrocks-macos-visual-qa/templates/capture.sh` (and `state.sh` once created) | exit 0 |
| Swift parse (Mac only) | `swiftc -parse skills/tailrocks-macos-visual-qa/templates/window-id.swift` | exit 0 |
| Eval rerun | `bun scripts/run-evals.ts --skill tailrocks-macos-visual-qa --case <id> --runs 2` | exit 0 |

## Scope

**In scope**:
- `skills/tailrocks-macos-visual-qa/templates/capture.sh`, `templates/window-id.swift`
- `skills/tailrocks-macos-visual-qa/templates/state.sh` (new), `templates/ax-drive.swift` (new), `templates/AuditTests.swift` (new, minimal UI-test scaffold)
- `skills/tailrocks-macos-visual-qa/references/{state-matrix,build-and-launch,regression,interaction}.md`
- `skills/tailrocks-macos-visual-qa/SKILL.md` (pointer lines + gate scoping only)
- `.gitignore` (repo root — add the compiled helper names)
- `skills/tailrocks-macos-visual-qa/evals/evals.json` (extend case 4 per plan 004 if not already done there — coordinate; do not double-edit)

**Out of scope**:
- The state-list unification with liquid-glass's gate (which file owns the axis registry) — plan 008.
- `scripts/`, CI workflows (parse checks in CI = plan 012), all other skills.

## Git workflow

- Branch: `advisor/007-visual-qa-hardening`
- `git commit -s`, Conventional Commits (`fix(macos-visual-qa): …`); PR via `gh pr create`.

## Steps

### Step 1: Ship `templates/state.sh` — snapshot / apply / trap-restore

New POSIX-sh script, executable bit set, patterned on `capture.sh`'s header style:

- `state.sh snapshot <file>` — for each managed key (`com.apple.universalaccess`: `increaseContrast`, `reduceTransparency`, `reduceMotion`, `differentiateWithoutColor`; `NSGlobalDomain`: `AppleInterfaceStyle`, `AppleInterfaceStyleSwitchesAutomatically`): record `defaults read` output **or** the literal token `ABSENT`.
- `state.sh apply <state-name>` — applies one named state; after every `defaults write`, re-read and fail loudly if the value did not stick.
- `state.sh restore <file>` — writes back recorded values; `defaults delete` **only** for keys recorded `ABSENT`; verifies each restore by re-read; prints a per-key restore report.
- The apply/restore pair registers `trap restore EXIT INT TERM` when used in run mode (`state.sh with <state-name> -- <command…>` wrapper form), so any exit path restores.

Update `references/state-matrix.md`: replace the `defaults delete` recipe (`:32-37`) with the snapshot-driven pair and the ABSENT rule; require every matrix row to be reached **through** `state.sh`; correct `:47` to name TCC (not SIP) and mark the no-prompt claim "verify on first run — a TCC prompt or a silent no-op is possible; the read-back in `state.sh` detects the no-op"; document `AppleInterfaceStyleSwitchesAutomatically` for Auto-appearance snapshot/restore; move VoiceOver and Full Keyboard Access into the no-programmatic-control table with their System Settings paths and a note that VoiceOver-on interferes with AX driving.

**Verify**: `sh -n templates/state.sh` → exit 0; `grep -n "defaults delete" skills/tailrocks-macos-visual-qa/references/state-matrix.md` → only inside the ABSENT rule; on a real Mac (if available): `state.sh snapshot /tmp/s && state.sh restore /tmp/s` → all keys `unchanged`.

### Step 2: Harden `capture.sh`

In order, keeping the file POSIX-sh:

1. Move `mkdir -p "$(dirname "$OUT")"` above the `pkill`.
2. Widen the temp guard: canonicalize `APP` (`cd`/`pwd -P` on its dirname), then reject `/tmp/*`, `/private/tmp/*`, `/var/folders/*`, and `"${TMPDIR:-}"*`. Mirror the same list in `references/build-and-launch.md:30-32`.
3. Replace the kill: `pgrep -f` the full canonical executable-path prefix, send TERM, poll `pgrep` (bounded ~5s), escalate to KILL, poll again; report "kill matched N processes".
4. Validate `WID` against `^[0-9][0-9]*$` after the resolve loop.
5. Re-resolve the window ID **after** the re-activation `open` (move the resolve loop below it, or re-run the helper once and fail if the ID changed/disappeared).
6. After `screencapture`: assert the file exists and is ≥ a byte floor (e.g. 8 KB), read `sips -g pixelWidth -g pixelHeight "$OUT"` and fail with a "capture empty — check the Screen Recording grant for this terminal" message when missing/zero.
7. Drop the `2>/dev/null` on helper invocations; keep helper stderr visible.
8. Build location: honor `WINDOW_ID_TOOL` env override; default build dir to `"${TMPDIR:-/tmp}"` (a compiled helper is fine in temp — only the *app under test* must not live there; say so in a comment), falling back with a clear message if `swiftc` is absent.
9. `chmod +x` the template in-repo (`git update-index --chmod=+x` or plain mode change).

Add `window-id` and `ax-drive` binary names to root `.gitignore`.

**Verify**: `sh -n templates/capture.sh` → exit 0; `test -x templates/capture.sh` → true; `./templates/capture.sh /tmp/Fake.app X out.png` → exits 2 with the refusal before any `pkill` side effect; `TMPDIR=/var/folders/zz ./templates/capture.sh /var/folders/zz/Fake.app X out.png` → exit 2.

### Step 3: Fix `window-id.swift`

1. Replace the `as!` at `:49` with conditional casts, `bounds = .zero` fallback.
2. Track whether any enumerated entry had a non-nil `kCGWindowName`; when none did but windows exist, print "window titles unavailable — Screen Recording likely not granted to this terminal" to stderr and exit with a distinct code (3), falling back to the untitled candidate set for `--list`.
3. Deterministic selection: drop candidates smaller than 64×64, sort on-screen first, then descending area, then ascending window number; when >1 survives, print a one-line stderr note listing the alternatives ("pass a window title to disambiguate").

**Verify** (Mac): `swiftc -O templates/window-id.swift -o /tmp/wid && /tmp/wid Finder --list` → rows print; on a non-Mac executor: `swiftc -parse` unavailable → mark the step "edited, parse-unverified" in the PR body (plan 012's CI adds the check).

### Step 4: Align the three loop descriptions

`references/build-and-launch.md:57-65`: replace the inline snippet with a pointer to `templates/capture.sh` plus the sequence summary *including* the re-activation step. `SKILL.md:51`: add "re-activate" to the pipeline list. Keep both to their current line counts.

**Verify**: `grep -n "re-activat" skills/tailrocks-macos-visual-qa/SKILL.md references/build-and-launch.md` → ≥1 match each (path-relative).

### Step 5: Make the diff recipe tolerance-real

Rewrite `references/regression.md:38-50`: show the count-capturing form —

```sh
count=$(magick compare -metric AE -fuzz 2% baseline.png candidate.png diff.png 2>&1 || true)
[ "$count" -le "$BUDGET" ]  # explicit per-state changed-pixel budget
```

— with a dimension-equality pre-check that fails as "re-baseline on this display", and a note that `compare`'s exit code alone is not the gate. Add color profile and backing scale to the baseline metadata list (`:69-71`) and require `sips --matchTo '/System/Library/ColorSync/Profiles/sRGB Profile.icc'` (or profile-tagged baselines) before diffing. Keep the odiff line, noting `--threshold` is its budget analogue.

**Verify**: `grep -n "BUDGET\|pixelWidth\|profile" skills/tailrocks-macos-visual-qa/references/regression.md` → all three present.

### Step 6: Ship the drive tool and the audit scaffold

1. `templates/ax-drive.swift` — companion CLI: `ax-drive <pid|owner> find <AXIdentifier>` / `press <AXIdentifier>` / `read <AXIdentifier>` via `AXUIElement` (create app element from PID, walk children collecting `kAXIdentifierAttribute`, perform `kAXPressAction`, read `kAXValueAttribute`). Exit codes: 0 found/acted, 1 not found, 3 AX permission missing (check `AXIsProcessTrusted()` first, print the grant instruction).
2. `references/interaction.md`: name the tool in the fast-loop section; state explicitly that `System Events` cannot match on `AXIdentifier`, which is why a purpose-built tool exists; reference it the way `build-and-launch.md:78` references `window-id.swift`.
3. `templates/AuditTests.swift` — minimal XCUITest: launch by bundle id from env, `app.performAccessibilityAudit()`, with the header comment naming the `xcodebuild test -only-testing:` invocation. `references/interaction.md:84` gains a sentence: harness mode installs this scaffold when the project has no UI-test target.
4. `SKILL.md:121` (Final gate): scope to "an accessibility audit result, **or** a recorded blocker naming the missing UI-test target and the scaffold to install" — a pointer-sized edit.

**Verify**: `swiftc -parse templates/ax-drive.swift` (Mac) → exit 0; `grep -n "ax-drive" skills/tailrocks-macos-visual-qa/references/interaction.md` → ≥1; `mise run validate` → exit 0 (checks template links).

### Step 7: Rerun evals

Full macos-visual-qa suite (post-004 cases), 2 runs each. Case 4's permission expectation must name all three grants (done in plan 004 — verify, don't duplicate).

**Verify**: all cases pass ×2; record in PR body.

## Test plan

- `sh -n` on both shell templates; `swiftc -parse` on both Swift templates (Mac).
- Live smoke (GUI Mac only, optional but preferred): run `capture.sh` against any installed app bundle copied to `~/tmp-test/`; confirm capture file, dimensions, and the multi-window stderr note behavior. If no GUI Mac is available, mark the smoke row BLOCKED in the PR body — do not claim it ran.
- Eval rerun per step 7.

## Done criteria

- [ ] `mise run validate` exits 0
- [ ] `templates/state.sh` exists, executable, trap-based; `state-matrix.md` has no bare `defaults delete` restore outside the ABSENT rule and no SIP claim
- [ ] `capture.sh`: guard covers `/var/folders` + `$TMPDIR`; mkdir precedes pkill; WID numeric-validated and re-resolved after re-activation; capture existence+dimensions asserted; helper stderr visible; executable bit set
- [ ] `window-id.swift`: no `as!`; distinct exit code + message for the no-titles case; deterministic selection with multi-candidate warning
- [ ] `regression.md` shows a budgeted count comparison, dimension pre-check, profile/scale metadata
- [ ] `ax-drive.swift` + `AuditTests.swift` shipped and referenced; Final gate offers the recorded-blocker alternative
- [ ] `.gitignore` covers the compiled helpers
- [ ] Eval suite green ×2; no out-of-scope file modified; index row updated

## STOP conditions

- Excerpt mismatch vs live files.
- `defaults read`-back on a real Mac shows the universalaccess writes silently failing under TCC — the state-matrix approach itself is then unsound for those rows: report, do not paper over (the fix may be "these rows are manual-only", which changes the matrix contract).
- The AX tool cannot reach identifiers on a stock SwiftUI app with the Accessibility grant present — report the observed AX tree instead of shipping a tool that "should" work.
- Any edit needed in `skills/tailrocks-liquid-glass/` (axis registry) — plan 008.

## Maintenance notes

- Plan 008 decides the canonical required-states registry (this skill's matrix vs liquid-glass's gate); step 1's matrix edits keep row *mechanics* here, which is compatible with either outcome.
- Plan 014's spike (app-side state injection) may add a second, injection-based path per row; `state.sh` remains the system-settings authority those fidelity comparisons need.
- Plan 012 adds `sh -n`/`swiftc -parse` to CI so these templates can't regress unparsed.
- Reviewer scrutiny: `state.sh`'s restore must be provably symmetric with snapshot (same key list, one source of truth in the script); watch for a key added to apply but not snapshot.
