# Section 5: Procedural Writing (Rules 5.1–5.5)

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Part 1 — Writing Rules:** Section 5 (Procedural Writing, Rules 5.1–5.5)

---

## 1. Overview and Scope

Procedures give direct, unambiguous instructions that tell a technician, operator, or reader how to perform a specific task. In technical environments, failure to understand an instruction immediately and accurately can cause severe injury, fatal accidents, or catastrophic damage to equipment. 

ASD-STE100 governs procedural prose through five specific rules (Rules 5.1 through 5.5). These rules ensure that:
1. Sentences remain short and cognitively manageable (Rule 5.1).
2. Each work step conveys a clear, discrete action without hidden sub-steps, unless actions are simultaneous or tightly coupled (Rule 5.2).
3. The imperative (command) mood is used consistently, eliminating ambiguity about responsibility or necessity (Rule 5.3).
4. Prerequisite conditions and situational triggers are stated *before* the action, preventing technicians from executing an action prematurely (Rule 5.4).
5. Notes contain descriptive, supplementary information only, and never hide instructions, safety precautions, or operational limits (Rule 5.5).

---

## 2. Rule 5.1: Maximum Sentence Length in Procedures

> **Rule 5.1:** Write short sentences. Use a maximum of 20 words in each sentence.

### 2.1 Principles and Rationale
Procedures contain step-by-step instructions. Long, compound, or multi-clause sentences in procedural steps increase cognitive load, obscure sequence, and lead to skipped or improperly performed actions. STE establishes a strict ceiling of **20 words per procedural sentence**.

Safety instructions (Warnings and Cautions) located within procedural text are also governed by this 20-word limit (refer to [Section 7: Safety Instructions](safety.md)).

### 2.2 Counting Conventions
Word counts must strictly adhere to the counting rules defined in [Section 8 (Punctuation and word count)](punctuation-and-counting.md):
- Numbers (e.g., `3`, `twenty-one`) count as **one word** (Rule 8.6.1).
- Numbers with units of measurement and tolerances (e.g., `6 mm`, `0.24 in`, `60 psi`, `4.20 Nm`, `20 kg`) count as **one word** (Rule 8.6.2).
- Abbreviations and acronyms (e.g., `CSD`, `NASA`, `VHF`, `a.m.`) count as **one word** (Rule 8.6.3).
- Alphanumeric identifiers and part numbers (e.g., `(2)`, `36L7`, `No. 1`) count as **one word** (Rule 8.6.4).
- Quoted text and mathematical formulas count as **one word** (Rule 8.6.5).
- Titles, headings, placards, and labels count as **one word** (Rule 8.6.6).
- Document step identifiers (e.g., `(1)`, `A.`, `Step 3:`) are part of document structure and are **excluded** from the sentence word count.
- Legitimate hyphenated words and compound adjectives count as **one word** (Rule 8.7).

### 2.3 The Separate Note Limit (25 Words)
Notes in procedures (governed by Rule 5.5) do not give instructions; they provide descriptive information. Because descriptive prose communicates more complex conceptual relationships, **sentences in notes have a higher limit of up to 25 words** (refer to [Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)).

### 2.4 Dividing Long Procedural Instructions
When an instruction exceeds 20 words, split it into two or more short, clear sentences. When actions occur simultaneously or in immediate sequence within the same physical operation, keep them within the same numbered work step rather than creating artificial steps that could disrupt operational timing.

#### Procedural Sentence Length Examples (Rule 5.1)

*Example 1 (Standard procedural instruction):*
- **STE:** `Install the three auxiliary screws (2) in the flange of the motor assembly (9).`  
  *Analysis:* 14 words. Fully compliant with Rule 5.1.

*Example 2 (Procedural caution):*
- **STE:** `CAUTION: WHEN YOU REMOVE THE SHROUD (26), BE CAREFUL NOT TO CAUSE DAMAGE TO THE SURFACE OF THE FLANGE ASSEMBLY (22).`  
  *Analysis:* Exactly 20 words (Condition clause: 6 words; main imperative clause: 14 words). Compliant with Rule 5.1 and Rule 7.1.

*Example 3 (Splitting an overly long instruction):*
- **Non-STE (25 words):**  
  `Put preservation oil into the unit through the vent hole until the oil level is approximately 6 mm (0.24 inches) below the surface of the flange cover.`
- **STE (10 words + 16 words):**  
  `Put preservation oil into the unit through the vent hole.` (10 words)  
  `Continue until the oil level is approximately 6 mm (0.24 in) below the surface of the flange cover.` (16 words)  
  *Analysis:* The original instruction exceeds 20 words. Dividing it into two sentences makes it easy to read. Note that these two sentences remain in the *same* work step because the technician monitors the level while filling; the two actions occur at the same time.

---

## 3. Rule 5.2: One Instruction per Sentence

> **Rule 5.2:** Write only one instruction in each sentence unless two or more actions occur at the same time.

### 3.1 Principles and Work Step Sequence
A procedural sentence must command exactly one action. When multiple distinct actions are packed into a single sentence using coordinating conjunctions like "and", the operator may miss the second instruction or execute the actions out of sequence.

Sequential actions must be broken into separate sentences and organized into clearly marked work steps (using alphanumeric identifiers such as `(1)`, `(2)` or `A.`, `B.`):

- **Non-STE:** `Set the TEST switch to the middle position and release the SHORT-CIRCUIT TEST switch.`
- **STE (Divided into sequential steps):**  
  `A. Set the TEST switch to the middle position.`  
  `B. Release the SHORT-CIRCUIT TEST switch.`  
  *Analysis:* Because setting the first switch and releasing the second switch are two distinct, non-simultaneous physical acts, they must be distinct work steps.

### 3.2 Approved Exception 1: Simultaneous or Coupled Actions
You can write more than one instruction in a single sentence **only when two or more actions occur at the same time** (simultaneous or mechanically coupled actions).

#### Approved Simultaneous Examples (Rule 5.2):
- `Hold the panel in its open position and install the fastener.`  
  *(The technician must physically hold the panel open while driving the fastener.)*
- `Slowly extend the rod fully and make sure that it does not touch other parts.`  
  *(The inspection for clearance happens simultaneously while extending the rod.)*
- `Cut and remove the wire.`  
  *(Coupled physical action on the same object.)*
- `Remove and discard the seal.`  
  *(Coupled removal and disposal instruction.)*

### 3.3 Approved Exception 2: Multiple Sentences in One Work Step
You can write more than one sentence in a single work step under two specific conditions:
1. **When actions occur at the same time / continuous operations:** (e.g., the filling procedure from Rule 5.1).
2. **When a result occurs immediately after an action, or when a measurement limit directly qualifies an action.**

#### Approved Multi-Sentence Work Step Examples:
- `Make sure that the locking torque of each of the four bolts (6) is a minimum of 0.30 Nm. Then, torque each of the four bolts (6) to 4.20 Nm.`  
  *Rationale:* During a torque check, final torquing immediately follows the locking torque verification in one continuous physical procedure. Dividing this into two separate work steps could cause an operator to interrupt the torque sequence.
- `Measure the leakage from the outlet port. The leakage must not be more than 0.5 cc/minute.`  
  *Rationale:* The second sentence specifies the pass/fail limit directly resulting from the measurement action. This is part of a single test step and must not be separated into an independent step or relegated to a note.

---

## 4. Rule 5.3: Imperative Form for Instructions

> **Rule 5.3:** Write instructions in the imperative (command) form.

### 4.1 Principles and Rationale
An instruction tells the reader to do something. The imperative mood uses the base form of the verb without an explicit subject:
- `Set the switch to ON.`
- `Remove the four bolts.`
- `Increase the pressure to 60 psi.`
- `Inflate the tires.`
- `Install the new O-ring.`

### 4.2 Ambiguity of Non-Imperative Forms
Passive voice, modal constructions, and indicative statements create severe ambiguity:
- **Did someone else already do it?** (`The seal was replaced.`)
- **Is it a mandatory requirement or an optional recommendation?** (`The valve should be checked.`)
- **Is it merely a description of capability?** (`The filter can be cleaned.`)
- **Who is responsible?** (`Oil and grease are to be removed.`)

#### Contrastive Examples (Rule 5.3):
- **Non-STE:** `The test can be continued.`  
  **STE:** `Continue the test.`
- **Non-STE:** `Oil and grease are to be removed with a degreasing agent.`  
  **STE:** `Remove oil and grease with a degreasing agent.`

### 4.3 Restrictions on Modal Auxiliaries ("Must" and "Shall")
In standard English, technical writers frequently use "must" or "shall" to express requirements (e.g., "The operator must remove the cover"). In STE:
- **Do not use "must" before the imperative verb in standard procedural steps.**  
  *Incorrect:* `Before you remove the clamp, you must disconnect the hose.`  
  *Correct:* `Before you remove the clamp, disconnect the hose.`
- **Permitted uses of "must":**
  1. In safety instructions (Warnings/Cautions) where absolute compliance is critical to life or equipment:  
     `WARNING: IF YOU MUST CUT THE WIRE, ALWAYS USE A PROTECTIVE MASK. PIECES OF WIRES CAN CAUSE INJURY.`
  2. To state an unavoidable condition or physical requirement:  
     `...when the aircraft must go...`
  3. In descriptive limits/results following an action:  
     `The leakage must not be more than 0.5 cc/minute.`
- **"Shall":** The word "shall" is **not approved** in ASD-STE100 (refer to dictionary entry for `SHALL`). Use the imperative form for instructions, or approved modals/constructions for requirements.

---

## 5. Rule 5.4: Conditions Preceding Instructions

> **Rule 5.4:** When there is a condition that the reader must know about first, start the instruction with a descriptive statement. Then, divide that descriptive statement from the command with a comma.

### 5.1 Chronological / Cognitive Sequence
If a condition, warning, state, or operational trigger must be met before an action is taken, **state the condition first**. Technicians read while executing; if the action is placed before the condition, the technician may perform the action before reading the clause that qualifies or forbids it.

#### Contrastive Condition Sequence Examples (Rule 5.4):
- **Do not write:** `Set the switch to NORMAL when the light comes on.`  
  **WRITE:** `When the light comes on, set the switch to NORMAL.`
- **Do not write:** `Apply the primer when the surface is dry.`  
  **WRITE:** `When the surface is dry, apply the primer.`
- **Do not write:** `Disconnect the Constant Speed Drive (CSD) from the gearbox, if it does not operate correctly.`  
  **WRITE:** `If the Constant Speed Drive (CSD) does not operate correctly, disconnect it from the gearbox.`

### 5.2 The Crucial Role of the Comma
A comma is mandatory between the opening descriptive condition clause and the subsequent imperative command. Placing or omitting the comma alters the syntactic scope of adverbs and clauses, changing the technical meaning entirely:

*Compare these two valid STE sentences with completely different meanings:*
1. `If the Constant Speed Drive (CSD) does not operate correctly, disconnect it from the gearbox.`  
   *Meaning:* The adverb "correctly" modifies "operate". Condition: the CSD is operating improperly/erratically. Action: disconnect it.
2. `If the Constant Speed Drive (CSD) does not operate, correctly disconnect it from the gearbox.`  
   *Meaning:* The adverb "correctly" modifies "disconnect". Condition: the CSD does not operate at all (is non-functional). Action: perform the disconnection correctly.

---

## 6. Rule 5.5: Notes Are for Information Only

> **Rule 5.5:** Write notes only to give information, not instructions.

### 6.1 Purpose and Boundaries of Notes
Notes provide descriptive, supplementary information that helps the reader understand or perform a task. They obey the rules for descriptive writing ([Section 6: Descriptive Writing](descriptions.md)), **not** procedural rules:
- **Maximum sentence length in a note:** 25 words (not 20 words).
- **Prohibited content in notes:**
  - Instructions (never use the imperative mood in a note).
  - Requirements or mandatory procedures.
  - Operational limits, tolerances, or pass/fail test results.
  - Safety-critical warnings or caution notices.

#### Approved STE Note Examples (Rule 5.5):
- `NOTE: The gyroscope will become stable after approximately 15 seconds.`
- `NOTE: It is not necessary to remove the nameplate (33) from the flange (27).`
- `NOTE: You can use equivalent alternatives for these items.`
- `NOTE: During the subsequent test, you get the cracking pressure when the fuel flow from the CROSS FEED port is more than 5 cc/minute.` (22 words)
- `NOTE: The data collection is not completed. Thus, the statistics module can give incorrect results.` (6 words and 8 words)

### 6.2 The Imperative in Notes (Prohibited)
If a note contains an imperative verb, it is an instruction masquerading as a note. It must be converted into a standard numbered work step:
- **Non-STE:**  
  `NOTE: Make sure that the avionics ventilation system continues to operate correctly.`
- **STE:**  
  `(6) Make sure that the avionics ventilation system continues to operate correctly.`  
  *(Integrated directly as work step 6 in the procedure).*

### 6.3 Safety Information in Notes (Prohibited)
Technicians may glance past notes or ignore them during routine maintenance. Placing safety-critical data in a note creates imminent risk:
- **Non-STE:**  
  `NOTE: When you connect the lines, do not bend them too much. If you bend the lines too much, you can cause damage to them.`
- **STE (Promoted to CAUTION):**  
  `CAUTION: WHEN YOU CONNECT THE LINES, DO NOT BEND THEM TOO MUCH. IF YOU BEND THE LINES TOO MUCH, YOU CAN CAUSE DAMAGE TO THEM.`
- **Non-STE:**  
  `NOTE: Before closing the hatch, it is mandatory to ensure that no persons are in the crew rest compartment. When the hatch is closed, there is no airflow to the compartment and therefore there is a risk of suffocation.`
- **STE (Promoted to WARNING):**  
  `WARNING: BEFORE YOU CLOSE THE HATCH, MAKE SURE THAT NO PERSONS ARE IN THE CREW REST COMPARTMENT. WHEN THE HATCH IS CLOSED, THERE IS NO AIRFLOW TO THE COMPARTMENT AND THERE IS A RISK OF SUFFOCATION.`

### 6.4 Limits and Tolerances in Notes (Prohibited)
Test limits, tolerances, and operational thresholds must not be relegated to notes; they must be stated immediately after the related measurement instruction:
- **Non-STE:**  
  `B. Measure the leakage from the outlet port.`  
  `NOTE: The leakage must not be more than 0.5 cc/minute.`
- **STE:**  
  `B. Measure the leakage from the outlet port. The leakage must not be more than 0.5 cc/minute.`

### 6.5 The "Notes-Deletion Test"
Every procedure containing notes must pass the **Notes-Deletion Test**:
1. **Read the procedure with all notes removed.**
2. **Verify completeness and safety:** Can the technician perform the task completely, correctly, and safely without reading any of the notes?
3. **Remediation if the test fails:**
   - If an essential action, condition, or limit is missing, **extract that information from the note**.
   - Rewrite it as an imperative work step, condition, or safety instruction.
   - Insert the new work step into the correct logical sequence.
   - Repeat the test until the procedure stands fully on its own without notes.

### 6.6 Restrictions on Notes in Descriptive Writing
In STE, notes are intended for procedural texts. In descriptive writing, **notes are permitted only if they are directly necessary for illustrations or tables** that form part of the description (refer to [Section 6: Descriptive Writing](descriptions.md)).

---

## 7. Procedural Writing Summary Checklist

| Rule | Requirement | Verification Question |
|---|---|---|
| **5.1** | Max 20 words per procedural sentence (25 for notes) | Did you count numbers+units, identifiers, and abbreviations as 1 word each? Is any procedural sentence > 20 words? |
| **5.2** | One instruction per sentence | Are there multiple commands joined by "and"? If so, are the actions strictly simultaneous/coupled? |
| **5.3** | Imperative mood | Does each command start with a base verb? Are passive forms, "must", "should", and "shall" eliminated from instructions? |
| **5.4** | Conditions first, followed by comma | Are conditional triggers ("If...", "When...") placed before the imperative verb? Is the separating comma present? |
| **5.5** | Notes are information only | Does the procedure pass the Notes-Deletion Test? Are all commands, limits, and safety warnings kept out of notes? |
