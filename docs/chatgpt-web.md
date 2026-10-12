# ChatGPT web marketplace

## Import

Import this repository through **ChatGPT Admin Console → Plugins → Add → Import marketplace**:

- Source: `https://github.com/tailrocks/tailrocks-skills`
- Path: leave empty
- Branch: `main`

The GitHub account used for the import must be able to read this repository and every source listed in the catalogs. That includes the private `tailrocks/tailrocks-asd-ste100-skills` repository and any required GitHub organization approvals. A ChatGPT workspace admin must perform the import. A personal plan without an eligible workspace does not gain workspace import access from these repository changes.

After import, review each plugin result. Set its workspace installation policy to **Available** or **Installed** for the intended users and enable required apps separately. Repository policy metadata is not applied automatically. Keep daily sync enabled; select **Sync now** after a GitHub change when you need immediate confirmation. Do not delete the marketplace to reconnect GitHub.

## Update and release policy

The Codex and Claude-compatible marketplaces use the `main` branch for their nine GitHub plugin sources. ChatGPT daily marketplace sync follows these branch refs and can ingest source commits without requiring an immutable SHA to change in the catalogs. The `rev` and `tag` values in `catalog.json` remain immutable release records used by the Kimi catalog. Updating a pinned SHA alone would not advance ChatGPT's imported content.

Run `python3 scripts/generate-catalogs.py` after catalog edits, then run `python3 scripts/validate-marketplace.py`. The Velnor CI task `validate-marketplace` checks catalog IDs, privacy flags, source refs, Kimi release pins, and that all generated catalogs match their source. Each source package CI must run strict JSON, frontmatter/ID, and local-link checks so manifests, skills, and bundled paths are validated where they are maintained. The source ref validation checks branch-ref format and catalog consistency; this credential-free central CI does not claim that it can read the private package remotely.

## ChatGPT web compatibility

All nine packages have a portable root `plugin.json`, a `skills/` tree, and skill frontmatter. The audited packages have no `mcp.json` or `.mcp.json` and no lifecycle hooks, so the audited manifests do not declare a Desktop-only dependency. The skill files can be imported as instructions; workflows that require a local checkout, shell, Git, `gh`, Bun, Playwright, or Xcode still need a connected tool or an environment that ordinary ChatGPT web may not provide.

| Plugin | Skills | Web capability gap |
| --- | ---: | --- |
| `tailrocks-skill-authoring-skills` | 4 | Local repository and shell workflows need a connected repository/files tool. |
| `tailrocks-repository-skills` | 7 | Local Git and `gh` operations need connected repository tools; GitHub actions depend on available app access. |
| `tailrocks-typescript-skills` | 12 | Local package management, builds, tests, Playwright, and screenshot baselines need an execution environment. |
| `tailrocks-macos-skills` | 15 | Xcode, macOS application control, and native visual QA are unavailable in ordinary web chats. |
| `tailrocks-roadmap-skills` | 12 | Repository execution and durable project-file access need connected tools. |
| `tailrocks-contribution-skills` | 5 | GitHub operations may be covered by a connected app; local clones and test runs need an execution environment. |
| `tailrocks-code-quality-skills` | 14 | Repository-wide shell, build, and static-analysis procedures need an execution environment. |
| `tailrocks-rust-skills` | 15 | Cargo, Git, local test/build, and native toolchain procedures need an execution environment. |
| `asd-ste100-skill` | 1 | Both writing profiles are packaged; testing bundled private references requires a successful private-repository import. |

The skill counts and structural findings come from the repository audit. They do not prove that an imported plugin is visible, enabled, invokable, or free of a **Desktop only** label in a specific workspace. Verify those in a normal ChatGPT web chat after import. Do not copy or publish the private ASD-STE100 reference material as part of that check.
