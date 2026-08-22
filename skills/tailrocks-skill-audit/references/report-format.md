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
### RTR-2 — <one-line defect title>

- **Defect:** what is wrong, in one or two sentences.
- **Evidence:** file:line or the quoted phrase — opened by the auditor,
  never relayed from an investigator unread.
- **Fix:** the named correction — strengthen this section, move this to a
  reference, rewrite the description trigger-only.
- **Dimensions:** one or more typed dimensions from the list above.
- **Identity tuple:** layer; doctrine rule; concise defect; owned
  responsibility; evidence path, nearest heading or symbol, and normalized
  quote. Normalize prose by trimming, lowercasing, and collapsing whitespace;
  preserve identifiers exactly. Compare tuple fields structurally — no invented
  digest or line number.
- **Action:** `update`, `refactor`, `validator`, `instruction`, or `delete`.
- **Acceptance:** observable check that proves the defect resolved.
```

## Rules

- Every finding carries an ID, evidence, and a named fix. A defect with
  no fix is not yet understood; investigate or drop it with a reason.
- Before assigning IDs, read the previous report. Preserve an ID only when its
  identity tuple matches. Allocate new IDs above that layer's historical maximum;
  never reuse retired IDs. IDs select work for `tailrocks-skill-update` or
  `tailrocks-skill-refactor` according to the finding's action.
- A clean layer is stated as `None` — silence reads as unexamined.
- Killed findings (by-design, mis-attributed, duplicate) are listed at
  the end with their one-line reasons.
- Secret values never appear — location and type only.
