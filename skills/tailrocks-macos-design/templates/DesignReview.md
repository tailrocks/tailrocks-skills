# Design Review — <feature>

Reviewer (must not be the implementing agent):
Date:
Deployment target:
Rendered evidence attached: yes / no

## Rendered evidence

| State | Screenshot |
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

A missing row is a finding, not an omission.

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
| Toolbar action without a menu-bar command | | |
| No inactive-window validation | | |
| No rendered output | | |
| Implementer is the only reviewer | | |

## Findings, in correction order

| # | Severity rank | Finding | Correction |
|---|---|---|---|
| | 1 broken workflow … 9 micro-polish | | |

## What can be deleted

The single most improving question. List anything present that does not earn its
place.

## Learned

New anti-pattern to record:
New rubric line to add:
Decision record to write:
