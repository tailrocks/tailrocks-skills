# ChatGPT desktop and web marketplace

## Import

Import this repository through **ChatGPT Admin Console → Plugins → Add → Import marketplace**:

- Source: `https://github.com/tailrocks/tailrocks-skills`
- Path: leave empty
- Branch: `main`

The GitHub account used for the import must be able to read this repository and every source listed in the catalogs. That includes the private `tailrocks/tailrocks-asd-ste100-skills` repository and any required GitHub organization approvals. A ChatGPT workspace admin must perform the import. A personal plan without an eligible workspace does not gain workspace import access from these repository changes.

After import, review each plugin result. Set its workspace installation policy to **Available** or **Installed** for the intended users and enable required apps separately. Repository policy metadata is not applied automatically. Keep daily sync enabled; select **Sync now** after a GitHub change when you need immediate confirmation. Do not delete the marketplace to reconnect GitHub.

Import is a workspace-admin action in Admin Console. After import and workspace
policy allow access, members can find and install eligible plugins from
ChatGPT's Plugins directory on web or desktop. Desktop users do not import a
separate copy of the marketplace. See [OpenAI's GitHub marketplace import
guide](https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github)
and [plugin guide](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt).

## Source update policy

Every catalog selects the immutable commit in `catalog.json`.
Claude-compatible clients read `source.sha`.
Codex and Muse read the full commit through `source.ref`.
Kimi reads the commit URL.
A release tag is optional and does not control installation.

Merge source changes before updating the central commit and version.
Run `python3 scripts/generate-catalogs.py` after catalog edits.
Run `python3 scripts/validate-marketplace.py` before publication.
The validator requires identical package identities and revisions across catalogs.
With GitHub authentication, `--verify-github` also examines remote commits,
manifest identities, versions, and repository privacy.

Sync the workspace marketplace after a catalog update.
Confirm the installed revision through the intended client.
For native installation evidence and source formats, see
[distribution](standards/distribution.md).

## ChatGPT desktop and web compatibility

All eleven packages have a portable root `plugin.json`, a `skills/` tree, and
skill frontmatter. The audited packages have no `mcp.json` or `.mcp.json` and
no lifecycle hooks, so their manifests do not declare MCP servers or a Desktop
only dependency. Installing these skill-only plugins does not add shell, Git,
`gh`, Bun, Playwright, or Xcode tools. Workflows that need those tools require
a connected app or a suitable execution environment in the ChatGPT surface
being used.

| Plugin | Skills | Tool requirement |
| --- | ---: | --- |
| `tailrocks-skill-authoring-skills` | 4 | Local repository and shell workflows need a connected repository/files tool. |
| `tailrocks-repository-skills` | 10 | Local Git and `gh` operations need connected repository tools; GitHub actions depend on available app access. |
| `tailrocks-vitalik-mode-skills` | 1 | Explicit activation reassesses the whole current plan. Practice selection depends on the goal. Planner routing and persistence depend on the host. |
| `tailrocks-typescript-skills` | 12 | Local package management, builds, tests, Playwright, and screenshot baselines need an execution environment. |
| `tailrocks-macos-skills` | 15 | Xcode, macOS application control, and native visual QA are unavailable in ordinary web chats. |
| `tailrocks-roadmap-skills` | 12 | Repository execution and durable project-file access need connected tools. |
| `tailrocks-contribution-skills` | 5 | GitHub operations may be covered by a connected app; local clones and test runs need an execution environment. |
| `tailrocks-code-quality-skills` | 14 | Repository-wide shell, build, and static-analysis procedures need an execution environment. |
| `tailrocks-rust-skills` | 16 | Cargo, Git, local test/build, and native toolchain procedures need an execution environment. |
| `tailrocks-asd-ste100-skill` | 1 | Both writing profiles are packaged; testing bundled private references requires a successful private-repository import. |
| `tailrocks-agent-policy-skills` | 8 | Private policy instructions require authorized repository access and the host capabilities needed by each policy. |

The skill counts and structural findings come from the repository audit. They
do not prove that an imported plugin is visible, enabled, invokable, or free of
a **Desktop only** label in a specific workspace. Verify the imported plugins
in ordinary ChatGPT web and desktop chats after import. Do not copy or publish
the private ASD-STE100 reference material as part of that check.
