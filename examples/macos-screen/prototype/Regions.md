# Regions — ConnectionsBoard

Every visible region from the component map, with the match mode the
implementation is held to. Rects are points from the window's top-left at
the reference `--tr-window 1100x700`, measured on the blessed light
capture (2x scale); pixel modes diff the cropped region with the visual-qa
protocol under the identical backdrop, scenario, appearance, and window
size. Structural rects are locators for the accessibility check, not crop
boundaries.

| Region | Class | Rect (pt) | Mode | Budget |
|---|---|---|---|---|
| Connection navigation (sidebar) | NATIVE | 0,0 → 248,700 | structural | — |
| Session table | NATIVE | 248,52 → 819,700 | structural | — |
| Session details (inspector) | NATIVE | 819,0 → 1100,700 | structural | — |
| Refresh (toolbar) | NATIVE | 1059,14 → 1088,40 | structural | — |
| Inspector toggle (toolbar) | NATIVE | 1021,14 → 1050,40 | structural | — |
| Live-feed cluster | CUSTOM (glass) | 655,640 → 812,692 | pixel, identical backdrop only | ≤ 400 px |
| Whole workspace | NATIVE-COMPOSED | 0,0 → 1100,700 | structural | — |

Structural mode checks through the accessibility tree: component present,
placement, role, label, state — identifiers `sidebar.connections`,
`sessions.table`, `session.inspector`, `toolbar.refresh`,
`toolbar.inspector`, `cluster.pause`, `cluster.clear`. Native internals
are never pixel-gated.

Live-feed cluster notes:

- The crop spans both control widths (Pause and the wider Resume in the
  `paused` scenario); the cluster is trailing-pinned, so it grows leading.
- Glass composites what is behind it: the pixel mode is valid only under
  `--tr-backdrop standard` with the same scenario, appearance, and window
  size, per capture sidecar. Without the identical backdrop the mode falls
  back to structural plus the material owner's acceptance gate.
- Budget is per capture cell at 2x scale and absorbs material noise only —
  a moved, resized, or re-labeled control exceeds it by construction.
