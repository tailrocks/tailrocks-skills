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

