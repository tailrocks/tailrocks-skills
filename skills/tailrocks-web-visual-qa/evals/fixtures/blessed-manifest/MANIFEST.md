# Screen manifest — console

## Settings

- **Purpose**: profile, notification toggles, danger zone on one page.
- **Route**: /design/settings; ships at /settings
- **States**: default | empty | loading | error — error preserves form
  values under a destructive alert; confirm-delete dialog is its own state.
- **Viewports**: 1280x800, 375x812; responsive rules: dialog footer stacks
  under 640px.
- **Components**: Card, Input, Label, Switch, Separator, Alert,
  AlertDialog from the installed library.
- **Copy**: src/design/fixtures/settings.ts
- **Blessed**: 2026-08-16 by the product owner — five states in both
  themes at both viewports approved as shown.
