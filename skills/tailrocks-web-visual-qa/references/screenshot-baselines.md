# Screenshot baselines

The frozen half of the contract: Playwright screenshots of the design
routes, committed and compared with `toHaveScreenshot`. A baseline exists
per screen × state × viewport × theme — and only for screens whose design
manifest carries a recorded blessing; freezing a draft is the timing
violation the router forbids.

## The suite

`tests/visual/<screen>.spec.ts` walks the fixture registry: navigate to
`/design/<screen>/<state>`, set the theme, settle, assert.

```ts
for (const state of registry.settings.states) {
  for (const theme of ["light", "dark"] as const) {
    test(`settings ${state} ${theme}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/design/settings/${state}`);
      if (theme === "dark") {
        await page.evaluate(() => document.documentElement.classList.add("dark"));
      }
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`settings--${state}--${theme}.png`, {
        maxDiffPixels: 100,
      });
    });
  }
}
```

Baselines land beside the spec in Playwright's snapshot directory and are
committed. The suite runs through the owned-server supervisor as its own task,
separate from the unit gate, because it needs a browser. Raw Playwright
invocation lacks revision/guard proof and is not a valid capture.

## Determinism

Every rule below removes a source of false diffs; skipping one produces a
suite that fails randomly and gets muted.

- **Pinned viewports** (1280×800 desktop, 375×812 mobile) and
  `deviceScaleFactor: 1` in the Playwright projects.
- **Reduced motion always** — animations and transitions are design
  decisions reviewed live, never baseline content.
- **Fonts**: wait for `document.fonts.ready`; the app's font stack must be
  self-hosted or system — a CDN font makes every capture a network race.
- **Theme via the class convention** (`.dark` on the root element),
  matching how the app switches, not via a color-scheme emulation the app
  ignores.
- **One rendering environment.** Baselines are captured and compared on
  the pinned Playwright browser; a matching container or the same OS
  family in CI, and the environment recorded in the manifest. Cross-OS
  font rasterization differs enough to burn any budget.
- Dynamic regions that resist pinning (live timestamps that must exist,
  third-party embeds) are masked with `mask:` — and every mask is a design
  decision recorded in the manifest, because a masked region is an
  unverified region.

## Budgets

`maxDiffPixels: 100` per capture is the default — antialiasing headroom,
nothing more; any layout shift blows through it. A screen that needs a
larger budget gets it declared in the manifest with the reason, never
silently in the spec.

## The baseline record — `tests/visual/BASELINES.md`

Every freeze writes its record; a baseline set without one cannot be
reproduced or trusted:

```markdown
## <Screen name>

- **Frozen from**: src/design/MANIFEST.md §<Screen> — blessed <date>
- **Environment**: <Playwright + browser versions, OS family>
- **Cells**: <screen × state × viewport × theme captured; any registry
  cell excused, with its reason>
- **Masks**: <region — reason; None when clean>
- **Budgets**: <any above the default, with reason; default otherwise>
```

## Direction of authority

Baselines hold the code. `--update-snapshots` is legitimate exactly once:
after the user re-blesses a deliberate design change — the baseline diff
is reviewed as a design decision, in its own commit, before any dependent
implementation change, and the record's `Frozen from` line moves to the
new blessing.

Updating baselines because the suite went red after a code change is the
inversion that turns the contract into `x == x`. Red has two exits: fix
the code, or take the change back to the user.

## When the implementation lands

The real page renders the same screen component, so the design baselines
keep guarding it: any restyle of a shared component or token shows up as a
diff on the design route. Where a real page must be captured directly
(layout that only exists with the app shell), its spec drives the real
route with fixture-backed loaders under the same determinism rules — the
design baselines stay the reference, and the page capture is an addition,
never a replacement.
