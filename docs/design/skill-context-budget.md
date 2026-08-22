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

Consequence: in Claude Code and Codex the current 50 manual-only skills add
**zero** tokens until named; the 11 model-policy descriptions remain visible so
their exact triggers can match. OpenCode, Amp, and the Antigravity CLI ignore
both fields and load all 61 descriptions; there the explicit-request guard on
the 50 manual owners is their discovery control.

## Measurement: the guard sentence earns its length

The guard costs 54 characters per skill, 2,700 across the 50 manual owners.
Whether a
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

Invocation class is registry-owned and responsibility-driven. `MANUAL_ONLY`
remains the default for transactions and workflows. `MODEL_POLICY` is reserved
for exact-trigger policy or conversation guidance whose selection grants no new
authority. Direct invocation of those owners is best-effort across clients.

The exact model-policy set is the six Axum, GraphQL, gRPC, Rust, Swift, and
TypeScript best-practice owners; `tailrocks-agents-md`; `tailrocks-grilling`;
and the macOS, web, and terminal design owners. Every other skill remains
manual-only, and a split descendant does not inherit its parent's class.

The measured listing cost still governs description and router discipline; it
does not override correct applicability. Exact triggers keep the permanent
listing narrow, while structural authority boundaries prevent selection from
starting mutation, execution, blessing, or external action.

**Description bodies are capped at 250 characters.** Enforced by
`scripts/validate-skills.ts`: manual-only owners are measured after removing and
trimming the full guard sentence; model-policy owners, which have no guard, are
measured in full. The description carries the trigger and boundary; everything
else is the router's job. The current 61 descriptions total 15,992 characters;
13,242 count against the per-skill caps. The other 2,750 are the 2,700 guard
characters plus one trimmed separator on each of 50 manual owners.

**Routers stay under ~200 lines**, already enforced as a notice. One exceeds it
today: `tailrocks-macos-design` — it merged the design, prototype, and Liquid
Glass material routers into one file, and its size is the price of keeping one
taste authority per platform. Its material depth lives in `references/`, which
is free until read.

## Rejected

- **Shortening the guard.** Measured worse than useless; see above.
- **Making every skill auto-discoverable.** Transaction and workflow owners
  would gain no correctness from ambient selection and would crowd the listing.
  Only the confirmed exact-trigger set pays that permanent cost.
- **Dropping the do-not-use clauses to save characters.** They are the part of
  a description that prevents the wrong skill being named; the boundary is worth
  more than the bytes.
