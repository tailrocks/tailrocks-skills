# Defect, Flake, and Report Criteria

Every escaped defect has a dated identity, symptom, architectural enabling
condition, characterization proof, and permanent gate or a reason no gate fits.
A symptom-only fix retains an explicit root-cause item.

Retries expose flakes; they never forgive them. Pass-on-retry stays visible. An
owned presence ledger records exact test identity, owner, reason, issue, and
since date. Unlisted flakes and stale resolved entries fail. Machine-readable
test artifacts retain trend, count, and runtime evidence.

Every project-owned gate emits one semantic violation model:

```text
schema, gate, ok, rule, file, line?, why, fix, rerun
```

Human, versioned JSON, and CI renderers preserve identical pass/fail semantics.
Non-empty violations exit nonzero, escape control characters, and name the
narrowest correction and rerun command.
