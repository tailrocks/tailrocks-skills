# Model and reasoning choices

Read this when the task specifies a model or effort, or when you choose a
model for an authorized role. Provider documentation checked 2026-11-20.

## Contents

- [Choose the route](#choose-the-route)
- [Claude Fable and Opus](#claude-fable-and-opus)
- [GPT Astra and Sol](#gpt-astra-and-sol)
- [Gemini Argon, Carbon, and Neon](#gemini-argon-carbon-and-neon)
- [Muse Wonder and Wonder Full](#muse-wonder-and-wonder-full)
- [Brief and verify a delegated task](#brief-and-verify-a-delegated-task)

## Choose the route

Use the current session for ordinary work. Keep its existing model and effort
unless the user requests a change. Apply each selector to its intended role.
Keep the primary session on its model when the request names a child.

Inspect the host's live catalog, account access, and controls for that role.
Preserve the requested version, variant, and effort. Verify any alias first.
Use the skill's documented invocation and the host's actual model controls.
Pass only documented options to domain commands and scripts.

When authorized to select a new route, choose a capable, economical model.
Consider task difficulty, latency, expected token use, and likely rework.
Use explicit `medium` or a documented balanced equivalent for ordinary work.
This is the package policy for new routes; provider defaults can differ.
The same effort label does not mean the same amount of work across models.
Use lower effort for well-specified work when its acceptance check suffices.
Preserve any explicit effort. Resolve `highest`, when requested, against the
levels available for that model and role. Select paid speed tiers separately.

Report an unavailable selector, an enforced cap, or a known substitution.
Use a substitute only when the user's instructions permit that fallback.
Keep unrelated authorized work moving under the skill's existing rules.
Use session controls within scope and leave persistent host settings alone.

## Claude Fable and Opus

- **Fable 5.2** (`claude-fable-5-2`) suits demanding, long-running work.
  The Claude API defaults to `high`. Use `medium` for interactive coding.
- **Opus 5.5** (`claude-opus-5-5`) suits general coding and knowledge work.
  The Claude API defaults to `medium`.

Both use always-on adaptive thinking; `thinking.type: disabled` is invalid.
Claude API `output_config.effort` accepts `low`,
`medium`, `high`, `xhigh`, and `max`. Specify what finishes a long run.
Collect outstanding results before treating a progress update as completion.
Give Fable clear delegation boundaries when the host offers subagents.
Claude Code's Agent call accepts a model alias. A custom agent definition
can name the exact version. Environment settings can override child effort.

Keep API history append-only, including prior thinking blocks. Changes to earlier
system instructions, tools, or messages can fail Fable's prefix check. Use
supported context editing or compaction. Put new guidance in the newest turn.
Supported per-message `output_config.effort` changes preserve the prompt cache.

[Models][claude-models] · [Effort][claude-effort] · [Fable prompting][fable] ·
[Opus prompting][opus] · [Claude Code subagents][claude-agents]

## GPT Astra and Sol

- **GPT-6.2 Astra** (`gpt-6.2-astra`) suits complex judgment across systems.
  Give the failing workflow or decision, constraints, and acceptance checks.
- **GPT-6.2 Sol** (`gpt-6.2-sol`) suits everyday coding and PR review.
  OpenAI recommends Sol at `medium` for most API workflows.

Both support `low`, `medium`, `high`, `xhigh`, and `max` on the OpenAI API.
Use `reasoning.effort` in Responses or `reasoning_effort` in Chat Completions.
The API does not support `none` or `minimal`; host `Ultra` is not API effort.
Omit `temperature`, `top_p`, and `top_logprobs`. In Chat Completions, also omit
`logprobs`; in Responses, remove `message.output_text.logprobs` from `include`.
Tool calls use Responses. Its multi-agent beta children share the request's
model and available tools. Put reusable instructions in the first `developer`
message. When replaying history, retain prior output items unchanged and in
order, including reasoning items. Keep reusable instructions stable across turns.
Append new evidence and instructions to preserve earlier reasoning and cache.
Codex and ChatGPT Work can expose `Ultra` for parallel subagent work.
OpenAI API `Ultrafast` selects a service tier with separate pricing.

[API models][openai-models] · [Model selection][openai-selection] ·
[GPT-6.2 guide][openai-guide] · [Responses multi-agent][openai-agents] ·
[Work and Codex modes][openai-modes]

## Gemini Argon, Carbon, and Neon

- **Gemini 4 Argon** (`gemini-4-argon`) suits efficient complex work.
  It supports `low`, `medium` (default), and `high`.
- **Gemini 4 Carbon** (`gemini-4-carbon`) suits sustained, difficult reasoning.
  It supports `low`, `medium` (default), and `high`.
- **Gemini 4 Neon** (`gemini-4-neon`) suits responsive coding and tool use.
  It supports `low`, `medium`, `high` (default), and `xhigh`.

Use `generation_config.thinking_level` in the Gemini Interactions API.
For GenerateContent, use `thinking_config.thinking_level` in SDK config.
Use the selected surface's spelling. Google Cloud GenerateContent documents
uppercase values. Lower thinking effort to save tokens and leave enough
output capacity for the answer. A short output cap can truncate verification.
Budget the unified 1,048,576 tokens across input, thinking, tool calls, and output.
Use supported continuation for longer output. Preserve each `thought_signature`
in its original GenerateContent part, including across parallel calls.
For Interactions, use `store: true` with `previous_interaction_id`, or replay
complete thought and tool steps with their signatures unchanged.
Remove `thinking_budget` and `minimal` thinking levels. Remove `temperature`,
`top_p`, and `top_k`; Gemini 4 ignores these sampling settings.

[Thinking levels][gemini-thinking] · [Argon][argon] · [Carbon][carbon] ·
[Neon and API controls][neon]

## Muse Wonder and Wonder Full

- **Muse Wonder** (`muse-wonder-1.0`) suits multi-file coding and long runs.
  Meta Model API defaults to `max`. Set `medium` explicitly for balanced work.
  Meta recommends `high` for agentic coding.
- **Muse Wonder Full** (`muse-wonder-full-1.0`) requires an eligible Muse Code
  subscription. Select that model ID in Muse Code. Base Wonder at `max`
  still runs the base model. Meta Model API offers only the base variant.

Base Wonder's API efforts are `minimal`, `low`, `medium`, `high`, `xhigh`,
and `max`. Meta's API rejects `none`; a host's wider list is not an API contract.
Muse Code custom agents inherit omitted model and effort settings.
Inspect `/models` and the custom agent's `effort` field before launch.
An unavailable profile model can fall back to the lead. Inspect the child model
in `muse export` when the requested identity matters.

[Variants and IDs][muse-ids] · [Availability][muse-wonder] ·
[API reasoning][muse-effort] · [Muse Code custom agents][muse-agents]

## Brief and verify a delegated task

Delegate independent work when the result justifies the cost or the skill
requires an independent role. Keep ordered steps and shared writes together.
Preserve the skill's role separation, approval gates, and verdict owner.
Keep deterministic checks in their owning script.

Give each child its target and revision, relevant evidence, allowed tools and
actions, expected output, and completion check. Verify access to the inputs.
For independent review, provide observations and withhold the proposed verdict.
Apply the same authority limits to descendants. Inspect the returned evidence.
Record requested and observed model or effort when the distinction matters.
Mark hidden settings `unverified`. Identify any check completed inline.

[claude-models]: https://platform.claude.com/docs/en/models/overview
[claude-effort]: https://platform.claude.com/docs/en/build-with-claude/effort
[fable]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2
[opus]: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
[claude-agents]: https://code.claude.com/docs/en/sub-agents
[openai-models]: https://developers.openai.com/api/docs/models
[openai-selection]: https://developers.openai.com/api/docs/guides/model-selection
[openai-guide]: https://developers.openai.com/api/docs/guides/latest-model
[openai-agents]: https://developers.openai.com/api/docs/guides/responses-multi-agent
[openai-modes]: https://learn.chatgpt.com/docs/models
[gemini-thinking]: https://aistudio.google.com/docs/thinking
[argon]: https://aistudio.google.com/docs/whats-new-gemini-4-argon
[carbon]: https://aistudio.google.com/docs/whats-new-gemini-4-carbon
[neon]: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-4-neon
[muse-ids]: https://dev.meta.ai/models/muse-wonder
[muse-wonder]: https://dev.meta.ai/docs/muse-wonder
[muse-effort]: https://dev.meta.ai/docs/reasoning
[muse-agents]: https://dev.meta.ai/docs/muse-code/agents
