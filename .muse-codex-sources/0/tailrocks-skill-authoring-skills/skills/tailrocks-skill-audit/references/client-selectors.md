# Client selectors (explicit invocation)

## Honored forms

- **Codex CLI:** `$<skill>` bare, `/skills` picker. Only
  documented explicit forms.
- **Claude Code:** `/<skill>`, `/<plugin>:<skill>`. Leading
  `/name` runs directly. After prose it only permits that turn.
- **Kimi:** `/skill:<name>`. Only form. `/<name>` is confirmed
  absent.
- **Muse:** `/` picker plus `/<skill>`. Bare slash verified.
  `/<plugin>:<skill>` is unverified.
- **Grok Build:** `/<skill>`, `/<plugin>:<skill>`. Plus `/local:`
  and `/user:` scope qualifiers.
- **Amp:** model-invoked from name plus description listing (no
  slash). Plugin-bundled skills address as `<plugin>:<skill>`.
- **OpenCode v2:** prose `Use the X skill…` through the `skill`
  tool. No slash for skills. Gate is `permission.skill: ask`.
- **Antigravity CLI:** `/<skill>` (CLI auto-converts), `/skills
  list`. Plugin skills use `/<plugin>:<skill>`. Contract is `name`
  plus `description` only.

## Wrong folklore — never author these

- **`$plugin:skill` in Codex is wrong.** Zero occurrences exist in
  official docs. Namespacing is internal-only. Same-name collisions
  resolve through the picker. Use bare `$<skill>` in
  `default_prompt` and all docs.
- **`$...` in Claude Code is not invocation.** `$ARGUMENTS`, `$0`,
  and `$N` are argument-substitution placeholders inside skill
  content only.
- **Muse `/<plugin>:<skill>` is unverified.** It is absent from
  official docs. Mark verify-before-rely anywhere it is written.
- **No default prompt concept exists** in Claude Code, Muse, Grok,
  or Kimi. Only Codex defines `interface.default_prompt`. It does
  not participate in implicit matching.
- **`argument-hint` drives no client triggering.** It is a display
  hint only.
- **Amp `plugin:skill` applies to plugin-bundled skills only.**
  Bare skills load by model decision from the name plus description
  listing, never through a qualifier.
