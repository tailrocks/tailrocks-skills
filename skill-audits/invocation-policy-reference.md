# Skill invocation policy reference

- Verified: 2026-08-22
- Scope: Claude Code, Codex CLI, OpenCode, Grok Build, Kimi Code, Antigravity CLI, and Amp
- Applies to: the shared `skills/<name>/SKILL.md` tree and client-specific wiring

## Decision

Use model + user invocation for confirmed standing-knowledge skills:

- `tailrocks-rust-best-practices`
- `tailrocks-axum-best-practices`
- `tailrocks-graphql-best-practices`
- `tailrocks-grpc-best-practices`
- `tailrocks-typescript-best-practices`
- `tailrocks-swift-best-practices`

Use user-only invocation for every skill whose responsibility is an action,
including `audit`, `review`, `apply`, `create`, `merge`, `migrate`, `plan`,
`verify`, `remediate`, `refactor`, `setup`, `document`, and `record`.

This rule is conservative. A name is a routing signal, not a security
boundary. Actual side effects and authority must also be inspected.

No model-only skills are currently required.

No evals are needed for this policy. Do not add, split, rewrite, run, or
certify evals as part of this migration. Use static checks, unit tests,
integration tests, and wiring checks only where needed.

## Shared skill metadata

### Model + user

```yaml
---
description: Apply the relevant standing engineering knowledge when writing or reviewing code.
user-invocable: true
---
```

Omit `disable-model-invocation`, or set it to `false`.

The description must state the skill's scope and boundary. Model invocation
does not grant permission to mutate files, commit, push, deploy, publish, or
send messages.

### User-only action

```yaml
---
description: Use only when the user explicitly requests this action.
disable-model-invocation: true
user-invocable: true
---
```

Keep the explicit-request guard at the start of every action description. It
is required for clients that ignore the metadata, but it is not itself a hard
security boundary.

### Model-only background knowledge

Not currently used. If later required by a specific client, Claude-style
metadata is:

```yaml
---
description: Provide background context when relevant to the current task.
user-invocable: false
---
```

Do not combine this with `disable-model-invocation: true`: that combination
would prevent model invocation.

## Per-agent wiring

| Agent | Model + user | User-only action | Enforcement in this repository |
|---|---|---|---|
| Claude Code | Omit `disable-model-invocation`; keep `user-invocable: true` | `disable-model-invocation: true`, `user-invocable: true` | Native metadata | 
| Codex CLI | `policy.allow_implicit_invocation: true` | `policy.allow_implicit_invocation: false` | `agents/openai.yaml`; explicit `$skill` still works when false |
| Grok Build | Omit `disable-model-invocation`; keep user-visible metadata | `disable-model-invocation: true`, user-visible metadata | Native metadata |
| Kimi Code | Allow model invocation; keep the skill user-addressable | `disable-model-invocation: true` | Native model-disable field; use explicit slash invocation |
| OpenCode | Use its native `autoinvoke` setting where supported | `opencode/autoinvoke: false` plus `permission.skill` approval/deny | Requires client-specific wiring; shared Claude fields are not authoritative |
| Antigravity CLI | No verified shared per-skill switch | Explicit-request guard plus tool permissions | Permissions enforce; description guard only routes |
| Amp | No verified shared per-skill disable switch | Explicit user invocation plus action/tool permissions | User invocation exists; descriptions remain model-visible |

## Repository baseline

The current repository is stricter than the target policy:

- `scripts/validate-skills.ts` currently requires every skill to be
  `disable-model-invocation: true`, `user-invocable: true`, and
  `allow_implicit_invocation: false`.
- `scripts/generate-docs.ts` currently describes every skill as manual-only.
- Therefore, the six standing-knowledge skills are not yet model-invocable.
- Existing action skills already match the user-only profile.

Changing the six knowledge skills requires updating the validator and generated
documentation rules so they accept both approved profiles. Do not weaken the
action-skill requirements.

## Safety rules

- Never infer model invocation from a suffix alone.
- Any skill that can commit, push, merge, deploy, publish, send, delete,
  modify external state, or make a consequential timed decision is user-only.
- `user-invocable: false` hides a skill from a user command menu; it is not a
  safety control.
- Codex `allow_implicit_invocation: false` blocks implicit selection but does
  not block explicit `$skill` invocation.
- Model + user knowledge skills must remain read-only unless the user clearly
  requests an action handled by a separate user-only skill.
- Do not let a knowledge skill silently absorb an action responsibility.
- Keep action approval, mutation authority, and recovery rules in the action
  skill or its deterministic script.
- Preserve the explicit-request description guard for all action skills,
  including on clients with native metadata support.

## Required migration checks

- [ ] Classify each skill by responsibility and side effect.
- [ ] Assign the six approved best-practice skills to model + user invocation.
- [ ] Keep every action skill user-only on every client.
- [ ] Add client-specific Codex policy for each skill.
- [ ] Update validation to accept exactly the two approved profiles.
- [ ] Update generated documentation to distinguish model + user from user-only.
- [ ] Confirm OpenCode wiring for the supported client version.
- [ ] Confirm Antigravity and Amp permission rules protect action tools.
- [ ] Verify explicit invocation still works for every user-only skill.
- [ ] Leave evals unchanged and out of scope.
