# Section 9: Writing Practices (Rules 9.1–9.4)

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Part 1 — Writing Rules:** Section 9 (Writing Practices, Rules 9.1–9.4)

---

## 1. Overview and Scope

ASD-STE100 is not a mechanical word-replacement cipher; it is a controlled authoring system designed to maximize clarity, eliminate structural ambiguity, and ensure international comprehension.

Section 9 establishes the core writing disciplines required to produce genuine STE prose:
- **Rule 9.1:** Sentence reconstruction when word-for-word substitution is inadequate.
- **Rule 9.2:** Strict adherence to authorized parts of speech, senses, forms, and contexts.
- **Rule 9.3:** Absolute prohibition on inventing phrasal verbs from approved words.
- **Rule 9.4:** Uncompromising stylistic and terminological consistency across identical actions.

---

## 2. Rule 9.1: Sentence Reconstruction

> **Rule 9.1:** Use a different sentence construction to write a sentence when a word-for-word replacement is not sufficient.

### 2.1 The Word-for-Word Substitution Fallacy
When authors first encounter the ASD-STE100 dictionary, they often attempt simple mechanical substitution (replacing non-approved words with approved dictionary equivalents while preserving the source syntax). 

While word-for-word substitution is valid for direct synonyms of identical part of speech (e.g., replacing `acceptable` with `permitted`):
- `Non-STE: A value of 2 mm is acceptable.`  
  `STE: A value of 2 mm is permitted.`

In the vast majority of technical sentences, simple word substitution produces ungrammatical, nonsensical, or misleading prose.

### 2.2 Four Drivers for Sentence Reconstruction
The standard identifies four distinct reasons why a writer must completely restructure a sentence (Rule 9.1):

#### 1. Grammatical Restructuring Required by the Approved Alternative
The approved alternative may have a different part of speech or require different argument structures:
- **Non-STE:** `The oil level on the sight gauge must be visible during the test.`  
  *Problem:* `Visible` is not approved. The dictionary alternative is the verb `see`. But inserting `see` requires changing the passive modal `must be visible` into an active imperative:  
  **STE:** `During the test, make sure that you can see the oil level on the sight gauge.`
- **Non-STE:** `Cycle the unit twice to remove air from the lines.`  
  *Problem:* `Cycle` is not approved as a verb (noun only), and `twice` is not approved (adverb).  
  **STE:** `Operate the unit for two cycles to remove air from the lines.`  
  *(Reconstructs using approved verb `operate`, approved noun `cycle`, and technical number `two`).*

#### 2. Literal Substitution Yields Meaningless or Absurd Results
Combining literal dictionary suggestions can produce unidiomatic nonsense:
- **Non-STE:** `Without this modification, the service life of the unit can be uncertain.`  
  *Literal failure:* `Uncertain` suggests `not sure` or `not known`. Writing:  
  *Unacceptable Non-STE:* `Without this modification, the service life of the unit cannot be sure.`  
  *Unacceptable Non-STE:* `Without this modification, the service life of the unit cannot be known.`  
  *Analysis:* Neither sentence represents acceptable technical English. The writer must analyze the physical reality: the service life will likely degrade.  
  **STE Reconstruction:** `Without this modification, it is possible that the service life of this unit will be shorter than usual.`

#### 3. The Suggested Alternative Alters the Contextual Meaning
Dictionary alternatives are general suggestions and can distort meaning if applied blindly:
- **Non-STE:** `Just apply very light pressure to the surface.`  
  *Literal trap:* The general dictionary alternative for `just` is `immediately`. But substituting it yields:  
  *Unacceptable Non-STE:* `Immediately apply very light pressure to the surface.` (Alters timing rather than limiting degree).  
  **STE Reconstruction:** `Only apply very light pressure to the surface.`

#### 4. The Source Word Is Absent from the Dictionary
Many non-approved words have no dictionary entry at all. The writer must extract the underlying physical meaning:
- **Non-STE:** `The incidence of water in fuel is dangerous.`  
  *Analysis:* `Incidence` is absent. Its conceptual synonym `presence` is also unapproved.  
  **STE Reconstruction:** `Water in fuel is dangerous.`
- **Non-STE:** `Lift the seat so that it clears the track locks.`  
  *Analysis:* `Clear` is not approved as a verb. Its dictionary alternative as a verb is `clean`, which is absurd here. The physical action is increasing distance.  
  **STE Reconstruction:** `Lift the seat until it is away from the track locks.`

### 2.3 Comprehensive Case Study: Crack Inspection and Table Reconstruction
The following case study presents a complete procedural reconstruction involving text and tables:

#### Non-STE Baseline:
> `If cracks are detected during this procedure, the operator must perform the repair within a certain number of flight hours depending on crack length. Refer to following table:`  
> | Crack length detected | Time before repair |
> |---|---|
> | L > ... | 1000 flight hours |
> | L = ... | 2000 flight hours |
> | L < ... | 3000 flight hours |

*Flaws:*
- Unapproved words: `perform` (use `do`), `within` (use `in`), `certain` (use `some`), `detect` (use `find`).
- Passive voice: `are detected` (Rule 3.6).
- Sprawling 24-word procedural sentence (Rule 5.1).
- Missing articles before `crack length` and `following table` (Rule 4.5).
- Instruction not in imperative mood (Rule 5.3).
- Redundant repetition of criteria between prose and table.

#### Step-by-Step STE Reconstruction:
1. Active condition: `If cracks are detected...` → `If you find cracks...`
2. Cross-reference: `Refer to the table that follows:`
3. Eliminate duplicate procedural prose and embed criteria directly into the table headers:

**STE Conforming Solution:**
> `If you find cracks, refer to the table that follows:`  
> | If the crack is of this length | Do the repair before |
> |---|---|
> | L > ... | 1000 flight hours |
> | L = ... | 2000 flight hours |
> | L < ... | 3000 flight hours |

---

## 3. Rule 9.2: Authorized Senses, Parts of Speech, and Contexts

> **Rule 9.2:** Use each approved word correctly.

### 3.1 One Word — One Meaning / One Function
Standard English words frequently possess dozens of definitions across multiple grammatical roles. In ASD-STE100:
- Approved words generally possess **only one approved meaning** and **one approved part of speech**.
- Writers must consult the *Approved meaning / Alternatives* column in the dictionary before writing.

### 3.2 Contextual Misuse Traps (Rule 9.2)

#### 1. `WEAR` (Friction Damage vs. Clothing)
- **Approved Meaning:** Verb only — *"to become damaged by friction"*.
- **Non-STE:** `Wear protective clothing.`
- **STE:** `Use (or put on) protective clothing.`

#### 2. `EXTEND` (Physical Dimension vs. Applicability)
- **Approved Meaning:** Verb only — *"to increase, or cause something to increase, in dimension or range"*.
- **Non-STE:** `This regulation extends to all units.`
- **STE:** `This regulation is applicable to all units.`

#### 3. `GO DOWN` (Physical Motion vs. Parameter Decrease)
- **Approved Use:** Only for physical descent of a mechanical object (needle, float).
- **Non-STE:** `When the pressure goes down, lift the cover.`
- **STE:** `When the pressure decreases, lift the cover.`

#### 4. `GO THROUGH` (Physical Passage vs. Exceeding Values)
- **Approved Use:** Physical transit through an orifice or spatial zone.
- **Non-STE:** `Make sure that the probe went through more than 500 °C.`
- **STE:** `Make sure that the temperature of the probe increased to more than 500 °C.`

#### 5. `SEE` (Visual Perception vs. Verification)
- **Approved Meaning:** Visual detection with the human eye. Never approved for "ascertain", "verify", or "understand".
- **Non-STE:** `Move the tube to see if the inner connection is tight.`
- **STE:** `Move the tube to make sure that the inner connection is tight.`

#### 6. `TURN` (Mechanical Rotation vs. State/Color Change)
- **Approved Meaning:** Movement around an axis.
- **Non-STE:** `The indicator turns green.`
- **STE:** `The color of the indicator changes to green.`

#### 7. `ABOVE` / `BELOW` (Spatial Elevation vs. Numerical Thresholds)
- **Approved Meaning:** Spatial, geometric position only. Never for numeric limits.
- **Non-STE:** `Do not let the pressure go below (or above) 20 psi.`
- **STE:** `Do not let the pressure become less than (or more than) 20 psi.`

### 3.3 Part-of-Speech Violations
Many words approved in one grammatical category are strictly forbidden in another:
- **`WORK`** is approved as a **NOUN**, never as a verb.  
  *Non-STE:* `When you work with cleaning agents...`  
  *STE:* `When you do work with cleaning agents...`
- **`HELP`** is approved as a **VERB**, never as a noun.  
  *Non-STE:* `Install the cover with the help of a second person.`  
  *STE:* `Install the cover with the aid of a second person.`
- **`DAMAGE`** is approved as a **NOUN**, never as a verb.  
  *Non-STE:* `Be careful not to damage the sleeve.`  
  *STE:* `Be careful not to cause damage to the sleeve.`

### 3.4 Approved Dual-Function Words
A limited group of essential technical words are authorized in more than one grammatical category. Their role is readily distinguishable by syntactic position:
- **`FLUSH`**
  - *Approved Verb:* *"to remove something or to operate with a flow of liquid"*  
    `Flush the pipes with a disinfectant solution.`
  - *Approved Adjective:* *"level with adjacent surface"*  
    `Make sure that the door is flush with the adjacent surfaces.`

---

## 4. Rule 9.3: Absolute Prohibition on Unapproved Phrasal Verbs

> **Rule 9.3:** When you use two words together, do not make phrasal verbs.

### 4.1 Nature of Phrasal Verbs
In standard English, verbs combine with prepositions or adverbs to form multi-word idioms where the combined meaning differs drastically from the individual words:
- `put` + `out` → *"extinguish"*
- `give` + `off` → *"release / emit"*
- `carry` + `out` → *"perform / execute"*
- `turn` + `down` → *"decrease / reject"*

Because these constructions are highly idiomatic, culturally specific, and virtually untranslatable by software, **ASD-STE100 strictly bans creating phrasal verbs from approved component words**.

### 4.2 Contrastive Examples (Rule 9.3)
- **Non-STE:** `After you put out the fire, close the valve on the fire extinguisher.`  
  *Analysis:* `Put` and `out` are approved words, but `put out` creates an unapproved phrasal verb.  
  **STE:** `After you extinguish the fire, close the valve on the fire extinguisher.`
- **Non-STE:** `This compound can give off poisonous fumes.`  
  *Analysis:* `Give` and `off` are approved words, but `give off` forms an unapproved phrasal verb.  
  **STE:** `This compound can release poisonous fumes.`

### 4.3 Software and Engineering Phrasal Verbs (Modern Prohibitions)
Modern software and engineering technical writing is filled with informal phrasal verbs that violate Rule 9.3:
- Do not write: `spin up an instance` → WRITE: `start an instance`
- Do not write: `dive into the logs` → WRITE: `examine the logs`
- Do not write: `fall back to defaults` → WRITE: `revert to default values`
- Do not write: `tear down the cluster` → WRITE: `stop the cluster` or `remove the cluster`

### 4.4 Explicitly Approved Phrasal Verbs in the Dictionary
Only a small number of phrasal verbs are explicitly listed as approved entries in the ASD-STE100 dictionary, each with a tightly restricted definition:
- **`PUT ON`:** Approved strictly for donning clothing, protective equipment, or attaching specific fixtures.
- **`COME ON`:** Approved strictly for an indicator light becoming illuminated.

---

## 5. Rule 9.4: Terminological and Stylistic Consistency

> **Rule 9.4:** When you select terminology or wording, always use a consistent style.

### 5.1 Cognitive Rhythm in Technical Execution
Technicians read technical manuals to execute physical tasks quickly and accurately. When the same action or component is described with identical wording throughout a manual, the technician recognizes the pattern instantly. Variations force the technician to pause and determine whether a different procedure or part is required.

### 5.2 Assembly Sequence Comparison (Rule 9.4)

#### Non-STE Baseline (Inconsistent Terminology and Phrasing):
```text
1. Put the housing (8) in its installation position on the main body (9).
2. Lubricate the two bolts (10) with oil.
3. Install the two bolts (10) in the body (9).
4. Torque-tighten the two bolts to 4 Nm.
5. Put the transducer (11) on the body assembly (9).
6. Apply a small quantity of oil to the threads of the four bolts (12).
7. Attach the transducer (11) to the body assembly (9) with the four bolts (12).
8. Torque each of the four bolts (12) to 0.8 Nm.
```

*Inconsistencies Identified:*
- Component (9) is called `main body` in step 1, `body` in step 3, and `body assembly` in steps 5 and 7.
- Tightening operation is called `Torque-tighten` in step 4 and `Torque each of...` in step 8.
- Lubrication is phrased as `Lubricate the two bolts (10) with oil` in step 2 and `Apply a small quantity of oil to the threads of the four bolts (12)` in step 6.

#### STE Conforming Revision (Absolute Consistency):
```text
1. Put the housing (8) in its installation position on the body assembly (9).
2. Apply a small quantity of oil to the threads of the two bolts (10).
3. Install the two bolts (10) in the body assembly (9).
4. Torque each of the two bolts to 4 Nm.
5. Put the transducer (11) on the body assembly (9).
6. Apply a small quantity of oil to the threads of the four bolts (12).
7. Attach the transducer (11) to the body assembly (9) with the four bolts (12).
8. Torque each of the four bolts (12) to 0.8 Nm.
```

*STE Standardization Applied:*
- Component (9) is strictly called `body assembly (9)` in every instance.
- Lubrication is always phrased: `Apply a small quantity of oil to the threads of the [count] bolts ([ID]).`
- Torquing is always phrased: `Torque each of the [count] bolts ([ID]) to [value].`

---

## 6. Writing Practices Summary Checklist

| Rule | Requirement | Verification Question |
|---|---|---|
| **9.1** | Reconstruct when substitution fails | Did you restructure awkward syntax rather than forcing mechanical dictionary substitutions? |
| **9.2** | Use approved POS and senses | Is every approved word used strictly in its authorized grammatical role and meaning? (Check `wear`, `work`, `damage`, `help`, `see`). |
| **9.3** | No unapproved phrasal verbs | Are multi-word verb phrases (`put out`, `carry out`, `spin up`) eliminated in favor of single approved verbs? |
| **9.4** | Consistent style and terminology | Is the same physical action or part named and phrased identically throughout the text? |
