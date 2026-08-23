# Instruction topology audit

For every directory with instructions, inventory the regular `AGENTS.md` and
each configured client basename. A valid client entry is a relative symlink to
the bare `AGENTS.md` in the same directory. Record missing, regular-file,
wrong-target, broken, escaping, looped, and unresolved states without repair.

Map effective ancestor-to-descendant load chains. Report exact duplicate rules,
contradictions, unjustified overrides, and rules whose governed paths place them
at a different deepest owner. Measure file bytes and chain bytes; never estimate.
Root overbreadth and large files are review triggers, not automatic defects.
