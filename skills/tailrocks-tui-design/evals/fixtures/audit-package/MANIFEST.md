# Screen manifest — goalctl

## Status board

- **Purpose**: every run at a glance with slice progress.
- **Sizes**: reference 80x24, minimum 60x15; resize rules: panel flexes,
  footer path drops first.
- **States**: default | empty | loading — settled and final for
  implementation.
- **Style roles**:
  | Role | Style |
  |---|---|
  | panel title | BOLD |
  | footer | DIM |
  | active glyph | Cyan |
- **Formats**: ages as `3s ago` / `41m ago`, integer division; run name
  truncates at 9 + `…`.
- **Keys**: `↑/↓ select · enter detail · r refresh · q quit`.
- **Frames**: status-board--default--80x24.txt
- **Blessed**: None
