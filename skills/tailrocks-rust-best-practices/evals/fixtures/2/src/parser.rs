pub enum RawState {
    Empty,
    Value(String),
}

pub fn parse(input: &str) -> Option<RawState> {
    if input.is_empty() {
        Some(RawState::Empty)
    } else {
        Some(RawState::Value(input.to_owned()))
    }
}
