# Section 9: General Recommendations (GR-1–GR-8)

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Part 1 — Writing Rules:** Section 9 (General Recommendations, GR-1–GR-8)

---

## 1. Overview and Status of General Recommendations

ASD-STE100 explicitly distinguishes between **mandatory numbered writing rules** (Rules 1.1 through 9.4) and **General Recommendations** (GR-1 through GR-8):

> *"The general recommendations (GR) in this section are not STE rules. They can help you prevent typical errors that writers make."*

### Distinct Status in Authoring and Auditing
- **Numbered Rules (Rules 1.1–9.4):** Mandatory specification requirements. Any deviation constitutes a formal non-compliance.
- **General Recommendations (GR-1–GR-8):** Non-mandatory best-practice guidelines. They highlight linguistic traps—such as omitted conjunctions, ambiguous prepositions, unclear pronoun referents, and false friends—that frequently lead to reader misinterpretation or translation breakdown.
- **Audit Classification:** In compliance reviews, findings related to GRs should be classified as **Advisory / Recommendation**, rather than numbered rule violations, unless the phrasing directly breaches a numbered rule (such as sentence clarity under Rule 4.1 or vocabulary under Rule 1.1).

---

## 2. GR-1: The Conjunction "That"

> **GR-1:** In English, you can use the conjunction “that” to connect new information (in a subordinate clause) to a main clause. You can use this conjunction after verbs. For example: “make sure,” “show,” and “recommend.” Use the conjunction “that” as much as possible to prevent ambiguity.

### 2.1 Principles and Rationale
In conversational English, native speakers routinely omit the relative/complementizer conjunction "that" (e.g., *"Make sure the valve is open"*). 

In technical writing, omitting "that" creates structural ambiguity. The reader cannot immediately identify whether the noun following the verb is a direct object or the subject of a new subordinate clause. Furthermore, in many target languages (such as French, German, Spanish, and Russian), the equivalent conjunction (e.g., *que*, *dass*) is grammatically mandatory. Omitting "that" degrades both human comprehension and automated translation accuracy.

### 2.2 Examples for GR-1
- **Do not write:** `Make sure the valve is open.`  
  **WRITE:** `Make sure that the valve is open.`
- **Do not write:** `The manufacturer recommends you prepare the mixture in an area with good airflow.`  
  **WRITE:** `The manufacturer recommends that you prepare the mixture in an area with good airflow.`
- **Do not write:** `The gauge shows the reservoir is full.`  
  **WRITE:** `The gauge shows that the reservoir is full.`

---

## 3. GR-2: The Preposition "With"

> **GR-2:** In STE, the preposition “with” has three approved meanings: “association or relationship,” “help or sharing,” or “a means or instrument.” When you use the word “with,” make sure that your sentence does not cause ambiguity.

### 3.1 Resolving the Three-Way Ambiguity of "With"
The preposition `with` is one of the most polysemous and ambiguous words in technical English. In ASD-STE100, `with` has three approved senses:
1. **Association or relationship:** Describing a connection, possession, or characteristic.
2. **A means or instrument:** Describing the tool, hardware, or agent used to perform an action.
3. **Help, sharing, or accompaniment:** Describing acting in company, assistance, or simultaneous presence.

When these senses collide in a single sentence, severe operational ambiguity results:

> `Install the panel with the green fasteners.`

This sentence has three conflicting interpretations:
- **Interpretation 1 (Association):** Install the panel that already has green fasteners attached to it.
- **Interpretation 2 (Instrument / Means):** Use the green fasteners as the hardware to secure the panel.
- **Interpretation 3 (Accompaniment):** Install the panel at the same time as you install the green fasteners.

To resolve this ambiguity:
- If **instrument** is intended: `Attach the panel with the green fasteners.` (or: `Install the panel and secure it with the green fasteners.`)
- If **association** is intended: `Install the panel that has green fasteners.`
- If **accompaniment** is intended: `Install the panel and the green fasteners at the same time.`

### 3.2 Absurd or Humorous Ambiguities (Accompaniment vs. Instrument)
Syntactic placement of `with` can create unintentional meaning:
- **Do not write:** `Lift the aircraft at the maximum takeoff weight with passengers.`  
  *Critique:* Suggests the passengers are physically assisting in lifting the aircraft, or that passengers are the lifting mechanism.  
  **WRITE:** `Lift the aircraft at the maximum takeoff weight (passenger weight included).`

### 3.3 Conditions Disguised with "With"
Writers frequently attach a conditional state to the end of a sentence using a prepositional phrase introduced by `with`:
- **Do not write:** `Make sure that the lever does not touch the stop (1) with hydraulic pressure supplied.`  
  **WRITE:** `When you supply hydraulic pressure, make sure that the lever does not touch the stop (1).`  
  *(Converts the prepositional phrase into an explicit prerequisite condition placed first, obeying [Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)).*

### 3.4 Preserving the Primary Action Verb
When restructuring away from vague `with` expressions, do not introduce weak verbs like "use":
- **Do not write:** `Use tool TS9867 to seal the opening.`  
  **WRITE:** `Seal the opening with tool TS9867.`  
  *Rationale:* In STE, instructions must emphasize the primary operational action (`seal`), not the secondary instrumental action (`use`). Here, `with tool TS9867` is an unambiguous instrument phrase.

---

## 4. GR-3: Pronoun Referents and Disambiguation

> **GR-3:** Pronouns refer to a person, a location, or an item that is already in a text. If a pronoun can refer to one or more nouns in a text, it can cause ambiguity. If there is ambiguity, replace the pronoun with the word that it refers to.

### 4.1 Strict Pronoun Rules in STE
1. **Dictionary Control:** Only pronouns explicitly approved in the dictionary may be used (e.g., `it`, `they`, `that`, `these`, `those`). Gendered personal pronouns (`he`, `she`, `him`, `her`) are **not approved**.
2. **Unmistakable Antecedents:** A pronoun must refer back to exactly one clear noun. If a sentence mentions two or more nouns of matching number, using a pronoun creates fatal ambiguity.

### 4.2 Multi-Noun Disambiguation (GR-3)
- **Do not write:** `If you engage the pins incorrectly with the seats, they can become damaged.`  
  *Ambiguity:* Does `they` refer to the pins, the seats, or both?

Depending on the engineering reality, replace the ambiguous pronoun with the exact noun:
- **Option 1 (Pins only):** `If you engage the pins incorrectly with the seats, the pins can become damaged.`
- **Option 2 (Seats only):** `If you engage the pins incorrectly with the seats, the seats can become damaged.`
- **Option 3 (Both):** `If you engage the pins incorrectly with the seats, the pins and seats can become damaged.`

> [!IMPORTANT]
> When auditing or editing text, **never guess which referent was intended**. If the engineering source does not resolve the ambiguity, flag the issue clearly (refer to [Fidelity and Meaning Preservation](fidelity.md#2-key-semantic-attributes-that-must-be-preserved)).

---

## 5. GR-4: The Standalone Demonstrative Pronoun "This"

> **GR-4:** When you use the pronoun “this” in a sentence, make sure that the reader knows the item the pronoun refers to. If “this” can refer to more than one item, give the applicable context again.

### 5.1 The "Broad Reference" Trap
In standard English, writers frequently use `this` to refer vaguely to an entire preceding sentence, idea, or sequence of actions. Non-native speakers and translation tools cannot determine the exact referent.

### 5.2 Remediation Patterns (GR-4)

#### Ambiguous State vs. Action:
- **Do not write:** `Make sure that the cover is not locked (this can cause damage to the probe).`  
  *Ambiguity:* What causes damage? Is it a locked cover or an unlocked cover?  
  **WRITE:** `Make sure that the cover is not locked. If the cover is locked, this can cause damage to the probe.`  
  *Or:* `If the cover is locked, damage to the probe can occur.`

#### Standalone "This" Restructured to Direct Cause:
- **Do not write:** `Do not use crocus cloth on aluminum parts. If you do this, you can cause corrosion on aluminum parts. Crocus cloth contains ferrous oxide.`  
  **WRITE:** `Do not use crocus cloth on aluminum parts. Crocus cloth contains ferrous oxide, which can cause corrosion on aluminum parts.`

### 5.3 Preferred Technical Practice
Avoid using `this` as an isolated pronoun. Instead, use **`this [noun]`** (e.g., `this condition`, `this procedure`, `this assembly`, `this parameter`).

---

## 6. GR-5: False Friends (Interlingual Cognates)

> **GR-5:** A false friend is a word or an expression that looks the same as one in a person’s native language but that has a different meaning in a different language. If you are a non-native English speaker, when you use a word, make sure that this word has the correct meaning in English.

### 6.1 Linguistic Mechanism
Technical documentation is produced by global teams across Europe, the Americas, and Asia. Writers whose native language is Romance-based (French, Spanish, Italian) or Germanic often select English words that phonetically or orthographically resemble terms from their mother tongue, unaware that the English cognate possesses a completely different technical meaning.

### 6.2 Primary Example: "Disposition" (GR-5)
- In French (*disposition*), Spanish (*disposición*), and Italian (*disposizione*), the word routinely denotes a legal provision, formal regulation, instruction, or mandatory requirement.
- In technical English, `disposition` refers to arrangement, temperament, or the final disposal/scrapping of material. It does **not** mean an instruction.
- **Do not write:** `Obey the dispositions of the manufacturer when you use this adhesive.`  
  **WRITE:** `When you use this adhesive, obey the manufacturer’s instructions.`

### 6.3 Authoring Guidance
When reviewing technical manuscripts, evaluate false friends objectively based on technical English accuracy, without making assumptions regarding the author's nationality.

---

## 7. GR-6: Elimination of Latin Abbreviations

> **GR-6:** In English texts, you can find some Latin abbreviations (for example, “e.g.” for “for example,” “i.e.,” for “that is,” and “etc.” for “and so on”). STE recommends that you do not use Latin abbreviations because they can confuse your readers if they do not know them. Always use English words to make the text clear.

### 7.1 The Confusion of Latin Abbreviations
Latin shorthand abbreviations are easily confused:
- Readers frequently swap `e.g.` (*exempli gratia*) and `i.e.` (*id est*).
- `etc.` (*et cetera*) is imprecise technical writing; it fails to define the boundaries of acceptable components or conditions.
- `vs.` (*versus*) is ambiguous regarding comparison, conflict, or electrical polarity.

### 7.2 Approved STE Equivalents (GR-6)

| Latin Abbreviation | Meaning | Mandatory STE Approved Phrasing |
|---|---|---|
| **e.g.** | for example | `for example` |
| **i.e.** | that is | `that is` |
| **etc.** | and other things | `and other items`, `or other colors`, or omit entirely |
| **vs.** | against / compared to | `compared to`, `against` |

#### Examples:
- **Do not write:** `Discard the standard parts (e.g., washers, screws, bolts, and nuts) each time you remove them.`  
  **WRITE:** `Discard the standard parts (for example, washers, bolts, and nuts) each time you remove them.`
- **Do not write:** `These wires can have insulation of different colors (blue, green, red, etc.).`  
  **WRITE:** `These wires can have insulation of different colors. They can be blue, green, red, or other colors.`  
  *Or simply omit:* `These wires can have insulation of different colors.`

---

## 8. GR-7: Inclusive and Gender-Neutral Language

> **GR-7:** Inclusive language prevents bias and makes sure that all persons have respect and representation. The objective of inclusive language is to use neutral and non-discriminatory terms and expressions to promote equality and inclusivity in communication.

### 8.1 ASD-STE100 Compliance with Neutrality
ASD-STE100 inherently enforces gender-neutral language through its strict controlled dictionary:
- **Gendered Pronouns Prohibited:** `he`, `she`, `him`, `her`, `his`, `hers` are **not approved** in the dictionary.
- **Gendered Nouns Prohibited:** General terms like `man`, `woman`, `mankind`, `manpower`, `unmanned` are **not approved**.
  - *(Exception: `man` and `woman` are permitted only when strictly required by medical context, e.g., in aviation physiological documentation).*

### 8.2 Standard Technical Substitutions
- Instead of `manpower` → use `personnel`, `workforce`, `labor`
- Instead of `unmanned aircraft` → use `uncrewed aircraft`, `remotely piloted aircraft`
- Instead of `man-hours` → use `labor hours`, `work hours`
- Direct addressing: Always address the technician directly in the second person (`you`) or via imperative verbs (`Remove the bolt`).

### 8.3 International Standards Alignment (GR-7)
- European Institute for Gender Equality (EIGE, 2019): *Toolkit on Gender-sensitive Communication*
- United Nations (2019): *Disability-inclusive communications guidelines*

---

## 9. GR-8: The Possessive Form (Saxon Genitive)

> **GR-8:** The possessive form (also known as the Saxon genitive) adds an apostrophe and “s” to form the possessive. For example, “refer to the manufacturer’s instructions.” While the possessive form is permitted in STE, make sure that you use it correctly. If you are not sure that your sentence is correct, do not use the possessive form.

### 9.1 Cross-Linguistic Difficulty
Many languages (including Romance and Slavic languages) do not have a possessive apostrophe construction. Readers often struggle to identify whether an apostrophe signifies possession, a contraction, or a plural typo.

### 9.2 Authoring Guidance
- Permitted: `the manufacturer's instructions`, `the aircraft's wing`.
- When in doubt, prefer an explicit prepositional construction: `the instructions of the manufacturer`, or a technical compound modifier: `manufacturer instructions`.

### 9.3 Critical Distinction: Possessives vs. Contractions
> [!CAUTION]
> **Contractions are strictly prohibited in ASD-STE100.**  
> While the possessive apostrophe (`'s`) is permitted under GR-8, contractions (`don't`, `it's`, `can't`, `won't`, `shouldn't`) are completely forbidden. Always write out the full approved words: `do not`, `it is`, `cannot`.
