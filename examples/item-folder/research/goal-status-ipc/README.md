# Goal-status IPC

Vetted example research for local, read-only status snapshots.

- Atomic rename avoids partial readers; see
  [status sources](01-status-sources.md).
- Versioned envelopes make incompatible writers observable.
- Remote transport remains unknown and deferred.
