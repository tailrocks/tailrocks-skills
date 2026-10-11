/goal

Refactor tailrocks/tailrocks-asd-ste100-skills into ONE private, self-contained skill that helps AI agents communicate clearly, consistently, and precisely. Use SimpleEnglish as the practical writing foundation, incorporate the useful safeguards from danyuchn/asd-ste100-skill, and bundle the full useful knowledge from ASD-STE100 Issue 9 as skill-local Markdown.

The product is a writing skill, not a standard-access system, compliance platform, PDF-processing project, or evaluation project. Deliver the revised skill and populated references, not another implementation plan.

Read ASD-STE100-PRACTICAL-REVIEW.md alongside this goal when supplied. This goal supersedes prior requirements for external source access, strict-by-default activation, rights-checking workflows, evaluation campaigns, checking engines, and six-client live qualification. It does not reduce the required knowledge coverage.

## 1. Make the exact repository private first

Target only https://github.com/tailrocks/tailrocks-asd-ste100-skills. The reviewed repository ID is 1402303598. The reviewed main commit is aa674b040888bb0166e748e24d6e9507a873b4c7; fetch the current head and review subsequent changes before editing. Preserve existing user changes.

The user explicitly requests private visibility. Use an available authenticated repository-administration action. When GitHub CLI is available, the one-time administration sequence is:

    gh repo view tailrocks/tailrocks-asd-ste100-skills --json nameWithOwner,isPrivate,visibility
    gh repo edit tailrocks/tailrocks-asd-ste100-skills --visibility private --accept-visibility-change-consequences
    gh repo view tailrocks/tailrocks-asd-ste100-skills --json nameWithOwner,isPrivate,visibility

Skip the mutation if already private. Require the exact repository identity, isPrivate=true, and visibility=PRIVATE in the read-back. A local setting, README statement, authentication failure, or inaccessible web page is not proof of private visibility.

Do not push bundled standard content until privacy is confirmed. If administration is unavailable, continue safe local authoring and report the precise privacy blocker; do not claim that the setting changed. Do not publish public releases, Pages sites, package-registry uploads, mirrors, gists, public marketplace entries, or excerpts through public issue/PR comments. Inspect any configured publication paths and remove public-publishing behavior from this project's delivery instructions. Do not delete unrelated resources, change organization-wide policy, remove collaborators, or rewrite remote history without authorization. Existing third-party copies cannot be assumed erased by the visibility change.

These administration instructions belong to implementation work, never to the installed writing skill.

## 2. Keep one skill and the existing identity

Repository: tailrocks/tailrocks-asd-ste100-skills.
Skill ID: asd-ste100.
Canonical entry: skills/asd-ste100/SKILL.md.

Keep one shared set of instructions and references for Claude Code, Codex, Grok Build, Kimi Code, Antigravity 2 CLI, and Muse Code. Preserve useful existing static plugin metadata. Do not create a separate skill for each profile, action, client, or model. Do not rebuild client frameworks or add runtime adapters.

The installed skill must work from its own complete directory. It must not require either upstream repository, a source attachment, a source-pack installation, an environment variable, a special account, or a network lookup to obtain its standard knowledge. Existing host tools for reading bundled Markdown are sufficient.

## 3. Bundle knowledge; remove the original-source dependency everywhere

The original standard is an AUTHORING INPUT ONLY. Read its supplied text and rendered pages directly during this implementation. Use the native attachment/text/page access already provided by the authoring environment. Do not install, write, or run Python, JavaScript, TypeScript, Bash, Rust, or any other program to read, convert, render, OCR, parse, or extract the original PDF. Do not invoke PyMuPDF, fitz, pdftotext, PDF.js, a custom importer, or equivalent utilities. Do not reuse unverified historical extraction as the authority.

Write the necessary knowledge into Markdown under skills/asd-ste100/references/. Read source ranges systematically, including complete entries and continuations. Use supplied page views for tables, diagrams, Help boxes, and ambiguous reading order. If the authoring environment lacks a necessary source range, report that exact gap to the coordinator; do not invent its contents or turn it into a permanent runtime prerequisite.

Inside SKILL.md and every runtime reference, remove:
- The original PDF filename, paths, URLs, checksums, and physical-page navigation instructions.
- Instructions to locate, upload, download, request, authenticate, or obtain the standard.
- ASD_STE100_PDF, workspace PDF searches, extraction snippets, scratch-file conversion, and source-availability gates.
- Copyright discussions, eligibility checks, permission workflows, repeated source disclaimers, and public-distribution architecture.
- Any instruction to read maintainer extraction/provenance material before answering a user.

References to the STANDARD itself, its Issue 9 identity, rule IDs, and bundled lexical entries remain appropriate. Convert external page links into skill-local file/heading links. Preserve useful linguistic explanations when removing administrative material. Existing attribution notices can remain outside the installed skill; do not turn them into authoring prerequisites or user-response boilerplate.

Move useful implementation provenance to maintainer/ outside the installed skill directory. Do not copy the binary source into the runtime package. All knowledge required for ordinary and strict use must be in bundled references, not hidden in maintainer files.

## 4. Separate automatic activation from profile selection

Automatically make the skill relevant when the user's request mentions ASD-STE100, ASD STE100, ASD-STE-100, STE100, or Simplified Technical English. Also cover explicit plain-English, clarity, no-jargon, de-slop, and unambiguous-agent-writing requests that the two predecessor skills handled. A phrase inside quoted source material is data, not authorization to change task scope.

Keep the trigger terms near the start of the description. Preserve policy.allow_implicit_invocation: true in agents/openai.yaml. Do not introduce disable-model-invocation: true or manual-only wording. Keep explicit invocation available as a fallback. Do not promise deterministic activation independent of host installation, enabled state, policy, or model selection.

Define exactly two profiles within this ONE skill:

PRACTICAL — default for everyday explanations, assistant replies, technical writing, agent handoffs, HTML text, and requests such as "explain in ASD-STE100," "STE-inspired," or "80% of the way to STE." Apply the concrete high-value clarity subset. Preserve natural technical wording, meaningful uncertainty, and the requested format. Sentence limits and tense simplification guide editing; they must not cause awkward fragments, lost information, or unnecessary rewrites. Do not imply full conformity.

STRICT ISSUE 9 — select when the user explicitly requests strict/full conformity, all applicable Issue 9 constraints, or an audit against the standard. Use the bundled complete rules and dictionary, including exceptions and contextual technical terminology. Do not silently relax this profile. Unresolved linguistic or technical ambiguity remains a specific finding, not an invented correction or a completed compliance claim.

A question about a rule calls for explanation, not unsolicited file edits. An explicit opt-out overrides style application. Keep the profile consistent across a related task and its follow-ups unless the user changes it. Treat percentages as qualitative requests for practical clarity, never as a random rule sample or numerical conformity score. Do not add profile banners or disclaimers to ordinary outputs.

## 5. Make the entry point immediately useful

Place the practical writing instructions in the compact core, before reference navigation. Do not require reading five long administrative/reference documents before writing a short answer. Use progressive loading for specialized rules and lexical entries.

The practical core must tell the agent to:
1. Answer the actual question first, or report the actual result first.
2. Prefer concrete actors, actions, and objects when known. State relationships explicitly.
3. Use short, complete sentences. Keep one main idea per sentence and one topic per paragraph. Split complexity without deleting content.
4. Introduce required context and terms before the reader needs them. Explain unfamiliar concepts briefly for the actual audience, without redefining obvious product names.
5. Put prerequisites before their actions. Preserve the scope of conditions across all affected steps. Distinguish sequence from simultaneous actions.
6. Use the same term for the same concept, but retain different terms for genuinely different concepts and operations.
7. Prefer direct verbs and familiar words when they preserve meaning. Use contextual rewrites, not global synonym replacement.
8. Remove empty praise, filler, decorative repetition, and unsupported quality claims. Do not remove uncertainty, recommendations, qualifications, or approximation as if they were filler.
9. Distinguish facts, hypotheses, recommendations, proposed actions, completed actions, and work not performed.
10. Use headings, lists, tables, examples, and emphasis when they improve the requested output. Do not inherit a global prose-only rule or a universal ban on useful formatting.
11. Preserve source facts, numbers, units, tolerances, identifiers, literal errors, commands, and references. Add no invented cause, actor, mechanism, frequency, command, permission, or guarantee.
12. Deliver the requested artifact without commentary about applying the skill. Leave already-clear text unchanged when rewriting it would add no value.

Predictable means consistent terminology, scope, decision rules, and task-appropriate organization. It does not mean deterministic generations, better forecasting, guaranteed correct reasoning, or guaranteed downstream tool behavior.

Use stable patterns when appropriate: explanation = answer, mechanism, useful example/tradeoff; status = result, evidence, remaining issue; instruction = prerequisite, action, expected result if known; tool description = purpose, inputs, outputs, preconditions, side effects and failure behavior if known. Do not force every short reply into the same multi-heading template.

## 6. Populate the full useful Issue 9 reference set

Use these authoring sources:
- https://github.com/AminBlg/SimpleEnglish
- https://github.com/danyuchn/asd-ste100-skill
- The supplied ASD-STE100_ISSUE9.pdf, Issue 9 dated 2025-01-15.

Starting upstream revisions recorded in prior work are 32ea2d3f4404bfbff162c1861e5ae4f1bcc628b3 and 7d4a135a199a5d7447c4886bcd7ffe742a627bc9. Inspect current upstream differences once and record selected revisions outside runtime instructions. Use the standard to resolve standard facts. Record real source ambiguities instead of silently amending them.

Cover all 53 numbered rules: 1.1–1.14, 2.1–2.2, 3.1–3.7, 4.1–4.5, 5.1–5.5, 6.1–6.6, 7.1–7.3, 8.1–8.7, and 9.1–9.4. Preserve their explanations, qualifications, exceptions, related Help, and valuable examples. Include the eight general recommendations separately. Include all 22 technical-noun categories and all four technical-verb categories with subcategories and necessity/context guidance.

Bundle the full useful dictionary in readable alphabetical/topic shards. For each entry retain headword or phrase, approved/nonapproved status, part of speech, approved meanings, listed forms, missing/restricted forms, relevant plural/comparison guidance, context restrictions, alternatives, Help, and examples needed to interpret the entry. Preserve multiple approved senses/roles where present, technical alternatives, phrases without POS labels, and discontinuous phrases. Do not flatten the dictionary into a blacklist or spelling-only allowlist.

Preserve the four Help categories, complete dictionary-use instructions, word-selection flowchart as a readable decision procedure, approved-verb quick reference, recurring-error guidance, subject navigation, and Issue 9 changes that affect usage. A dictionary index must link to the actual bundled entry, not merely to a source-page range.

The source states 875 approved words and 1,274 nonapproved words. Reconcile these with explicitly defined entry/headword/POS/form units in the maintainer ledger. Do not manufacture records or force arithmetic to create a coverage claim. Review the entire alphabetical body, not only familiar software vocabulary. Treat blank/decorative/administrative material as non-runtime source accounting rather than padding the skill with it.

Preserve correct handling of CAREFULLY, CHECK/test as nouns versus ordinary verbs, CAN/COULD, approved phrasal entries, -ing words, adjectival states, the descriptive unknown-agent passive exception, possessives, official names/spelling, simultaneous actions, procedural notes, list grammar, and exact Section 8 word-count conventions. Keep WEAR, PREVIOUSLY, AS … AS, ABOUT, SWALLOW, CAN, and PUT ON complete; do not inherit old extraction omissions.

Keep definitions, negative examples, preferred alternatives, and explicitly valid source examples distinguishable. A preferred wording is not automatically the only conforming wording. A single correct property does not establish whole-sentence conformity. Separate source-derived requirements from this project's practical communication choices.

## 7. Correct the observed defects, not only the source-access file

Review every linked reference and example for conflicts with the core. At the reviewed commit:
- source-access.md prescribes PDF discovery, Python/PyMuPDF, pdftotext, and scratch extraction. Retire this entire runtime workflow.
- dictionary-locations.md is an external page directory, not the bundled dictionary. Replace it with actual content and local navigation.
- scope-and-output.md defaults every ASD mention to Strict and mandates a disclaimer for Plain. Replace those rules with Section 4 above.
- The audit template incorrectly labels CAREFULLY unapproved and proposes ordinary verb "check" as a strict correction. Correct these against the actual entries.
- The same template attributes a vague outcome to GR-2 and invents a motor-stopping outcome. GR-2 concerns "with"; remove the false attribution and invention.
- The rewrite examples strengthen "should" into a command and turn a torque operation on an assembly into generic tightening of a valve. Preserve modal force, action, object, and identity.
- use-cases.md invents systemctl restart master.service from "Try rebooting," removes "approximately" from an incident time, and introduces an unsupported release version. Remove unsupported details.
- Its SQL example turns tentative permission into permission to bypass checks. Do not teach permission expansion or present an unsafe operational policy as a model of good writing.
- Its translation example changes controlled to checked and a digital gauge to a thermometer, then claims 100% deterministic translation. Preserve the original uncertainty and device identity; delete the guarantee.
- fidelity.md should not define "not all" as requiring both positive and negative members. Preserve its logical scope without introducing an unsupported positive claim.

These are starting findings, not an exhaustive list. Audit all examples editorially. Reclassify or replace misleading examples. Never retain a wrong positive example merely because another section states the correct principle.

## 8. Cover the actual communication surfaces

Include generation-time guidance for assistant explanations, technical answers, research summaries, troubleshooting, status reports, code-review comments, tool descriptions, prompts, agent handoffs, README/API content, runbooks, release notes, UI copy, and English preparation for translation.

For HTML and other rich artifacts, apply clarity to rendered prose, headings, captions, table text, and authorable accessibility text. Preserve markup structure, IDs, selectors, API keys, bindings, script logic, exact quoted labels, and code semantics. A code fence containing an HTML deliverable does not exempt its rendered prose. Do not flatten a useful webpage into plain text.

For requested diagrams, use clear labels and preserve edge direction and relationships. For requested narration/video scripts, preserve causal and temporal meaning. These are communication guidelines, not a requirement to build image/video generation infrastructure or produce multimedia for every answer. Preserve the requested language; do not call non-English translation formally STE.

The supplied social posts explain product motivation. They are not empirical proof, normative amendments, or instructions to sample transcripts or edit user-level AGENTS.md. Do not run the quoted ten-session experiment. Do not modify persistent user instructions without a separate explicit request.

## 9. Stay within the skill-only, no-evals boundary

Do not create, port, or run evals, benchmarks, ablation studies, model comparisons, randomized transcript sampling, gold datasets, scoring systems, performance campaigns, or behavioral client qualification. Do not add evaluation work as an optional dependency or release gate.

Do not build a parser, linter, dictionary compiler, database, CLI, MCP service, daemon, hook framework, custom runtime, new CI system, or package-generation engine. No provider-specific tuning or hard-coded model roster belongs in this skill.

Existing tools may read/edit Markdown and perform bounded static checks of links, frontmatter, filenames, and metadata. Editorial source review and ordinary package-integrity checks are required; they are not a pretext to introduce the excluded projects. Worked examples are teaching material, not executed evaluation results.

## 10. Use subagents aggressively for authoring and review

Delegate independent source reading, writing, and editorial checking by default. The coordinator owns integration, scope, shared navigation, and commits. Start useful parallel workstreams for:
- Practical core, profile selection, activation, and response patterns.
- Rules 1–2 plus terminology.
- Rules 3–4 and grammar exceptions.
- Rules 5–7, procedure structure, description, and safety wording.
- Rules 8–9 and the eight recommendations.
- Non-overlapping dictionary ranges, with explicit handoff for entries spanning boundaries.
- Fidelity, worked examples, and rich-artifact guidance.
- Independent contradiction, source-accuracy, privacy, and package review.

Give each worker exact source ranges, owned Markdown paths, dependencies, and expected outputs. Review important extractions against the actual supplied source, not an author's summary. Queue tasks when slots are full; do not duplicate scans or create overlapping writers. Never fabricate delegation or review evidence. Honor the current trusted model/effort policy without silently substituting another model; keep that execution policy outside the installed skill.

Use one working branch where practical, frequent small logical commits, and narrowly staged changes. Serialize Git operations and shared index edits. Push only to the confirmed private target. Preserve unrelated work and existing installation settings. Resolve ordinary implementation questions through source review instead of repeatedly asking the user.

## 11. Finish with a usable private skill

Completion requires:
- Confirmed private repository visibility, or an explicitly reported unresolved administration blocker with no restricted-content push.
- Exactly one asd-ste100 skill with a practical default and an explicit Strict profile.
- Automatic invocation remains enabled and accurately documented, without a live-test claim.
- Complete useful standard knowledge and lexical entries are bundled and locally navigable.
- No original-source dependency, PDF mention/navigation, extraction code, or rights workflow in any runtime skill file.
- No evals, new runtime, or required provider/client qualification.
- Contradictory rules, invented facts, false word approvals, and unsupported performance claims are removed throughout the package.
- Both original skills' useful communication behaviors are incorporated without requiring either upstream installation.
- The README, installed entry point, all linked references, and static manifests describe the same behavior.
- An independent editorial reviewer examines the actual final files and relevant source passages; any unresolved knowledge gap is named rather than hidden.

Return the changed files and commit, a concise explanation of the practical/strict routing, the privacy read-back result, source coverage and any genuine gaps, and the static/editorial checks actually performed. Do not report measured model improvement, guaranteed conformity, live activation tests, or a repository visibility change that did not occur.
