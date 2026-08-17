# Screen manifest — console

## Dashboard

- **Purpose**: workspace activity at a glance.
- **Route**: /design/dashboard; ships at /dashboard
- **States**: default | empty | loading — settled and final for
  implementation.
- **Viewports**: 1280x800, 375x812; responsive rules: cards stack under
  640px.
- **Components**: Card, Badge, Table from the installed library; activity
  toggle hand-built (see dashboard-screen.tsx).
- **Copy**: src/design/fixtures/dashboard.ts
- **Masks & budgets**: the "last synced" timestamp region is masked — it
  renders the real wall clock by product decision (live freshness
  indicator), so it cannot be pinned by fixtures.
- **Environment**: pinned Playwright Chromium, macOS.
- **Baselines**: dashboard--default--light.png, dashboard--default--dark.png
- **Blessed**: None
