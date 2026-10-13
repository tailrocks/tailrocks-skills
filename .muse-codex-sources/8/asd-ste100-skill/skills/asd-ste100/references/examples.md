# ASD-STE100 Issue 9 Worked Examples Catalog

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Governing Standard Sections:** Part 1, Sections 1–9; [Section 8: Punctuation and Word Count](punctuation-and-counting.md); [Fidelity and Meaning Preservation](fidelity.md)

---

## 1. Overview and Demonstration Objectives

This reference provides a rich catalog of original, fully analyzed technical examples demonstrating ASD-STE100 Issue 9 in practice. The examples cover both traditional aerospace/hardware engineering contexts and modern software/infrastructure environments.

Each worked example provides:
1. **Original Text (Non-STE):** Realistic technical source text containing common real-world defects.
2. **Identified Issues / Rule Violations:** Exact rule citations and linguistic analysis.
3. **Compliant STE Rewrite:** Issue 9-compliant technical prose.
4. **Detailed Rule Application & Word Count Verification:** Token-by-token word count calculation applying Section 8 counting conventions.

---

## 2. Mandatory Demonstration Scenarios

```
+--------------------------------------------------------------------------+
|                     MANDATORY DEMONSTRATION MATRIX                       |
+--------------------------------------------------------------------------+
| 1. Condition Before Command (Rule 5.4) & 20-Word Limit (Rule 5.1)        |
| 2. Coupled Actions Exception (Rule 5.2)                                  |
| 3. Preserving Modal Force, Operation, and Assembly Identity (Torque)     |
| 4. Unknown-Agent Passive Exception in Descriptive Writing (Rule 3.6)     |
| 5. Modality Hedge Preserved Without Upgrading to Certainty (Fidelity)    |
| 6. Safety Instructions: WARNING vs CAUTION (Rules 7.1, 7.2, 7.3)         |
| 7. Vertical Lists with Correct Punctuation (Rules 4.3, 8.4)              |
| 8. Special Counting Groups in Action (Rule 8.6)                          |
+--------------------------------------------------------------------------+
```

---

## 3. Procedural Examples (Hardware and Software)

### Example 1.1: Prerequisite Condition Before Command (Rule 5.4) & Word Limit (Rule 5.1)
*Context: Aircraft Hydraulic System Maintenance*

#### Original Text (Non-STE):
> Technicians must depressurize the secondary hydraulic reservoir completely by opening bleed valve HV-4 before attempting to remove the filter element housing retaining ring.

#### Identified Issues / Rule Violations:
1. **Condition / Sequence Inversion ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)):** The prerequisite operation (`depressurize... by opening bleed valve...`) is described with an unapproved gerund construction, and the final triggering prerequisite (`before attempting to remove...`) is placed at the end of the sentence.
2. **Sentence Length ([Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures)):** 21 words (exceeds the 20-word procedural limit).
3. **Nominalization and Modal ([Rules 3.7](verbs.md#8-rule-37-active-verb-preference-and-anti-nominalization), [5.3](procedures.md#4-rule-53-imperative-form-for-instructions)):** Uses `Technicians must depressurize` instead of direct imperative command.
4. **Noun Cluster ([Rule 2.1](multi-word-nouns.md#2-rule-21-maximum-three-words-in-noun-clusters)):** `filter element housing retaining ring` contains 5 words.

#### Compliant STE Rewrite:
> Before you remove the retaining ring of the filter housing, release all pressure from the secondary hydraulic reservoir.  
> Open the bleed valve HV-4.

#### Detailed Rule Application and Word Count Verification:
- **Sentence 1:**
  - Structure: Condition clause (`Before you remove...`) precedes the main command clause (`release all pressure...`) in strict compliance with Rule 5.4.
  - Noun cluster deconstructed: `the retaining ring of the filter housing` (Rule 2.1).
  - Word Count: `Before` (1), `you` (2), `remove` (3), `the` (4), `retaining` (5), `ring` (6), `of` (7), `the` (8), `filter` (9), `housing,` (10), `release` (11), `all` (12), `pressure` (13), `from` (14), `the` (15), `secondary` (16), `hydraulic` (17), `reservoir.` (18).  
    **Total: 18 words** (Complies with Rule 5.1 ceiling of ≤20 words).
- **Sentence 2:**
  - Structure: Clear imperative command.
  - Word Count: `Open` (1), `the` (2), `bleed` (3), `valve` (4), `HV-4.` (5).  
    (`HV-4` counts as 1 word under [Rule 8.6.4](punctuation-and-counting.md#4-alphanumeric-identifiers-and-part-numbers)).  
    **Total: 5 words** (Complies with Rule 5.1).

---

### Example 1.2: Coupled Actions Exception (Rule 5.2)
*Context: Server Rack Hardware Calibration*

#### Original Text (Non-STE):
> While simultaneously pressing and holding the front-panel manual override toggle switch down, turn the fine calibration rotary encoder knob until calibration indicator LED 3 illuminates steadily green.

#### Identified Issues / Rule Violations:
1. **Unapproved Adverb and Conjunction ([Rule 1.1](words.md#2-rule-11-use-approved-words-in-their-approved-senses)):** `simultaneously` and `down` are unapproved or redundant with `press and hold`.
2. **Overly Complex Phrasing ([Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences)):** Stacking descriptive terms before simple physical actions.
3. **Sentence Length ([Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures)):** 24 words (exceeds 20-word limit).

#### Compliant STE Rewrite:
> Push and hold the override switch and turn the calibration knob until the LED 3 comes on.

#### Detailed Rule Application and Word Count Verification:
- **Coupled Action Analysis ([Rule 5.2](procedures.md#3-rule-52-one-instruction-per-sentence)):**
  Rule 5.2 states: *"Write only one instruction in each sentence unless two or more actions occur at the same time."*  
  Releasing the override switch before turning the knob will prevent the circuit from entering calibration mode. Thus, combining them into one coupled sentence is mandatory for operational fidelity.
- **Word Count:**  
  `Push` (1) `and` (2) `hold` (3) `the` (4) `override` (5) `switch` (6) `and` (7) `turn` (8) `the` (9) `calibration` (10) `knob` (11) `until` (12) `the` (13) `LED 3` (14) `comes` (15) `on.` (16).  
  *Counting Note:* `LED 3` is an alphanumeric identifier counted as 1 word under [Rule 8.6.4](punctuation-and-counting.md#4-alphanumeric-identifiers-and-part-numbers).  
  **Total: 16 words** (Complies with Rule 5.1 ceiling of ≤20 words).

---

### Example 1.3: Preserving Modal Force, Operation, and Assembly Identity (Torque Example)
*Context: Aircraft Fuel System Component Assembly*

#### Original Text (Non-STE):
> Prior to the functional pressure test, technicians should torque the high pressure fuel pump inlet valve assembly to 35 Nm.

#### Identified Issues / Rule Violations:
1. **Advisory Modal vs. Command ([Fidelity FP-02](fidelity.md#fp-02-recommendation-turned-into-requirement)):** The source uses advisory `should`. In technical authoring, `should` expresses an advisory recommendation, not an unconditional command. Naively strengthening `should torque` into an imperative `Torque the...` changes the modal obligation, creating unauthorized regulatory liabilities. STE preservation requires keeping the advisory force (`we recommend that you...`) unless the responsible engineering authority explicitly authorizes a mandatory command.
2. **Loss of Calibrated Torque Operation ([Fidelity FP-10](fidelity.md#fp-10-distinct-technical-operations-merged-through-generic-synonym-swaps)):** Changing `torque` to generic `tighten` destroys critical technical precision. Under ASD-STE100, `torque` is an authorized technical verb and technical noun (TN-07). Torquing to an exact rotational force limit is a distinct operation that cannot be flattened to generic tightening.
3. **Component Identity Alteration ([Fidelity Attribute 1 & 2](fidelity.md#2-key-semantic-attributes-that-must-be-preserved)):** The direct object is `the high pressure fuel pump inlet valve assembly`. Reducing this to `the valve` or `the inlet valve` alters component identity. The assembly is a multi-part unit. Unpack the noun cluster in compliance with Rule 2.1 while preserving complete component identity: `the inlet valve assembly of the high-pressure fuel pump`.
4. **Condition Before Action ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)):** The timing prerequisite clause `Prior to the functional pressure test` must precede the recommendation.

#### Compliant STE Rewrite:
> Before the functional pressure test, do this step:  
> We recommend that you torque the inlet valve assembly of the high-pressure fuel pump to 35 Nm.

*(Alternative if engineering authority confirms an unconditional mandatory work instruction):*  
> Before the functional pressure test, torque the inlet valve assembly of the high-pressure fuel pump to 35 Nm.

#### Detailed Rule Application and Word Count Verification:
- **Lead-in Sentence:**  
  `Before the functional pressure test, do this step:`  
  Count: `Before` (1) `the` (2) `functional` (3) `pressure` (4) `test,` (5) `do` (6) `this` (7) `step:` (8).  
  **Total: 8 words** (≤20 words, Rule 5.1).
- **Recommendation Sentence:**  
  `We recommend that you torque the inlet valve assembly of the high-pressure fuel pump to 35 Nm.`  
  1. `We` (Word 1)
  2. `recommend` (Word 2)
  3. `that` (Word 3) -> *GR-1: Explicit conjunction prevents ambiguity.*
  4. `you` (Word 4)
  5. `torque` (Word 5) -> *Technical verb: tighten to a specified torque.*
  6. `the` (Word 6)
  7. `inlet` (Word 7)
  8. `valve` (Word 8)
  9. `assembly` (Word 9) -> *Preserves full assembly component identity.*
  10. `of` (Word 10)
  11. `the` (Word 11)
  12. `high-pressure` (Word 12) -> *Rule 8.7: Hyphenated compound adjective counts as 1 word.*
  13. `fuel` (Word 13)
  14. `pump` (Word 14)
  15. `to` (Word 15)
  16. `35 Nm.` (Word 16) -> *Rule 8.6.2: Number with unit of measurement counts as 1 word.*  
  **Total: 16 words** (Complies with Rule 5.1 ceiling of ≤20 words).

---

## 4. Descriptive Examples (Hardware and Software)

### Example 2.1: Unknown-Agent Passive Exception in Descriptive Writing (Rule 3.6)
*Context: Avionics Radar Pulse Processing Description*

#### Original Text (Non-STE):
> The incoming target reflection radar signals are captured by the antenna receiver and then digitized at 40 megasamples per second, whereupon error correction algorithms are executed on the data stream by an unknown background coprocessor.

#### Identified Issues / Rule Violations:
1. **Sentence Length ([Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)):** 33 words (exceeds the 25-word descriptive limit).
2. **Noun Cluster ([Rule 2.1](multi-word-nouns.md#2-rule-21-maximum-three-words-in-noun-clusters)):** `target reflection radar signals` (4 words).
3. **Connector ([Rule 4.4](sentences.md#5-rule-44-approved-joining-words-and-logical-connectors)):** `whereupon` is unapproved.
4. **Passive Voice Confusion ([Rule 3.6](verbs.md#7-rule-36-active-voice-and-the-unknown-agent-exception)):** The antenna receiver is a known agent and must use active voice, but the coprocessor executing error correction is unknown/unspecified in hardware documentation.

#### Compliant STE Rewrite:
> The antenna receiver captures the radar signals from the target.  
> The signals are digitized at 40 MSPS.  
> Error correction is done on the data stream.

#### Detailed Rule Application and Word Count Verification:
- **Rule 3.6 Passive Exception Analysis:**  
  Rule 3.6 requires active voice, with one explicit exception in descriptive writing:  
  *"Exception: You can use the passive voice in descriptive writing when the agent of the action is unknown or unimportant."*  
  In sentence 2 and sentence 3, the exact digital microcircuit performing ADC sampling and FPGA error-correction is an internal, inaccessible black box. Stating `The signals are digitized` and `Error correction is done` is legitimate under Rule 3.6.
- **Word Counts:**
  - Sentence 1: `The` (1) `antenna` (2) `receiver` (3) `captures` (4) `the` (5) `radar` (6) `signals` (7) `from` (8) `the` (9) `target.` (10).  
    **Total: 10 words.**
  - Sentence 2: `The` (1) `signals` (2) `are` (3) `digitized` (4) `at` (5) `40 MSPS.` (6).  
    (`40 MSPS` counts as 1 word under Rule 8.6.2).  
    **Total: 6 words.**
  - Sentence 3: `Error` (1) `correction` (2) `is` (3) `done` (4) `on` (5) `the` (6) `data` (7) `stream.` (8).  
    **Total: 8 words.**  
    All sentences well below Rule 6.3 ceiling of ≤25 words.

---

### Example 2.2: Preserving Modality Hedges Without Upgrading to Certainty
*Context: Cloud Infrastructure Incident Review*

#### Original Text (Non-STE):
> Our root cause analysis indicates that network congestion between zones may have caused the primary heartbeat packet loss, which could potentially explain why the automated cluster controller triggered a failover event.

#### Identified Issues / Rule Violations:
1. **Critical Fidelity Risk ([Fidelity FP-01](fidelity.md#fp-01-uncertainty-turned-into-certainty)):** A naive rewrite would convert "may have caused" into "caused" and "could potentially explain" into "explains." This turns an unproven engineering hypothesis into a false factual claim.
2. **Sentence Length ([Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)):** 28 words (exceeds the 25-word descriptive limit).
3. **Compound Modals ([Rule 3.2](verbs.md#3-rule-32-approved-verb-tenses-and-aspects)):** `could potentially explain`.

#### Compliant STE Rewrite:
> It is possible that network congestion between zones caused the loss of the heartbeat packets.  
> This can explain why the cluster controller started a failover.

#### Detailed Rule Application and Word Count Verification:
- **Modality Preservation Analysis:**  
  The hedge `may have caused` is preserved using the approved STE construction `It is possible that... caused`.  
  The hedge `could potentially explain` is rendered faithfully as `This can explain...` without promoting the possibility to a certainty.
- **Word Counts:**
  - Sentence 1: `It` (1) `is` (2) `possible` (3) `that` (4) `network` (5) `congestion` (6) `between` (7) `zones` (8) `caused` (9) `the` (10) `loss` (11) `of` (12) `the` (13) `heartbeat` (14) `packets.` (15).  
    **Total: 15 words** (≤25 words, Rule 6.3).
  - Sentence 2: `This` (1) `can` (2) `explain` (3) `why` (4) `the` (5) `cluster` (6) `controller` (7) `started` (8) `a` (9) `failover.` (10).  
    **Total: 10 words** (≤25 words, Rule 6.3).

---

## 5. Safety Instructions (WARNING vs CAUTION)

### Example 3.1: WARNING (Hazard to Personnel)
*Context: High-Voltage Power Supply Enclosure*

#### Original Text (Non-STE):
> Warning: Because lethal electrical potentials in excess of 600 volts AC exist on the busbars even after system de-energization, personnel should always discharge the main filter capacitors before touching internal components to prevent electrocution.

#### Identified Issues / Rule Violations:
1. **Structure Inversion ([Rules 7.1, 7.2](safety.md#3-rule-72-actionable-opening-command-or-condition)):** Starts with an explanatory causal clause (`Because lethal...`) instead of starting with a direct command or condition.
2. **Advisory Modal ([Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions)):** Uses `should always discharge` instead of direct imperative command.
3. **Sentence Length ([Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures)):** 33 words (far exceeds the 20-word safety limit).
4. **Placement of Hazard ([Rule 7.3](safety.md#4-rule-73-specific-risk-and-result-explanation)):** The hazard (`to prevent electrocution`) is buried at the end.

#### Compliant STE Rewrite:
> **WARNING: DISCHARGE THE MAIN CAPACITORS BEFORE YOU TOUCH THE INTERNAL PARTS. ELECTRICAL POTENTIALS OF MORE THAN 600 V AC CAN KILL YOU.**

#### Detailed Rule Application and Word Count Verification:
- **Rules 7.1, 7.2, 7.3 Compliance:**
  - Uses `WARNING` because the hazard involves fatal injury/death (Rule 7.1).
  - Sentence 1 starts with a direct imperative command (`DISCHARGE THE MAIN CAPACITORS...`) with condition clause (Rule 7.2).
  - Sentence 2 explicitly defines the hazard and consequence (`...CAN KILL YOU`) (Rule 7.3).
- **Word Counts:**
  - Sentence 1: `DISCHARGE` (1) `THE` (2) `MAIN` (3) `CAPACITORS` (4) `BEFORE` (5) `YOU` (6) `TOUCH` (7) `THE` (8) `INTERNAL` (9) `PARTS.` (10).  
    **Total: 10 words** (≤20 words, Rule 5.1).
  - Sentence 2: `ELECTRICAL` (1) `POTENTIALS` (2) `OF` (3) `MORE` (4) `THAN` (5) `600 V AC` (6) `CAN` (7) `KILL` (8) `YOU.` (9).  
    (`600 V AC` counts as 1 word under Rule 8.6.2).  
    **Total: 9 words** (≤20 words, Rule 5.1).

---

### Example 3.2: CAUTION (Hazard to Equipment)
*Context: Aircraft Turbine Rotor Inspection*

#### Original Text (Non-STE):
> Caution: Avoid applying excessive pressure with sharp metallic tools when scraping carbon deposits from the turbine wheel hub, as severe scratching will initiate fatigue cracks leading to catastrophic rotor destruction.

#### Identified Issues / Rule Violations:
1. **Negative Command / Vague Adjective ([Rules 1.1](words.md#2-rule-11-use-approved-words-in-their-approved-senses), [4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences)):** `Avoid applying excessive pressure` is vague. What is excessive pressure?
2. **Structure ([Rule 7.2](safety.md#3-rule-72-actionable-opening-command-or-condition)):** Command should directly specify what to do/not do.
3. **Sentence Length ([Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures)):** 28 words (exceeds 20-word limit).

#### Compliant STE Rewrite:
> **CAUTION: DO NOT USE SHARP METAL TOOLS TO REMOVE CARBON FROM THE TURBINE HUB. SCRATCHES ON THE HUB CAN CAUSE DAMAGE TO THE ROTOR.**

#### Detailed Rule Application and Word Count Verification:
- **Rules 7.1, 7.2, 7.3 Compliance:**
  - Uses `CAUTION` because the hazard threatens equipment, not human life (Rule 7.1).
  - Clear prohibition command starts the caution (Rule 7.2).
  - Explicit consequence stated in the second sentence (Rule 7.3).
- **Word Counts:**
  - Sentence 1: `DO` (1) `NOT` (2) `USE` (3) `SHARP` (4) `METAL` (5) `TOOLS` (6) `TO` (7) `REMOVE` (8) `CARBON` (9) `FROM` (10) `THE` (11) `TURBINE` (12) `HUB.` (13).  
    **Total: 13 words** (≤20 words, Rule 5.1).
  - Sentence 2: `SCRATCHES` (1) `ON` (2) `THE` (3) `HUB` (4) `CAN` (5) `CAUSE` (6) `DAMAGE` (7) `TO` (8) `THE` (9) `ROTOR.` (10).  
    **Total: 10 words** (≤20 words, Rule 5.1).

---

## 6. Vertical Lists and Punctuation (Rules 4.3, 8.4)

### Example 4.1: Vertical List of Sentence Fragments
*Context: Tool Requirements for Flight Control Servicing*

#### Original Text (Non-STE):
> The technician will require the following tools: a 3/8-inch calibrated torque wrench; a pair of safety goggles; two spare O-rings, part number 12-405; and a clean lint-free cloth.

#### Identified Issues / Rule Violations:
1. **Semicolons in Text ([Rule 8.1](punctuation-and-counting.md#2-rule-81-prohibition-of-semicolons)):** Semicolons are prohibited in STE.
2. **List Punctuation ([Rule 4.3](sentences.md#4-rule-43-vertical-lists-and-bullet-structures), [Rule 8.4](punctuation-and-counting.md#5-rule-84-word-counting-in-vertical-lists)):** In a vertical list of sentence fragments completing a lead-in, semicolons or commas must not be used at line ends. Only the final item takes a period.
3. **Passive / Future Tense ([Rule 3.2](verbs.md#3-rule-32-approved-verb-tenses-and-aspects)):** `The technician will require...`

#### Compliant STE Rewrite:
> You need these tools:
> - A 3/8-inch calibrated torque wrench
> - Safety goggles
> - Two O-rings (P/N 12-405)
> - A clean, lint-free cloth.

#### Detailed Rule Application and Word Count Verification:
- **Rule 4.3 Vertical List Punctuation:**
  - Lead-in ends with a colon (`:`).
  - Items are sentence fragments that complete the lead-in sentence grammatically.
  - Items 1, 2, and 3 have **no end punctuation**.
  - The final item (Item 4) ends with a **period (`.`)**.
- **Counting and Word Count Budget (Rules 8.4, 8.5):**
  - Lead-in: `You need these tools:` = 4 words (≤20 words, Rule 5.1).
  - Item 1: `A` (1) `3/8-inch` (2) `calibrated` (3) `torque` (4) `wrench` (5) = 5 words (`3/8-inch` counts as 1 word under Rule 8.7).
  - Item 2: `Safety` (1) `goggles` (2) = 2 words.
  - Item 3: `Two` (1) `O-rings` (2) `(P/N 12-405)` (3) = 3 words (`(P/N 12-405)` counts as 1 word under Rules 8.5 and 8.6.4).
  - Item 4: `A` (1) `clean,` (2) `lint-free` (3) `cloth.` (4) = 4 words (`lint-free` is 1 word under Rule 8.7).
  - Each item easily complies with the word limit budget.

---

## 7. Special Counting Groups in Action (Rule 8.6)

### Example 5.1: Software CLI Configuration Step

#### Original Text (Non-STE):
> In order to properly initialize cluster replication, execute the command `velnor-admin --init-cluster` with parameter `--timeout=500ms`, verifying that return code 0 is received from host 192.168.1.10.

#### Compliant STE Rewrite:
> Run this command to start cluster replication:  
> ```bash
> velnor-admin --init-cluster --timeout=500ms
> ```  
> Make sure that the host `192.168.1.10` returns exit code 0.

#### Detailed Token-by-Token Word Count Verification (Rule 8.6):

**Sentence 1 (Procedural Lead-in):**
`Run this command to start cluster replication:`
1. `Run` (Word 1)
2. `this` (Word 2)
3. `command` (Word 3)
4. `to` (Word 4)
5. `start` (Word 5)
6. `cluster` (Word 6)
7. `replication:` (Word 7)  
**Total Sentence 1 Count: 7 words** (≤20 words, Rule 5.1).

**Protected Block:**
The bash code block is protected verbatim content.

**Sentence 2 (Verification Instruction):**
`Make sure that the host 192.168.1.10 returns exit code 0.`
1. `Make` (Word 1)
2. `sure` (Word 2)
3. `that` (Word 3)
4. `the` (Word 4)
5. `host` (Word 5)
6. `192.168.1.10` (Word 6) -> *Rule 8.6.4: Alphanumeric identifiers, IP addresses, and part numbers count as 1 word.*
7. `returns` (Word 7)
8. `exit` (Word 8)
9. `code` (Word 9)
10. `0.` (Word 10) -> *Rule 8.6.1: Numbers count as 1 word.*  
**Total Sentence 2 Count: 10 words** (≤20 words, Rule 5.1).

---

### Example 5.2: Hardware Measurement with Tolerances and Units

#### Original Text (Non-STE):
> Confirm that the axial clearance between the spur gear and the flange face is within the specified tolerance band of 0.05 mm ± 0.01 mm (0.002 in ± 0.0004 in) across all four measurement quadrants.

#### Compliant STE Rewrite:
> Measure the axial clearance between the spur gear and the flange face.  
> The clearance must be 0.05 mm ± 0.01 mm (0.002 in ± 0.0004 in).

#### Detailed Token-by-Token Word Count Verification (Rule 8.6):

**Sentence 1:**
`Measure the axial clearance between the spur gear and the flange face.`
1. `Measure` (Word 1)
2. `the` (Word 2)
3. `axial` (Word 3)
4. `clearance` (Word 4)
5. `between` (Word 5)
6. `the` (Word 6)
7. `spur` (Word 7)
8. `gear` (Word 8)
9. `and` (Word 9)
10. `the` (Word 10)
11. `flange` (Word 11)
12. `face.` (Word 12)  
**Total Sentence 1 Count: 12 words** (≤20 words, Rule 5.1).

**Sentence 2:**
`The clearance must be 0.05 mm ± 0.01 mm (0.002 in ± 0.0004 in).`
1. `The` (Word 1)
2. `clearance` (Word 2)
3. `must` (Word 3)
4. `be` (Word 4)
5. `0.05 mm ± 0.01 mm` (Word 5) -> *Rule 8.6.2: A number with its unit and tolerance counts as 1 word.*
6. `(0.002 in ± 0.0004 in).` (Word 6) -> *Rule 8.5 & 8.6.2: Parenthetical equivalent unit counts as 1 word in main sentence count.*  
**Total Sentence 2 Count: 6 words** (≤20 words, Rule 5.1).
