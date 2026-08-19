# Session storage

### Requirement: Mutable JSON session snapshot

The service MUST rewrite `sessions.json` for every session mutation.

#### Scenario: Persist a changed session

- **WHEN** a session changes
- **THEN** `sessions.json` is rewritten.

### Requirement: Legacy snapshot migration

The service MUST copy legacy JSON sessions into the mutable snapshot.

#### Scenario: Import legacy sessions

- **WHEN** legacy JSON exists
- **THEN** its sessions are copied into `sessions.json`.
