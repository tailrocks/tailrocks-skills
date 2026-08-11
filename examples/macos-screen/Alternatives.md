# Structural alternatives — ConnectionsBoard sessions workspace

Three structurally distinct options, compared pairwise on matched states
(typical window, same fixture, light). Color/radius/spacing variations are
not alternatives and were not generated.

## A — Sidebar-led (chosen)

`NavigationSplitView`: connections sidebar → sessions `Table` → `.inspector`.
Table dominates; inspector holds per-session detail; floating LiveFeedCluster
over the table.

## B — Table-led, no sidebar

Single connection picker in the toolbar; full-width sessions table; inspector
for detail. Maximizes table width; hides the connection dimension.

## C — Inspector-led master-detail

Sessions list (compact) on the left, permanent wide detail pane right
(statement, plan, timings always visible).

## Pairwise

**A vs B** — task clarity: incident work hops across connections; burying the
connection dimension in a toolbar picker adds a click to the most frequent
context switch. macOS nativeness: both native; A matches the platform's
navigation idiom for collection → items. A wins.

**A vs C** — content hierarchy: the primary job is scanning many sessions for
unhealthy ones; C spends half the width on one session's detail, shrinking
the scan surface. Resize: C's permanent pane clips first at minimum width; A
collapses the inspector. A wins.

**Decision:** A. Rejected alternatives recorded with reasons; revisit C if
the primary job shifts from scanning to deep per-session analysis.
