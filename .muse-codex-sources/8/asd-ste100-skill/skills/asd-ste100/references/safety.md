# Section 7: Safety Instructions (Rules 7.1–7.3)

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Part 1 — Writing Rules:** Section 7 (Safety Instructions, Rules 7.1–7.3)

---

## 1. Overview and Scope

Safety instructions alert technicians, maintenance personnel, and operators to hazardous conditions, life-threatening operations, and actions that can cause physical damage to aircraft, vehicles, machinery, or tools. 

In technical manuals, safety instructions usually appear in procedural texts directly preceding the hazardous work step (refer to [Section 5: Procedural Writing](procedures.md)). They rarely appear in descriptive prose, unless the text quotes official safety directives or describes system safety features.

ASD-STE100 defines three mandatory rules for safety instructions (Rules 7.1 through 7.3):
- **Rule 7.1:** Classify the severity of risk accurately using standardized signal words.
- **Rule 7.2:** Begin the safety instruction with an actionable command or a prerequisite condition.
- **Rule 7.3:** Clearly explain the specific hazard and its consequence.

---

## 2. Rule 7.1: Risk Level Identification and Signal Words

> **Rule 7.1:** Use an applicable word (for example, “warning” or “caution”) to identify the level of risk.

### 2.1 The Two Primary STE Risk Categories
In aerospace and defense technical publications, risk severity is categorized into two standard levels:

| Signal Word | Scope of Risk | Consequence |
|---|---|---|
| **WARNING** | Risk of personal injury or death | Harm to humans (operators, crew, bystanders, maintenance personnel) |
| **CAUTION** | Risk of damage to objects | Damage to components, tools, equipment, test units, or the product |

### 2.2 Combined Risks Rule
If a single hazardous condition or error presents **both** a risk of personal injury/death and a risk of equipment damage:
> **MANDATE:** Always classify the safety instruction as a **WARNING** under Rule 7.1. The protection of human life always takes precedence over equipment preservation.

### 2.3 Sector Variations and International Standards
STE recognizes that other industries (such as civil manufacturing, consumer electronics, rail, automotive, oil and gas) may use different safety terms or multi-tier hierarchies (e.g., `DANGER`, `WARNING`, `CAUTION`, `NOTICE`):
- When writing for other sectors or complying with specific national or international standards, authors may use the mandated industry terms or graphical safety symbols, provided that the text **strictly obeys Rules 7.1 through 7.3**.
- Key relevant international standards:
  - **ISO 45001:2018:** *Occupational health and safety management systems — Requirements with guidance for use*
  - **ANSI Z535 Series:** *American National Standards for Safety Signs and Colors* (specifically ANSI Z535.4 and Z535.6)
  - **ISO 3864 (Parts 1–4):** *Graphical symbols — Safety colours and safety signs*

### 2.4 Typography and Presentation: Convention vs. Rule
In ASD-STE100 Issue 9, all examples of Warnings and Cautions are printed in **UPPERCASE LETTERS**:
> `WARNING: BEFORE YOU FILL THE LIQUID OXYGEN SYSTEM, PUT ON A FACE MASK AND PROTECTIVE CLOTHING...`

However, the standard explicitly clarifies:
> *"All examples in this section are in uppercase letters, but STE does not give rules for formatting. Refer to the applicable specifications for technical publications, style guides, and other official directives."*

Uppercase styling, colored banners, bordered callout boxes, and warning pictograms are governed by organizational house styles or publication specifications (such as S1000D, ATA iSpec 2200, or MIL-STD-38784), **not** by ASD-STE100 itself.

### 2.5 Risk Analysis and Misclassification Traps
A dangerous practice in legacy technical documentation is underclassifying a severe safety hazard as a mere "Caution" because the immediate physical object damaged is equipment, while ignoring secondary explosive or toxic risks to human life.

#### Case Study: Oxygen Tube Contamination
- **Non-STE (Dangerous Underclassification):**  
  `CAUTION: EXTREME CLEANLINESS OF OXYGEN TUBES IS IMPERATIVE.`  
  *Critique:* Labeled as a caution. The wording is abstract, vague, and conceals the actual physical hazard.
- **STE (Correct Risk Analysis & Specific Warning):**  
  `WARNING: MAKE SURE THAT THE OXYGEN TUBES ARE FULLY CLEAN. OXYGEN AND GREASE MAKE AN EXPLOSIVE MIXTURE. AN EXPLOSION CAN CAUSE INJURY OR DEATH.`  
  *Rationale:* Oxygen under pressure in the presence of hydrocarbons (grease or oil) ignites spontaneously, causing violent explosion. Because an explosion can kill or maim maintenance technicians, classifying this as a "Caution" violates Rule 7.1. The safety instruction must be upgraded to a **WARNING**.

---

## 3. Rule 7.2: Actionable Opening (Command or Condition)

> **Rule 7.2:** Start a safety instruction with a clear and accurate command or condition.

### 3.1 Immediate Actionability
A technician reading a safety block needs an immediate instruction on what to do or what not to do. A safety instruction must never begin with background history, theoretical explanations, or passive statements.

Every safety instruction must begin with:
1. **A direct imperative command** (e.g., `DO NOT...`, `ALWAYS KEEP...`, `MAKE SURE...`), OR
2. **A clear prerequisite condition followed immediately by an imperative command** (e.g., `BEFORE YOU...`, `WHILE YOU...`, `WHEN YOU...`) in accordance with [Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions).

### 3.2 Prohibitions and Precise Operational Scope
Prohibitions must be explicit and unambiguous. Tell the reader exactly what action is forbidden, rather than using vague words like "avoid".

#### Approved Command Openings:
- `WARNING: DO NOT SWALLOW THE SOLVENT. ALWAYS MAKE SURE THAT YOU KNOW THE SAFETY PRECAUTIONS AND FIRST AID INSTRUCTIONS FOR SOLVENTS. SOLVENTS ARE POISONOUS AND CAN CAUSE INJURY OR DEATH.`  
  *(Opens with direct negative command: "DO NOT SWALLOW").*
- `WARNING: ALWAYS KEEP YOUR HANDS AND FEET AWAY FROM THE BLADE. WHEN THE MOTOR OPERATES, THE BLADE TURNS AND CAN CAUSE INJURY.`  
  *(Opens with direct positive command: "ALWAYS KEEP").*
- `CAUTION: DO NOT USE BLEACH OR CLEANSERS THAT CONTAIN CHLORINE TO CLEAN THE UNIT. THESE CLEANING AGENTS CAN CAUSE CORROSION.`  
  *(Opens with direct prohibition: "DO NOT USE BLEACH...").*

### 3.3 Conditions Preceding Commands
If a safety instruction applies only under specific circumstances, during a specific phase of maintenance, or before beginning an operation, **state the condition first**, followed by a comma ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions) / Rule 7.2):

#### Approved Condition Openings:
- `WARNING: BEFORE YOU FILL THE LIQUID OXYGEN SYSTEM, PUT ON A FACE MASK AND PROTECTIVE CLOTHING. LIQUID OXYGEN CAN CAUSE IRRITATION OF THE RESPIRATORY TRACT AND EYE IRRITATION.`  
  *(Condition: "BEFORE YOU FILL...", followed by command: "PUT ON...").*
- `WARNING: WHILE YOU USE THE SPRAY PAINT, POINT THE SPRAY AWAY FROM YOUR FACE. THE SPRAY PAINT CAN CAUSE INJURY TO YOUR EYES.`  
  *(Condition: "WHILE YOU USE...", followed by command: "POINT...").*
- `CAUTION: BEFORE YOU OPERATE THE GROUND TEST UNIT, MAKE SURE THAT THE PRESSURE REGULATOR IS SET TO ZERO. THIS PRECAUTION WILL PREVENT DAMAGE TO THE UNIT.`  
  *(Condition: "BEFORE YOU OPERATE...", followed by command: "MAKE SURE...").*
- `CAUTION: WHEN YOU ASSEMBLE THE UNIT, DO NOT LET THE PARTS FALL. IF THEY FALL, PERMANENT DAMAGE TO THE PARTS CAN OCCUR.`  
  *(Condition: "WHEN YOU ASSEMBLE...", followed by command: "DO NOT LET...").*

---

## 4. Rule 7.3: Specific Risk and Result Explanation

> **Rule 7.3:** Give an explanation to show the risk or possible result.

### 4.1 The Psychology of Compliance
Technicians are much more likely to obey a safety directive when they understand the physical consequence of non-compliance. Telling a technician "Do not do X" without explanation invites complacency. Stating "Do not do X. If you do X, toxic gas will be released and can cause injury or death" provides a compelling rationale.

### 4.2 Two-Part Structure of an STE Safety Instruction
An effective safety block consists of two distinct components:
1. **The Mitigation (Rule 7.2):** The command or condition telling the reader how to stay safe.
2. **The Consequence (Rule 7.3):** The factual explanation of the physical hazard and the resulting injury or damage.

#### Breakdown of Safety Instruction Examples:

| Signal Word | Mitigation (Rule 7.2 Command/Condition) | Consequence Explanation (Rule 7.3 Specific Risk & Result) |
|---|---|---|
| **WARNING** | `DO NOT SWALLOW THE SOLVENT. ALWAYS MAKE SURE THAT YOU KNOW THE SAFETY PRECAUTIONS AND FIRST AID INSTRUCTIONS FOR SOLVENTS.` | `SOLVENTS ARE POISONOUS AND CAN CAUSE INJURY OR DEATH.` |
| **CAUTION** | `DO NOT USE BLEACH OR CLEANSERS THAT CONTAIN CHLORINE TO CLEAN THE UNIT.` | `THESE CLEANING AGENTS CAN CAUSE CORROSION.` |
| **WARNING** | `WHILE YOU USE THE SPRAY PAINT, POINT THE SPRAY AWAY FROM YOUR FACE.` | `THE SPRAY PAINT CAN CAUSE INJURY TO YOUR EYES.` |
| **CAUTION** | `WHEN YOU ASSEMBLE THE UNIT, DO NOT LET THE PARTS FALL.` | `IF THEY FALL, PERMANENT DAMAGE TO THE PARTS CAN OCCUR.` |
| **WARNING** | `BEFORE YOU FILL THE LIQUID OXYGEN SYSTEM, PUT ON A FACE MASK AND PROTECTIVE CLOTHING.` | `LIQUID OXYGEN CAN CAUSE IRRITATION OF THE RESPIRATORY TRACT AND EYE IRRITATION.` |

### 4.3 Prohibition on Fabricating Unverified Hazards
While Rule 7.3 requires explaining the risk, **authors must never invent or assume hazards that are unsupported by engineering source data** (refer to [Fidelity and Meaning Preservation](fidelity.md#3-the-10-critical-failure-patterns)):
- If source engineering documentation does not state the failure mechanism (e.g., whether a falling part suffers cracked housings, deformed seals, or loss of calibration), do not invent a specific metallurgical diagnosis. Use an approved, accurate description supported by context (e.g., `PERMANENT DAMAGE TO THE PARTS CAN OCCUR`).
- Never introduce hypothetical biological, chemical, or mechanical threats without source data.

---

## 5. Interaction with Sentence Length (Rule 5.1)

Safety instructions appearing in procedural sequences are **procedural text**. Therefore:
- Every sentence within a WARNING or CAUTION must adhere to the **maximum limit of 20 words** ([Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures)).
- Words are counted using the Section 8 conventions (e.g., numbers with units count as one word; alphanumeric callouts count as one word; refer to [Section 8: Punctuation and Word Count](punctuation-and-counting.md#7-rule-86-the-seven-special-counting-groups-1-word-each)).
- If a warning requires extensive explanation, divide the explanation into multiple short sentences (each $\le$ 20 words) rather than a single long sentence.

---

## 6. Safety Instruction Summary Checklist

| Rule | Requirement | Verification Question |
|---|---|---|
| **7.1** | Correct risk level identification | Is personal injury/death classified as WARNING? Is equipment damage classified as CAUTION? If both, is WARNING used? |
| **7.2** | Actionable opening | Does the instruction start immediately with an imperative command or a condition followed by a command? Are vague words eliminated? |
| **7.3** | Explicit risk and result | Does the instruction explain the physical hazard and consequence? Is all risk information grounded in source engineering data? |
| **5.1** | Length compliance | Does every individual sentence in the safety block contain 20 words or fewer? |
