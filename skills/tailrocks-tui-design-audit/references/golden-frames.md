# Golden frames

A golden frame is the rendered contract: the exact character grid ratatui
produced for one screen, one state, one size. Frames are human-readable in
any diff view, machine-comparable by equality, and — because they were
rendered — proven renderable.

## Producing a frame

Render into a `TestBackend` and take its text form:

```rust
let mut terminal = Terminal::new(TestBackend::new(width, height))?;
terminal.draw(|frame| render_status_board(frame, &fixtures::status_nominal()))?;
let text = terminal.backend().to_string(); // one line per terminal row
```

File rules, each load-bearing for byte equality:

- One file per registry entry: `golden/<screen>--<state>--<WxH>.txt`.
- Every line is exactly the frame width — trailing spaces are content.
- LF line endings, one trailing newline, UTF-8. Box-drawing and glyphs are
  stored as the characters ratatui emitted, never escaped.
- Frames are written only by the gallery's `--write`. Hand-editing a golden
  is authoring off-substrate with extra steps.

## Determinism

A golden that renders differently twice is not a contract. The fixture
layer, not the render layer, owns determinism:

- The clock is a fixture value; every age, duration, and timestamp string
  derives from it. No `now()` inside view code.
- Fixture collections are explicitly ordered; nothing depends on map
  iteration or randomness.
- Sizes are pinned per entry. Resize behavior is designed as rules (which
  regions give, what drops first) and pinned at two sizes — reference and
  minimum — not as a golden per width. A below-minimum screen is its own
  state with its own frame.

## What text frames cannot carry

The text dump captures characters, not styles. Two mechanisms close the
gap, and both live in the gallery:

- **Style spot-checks** in the registry: named cells asserted against
  `buffer[(x, y)].style()` — fg, bg, modifiers. Anchor the cells that carry
  meaning: selection, state glyphs, banners, headers, footers.
- **Style roles in `MANIFEST.md`**: the human-readable table of which role
  gets which named color and modifier, so the blessing covers style even
  though the frame file shows none of it.

Because styles are the invisible half, the design must survive without
them: state is always glyph plus word, never color alone.

## Direction of authority

The frames hold the code; the code never holds the frames. `--write` is
legitimate exactly twice:

1. During design, before blessing — iteration.
2. After the user re-blesses a deliberate design change — the frame diff is
   reviewed as a design decision, in its own commit, before any
   implementation change that depends on it.

Running `--write` because the golden test is red is the inversion that
turns the contract into `x == x`. A red golden test has two exits: fix the
view code, or take the change back to the user as a re-blessing
conversation. There is no third.
