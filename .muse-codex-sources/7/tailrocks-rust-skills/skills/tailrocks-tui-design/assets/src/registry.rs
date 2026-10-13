use ratatui::Frame;
use ratatui::style::{Color, Modifier};
use std::collections::HashSet;

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

const MAX_ENTRIES: usize = 4_096;
const MAX_WIDTH: u16 = 500;
const MAX_HEIGHT: u16 = 200;
const MAX_TOTAL_CELLS: usize = 1_000_000;

fn valid_identifier(value: &str) -> bool {
    (1..=64).contains(&value.len())
        && value
            .bytes()
            .all(|byte| byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-')
        && value
            .as_bytes()
            .first()
            .is_some_and(u8::is_ascii_alphanumeric)
        && value
            .as_bytes()
            .last()
            .is_some_and(u8::is_ascii_alphanumeric)
}

pub fn validate(entries: &[Entry]) -> Result<(), &'static str> {
    if entries.is_empty() || entries.len() > MAX_ENTRIES {
        return Err("registry_count_out_of_bounds");
    }
    let mut identities = HashSet::new();
    let mut names = HashSet::new();
    let mut total_cells = 0usize;
    for entry in entries {
        if !valid_identifier(entry.screen) || !valid_identifier(entry.state) {
            return Err("invalid_identifier");
        }
        let (width, height) = entry.size;
        if width == 0 || height == 0 || width > MAX_WIDTH || height > MAX_HEIGHT {
            return Err("frame_size_out_of_bounds");
        }
        total_cells = total_cells
            .checked_add(usize::from(width) * usize::from(height))
            .ok_or("registry_cells_out_of_bounds")?;
        if total_cells > MAX_TOTAL_CELLS {
            return Err("registry_cells_out_of_bounds");
        }
        if !identities.insert((entry.screen, entry.state, entry.size))
            || !names.insert(entry.golden_name())
        {
            return Err("duplicate_registry_entry");
        }
        for check in entry.style_checks {
            if check.x >= width
                || check.y >= height
                || check.pins.is_empty()
                || check.pins.len() > 160
            {
                return Err("invalid_style_check");
            }
        }
    }
    Ok(())
}

pub fn entries() -> Vec<Entry> {
    vec![
        Entry {
            screen: "status-board",
            state: "default",
            size: (80, 24),
            render: |frame| app::ui::status_board::render(frame, &fixtures::status_board_default()),
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
            render: |frame| app::ui::status_board::render(frame, &fixtures::status_board_empty()),
            style_checks: &[],
        },
        // One entry per screen × state × size; the minimum-size entry pins
        // the resize rules, the below-minimum state pins the too-small
        // screen.
    ]
}
