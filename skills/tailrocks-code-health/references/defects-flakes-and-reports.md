# Defects, Flakes, and Gate Reports

## Defect to gate

Record every escaped defect with date, symptom, architectural enabling condition,
characterization test, and permanent gate/lint/budget adopted. If no gate is
appropriate, record why. Review the ledger when choosing the next enforcement
investment. Fixing one symptom without removing its enabling condition leaves an
explicit root-cause item.

## Flakes

Retries reveal flakes; they do not forgive them. Configure nextest/Bun reporting
so pass-on-retry remains visible. An unlisted flaky test fails. Quarantine entries
contain exact test identity, owner, reason, issue, and since date. The ledger is a
presence ratchet: new names fail, fixed names are deleted, and stale entries fail.
Store JUnit/machine-readable artifacts for trend and runtime analysis.

## Reports

Every project-owned gate emits one semantic violation model:

```text
schema, gate, ok, rule, file, line?, why, fix, rerun
```

Render it as human prose, versioned JSON, or CI annotations. Format changes never
change pass/fail. Human mode stays actionable; JSON stays deterministic; CI mode
escapes control characters and retains readable logs. A non-empty violation set
exits nonzero after emission.

**Completion:** each failure says what rule failed, why it matters, the exact
clearing action, and the narrowest rerun command.
