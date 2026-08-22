# Rule placement and file creation

List every governed path, take their deepest common ancestor, then walk upward
only while the rule remains true of everything below. The deepest valid
directory owns the rule. Root ownership must be proved, not assumed. Never move
a rule upward merely because an ancestor already has `AGENTS.md`.

A new owning directory gets one regular `AGENTS.md`. Each approved client name
beside it is a relative symlink to the bare `AGENTS.md` filename, created through
the installed topology script in the same recoverable change. Link operations
are sequential and each emits its own typed receipt; partial publication is
reported, never mislabeled atomic. Existing regular client files, wrong links,
duplicates, and ancestor conflicts are sync work and must not be repaired as a
side effect of adding a rule.

Never repeat an ancestor rule. A descendant may state a deliberate override only
when its scope genuinely differs and the override names the ancestor contract.
