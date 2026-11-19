# Models and reasoning effort

The [shared model guide](../standards/models/model-routing.md) covers all nine
requested model variants.
Each installed skill contains the same guide under `references/model-routing.md`.

| Family | Covered variants |
| --- | --- |
| Claude | Fable 5.2, Opus 5.5 |
| GPT | GPT-6.2 Astra, GPT-6.2 Sol |
| Gemini | Gemini 4 Argon, Gemini 4 Carbon, Gemini 4 Neon |
| Muse | Muse Wonder, Muse Wonder Full |

Preserve explicit model and effort selections.
Apply each selection to its intended role.
Keep the primary session unchanged when the user selects a planning subagent.

When choosing a new route, use a capable model with economical effort.
Use explicit `medium` or the host's documented balanced equivalent for ordinary
work.
This is Tailrocks policy for new routes. Provider defaults differ, and the same
effort label can allocate different amounts of work across models.
Account for latency, token use, likely rework, and the required result.
Higher effort remains available through the host's actual controls.

Provider APIs and coding hosts expose different controls.
Resolve aliases, supported levels, and account access before delegation.
Keep speed tiers separate from reasoning effort.
Report unavailable selections or substitutions without inventing compatibility.

Vitalik mode owns its optional planner arguments and goal state.
Its mode command accepts a model and `--effort` independently.
Other skills retain their own invocation contracts.
The shared guide does not add undocumented flags to domain scripts.

Primary documentation links and verification dates appear in the shared guide.
