# Feedback — round 01

- **Item**: roadmap/loom-sync/README.md
- **Branch**: roadmap/loom-sync · **At**: `8400e14d`
- **Reported**: 2026-08-20
- **Verified by**: —

## Statements

### U1 — CLI always says synced

> Every session in the CLI list says synced, even the one I just started.

- **Surface**: `loom sessions`
- **Reproduction**: start a session, run `loom sessions` immediately.
- **Expected instead**: the live session should read `live`.

### U2 — sidebar empty

> The desktop sidebar is empty for me.

- **Surface**: desktop app, session sidebar
- **Reproduction**: not given
- **Expected instead**: the same sessions the CLI lists.

## Environment

- **Built from**: roadmap/loom-sync at `8400e14d`
- **Data**: the operator's real `~/.config/loom`
- **Platform**: macOS 26.6.2
