# Skill-audit report format

One report per skill, written to `skill-audits/<skill-name>.md` at
the root of the audited repository. A sweep writes one file per
skill. A re-audit overwrites the same file: the newest report is
the state, and git history holds the old ones. The directory
carries no index.

## Header

```markdown
# Skill audit: <skill-name>

- Audited at: <commit SHA> (<date>)
- Verdict: <counts per layer, e.g. DESC 1, RTR 2, EVAL 1; or "clean">
```

## Layers and finding IDs

Each layer has its own monotonic ID prefix:

- **Description** (`DESC-n`): trigger wording, spec caps, sibling
  routing, precedence, flag coherence, YAML hygiene.
- **Router** (`RTR-n`): dilution, buried load-bearing lines,
  reference summaries, concept explanations, stacked musts, budget.
- **References** (`REF-n`): content in the wrong layer, unrouted
  depth, duplication of the router.
- **Evidence** (`EVAL-n`): unproven behavior claims, missing
  static checks, or absent refusal coverage.
- **Wiring** (`WIRE-n`): catalog, client metadata, selector form,
  generated docs, install and index documents, version lockstep.
- **Overlap** (`OVL-n`): two skills owning one responsibility.

The prefix names the artifact layer that owns the fix. Add one or
more dimensions: `contract`, `behavior`, `predictability`,
`efficiency`, `topology`, `portability`, `security`. Dimensions
never allocate IDs. An unsafe router instruction is `RTR-n` with
`contract` and `security`. An unproven behavior claim is `EVAL-n`
with `behavior`. `EVAL` remains the stable historical ID prefix. It
names the Evidence layer and never authorizes an evaluation
fixture.

## Description and wiring checks

Checkable DESC and WIRE rules. Each maps to one finding with
file and line or quoted-phrase evidence:

- `description` is non-empty, at most 1024 characters, and has no
  XML tags. `name` has 1 to 64 characters, lowercase alphanumerics
  plus hyphens, and matches the directory.
- Key triggers stay inside the first 250 characters. `description`
  plus `when_to_use` stays within 1536 characters.
- Manual-only trees carry the guard sentence verbatim.
- Every `Do not X` names the owning skill. Procedures and workflow
  summaries are absent.
- Each body states user-instruction precedence with its refusal
  carve-out (see `runtime-trust.md`).
- Flag coherence: `disable-model-invocation` and
  `allow_implicit_invocation` agree. OpenCode, Antigravity, and
  Muse exposure is explicit, and Amp observes no gating field.
- `agents/openai.yaml` uses bare `$<skill>`. `$plugin:skill`
  anywhere is a WIRE finding. `default_prompt` is picker framing,
  never a trigger. Keys are snake_case.
- The Kimi manifest sets `skills` to `./skills/`. Its interface
  holds only `displayName`, `shortDescription`, `developerName`,
  and `websiteURL`.
- The portable root manifest carries the Agent Plugins 1.0.0 schema
  id. It carries no `skills` field.
- `version` matches across root `plugin.json` and the Claude and
  Kimi host manifests.
- The frontmatter `---` is line 1 and the YAML parses. The
  `claude plugin`, `muse skills`, `muse plugins`, `grok plugin`,
  and `agy plugin` validators are green.
- No component marketplace file exists. Only the central
  marketplace carries a catalog.

## Finding shape

```markdown
### RTR-3 — Router summarizes the retry reference

- **Defect:** what is wrong, in one or two sentences.
- **Evidence:** file and line or the quoted phrase. The auditor
  opened it, never relayed it unread from an investigator.
- **Fix:** the named correction. Strengthen this section, move this
  to a reference, rewrite the description trigger-only.
- **Dimensions:** one or more typed dimensions from the list above.
- **Identity tuple:** {"layer":"router","doctrine_rule":"<rule>","defect":"<defect>","responsibility":"<responsibility>","evidence":{"path":"<path>","anchor":"<anchor>","quote":"<quote>"}}
- **Action:** `update`, `refactor`, `validator`, `instruction`, or `delete`.
- **Acceptance:** observable check that proves the defect resolved.
```

## Rules

- Every finding carries an ID, evidence, and a named fix. A defect
  with no fix is not yet understood. Investigate it or drop it with
  a reason.
- The auditor assigns numeric IDs directly. Match each candidate
  against the immediate previous report by identity tuple. Preserve
  the ID when the tuple matches. Allocate the next free ID in the
  layer for a new tuple. Never reuse a retired ID. Keep each
  identity JSON object on one line with exactly the shown fields.
- A missing tuple retires its ID. A tuple that returns after
  retirement receives a new ID. Prose fields trim, lowercase, and
  collapse whitespace. Evidence path and anchor are exact,
  case-sensitive identifiers. The quote is normalized prose. Line
  numbers never enter identity.
- Existing legacy five-field tuples remain readable only to
  preserve IDs during re-audit. When the finding survives, copy
  that tuple line unchanged. Never translate a surviving legacy
  tuple during the same re-audit: format migration is not identity.
- IDs select work for `tailrocks-skill-update` or
  `tailrocks-skill-refactor` according to the finding action.
- State a clean layer as `None`. Silence reads as unexamined.
- List killed findings (by-design, mis-attributed, duplicate) at
  the end with their one-line reasons.
- Secret values never appear. Location and type only.
