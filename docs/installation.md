# Install a Tailrocks package

Choose a package from the [catalog](../catalog.json).
Use its `id` field when you select a plugin.
For example, the ASD-STE100 plugin ID is `tailrocks-asd-ste100-skill`.
Its source repository is `tailrocks-asd-ste100-skills`.

From a checkout of this repository, print the commands for your host.

```sh
python3 scripts/install-command.py tailrocks-repository-skills --agent claude
```

Replace `claude` with the agent value in the table. Review the output.
Run shell commands in your terminal. Enter Kimi commands in a Kimi session.
The helper only reads the catalog and prints commands.

| Host | Agent value | Native installation |
| --- | --- | --- |
| Claude Code | `claude` | Register the Git marketplace, then install the qualified plugin in user scope. |
| Codex | `codex` | Register the Git marketplace, then add the qualified plugin. |
| Grok Build | `grok` | Install the reviewed plugin from the Git marketplace. |
| Muse Code | `muse` | Add the Git marketplace as `tailrocks`, then install from its snapshot. |
| omp | `omp` | Register the Git marketplace, then install the qualified plugin in user scope. |
| OpenCode V2 | `opencode` | Install the Git package at the catalog revision with `opencode plugin add`. |
| Amp | `amp` | Clone the revision into the native user plugin directory. |
| Antigravity | `antigravity` | Install a persistent local checkout of the catalog revision with `agy plugin install`. |
| pi | `pi` | Install the Git package at the catalog revision with `pi install`. |
| Kimi Code | `kimi` | Open the native marketplace and install the plugin from its commit URL. |

## Marketplace installation

Register Tailrocks once for each host and scope. Use the package command for
each additional plugin. The registered marketplace selects the catalog pin.

For example, install the repository package in Claude Code.

```sh
claude plugin marketplace add tailrocks/tailrocks-skills
claude plugin install tailrocks-repository-skills@tailrocks --scope user
```

Use `/tailrocks-repository-skills:tailrocks-pr-status` in a Claude session.
Inspect the installed plugins with `claude plugin list`.

Review the selected Grok plugin before installation. The printed command uses
`--trust` to grant trust immediately and skip confirmation.
The tested managed install enabled the plugin. In Muse, inspect skipped entries
if a private package is missing from the marketplace snapshot.

For the private agent-policy package, omp 19.0.0 needs a second discovery
step. Run the helper with `tailrocks-agent-policy-skills --agent omp`. It
prints the commands that identify the installed directory and the existing
setting to update. Preserve unrelated directories and refresh this entry
after a package upgrade.

## Direct package installation

OpenCode, Amp, Antigravity, and pi install each package directly.
They use the same Git commit recorded in the Tailrocks catalog.
For example, print the exact OpenCode Git specifier for the repository package.

```sh
python3 scripts/install-command.py tailrocks-repository-skills --agent opencode
```

Amp loads the checked-out directory from its plugin root. Antigravity installs
the local package into its managed plugin directory. Use `agy plugin list --json`
to inspect its enabled state, version, and installed skills. Keep the checkout
for updates. Install the entire package so its relative resource paths resolve.

## Access, updates, and removal

Private packages require Git read access with the account used by the host.
For a hosted installation, grant the workspace connector read access to the
selected source. Keep private package content in its owning repository.

For updates, refresh the registered marketplace or select the new direct Git
pin. Use each package's installation guide for the exact update and removal
commands. The [compatibility guide](compatibility.md) describes discovery and
invocation. For ChatGPT workspace import, use the [web guide](chatgpt-web.md).
