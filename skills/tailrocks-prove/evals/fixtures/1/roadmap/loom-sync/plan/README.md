# Loom Sync — plan

Frozen contract fingerprint: `f3a91c0d4b6e2a5178c9d0e4b7a2f6c8d1e35b90`

| Plan | Scope | Status |
|---|---|---|
| 001-projection | One projection serving both surfaces | DONE |
| 002-cli-list | `loom sessions` renders the projection | DONE |
| 003-desktop-sidebar | Sidebar renders the same projection | DONE |
| 004-refresh | Refresh from either surface | DONE |

Done criteria as written by the plans:

- 001: `cargo nextest run -p loom-projection` exits 0
- 002: `cargo nextest run -p loom-cli` exits 0
- 003: `cargo nextest run -p loom-desktop-ui` exits 0
- 004: `cargo nextest run -p loom-sync-refresh` exits 0
