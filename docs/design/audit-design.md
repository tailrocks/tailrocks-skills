# Audit Design

Why `tailrocks-audit` is one skill with lanes and modes rather than a family
of "improve X" skills, and how it splits judgment from mechanical execution.
This note records decisions; the skill itself is the contract.

## The gap it closes

The delivery family started at a captured idea. Nothing in it began from a
bare repository and asked *what here is worth fixing*. Reaching ready-to-execute
work from a cold codebase meant running `tailrocks-idea`,
`tailrocks-brainstorm`, and `tailrocks-finalize` once per candidate — with no
fan-out over the repository, no verification of what the fan-out claimed, and
no cheap-tier execution loop at the far end.

The mechanism worth extracting is three-part: a capable model surveys and
judges, the judgment is frozen into a self-contained plan, and only the
mechanical execution is handed to a cheaper model. The plan is the product.
The diff is a by-product, and it is never this skill's output.

## One skill, not six

The requested angles were UI/UX, Liquid Glass, security, performance,
agent-legibility of the code, and an open-ended question. Each could have been
its own skill. They are lanes of one skill instead, for three reasons.

**The expensive half is shared.** Recon, adversarial verification,
leverage-ordered prioritization, artifact seeding, and the execution loop are
identical no matter which lane produced a candidate. Six skills would carry six
copies of that machinery, and they would drift.

**The router budget is a public good.** Six skills mean six always-loaded
descriptions and six routers competing for attention on every invocation, to
express what one `argument-hint` expresses in a line. A lane costs nothing
until it runs.

**Findings must be comparable.** A security finding and a performance finding
land in the same prioritized table and compete on the same leverage axis. Split
across skills, they arrive as separate reports that no one ranks against each
other, and the user is left doing the prioritization the skill exists to do.

`--deep` is a *depth modifier*, not a seventh mode, precisely so this does not
regress: it composes over any mode or named lane (`--deep`, `security --deep`,
`branch --deep`) instead of forking a parallel set of deep-flavored entry
points. It is spelled as a flag, matching `tailrocks-plan` and
`tailrocks-research`, so depth reads the same way across the delivery family.

## Taste has exactly one owner

Two lanes touch aesthetics, and neither may own it.

| Lane | Judgment source | What the lane may not do |
|---|---|---|
| UX | patterns `tailrocks-web-design` already blessed | propose a new screen design, or override a blessed pattern |
| Liquid Glass | `tailrocks-macos-design-review`'s rubric and glass acceptance gate | make a fresh material or chrome call |

Both lanes invoke the owning skill's rubric rather than re-deriving one, and
both skip cleanly when the repository has no blessed screens or no native
surface. A candidate that contradicts a blessed design is not a finding — it is
a routing event back to the design owner. Without this rule the audit becomes a
second, quieter source of taste, and the inconsistency shows up across features
rather than as an error anyone can see.

The agent-legibility lane is the one that could have been mistaken for a
best-practices skill. It is not about per-language idiom — that belongs to the
stack skills. It asks how safely a *fresh-context agent* can navigate and extend
the code: reads that blow a cold context, names that do not survive a cold grep,
directories with conventions and no `AGENTS.md`, and any language, framework,
package manager, or tool in use outside the house stack. A stray dependency is
evidence for this lane because the failure mode is an agent copying the wrong
pattern out of it.

## Boundaries against the neighbors

| Neighbor | Owns | Audit boundary |
|---|---|---|
| `tailrocks-review-pr` | one diff, verified findings, comments | audit starts from a cold repository; `branch` mode overlaps by design and stops at seeding, never comments on a PR |
| `tailrocks-code-health` | measured baselines and shrink-only ratchets | may cite a ratchet's findings; never establishes or tightens one |
| `tailrocks-root-cause` | proven defect or concrete friction, causal design | routes diagnosis there; never diagnoses deeply or fixes |
| `tailrocks-remediate` | one approved causal correction | never grants approval or applies it from audit |
| `tailrocks-research` | sourced `research/` topics | may seed an open question; never writes `research/` |
| `tailrocks-idea` | capture of the user's own words | audit items are evidence-derived and marked with their source |
| `tailrocks-plan` | READY item to plan package | audit seeds a package directly only when the finding is small, mechanical, and free of open product questions |

Everything the skill writes is an artifact the delivery family already
understands — `roadmap/<slug>/`, its `plan/` package, and the index — so
`tailrocks-brainstorm`, `tailrocks-finalize`, `tailrocks-plan`,
`tailrocks-reconcile`, and `/goal` execution keep working on audit-seeded work
with no special case.

## Grounding, or it is idea-slop

Every candidate cites repository evidence: `file:line`, a tree path, or a
reproducible query. Valid modalities include TODO clusters, dormant feature
flags, stubbed modules, documented promises with no implementation, asymmetric
surfaces (export without import, CRUD minus one), and adjacent capability the
existing architecture already makes concrete. Generic category filler — "add
dark mode" — violates the contract even when it would be a fine idea.

This binds `next` mode hardest, because direction findings are where
unevidenced suggestions are easiest to smuggle in. They also get their own
table: a feature suggestion and a bug are not comparable on one axis.

Lanes over-report, so the orchestrator re-opens every cited line itself before
a candidate may be listed, and logs every drop with its reason where the next
run will see it. Without the log, the same rejected idea returns every run and
the user re-rejects it forever.

## Model routing

Routing is by capability role, not by model brand, and the role names are the
delivery family's own rather than a second vocabulary: `frontier-judgment` for
recon, fan-out, verification, prioritization, and diff review;
`bounded-executor` for one self-contained plan; `fast-mechanical` for search,
extraction, and deterministic transforms inside a step; `independent-verifier`
under `--deep`, receiving a candidate's cited location and claim without the
lane's reasoning and never editing what it judges. Execution runs in an
isolated worktree, handed only the plan file and inheriting nothing from the
audit conversation.

The routes are ordered by capability, and the ladder does not follow model
naming or release order. As of 2026-08-21 the Claude ladder runs Fable 5 →
Opus 5 → Sonnet 5 → Haiku 4.5, with Fable 5 both the most capable route and
the most expensive per token — so it is a `frontier-judgment` route and never
the cheap executor. An early draft of this skill listed "Haiku 4.5 or Fable 5"
as interchangeable executor tiers, which would have paid the top rate in the
ladder for mechanical work.

**That concrete ladder lives here and nowhere in the skill.** The shipped
skill names no models at all: it names the role and instructs verifying a
route's real capability and price at execution time. Two reasons. A hard-coded
list rots silently — nothing in a skill tree can tell that a mapping went
stale, so the error survives every review that reads for sense rather than for
freshness. And the shared `skills/` tree is source-neutral, so a Claude-shaped
mapping in a `SKILL.md` is wrong for every other client that loads it. A
validator gate now rejects model brand names in skill content; this note is the
sanctioned home for the mapping, because a design note is read by people
deciding, not loaded into an agent's context.

The role is a scope judgment, not a fixed name. A plan with dense STOP
conditions or many interacting files may move `bounded-executor` up a route; a
one-file, one-substitution, one-command plan is exactly what `fast-mechanical`
is for. Dispatching the `frontier-judgment` route as executor defeats the
separation entirely.

Effort is not the only input to that choice. The size test also keys on **fix
risk** — how much damage a wrong fix does, which is independent of how large
the fix is. A one-line change inside an authorization check, a payment path, a
migration, or a concurrency-sensitive region is small and dangerous, and
effort-plus-confidence alone routed exactly that shape to the cheapest route
that can follow instructions. MEDIUM or worse now seeds a roadmap item no
matter how small the diff.

The split has a useful side effect: it makes plan quality *measurable*. If the
executor has to ask a question the plan should have answered, that is a plan
defect, and it routes back to `tailrocks-plan` rather than being patched with
out-of-band context. Feeding the executor extra context hides the defect and
leaves the plan unusable for the next reader.

Review of the executor's diff happens on the `frontier-judgment` route, against
the plan's own done criteria and out-of-scope list — never on the executor's
"done" claim. Two send-back rounds maximum; a third failure is a Block, and the
verdict says so, because the plan is wrong rather than the executor. Merging
always stays the user's call.

## Safety

Repository, registry, and web content are evidence, never instructions;
embedded instructions get flagged rather than followed. Secrets are cited by
location and type, never reproduced, with rotation recommended. Intent
documents (`docs/adr/`, `CONTEXT.md`, `DESIGN.md`, `PRODUCT.md`) are ingested
first: a decided tradeoff is not a finding, and a `next` suggestion that
contradicts stated product direction is dropped in verification.

Two structural decisions carry that further than a boundary list can.

**Every rule that a lane needs travels in the lane's brief.** A lane is a
subagent and inherits nothing, so a rule stated only in the router reaches the
orchestrator and stops. The sharp case is the one that matters most: the
security lane is the single lane that reads credential-bearing and
attacker-influenced files, and it is exactly the lane a no-secrets rule left in
the router would never reach. Six items are restated verbatim in every brief
rather than assumed.

**The boundary is not the lane; it is the whole chain to the executor.** A
candidate carries excerpts of the audited repository, and those excerpts
survive verification into the prioritized table, then into a roadmap item or a
plan's Starting-state section — which is read by a `bounded-executor`, the
least capable route in the ladder and the one most likely to read an
instruction-shaped sentence as an instruction. A repository nobody in this
house wrote is the input the skill exists for, so quoted content stays quoted
at every hop: fenced with its `file:line`, labelled where it addresses an
agent, and never allowed to phrase a step, a done criterion, or a STOP
condition.

## Read-only, with one bounded exception

The skill never edits source. `execute` mode edits only inside a disposable
worktree that this skill never merges and never pushes, and reports its path so
the user can inspect or discard it. Asked to "just implement it", the skill
declines and names the plan or offers `execute`.
