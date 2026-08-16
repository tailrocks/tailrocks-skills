# skills

## Router budget

**References are free. Descriptions and router lines are not.**

Three layers, three costs. A `description` loads on every request in any client
that ignores manual-only policy, and competes for a listing budget of 1% of the
context window that truncates on overflow. A `SKILL.md` body loads on invocation
and then stays in context for the rest of the session. Everything under
`references/` and `templates/` costs nothing until read.

**Descriptions are capped at 250 characters after the guard sentence**, enforced
by the validator. Carry the trigger and the do-not-use clause; leave the rest to
the router. The guard sentence itself is load-bearing and measured — the short
form fired on 7 of 8 tempting prompts where the full sentence fired on 0 of 8.
Evidence and method: `docs/design/skill-context-budget.md`.

A `SKILL.md` is loaded whole, every invocation, and every behavior it carries
competes for the model's attention with every other behavior in the same file.
Adding a section does not just add its own instruction — it dilutes the ones
already there. Reference files carry no such cost: they are read on demand and
their length is nearly free.

This is not a theory. Every substantive eval failure during the macOS family's
hardening was a router-dilution failure or a gate misread as permission to
produce nothing. None was a references problem.

Rules for changing a `SKILL.md`:

- New material defaults to `references/`. The router gets **when to read it** and
  at most one rule worth carrying at router level — not a summary of its
  contents. A router section that reads like a table of contents is dilution with
  no benefit; the reference already says all of it, better.
- Adding a section to a router is a change to **every** behavior in that file.
  Re-run that skill's eval cases, not only a case related to the new section.
  Run `mise run evals -- --skill <name> --case <id> --runs 2`. This needs the
  `claude` CLI and spends budget, so run it locally before tagging, not in PR CI.
- Prefer strengthening an existing section over adding one. Two sections that
  both gesture at the same obligation are weaker than one that states it.
- When a router grows past roughly 200 lines, the next addition should replace
  something rather than append.
- Load-bearing router lines — ones an eval case depends on — are not edited
  casually. Check `evals/evals.json` before rewording a gate, a rejection rule,
  or a "complete when" clause.
- **A load-bearing requirement gets a structural cue, not a mid-paragraph
  clause.** A requirement an eval depends on needs a named bullet, a heading, or
  its own sentence with a label. Buried as the third idea in a four-idea
  paragraph it competes with better-signposted ideas elsewhere in the file and
  surfaces only sometimes — which reads as a flaky eval rather than as the
  prose defect it is.

  The case: the content-layer *mechanism* argument sat mid-paragraph in
  `tailrocks-liquid-glass`, while layer classification and render-pass cost each
  had dedicated bullets. Subjects reliably produced the well-signposted two and
  intermittently omitted the third, even though its eval case demanded it
  specifically. Promoting rule / mechanism / exception to named bullets — with
  the wording unchanged — made it pass consecutively.

  Corollary for debugging: an eval that fails on one missing element while
  everything else is correct is usually a signposting defect, not a knowledge
  gap. Look at where the requirement sits in the file before rewriting what it
  says.
