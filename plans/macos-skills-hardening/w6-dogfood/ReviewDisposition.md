# Review disposition — ConnectionsBoard dogfood (2026-08-11)

Independent review (`DesignReview.md`, reviewer = non-implementing agent,
scored from captures only): **rejected at 57/100**, threshold 90; two
categories under their 60% minimum; two hard failures. The rejection is the
dogfood succeeding: the rubric caught real defects that source review and a
green test suite had not.

## Finding disposition

| Finding | Class | Disposition |
|---|---|---|
| Captures 01/06/08 show the inactive appearance (gray traffic lights) — "typical light active" unproven | **Harness defect (skill)** | `templates/capture.sh` now re-activates the app immediately before `screencapture`, with the reason documented — committed in this branch (W6) |
| Sidebar row icons clipped at 720pt width | Implementation defect (scratch app) | real layout bug the rubric caught from pixels; recorded — scratch app is exercise material, the catch itself is the deliverable |
| Loading state never rendered; destructive terminate path (confirmation, read-only) unrendered | Evidence-set gap (this run) | validates the template's "a missing row is a finding" rule; recorded as findings, not silently skipped |
| Session state fully monochrome — unhealthy rows do not pop for the stated scan job | Design finding | correct catch; the fix (semantic color as a redundant channel on top of symbol+text) respects color-independence and would go through the design loop |
| Brief's "inspector auto-collapses" wrong vs system overlay behavior | Brief defect | already corrected in `ExperienceBrief.md` before the review — the source-of-truth order resolved it (native behavior wins) |
| Minimum capture measures 720×492, not 720×440 | Reviewer measurement note | `CB_FRAME` sets the *content* size (720×440); the capture includes ~52pt of window chrome. Declared minimum was honored; noted for future capture metadata (record content vs frame size alongside baselines) |
| Glass cluster renders as two half-merged circles with a metaball seam | Design/material finding | the container `spacing: 20` exceeds the inner 10pt spacing, so surfaces blend at rest — which the liquid-glass skill itself flags as a bug ("Container spacing larger than the interior stack spacing makes effects blend at rest"). The dogfood violated its own skill rule and the reviewer saw the seam in pixels. Recorded as confirmation the rule is right; fix is `spacing` ≤ inner spacing or an intentional merged capsule |

## What the dogfood proved

- The pipeline (brief → map → contract → implementation → captures →
  independent rubric review) runs end-to-end on this machine with the skills
  as written.
- The rubric rejects from rendered evidence, not vibes: every hard failure
  cites a capture.
- Three harness/skill defects surfaced across W3+W6 were fixed and committed;
  the remaining findings are app-level, which is where they belong.
