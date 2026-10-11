# Usage

The `asd-ste100` skill has one task: make technical information
clear, precise, and easy to understand on first reading. Read the
skill body at `skills/asd-ste100/SKILL.md` for the full procedure.

## Select the skill

Use the selector of the installed client. See `installation.md` for
the exact install of each client. The rewrite task shows the shape on
each client:

```text
/asd-ste100-skill:asd-ste100 Rewrite this server upgrade procedure.
$asd-ste100 Rewrite this server upgrade procedure.
/skill:asd-ste100 Rewrite this server upgrade procedure.
/asd-ste100 Rewrite this server upgrade procedure.
```

The first form fits Claude Code. The second form fits Codex. The
third form fits Kimi Code. The fourth form fits Muse, Antigravity,
and Grok pickers. OpenCode has no slash picker: request the skill
by name in the prompt. Amp has no slash invoke: ask the thread
for the exact qualified skill by name.

Automatic selection also works. When the request mentions ASD-STE100
or asks for plain, clear technical English, the client can load the
skill without an explicit command.

## Profiles

The skill uses exactly two profiles. They stay distinct on every
task.

Practical clarity is the default. Use it for everyday technical
answers, assistant responses, agent handoffs, HTML text, and requests
for STE-inspired writing. It applies the 12 practical writing
principles and keeps natural technical vocabulary. It never claims
formal standard conformity.

Strict Issue 9 applies only on explicit request. Use it when the
user asks for strict or full ASD-STE100 conformity, all Issue 9
constraints, or a formal audit. It applies all 53 numbered rules,
strict dictionary lookup, and exact word-counting conventions.

A question about the standard calls for explanation, not unsolicited
edits.

## Actions

| Request | Action |
| --- | --- |
| Write or convert text | Write or Rewrite |
| Audit text without edits | Check |
| Clarify a rule or entry | Explain |
| Standardize project terms | Glossary |
| Prepare text for translation | Translation-Prep |

A Check never edits user files. It reports findings with
the governing rule and a proposed correction.

## Example: rewrite a procedure

Invoke the skill with the Practical default:

```text
/asd-ste100-skill:asd-ste100 Rewrite this server upgrade procedure.
```

The skill returns the rewritten procedure directly. Conditions come
before commands. Each step uses the imperative form. The skill keeps
numbers, code, commands, and uncertainty from the source.

## Example: audit a description

Invoke the skill with an explicit Strict request:

```text
$asd-ste100 Strict audit of this safety section. Report only, no edits.
```

The example uses the Codex selector. The selector list above shows
the form of each client.

The skill returns a finding report. Each finding names the violated
rule, quotes the affected text, and proposes a correction. Words
outside the bundled dictionary coverage go to the authorized Issue 9
copy before a strict verdict. See
`skills/asd-ste100/references/source-access.md` for that method.

## Fidelity boundary

The skill never sacrifices technical truth for brevity. It keeps
obligations, recommendations, capabilities, and possibilities
distinct. It keeps conditions and the scope of negative instructions.
It keeps exact numbers, units, code identifiers, paths, and quoted
labels. When the source lacks a value, the skill keeps the
uncertainty and never invents a value.
