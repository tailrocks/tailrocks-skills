# Findings Format

One finding per file under `proposals/<slug>/findings/NN-<topic>.md`, numbered in
the order they were confirmed. A finding is a small, self-contained, sourced
observation about the idea — not a plan and not a recommendation.

## File template

```markdown
# [NN] <Short, specific title>

- **Facet**: prior-art | codebase | constraint | risk | alternative | adjacent
- **Confidence**: HIGH | MED | LOW
- **Sources**:
  - `path/to/file.rs:120-140` — <what it shows>
  - https://example.com/docs/page — <what it shows>

## What it is

2–5 sentences. The observation, stated concretely. What is true, where, and why
it matters to the idea. No recommendation — just the fact and its relevance.

## Implication for the idea

1–3 sentences. How this widens, constrains, or complicates the concept — or which
candidate direction it supports or rules out. Still not a plan; a pointer for the
human's decision and for the later research pass.

## Open questions raised

- <question this finding surfaces that only the human (or deeper research) can
  resolve>
```

## Rules

- **Sourced or it is not a finding.** Every finding names at least one
  `file:line` or URL. A hunch with no source belongs in the README's open
  questions, not here.
- **One observation per file.** If a file argues two things, split it. Small files
  are easy to cite from the README and easy for the human to skim.
- **Concrete title.** "Auth already rate-limits per IP (`mw/auth.rs:88`)" beats
  "Auth considerations".
- **No recommendation, no plan.** Findings inform the decision; they do not make
  it. The candidate directions live in the item `README.md`; the plan is the
  `tailrocks-research` skill's output.
- **No secrets.** Credential locations and types only, never values.

## How findings feed forward

- The item `README.md` links each finding in one line and clusters them into
  candidate directions.
- The `tailrocks-research` skill reads the findings as its starting evidence, then goes
  deeper on the confirmed direction and turns the whole thing into the detailed
  plan.
