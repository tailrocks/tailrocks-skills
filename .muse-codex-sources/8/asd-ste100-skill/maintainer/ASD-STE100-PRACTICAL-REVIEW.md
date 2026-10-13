# ASD-STE100: private, self-contained, practical writing skill

**Review date:** 2026-10-03  
**Repository:** `tailrocks/tailrocks-asd-ste100-skills`  
**Reviewed main:** `aa674b040888bb0166e748e24d6e9507a873b4c7`  
**Decision:** keep one `asd-ste100` skill; replace external-source administration with bundled knowledge and a practical default.

This is a repository review and implementation reference. The companion `ASD-STE100-SELF-CONTAINED-GOAL.md` directs the implementation. Neither file is an installed skill, a completed dictionary extraction, or an evaluation result.

## 1. What the review establishes

The current repository has a useful foundation: one skill entry, explicit natural-language triggers, enabled Codex implicit invocation, subject-specific references, protected-content instructions, and a core instruction to preserve uncertainty and technical meaning. These should be retained. [R1, R2]

The main mismatch is architectural and editorial. The installed workflow is centered on strict standard application and external dictionary consultation. The user's objective is a readily useful communication skill with all knowledge already available inside its directory. The core and several linked examples also contradict one another. [R1, R3–R8]

The review inspected the entry point, activation metadata, README, reference index, source-access and dictionary-navigation paths, scope/output definitions, practical use cases, fidelity guidance, and source-lineage material. Selected claims were checked against the supplied standard text. This was source review, not a live-client test or exhaustive verification of every dictionary entry.

### Repository privacy: actual status

GitHub reported `private: false`, `visibility: public`, and repository administration permission for the connected account. The available connector exposes read operations but no repository-settings mutation; the local environment has no GitHub CLI and cannot resolve the GitHub host for a local Git workflow. Therefore **visibility was not changed**. No repository file was modified or pushed as part of this review.

The implementing agent must change the exact repository to private and verify the resulting state before pushing bundled standard material. Use the documented GitHub administration operation, not an invented skill metadata setting. A successful private transition does not retract existing copies or automatically privatize detached public forks. [G1, G2]

## 2. Findings and required changes

### F0 — Public repository: privacy action still required

**Evidence:** repository metadata was public during review.  
**Required change:** private visibility, followed by a read-back of the exact repository identity and state. Keep delivery private. Do not turn this into organization-wide permission changes or deletion of unrelated resources.

### F1 — The runtime explicitly uses the original PDF and extraction tools

**Affected files:**
- `skills/asd-ste100/SKILL.md`, “Consult the actual references.”
- `skills/asd-ste100/references/source-access.md`, Sections 1–3.
- `skills/asd-ste100/references/dictionary-locations.md`, Section 1.
- `skills/asd-ste100/references/index.md`, source-governance and dictionary reading paths.

The entry point loads source-access guidance and directs the agent to find entries in an authorized external source. The access reference searches `ASD_STE100_PDF`, the task context, and the workspace. It includes PyMuPDF code, `pdftotext` commands, and a scratch-file extraction workflow. Merely having no `.py` files does not make those runtime instructions dependency-free. [R1, R3, R4, R5]

**Required change:** extract the knowledge at authoring time and ship it as Markdown. Remove the access architecture, original-source references, extraction instructions, and fallback requests from every file in the installed skill. Keep any useful maintainer provenance outside that directory. Do not replace extraction scripts with scripts in another language.

### F2 — Dictionary navigation is not a bundled dictionary

The current reference is a letter/page directory. Its entries often identify a page boundary or a word appearing in an alternative column, rather than supplying a complete lexical record. The runtime explicitly requires another source to determine actual meanings and permitted use. [R3, R4]

**Required change:** bundle full lexical records, with local alphabetical/topic navigation. Approval is attached to part of speech, form, sense, and context—not only to a spelling. Preserve the four Help categories and the distinction between a dictionary entry, an alternative, and an example. [STD: dictionary introduction, physical pp.131–143]

### F3 — Activation is incorrectly coupled to Strict mode

`SKILL.md` says to use plain language only when explicitly requested. `scope-and-output.md` makes every ASD mention select Strict and requires a mandatory Plain-profile disclaimer. That is the opposite of the practical subset described in the user's supplied use case. [R1, R6]

**Required change:** an ASD mention loads the skill; it does not automatically select maximum restriction. Default to Practical for ordinary responses, explanations, and “80% STE” requests. Select Strict only for explicit conformity/full-rule/audit requests. Keep both as profiles of one skill. Do not display a profile announcement for every answer.

### F4 — The output templates teach incorrect lexical decisions

The audit example labels `carefully` as unapproved, but the standard includes `CAREFULLY (adv)` with the meaning “In a careful manner” on physical p.185. It proposes ordinary verb `check` as a conforming correction, while the standard distinguishes `CHECK (n)` from nonapproved ordinary `check (v)` on pp.188–189. [R6; STD pp.185, 188–189]

It also associates a vague outcome with GR-2, although GR-2 addresses the preposition “with,” and replaces an unspecified system outcome with a motor-stopping outcome. This both misattributes the recommendation and invents content. [R6; STD p.124]

**Required change:** check all positive examples against their actual rule/entry, not only the prose surrounding them. An example should never contradict the rule it is teaching. Remove invented rule labels and count/percentage decorations that suggest unperformed verification.

### F5 — Several examples alter facts, authority, or operational meaning

Examples in `scope-and-output.md` and `use-cases.md` contain these specific problems:

| Observed transformation | Why it matters | Required repair |
|---|---|---|
| Advisory “should verify” becomes an imperative. | Recommendation strength changes. | Preserve recommendation or identify missing authority; do not silently strengthen. |
| An assembly “must be torqued” becomes generic tightening of a valve. | Both the target and operation change. | Preserve component identity and the torque operation. |
| “Try rebooting” becomes `systemctl restart master.service`. | The command, service name, and choice of target are new information. | Retain the uncertainty or state the unresolved recovery target. |
| “Approximately 03:15 UTC” becomes “At 03:15 UTC.” | False precision is introduced. | Preserve approximation. |
| A release rewrite adds version `2.4.0`. | An unsupported identity is introduced. | Remove it unless supplied in the scenario context. |
| Tentative permission to bypass validation becomes permission for SELECT queries. | Authorization is expanded and a risky policy is presented as a clean example. | Do not turn tentative language into permission; preferably use a benign teaching example. |
| “Controlled” becomes “checked”; a gauge becomes a thermometer. | The action and device identity are inferred rather than established. | Preserve the source, or explicitly identify the ambiguity. |

These are not merely tone preferences. They demonstrate that writing an excellent preservation rule in one file does not fix contrary examples in another file. The standard itself requires a replacement to retain the intended meaning. [R6, R7, R8; STD pp.47, 116–119]

The fidelity reference also glosses “not all” as “some do, some do not.” That is too strong: “not all” does not itself establish a positive member. Preserve the original logical scope. This is a reasoning correction to the repository's explanation, not a newly invented ASD rule. [R9]

### F6 — The references contain unsupported guarantees

Examples include “eliminate machine translation hallucination” and “100% deterministic translation.” The skill has no evidence for these promises. Even the entry point warns against claiming deterministic verification, so the loaded references contradict the core. [R1, R6, R8]

**Required change:** express these as design aims—clearer relationships, less ambiguity, stable terminology. Do not promise deterministic models, guaranteed translations, or a measured improvement. The user's quoted social posts supply motivation and anecdotes, not validation data.

### F7 — The useful writing core is buried under reference administration

The entry directs an agent through scope, index, source access, dictionary guidance, and terminology before applying the writing workflow. The index's quick route also requires multiple long reads. Several references repeat architecture, source labels, diagrams, and claims about themselves. [R1, R5]

**Required change:** put a compact practical core directly in `SKILL.md`. Make detailed rules and lexical entries available through one concise navigation file. Load only the relevant specialized material; do not concatenate the full standard for every sentence.

SimpleEnglish contributes useful directness, term explanation, condition-first instructions, and filler removal. The donor contributes strong preservation of confidence, scope, and precision. Transfer those behaviors, not their blanket substitutions, broad formatting bans, scripts, or omitted-dictionary limitations. [B1, D1]

### F8 — Rich artifacts need their own writing-scope guidance

The current entry preserves format, which is good, but its enumerated use cases focus on conventional technical documents. The user's examples explicitly include HTML artifacts and other explanatory formats. [R1, R7, R8; user-supplied quotations]

**Required change:** explain how the same language guidance applies to rendered and accessible text without altering code, structure, bindings, or technical meaning. This is a project adaptation, not a claim that Issue 9 defines an HTML authoring system. The standard expressly separates content expression from visual formatting. [STD p.36]

## 3. Product contract

### One identity

Keep `tailrocks/tailrocks-asd-ste100-skills`, the public skill ID `asd-ste100`, and the canonical entry `skills/asd-ste100/SKILL.md`. “Public skill ID” here means the agent-visible command identity, not public repository visibility. The repository and distribution remain private.

### Two profiles, selected predictably

| Request | Profile/action | Behavior |
|---|---|---|
| “Explain this in ASD-STE100.” | Practical explanation | Answer clearly using the high-value subset, without a compliance report. |
| “80% STE,” “STE-inspired,” or “plain English.” | Practical | Same explicit practical policy; not a random selection of rules or a measured percentage. |
| “Make this fully compliant with Issue 9.” | Strict rewrite | Apply all applicable rules and bundled lexical guidance; preserve technical meaning. |
| “Check against all ASD-STE100 rules.” | Strict check | Report supported findings without editing files. |
| “Explain Rule 3.6.” | Standard explanation | Explain the rule and its unknown-agent exception; do not rewrite unrelated content. |
| “Do not apply STE to this quotation.” | Protected scope | Preserve the quotation and its requested role. |

Use context for follow-ups. A word found inside a document or social-post quotation does not authorize hidden changes to the host's configuration or the user's files.

### Practical clarity subset

These are explicit product choices grounded in the sources, not an alleged official “80% STE” profile:

| Behavior | Source relationship | Boundary |
|---|---|---|
| Answer/result first. | SimpleEnglish reply behavior. | Do not manufacture a result or suppress necessary qualification. |
| Concrete known actors and direct actions. | Rules 3.6–3.7, 4.1. | Unknown actors remain unknown; do not invent causality. |
| Short complete sentences and one main topic. | Rules 4.1–4.2 and Section 6. | Preserve grammar and substance; Practical limits guide revision rather than force truncation. |
| Conditions before their actions. | Rule 5.4. | Keep scope across all governed steps; preserve “if” versus “only if.” |
| Stable terminology for the same concept. | Rules 1.11, 6.2, 9.4. | Different operations are not automatically synonyms. |
| Brief first-use explanations when needed. | Base skill's audience guidance. | No mandatory definition of every product name or familiar term. |
| Direct verbs and familiar wording. | Rules 3.7, 9.1 plus base style. | A plain-looking verb is not automatically approved for Strict. |
| Remove empty filler and unsupported praise. | Both source skills' writing preferences. | Do not erase confidence, approximation, recommendations, or meaning-bearing adjectives. |
| Preserve facts and protected content. | Rule 9.1 and donor safeguards. | Preserve commands, labels, numbers, units, and technical identity. |
| Use useful visual structure. | User's requested output contract; standard does not govern general typography. | Do not impose prose-only output or flatten HTML. |
| Distinguish observed, inferred, planned, and completed. | Project adaptation of fidelity. | No claims of execution without evidence. |
| Deliver the artifact, not a skill-use report. | Both sources' output-only guidance. | Specific unresolved facts can require a short, separate note. |

## 4. Source content to bundle

The full knowledge requirement is independent of the default profile. Practical need not apply every formal restriction, but Strict must not depend on an unavailable external dictionary.

### Writing-rule coverage

| Section | Rule IDs | Required content |
|---|---|---|
| Words | 1.1–1.14 | Core vocabulary, POS, approved senses/forms, terminology categories, naming consistency, qualified spelling rules. |
| Multi-word nouns | 2.1–2.2 | Actual noun groups, official names, first-use long forms, meaningful hyphens and short forms. |
| Verbs | 3.1–3.7 | Listed forms, tenses, adjectival states, auxiliary restrictions, permitted -ing uses, unknown-agent passive, direct action wording. |
| Sentences | 4.1–4.5 | Clarity, complete grammar, list grammar/punctuation, connective relations, articles and modifier scope. |
| Procedures | 5.1–5.5 | 20-word limit, concurrent/coupled actions, imperative, condition scope, notes and attached results/limits. |
| Descriptions | 6.1–6.6 | Gradual information, key terms, 25-word limit, topic paragraphs and grammatical sentence counts. |
| Safety | 7.1–7.3 | Contextual signal words, clear condition/action, supported risk/result explanation. |
| Punctuation/counting | 8.1–8.7 | Semicolons, legitimate hyphens, seven parenthesis purposes, vertical-list units, parentheses, special counted elements. |
| Writing practices | 9.1–9.4 | Meaning-preserving reconstruction, context-sensitive word use, approved phrasal exceptions, consistency. |
| General recommendations | GR-1–GR-8 | That, with, pronouns, this, false friends, Latin abbreviations, inclusive wording, possessives; distinguish recommendations from numbered rules. |

Authoring source ranges are physical pp.45–128. The scope/introduction appears on pp.35–42. These locators belong in this implementation reference and the maintainer ledger, not in the installed skill's navigation.

### Dictionary coverage

Read the entire body, physical pp.149–434, together with the introduction on pp.131–148. Each bundled record needs its actual meaning-bearing contents, not simply its location:

- Headword or phrase, approval status, and part of speech.
- Every approved sense and relevant usage context.
- Listed forms, missing forms, and applicable plural/comparison guidance.
- Suggested alternatives, their roles, and when a different sentence construction is necessary.
- All relevant Help content, preserving the four categories and restrictions.
- Examples and counterexamples needed to understand the permitted use.
- Local cross-references to the corresponding rule and related entries.

Preserve complete records across source page boundaries. Separate examples from definitions, alternatives from headwords, and base-form approval from derived-form approval. Do not assume one spelling has exactly one approved role or meaning: the source expressly gives exceptions such as CLEAN and FLUSH. [STD pp.47, 121, 131–143]

The dictionary's published 875 approved and 1,274 nonapproved word totals are reconciliation inputs, not measured extraction completeness. A headword/POS record, a sense, an inflected form, and an example are different counting units. Do not normalize away difficult entries or manufacture records to match totals. [STD p.131]

Include all 22 technical-noun categories and four technical-verb categories with their subcategories. The listed examples are not exhaustive, and an unfamiliar spelling is not automatically prohibited. Conversely, a technical term is not a blanket exemption for every context. [STD pp.49–61]

### Useful supporting material

Preserve the word-selection flowchart as a concise textual decision procedure, the approved-verb quick index, contextual recurring-error guidance, subject navigation, explanations of source example labels, and Issue 9 changes relevant to usage. Store the linguistic substance of explanatory diagrams, not merely a screenshot or a link to the original.

Do not fill runtime context with covers, blank pages, publication administration, copyright discussions, extraction history, or repeated evidence ledgers. Keep their source-accounting disposition outside the installed skill. Complete knowledge does not require complete reproduction of page furniture.

## 5. File-by-file migration

| Current path under `skills/asd-ste100/` | Target treatment |
|---|---|
| `SKILL.md` | Compact practical generation core, predictable profile routing, relevant reference navigation. |
| `agents/openai.yaml` | Keep implicit invocation true; update description/default prompt to match Practical default. |
| `references/source-access.md` | Remove from runtime. Preserve only useful authoring provenance outside the skill. No replacement access gate. |
| `references/dictionary-locations.md` | Replace with a local entry index and actual `references/dictionary/*.md` records. |
| `references/source-map.md` | Move page/provenance ledger to maintainer material. Keep useful subject-to-rule navigation in a local rule index. |
| `references/source-notes.md` | Split useful lexical/version cautions into appropriate runtime references; move extraction history outside the skill. |
| `references/index.md` | One short task-to-reference navigation table. No mandatory administrative reading path. |
| `references/scope-and-output.md` | Rewrite profile selection, scope, output contracts, and faulty examples. Remove boilerplate disclaimers and guarantees. |
| `references/fidelity.md` | Retain invariants, correct logical glosses, shorten repeated prose, and align every example. |
| `references/use-cases.md` | Retain useful domains, repair examples, add clear agent-response and rich-artifact guidance. |
| `references/examples.md` | Source-check/rewrite every positive example. Use truthful property-specific labels. |
| Existing nine subject references and `general-recommendations.md` | Retain and correct substantive content. Remove source-file directions and duplicated administration. |
| `references/terminology.md` | Keep complete contextual categories and examples, not a software-only allowlist. |
| `references/dictionary-guide.md` | Describe the bundled entry format and selection procedure, not the original file layout as a runtime task. |

Keep README and static manifests aligned. Installation uses a private checkout or private authenticated distribution and copies the entire skill directory. Do not require a separate upstream installation or new public marketplace.

### Suggested runtime layout

```text
skills/asd-ste100/
  SKILL.md
  agents/openai.yaml
  references/
    index.md
    scope-and-output.md
    practical-writing.md
    words.md
    multi-word-nouns.md
    verbs.md
    sentences.md
    procedures.md
    descriptions.md
    safety.md
    punctuation-and-counting.md
    writing-practices.md
    general-recommendations.md
    terminology.md
    fidelity.md
    agent-responses.md
    rich-artifacts.md
    use-cases.md
    examples.md
    dictionary-guide.md
    dictionary/
      index.md
      approved-verbs.md
      recurring-errors.md
      a.md ... w.md yz.md
maintainer/
  source-ledger.md
  extraction-progress.md
```

The `a.md ...` notation is a layout illustration, not permission to deliver empty files. Choose manageable lexical shards with explicit local links. A missing letter need not have invented entries. Keep each entry coherent.

## 6. Starter for the installed skill

This block is a proposed runtime entry, not a completed skill. Its referenced files must be populated and all metadata kept consistent. It deliberately contains no original-file dependency or publication-administration instructions.

```markdown
---
name: asd-ste100
description: >-
  Use when the user mentions ASD-STE100, ASD STE100, ASD-STE-100, STE100,
  or Simplified Technical English, or requests plain English, clearer
  explanations, less jargon, or unambiguous agent instructions. Improve
  assistant responses, technical documents, and text in rich artifacts.
  Use Practical clarity by default, including for STE-inspired or 80%-STE
  requests. Use Strict Issue 9 when full conformity or a standard audit is
  explicit. Preserve meaning, uncertainty, conditions, numbers, and code.
  Explain questions about the standard without unsolicited edits.
metadata:
  standard: "ASD-STE100 Issue 9 (2025-01-15)"
---

# ASD-STE100

Make the requested information easy to understand on the first reading.
Use this skill for the relevant task and its follow-ups, not unrelated work.
Respect the user's scope, language, format, and explicit opt-outs.

## Choose the action and profile

Write or explain when the user asks for new content. Rewrite only the
specified material. Check without editing when the user asks for a review.
A question about a rule calls for an explanation of that rule.

Use Practical by default. Use Strict Issue 9 only for explicit strict/full
conformity or an audit against the standard. A request for "80% STE" means
practical clarity, not a numerical score or random subset. Do not announce
the profile unless it matters to the requested assessment.

## Write clearly from the start

1. Give the answer or actual result first.
2. Use concrete actors, actions, and objects when known.
3. Keep sentences short and complete. Give each sentence one main idea and
   each paragraph one topic. Preserve necessary context and qualifications.
4. Introduce unfamiliar concepts briefly before the reader needs them.
5. Put prerequisites before actions. Keep conditions attached to every
   action they govern. Preserve simultaneous actions and action-result links.
6. Use one term for the same concept. Do not merge different operations.
7. Prefer direct verbs and familiar wording when the meaning stays intact.
8. Remove empty praise, filler, and repetition. Keep meaningful uncertainty,
   approximation, recommendations, and limitations.
9. Separate facts from hypotheses and completed work from planned work.
10. Preserve useful headings, tables, lists, captions, and the requested
    output format. Return the artifact, not commentary about this skill.

## Preserve meaning

Keep actors, objects, negation, quantities, modality, conditions, exceptions,
time, concurrency, sequence, comparators, units, tolerances, and references.
Never add a cause, measurement, command, permission, identity, or guarantee
that the source does not support. Do not turn recommendations into orders
or "if" into "only if." Preserve exact existing code and quoted labels.
Read `references/fidelity.md` when a rewrite involves these distinctions.

## Use the bundled knowledge

Use `references/index.md` to find the relevant writing rules and examples.
Use `references/dictionary/index.md` for complete lexical entries, including
parts of speech, meanings, forms, restrictions, Help, and alternatives.
Read the complete relevant entry rather than inferring approval from spelling.
Use `references/terminology.md` for contextual technical nouns and verbs.

For Strict Issue 9, apply all relevant rules and their exceptions. Use
`references/punctuation-and-counting.md` for sentence limits and special
counting conventions. Do not ban all phrasal verbs, -ing words, COULD,
possessives, or adjectival states. Do not invent actors to remove passive
voice. Do not silently relax Strict or label unresolved wording conforming.

For HTML, diagrams, and narration, use `references/rich-artifacts.md`.
Apply clarity to meaningful reader-facing text without changing structure,
code behavior, identifiers, or relationships. For agent messages and tool
instructions, use `references/agent-responses.md`.

## Review and deliver

Re-read the result against the request, the source, and related context.
Keep facts, hypotheses, recommendations, and permissions distinct.
Leave already-clear material unchanged when no useful correction is needed.

For writing, return the requested content without a process report.
For review, give supported findings and specific corrections without edits.
Distinguish numbered rules, recommendations, practical style choices, and
technical-meaning concerns. Report a real unresolved issue briefly; do not
invent a solution or add a generic limitation to every answer.
```

### Codex metadata

```yaml
interface:
  display_name: "ASD-STE100: Clear Technical English"
  short_description: "Clear responses with practical and strict STE profiles"
  default_prompt: "Use $asd-ste100 to make this response clear and precise. Apply full Issue 9 constraints only when explicitly requested."
policy:
  allow_implicit_invocation: true
```

Keep the trigger description within the Agent Skills specification's 1024-character limit. Claude's manual-only switch must remain absent or false. Codex documents `allow_implicit_invocation` with a true default. These settings enable model-selected invocation; they are not a cross-client deterministic keyword engine. [H1–H3]

## 7. Rich artifacts and predictable agent communication

### HTML and interface text

Apply the selected writing profile to rendered prose, headings, captions, table descriptions, help text, and authorable accessibility strings. Preserve IDs, classes, selectors, bindings, schemas, executable strings, and exact labels quoted from existing interfaces. New UI wording is editable when the user requests it; exact existing labels cited as evidence are not interchangeable with new copy.

A generated HTML artifact inside a code fence still contains reader-facing prose. Do not exempt that prose because its container is code. Conversely, a semicolon in JavaScript or CSS is not a prohibited prose semicolon. Do not flatten a requested interactive artifact into a text-only response.

### Diagrams and narration

Choose clear labels and keep the same terms as the associated explanation. Preserve dependency arrows, temporal order, quantities, and conditions. Narration should explain relationships directly and retain uncertainty. Do not add animation, video APIs, narration services, or multimodal tooling as dependencies of this writing skill.

### Agent instructions and reports

Write explicit preconditions, scope, known inputs/outputs, and failure behavior. Do not invent a policy because it makes the prompt shorter. Distinguish proposed work from performed work, and actual results from predictions. A short status update can say that formatting passed while integration checks were not run; it must not summarize that state as “everything passed.”

Use response patterns flexibly. Predictability comes from stable meaning and clear organization, not forcing every answer into the same rigid template.

### The supplied quotations

The quotations motivate practical clarity, optional rich formats, and a selective default. They do not establish that the skill improves every model or makes execution deterministic. Their short summaries of the standard must not replace its qualifications: technical vocabulary is allowed, some words have multiple approved roles/senses, and alternatives are contextual suggestions. [STD pp.36, 47, 121, 137–143]

The quoted transcript-sampling prompt is not an instruction to run a study or edit persistent AGENTS.md in this task. No transcript collection or eval campaign is required.

## 8. Editorial completion, without an eval project

Use independent subagents to compare actual source passages and proposed reference content. Assign non-overlapping rule and dictionary ranges, with explicit continuation handoffs. Give one integrator ownership of navigation and metadata. Review practical usefulness separately from source fidelity so neither is lost.

Permitted checks are ordinary source review, frontmatter and path inspection, relative-link validation, duplicate-skill detection, and a bounded scan of the installed directory for retired source dependencies or extraction snippets. Use existing tools. Do not create a new test harness or label unexecuted teaching examples as results.

The final editorial checklist is:

- One skill with the intended ID, enabled implicit invocation, and a clear Practical/Strict distinction.
- Practical instructions immediately available in the core; specialized references loaded on demand.
- Complete useful rule and dictionary material physically bundled and locally linked.
- No original PDF references, source-access instructions, conversion code, or administrative gates in the installed skill.
- All important source exceptions and meaning-preservation rules retained.
- Incorrect positive examples and unsupported guarantees removed throughout.
- Same content distributed privately for the six intended clients through minimal existing metadata.
- No new engine, scripts for reading the standard, evals, benchmarks, paid model runs, or live-client qualification dependency.
- Privacy read-back and a truthful final account of editorial/static work and any remaining gaps.

This checklist is a completion contract for the work, not a declaration that those conditions already hold.

## 9. Sources and exact review locations

### Current repository: pinned review

Base URL: `https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/`

- [R1 — canonical skill](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/SKILL.md)
- [R2 — Codex invocation policy](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/agents/openai.yaml)
- [R3 — source access, Sections 1–3](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/source-access.md)
- [R4 — external dictionary location index](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/dictionary-locations.md)
- [R5 — reference index and mandatory reading paths](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/index.md)
- [R6 — profiles and faulty audit/rewrite examples, Sections 2–5](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/scope-and-output.md)
- [R7 — use cases 1–4](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/use-cases.md)
- [R8 — use cases 5–8](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/use-cases.md)
- [R9 — fidelity invariants and worked cases](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/fidelity.md)
- [R10 — repository README](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/README.md)
- [R11 — source lineage and changes](https://github.com/tailrocks/tailrocks-asd-ste100-skills/blob/aa674b040888bb0166e748e24d6e9507a873b4c7/skills/asd-ste100/references/source-notes.md)

### Writing sources

- [B1 — SimpleEnglish core, recorded starting revision](https://github.com/AminBlg/SimpleEnglish/blob/32ea2d3f4404bfbff162c1861e5ae4f1bcc628b3/skills/simple-english/SKILL.md). The default-branch file fetched during this review reported the same blob `18968a8a2c631b577327fde0271940335c6a375c` as the earlier starting revision.
- [D1 — donor core, recorded starting revision](https://github.com/danyuchn/asd-ste100-skill/blob/7d4a135a199a5d7447c4886bcd7ffe742a627bc9/SKILL.md). The default-branch file fetched during this review reported blob `35579a421ff9b93452ecaf9dd01bbe6e51decff3`, matching the earlier starting revision.
- STD — user-supplied `ASD-STE100_ISSUE9.pdf`, Issue 9, 2025-01-15. The attached source text/page views—not a newly executed extraction script—support the standard references in this review. Full source incorporation is work for the implementing agent, not a completed claim here.

### Primary documentation consulted

- [G1 — GitHub CLI repository edit and visibility flag](https://cli.github.com/manual/gh_repo_edit)
- [G2 — consequences of repository visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [G3 — GitHub CLI repository view and JSON fields](https://cli.github.com/manual/gh_repo_view)
- [H1 — Claude skill discovery and invocation controls](https://code.claude.com/docs/en/skills)
- [H2 — OpenAI skills and invocation policy](https://developers.openai.com/codex/skills)
- [H3 — Agent Skills format and progressive reference structure](https://agentskills.io/specification)

The official documentation is a source for static configuration, not evidence that this review executed the clients. Detailed six-client runtime qualification remains outside the requested scope.
