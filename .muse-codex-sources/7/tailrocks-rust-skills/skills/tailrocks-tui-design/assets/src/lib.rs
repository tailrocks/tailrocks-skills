pub mod fixtures;
pub mod registry;

use ratatui::Terminal;
use ratatui::backend::TestBackend;

/// Render one registry entry to its text frame — the same code path for
/// preview, `--write`, and the golden test.
pub fn render_text(entry: &registry::Entry) -> String {
    let (width, height) = entry.size;
    let mut terminal =
        Terminal::new(TestBackend::new(width, height)).expect("test backend");
    terminal.draw(|frame| (entry.render)(frame)).expect("render");
    format!("{}", terminal.backend())
}
