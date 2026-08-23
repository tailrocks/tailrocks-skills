# Screenshot baseline contract

The durable reference is one committed Playwright PNG per blessed design-route
screen × state × viewport × theme. A draft is never baseline material.

<!-- tailrocks-web-visual-shared:start -->

# Web visual matrix and determinism

`tests/visual/<screen>.spec.ts` walks the typed design registry and renders
`/design/<screen>/<state>` through the guarded fixture. Required viewports are
1280×800 desktop and 375×812 mobile at device scale 1; required themes are
light and dark. Every registry cell is captured or explicitly excused.

Use the pinned project-local Playwright browser and one recorded OS family.
Block service workers, reduce motion, wait for `document.fonts.ready`, use the
application's real root theme class, and allow no network-dependent fonts.
Dynamic masks require a region and reason in the baseline record. The default
budget is `maxDiffPixels: 100`; any larger per-capture budget requires a reason.

`tests/visual/BASELINES.md` binds the design manifest and human blessing, Git
revision and source digest, Playwright/browser/OS environment, complete matrix,
masks, budgets, and excused cells. A missing or mismatched record invalidates
both baseline publication and regression comparison.

Only the revision-bound owned-server supervisor is valid. It refuses occupied or
wrong servers, verifies its private guard before and after every test, rejects
source drift, and reports every skipped check. A green pixel comparison proves
conformance to the frozen pixels, never design quality or approval.

<!-- tailrocks-web-visual-shared:end -->

## Publication authority

Baseline creation requires the recorded blessing. Re-baseline requires an
explicit request, a newer recorded re-blessing, review of the baseline diff, and
an updated record. Stage the complete set privately and publish only after every
cell and final identity proof passes. Never update snapshots because a code
change made regression red.
