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

Six layers, each with its own ID prefix, numbered in report order:

| Layer | Prefix | Covers |
|---|---|---|
| Description | `DESC-n` | Workflow summary, missing triggers, budget breach, missing do-not-use boundary |
| Router | `RTR-n` | Dilution, buried load-bearing lines, reference summaries, concept explanations, stacked musts, budget |
| References | `REF-n` | Content in the wrong layer, unrouted depth, duplication of the router |
| Evals | `EVAL-n` | Missing baseline evidence, unrealistic prompts, no refusal case, missing fixtures |
| Wiring | `WIRE-n` | Catalog, client metadata, generated docs, install/index documents, version lockstep |
| Overlap | `OVL-n` | Two skills owning one responsibility |

## Finding shape

```markdown
### RTR-2 — <one-line defect title>

- **Defect:** what is wrong, in one or two sentences.
- **Evidence:** file:line or the quoted phrase — opened by the auditor,
  never relayed from an investigator unread.
- **Fix:** the named correction — strengthen this section, move this to a
  reference, rewrite the description trigger-only.
```

## Rules

- Every finding carries an ID, evidence, and a named fix. A defect with
  no fix is not yet understood; investigate or drop it with a reason.
- IDs are stable within the report and numbered per layer. They are how
  `tailrocks-skill-refactor` selects work — never reuse an ID for a
  different defect in a re-audit; retired IDs stay retired.
- A clean layer is stated as `None` — silence reads as unexamined.
- Killed findings (by-design, mis-attributed, duplicate) are listed at
  the end with their one-line reasons.
- Secret values never appear — location and type only.
