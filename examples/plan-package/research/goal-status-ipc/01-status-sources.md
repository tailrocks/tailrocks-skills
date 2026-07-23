# 01 — Status snapshot sources

Questions: How should a local viewer read executor status safely?
Informs: goal-live-status
Method: example primary-source and codebase read
Vetted: 2026-07-23

## Findings

### Atomicity

- Write-temp then rename presents one complete snapshot to readers. —
  example://rust-atomic-rename (confidence: HIGH)

### Compatibility

- A numeric envelope version permits explicit unsupported-version errors. —
  example://snapshot-schema (confidence: HIGH)

### Verification

- The example workspace exposes `mise run check`, `mise run test`, and
  `mise run lint`. — example://workspace-gates (confidence: HIGH)

## Dead ends and contradictions

- Process liveness cannot prove persisted slice progress.

## Open unknowns

- Authentication for remote status transport.
