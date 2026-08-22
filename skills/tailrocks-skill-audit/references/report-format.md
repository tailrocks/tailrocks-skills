# Skill-audit report format

One report per skill, written to `skill-audits/<skill-name>.md` at the
root of the audited repository. A sweep writes one file per skill. A
re-audit overwrites the same file — the newest report is the state, and
git history holds the old ones. The directory carries no index.

## Header

```markdown
# Skill audit: <skill-name>

- Audited at: <commit SHA> (<date>)
- Verdict: <counts per layer, e.g. DESC 1, RTR 2, EVAL 1; or "clean">
```

## Layers and finding IDs

Each layer has its own monotonic ID prefix:

| Layer | Prefix | Covers |
|---|---|---|
| Description | `DESC-n` | Workflow summary, missing triggers, budget breach, missing do-not-use boundary |
| Router | `RTR-n` | Dilution, buried load-bearing lines, reference summaries, concept explanations, stacked musts, budget |
| References | `REF-n` | Content in the wrong layer, unrouted depth, duplication of the router |
| Evals | `EVAL-n` | Missing baseline evidence, unrealistic prompts, no refusal case, missing fixtures |
| Wiring | `WIRE-n` | Catalog, client metadata, generated docs, install/index documents, version lockstep |
| Overlap | `OVL-n` | Two skills owning one responsibility |

Prefix names the artifact layer that owns the fix. Add one or more dimensions:
`contract`, `behavior`, `predictability`, `efficiency`, `topology`,
`portability`, `security`. Dimensions never allocate IDs. Example: an unsafe
router instruction is `RTR-n` with `contract` and `security`; missing outcome
proof is `EVAL-n` with `behavior`.

## Finding shape

```markdown
### RTR-NEW — <one-line defect title>

- **Defect:** what is wrong, in one or two sentences.
- **Evidence:** file:line or the quoted phrase — opened by the auditor,
  never relayed from an investigator unread.
- **Fix:** the named correction — strengthen this section, move this to a
  reference, rewrite the description trigger-only.
- **Dimensions:** one or more typed dimensions from the list above.
- **Identity tuple:** {"layer":"router","doctrine_rule":"<rule>","defect":"<concise defect>","responsibility":"<owned responsibility>","evidence":{"path":"<case-sensitive path>","anchor":"<case-sensitive nearest heading or symbol>","quote":"<load-bearing quote>"}}
- **Action:** `update`, `refactor`, `validator`, `instruction`, or `delete`.
- **Acceptance:** observable check that proves the defect resolved.
```

## Rules

- Every finding carries an ID, evidence, and a named fix. A defect with
  no fix is not yet understood; investigate or drop it with a reason.
- Candidate headings always use `PREFIX-NEW`; numeric IDs are script output,
  never author input. Keep each identity JSON object on one line with exactly
  the shown fields. Prose fields trim, lowercase, and collapse whitespace while
  backticked identifiers retain case. Evidence path and anchor are exact,
  case-sensitive identifiers; quote is normalized prose. Line numbers never
  enter identity.
- Run `scripts/reconcile-report.ts` from this skill with the candidate and exact
  output path. It matches only the immediate previous report, while every
  committed version establishes per-layer historical maxima and ID bindings.
  A missing tuple retires its ID; a tuple returning after retirement receives a
  new ID. Multiple new findings allocate by canonical tuple sort, independent
  of candidate order.
- The reconciler rejects duplicate tuples, duplicate IDs, prefix/layer
  disagreement, malformed identities, and any historical ID bound to different
  tuples. Existing legacy five-field tuples remain readable only to preserve
  IDs during re-audit: copy that tuple line unchanged when the finding survives.
  Every new finding uses structured JSON; never translate a surviving legacy
  tuple during the same re-audit, because format migration is not identity.
- IDs select work for `tailrocks-skill-update` or
  `tailrocks-skill-refactor` according to the finding's action.
- A clean layer is stated as `None` — silence reads as unexamined.
- Killed findings (by-design, mis-attributed, duplicate) are listed at
  the end with their one-line reasons.
- Secret values never appear — location and type only.
