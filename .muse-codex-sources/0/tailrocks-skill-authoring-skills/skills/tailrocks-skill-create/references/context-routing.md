# Context routing

## The three-layer economy

A skill spends context at three prices. The **description** loads
on every request in clients that list skills. It competes for a
truncating listing budget and is the most expensive prose in the
tree. The **router** (`SKILL.md` body) loads whole on invocation
and stays for the session. Every behavior in it competes with every
other for the executing agent attention, so adding a section taxes
the sections already there. Content under **`references/`** costs
nothing until read.

Consequences, each binding:

- Depth defaults to `references/`. The router carries *when to
  read* a reference and at most one rule worth holding at router
  level, never a summary of the reference contents. A router section
  that reads like a table of contents is dilution with no benefit.
- Assume the executing agent is smart. Challenge every sentence:
  does it say something the agent does not already do? Cut
  background explanations, definitions of common terms, and restated
  defaults.
- A load-bearing requirement gets a structural cue: a named bullet,
  a heading, or a labeled sentence. Buried as the third idea in a
  four-idea paragraph, it surfaces only sometimes. That
  intermittency looks like a flaky check instead of the prose defect
  it is.
- A router has at most 200 body lines. At the limit, an addition
  replaces or extracts existing material. Two sections that gesture
  at one obligation are weaker than one that states it.
- References hang one level deep off the router. A reference that
  points to another reference gets skimmed instead of read. Flatten
  the chain. Route each file directly from the router with its
  when-to-read condition. Reference files over 100 lines open with
  a table of contents, so a partial read still reveals full scope.
  All paths use forward slashes on every platform.
- Slash `/` suggestions match description words by prefix.
  Front-loaded trigger words win twice.

## Match the form to the defect

Before writing a word, classify the defect. The form that fixes one
defect type backfires on another.

- **Knows the rule, skips it under pressure.** Right form:
  prohibition plus rationalization counters plus red flags. Wrong
  form: soft guidance ("prefer…", "consider…").
- **Complies, but the output has the wrong shape.** Right form:
  positive recipe. State what the output IS, parts in order. Wrong
  form: prohibition list ("don't restate", "never narrate").
- **Omits an element it already produces.** Right form:
  structural. A required slot in the template it fills. Wrong form:
  prose reminders near the template.
- **Behavior must depend on context.** Right form: conditional
  keyed to an observable predicate. Wrong form: unconditional rule
  plus exemption clauses.

Prohibitions backfire on shaping problems. Under a competing
incentive the agent negotiates with "don't X". A recipe leaves
nothing to negotiate: the output matches the stated shape or it
does not. Two wording rules always hold. Never write nuance
clauses. "Don't X unless it matters" reopens the negotiation.
Express a real exception as its own conditional on an observable
predicate.
Exemption clauses never scope. "This limit does not apply to code
blocks" still suppresses code blocks. Restructure the rule until
it cannot reach the exempt part.

For discipline forms, close loopholes explicitly. Forbid the
specific workarounds, not just the act. State that violating the
letter violates the spirit. Keep a rationalization table built from
observed agent mistakes: every excuse an agent used, with its
counter.

## Degrees of freedom

Match specificity to fragility. High freedom (goals and heuristics)
fits tasks where multiple approaches are valid and context decides.
Medium freedom (a pattern with parameters) fits tasks with a
preferred shape where variation stays fine. Low freedom (exact
commands, few or no parameters) fits fragile operations where
consistency is the point. Over-specifying a robust task wastes
tokens and produces brittle compliance. Under-specifying a fragile
one produces confident breakage.

## The description

The description is the trigger, nothing else. Only `name` plus
`description` preload on every turn. The body loads only after
selection.

- **Capability-first, third person.** Open with what the skill does
  as a concrete third-person capability clause, never `I can…` or
  `You can…`. Pattern: `<capability clause>. Use when <trigger
  contexts>.`
- **Trigger verbs are the user words, front-loaded.** Include the
  literal nouns and verbs users say: task verbs, artifact names,
  file types, cross-platform aliases. Troubleshooting step number
  one for "skill not triggering" on every client is "description
  lacks the keywords users naturally say". Key use case plus
  trigger words go first. Truncation cuts the tail first.
- **Sibling routing, not just behavior guards.** Each description
  names its own trigger and disambiguates its nearest siblings by
  object cardinality and file-versus-instance. A `Do not X` clause
  that never names the owning skill routes nowhere. Name it.
- **Procedures and workflow summaries are banned.** Middle sentences
  that describe behavior are dead weight for matching and become a
  shortcut the agent reads instead of the body. Also banned: XML
  tags, vague scope, instructions.
- **Caps.** `description` hard cap is 1024 characters (Agent Skills
  spec). Keep key triggers inside the first 250 characters. Claude
  Code truncates `description` plus `when_to_use` at 1536 per entry.
  Codex lists name plus description plus path under min(2 percent
  context, 8000 characters): descriptions shorten first, and skills
  may drop with a warning.
- Manual-only trees add their guard sentence verbatim and budget
  the rest (250 characters after the guard, here).
- **Pushy beats polite.** Agents undertrigger: they skip skills
  that help. Name trigger contexts explicitly, including cases
  where the user never says the domain word.

### The `when_to_use` trigger field

`when_to_use` (Claude Code extension, snake_case) holds extra
trigger phrases and example requests. The listing appends it to
`description`. It counts toward the same 1536-char cap. Codex
ignores unknown frontmatter: keep portable triggers in
`description` itself. Use this field only for overflow and
negatives.

Template:

```yaml
when_to_use: >-
  <2-4 example user requests in the user own words>.
  Not for <nearest sibling trigger> — that belongs to <owning skill>.
  Not for <second overlap> — that belongs to <owning skill>.
```

Rules: example requests must read like typed prompts, not
paraphrased capabilities. Sibling routing lives here when
`description` is full. Kimi accepts `whenToUse` (aliases
`when-to-use`, `when_to_use`) as its dedicated trigger field.
Grok accepts `when-to-use` and `when_to_use` plus `paths` globs.

### Trigger fields by client

Match text and gates differ per host. Triggers portable everywhere
live in `description` itself.

- **Claude Code.** Match text: `description` plus `when_to_use`
  (appended, 1536 chars combined). `paths` globs gate by file.
  `disable-model-invocation: true` removes from context.
  `user-invocable: false` hides `/` entry only.
- **Codex.** Match text: `description` only (`name` aids).
  `agents/openai.yaml` carries `allow_implicit_invocation`.
  `default_prompt` and `short_description` are picker UI, never
  matching.
- **Muse.** Match text: `name` plus `description`.
  `disable-model-invocation` and `user-invocable` are accepted
  but not enforced.
- **Kimi.** Match text: `description` plus `whenToUse` (plus
  aliases). `disableModelInvocation` gates entry. `type: flow` is
  manual-only, never on an invokable skill. Nesting cap is 3. A
  directory `SKILL.md` without `name` plus `description` fails
  parsing. Declare `arguments:` for every `$<name>` the body reads.
- **Antigravity CLI.** Match text: `name` plus `description`
  only. No other trigger keys exist on this host.
- **Grok Build.** Match text: `description` plus `when-to-use`
  plus `paths`. `user-invocable` hides from the model too unless
  literally `true`. `allowed-tools` accepted, not enforced.
- **OpenCode V1.** Match text: `name` plus prose match through
  the `skill` tool. Ignores `disable-model-invocation` and
  `user-invocable`. Gate is `permission.skill: ask`.
- **OpenCode V2.** Selection uses the path-derived id with `@`
  mention or `skill({id})`. It keeps `disable-model-invocation`
  among its keys.
- **Amp.** Match text: `name` plus `description` listing. Model
  decides loads. First-`name` wins across roots. No
  user-invokable skills (model-invoked only). Repo skills require
  dir name equal to frontmatter `name`.

### YAML hygiene

Triggering dies silently on malformed metadata:

- Opening `---` is the file first line.
- Malformed frontmatter loads with empty metadata: manual `/name`
  still works while auto-trigger silently dies. Debug with
  `claude --debug` and `claude plugin validate`.
- `name`: 1 to 64 chars, lowercase alphanumerics plus hyphens, no
  leading, trailing, or consecutive hyphens, matches the directory
  name, no reserved words (`anthropic`, `claude`).
- `description`: non-empty, at most 1024 chars, no XML tags.
- Gate every description change with five validators. Run the spec
  check, `muse skills validate <path>`, `claude plugin validate`,
  `grok plugin validate`, and `agy plugin validate`.
- Host-only execution fields never port. `model` overrides the
  session model. `context: fork` plus `agent` runs detached and
  never stacks: such instructions must stand alone with zero
  conversation history. Skill `hooks` persist for the session and
  conflict with manual-only policy. `disallowed-tools` removes
  tools while active. `arguments:` maps named `$name` placeholders
  to argument positions.

## Naming and examples

Name by the action or the owned artifact. Stay distinctive enough
to pick out of a listing. Never use a generic category label. One
excellent, runnable, real example beats several mediocre ones: the
executing agent ports well. Never use narrative war stories as
examples. Never repeat the same example in three languages. Never
ship fill-in-the-blank templates that teach nothing. Never use
generic labels (`step1`, `helper2`).

## Anti-pattern checklist

Before validation, run every draft against these:

- Description summarizes workflow, or lacks trigger words, or
  exceeds the tree budget.
- Router summarizes a reference, or reference content restates the
  router.
- Capitalized MUST and NEVER stack where an explained *why* binds
  better. All-caps without a reason is a yellow flag for a rule the
  author never justified.
- A nuance clause or exemption clause stands where a predicate
  conditional belongs.
- A rule enforceable by a validator or gate lives in prose instead.
- Two skills share one responsibility, or one skill carries two.
- Force-loading references (inline includes) stand where routing by
  when-to-read belongs.
- A substantial deliverable sits in the conversation, or a file
  exists for output with no reader beyond the current session. The
  output-contract section owns the choice.
- Changelog prose or a reference to the skill own previous version
  exists ("this replaces the earlier…", "formerly…", "we now…"). A
  skill states current doctrine only. History lives in git.
- Any reference to an external project exists: a repository URL, a
  named skill collection, an author credited as the source. Needing
  the reference means the information belongs here: extract it,
  rephrase it, make it part of this project. Provenance lives in
  git and pull-request history, never in shipped content. Official
  documentation of house-adopted tools, and placeholder URLs in
  templates, are the only URL classes a skill carries.
