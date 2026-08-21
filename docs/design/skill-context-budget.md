# Skill context budget

What installing this collection actually costs a coding agent, measured rather
than assumed, and the invocation policy that follows. Measured 2026-08-16
against Claude Code 2.1.233.

## What loads, and when

Three layers, with very different costs:

| Layer | Loads | Cost |
|---|---|---|
| Skill listing (names + descriptions) | Every request, for model-invocable skills | Permanent |
| `SKILL.md` body | On invocation, and **stays in context across turns** | Recurring for the session |
| `references/`, `templates/` | Only when read | None until read |

The listing has a budget of **1% of the model's context window**. On overflow,
Claude Code shortens descriptions starting with the least-used skills, which
silently strips the trigger keywords the model matches against.

## Measurement: manual-only skills cost nothing

The open question was whether `disable-model-invocation: true` merely stops
automatic triggering while still paying for the description, or removes the
skill from the listing entirely.

A two-skill probe plugin was built with identical descriptions differing only in
that field, then a headless session was asked what it could see:

```text
probe-auto    → listed, with full description
probe-manual  → absent entirely
```

**Manual-only skills are invisible to the model until invoked** — not truncated,
not name-only. Codex behaves the same way with
`policy.allow_implicit_invocation: false`, verified previously through
`codex debug prompt-input`.

Consequence: in Claude Code and Codex this collection's 23 skills add **zero**
tokens to a session until one is named. The always-on cost is real only in
OpenCode, Amp, and the Antigravity CLI, which ignore both fields — there the
explicit-request guard sentence in each description is the only control, and
every description is loaded.

## Measurement: the guard sentence earns its length

The guard costs 54 characters per skill, 1,242 across the collection. Whether a
shorter form works was tested rather than argued, in the condition that matters:
a model-invocable skill, as OpenCode, Amp, and Antigravity see ours.

A single skill was published in three variants that differed only in the prefix,
its body instructed the model to emit a marker token, and a prompt that strongly
matches the description was sent repeatedly. The marker can only appear if the
body loaded.

| Description prefix | Fired on a tempting prompt | Fired on explicit request |
|---|---|---|
| `Use only when the user explicitly requests this skill.` | **0 / 8** | 4 / 4 |
| `Explicit request only.` | **7 / 8** | 4 / 4 |
| none | 2 / 4 | 4 / 4 |

The fragment performs **worse than no guard at all**. A sentence in the
imperative is read as an instruction; a noun fragment reads as a label
describing the skill and constrains nothing. No variant blocked explicit
invocation, so the guard costs nothing in usability.

The full sentence stays.

## Policy

**Every skill is manual-only.** Reaffirmed, now with a measured basis rather
than a preference: manual-only is free in the two clients that honor it, and an
auto-discoverable skill pays its description on every request forever while
competing for a budget that truncates on overflow.

Where a skill should apply automatically to a body of work, the cheaper and more
precise mechanism is one line in that directory's `AGENTS.md` naming the skill —
scoped to the subtree, loaded only when the agent works there, and costing
nothing elsewhere. See `skills/tailrocks-agents-md/SKILL.md`.

**Descriptions are capped at 250 characters after the guard.** Enforced by
`scripts/validate-skills.ts`. The description carries the trigger and the
do-not-use clause; everything else is the router's job. This cut the collection
from 10,141 to 6,875 characters, roughly 2.7k to 1.8k tokens for the clients
that load them.

**Routers stay under ~200 lines**, already enforced as a notice. One exceeds it
today: `tailrocks-macos-design` — it merged the design, prototype, and Liquid
Glass material routers into one file, and its size is the price of keeping one
taste authority per platform. Its material depth lives in `references/`, which
is free until read.

## Rejected

- **Shortening the guard.** Measured worse than useless; see above.
- **Making the four language best-practices skills auto-discoverable.** They are
  the strongest candidates — pure policy that should apply whenever that
  language is touched — but they would cost their descriptions permanently in
  every session, in exchange for what one `AGENTS.md` line does for free in the
  repositories that want it.
- **Dropping the do-not-use clauses to save characters.** They are the part of
  a description that prevents the wrong skill being named; the boundary is worth
  more than the bytes.
