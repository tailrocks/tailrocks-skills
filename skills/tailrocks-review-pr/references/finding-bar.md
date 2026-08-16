# The finding bar

False positives erode trust faster than missed bugs: a reviewer who cries
wolf gets skimmed, and then the real finding dies with the noise. Quality
over quantity is not a preference here — it is what makes the review worth
reading. When uncertain whether an issue is real, it is not a finding.

## What clears the bar

A correctness finding is reportable only in one of three classes:

1. **The code will fail to compile or parse.** Syntax errors, type errors,
   missing imports, unresolved references — verified against the actual
   file, not assumed from the diff hunk.
2. **The code will definitely produce wrong results.** A logic error that
   is wrong regardless of input, or wrong on inputs the code is required
   to accept. "Wrong if the caller passes X" is reportable only when the
   code's own contract admits X.
3. **An unambiguous violation of a scoped rule.** The rule is quoted, the
   instruction file it came from is cited, and its scope contains the
   flagged file. A rule you cannot quote is an opinion.

Calibrate against the author's stated intent: the PR title, body, and
linked issues tell you what the change is *for*, and a finding that
misreads the intent is a false positive with extra steps.

## The kill list

Never flag these, in any lane, regardless of how thorough the requester
asked you to be:

- **Pre-existing issues.** The diff is the scope; blaming the change for
  code it did not touch buries the review.
- **Looks-wrong-but-correct code.** If the surrounding code, a comment, or
  a test explains why the suspicious shape is deliberate, it is not a
  finding.
- **Anything a linter or formatter will catch.** Do not run the linter to
  check; its findings are its job.
- **Pedantic nitpicks** a senior maintainer would not raise in review.
- **Style, naming, and formatting preferences** not codified in a scoped
  instruction file. "Extremely thorough" raises depth, never lowers this
  bar.
- **General quality concerns** — coverage percentages, hypothetical
  security posture — unless a scoped rule demands them for this file.
- **Explicitly silenced issues** — a lint-ignore or documented waiver on
  the line is the author's recorded decision; disagreeing with the waiver
  is a conversation, not a finding.
- **Potential issues contingent on unobserved state or inputs** you cannot
  demonstrate from the code in front of you.

A repository may extend this list via `.tailrocks/pr.md` `## Review`;
extensions add entries, they never remove these.

## Verification

Every candidate is re-derived before it is reported:

- **Bugs:** open the actual file, confirm the claimed symbol and flow
  exist as described, and walk the failing path end to end. "The variable
  is undefined" is verified by finding the scope it is missing from, not
  by re-reading the finder's summary.
- **Rule violations:** confirm the quoted rule exists, its file governs
  the flagged path, and the code actually breaches it — not a nearby rule,
  not a stricter reading than written.
- **Cross-file claims:** a finding that depends on code outside the diff
  is verified against that code, or dropped. Never report what you did not
  read.

The output of verification is binary: the finding survives with its
evidence attached, or it is dropped and listed under dropped candidates
with the reason. There is no "possible issue, low confidence" tier in the
report — hedged findings are the nit flood wearing a disguise.
