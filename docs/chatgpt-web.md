# ChatGPT web marketplace

## Import

Import this repository through **ChatGPT Admin Console → Plugins → Add → Import marketplace**:

- Source: `https://github.com/tailrocks/tailrocks-skills`
- Path: leave empty
- Branch: `main`

The GitHub account used for the import must be able to read this repository and every source listed in the catalogs. That includes the private `tailrocks/tailrocks-asd-ste100-skills` repository and any required GitHub organization approvals. A ChatGPT workspace admin must perform the import. A personal plan without an eligible workspace does not gain workspace import access from these repository changes.

After import, review each plugin result. Set its workspace installation policy to **Available** or **Installed** for the intended users and enable required apps separately. Repository policy metadata is not applied automatically. Keep daily sync enabled; select **Sync now** after a GitHub change when you need immediate confirmation. Do not delete the marketplace to reconnect GitHub.

## Update and release policy

The imported marketplace repository follows `main`, while each plugin source remains pinned to an immutable upstream release. The Codex catalog uses the full release commit SHA; the Claude catalog uses the release tag and its full SHA; the Kimi catalog uses the same immutable commit URL. Marketplace daily sync alone does not advance plugin source pins.

The scheduled **Update marketplace release pins** workflow checks the latest stable release of every source and opens a pull request when any tag or commit pin changes. It requires the `TAILROCKS_MARKETPLACE_SYNC_TOKEN` repository secret with read access to all nine source repositories, including the private ASD-STE100 repository, and write/pull-request access to this central repository. The workflow does not print or store token contents. Review and merge its PR, including the repository's normal DCO sign-off, to publish updated pins through the root marketplace's GitHub sync. An open pin-update PR suppresses duplicate scheduled PRs.

Run `python3 scripts/update-catalog-pins.py`, `python3 scripts/generate-catalogs.py`, and `python3 scripts/validate-marketplace.py` when updating pins manually. The Velnor CI task checks catalog IDs, privacy flags, immutable ref shapes, release pins, and that all generated catalogs match their source. Each source package CI validates strict JSON, frontmatter/IDs, and local bundled links where those files are maintained. Central CI checks that referenced revisions and tags resolve when run with `--verify-github`; it does not claim that credential-free GitHub Actions can read the private package.

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
