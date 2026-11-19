# Host adapters

Use this reference when the invocation syntax or planner route depends on the
host.
Apply the command and state rules in [SKILL.md](../SKILL.md).

## Invocation

| Host | Explicit command or selection |
| --- | --- |
| Claude Code | `/vitalik-mode` for a standalone skill. `/tailrocks-vitalik-mode-skills:vitalik-mode` for the plugin. |
| Codex | `$vitalik-mode` in the CLI. Select the installed skill in the composer on supported app surfaces. |
| Grok Build | `/vitalik-mode` or the qualified command shown in the picker. |
| omp | `/skill:vitalik-mode`. |
| pi | `/skill:vitalik-mode`. |
| OpenCode | Explicitly request the `vitalik-mode` skill. Use `/vitalik-mode` if the user configured a command. |
| Muse Code | `/vitalik-mode` or the shortcut shown in the picker. |
| Kimi Code | `/skill:vitalik-mode`. |
| Other Agent Skills host | Select the installed `vitalik-mode` skill and pass the command as user text. |

Interpret the user text after the command or skill selection as its arguments.
Accept `on` , `on <model name>` , `on --effort <level>` ,
`on <model name> --effort <level>` , `off` , and `status` .
Reject malformed or unknown options without changing state.
Treat an empty argument string as `status`.
The same action applies with each supported prefix.
Honor exact model names that contain spaces.
Use the current user invocation as evidence of intent.
The appearance of a skill in model context provides no activation authority.

## Planner routing

Use the current host's model catalog, configured agent profiles, and exposed
tool arguments.
Resolve `highest` for the selected model and host.
If the user omits a model or effort, apply the defaults in the skill.
Do not change the primary model or write global model settings to route a
planner.
Choose the most restrictive available tool permissions compatible with
diagnosis.
Give the child a complete brief and make its report the end of its task.
Keep the route and actual effort separate from the request in the
[goal record](mode-state.md) .
If the host cannot disclose an effective value, record it as unverified.
If the configured route differs from an explicit selection, disclose the
difference and apply the skill's fallback rules.

### Claude Code

Use the `Agent` tool with the model alias and effort if the tool exposes those
fields.
Use an existing custom agent definition for a full model ID.
The per-call `model` field takes aliases only.
Per-call effort requires Claude Code 2.1.292 or later and a non-fork subagent.
The `CLAUDE_CODE_EFFORT_LEVEL` environment variable takes precedence.
Inspect `/tasks` or the returned metadata to verify model and effort.
[Claude Code skills](https://code.claude.com/docs/en/skills) ·
[Claude Code subagents](https://code.claude.com/docs/en/sub-agents)

### Codex

Pass `model` and `reasoning_effort` in `spawn_agent` if the current host exposes
them.
Use a fresh child when the exposed interface requires it for model overrides.
An existing custom agent can supply both settings.
Custom agent settings take precedence over per-spawn values.
Use a route that the current provider and host allow.
[Codex skills](https://learn.chatgpt.com/docs/build-skills) ·
[Codex subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)

### Grok Build

Use `spawn_subagent` with its explicit `model` field when the host exposes it.
Some configurations remove model selection from the tool.
Use an existing agent profile or configured workflow child when it provides the
selected model and effort.
Use a per-call effort field only if the current tool exposes it.
Do not use `SKILL.md` model or effort fields to select the child route.
Inspect the actual child route and wait for its report.
[Grok Build skills](https://docs.x.ai/build/features/skills-plugins-marketplaces)
·
[Grok Build subagents](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/16-subagents.md)
·
[Grok Build workflow effort](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-shell/changelogs/1.0.9.md)

### omp

Use an existing task agent with matching `model` and `thinking-level` settings
when possible.
Use the task tool's exact `provider/model-id[:level]` selector when the operator
enabled `task.perCallModel=on` for that tool.
Some aggregators also accept `@upstream` before the effort suffix.
The operator must already allow the selected route.
`task.maxEffort` and the model's capability can cap the effective effort.
A coarse `effort` hint depends on `task.enableEffort` and can also be capped.
[omp skill discovery](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md)
·
[omp task agent discovery](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md)

### pi

Use an available subagent extension only if it can keep the primary model and
route a separate child.
When an authorized terminal route exists, a separate `pi` print process with
`--model` can serve as the child.
The model selector accepts `provider/id` and an optional `:<thinking>` suffix.
Use `--no-session` and restrict tools to evidence collection, such as
`--tools read,grep,find,ls` .
Use a read-only tool surface and remove access to executable tools from the
child configuration.
Treat availability of the binary, credentials, and model as runtime facts.
[pi skills](https://docs.pi.dev/latest/skills) ·
[pi extensions](https://docs.pi.dev/latest/extensions) ·
[pi CLI](https://docs.pi.dev/latest/cli)

### OpenCode

Use a configured analysis subagent when its model and reasoning variant match
the selection.
In OpenCode V2, the agent definition accepts `provider/model#variant`.
The V2 `subagent` tool selects a configured agent by ID.
Wait for the completed child report from its background session.
Use the installed version's format for an OpenCode V1 agent profile.
Keep the mode command in the primary session so it can manage goal state there.
[OpenCode commands](https://opencode.ai/docs/commands) ·
[OpenCode agents](https://opencode.ai/docs/agents) ·
[OpenCode tools](https://opencode.ai/docs/tools)

### Muse Code

Use a configured custom agent with `model` and `effort`.
If the current build exposes workflow children, use their explicit child model
and effort when supported.
An unavailable custom-agent model can fall back to the lead model.
Inspect `/models` and use actual child metadata or `muse export` to verify the
route.
[Muse Code skills and workflows](https://dev.meta.ai/docs/muse-code/extending) ·
[Muse Code custom agents](https://dev.meta.ai/docs/muse-code/agents)

### Kimi Code

Select an existing alias from the configured `[secondary_model.models]` pool.
Use an alias whose model variant or effective default effort matches the
selection.
`[secondary_model].default_effort` takes precedence over the model variant's
effort.
The `/secondary-model` command writes a persistent default, so keep it outside
mode activation.
[Kimi Code skills](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills)
·
[Kimi Code secondary models](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files#secondary_model)

### Other Agent Skills hosts

Use a separate read-only planner if a native tool or an authorized external
route supports the requested settings.
If no suitable route exists, apply the fallback in [SKILL.md](../SKILL.md).
[Agent Skills specification](https://agentskills.io/specification)
