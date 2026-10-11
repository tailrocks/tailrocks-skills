# Design Review — <feature>

Reviewer (must not be the implementing agent):
Date:
Deployment target:
Pass: preliminary / acceptance
Live-render session identity (required for acceptance; preliminary-only static evidence is labeled per row):

## Rendered evidence

| State | Live observation in bound session, or `PRELIMINARY STATIC` locator |
|---|---|
| Typical window, light | |
| Typical window, dark | |
| Minimum window | |
| Wide window | |
| Inactive window | |
| Sidebar collapsed | |
| Inspector closed | |
| Empty | |
| Loading | |
| Error | |
| Large dataset | |
| Long strings | |
| Reduce Transparency | |
| Increase Contrast | |
| Differentiate Without Color | |
| Offline | |
| Permission denied | |
| Destructive operation pending | |
| Missing values | |
| Reduce Motion | |

For acceptance, every row must name a live observation in the bound session; a
missing or static-only row is a finding, not an omission. Preliminary review
marks prototype-only rows pending and cannot pass acceptance.

## First impression

What is perceived first:
Is that the correct thing:
Current location and selection identifiable without hovering:
Exactly one clear primary action:

## Score

| Category | Weight | Score | Notes |
|---|---|---|---|
| Product clarity and information architecture | 15 | | |
| macOS nativeness | 20 | | |
| Visual hierarchy and composition | 15 | | |
| Liquid Glass correctness and restraint | 15 | | |
| Typography, color, and iconography | 10 | | |
| Interaction and motion | 10 | | |
| Accessibility, localization, and input | 10 | | |
| Performance, edge cases, and finish | 5 | | |
| **Total** | **100** | | |

Threshold: total at least 90, every category at least 60% of its weight, zero
hard failures.

## Hard failures

| Failure | Present | Evidence |
|---|---|---|
| Pervasive glass content cards | | |
| Overlapping or nested glass | | |
| Unreadable content over complex backgrounds | | |
| Clipping at minimum width | | |
| Keyboard-navigation dead end | | |
| Custom control weaker than a native one | | |
| State communicated by color alone | | |
| Missing empty, loading, or error handling | | |
| Broken Reduce Motion / Reduce Transparency / Increase Contrast | | |
| Destructive action without confirmation, undo, or recovery | | |
| A path by which a person can lose work | | |
| Window state not restored across quit and relaunch — position, size, sidebar width, open documents | | |
| Command reachable only through a command palette, with no menu equivalent | | |
| Function reachable only by hover, or only by drag and drop | | |
| Toolbar action without a menu-bar command | | |
| No inactive-window validation | | |
| No rendered output | | |
| Implementer is the only reviewer | | |

## Score caps applied

| Condition | Triggered? | Resulting cap |
|---|---|---:|
| A person can lose work, or restoration is critically broken | | 49 |
| A core task is not reachable by keyboard | | 59 |
| Material is unreadable under a supported accessibility setting | | 59 |
| A major window fails at a supported size | | 59 |
| The menu and command model is incomplete | | 69 |
| Only ideal placeholder data was reviewed | | 69 |
| The implementing agent is the only reviewer | | 79 |

## Preserve

- Strong incumbent patterns:
- Correct native behavior already in place:
- Effective identity:
- Good use of restraint:
- Components that should not be redesigned:

## Findings, in correction order

| # | Severity rank | Finding | Evidence class | Location | Correction | Verification |
|---|---|---|---|---|---|---|
| | 1 broken workflow … 9 micro-polish | | rendered / behavior / source / platform / inference | | | |

## What can be deleted

The single most improving question. List anything present that does not earn its
place.

## Learned

New anti-pattern to record:
New rubric line to add:
Decision record to write:
