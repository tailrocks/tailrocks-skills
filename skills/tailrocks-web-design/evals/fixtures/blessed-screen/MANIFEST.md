# Screen manifest — billing

## Invoice list

- **Purpose**: every invoice for the workspace, newest first.
- **Route**: /design/invoice-list; ships at /billing/invoices
- **Component**: src/components/screens/invoice-list-screen.tsx
- **States**: default | empty | loading | error — settled and final for
  implementation.
- **Viewports**: 1280x800, 375x812; responsive rules: the table collapses
  to stacked rows under 768px.
- **Components**: Table, Badge, Button from the installed library.
- **Copy**: src/design/fixtures/invoice-list.ts
- **Blessed**: 2026-08-19 by the product owner, all four states, both
  themes, both viewports. No open corrections.
