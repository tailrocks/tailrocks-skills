# Screen manifest — console

## Dashboard

- **Purpose**: workspace activity at a glance.
- **Route**: /design/dashboard; ships at /dashboard
- **States**: default | empty | loading — settled and final for
  implementation.
- **Viewports**: 1280x800, 375x812; responsive rules: cards stack under
  640px.
- **Components**: Card, Badge, Table from the installed library; activity
  toggle hand-built; sparkline custom (evaluated: Badge, Progress, and the
  chart primitives — none renders a 24-point inline trend at text height;
  record in dashboard-screen.tsx).
- **Copy**: src/design/fixtures/dashboard.ts
- **Blessed**: None
