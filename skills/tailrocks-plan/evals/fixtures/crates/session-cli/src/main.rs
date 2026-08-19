pub struct Session {
    pub id: String,
    pub project: String,
    pub state: String,
}

pub fn list_json() -> Vec<Session> {
    Vec::new()
}

pub fn open(id: &str) {
    let _ = id;
}

pub fn stop(id: &str) {
    let _ = id;
}

fn main() {}
