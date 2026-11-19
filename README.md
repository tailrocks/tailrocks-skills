# tailrocks-vitalik-mode-skills

Vitalik mode prioritizes total delivery time for an explicitly selected goal.
A strong planning subagent diagnoses the cause and proposes a fast execution
plan.
The primary agent executes that plan, accepts temporary red CI, and owns
recovery.
Valid review findings remain tracked when their implementation can wait.

## Skills

| Skill | Task |
| --- | --- |
| [vitalik-mode](skills/vitalik-mode/SKILL.md) | Enable, inspect, or disable fast delivery for the current goal. |

This package contains one portable instruction skill and its required resources.
It adds no background process, runtime hook, or automatic merge tool.

## Install

Use the `tailrocks` collection or copy the complete skill directory.
Use the installation route documented for your agent.

| Agent | Installation and invocation |
| --- | --- |
| Claude Code | [Plugin or standalone skill](docs/installation.md#claude-code) |
| Codex | [Plugin or native skill directory](docs/installation.md#codex) |
| Grok Build | [Plugin or native skill directory](docs/installation.md#grok-build) |
| omp | [Agent Skills discovery](docs/installation.md#omp) |
| pi | [Agent Skills discovery](docs/installation.md#pi) |
| OpenCode | [Native skill directory](docs/installation.md#opencode) |
| Muse Code | [Plugin or native skill directory](docs/installation.md#muse-code) |
| Kimi Code | [Plugin or native skill directory](docs/installation.md#kimi-code) |

After standalone installation on an agent with direct skill commands:

```text
/vitalik-mode on "<available planning model>" --effort highest
```

Native prefixes differ between agents.
For example, Codex uses `$vitalik-mode`, while pi uses `/skill:vitalik-mode`.
The [installation guide](docs/installation.md) gives the supported forms.

## Use

Enable the mode during a blocked goal:

```text
/vitalik-mode on
```

Select a planning model and effort without changing the primary model:

```text
/vitalik-mode on "<available planning model>" --effort highest
```

Inspect or disable it:

```text
/vitalik-mode status
/vitalik-mode off
```

The planner compares ordinary processing with a faster path using actual
evidence.
The plan can use administrator merges, batch integration, selective CI
cancellation, and a red main branch during repair.
The primary agent records the tradeoff and executes the accepted plan.
It requests another plan when material evidence changes.

Valid, aligned review findings become issues or linked sub-issues when deferred.
The report distinguishes those findings from fixed defects and reasoned
dismissals.
An unavailable issue tracker leaves an explicit tracking gap in the goal record.

The mode continues for the same goal across turns and handoffs.
It ends when the user disables it or the goal reaches completion.
Persistence depends on the host retaining or reloading the goal record.
See [usage](docs/usage.md) and [compatibility](docs/compatibility.md) for these
limits.

## Documentation

- [Documentation index](docs/README.md)
- [Installation](docs/installation.md)
- [Usage](docs/usage.md)
- [Compatibility and sources](docs/compatibility.md)
- [Maintenance](docs/maintenance.md)
- [Troubleshooting](docs/troubleshooting.md)

## Update and remove

Refresh the collection and update the installed package through your agent's
plugin manager.
For a copied skill, replace the complete installed skill directory with the
selected version.
Disable the mode before removing the package from an active goal.
Retain unfinished repair records and deferred issues.
Package removal does not reverse delivered changes.

## Contribute

Keep the skill procedure in its authoritative file.
Keep required resources inside the skill directory.
Use the [maintenance checks](docs/maintenance.md) before proposing a change.
Report observed host support separately from documentation-based support.

## License

Apache License, Version 2.0.
See [LICENSE](LICENSE).
