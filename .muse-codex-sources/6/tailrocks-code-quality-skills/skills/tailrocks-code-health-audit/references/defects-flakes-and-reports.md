# Defect, flake, and report criteria

Every escaped defect has a dated identity, a symptom, an
architectural enabling condition, and characterization proof. It
has a permanent gate or a reason that no gate fits. A
symptom-only fix retains an explicit root-cause item.

Retries expose flakes. They never forgive them. Pass-on-retry
stays visible. An owned presence ledger records the exact test
identity, owner, reason, issue, and since date. Unlisted flakes
and stale resolved entries fail. Machine-readable test artifacts
retain trend, count, and runtime evidence.

Every project-owned gate emits one semantic violation model:

```text
schema, gate, ok, rule, file, line?, why, fix, rerun
```

Human, versioned JSON, and CI renderers preserve identical
pass and fail semantics. Non-empty violations exit nonzero,
escape control characters, and name the narrowest correction
and rerun command.
