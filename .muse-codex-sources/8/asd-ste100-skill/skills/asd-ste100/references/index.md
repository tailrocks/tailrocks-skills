# ASD-STE100 Reference Index and Navigation Guide

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Architecture:** Unified Private Self-Contained Skill (`asd-ste100`)  
**Profiles:** Practical Clarity (Default) | Strict Issue 9 (Explicit Only)

---

## 1. Reference Architecture Overview

The `asd-ste100` skill provides a complete, self-contained reference library for writing, rewriting, checking, and explaining technical English. All references are bundled locally within the skill—no external standard downloads, PDF conversions, or executable linters are required.

```
                                [ SKILL.md ]
                                     |
               +---------------------+---------------------+
               |                                           |
    [ Core & Communication ]                     [ Rules & Fidelity ]
    - practical-writing.md                       - rules-index.md
    - agent-responses.md                         - fidelity.md
    - rich-artifacts.md                          - scope-and-output.md
    - use-cases.md                               - examples.md
               |                                           |
    +----------+----------+                      +---------+---------+
    |                     |                      |                   |
[ Part 1: Writing Rules ] [ Terminology ]    [ Part 2: Dictionary ] [ Recommendations ]
- words.md                - terminology.md   - dictionary-guide.md  - general-recommendations.md
- multi-word-nouns.md                        - dictionary/index.md  - writing-practices.md
- verbs.md
- sentences.md
- procedures.md
- descriptions.md
- safety.md
- punctuation-and-counting.md
```

---

## 2. Complete Runtime Reference Catalog

| Reference File | Document Title | Primary Scope & Audience |
|:---|:---|:---|
| [`practical-writing.md`](practical-writing.md) | Practical Technical Writing Guide | Comprehensive guide to the Practical profile, 12 core principles, sentence length heuristics, domain vocabulary preservation, and formatting flexibility. |
| [`agent-responses.md`](agent-responses.md) | Agent Responses & Communication | Structure and guidelines for assistant explanations, status reports, tool descriptions, agent-to-agent handoffs, code reviews, and prompt engineering. |
| [`rich-artifacts.md`](rich-artifacts.md) | Technical Clarity in Rich Artifacts | Applying clarity to HTML prose, Mermaid/SVG diagrams, and narration scripts while preserving markup, IDs, scripts, and interactive behavior. |
| [`scope-and-output.md`](scope-and-output.md) | Actions and Output Formats | Specifications for Write, Rewrite, Check, Explain, Glossary, and Translation-Prep; Practical default vs. Strict Issue 9 profile routing. |
| [`fidelity.md`](fidelity.md) | Semantic Fidelity & Safeguards | 8 invariant semantic attributes, 10 critical failure patterns, and the untouched-good-input rule. |
| [`rules-index.md`](rules-index.md) | Rules Index & Subject Navigation | Master mapping of all 53 numbered rules, 8 general recommendations, and subject-to-rule navigation index. |
| [`words.md`](words.md) | Section 1: Words (Rules 1.1–1.14) | Approved words, single parts of speech, single meanings, inflectional forms, and American spelling. |
| [`multi-word-nouns.md`](multi-word-nouns.md) | Section 2: Multi-Word Nouns (Rules 2.1–2.2) | 3-word noun cluster cap, official technical names, and compound modifier hyphenation. |
| [`verbs.md`](verbs.md) | Section 3: Verbs (Rules 3.1–3.7) | Permitted verb forms, simple tenses, active voice discipline, unknown-agent passive exception, and nominalization elimination. |
| [`sentences.md`](sentences.md) | Section 4: Sentences (Rules 4.1–4.5) | Short clear sentences, complete grammatical structures, vertical list syntax, connecting words, and articles. |
| [`procedures.md`](procedures.md) | Section 5: Procedures (Rules 5.1–5.5) | ≤20 words per sentence, one instruction per step, imperative mood, conditions before commands, and informative notes. |
| [`descriptions.md`](descriptions.md) | Section 6: Descriptions (Rules 6.1–6.6) | Progressive disclosure, paragraph cohesion, ≤25 words per sentence, one topic per paragraph, ≤6 sentences per paragraph. |
| [`safety.md`](safety.md) | Section 7: Safety (Rules 7.1–7.3) | WARNING vs. CAUTION distinction, command first, hazard identification, and consequence statements. |
| [`punctuation-and-counting.md`](punctuation-and-counting.md) | Section 8: Punctuation & Word Count | Semicolon ban, permitted parentheses, vertical list budgets, and 7 special word counting groups. |
| [`writing-practices.md`](writing-practices.md) | Section 9: Writing Practices (Rules 9.1–9.4) | Sentence reconstruction, approved word roles, phrasal verb restrictions, and style consistency. |
| [`general-recommendations.md`](general-recommendations.md) | General Recommendations (GR-1–GR-8) | Advisory clarity guidelines: `that` clarity, `with` usage, unambiguous pronouns, `this` modifiers, false friends, Latin abbreviations, and possessives. |
| [`terminology.md`](terminology.md) | Technical Terminology Categories | Complete classification of 22 Technical Noun categories (TN-01–TN-22) and 4 Technical Verb categories (TV-01–TV-04). |
| [`dictionary-guide.md`](dictionary-guide.md) | Part 2: Dictionary Guide | 4-column layout, 8 parts of speech, morphological inflections, 4 Help types, word selection flowchart, recurring errors, and approved verbs. |
| [`dictionary/index.md`](dictionary/index.md) | Bundled STE Dictionary | Bundled lexical database containing alphabetical entries, approved/nonapproved statuses, approved meanings, forms, Help notes, and alternatives. |
| [`use-cases.md`](use-cases.md) | Modern Technical Use Cases | Practical applications across software APIs, runbooks, error messages, post-mortems, prompt design, and translation prep. |
| [`examples.md`](examples.md) | Worked Demonstration Examples | Original contrasting examples demonstrating procedural, descriptive, safety, counting, and fidelity principles. |

---

## 3. Task-to-Reference Navigation

### 3.1 Everyday Clear Technical Writing (Practical Profile)
- Start with [`practical-writing.md`](practical-writing.md) for the 12 core principles and formatting guidelines.
- Use [`scope-and-output.md`](scope-and-output.md) to structure the output deliverable.
- Check [`fidelity.md`](fidelity.md) to ensure numbers, code identifiers, and technical meaning are preserved.

### 3.2 Agent Communication, Handoffs, and Prompts
- Read [`agent-responses.md`](agent-responses.md) for assistant explanations, status updates, tool specifications, and inter-agent handoff templates.

### 3.3 HTML Deliverables, Diagrams, and Rich Media
- Consult [`rich-artifacts.md`](rich-artifacts.md) for guidelines on user-facing prose in HTML, Mermaid diagrams, and video scripts, ensuring code and markup are preserved.

### 3.4 Strict Issue 9 Compliance and Standard Audits
- Consult [`rules-index.md`](rules-index.md) for the comprehensive 53-rule catalog and subject index.
- Study specific sections: [`words.md`](words.md), [`multi-word-nouns.md`](multi-word-nouns.md), [`verbs.md`](verbs.md), [`sentences.md`](sentences.md), [`procedures.md`](procedures.md), [`descriptions.md`](descriptions.md), [`safety.md`](safety.md), [`punctuation-and-counting.md`](punctuation-and-counting.md), and [`writing-practices.md`](writing-practices.md).
- Verify candidate words in the bundled dictionary via [`dictionary/index.md`](dictionary/index.md) and [`dictionary-guide.md`](dictionary-guide.md).
- Classify domain terms using [`terminology.md`](terminology.md).

---

## 4. Reading Paths

### Path 1: Rapid Authoring & Rewriting (Practical Default)
1. Read [`practical-writing.md`](practical-writing.md) to review the 12 practical principles.
2. Read [`fidelity.md`](fidelity.md) to protect technical invariants, code, and uncertainty.
3. Review [`scope-and-output.md`](scope-and-output.md) for clean deliverable formatting.

### Path 2: Full ASD-STE100 Issue 9 Conformity (Strict Explicit)
1. Study the target discipline: [`procedures.md`](procedures.md) for instructions, [`descriptions.md`](descriptions.md) for overviews, or [`safety.md`](safety.md) for warnings.
2. Validate lexical status using [`dictionary/index.md`](dictionary/index.md) and technical categories in [`terminology.md`](terminology.md).
3. Check word counts and punctuation rules in [`punctuation-and-counting.md`](punctuation-and-counting.md).
4. Verify sentence reconstruction principles in [`writing-practices.md`](writing-practices.md).

### Path 3: Engineering Agent Integration & Rich Deliverables
1. Study [`agent-responses.md`](agent-responses.md) for unambiguous handoffs and status reports.
2. Review [`rich-artifacts.md`](rich-artifacts.md) for HTML interfaces and Mermaid diagrams.
3. Inspect modern engineering patterns in [`use-cases.md`](use-cases.md).
