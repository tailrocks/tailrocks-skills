//! Token-bucket rate limiter for the public API edge.

pub struct RateLimit {
    capacity: u32,
    refill_per_second: u32,
}

impl RateLimit {
    #[must_use]
    pub fn new(capacity: u32, refill_per_second: u32) -> Self {
        Self { capacity, refill_per_second }
    }

    #[must_use]
    pub fn burst(&self) -> u32 {
        self.capacity
    }

    #[must_use]
    pub fn steady_state(&self) -> u32 {
        self.refill_per_second
    }
}
