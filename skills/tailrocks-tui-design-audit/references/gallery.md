# The gallery crate

The gallery is the rendering half of the design contract: a small workspace
crate that renders every designed screen from fixture data, previews it in a
terminal, writes the golden frames, and carries the test that holds the
implementation to them. One gallery per application.

## Where the view layer lives

The application crate exposes its screens as a library of **pure view
functions** over view models:

```rust
// in the app crate, e.g. src/ui/status_board.rs
pub struct StatusBoardView {
    pub runs: Vec<RunRow>,
    pub selected: Option<usize>,
    pub condition: DataCondition, // Nominal | Stale { .. } | Error { .. }
    pub now: DateTime<Utc>,
}

pub fn render_status_board(frame: &mut Frame, view: &StatusBoardView)
```

Rules that make the contract hold:

- **Pure function of `(view model, frame area)`.** No wall-clock reads, no
  I/O, no global state inside rendering — the clock and every derived string
  come in through the view model. A render function that reads `Utc::now()`
  produces untestable goldens.
- **The gallery calls these functions; it never copies them.** The moment a
  render function is duplicated into the gallery, the design and the
  implementation stop sharing a substrate and the goldens prove nothing.
- Design mode may create these modules — view models and render functions
  are design output. Event handling, data loading, and state transitions
  are not; they stay unwritten until implementation.

## Crate layout

```text
crates/<app>-gallery/
├── Cargo.toml          # path-depends on the app crate's library target
├── src/
│   ├── main.rs         # preview binary: --list, --screen, --write
│   ├── registry.rs     # every screen × state × size, one entry each
│   └── fixtures.rs     # deterministic view-model builders
├── golden/             # committed frames: <screen>--<state>--<WxH>.txt
├── MANIFEST.md         # the human contract + blessing records
└── tests/
    └── golden.rs       # frames match render; style spot-checks
```

The crate is a private workspace member (`publish = false`). It exists so a
design change is a code edit plus `--write`, never a hand-retyped grid.

## The registry

One entry per screen × state × size — the registry is the single enumeration
everything else walks (preview, `--write`, the golden test):

```rust
pub struct Entry {
    pub screen: &'static str,
    pub state: &'static str,
    pub size: (u16, u16),
    pub render: fn(&mut Frame),
    pub style_checks: &'static [StyleCheck],
}
```

`style_checks` carries the cell-level style assertions text frames cannot:
each names a cell `(x, y)`, the expected fg/bg/modifiers, and what it pins
("selected row reversed", "stale age cell yellow"). A handful of anchored
cells per frame is enough; asserting every cell's style duplicates the frame
in a worse notation.

## The preview binary

- `--list` — print every registry entry.
- `--screen <name> --state <state> [--size WxH]` — render to a
  `TestBackend` and print the frame to stdout. This is the iteration loop
  with the user: render, show, adjust. It draws through the same code path
  as the goldens, so what the user blesses is what the test enforces.
- `--write` — regenerate every golden from the registry. The only writer of
  `golden/`; see `golden-frames.md` for when running it is legitimate.

## The golden test

`tests/golden.rs` walks the registry, renders each entry, and asserts:

1. The rendered frame equals `golden/<screen>--<state>--<WxH>.txt`
   byte-for-byte.
2. Every style check matches the buffer cell it names.
3. Every file in `golden/` is claimed by a registry entry — an orphan frame
   is a stale contract.

Because the gallery renders the shipped view functions, this one test is
simultaneously the regeneration check and the implementation gate: when the
feature's view code changes, the test goes red, and the answer is either
fixing the code or re-blessing the design — never silently rewriting frames.
The test runs under the repository's normal test command, so the existing
CI gates and any goal-execution loop enforce the design without new wiring.
