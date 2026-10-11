# Section 1: Words (Rules 1.1 – 1.14)

> **Rule Specification**: ASD-STE100 Issue 9, Part 1 – Writing Rules, Section 1: Words (Rules 1.1 through 1.14).

---

## Executive Summary & Principles of Controlled Vocabulary

Section 1 defines the foundational lexical framework of ASD-STE100. Simplified Technical English (STE) maintains an intentionally controlled vocabulary to eliminate ambiguity, reduce cognitive overhead for non-native English speakers, and streamline automated translation.

The core linguistic principles governing words in STE are:
1. **One Word, One Meaning**: An approved word has exactly one approved meaning within its specified part of speech.
2. **One Word, One Part of Speech**: Words approved as nouns cannot serve as verbs, and adjectives cannot be used as verbs.
3. **Controlled Technical Vocabulary**: Where core vocabulary is insufficient, writers must draw strictly from standardized **Technical Nouns** (22 categories) and **Technical Verbs** (4 categories).
4. **Consistency**: The same item or action must always be denoted by the exact same term throughout a document set.

---

## Rule 1.1: Which Words Can You Use?

> **Rule Statement**:  
> **Use words that are:**  
> - **Approved in the dictionary**  
> - **Technical nouns**  
> - **Technical verbs.**

### Rationale & Theoretical Basis
Standard English contains well over 500,000 words with vast overlaps in nuance, idioms, and homonyms. This lexical density is a primary source of error in technical operations and aerospace maintenance. STE restricts general vocabulary to a bundled core dictionary (Issue 9 contains 875 approved words and 1,274 unapproved guide words) supplemented by strictly classified technical terminology.

### Compliance Guidelines & Constraints
- **Core Dictionary Words**: Always verify candidate words in the bundled STE dictionary (see [dictionary/index.md](dictionary/index.md)). If an approved word exists to express an idea, you must use it.
- **Technical Terminology Scope**: A word not found in the dictionary is permitted *only* if it satisfies the criteria of an approved **Technical Noun** (see [Rule 1.5](#rule-15-technical-nouns-overview) and [terminology.md](terminology.md)) or an approved **Technical Verb** (see [Rule 1.12](#rule-112-technical-verbs-overview) and [terminology.md](terminology.md)).
- **Subject Field Definition**: In accordance with **ISO 1087:2019**, "subject fields" are defined as specific domains or areas of knowledge with specialized vocabularies (e.g., avionics, hydraulics, naval architecture, mechanical fastening).
- **Company Terminology Governance**: Technical nouns and technical verbs should be cataloged in a company glossary or corporate terminology database. Writers must verify domain authorization before adopting any term not in the STE dictionary.
- **Contextual Necessity**: Technical terms are permitted only when required by the subject field. When an approved core word accurately conveys the meaning, the approved core word takes precedence over technical alternatives.

### Examples

| Classification | Example Word | Compliance Status & Explanation |
| :--- | :--- | :--- |
| **Approved Core Word** | `USE (v)` | Approved core verb in the dictionary (see [dictionary/u-v.md#use](dictionary/u-v.md#use)). |
| **Approved Core Adverb** | `CAREFULLY (adv)` | Approved core adverb meaning "in a careful manner" (see [dictionary/c.md#carefully](dictionary/c.md#carefully)). |
| **Approved Core Noun** | `CHECK (n)` | Approved core noun meaning a test or verification (see [dictionary/c.md#check](dictionary/c.md#check)). |
| **Technical Noun** | `engine` (TN) | Permitted technical noun under TN-01 / TN-02 (see [terminology.md](terminology.md)). |
| **Technical Verb** | `ream` (TV) | Permitted technical verb under TV-01 a (manufacturing: remove material; see [terminology.md](terminology.md)). |
| *Unapproved Core Word* | *utilize* (v) | *Non-STE*. Must use approved core verb `USE`. |
| *Unapproved Verb Usage* | *check* (v) | *Non-STE as a verb*. Must use approved verb such as `MAKE SURE THAT...`, `EXAMINE`, or `MEASURE`. |

---

## Rule 1.2: Part of Speech

> **Rule Statement**:  
> **Use approved words from the dictionary only as the specified part of speech.**

### Rationale & Functional Shift
In standard English, "functional shift" (conversion) freely transforms nouns into verbs (`to test`), verbs into nouns (`a cut`), or adjectives into verbs (`to dim`). In STE, this flexibility is strictly prohibited. Uncontrolled functional shift creates syntactic ambiguity, confuses parsing algorithms, and impedes human comprehension.

### Compliance Guidelines & Constraints
1. **Check the Parenthetical Tag**: Every entry in the dictionary specifies its approved grammatical category in parentheses: `(n)`, `(v)`, `(adj)`, `(adv)`, `(pron)`, `(art)`, `(prep)`, `(conj)` (see [dictionary/index.md](dictionary/index.md)).
2. **The "Test" Principle (Noun vs. Verb)**:
   - `TEST` is approved **only as a noun** `(n)` (see [dictionary/t.md#test](dictionary/t.md#test)). It is **prohibited as an ordinary verb**.
   - *Non-STE*: *Test the system for leaks.*
   - **STE**: `DO THE LEAK TEST OF THE SYSTEM.` or `DO A TEST FOR LEAKS IN THE SYSTEM.`
3. **The "Check" Principle (Noun vs. Verb)**:
   - `CHECK` is approved **only as a noun** `(n)` (see [dictionary/c.md#check](dictionary/c.md#check)), meaning a test or examination to make sure that something is correct, safe, or in good condition.
   - `check` is **strictly unapproved as a verb** `(v)`. Instead, use approved verbs such as `MAKE SURE THAT...`, `EXAMINE`, `DO A CHECK OF`, `MEASURE`, or `VERIFY` (where authorized under TV-04 or domain glossary).
   - *Non-STE*: *Check the pressure of the tire.*
   - **STE**: `MEASURE THE PRESSURE OF THE TIRE.` or `DO A CHECK OF THE TIRE PRESSURE.`
   - *Non-STE*: *Check that all fasteners are tight.*
   - **STE**: `MAKE SURE THAT ALL FASTENERS ARE TIGHT.`
4. **The "Carefully" Principle (Approved Adverb)**:
   - Writers sometimes mistakenly believe that all `-ly` adverbs are prohibited in STE.
   - `CAREFULLY` is an **approved core adverb** `(adv)` in ASD-STE100 (meaning: "in a careful manner"; see [dictionary/c.md#carefully](dictionary/c.md#carefully)).
   - **STE**: `REMOVE THE COVER CAREFULLY.`
   - **STE**: `CAREFULLY PUSH THE ASSEMBLY INTO THE HOUSING.`
5. **The "Dim" Principle (Adjective vs. Verb)**:
   - `DIM` is approved **only as an adjective** `(adj)`. It is **prohibited as a verb**.
   - *Non-STE*: *Dim the lights.*
   - **STE**: `SET THE LIGHTS TO THE DIM POSITION.`
6. **Dual-Category Words in the Dictionary**:
   - Some words are approved under multiple parts of speech, each with its own entry (e.g., `CLEAN` is approved as a verb `(v)` and as an adjective `(adj)`).
   - The word's syntactic position in the clause establishes its function and meaning:
     - Verb position: `CLEAN THE INNER SURFACE OF THE CONTAINER.`
     - Adjective position: `MAKE SURE THAT THE AREA IS CLEAN.`
7. **Replacement Strategy for Unapproved Words**:
   - **Word-for-Word Substitution**: Occurs when an unapproved word has an approved synonym in the identical part of speech.
     - *Non-STE*: *A value of 2 mm is acceptable.*
     - **STE**: `A VALUE OF 2 MM IS PERMITTED.` (`ACCEPTABLE` (adj) $\rightarrow$ `PERMITTED` (adj)).
   - **Sentence Restructuring**: Required when the approved alternative belongs to a different part of speech.
     - *Non-STE*: *Make sure that the valve is operable.*
     - **STE**: `MAKE SURE THAT THE VALVE CAN OPERATE.` (`OPERABLE` (adj) $\rightarrow$ `OPERATE` (v)).
8. **Lookup Procedure for Missing Words**:
   - Look up the unapproved word in an authoritative standard English dictionary (such as *Merriam-Webster*).
   - Identify its exact intended definition.
   - Find the closest synonym approved in the STE dictionary (see [dictionary/index.md](dictionary/index.md)).
   - Use the approved STE word directly, or rephrase the sentence completely using approved syntax.
   - *Strict Semantic Guardrail*: The alternative selected must not change technical meaning. If meaning is compromised, restructure using different approved vocabulary.

---

## Rule 1.3: Approved Meaning

> **Rule Statement**:  
> **Use approved words only with their approved meanings.**

### Rationale & Semantic Drift
Polysemy (a single word having multiple distinct senses) is the leading linguistic contributor to technical misunderstandings. In STE, each approved word is restricted to a precise, documented definition. Using an approved word with an unapproved colloquial or secondary sense violates STE just as severely as using an unapproved word.

### Compliance Guidelines & Constraints
- **Restricted Semantic Range**: Always inspect the approved meaning column in the dictionary (see [dictionary/index.md](dictionary/index.md)). Do not assume that standard colloquial meanings are valid.
- **The "Follow" vs. "Obey" Mandate**:
   - The verb `FOLLOW` has only one approved meaning: *"come after, go after"* (spatial, physical, or sequential movement).
   - `FOLLOW` is strictly **forbidden** when referring to instructions, procedures, regulations, or manuals. You must use `OBEY` (*"to do that which the procedures or instructions tell you"*).
- **The "About" Constraint**:
   - `ABOUT` is approved only as a preposition meaning *"concerned with"*.
   - It cannot be used to denote approximations (use `APPROXIMATELY`) or radial rotation (use `AROUND`).

### Examples

| Intended Action | Non-STE (Unapproved Meaning) | STE Approved Construction | Explanatory Rationale |
| :--- | :--- | :--- | :--- |
| Adhering to safety rules | *Follow the safety instructions.* | `OBEY THE SAFETY INSTRUCTIONS.` | `FOLLOW` does not mean to comply; use `OBEY`. |
| Sequential order in text | — | `DO THE PROCEDURES THAT FOLLOW:` | Approved sequential meaning of `FOLLOW`. |
| Physical navigation | — | `FOLLOW THE GREEN LIGHTS TO THE NEAREST STAIRCASE.` | Approved physical tracking meaning of `FOLLOW`. |
| Measurement approximation | *Drain about 2 liters of fuel.* | `DRAIN APPROXIMATELY 2 LITERS OF FUEL FROM THE TANK.` | `ABOUT` cannot mean approximation. Use `APPROXIMATELY`. |
| Rotational movement | *Rotate the shaft about its axis.* | `TURN THE SHAFT AROUND ITS AXIS.` | `ABOUT` cannot denote rotation. Use `AROUND`. |

---

## Rule 1.4: Forms of Verbs and Adjectives

> **Rule Statement**:  
> **Use only the approved forms of verbs and adjectives.**

### Verb Forms
The dictionary explicitly defines allowable morphology for every approved verb across four functional forms:

$$\text{Infinitive / Imperative} \quad\longrightarrow\quad \text{Simple Present} \quad\longrightarrow\quad \text{Simple Past} \quad\longrightarrow\quad \text{Past Participle (Adjective only)}$$

#### Conjugation Architecture

```
REMOVE (v)
├── (To) Remove / Remove  [Infinitive / Imperative]
├── Removes               [Simple Present: 3rd person singular]
├── Removed               [Simple Past]
└── Removed               [Past Participle: Adjective function only]

GIVE (v)
├── (To) Give / Give      [Infinitive / Imperative]
├── Gives                 [Simple Present: 3rd person singular]
├── Gave                  [Simple Past]
└── Given                 [Past Participle: Adjective function only]
```

- **Absence equals Prohibition**: If a form is omitted from the dictionary entry, it is not permitted.
- **The 6 Permitted Verb Uses**:
  1. The infinitive: `TO ADJUST`
  2. The imperative: `ADJUST THE LINKAGE.`
  3. The simple present: `THE UNIT ADJUSTS...` / `THEY ADJUST...`
  4. The simple past: `THE OPERATOR ADJUSTED...`
  5. The simple future: `THE SYSTEM WILL ADJUST...`
  6. The past participle **strictly as an adjective**: `THE ADJUSTED LINKAGE`
- **Prohibited Forms**: Present perfect (`has adjusted`), past perfect (`had adjusted`), continuous/progressive (`is adjusting`), conditional modals (`would adjust`). See [verbs.md](verbs.md).

### Adjective Comparison Forms
- **Inflected Forms**: Adjectives that take comparative (`-er`) and superlative (`-est`) inflections list them explicitly in parentheses in their dictionary entries:
  - `SLOW (adj)` $\rightarrow$ `(SLOWER, SLOWEST)`
- **Periphrastic Forms (`MORE` / `MOST`)**: Adjectives that do not list parenthetical forms form comparison periphrastically using `MORE` and `MOST`. Because `MORE` and `MOST` are approved dictionary words, these constructions do not require separate dictionary listings.
- **Color Adjectives**: Color terms are treated as Technical Nouns (Category 17); comparative and superlative inflections (*blacker*, *reddest*) are strictly **prohibited**.

---

## Rule 1.5: Technical Nouns Overview

> **Rule Statement**:  
> **You can use words that you can include in a technical noun category.**

### Rationale & Scope
The STE dictionary cannot catalog the millions of components, materials, physical phenomena, and standards existing across aerospace and defense engineering. Rule 1.5 provides a formal taxonomic mechanism permitting domain-specific terminology under 22 strictly defined categories.

### Compliance Guidelines & Constraints
- **Application in Writing**: Technical nouns are permitted without restriction in both **procedural** and **descriptive** text, provided they qualify under at least one of the 22 categories.
- **Typographical Rule**: Technical nouns must be written in lowercase in standard sentences. Capital letters are permitted **only** when mandatory for official proper designations, standardized document titles, or acronyms/abbreviations.
- **Precedence**: When an approved core dictionary word expresses the same concept, use the approved core word rather than introducing a technical noun.

### Summary of the 22 Technical-Noun Categories

| Code | Category Name | Primary Scope & Representative Examples |
| :---: | :--- | :--- |
| **TN-01** | Official parts information | Illustrated parts catalog items, drawings: `bolt`, `filter`, `engine`, `switch`, `propeller`. |
| **TN-02** | Vehicles, machines, and locations | Operational units and locations: `aircraft`, `fuselage`, `cockpit`, `deck`, `helicopter`. |
| **TN-03** | Tools and support equipment | Maintenance tools, GSE: `access ladder`, `drill`, `gauge`, `rigging pin`, `torque wrench`. |
| **TN-04** | Materials, consumables, unwanted material | Chemical/raw substances, contaminants: `aluminum alloy`, `debris`, `grease`, `sealant`. |
| **TN-05** | Facilities, infrastructure, logistics | Operational areas, freight: `airport`, `hangar`, `service bay`, `shipping`, `storage`. |
| **TN-06** | Systems, components, circuits | Subsystems, functional modes: `air conditioning`, `latch`, `reverse mode`, `standby mode`. |
| **TN-07** | Mathematical, scientific, engineering terms | Physics, geometry, calculations: `acceleration`, `capacitance`, `flutter`, `torque`, `voltage`. |
| **TN-08** | Navigation and geographic terms | Spatial orientation, routes: `altitude`, `coordinates`, `glideslope`, `heading`, `pitch`. |
| **TN-09** | Numbers, units of measurement and time | Quantitative markers: `92`, `degree (°)`, `hour (h)`, `kilogram (kg)`, `meter (m)`. |
| **TN-10** | Quoted text | Immutable physical placards, screen UI: `EXIT sign`, `ON position`, `FAULT legend`. |
| **TN-11** | Professional roles, entities | Job titles, organizations: `captain`, `crew chief`, `EASA`, `FAA`, `manufacturer`, `operator`. |
| **TN-12** | Parts of the body | Anatomical structures: `blood`, `ear`, `eyes`, `hand`, `lungs`, `skin`. |
| **TN-13** | Common personal effects, food | Daily personal items: `clothing`, `matches`, `mineral water`, `shampoo`, `wine`. |
| **TN-14** | Medical terms | Clinical symptoms, pathologies: `allergy`, `asthma`, `dermatitis`, `nausea`, `virus`. |
| **TN-15** | Official documents, standards | Structural doc parts, manuals: `Acceptance Test`, `caution`, `chapter`, `figure`, `warning`. |
| **TN-16** | Environmental and operational conditions | Weather, atmospheric states: `atmosphere`, `humidity`, `ice`, `lightning`, `turbulence`. |
| **TN-17** | Colors | Color identification: `black`, `cyan blue`, `dark brown`, `gray`, `red`, `white`. |
| **TN-18** | Damage terms | Mechanical degradation, defects: `chafing`, `corrosion`, `crack`, `dent`, `fraying`, `scratch`. |
| **TN-19** | Computer science, ICT | Software, networking, hardware: `backup file`, `database`, `e-mail`, `firewall`, `screen`. |
| **TN-20** | Civil and military operations | Tactical, defense, IPS concepts: `armed forces`, `bomb`, `checkpoint`, `mission`, `patrol`. |
| **TN-21** | Law and regulations | Contracts, legal compliance: `compliance`, `contract`, `court`, `damages`, `statute`, `waiver`. |
| **TN-22** | Animals, plants, life forms | Biological flora/fauna: `bird`, `cat`, `horse`, `insect`, `termite`, `wombat`. |

> *For exhaustive criteria, boundaries, and contextual restrictions for each category, see [terminology.md](terminology.md).*

---

## Rule 1.6: Nonapproved Words Inside Technical Nouns

> **Rule Statement**:  
> **Use a word that is not approved in the dictionary, only when it is a technical noun or part of a technical noun.**

### Rationale & Contextual Re-qualification
A word unapproved as a general vocabulary term may be indispensable when functioning as a standardized technical term or modifying component within a technical noun phrase. Rule 1.6 governs this interface between general and technical lexicons.

### Detailed Case Analyses

#### Case 1: Polysemous Words with General vs. Technical Meanings (`BASE`)
- In general vocabulary, `base` is unapproved; its approved alternative is `BOTTOM (n)`.
  - *Non-STE*: *Make sure that the two spigots at the base of the unit engage.*
  - **STE**: `MAKE SURE THAT THE TWO SPIGOTS AT THE BOTTOM OF THE UNIT ENGAGE.`
- Under Technical Noun Category 7 (Mathematical / Geometric):
  - **STE**: `THE BASE OF THE TRIANGLE IS 5 CM.` (Valid TN-07).
- Under Technical Noun Category 5 (Facilities / Infrastructure):
  - **STE**: `ACCESS TO THE BASE IS PERMITTED BETWEEN 9 A.M. AND 6 P.M.` (Valid TN-05).

#### Case 2: Technical vs. General Standby Personnel (`BACKUP`)
- In general vocabulary, `backup` is unapproved; alternatives are `EMERGENCY (n)` or `AUXILIARY (adj)`.
  - *Non-STE*: *For this procedure, make sure that one person is available as backup.*
  - **STE**: `TWO PERSONS ARE NECESSARY TO DO THIS PROCEDURE.` (Restructured without unapproved term).
- Under Technical Noun Category 19 (ICT):
  - Single-word technical noun: `DO THE BACKUP OF THE COMPUTER AT REGULAR INTERVALS.`
  - Compound technical noun: `KEEP THE BACKUP FILE IN A SAFE AREA.`

#### Case 3: Adjectival Modifiers in Official Component Names (`MAIN`)
- In general vocabulary, `main` is unapproved; the approved alternative is `PRIMARY (adj)`.
  - *Non-STE*: *The laptop has these main parts:*
  - **STE**: `THE LAPTOP HAS THESE PRIMARY PARTS:`
- Inside a standardized Technical Noun (Category 1 / 2):
  - **STE**: `RETRACT THE MAIN LANDING GEAR.`
  - *Critical Constraint*: It is **strictly forbidden** to replace `main` with `primary` here (*primary landing gear*). Modifying established engineering names compromises technical accuracy and violates industry configuration baselines.

#### Case 4: Nonapproved Words within Compound Engineering Terms (`RELATIVE`)
- The word `relative` is not in the STE dictionary.
- However, in engineering analysis:
  - **STE**: `THIS PROCEDURE GIVES INSTRUCTIONS TO IDENTIFY THE RELATIVE ANGULAR POSITIONS OF THE POWER-TURBINE ROTOR DISKS.`
  - Permitted because `relative angular position` is an integrated technical noun (Category 7).

---

## Rule 1.7: Do Not Convert Technical Nouns into Verbs

> **Rule Statement**:  
> **Do not use words that are technical nouns as verbs.**

### Rationale & Verbal Functional Shift Prohibition
Converting technical nouns into verbs (verbing nouns) produces colloquial, informal technical jargon that lacks precise operational meaning and confounds international maintainers.

### Compliance Guidelines & Constraints
- A technical noun can function **only** as a noun or as an adjectival modifier within another technical noun.
- **Sentence Restructuring Requirement**: Use an approved general verb combined with the technical noun.

### Examples

| Prohibited Construction | STE Correction | Structural Transformation |
| :--- | :--- | :--- |
| *Oil the steel surfaces.* | `APPLY OIL TO THE STEEL SURFACES.` | Use approved verb `APPLY` + technical noun `oil` (TN-04). |
| *If you think it will snow...* | `IF YOU THINK THAT SNOW WILL FALL...` | Use approved verb `FALL` + technical noun `snow` (TN-16). |
| *Wire the cable to the structure.* | `ATTACH THE CABLE TO THE STRUCTURE WITH WIRE.` | Use approved verb `ATTACH` + technical noun `wire` (TN-01). |
| *Grease the fasteners.* | `APPLY GREASE TO THE FASTENERS.` | Use approved verb `APPLY` + technical noun `grease` (TN-04). |
| *Clamp the cable in position.* | `PUT CLAMPS ON THE CABLE TO HOLD IT IN POSITION.` | Use approved verb `PUT` + technical noun `clamps` (TN-01). |

### The Dual-Category Exception (Homographs)
When a word is independently categorized as both a Technical Noun (under Rule 1.5) and a Technical Verb (under Rule 1.12), both usages are valid:
- **DRILL as Technical Noun** (Category 3: Tools):
  - **STE**: `IF THE SURFACE IS HARD, USE A CARBIDE DRILL.`
- **DRILL as Technical Verb** (Category 1 a: Manufacturing: remove material):
  - **STE**: `DRILL A HOLE AT THE INTERSECTION OF THE TWO LINES.`

---

## Rule 1.8: Established Industry Terminology

> **Rule Statement**:  
> **Use technical nouns that are approved in your company, industry, or subject field.**

### Rationale & Corporate Authority
Technical nomenclature must reflect authoritative baseline documentation (e.g., Illustrated Parts Catalogs (IPC), Component Maintenance Manuals (CMM), engineering drawings, official customer glossaries). Writers must not invent colloquial descriptive names when standard industry terminology exists.

### Examples
- **STE**: `THE FRONT PANEL OF THE PHONE HAS A TOUCHSCREEN AND A HOME BUTTON.`
  - Both `touchscreen` and `home button` are authoritative technical nouns approved in consumer electronics engineering.

---

## Rule 1.9: Short and Clear Technical Names

> **Rule Statement**:  
> **When you must select a technical noun, use one which is short and easy to understand.**

### Rationale & Cognitive Load Reduction
Over-specifying parts in operational text slows down reading and increases error rates during task execution. When engineering callouts, index numbers, or accompanying illustrations unambiguously establish component identity, omit redundant descriptive modifiers.

### Operational Strategy
- **When Index Numbers Exist**: Strip catalog adjectives down to the head noun.
- *Non-STE*: *Remove the four stainless steel pan head machine screws (10) that attach the metallic machined flange (15) to the front housing cover (20).*
- **STE**: `REMOVE THE FOUR SCREWS (10) THAT ATTACH THE FLANGE (15) TO THE COVER (20).`
  - *Linguistic Analysis*: The callouts `(10)`, `(15)`, and `(20)` tie directly to the illustrated parts breakdown. The modifiers *stainless steel pan head machine* and *metallic machined* are unnecessary in procedural steps.
- **When No Illustration Exists**: Retain only 1 or 2 essential distinguishing adjectives to avoid confusion between similar adjacent components.

---

## Rule 1.10: Avoid Regional, Slang, or Jargon Words

> **Rule Statement**:  
> **Do not use regional, slang, or jargon words as technical nouns.**

### Rationale & Global Comprehension
Technical documentation authored in one country is frequently executed by technicians worldwide who speak English as a foreign language. Regionalisms and workshop slang obscure meaning and present severe safety hazards.

### Examples

| Non-STE Regional / Slang Term | Contextual Meaning | STE Standard Technical English |
| :--- | :--- | :--- |
| *Attach a choker to the heavy machinery...* | Logging cable | `DURING LOGGING OPERATIONS, ATTACH A CABLE TO THE HEAVY MACHINERY TO HOLD THE LOGS IN THEIR POSITION.` |
| *Do not brick the router.* | IT slang: render inoperable | `AFTER THE FIRMWARE UPDATE, DO NOT SET THE ROUTER TO OFF.` |
| *Remove your gear from the work area.* | Workshop slang for tools | `REMOVE YOUR TOOLS AND EQUIPMENT FROM THE WORK AREA.` |
| *Bench the LRU.* | Colloquial maintenance verb | `DO A TEST OF THE LRU ON THE TEST BENCH.` |

---

## Rule 1.11: Consistency of Naming

> **Rule Statement**:  
> **Do not use different technical nouns for the same item.**

### Rationale & The Literary Variety Fallacy
In creative writing, varying vocabulary avoids repetition. In technical authoring, **synonym variation is hazardous**. If a component is called an "actuator" in step 1, a "servo control unit" in step 2, and a "control unit" in step 3, maintainers may assume three distinct assemblies are involved.

### Structural Demonstration

#### Non-STE (Synonym Switching)
```
1. Make sure that the servo control unit is in the open position.
2. Do the operational test of the actuator.
3. Disconnect the control unit from the test rig.
```
*(The reader is forced to decipher whether 1, 2, or 3 distinct components are being manipulated).*

#### STE (Absolute Consistency)
```
1. MAKE SURE THAT THE ACTUATOR IS IN THE OPEN POSITION.
2. DO THE OPERATIONAL TEST OF THE ACTUATOR.
3. DISCONNECT THE ACTUATOR FROM THE TEST RIG.
```

---

## Rule 1.12: Technical Verbs Overview

> **Rule Statement**:  
> **You can use verbs that you can include in a technical verb category.**

### Definition & Scope
A technical verb denotes a specified engineering process, computational action, or domain-specific physical manipulation applicable to a defined subject field. Technical verbs are governed by all grammatical and tense restrictions outlined in Section 3 (see [verbs.md](verbs.md)).

### The Four Technical-Verb Categories

```
TECHNICAL VERBS (Rule 1.12)
├── TV-01: Manufacturing Processes
│   ├── a) Remove material (drill, grind, mill, ream, unsolder)
│   ├── b) Add material (flame, insulate, remetal, retread)
│   ├── c) Attach material (braze, crimp, solder, weld)
│   ├── d) Change properties (anneal, cure, heat-treat, magnetize)
│   ├── e) Change surface finish (buff, burnish, passivate, plate, polish)
│   └── f) Change shape (blend, cast, extrude, spin, stamp)
├── TV-02: Computer Processes & Applications
│   ├── a) Input & output (click, enter, press, swipe, tap, type)
│   ├── b) UI & applications (close, copy, drag, maximize, open, paste, save)
│   └── c) System operations (boot, debug, download, format, reboot, upload)
├── TV-03: Subject Field Instructions
│   ├── a) Engineering, math, science (bisect, convert, detect, modulate)
│   ├── b) Medical (disinfect, intubate, operate, sterilize)
│   ├── c) Civil & military (aim, arm, disable, dry-motor, wet-motor)
│   ├── d) Navigation (approach, descend, fly, hover, land, taxi, trim)
│   ├── e) Automotive & railway (accelerate, brake, crank, decouple, steer)
│   └── f) Energy, oil, gas (compress, distill, extract, pump)
└── TV-04: Law & Regulations
    └── (acknowledge, comply with, conform to, enforce, regulate, sign, waive)
```

### Core Hierarchy & Precedence Rules
1. **Approved Core Verb Precedence**: If an approved verb from the dictionary accurately communicates the action, **do not use a technical verb**.
   - *Non-STE*: *If you detect broken wires, repair them.* (Unapproved technical verb in generic inspection).
   - **STE**: `IF YOU FIND BROKEN WIRES, REPAIR THEM.` (Approved core verb `FIND`).
   - *Valid Technical Usage of DETECT*: `THE SECURITY SCANNER DETECTS METAL OBJECTS.` (Accurate technical verb under TV-03 a).
2. **Precision vs. General Verbs**: Do not substitute vague verbs for precise engineering processes.
   - *Non-STE*: *Machine the hole until it has a diameter of 8.00 +/- 0.003 mm.*
   - **STE**: `REAM THE HOLE UNTIL IT HAS A DIAMETER OF 8.00 +/- 0.003 MM.` (`REAM` specifically describes finishing with a reamer).
3. **Approved Verb + Technical Noun Priority**: If possible, use an approved core verb and an approved technical noun rather than coining a technical verb:
   - `PUT CLAMPS ON` instead of *clamp*
   - `APPLY GREASE TO` instead of *grease*
   - `ATTACH WITH WIRE` instead of *wire*
4. **Context-Specific Technical Verbs**:
   - `ENTER`:
     - IT Context (TV-02 a): `ENTER YOUR PASSWORD.`
     - Spatial Movement (General): *Do not enter the engine test area...* $\rightarrow$ `DO NOT GO INTO THE ENGINE TEST AREA WITHOUT APPROVAL.`
   - `RESPOND`:
     - Navigation/Communications (TV-03 d): `IF THE TOWER DOES NOT RESPOND, USE A DIFFERENT CHANNEL.`
     - Generic Instrument Operation (General): *If the instrument fails to respond...* $\rightarrow$ `IF THE INSTRUMENT DOES NOT OPERATE CORRECTLY, DO A TEST.`

---

## Rule 1.13: Do Not Use Technical Verbs as Nouns

> **Rule Statement**:  
> **Do not use technical verbs as nouns.**

### Rationale & Syntactic Boundary
Grammatical ambiguity increases sharply when verbs are forced into nominal roles. A technical verb must never serve as the subject, direct object, or prepositional object in a sentence.

### Nominalization vs. Direct Action
- *Non-STE*: *Give the hole a 0.20-inch ream.*
- **STE**: `REAM THE HOLE TO A 0.20-INCH DIMENSION.`

### The Past Participle Adjective Permitted Exception
Rule 1.13 explicitly permits using the **past participle form of a technical verb as an adjective** modifying a technical noun:
- **STE**: `LUBRICATE THE REAMED HOLE.`
  - Analysis: `reamed` is the past participle of technical verb `ream` acting as an adjectival modifier; `reamed hole` is an approved technical noun phrase.

### Dual-Category Words (Technical Verb and Technical Noun)
Certain terms independently exist in both categories:
- **STE (Noun)**: `MAKE SURE THAT THE PLATE IS NOT DAMAGED.` (`plate` = TN-01, official parts).
- **STE (Verb)**: `THERE ARE TWO METHODS TO PLATE THE RING NUT (2).` (`plate` = TV-01 c, manufacturing: attach material).

---

## Rule 1.14: American English Spelling Standard

> **Rule Statement**:  
> **Use American English spelling unless other official directives tell you differently.**

### Baseline Standard
The STE dictionary standardizes exclusively on **American English spelling** as codified in *Merriam-Webster's Collegiate Dictionary*.

### Key Orthographic Contrasts

| Word Class / Feature | British English (*Non-STE*) | American English (**STE Standard**) |
| :--- | :--- | :--- |
| `-re` vs. `-er` | *fibre*, *centre*, *calibre*, *litre* | `fiber`, `center`, `caliber`, `liter` |
| `-our` vs. `-or` | *colour*, *armour*, *flavour* | `color`, `armor`, `flavor` |
| `-ise` vs. `-ize` | *pressurise*, *organise*, *stabilise* | `pressurize`, `organize`, `stabilize` |
| `-ence` vs. `-ense` | *defence*, *licence* (n) | `defense`, `license` |
| Double consonants | *travelling*, *cancelled* | `traveling`, `canceled` |

### Official Directives Exception
Writers are authorized to diverge from American spelling *only* when mandated by:
1. Specific contract deliverables requiring national orthography (e.g., UK MoD, Commonwealth procurement).
2. Customer style guides or organizational technical publication specifications.

### The Immutable Quoted Text Exception (Rule 8.6 Interface)
When transcribing text that appears physically on an aircraft placard, cockpit instrument, hardware nameplate, or computer interface display, **never alter the spelling**:
- If a physical placard reads `LIFT HERE FOR EMERGENCY ACCESS - FLAVOUR RETENTION SCREEN`, the quoted string must retain the original spelling verbatim inside quotation marks:
  - **STE**: `IDENTIFY THE PLACARD WITH THE TEXT "COLOUR DISPLAY UNIT".`

---

## Summary Cross-Reference Matrix

| Rule | Primary Focus | Linked Sections / Reference Files |
| :--- | :--- | :--- |
| **1.1** | Vocabulary baseline | [dictionary/index.md](dictionary/index.md), [terminology.md](terminology.md) |
| **1.2** | Part of speech | [dictionary/index.md](dictionary/index.md), [dictionary/c.md#check](dictionary/c.md#check), [dictionary/c.md#carefully](dictionary/c.md#carefully), [dictionary/t.md#test](dictionary/t.md#test), [verbs.md](verbs.md) |
| **1.3** | Approved meaning | [dictionary/index.md](dictionary/index.md), [sentences.md](sentences.md) (Rule 4.4) |
| **1.4** | Verb/adjective forms | [verbs.md](verbs.md) (Rules 3.1, 3.2, 3.3) |
| **1.5** | Technical nouns | [multi-word-nouns.md](multi-word-nouns.md), [terminology.md](terminology.md) |
| **1.6** | Nonapproved words in TN | [terminology.md](terminology.md) |
| **1.7** | TN to verb prohibition | [verbs.md](verbs.md) (Rule 3.7) |
| **1.8** | Industry naming | [multi-word-nouns.md](multi-word-nouns.md) (Rule 2.2) |
| **1.9** | Short technical nouns | [multi-word-nouns.md](multi-word-nouns.md) (Rule 2.1) |
| **1.10** | Slang / jargon ban | [sentences.md](sentences.md) (Rule 4.1) |
| **1.11** | Naming consistency | [sentences.md](sentences.md) (Rule 4.1) |
| **1.12** | Technical verbs | [verbs.md](verbs.md), [terminology.md](terminology.md) |
| **1.13** | TV to noun prohibition | [verbs.md](verbs.md) (Rule 3.3) |
| **1.14** | American spelling | [sentences.md](sentences.md) (Rule 4.2) |
