# Rejected macOS screen — worked verification loop

**This screen was REJECTED at 57/100.** It demonstrates the family catching
defects; it is not a visual model to imitate. The artifacts were produced with
the skills at commit `64df333` and intentionally preserve that historical run.

Read in this order:

1. `ExperienceBrief.md` — `tailrocks-macos-design`
2. `NativeComponentMap.md` — `tailrocks-macos-design`
3. `LiveFeedCluster-contract.md` — `tailrocks-macos-design`
4. `Alternatives.md` — `tailrocks-macos-design`
5. `Implementation.md` — implementation handoff record
6. `StateMatrix.md` and `captures/` — `tailrocks-macos-visual-qa`
7. `DesignReview.md` — independent `tailrocks-macos-design` review
8. `ReviewDisposition.md` — per-finding disposition and intake
9. `prototype/` — `tailrocks-macos-prototype`

The historical run built its scratch app by hand and discarded the source —
the loss that `tailrocks-macos-prototype` now prevents. `prototype/` is the
standardized replacement, kept as the repository's runnable Liquid Glass
reference: a committed SwiftPM package rendering the approved design's
fixture scenarios under the fixed `--tr-*` launch contract, captured through
the visual-qa harness (`prototype/captures/` with metadata sidecars), with
`Regions.md` binding every mapped region to its match mode and `SIGNOFF.md`
left honestly unblessed — the state a prototype is in before its user
sign-off.

```sh
cd prototype
swift build
./Scripts/bundle.sh                      # stages a signed .app outside /tmp
./harness/capture.sh <staged.app> ConnectionsBoardProto out.png \
  ConnectionsBoard -- --tr-scenario default --tr-appearance light \
  --tr-window 1100x700 --tr-backdrop standard
```
