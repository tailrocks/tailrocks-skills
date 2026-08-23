# The launch contract

Five launch arguments, identical in every prototype and shipped debug-only
by the real app. They exist so any agent, harness, or script can drive any
feature's states without knowing the feature — and without touching the
user's real system settings.

| Argument | Value | Semantics |
|---|---|---|
| `--tr-scenario <name>` | a fixture scenario | Selects the view model the app renders. Names come from the design's fixtures; `default` must exist. Unknown names fail loudly at launch, never fall back silently. |
| `--tr-appearance <light\|dark>` | per-app appearance | Sets `NSApp.appearance` for this process only. Absent: follow the system. |
| `--tr-window <WxH>` | content size | Clamps the window's content size and disables resmoothing drift: fixed frame, restoration off. Sizes come from the design's declared minimum and reference. |
| `--tr-reduce <list>` | `transparency`, `motion`, comma-joined | Forces the reduction substitutions through the app's own accessibility hooks, per process. This previews the substitution; it does not replace the real-settings matrix owned by current verification, baseline capture, and regression. |
| `--tr-backdrop <hex\|standard>` | backdrop window | Creates a full-screen solid window behind the app (`standard` = neutral gray 0.42/0.45/0.50 sRGB) so vibrancy and glass sample a deterministic ground instead of the wallpaper. Captures without a backdrop do not reproduce on another desk. |

## Harness obligations

The design owner's harness view implements the contract once; prototypes fill
in scenarios and content:

- **Determinism before readiness.** Wipe the app's defaults domain at
  launch (table column autosave and window restoration leak across runs),
  apply appearance and window clamp, create the backdrop, re-assert
  activation, and only then print `TR-READY <windowNumber>` on stdout —
  the typed macOS visual harness waits for it, and geometry must be stable when it
  appears.
- **Frozen clock.** Scenarios carry their `now`; every derived timestamp
  renders from it. A prototype that reads the wall clock cannot be
  re-captured.
- **Fail loudly.** An unknown scenario, an unparseable size, or a failed
  clamp exits nonzero with the reason. A prototype that silently renders
  the wrong state produces false evidence, which is worse than none.

## Why per-process overrides

Appearance and reductions could be flipped in the user's real settings,
and the state matrix does exactly that — with snapshot and restore — in
its own lane. The prototype loop iterates too fast for that discipline to
survive, and a crashed iteration must never leave the user's system
altered. Per-process overrides preview the design cheaply; the macOS visual
state matrix remains the verification of record for real settings, and the
sign-off names which states each lane covered.
