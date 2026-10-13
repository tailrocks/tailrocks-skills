//! The design contract: every registry entry renders byte-equal to its
//! committed golden frame, every style check holds, and every committed
//! frame is claimed by an entry.
//!
//! Red here has exactly two exits: fix the view code, or take the change
//! back to the user and re-bless (`--write` in its own reviewed commit).

use std::collections::HashSet;
use std::path::Path;

use app_gallery::{registry, render_text};
use ratatui::Terminal;
use ratatui::backend::TestBackend;

fn golden_dir() -> &'static Path {
    Path::new(concat!(env!("CARGO_MANIFEST_DIR"), "/golden"))
}

#[test]
fn frames_match_render() {
    let entries = registry::entries();
    registry::validate(&entries).expect("valid bounded registry");
    for entry in entries {
        let path = golden_dir().join(entry.golden_name());
        let expected = std::fs::read_to_string(&path)
            .unwrap_or_else(|_| panic!("missing golden {}", path.display()));
        let rendered = render_text(&entry);
        assert_eq!(
            rendered,
            expected,
            "frame drift in {} — fix the view code or re-bless the design",
            entry.golden_name()
        );
    }
}

#[test]
fn style_checks_hold() {
    let entries = registry::entries();
    registry::validate(&entries).expect("valid bounded registry");
    for entry in entries {
        let (width, height) = entry.size;
        let mut terminal = Terminal::new(TestBackend::new(width, height)).unwrap();
        terminal.draw(|frame| (entry.render)(frame)).unwrap();
        let buffer = terminal.backend().buffer();
        for check in entry.style_checks {
            let style = buffer[(check.x, check.y)].style();
            assert_eq!(
                (style.fg, style.bg, style.add_modifier),
                (Some(check.fg), Some(check.bg), check.mods),
                "{}: style check '{}' at ({}, {})",
                entry.golden_name(),
                check.pins,
                check.x,
                check.y
            );
        }
    }
}

#[test]
fn no_orphan_frames() {
    let entries = registry::entries();
    registry::validate(&entries).expect("valid bounded registry");
    let claimed: HashSet<String> = entries.iter().map(|e| e.golden_name()).collect();
    for file in std::fs::read_dir(golden_dir()).expect("golden dir") {
        let name = file.unwrap().file_name().into_string().unwrap();
        assert!(
            claimed.contains(&name),
            "orphan golden {name} — no registry entry claims it"
        );
    }
}
