# Design Review — ConnectionsBoard sessions workspace

Reviewer (must not be the implementing agent): independent review agent (not the implementer)
Date: 2026-08-11
Deployment target: macOS 26.0 (per LiveFeedCluster contract fallback section)
Rendered evidence attached: yes — 9 PNGs in `captures/` (01–09)

Verdict: **REJECTED.** Total 57/100 (threshold 90). One hard failure confirmed
from rendered evidence (clipping at minimum width), one hard failure by the
rendered-evidence rule (loading state never rendered). Two categories below
their 60% minimum (Interaction and motion; Accessibility, localization, and
input). Scored strictly from captures; nothing was scored from source code.

## Rendered evidence

| State | Screenshot |
|---|---|
| Typical window, light | `captures/01-typical-light.png` — **defective evidence**: window is inactive (gray traffic lights, gray title, gray selection). Active typical-light appearance is unproven. See finding 15. |
| Typical window, dark | `captures/02-typical-dark.png` — valid (active, 2200×1400 = 1100×700 @2x) |
| Minimum window | `captures/03-minimum-light.png` — **partial**: 1440×984 px = 720×492 logical, not the declared 720×440; minimum height unvalidated. Inspector overlays the table, hiding the Duration column, so the brief's minimum-usability claim is unproven. See findings 7–8. |
| Wide window | `captures/04-wide-light.png` — valid (active, 1500×900 logical) |
| Inactive window | `captures/09-inactive-light.png` — valid (gray chrome, gray selection, faded toolbar; cluster follows system appearance) |
| Sidebar collapsed | **missing — finding 9** |
| Inspector closed | **missing — finding 9.** No non-empty capture shows the table without the inspector. |
| Empty | `captures/05-empty-light.png` — valid (ContentUnavailableView, guidance text, cluster hidden per contract) |
| Loading | **missing — finding 1.** Rubric-listed state; treated as missing handling under the rendered-evidence rule. |
| Error | `captures/06-error-light.png` — content valid (non-modal, Retry, cluster hidden), but window captured inactive; active error appearance and toolbar enabled/disabled states unprovable. |
| Large dataset | `captures/07-large-light.png` — valid (5,000 rows, scrolled mid-list, scroll edge effect at top, scrollbar present) |
| Long strings | `captures/08-longstrings-dark.png` — content valid (German names truncate in table, wrap fully in inspector; idle "—" placeholder), but window captured inactive. |
| Reduce Transparency | **recorded skip (shared machine) — finding 5.** Contract-required substitution preview also missing. |
| Increase Contrast | **recorded skip — finding 5** |
| Differentiate Without Color | **recorded skip — finding 5** |

Additional brief-declared states with no evidence: permission-denied
(read-only role hides Terminate), destructive-pending (terminate
confirmation), paused cluster (contract-required preview), Reduce Motion,
Liquid Glass Clear/Tinted, accent/highlight variations, VoiceOver,
localization/RTL. Each is a finding, not an omission.

## First impression

What is perceived first: in the active captures (02, 04), the accent-blue
selected row — a Blocked session — then the sidebar connection list.
Is that the correct thing: yes when a row is selected; but with nothing
selected the monochrome table has no focal point — unhealthy rows do not pop
(finding 6).
Current location and selection identifiable without hovering: yes in active
captures — sidebar selection capsule plus accent row selection. In 01/06/08
(inactive captures) selection is gray and weak, as expected for inactive.
Exactly one clear primary action: no. Toolbar shows two equal-weight icon
buttons (sidebar.right, arrow.clockwise); Refresh is trailing-most but not
visually distinguished. The component map explicitly declares no prominent
tint is needed, so this is accepted as designed — but "exactly one clear
primary action" is not what renders.

## Score

| Category | Weight | Score | Notes |
|---|---|---|---|
| Product clarity and information architecture | 15 | 10 | Object model reads cleanly: connections → sessions → detail. Empty-state guidance good (05). Against: glance-detection of unhealthy sessions (the stated primary job) is weak in monochrome (06 finding 6); Statement column dead at typical width (finding 14); duration shown in two different formats for the same value (finding 13). |
| macOS nativeness | 20 | 12 | All-native structure confirmed: NavigationSplitView, Table with pinned header, inspector, system toolbar, ContentUnavailableView, native scrollbar and scroll edge effect (07). Against: sidebar inset collapse/clipping at minimum width (finding 7); menu-bar commands never evidenced (finding 4); keyboard/focus behavior never evidenced (finding 5). |
| Visual hierarchy and composition | 15 | 9 | Content dominates chrome; table dominates the window; alignment and density suit sustained monitoring. Against: widest column carries 3 characters at typical width (finding 14); no preattentive channel for the rows that matter (finding 6). |
| Liquid Glass correctness and restraint | 15 | 9 | Restraint is genuinely good: zero glass content cards, flat native surfaces, one custom glass cluster confined to the functional layer. Against: cluster surfaces render permanently half-merged with a metaball seam (finding 10); cluster glass nearly invisible over light content, icons collide with row text (finding 11); selected-row blue bleeds through the overlay inspector behind "PID" at minimum width (finding 12); Clear/Tinted variants skipped. |
| Typography, color, and iconography | 10 | 6 | System font, monospaced SQL, consistent SF Symbols (octagon-exclamation, tortoise, checkmark.circle, zzz, arrow.clockwise, sidebar.right, xmark.bin). Against: duration format inconsistency (finding 13); semantic state color absent entirely although the brief's accessibility plan presumes state colors exist (finding 6). |
| Interaction and motion | 10 | 4 | Provable from stills: selection state, empty, error, cluster hidden in empty/error per contract. Unproven: loading, hover, focus rings, paused state (contract-required preview missing), pause morph, interruption behavior, Reduce Motion fallback, terminate confirmation. Static captures cannot carry this category and no supplementary evidence was provided. |
| Accessibility, localization, and input | 10 | 4 | Proven: color independence (state = symbol + text, 04), text-expansion behavior via German strings (08: table truncates, inspector wraps). Everything else — VoiceOver, keyboard-only, focus visibility, Reduce Transparency/Motion, Increase Contrast, Differentiate Without Color, RTL — recorded skips. **Below the 60% category minimum.** |
| Performance, edge cases, and finish | 5 | 3 | 5,000 rows render correctly mid-scroll (07); long strings handled (08); missing values "—" (08); empty and error designed. Against: loading, permission-denied, destructive-pending unrendered; minimum height not captured at declared value. |
| **Total** | **100** | **57** | |

Threshold: total at least 90, every category at least 60% of its weight, zero
hard failures. Result: 57/100; Interaction 40% and Accessibility 40% are below
minimum; hard failures present. **Rejected.**

## Hard failures

| Failure | Present | Evidence |
|---|---|---|
| Pervasive glass content cards | no | 01–09: flat native surfaces throughout; only the two-button cluster uses glass |
| Overlapping or nested glass | no | Cluster is one container, two surfaces; no independent glass overlap (the mid-merge seam is finding 10, not independent overlap) |
| Unreadable content over complex backgrounds | no | 03 overlay inspector: content bleeds through but stays legible; 07 cluster over text: legible |
| Clipping at minimum width | **YES** | 03 vs 01: at 720pt the sidebar loses its leading inset — row icons are cut in half by the window edge and the selection capsule runs flush off-screen (03 top-left, rows prod-primary/prod-replica/staging) |
| Keyboard-navigation dead end | unverifiable | No keyboard or focus evidence in any capture; scored against Interaction and Accessibility |
| Custom control weaker than a native one | no | Cluster's decision-order justification is documented; weak affordance recorded as finding 11 |
| State communicated by color alone | no | 04: state = symbol + text in every row; no color used at all |
| Missing empty, loading, or error handling | **YES (loading)** | Empty proven (05), error proven (06); loading never rendered — treated as missing under the rendered-evidence rule |
| Broken Reduce Motion / Reduce Transparency / Increase Contrast | unverifiable | Recorded skips (shared machine); contract-required Reduce Transparency substitution preview also absent |
| Destructive action without confirmation, undo, or recovery | unverifiable | Terminate confirmation designed in the brief but never rendered; no context menu, no confirmation capture |
| Toolbar action without a menu-bar command | unverifiable | No menu-bar capture; View/Session commands exist only on paper |
| No inactive-window validation | no | 09 validates inactive appearance |
| No rendered output | no | 9 captures present |
| Implementer is the only reviewer | no | This review is independent of the implementing agent |

Any confirmed row rejects the feature regardless of score. Two are confirmed.

## Findings, in correction order

| # | Severity rank | Finding | Correction |
|---|---|---|---|
| 1 | 1 broken workflow | Loading state (refresh in flight, table keeps last data) has no rendered evidence anywhere; the constant-frequency primary action's feedback loop is unproven | Capture refresh-in-flight at typical size, light and dark; show the table retaining data plus the in-flight indicator |
| 2 | 1 broken workflow | Destructive path unproven end-to-end: no terminate confirmation capture, no permission-denied (read-only hides Terminate) capture, no context menu capture | Capture the confirmation dialog, the row context menu, and the read-only variant |
| 3 | 2 incorrect IA | Brief predicted "inspector auto-collapses" at minimum width; the system actually presents the inspector as an overlay over content (03) — the brief's minimum-usability claim (state, name, duration usable at 720×440) is false while the overlay is open, since Duration is hidden | Correct the brief to describe overlay presentation; re-verify the minimum-usability claim with the inspector closed |
| 4 | 3 non-native interaction | No menu-bar evidence for any of the four commands (View ▸ Refresh Sessions, View ▸ Show Inspector, View ▸ Pause Live Feed, Session ▸ Terminate) | Capture the open View and Session menus; a toolbar action without a menu-bar command is a hard failure if absent |
| 5 | 4 accessibility failure | Every accessibility validation skipped: VoiceOver, keyboard-only, focus rings, Reduce Motion, Reduce Transparency (contract-required substitution preview missing), Increase Contrast, Differentiate Without Color, RTL | Run the accessibility capture pass on a machine where settings may be toggled; the contract's substitution preview is mandatory, not optional |
| 6 | 5 content hierarchy | Unhealthy sessions do not read at a glance: state rendering is fully monochrome (04 zoom: black octagon, tortoise, checkmark), yet the brief's own plan presumes semantic state colors with symbols as the redundant channel | Add semantic color (red/orange/secondary) to state symbols and text; keep symbol + text so color is never the only channel |
| 7 | 6 resize behavior | **Hard failure.** Sidebar leading inset collapses at 720pt: row icons clipped by the window edge, selection capsule flush to the edge (03 vs 01) | Fix the sidebar's minimum-width layout so row content keeps its inset at the declared minimum |
| 8 | 6 resize behavior | Minimum window captured at 720×492, not the declared 720×440; minimum height never validated; the cluster's "table keeps ≥200pt above it" contract clause is unproven at true minimum | Recapture at exactly 720×440 |
| 9 | 6 resize behavior | No sidebar-collapsed capture and no inspector-closed capture — two template-mandated rows absent; the collapse order claimed in the brief (inspector first, then sidebar) is unproven | Capture both configurations |
| 10 | 7 Liquid Glass misuse | Cluster's two glass surfaces render permanently half-merged: a metaball neck/seam joins the pause and clear circles at rest (crops of 01, 02, 03, 07) — reads as a rendering artifact, not a resolved shape | Resolve the container spacing so the surfaces either fully merge into one capsule at rest or separate cleanly |
| 11 | 7 Liquid Glass misuse | Cluster glass is nearly invisible over light content; in 07 the icon-only buttons sit directly on row text with almost no surface behind them — weak affordance and legibility for a control meant to be found mid-incident | Verify the glass material is actually applied at capture scale; consider the regular material's dimming or a slightly larger surface so the control reads as a control |
| 12 | 7 Liquid Glass misuse | At minimum width the overlay inspector lets the accent-blue selected row bleed through behind the "PID" label (03) — legible but noisy | System-controlled material; verify under Reduce Transparency and against Apple's current overlay behavior before customizing anything |
| 13 | 8 typography and spacing | Duration formats disagree for the same value: table "3m 4s" vs inspector "0:03:04" (01, 02, 04, 08) | One duration formatter, used in both places |
| 14 | 8 typography and spacing | Statement column is dead weight at typical width — truncated to "SEL…", "UP…" (01, 02); the information it carries is zero while it still costs a column | Tune initial column widths (Duration is wider than its content needs); or drop Statement below a width threshold since the inspector owns the full text |
| 15 | 9 micro-polish / evidence hygiene | Captures 01, 06, 08 were taken with the window inactive (gray traffic lights, gray selection): active typical-light, active error, and active long-strings appearances are unproven, and 01 duplicates 09's purpose | Recapture 01, 06, 08 with the window key; keep 09 as the sole inactive capture |
| 16 | 9 micro-polish | Paused-cluster state never captured although the contract lists "cluster live, paused, reduce-transparency substitution" as required previews | Capture the paused state (symbol + label change per contract) |

## What can be deleted

- The Statement column at typical and narrower widths. At 1100pt it renders
  three characters plus an ellipsis (01/02); the inspector already owns the
  full statement. Show it only when width affords it, or delete it and let
  the inspector carry statements entirely.
- The metaball seam between the cluster's two surfaces — visual noise that
  communicates nothing; either one capsule or two clean circles.
- One of 01/09: two inactive-light captures of the same content at different
  sizes; the typical-light slot should hold an active capture.
- Nothing else asks to be deleted — the restraint elsewhere (no cards, no
  decorative borders, no extra chrome) is the strongest quality this screen
  shows.

## Learned

New anti-pattern to record: capturing evidence states with the window
inactive — gray chrome silently invalidates appearance, selection, and
enabled-state claims for that capture; every non-inactive capture must show
colored traffic lights. Second anti-pattern: GlassEffectContainer spacing
tuned into the mid-merge band, leaving surfaces permanently half-fused at
rest.

New rubric line to add: a named capture must match its declared window size
exactly (pixel dimensions = 2× declared logical size), and the reviewer must
verify dimensions, not filenames.

Decision record to write: on macOS 26, `.inspector` at narrow widths presents
as a system overlay over content rather than collapsing; briefs must not
promise "auto-collapse", and minimum-usability claims must be validated with
the inspector closed.
