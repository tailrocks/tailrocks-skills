# Maintainer Extraction Progress and Provenance Ledger

**Governing Standard:** ASD-STE100 Issue 9 (2025-01-15)  
**Document Purpose:** Maintainer tracking of lineage, Issue 9 delta audits, upstream discrepancy corrections, and extraction traps.

---

## 1. Provenance Baseline & Project Lineage

The `asd-ste100` skill builds upon four primary inputs:

```
[ STD: ASD-STE100 Issue 9 ] (Authoritative Ground Truth, 2025-01-15)
              │
              ├── Verified against physical PDF (434 pages)
              │
[ BASE: SimpleEnglish ] (commit 32ea2d3) ────────┐
  - Writing workflow & plain-language style       │
                                                  ├──► [ tailrocks/tailrocks-asd-ste100-skills ]
[ DONOR: asd-ste100-skill ] (commit 7d4a135) ────┤    - Unified private self-contained skill
  - Meaning-preservation & failure patterns       │    - Bundled local references & dictionary
                                                  │    - No executable linters/evals
[ TAIL: tailrocks-repo-skills ] (commit 036063e) ─┘    - Multi-client manifest metadata
  - Structure, presentation & client manifests
```

### 1.1 Lineage Specifications

1. **Standard Authority (`STD`):**
   - **Document:** *ASD-STE100 Simplified Technical English, Standard for technical documentation*, Issue 9.
   - **Release Date:** 2025-01-15.
   - **Extent:** 434 physical pages (SHA-256: `d1f4ea9e7cd6e46b47aa9057209f99e78c0e9cfc4e27a5b07895b05c1a166431`).
   - **Role:** Sole authority for all rules, noun/verb categories, approved meanings, forms, restrictions, and example sentences.

2. **Base Skill (`BASE`):**
   - **Repository:** `SimpleEnglish` at commit `32ea2d3f4404bfbff162c1861e5ae4f1bcc628b3`.
   - **Role:** Contributed practical plain-language workflows and response patterns.

3. **Donor Skill (`DONOR`):**
   - **Repository:** `danyuchn/asd-ste100-skill` at commit `7d4a135a199a5d7447c4886bcd7ffe742a627bc9`.
   - **Role:** Contributed semantic fidelity principles, the untouched-good-input invariant, initial rule summaries, and meaning-distortion failure patterns.

4. **Tailrocks Pattern (`TAIL`):**
   - **Repository:** `tailrocks/tailrocks-repository-skills` at commit `036063edc58d88cd88f57e4e3a9721ebadf3ad62`.
   - **Role:** Contributed multi-client manifest layouts (`.claude-plugin/`, `.codex-plugin/`, `.kimi-plugin/`, `.muse-plugin/`).
   - **Policy:** Explicit implicit invocation enabled (`policy.allow_implicit_invocation: true`), enabling natural-language auto-activation.

---

## 2. Issue 9 Changes from Issue 8 (Highlights Pages HI-1 through HI-26)

### 2.1 General & Terminology Harmonization
- **Standard Designation:** ASD-STE100 is officially designated a *standard* for technical documentation (formerly *specification*).
- **ISO Harmonization:** Terminology harmonized with **ISO 704:2022** and **ISO 1087:2019**.
- **Technical Noun Terminology:** The term **"technical noun"** replaces legacy "technical name" across all rules.
- **Help Graphic Symbol:** Expanded from Part 2 into Part 1 writing rules to mark explanatory qualifications.

### 2.2 Writing Rules Revisions in Issue 9
- **Rule 1.1:** Defines *noun terms* and *verb terms*; replaces "technical name" with "technical noun".
- **Rule 1.2:** Clarifies functional shift prohibition; Help box added.
- **Rule 1.4:** Verb and adjective inflection tables aligned with Part 2 morphological paradigms.
- **Rule 1.5:** Added Category 21: Law and regulations (TN-21). Categories expanded from 21 to 22.
- **Rule 1.11:** Enforces naming consistency; prohibits merging distinct items.
- **Rule 1.12:** Category 3 restructured with subcategories (a–f); added Category 4: Law and regulations (TV-04). Categories expanded from 3 to 4.
- **Rule 1.14:** American English spelling requirement per Merriam-Webster.
- **Section 2:** Retitled "Multi-word nouns". Rule 2.1 clarifies modifier relationships.
- **Rule 3.5:** Revised `-ing` form restrictions; explicit authorization of approved lexical entries and technical noun modifiers.
- **Rule 3.6:** Active/passive flow chart updated. Affirmed unknown-agent exception in descriptive writing.
- **Rule 3.7:** Revised guidance on using verbs rather than nominalizations.
- **Rule 5.4:** Mandatory placement of prerequisite conditions before commands.
- **Rule 5.5:** Prohibits commands, limits, or mandatory actions in procedural notes.
- **Rule 8.4:** Vertical list word budgets: lead-in and items counted separately.
- **Rule 8.6:** Major counting updates: numbers with units of measurement count as one word (Rule 8.6.2); proper nouns of entities count as single words (Rule 8.6.7).
- **Rule 8.7:** Standard hyphenated words count as single words.
- **Rule 9.1:** Revised sentence reconstruction guidance.

### 2.3 Dictionary Changes in Issue 9
- **Four Verb Classes:** Explicit formal classification: Regular, Irregular, Auxiliary (`BE`), and Defective modal (`CAN`, `WILL`).
- **Approved Verb Index:** List of Approved Verbs on physical page 147.
- **11 Newly Approved Words:** `ACTIVATE (v)`, `ACTIVE (adj)`, `COMMUNICATION (n)`, `CONTACT (v)`, `DEACTIVATE (v)`, `DEEP (adj)`, `MORE (adv)`, `MOST (adv)`, `PREVIOUS (adj)`, `PREVIOUSLY (adv)`, `PROTRUDE (v)`.
- **Shift to Unapproved:** `OVER (prep)` is unapproved in Issue 9 (alternatives: `ABOVE`, `ON`, `ALONG`).
- **21 Deleted Words:** `at least`, `bear down`, `blank off`, `blank out`, `brightness`, `double`, `entail`, `essential`, `furnish`, `graduated`, `imperative`, `less`, `magnetized`, `metallic`, `practice`, `purpose`, `single`, `subject`, `taped`, `triple`, `using`, `verbal`.

---

## 3. Discrepancies Corrected from Prior Implementations

1. **Word Counts:** Corrected standard figures to **875 approved words** and **1,274 unapproved guide words** (physical p. 131).
2. **Rule 3.6 Passive Voice Exception:** Corrected from "unknown or irrelevant" to **unknown agent only**.
3. **CAREFULLY Status:** Affirmed that `CAREFULLY (adv)` is an approved word (physical p. 185).
4. **CHECK Status:** Affirmed that `CHECK (n)` is approved only as a noun; the verb `check` is unapproved.
5. **GR-2 Attribution:** Corrected GR-2 scope to misuse of "with"; removed spurious motor-stopping examples.
6. **Contaminated Scraper Traps:** Documented traps for `WEAR`, `CAN`, `ABOUT`, `SWALLOW`, and `PUT ON`.
