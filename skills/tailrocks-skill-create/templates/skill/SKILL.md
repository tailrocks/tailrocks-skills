---
name: <skill-name>
description: >-
  Use only when the user explicitly requests this skill. <Triggers only:
  the symptoms, situations, and artifact names that should activate this
  skill, plus the do-not-use boundary. Never a workflow summary.>
argument-hint: "<arguments>"
disable-model-invocation: true
license: Apache-2.0
user-invocable: true
---

# <Title>

<One paragraph: what this skill changes in an agent's behavior, and the
observed failure it answers.>

## Steps

1. **<Step name>.** <Instruction — one obligation per step, reason
   stated.> **Complete when:** <testable condition.>

## Red flags — STOP

- "<The rationalization an agent will reach for>" — <the counter.>

## Final gate

<Refusals, each naming its reason. Depth belongs in references, routed
from the relevant step by when to read it, never summarized here.>
