# Meaning Preservation and Fidelity in ASD-STE100

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Governing Standard Sections:** Part 1, [Section 1: Words](words.md), [Section 5: Procedural Writing](procedures.md), [Section 6: Descriptive Writing](descriptions.md), [Section 7: Safety Instructions](safety.md), [Section 8: Punctuation and Word Count](punctuation-and-counting.md), [Section 9: Writing Practices](writing-practices.md)

---

## 1. The Core Fidelity Principle

> **Core Principle:** Simplified Technical English (STE) must **never** compromise technical accuracy, operational safety, or legal fidelity.

ASD-STE100 was created to eliminate misinterpretations in high-stakes operational environments, such as commercial aviation and defense systems. Simplifying language does not mean lowering technical standards, removing necessary caveats, or altering engineering intent.

When rewriting text into ASD-STE100:
1. **Meaning is immutable.** If a rule of grammar or word count conflicts with maintaining technical precision, precision takes precedence.
2. **Simplification is structural and lexical, not semantic.** You simplify the syntax and vocabulary used to convey the information; you do not simplify the engineering reality being described.
3. **Uncertainty must remain uncertain.** Never upgrade an author's hedge or diagnostic hypothesis into an established fact to satisfy a length limit or eliminate complex verb forms.
4. **Do not invent missing details.** If the source text is vague, keep the ambiguity transparent or escalate it as an open finding. Never invent actors, causes, frequencies, or values.

---

## 2. Key Semantic Attributes That Must Be Preserved

Every ASD-STE100 author and reviewer must evaluate rewrites against eight invariant semantic attributes:

```
+--------------------------------------------------------------------------+
|                       EIGHT INVARIANT ATTRIBUTES                         |
+--------------------------------------------------------------------------+
| 1. Actor, Action, and Objects    | 5. Conditions and Prerequisites       |
| 2. Identity, Values, and Units   | 6. Negation and Quantifier Scope      |
| 3. Modality, Confidence, Hedges  | 7. Concurrency and Sequence           |
| 4. Obligation vs Recommendation  | 8. Protected and Verbatim Content     |
+--------------------------------------------------------------------------+
```

### 2.1 Actor, Action, and Objects
You must preserve:
- **Who** performs the action (operator, automated control system, certified maintenance engineer, flight crew).
- **What** exact physical or logical operation occurs (install, remove, energize, disconnect, calculate, inspect).
- **Which** component, target, or data structure is acted upon (direct object), and for whom or where (indirect object/destination).

*Violation Example:*  
Converting "The ground crew signals the pilot before chocks are removed" into "Signal the pilot. Remove the chocks." transfers the action to the reader and obscures the distinct operational responsibilities of the ground crew and flight crew.

### 2.2 Identity, Numbers, Exact Values, Units, and Tolerances
Never round numbers, drop tolerances, or substitute vague descriptive terms for precise engineering metrics:
- Retain exact values: `0.05 mm`, `120 psi ± 5 psi`, `12 V DC`, `4.20 Nm`, `100 ms to 150 ms`.
- Retain exact part identifiers, serial numbers, and pin designators: `Part No. 45-89021`, `Connector J2`, `Pin 14`.
- Never substitute qualitative adjectives (`tight`, `sufficient`, `adequate`, `high`) for quantitative measurements.

### 2.3 Modality, Confidence, and Hedges
Hedges express the degree of certainty, risk, or probability known to the engineer or author:
- `May`, `might`, `can`, `could`, `likely`, `possible`, `probable`, `suspected`.
- **Epistemic modality is content.** If a diagnostic manual states "The fuel valve may be jammed," this indicates an unconfirmed fault hypothesis. Upgrading this to "The fuel valve is jammed" makes an unverified assumption that could lead technicians down the wrong troubleshooting path.
- Under ASD-STE100 Issue 9:
  - Use `can` or `it is possible that` for capability and possibility.
  - When preserving uncertainty, do not strip the hedge to meet the 20-word limit of Rule 5.1. Restructure the sentence instead.

### 2.4 Obligations vs Recommendations vs Permissions
Technical and regulatory documentation strictly differentiates mandatory actions from advisory recommendations:
- **Obligation (Mandatory):** Expressed through the imperative mood (`Do this step.`) or approved modal constructions. Indicates mandatory compliance required by airworthiness directives, regulations, or equipment survival.
- **Recommendation (Advisory):** Expressed through phrases such as `we recommend that you...` or `it is recommended to...`. Tells the operator what is best practice without legal mandate.
- **Permission (Optional):** Expressed through `you can` or `it is permitted to`.
- **Critical rule:** Do **not** strengthen a recommendation into a mandatory command unless explicitly authorized by the engineering authority. Doing so can introduce unwarranted warranty liabilities or regulatory violations.

### 2.5 Conditions and Prerequisites
Preserve both the logical relationship and the operational scope of conditions:
- **`If` vs `Only if`:** `If A, then B` means A is sufficient to trigger B. `Only if A, then B` means A is strictly necessary for B. Confusing the two alters operating logic.
- **Prerequisite attachment:** Place conditions *before* commands ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)). Never detach a conditional clause from the subsequent actions it governs.
- If a condition applies to multiple steps, make that scope explicit across every governed instruction.

### 2.6 Negation and Scope of Quantifiers
Scope errors in negation drastically change technical requirements:
- **`Not all` vs `None`:** "Not all components require lubrication" means the universal claim fails (at least one component does not require lubrication); it does **not** assert that some components do require lubrication. It is fundamentally distinct from "No components require lubrication" (which asserts that zero components require lubrication). Do not gloss "not all" as "some do, some do not", because "not all" simply negates universal applicability without introducing an affirmative positive claim about remaining members.
- **`Some` vs `All`:** Retain exact set boundaries.
- **`Neither...nor` vs `Not...or`:** Ensure exclusions apply to the intended items without creating unintended combinations.

### 2.7 Concurrency and Sequence
- **Simultaneous actions:** [Rule 5.2](procedures.md#3-rule-52-one-instruction-per-sentence) provides an explicit exception allowing two actions in one sentence when they are simultaneous or tightly coupled (e.g., "Push and hold switch A and turn knob B"). Splitting simultaneous actions into sequential sentences can cause physical damage or failure to enter required system modes.
- **Sequential actions:** Keep sequential steps in their exact chronological order. Do not reverse the order of operations for syntactic convenience.

### 2.8 Protected Content (Immutable Text)
The following categories of content are **protected** and must remain verbatim:
1. Command-line strings, arguments, and shell scripts (`kubectl get pods -n kube-system`).
2. Code snippets, variable names, function signatures, and keywords (`pthread_mutex_lock()`).
3. Hardware register names, bus identifiers, and pin designations (`CR0`, `I2C1_SDA`).
4. File names, file paths, directory structures, and URIs (`/etc/systemd/system.conf`).
5. User interface strings, button labels, screen titles, and physical placards (quoted or capitalized exactly as they appear on the hardware or software interface).
6. Exact quoted error messages, status strings, and telemetry codes (`HTTP 503 Service Unavailable`, `ERR_CONNECTION_RESET`).

---

## 3. The 10 Critical Failure Patterns

In ASD-STE100 authoring and review, ten recurring failure patterns account for the vast majority of fidelity errors. Every author and reviewer must check for these patterns:

| ID | Failure Pattern | Core Risk | Governing Rules |
|:---|:---|:---|:---|
| **FP-01** | Uncertainty turned into certainty | Diagnostic misdirection; premature conclusions | Rules 1.1, 4.1 |
| **FP-02** | Recommendation turned into requirement | Unauthorized legal/regulatory obligation | Rules 5.3, 9.1 |
| **FP-03** | `If` turned into `only if` | Logical narrowing; excludes valid operational paths | Rules 4.1, 5.4 |
| **FP-04** | `Not all` turned into `none` | Inverted logic; critical maintenance omitted | Rules 4.1, 9.1 |
| **FP-05** | Simultaneous actions made sequential | Operation fails or hardware damaged | Rule 5.2 |
| **FP-06** | Condition detached from subsequent steps | Unconditional execution of conditional steps | Rule 5.4 |
| **FP-07** | Measurement limit moved into an optional note | Technician skips limit; equipment damage | Rules 5.1, 5.5 |
| **FP-08** | Invented cause, actor, frequency, or mechanism | False diagnostic information | Rules 4.1, 6.1 |
| **FP-09** | Non-exhaustive list made exhaustive | Omits valid components or scenarios | Rules 4.1, 6.2 |
| **FP-10** | Distinct technical operations merged via synonyms | Loss of technical distinction | Rules 1.11, 9.4 |

---

### Detailed Analysis of Failure Patterns

#### FP-01: Uncertainty Turned into Certainty
- **The Pitfall:** The author cuts hedges ("may", "might", "can be", "possibly") to shorten a sentence or eliminate unapproved modal verbs, converting an unconfirmed hypothesis into a statement of fact.
- **Original Source:**  
  *The auxiliary generator may have overheated due to insufficient cooling airflow.*
- **Erroneous "Simplified" Text:**  
  *The auxiliary generator overheated because the cooling airflow stopped.*  
  *(Error: Upgrades an unconfirmed hypothesis into certainty, and invents that airflow stopped).*
- **Compliant STE Rewrite:**  
  *It is possible that the auxiliary generator became too hot because of low airflow.*  
  *(Or: The auxiliary generator can be too hot because the airflow was low.)*
- **Preservation Principle:** Epistemic hedges indicate the limits of knowledge. Never state as fact what the engineer described as a possibility.

#### FP-02: Recommendation Turned into Requirement
- **The Pitfall:** Converting advisory wording ("we recommend", "should") into direct imperatives ("Do X"), thereby transforming a non-mandatory recommendation into a mandatory directive.
- **Original Source:**  
  *Operators should inspect the hydraulic return lines every 500 flight hours.*
- **Erroneous "Simplified" Text:**  
  *Do an inspection of the hydraulic return lines every 500 flight hours.*  
  *(Error: Makes the inspection a mandatory maintenance task with legal and maintenance logging implications).*
- **Compliant STE Rewrite:**  
  *We recommend that you do an inspection of the hydraulic return lines every 500 flight hours.*
- **Preservation Principle:** Keep the advisory status explicit unless the responsible engineering or airworthiness authority explicitly changes the task requirement.

#### FP-03: `If` Turned into `Only If`
- **The Pitfall:** Converting a conditional trigger into an exclusive conditional trigger, falsely implying that the action is forbidden under all other circumstances.
- **Original Source:**  
  *If the red warning indicator illuminates, replace the hydraulic filter cartridge.*
- **Erroneous "Simplified" Text:**  
  *Replace the hydraulic filter cartridge only if the red indicator comes on.*  
  *(Error: Forbids routine scheduled filter replacement or replacement during overhaul).*
- **Compliant STE Rewrite:**  
  *If the red indicator comes on, replace the hydraulic filter cartridge.*
- **Preservation Principle:** `If` establishes a sufficient condition; `only if` establishes an exclusive necessary condition. Never add exclusivity to an ordinary condition.

#### FP-04: `Not All` Turned into `None`
- **The Pitfall:** Misinterpreting partial negation and converting it into absolute negation.
- **Original Source:**  
  *Not all interface cards in the chassis support live replacement during operation.*
- **Erroneous "Simplified" Text:**  
  *The interface cards do not support replacement during operation.*  
  *(Error: Falsely claims zero cards support hot-swapping).*
- **Compliant STE Rewrite:**  
  *Not all interface cards support live replacement during operation.*  
  *(Or: Do not replace all interface cards during operation. Check the manual for each card.)*
- **Preservation Principle:** "Not all" simply means that the universal proposition fails (at least one member does not satisfy the predicate); it does not introduce an affirmative claim that other members do satisfy it, and it must never be collapsed into "none" (zero members). Preserve the exact scope of negation without introducing unsupported positive assertions or absolute exclusions.

#### FP-05: Simultaneous Actions Made Sequential
- **The Pitfall:** Splitting two concurrent actions into separate sentences under the mistaken belief that Rule 5.2 bans all compound sentences.
- **Original Source:**  
  *Depress the test button while simultaneously adjusting the potentiometer until the LED flashes green.*
- **Erroneous "Simplified" Text:**  
  *Push the test button. Adjust the potentiometer until the LED flashes green.*  
  *(Error: Releasing the button before adjusting potentiometer prevents the circuit from entering test mode).*
- **Compliant STE Rewrite:**  
  *Push and hold the test button and adjust the potentiometer until the LED flashes green.*  
  *(Rule 5.2 explicitly permits two actions in one sentence when they are simultaneous or coupled).*
- **Preservation Principle:** When actions must occur concurrently to achieve the physical or electrical result, keep them joined using the Rule 5.2 exception.

#### FP-06: Condition Detached from Subsequent Steps
- **The Pitfall:** Writing a condition before step 1, but letting the condition syntactically expire so that subsequent steps appear mandatory under all conditions.
- **Original Source:**  
  *When working in freezing conditions, preheat the hydraulic manifold, bleed the lines, and verify return pressure.*
- **Erroneous "Simplified" Text:**  
  *When you work in cold conditions, preheat the hydraulic manifold. Bleed the lines. Check the return pressure.*  
  *(Error: Steps 2 and 3 are detached from the condition and read as universal instructions).*
- **Compliant STE Rewrite:**  
  *When you work in cold conditions, do these steps:*  
  *(1) Preheat the hydraulic manifold.*  
  *(2) Bleed the lines.*  
  *(3) Check the return pressure.*
- **Preservation Principle:** Ensure multi-step conditional scope is syntactically bound to all affected steps, either via a colon and structured sub-steps or explicit repetition of the condition.

#### FP-07: Measurement Limit Moved into an Optional Note
- **The Pitfall:** An author splits an overly long instruction by moving essential technical specifications or limits into a Note, violating Rule 5.5.
- **Original Source:**  
  *Torque the four mounting bolts in an alternating cross pattern to a final specification of 28 Nm.*
- **Erroneous "Simplified" Text:**  
  *Instruction: Tighten the four attachment bolts in a cross pattern.*  
  *NOTE: The maximum torque is 28 Nm.*  
  *(Error: Technicians are trained that Notes are non-mandatory; bolts may be under-torqued or over-torqued).*
- **Compliant STE Rewrite:**  
  *Tighten the four attachment bolts in a cross pattern to a torque of 28 Nm.*
- **Preservation Principle:** Operational limits, tolerances, and mandatory values belong in the procedural instruction, never in an advisory Note.

#### FP-08: Invented Cause, Actor, Frequency, or Mechanism
- **The Pitfall:** An author tries to "clarify" a terse or vague sentence by inventing explanatory context that the source did not provide.
- **Original Source:**  
  *Error 0x4B: Authentication failed.*
- **Erroneous "Simplified" Text:**  
  *Error 0x4B: The database password was not correct.*  
  *(Error: Invented that the password was the cause; failure could be expired certificate, clock skew, or network timeout).*
- **Compliant STE Rewrite:**  
  *Error 0x4B: The authentication process failed.*
- **Preservation Principle:** Never add a fact that the source did not state. Terse text must be rewritten cleanly without speculative additions.

#### FP-09: Non-Exhaustive List Made Exhaustive
- **The Pitfall:** Removing open-ended framing ("such as", "including", "for example") and replacing it with a definitive, closed list.
- **Original Source:**  
  *Debris such as metal shavings, carbon dust, or seal fragments can foul the scavenge pump.*
- **Erroneous "Simplified" Text:**  
  *These particles cause damage to the scavenge pump: metal particles, carbon dust, and seal pieces.*  
  *(Error: Falsely implies that no other type of debris can foul the scavenge pump).*
- **Compliant STE Rewrite:**  
  *Unwanted material can cause damage to the scavenge pump. Examples of this material are metal particles, carbon dust, and seal pieces.*
- **Preservation Principle:** Open-ended examples illustrate; closed lists define boundaries. Do not convert an illustrative example into an exclusive list.

#### FP-10: Distinct Technical Operations Merged Through Generic Synonym Swaps
- **The Pitfall:** Applying a blanket word substitution that maps distinct engineering operations (calibrate, align, verify, validate, adjust, inspect) into a single generic verb like "check".
- **Original Source:**  
  *First verify the sensor bus address, and then calibrate the sensor zero point.*
- **Erroneous "Simplified" Text:**  
  *First check the sensor bus address. Then check the sensor zero point.*  
  *(Error: "Checking" the zero point is not the same as calibrating it; calibration alters physical or software parameters).*
- **Compliant STE Rewrite:**  
  *First make sure that the sensor bus address is correct. Then calibrate the zero position of the sensor.*  
  *(Calibrate is a valid technical verb under Category TV-03; do not destroy technical distinction).*
- **Preservation Principle:** ASD-STE100 permits approved technical verbs (Section 1, Rule 1.12). Never flatten specialized engineering operations into generic words that obscure physical actions.

---

## 4. The "Untouched Good Input" Rule

> **Untouched Good Input Rule:** If the source text already complies with ASD-STE100 Issue 9 rules and preserves technical meaning, **do NOT rewrite it merely to demonstrate activity**.

Unsolicited edits to already-compliant text introduce multiple hazards:
1. **Unnecessary review churn:** Every modified sentence requires re-review by systems engineers and technical certifiers.
2. **Translation memory disruption:** In enterprises with existing translation memories, changing compliant phrasing invalidates pre-translated segments, incurring significant translation costs.
3. **Risk of introduced errors:** Every edit carries an inherent risk of inadvertent semantic drift.

### Authoring Guidance:
- When checking text, identify compliant passages as compliant:
  ```markdown
  Lines 12–18: Compliant with ASD-STE100 Issue 9. Kept as-is.
  ```
- Do not swap one approved word for another approved synonym (e.g., changing approved `remove` to approved `disconnect` when `remove` is already correct).
- Respect the original text's formatting, layout, and document structure.

---

## 5. Fidelity Checklist for Authors and Reviewers

Before finalizing any ASD-STE100 text, complete this step-by-step verification:

```
[ ] 1. ACTORS & RESPONSIBILITIES
    Are all actors correctly identified? Has any task been misassigned to the wrong role?

[ ] 2. MEASUREMENTS & TOLERANCES
    Are all numbers, units, tolerances, and dimensions exactly identical to the source?

[ ] 3. MODALITY & HEDGES
    Did any "may", "can", "might", or "possible" get converted into a definite assertion?
    Is uncertainty maintained without exaggeration or suppression?

[ ] 4. OBLIGATION INTEGRITY
    Are mandatory steps still mandatory? Are advisory recommendations still advisory?
    Was any "should" improperly strengthened into an imperative without authorization?

[ ] 5. CONDITIONS & PREREQUISITES
    Does every condition precede its command (Rule 5.4)?
    Are multi-step conditions clearly bound to all governed steps?
    Is "if" kept as "if" rather than "only if"?

[ ] 6. LOGICAL QUANTIFIERS
    Are "not all", "none", "some", and "all" preserved without boundary shifts?
    Is "not all" correctly treated as failure of universality rather than "some do, some do not"?

[ ] 7. OPERATIONAL CONCURRENCY
    Are simultaneous actions joined (Rule 5.2)? Did any coupled action get split into sequential steps?

[ ] 8. TECHNICAL TERMINOLOGY
    Are technical verbs and nouns properly retained under approved categories?
    Were distinct technical procedures (verify vs calibrate vs adjust) preserved?

[ ] 9. PROTECTED CONTENT
    Are command lines, file paths, code, hardware registers, and UI strings intact?

[ ] 10. NO INVENTED FACTS
    Is every stated fact, cause, and mechanism directly traceable to the source text?
```
