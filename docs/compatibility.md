# Compatibility

These notes apply to package version `0.1.0`.
They describe the official documentation examined on 2026-11-19.
A documented host feature does not establish a successful package installation
or live model run.
The package has no runtime compatibility results for the hosts below.

## Package boundaries

The package supplies the [portable skill](../skills/vitalik-mode/SKILL.md) , its
resources, and plugin manifests.
The host supplies skill discovery, tool permissions, model selection, and
session persistence.
The skill carries mode state in the active goal or plan record.
See [mode state](../skills/vitalik-mode/references/mode-state.md) for
continuation and handoff behavior.

Codex reads the explicit-only policy in `agents/openai.yaml`.
Other hosts can discover or load the skill according to their settings.
The skill requires explicit user intent before it can enable the mode.
Discovery, automatic loading, and quoted commands do not supply that intent.
The skill's prose does not enforce the host's tool permissions.
[Codex invocation policy](https://learn.chatgpt.com/docs/build-skills) ·
[Agent Skills specification](https://agentskills.io/specification)

## Planner capabilities

| Host | Documented planner route | Relevant limit |
| --- | --- | --- |
| Claude Code | Use the Agent tool with a model alias. Use a custom definition for a full model ID. | Per-call effort for a non-fork subagent requires 2.1.292 or later. The environment can override effort. [Subagents](https://code.claude.com/docs/en/sub-agents) |
| Codex | Set the model and effort in the subagent launch when the tool exposes them. | Custom agent fields take precedence. The current provider and host determine available routes. [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) |
| Grok Build | Use the exposed subagent model field or an existing profile. Some workflow launches support independent child effort. | The inheritance setting can hide per-call model selection. Skill frontmatter does not set the route. [Subagents](https://github.com/xai-org/grok-build/blob/main/crates/codegen/xai-grok-pager/docs/user-guide/16-subagents.md) · [Skills](https://docs.x.ai/build/features/skills-plugins-marketplaces) |
| omp | Use a configured task agent or an authorized per-call model and effort selector. | `task.perCallModel` controls the launch surface. Operator grants and `task.maxEffort` still apply. [Task agents](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md) |
| pi | Use an available subagent extension or an authorized independent `pi` process. | The package contains no extension. A child process requires a usable model route and read-only tools. [Extensions](https://docs.pi.dev/latest/extensions) · [CLI](https://docs.pi.dev/latest/cli) |
| OpenCode | Use a configured subagent profile with the requested model and reasoning variant. | V2 selects the profile by ID. V1 and V2 use different configuration fields. [Agents](https://opencode.ai/docs/agents) · [Tools](https://opencode.ai/docs/tools) |
| Muse Code | Use a custom agent or supported workflow child with a model and effort. | An unavailable custom-agent model can fall back to the lead model. Inspect the recorded route. [Custom agents](https://dev.meta.ai/docs/muse-code/agents) |
| Kimi Code | Use a configured subagent model pool alias or variant. | A pool-wide effort can override the variant. The model must support the requested setting. [Configuration](https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/config-files#secondary_model) |
| Other Agent Skills hosts | Use native delegation or an authorized external planner if available. | The standard defines the skill layout. The host determines the invocation and planner capabilities. [Specification](https://agentskills.io/specification) |

Use the [installation guide](installation.md) for explicit invocation on each
host.
Use the [host adapters](../skills/vitalik-mode/references/host-adapters.md) to
select and verify a route.

## Verify a host and model

Use a disposable session with a read-only diagnosis task.
Record the host build, package revision, and available planner settings.
Inspect `status` before activation.
Enable the mode with a model and effort the host exposes.
Inspect the child's runtime metadata for the effective model and effort.
Make sure that the primary model stays the same.
Make sure that the child returns a report and does not perform execution work.
Continue the same goal and inspect `status` again.
Turn the mode off and confirm that a new goal starts inactive.

Separate installation checks from model evaluations.
Record an unobservable model or effort as unverified.
Record the actual route if the host substitutes a model or caps the effort.
Keep any environment-dependent variations with the recorded check result.
