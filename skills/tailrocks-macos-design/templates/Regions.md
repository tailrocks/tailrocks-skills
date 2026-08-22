# Regions — <Feature>

Every visible region from the component map, with the match mode the
implementation is held to. Rects are points from the window's top-left at
the reference `--tr-window` size; pixel modes diff the cropped region with
the visual-regression protocol under the identical backdrop and scenario.

| Region | Class | Rect (pt) | Mode | Budget |
|---|---|---|---|---|
| <region> | CUSTOM | <x1,y1 → x2,y2> | pixel | ≤ <n> px |
| <region> | NATIVE | <x1,y1 → x2,y2> | structural | — |
| <region> | NATIVE-COMPOSED | <x1,y1 → x2,y2> | structural | — |

Structural mode checks through the accessibility tree: component present,
placement, role, label, state. Native internals are never pixel-gated.
