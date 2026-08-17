use ratatui::Frame;
use ratatui::style::{Color, Modifier};

use crate::fixtures;

/// One cell-level style assertion a text frame cannot carry.
pub struct StyleCheck {
    pub x: u16,
    pub y: u16,
    pub fg: Color,
    pub bg: Color,
    pub mods: Modifier,
    /// What this cell pins, e.g. "selected row reversed".
    pub pins: &'static str,
}

/// One screen × state × size. The registry is the single enumeration the
/// preview binary, `--write`, and the golden test all walk.
pub struct Entry {
    pub screen: &'static str,
    pub state: &'static str,
    pub size: (u16, u16),
    pub render: fn(&mut Frame),
    pub style_checks: &'static [StyleCheck],
}

impl Entry {
    pub fn golden_name(&self) -> String {
        format!(
            "{}--{}--{}x{}.txt",
            self.screen, self.state, self.size.0, self.size.1
        )
    }
}

pub fn entries() -> Vec<Entry> {
    vec![
        Entry {
            screen: "status-board",
            state: "default",
            size: (80, 24),
            render: |frame| {
                app::ui::status_board::render(frame, &fixtures::status_board_default())
            },
            style_checks: &[
                StyleCheck {
                    x: 4,
                    y: 2,
                    fg: Color::Cyan,
                    bg: Color::Reset,
                    mods: Modifier::REVERSED,
                    pins: "selected active run glyph",
                },
                StyleCheck {
                    x: 2,
                    y: 23,
                    fg: Color::Reset,
                    bg: Color::Reset,
                    mods: Modifier::DIM,
                    pins: "footer hints",
                },
            ],
        },
        Entry {
            screen: "status-board",
            state: "empty",
            size: (80, 24),
            render: |frame| {
                app::ui::status_board::render(frame, &fixtures::status_board_empty())
            },
            style_checks: &[],
        },
        // One entry per screen × state × size; the minimum-size entry pins
        // the resize rules, the below-minimum state pins the too-small
        // screen.
    ]
}
