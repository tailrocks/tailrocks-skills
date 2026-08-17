# Settings page

- **Status**: SHAPING
- **Slug**: settings-page

## Intent

Signed-in users manage their profile and notification preferences in one
place. Ships when `/settings` renders profile, notifications, and the
danger zone with delete-account behind a confirmation.

## Decisions

- 2026-08-10 — **Email is read-only** because it is owned by the sign-in
  provider.

## Screens

### Settings

- **Purpose**: profile, notification toggles, danger zone on one page.
- **States**: default; unsaved-changes handling still open.
- **Key interactions**: save profile, toggle notifications, delete account
  with type-to-confirm.

## Must not

- MUST NOT delete without an explicit confirmation step — irreversible.
