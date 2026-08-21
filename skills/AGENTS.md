# skills

## External references

The validator forbids code-forge URLs (github.com, gitlab.com,
bitbucket.org, codeberg.org, and all gists) in shipped skill content —
`SKILL.md`, `references/`, `templates/` — allowing only release pages,
the allowlisted canonical homes of house-adopted libraries, and
placeholder owners.

It rejects two more things in that same content. **A design-file tool is
never the design reference** — the reference is real code on the real
substrate: a design route the application rendered, a running prototype,
a ratatui golden frame — so a skill never sends an agent to one, never
asks for one as a deliverable, and never treats one as the thing an
implementation is measured against. And **a skill names the capability
role it needs, never the model route that fills it today**: provider
mappings are volatile and the shared tree is source-neutral, so a skill
says "the cheapest route that can follow this plan mechanically" and the
concrete mapping lives in a design note or the client capability
registry, where it can be dated and re-verified. Both gates allow a line
that names the thing in order to forbid it — a prohibition has to say
what it prohibits.

What the gates cannot judge, these rules do:

- Extract external knowledge into the skill's own references; never
  point the reader at another project, above all another skill or
  plugin collection.
- No provenance attribution inside a skill — no external author names,
  artifact names, or "adapted from" stories. Extract, rephrase, localize;
  provenance lives in git history, never in the tree.
- Published articles, papers, and standards cited as evidence keep
  their canonical links; a project repository never qualifies as
  evidence.
- A skill carries only its current rules. No changelog prose, no
  reference to the skill's own previous version or an earlier framing,
  no where-this-came-from asides — everything an agent loads into
  context states present doctrine only; history lives in git.

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
- **Eval execution is a CI/CD concern, never a local step.** `mise run evals`
  needs the `claude` CLI and spends budget, and no gate in this repository runs
  it. Authoring and updating `evals/evals.json` is part of the work; running
  the harness is not. Never block a change on a local eval run, never claim a
  change is verified because the harness passed on your machine, and never add
  a `mise run evals` invocation to a skill body, an instruction file, or a
  workflow gate. Record the expected red-before / green-after in the pull
  request and let CI own execution once that lane lands.

  This does not weaken the observed-failure law carried by
  `tailrocks-skill-create` and `tailrocks-skill-update`.
  The red bar is *watching the behavior fail* — run the skill against the case
  prompt in a session and read what it produces. That is a manual observation,
  costs one invocation, and needs no harness. `mise run evals` is the scoring
  harness for that same case at scale; the two are not substitutes, and only
  the second one defers to CI.
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
