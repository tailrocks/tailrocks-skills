# Section 4: Sentences (Rules 4.1 – 4.5)

> **Rule Specification**: ASD-STE100 Issue 9, Part 1 – Writing Rules, Section 4: Sentences (Rules 4.1 through 4.5).

---

## Executive Summary & Syntactic Architecture

Section 4 establishes structural, grammatical, and typographical standards for combining approved words into clear, unambiguous sentences. In technical documentation, sentence-level defects—such as compound ideas, elliptical omissions, telegraphic jargon, dangling clauses, and inconsistent listing—severely impair comprehension.

The architectural principles of STE sentence design are:
1. **One Idea Per Sentence**: Every sentence must convey exactly one discrete procedural step or one descriptive concept.
2. **Grammatical Completeness**: No words may be omitted to save space; telegraphic shorthand is strictly forbidden.
3. **Rigorous Vertical Listing**: Multi-item sequences must be structured using standardized punctuation, capitalization, and syntactic parallelism.
4. **Logical Cohesion**: Explicit connectors establish causal, sequential, or explanatory relationships between clauses.
5. **Precise Article Scoping**: Articles and demonstratives establish unambiguous grammatical boundaries and modifier distribution.

---

## Rule 4.1: Short and Clear Sentences

> **Rule Statement**:  
> **Write short and clear sentences.**

### Core Philosophy
Short sentences reduce the mental processing required to hold clause hierarchies in working memory. Long compound sentences frequently bury critical instructions, hide prerequisites, and cause technicians to skip operational steps.

ASD-STE100 establishes formal word-count limits across documentation types:
- **Procedural Writing** (Section 5): Maximum **20 words** per sentence.
- **Descriptive Writing** (Section 6): Maximum **25 words** per sentence.

---

### Procedural Writing: Direct Imperatives and Decomposition

In procedures, instructions must be delivered directly to the technician using the **imperative form** (command). When an action involves multiple sequential sub-actions, it must be decomposed into discrete steps.

#### The Cover Assembly Decomposition

```
NON-STE (Compound Run-on Instruction, 35 words):
To remove the cover assembly (9), first remove the four screws (10) that attach the cover (11)
to the housing (12), and then, after taking the cover (11) off the housing (12), remove the
preformed packing (13) and throw it away.
```

```
STE CONVERSION (Sequential Decomposition):
1. REMOVE THE COVER ASSEMBLY (9) AS FOLLOWS:
   A. REMOVE THE FOUR SCREWS (10) THAT ATTACH THE COVER (11) TO THE HOUSING (12).
   B. REMOVE THE COVER (11) FROM THE HOUSING (12).
   C. REMOVE AND DISCARD THE PREFORMED PACKING (13).
```

*Linguistic Analysis*: The single confusing non-STE sentence is structured into a logical parent lead-in followed by three clean, sequential imperative steps (`A`, `B`, `C`), eliminating all temporal conjunctions (*and then*, *after taking*).

---

### Descriptive Writing: One Topic per Sentence

In descriptive text, each sentence must address **only one topic (subject or idea)**. The imperative form is strictly prohibited in descriptive sections. Information must be developed progressively across successive sentences.

#### The Side Stay Assembly Decomposition

```
NON-STE (Multiple Topics in One Sentence, 26 words):
The side stay assembly has two folding toggles hinged together and attached with hinges
between the main gear strut and the side stay bracket.
```

```
STE CONVERSION (Progressive Single-Topic Sentences):
THE SIDE STAY ASSEMBLY HAS TWO FOLDING TOGGLES.
THE FOLDING TOGGLES ARE ATTACHED TOGETHER WITH HINGES.
THESE FOLDING TOGGLES ARE ALSO ATTACHED WITH HINGES BETWEEN THE MAIN GEAR STRUT
AND THE SIDE STAY BRACKET.
```

*Topic Progression Analysis*:
- Sentence 1 introduces the entity and its primary components: `THE SIDE STAY ASSEMBLY HAS TWO FOLDING TOGGLES.`
- Sentence 2 describes how the toggles connect to each other: `THE FOLDING TOGGLES ARE ATTACHED TOGETHER WITH HINGES.`
- Sentence 3 describes how the toggles interface with the external structure: `THESE FOLDING TOGGLES ARE ALSO ATTACHED WITH HINGES BETWEEN THE MAIN GEAR STRUT AND THE SIDE STAY BRACKET.`

---

### Concreteness vs. Abstract Speculation

Technical writing must never be abstract, vague, or open to subjective interpretation. Statements must specify exact conditions, actions, and quantifiable boundaries.

| Abstract / Defective Construction | STE Correct Construction | Technical Rationale |
| :--- | :--- | :--- |
| *No leaks are permitted.* | `MAKE SURE THAT THERE ARE NO LEAKS.` | Tells the reader the direct physical verification action. |
| *Different temperatures will change the cure time.* | `WHEN THE TEMPERATURE INCREASES, THE CURE TIME WILL DECREASE.` | Identifies the physical direction of the change. |
| *Different temperatures will change the cure time.* (Precise engineering) | `THE CURE TIME IS 2 HOURS AT A TEMPERATURE OF 20 °C.` | Provides exact, unarguable operational parameters. |

---

## Rule 4.2: No Omissions and No Contractions

> **Rule Statement**:  
> **Do not omit words or use contractions to make your sentences shorter.**

### The Hazard of "Telegraphic" Writing
In a misguided attempt to keep sentences short, writers often slip into "telegraphic style" (dropping articles, auxiliary verbs, or nouns, common in military field cards or logbooks). ASD-STE100 strictly prohibits this. A short sentence that lacks grammatical structure is harder to read, ambiguous, and impossible for translation engines to parse reliably.

---

### Detailed Prohibition Catalog

#### 1. Do Not Omit Nouns
Elliptical sentences lacking an explicit subject or object force the reader to guess what is being discussed.
- *Non-STE*: *Can be a maximum of five inches long.*
- **STE**: `CRACKS CAN HAVE A MAXIMUM LENGTH OF FIVE INCHES.`

#### 2. Do Not Omit Verbs
Leaving verbs out turns sentences into ambiguous noun fragments.
- *Non-STE*: *Rotary switch to INPUT.*
- **STE**: `SET THE ROTARY SWITCH TO INPUT.`

#### 3. Do Not Omit Subjects
Conditional clauses and safety statements must explicitly name the condition or actor.
- *Non-STE*: *If installed, remove the shims.*
- **STE**: `IF SHIMS ARE INSTALLED, REMOVE THEM.`

- *Non-STE (Warning)*:  
  *WARNING: MAKE SURE THAT THE POTABLE WATER SYSTEM IS NOT PRESSURIZED. IF NOT, THIS CAN CAUSE INJURY TO PERSONS.*
- **STE (Explicit Subject)**:  
  `WARNING: MAKE SURE THAT THE POTABLE WATER SYSTEM IS NOT PRESSURIZED. A PRESSURIZED SYSTEM CAN CAUSE INJURY TO PERSONS.`

#### 4. Do Not Omit Articles to Save Space
Dropping articles creates ambiguous noun-verb confusions.
- *Non-STE*: *Remove the bolt and stop.* (Is *stop* a verb telling the reader to cease action, or a noun denoting a mechanical stop?)
- **STE**: `REMOVE THE BOLT AND THE STOP.`

#### 5. Strict Ban on Contractions
Contractions (*don't*, *isn't*, *aren't*, *can't*, *won't*) are colloquial, informal, and frequently misread or overlooked by non-native readers. Write every word in full.
- *Non-STE*: *If your hands are wet, don't touch the USB power adapter.*
- **STE**: `IF YOUR HANDS ARE WET, DO NOT TOUCH THE USB POWER ADAPTER.`

#### Imperative Subject Note
In procedural imperative sentences (`REMOVE THE FLANGE.`), the grammatical subject `[you]` is implicit and universally understood. This is fully compliant. Within dependent clauses, however, the subject must always be explicitly stated (`BEFORE YOU REMOVE THE FLANGE...`).

---

## Rule 4.3: Vertical Lists for Complex Text

> **Rule Statement**:  
> **Use a vertical list for complex text.**

### Rationale & Typographical Clarity
When a sentence contains a series of components, tools, conditions, or sequential tasks, embedding them into a running paragraph creates dense text blocks where items are easily overlooked. A vertical list breaks complex information into visually discrete lines.

---

### Comprehensive Vertical List Formatting Rules

```
VERTICAL LIST SPECIFICATION MATRIX
├── Lead-in Sentence
│   └── Must end with a colon (:) immediately before the first item.
├── Identification Markers
│   └── Must identify each item with dashes (-), bullet points (•), letters (a, b, c), or numbers (1, 2, 3).
├── Capitalization
│   └── EVERY item in the vertical list must start with an UPPERCASE letter.
├── Articles
│   └── Where applicable, include an article before the subject noun of each item.
├── End-Punctuation Architecture
│   ├── Full-sentence items:      Must end with a period (.).
│   ├── Fragment / phrase items:  Must NOT have a period (.) at the end.
│   ├── Comma / Semicolon ban:    NEVER put a comma (,) or semicolon (;) at the end of an item.
│   └── Terminal List Period:     The VERY LAST item in the list ALWAYS ends with a period (.).
└── Syntactic Integrity
    ├── Strict Parallelism:       ALL items must be procedural OR ALL items must be descriptive.
    └── Nesting Prohibition:      Never nest vertical lists inside vertical lists. Use flat structures.
```

---

### Exemplary Vertical List Models

#### Model A: List of Components (Fragment Items)
- *Non-STE*:  
  *The wheel assembly comprises the tire, the tube, the spokes, the spoke fittings, the valve, and the hub.*
- **STE List**:
  ```
  THE WHEEL ASSEMBLY HAS THESE PARTS:
  - The tire
  - The tube
  - The spokes
  - The spoke fittings
  - The valve
  - The hub.
  ```
  *(Notice: Items 1 through 5 have NO periods because they are fragments. Item 6 ends with a period because it terminates the list).*

#### Model B: List of Documents (Bulleted Fragments with Articles)
- **STE List**:
  ```
  THE REPORT MUST INCLUDE:
  • A completed REC-1 form
  • A three-view drawing of the unit
  • A photograph of the unit
  • A copy of the source data.
  ```

#### Model C: Procedural Sequence (Numbered Full-Sentence Steps)
- **STE List**:
  ```
  IF THE RAM AIR TURBINE (RAT) IS RETRACTED:
  (a) Remove the tag.
  (b) Open the isolating valves.
  (c) Slowly and fully extend the RAT and make sure that it does not touch other parts.
  (d) Close the isolating valves.
  (e) Tag the isolating valves with "DO NOT OPERATE."
  (f) Release the DOWN pressure.
  ```
  *(Notice: Every item is a complete imperative sentence and ends with a period).*

#### Model D: Descriptive Sequence (Numbered Descriptive Clauses)
- **STE List**:
  ```
  WHEN THE LANDING GEAR RETRACTS:
  (1) The door operating bar on the leg touches and turns the latch.
  (2) The roller moves out of the slot.
  (3) The second roller keeps the door operating bar in position.
  ```

---

### Critical Operational Constraints on Vertical Lists

#### 1. Prohibition on Mixing Procedures and Descriptions
A vertical list must maintain absolute grammatical uniformity:
- Never place a procedural command (`Remove the seal`) and a descriptive statement (`The seal is lubricated`) within the same vertical list.

#### 2. Negative Safety Commands in Vertical Lists
In safety warnings and cautions, **repeat the negative command (`DO NOT`) on every item**. Do not place `DO NOT:` in the lead-in sentence. Repeating `DO NOT` ensures that technicians scanning the list cannot miss the prohibition.

```
NON-STE (Hazardous Lead-in Negation):
CAUTION: WHEN YOU GET ACCESS TO THE REAR FUSELAGE THROUGH THE ACCESS PANEL, DO NOT:
- Put your feet on the APU line.
- Use the APU line as a handle.

STE (Explicit Repetition of Negative Commands):
CAUTION: WHEN YOU GET ACCESS TO THE REAR FUSELAGE THROUGH THE ACCESS PANEL:
- DO NOT PUT YOUR FEET ON THE APU LINE.
- DO NOT USE THE APU LINE AS A HANDLE.
```

#### 3. Syntactic Attachment to Lead-in Text
Each item in the vertical list must connect cleanly and grammatically to the lead-in text preceding the colon:
- *Non-STE*:  
  *Do not use acetone for cleaning these parts after the repair: the service cabinet, the toilet shrouds with the supports, parts made of polycarbonate.*
- **STE**:
  ```
  AFTER THE REPAIR, DO NOT USE ACETONE TO CLEAN:
  - The service cabinet
  - The toilet shrouds
  - The toilet shroud supports
  - Parts made of polycarbonate.
  ```

#### 4. Prohibition on Nested Sub-Lists (Flat Hierarchy Rule)
Sub-lists nested inside a primary vertical list clutter the document and confuse parsing. Group sub-items parenthetically within the primary list item.

```
NON-STE (Nested List Confusion):
Remove these parts:
- The four screws (3)
- The four washers (4)
- The flange (2) that includes:
  - The two O-rings (6)
  - The seals (7)
- The shims (8)
- The spring (9).

STE (Flattened Single-Level List):
REMOVE THESE PARTS:
- The four screws (3)
- The four washers (4)
- The flange (2) (that includes the two O-rings (6) and the seals (7))
- The shims (8)
- The spring (9).
```

#### 5. Verbal Fragments vs. Full Sentences
An item containing a relative clause with a verb is **not** a full sentence if it lacks an independent main clause. Do not place a period at the end:
```
THE MIDDLE PART OF THE RESERVOIR HAS THE COMPONENTS THAT FOLLOW:
- One check valve that prevents the backflow of fluid
- One air relief valve that opens at a pressure of 25 psi
- One transfer pipe connected to the pressurization manifold.
```

---

## Rule 4.4: Connecting Words and Phrases

> **Rule Statement**:  
> **Use connecting words and connecting phrases to connect sentences that contain related topics.**

### Rationale & Logical Cohesion
While Rule 4.1 mandates short sentences, a sequence of choppy, disconnected clauses can obscure cause-and-effect relationships. Connecting words provide explicit logical bridges between the topic of one sentence and the consequence or progression in the next.

---

### Approved Connectors Catalog

| Connector Type | Approved STE Vocabulary | Function & Semantic Relationship | Exemplary STE Usage |
| :--- | :--- | :--- | :--- |
| **Coordinating Conjunctions** | `AND` | Pure addition / complementary fact | `The localizer course aligns with the centerline of the runway. And the glideslope path is at a constant angle to the threshold of the runway.` |
|  | `BUT` | Contrast / exception | `These safety precautions are the minimum necessary for work in the pit lane. But the local regulations can give other necessary safety precautions.` |
| **Causal Adverbs** | `THEN` | Temporal sequence / subsequent step | `Turn the rotating tube 75 degrees. Then, hold the tube in this position.` |
|  | `THUS` | Logical consequence / direct result | `If the pressure increases, it changes the electrical currents in the transmitter. Thus, the power unit supplies currents to the indicator on the related panel.` |
| **Connecting Phrases** | `AS A RESULT` | Physical or systemic consequence | `When the hydraulic pressure is released, the sequence valve moves to the open position. As a result, the actuators are connected to the hydraulic return.` |
|  | `AT THE SAME TIME` | Synchronous action | `Do these two steps at the same time.` |
| **Demonstratives as Connectors** | `THIS` / `THESE` + Noun | Referential cohesion | `Tag the disassembled parts. This method will help you during the subsequent procedures.` |
|  |  | Hazard connection in safety text | `WARNING: ALWAYS USE PROTECTIVE EQUIPMENT IN THIS AREA. THIS PRECAUTION WILL PREVENT INJURY.` |

---

### Critical Constraints on Connectors
- **Never Invent Unverified Relationships**: Do not add causal connectors (`thus`, `as a result`) if the source text does not establish a definitive causal link.
- **Avoid Ambiguous Connectors**: Unapproved conjunctions like *since* (temporal vs. causal), *as* (temporal vs. causal), and *while* (temporal vs. contrastive) are strictly prohibited. Use `BECAUSE`, `WHEN`, or `DURING`.

---

## Rule 4.5: Articles and Demonstrative Adjectives

> **Rule Statement**:  
> **When applicable, use an article (the, a, an) or a demonstrative adjective (this, these) before a noun or a multi-word noun.**

### Core Function & Boundary Definition
Articles (`a`, `an`, `the`) and demonstrative adjectives (`this`, `these`) establish the syntactic boundaries of noun phrases. Without articles, nouns collide with verbs, adjectives, and other nouns, producing confusing word sequences.

- *Non-STE*: *Turn shaft assembly.* $\rightarrow$ **STE**: `TURN THE SHAFT ASSEMBLY.`
- *Non-STE*: *Data module tells you how to operate unit.* $\rightarrow$ **STE**: `THIS DATA MODULE TELLS YOU HOW TO OPERATE THE UNIT.`

---

### The Three Exceptions: When Articles Must NOT Be Used

#### 1. General Statements and Unspecified Mass Nouns
Do not use articles when referring to substances, concepts, or plural classes in a universal, non-specific context:
- `SOLVENTS CAN CAUSE DAMAGE TO PAINT.`  
  *(No article before "solvents" or "paint" because no specific solvent or paint is identified).*
- `THE MACHINE OPERATES WITH HIGH EFFICIENCY.`  
  *(No article before "high efficiency" because it is a general engineering concept).*
- `THIS SOFTWARE INCREASES PERFORMANCE.`  
  *(No article before "performance" because it refers to an abstract operational quality).*

#### 2. Nouns with Alphanumeric Identifiers (Proper Nouns)

> [!CAUTION]
> A definite article (`THE`) is **incorrect** before a noun when an alphanumeric identifier immediately follows it. The identifier turns the noun phrase into a unique proper noun.

- *Incorrect*: *Tag the circuit breaker 36L7.*
- **STE Correct**: `TAG CIRCUIT BREAKER 36L7.`
- *Incorrect*: *Connect hose to fitting AN818-4D.*
- **STE Correct**: `CONNECT THE HOSE TO FITTING AN818-4D.`

---

### Modifier Scope and Article Distribution in Lists

The placement of articles across a series of nouns determines the precise semantic scope of preceding adjectives:

#### Scenario A: The Single Article (Adjective Modifies ALL Nouns)
```
STE: INSTALL THE NEW O-RINGS (15), SPACERS (14), NUT (13), AND SAFETY PIN (12).
```
*Semantic Scope*: Because only one article (`the`) appears at the beginning of the series, the adjective `NEW` governs **every noun in the list**. The O-rings, the spacers, the nut, and the safety pin must all be new parts.

#### Scenario B: Distributed Articles (Adjective Modifies ONLY the First Noun)
```
STE: INSTALL THE NEW O-RINGS (15), THE SPACERS (14), THE NUT (13), AND THE SAFETY PIN (12).
```
*Semantic Scope*: The repetition of the definite article (`the`) resets the modifier boundary at each noun. Therefore, `NEW` applies **strictly to the O-rings (15)**. The spacers, nut, and safety pin are existing or re-used parts.

#### Scenario C: Short Series vs. Long Series
- **Short sentences (2 items)**: Always use articles before both nouns for maximum contrast:  
  `INSTALL THE NUTS (2) AND THE BOLTS (3).`
- **Long lists of discarded consumables**: The article can appear only before the first item to maintain reading rhythm:  
  `DISCARD THE O-RINGS (3), GASKETS (4), SEALS (7), AND WASHERS (9).`

---

## Sentence Construction Checklist

```
ASD-STE100 SENTENCE VERIFICATION CHECKLIST
[ ] Procedural sentence word count <= 20 words?
[ ] Descriptive sentence word count <= 25 words?
[ ] Contains only ONE central idea or operational action?
[ ] Free of contractions (don't, isn't, can't)?
[ ] No omitted subjects, verbs, objects, or articles?
[ ] If a vertical list is used:
    [ ] Lead-in sentence ends with a colon (:)?
    [ ] Every item capitalized?
    [ ] Fragments have NO periods; full sentences end with periods?
    [ ] Commas and semicolons omitted from line ends?
    [ ] Final item ends with a period (.)?
    [ ] Purely procedural OR purely descriptive (no mixing)?
    [ ] Negative safety warnings repeat DO NOT on every item?
[ ] Alphanumeric designators have NO preceding "the" (Tag circuit breaker 36L7)?
[ ] Adjective scope in series controlled by deliberate article distribution?
```

---

## Cross-Reference Matrix

- **[words.md](words.md)**: Rule 1.2 (Part of Speech), Rule 1.9 (Short Technical Nouns), Rule 1.14 (American English Spelling).
- **[multi-word-nouns.md](multi-word-nouns.md)**: Rule 2.1 (3-Word Clusters), Rule 2.2 (Long Technical Names).
- **[verbs.md](verbs.md)**: Rule 3.2 (Permitted Tenses), Rule 3.6 (Active Voice), Rule 3.7 (Anti-Nominalization).
- **[terminology.md](terminology.md)**: TN-10 (Quoted Text), TN-15 (Official Documents).
- **[dictionary/index.md](dictionary/index.md)**: Approved connecting words and articles.
