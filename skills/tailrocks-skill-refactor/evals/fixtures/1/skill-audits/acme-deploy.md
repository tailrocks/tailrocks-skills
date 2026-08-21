# Skill audit: acme-deploy

- Audited at: 111aaaa (2026-08-22)
- Verdict: DESC 1, RTR 2, EVAL 1; references, wiring, overlap clean

## Description

### DESC-1 — Workflow summary with unrelated-scope bait

- **Defect:** The description narrates the deploy steps in order and
  advertises "general DevOps questions, CI setup, and infrastructure
  work", baiting overtriggering far outside the skill's scope.
- **Evidence:** `skills/acme-deploy/SKILL.md` line 4.
- **Fix:** Rewrite trigger-only — the situations and artifact names that
  should activate the skill plus the do-not-use boundary; drop the step
  sequence and the unrelated scope.

## Router

### RTR-1 — Concept explanations

- **Defect:** The body explains what deployment and containers are —
  knowledge any agent already has, paid for on every invocation.
- **Evidence:** `skills/acme-deploy/SKILL.md` lines 9–11.
- **Fix:** Delete the explanations; state only the behavior the skill
  changes.

### RTR-2 — Reference summarized into a table of contents

- **Defect:** The router recaps the steps reference topic-by-topic and
  adds an "In short" recap — dilution with no benefit; the reference
  already says all of it, better.
- **Evidence:** `skills/acme-deploy/SKILL.md` lines 17–22.
- **Fix:** Replace both with a single when-to-read pointer to the
  reference.

## References

None.

## Evals

### EVAL-1 — No eval cases

- **Defect:** The skill ships no evals; nothing proves it changes
  behavior.
- **Evidence:** `skills/acme-deploy/` has no `evals/evals.json`.
- **Fix:** Write baseline-derived cases — normal, boundary, refusal.

## Wiring

None.

## Overlap

None.

## Killed findings

- "No templates directory" — by design; the skill ships no copy-ready
  assets, so there is nothing to template.
