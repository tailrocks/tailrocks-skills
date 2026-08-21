# Goal — session-sync

Work strictly by `roadmap/session-sync/plan/README.md`.

```sh gates
cargo nextest run --workspace ||| cargo nextest list --workspace | wc -l
cargo clippy --workspace -- -D warnings ||| cargo metadata --format-version 1 --no-deps | tr ',' '\n' | grep -c '"name"'
```

Stop when `sh roadmap/session-sync/goal/check.sh` prints a final line
starting `TAILROCKS GOAL: PASS`.
