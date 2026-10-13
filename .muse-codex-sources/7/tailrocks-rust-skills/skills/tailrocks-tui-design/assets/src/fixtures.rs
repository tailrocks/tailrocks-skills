//! Deterministic view-model builders. The fixture layer owns determinism:
//! the clock is a value, collections are explicitly ordered, strings are
//! realistic (real lengths, one too-long value, one unicode value).

use app::ui::status_board::{DataCondition, RunRow, RunState, StatusBoardView};

/// Every derived time string in the goldens flows from this instant.
pub const FIXTURE_NOW: &str = "2026-07-23T14:02:14Z";

pub fn status_board_default() -> StatusBoardView {
    StatusBoardView {
        runs: vec![
            RunRow {
                name: "docs".into(),
                state: RunState::Active,
                current: 2,
                total: 3,
                age: "3s ago".into(),
            },
            RunRow {
                name: "parser".into(),
                state: RunState::Done,
                current: 4,
                total: 4,
                age: "2h ago".into(),
            },
            RunRow {
                name: "ingest-westeros".into(), // exercises the truncation rule
                state: RunState::Blocked,
                current: 1,
                total: 5,
                age: "41m ago".into(),
            },
        ],
        selected: Some(0),
        condition: DataCondition::Nominal,
    }
}

pub fn status_board_empty() -> StatusBoardView {
    StatusBoardView {
        runs: vec![],
        selected: None,
        condition: DataCondition::Nominal,
    }
}
