# Agent Policy migration

Vitalik Mode belongs to
[tailrocks-agent-policy-skills](https://github.com/tailrocks/tailrocks-agent-policy-skills).
The package is private and requires repository access.
Its nine policies require an explicit user invocation.
The skill ID remains `vitalik-mode`.
The former standalone package is no longer in this marketplace.

## Update an installation

1. Update this marketplace with the host's native plugin manager.
2. Install or update `tailrocks-agent-policy-skills` from this marketplace.
   The [command helper](installation.md) prints the route and exact source pin.
   Confirm that version `0.5.0` or later supplies `vitalik-mode` before removing
   a working installation.
3. Remove or disable the installed `tailrocks-vitalik-mode-skills` package.
   A cached copy does not disappear when a catalog entry is removed.
4. Restart or reload the host when its plugin manager requires it. Confirm that
   only the Agent Policy copy provides `vitalik-mode`.
5. Invoke the desired policy in your own message. Old plans, cached state, and
   installation alone cannot activate it.

For example, print the Codex installation commands from this checkout:

```sh
python3 scripts/install-command.py tailrocks-agent-policy-skills --agent codex
```

Then use the installed selector in Codex:

```text
$tailrocks-agent-policy-skills:vitalik-mode on "gpt-6.2-astra" --effort ultra
$tailrocks-agent-policy-skills:vitalik-mode status
$tailrocks-agent-policy-skills:vitalik-mode off
```

Claude Code uses `/tailrocks-agent-policy-skills:vitalik-mode` with the same
arguments. Other hosts use their documented skill selector. A bare or `status`
command reports state. Only a direct user `on` command enables the mode.
Without explicit planner settings, the skill chooses a capable planner with
cost-efficient effort. A selected model or effort must resolve through the host.
The primary execution model does not change.

## Invocation and continuation

The user must select each policy. A model cannot activate a policy because a
task looks relevant, another policy links to it, or a tool suggests it.
A verified user invocation can continue within its original scope without a
new command at every step. Vitalik Mode turns off when the goal completes.
An explicit `off` also ends it. Later planning results cannot reactivate it.

Native manual-selection controls supplement these rules. Some hosts hide a
policy from model discovery but still allow its known ID to be loaded. Reading
a file does not authorize the workflow. See [host compatibility](compatibility.md)
and the package's installation guide for the controls and their limits.

omp 19.0.0 needs the additional `skills.customDirectories` step printed by the
helper. Keep only the current installed package path in that setting, preserve
unrelated settings, and verify that all enabled policy skills have `hide: true`.

## Source retirement

The former [standalone repository](https://github.com/tailrocks/tailrocks-vitalik-mode-skills)
retains its Git history, license, and migration notice. Its active package
manifests, native entry points, and skill payload are removed after the canonical
package and marketplace change are published. Historical commits remain available
for provenance; they are not a supported parallel installation.
