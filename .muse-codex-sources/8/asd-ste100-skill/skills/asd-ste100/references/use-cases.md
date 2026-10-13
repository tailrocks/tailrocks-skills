# ASD-STE100 Use Cases Across Technical Disciplines

**Standard Reference:** ASD-STE100, Issue 9 (2025-01-15)  
**Governing Standard Sections:** Part 1, Sections 1–9; [General Recommendations (GR-1–GR-8)](general-recommendations.md); [Fidelity and Meaning Preservation](fidelity.md)

---

## 1. Overview: Controlled Language Beyond Aviation

ASD-STE100 was originally engineered for aircraft maintenance documentation, where ambiguity in written instructions has catastrophic consequences. However, the linguistic root causes of human and automated error—lexical polysemy, ambiguous clause attachments, multi-word noun stacks, and obscured conditions—are universal across all technical disciplines.

This document provides rigorous, practical guidance for applying ASD-STE100 across eight critical technical communication contexts:
1. Software and API Documentation
2. Runbooks, Playbooks, and Standard Operating Procedures (SOPs)
3. Diagnostic Error Messages, Alerts, and Log Events
4. Technical Reports, Post-Mortems, and Incident Reviews
5. Release Notes and Changelogs
6. Commit Messages and Pull Request Descriptions
7. Agent Instructions, System Prompts, and Tool Definitions
8. Technical Copy Preparation for Machine and Human Translation

---

## 2. The Eight Practical Use Cases

```
+--------------------------------------------------------------------------+
|                      EIGHT TECHNICAL COMMUNICATION USE CASES             |
+--------------------------------------------------------------------------+
| UC-01: Software & API Documentation    | UC-05: Release Notes & Changelogs|
| UC-02: Runbooks, Playbooks, & SOPs     | UC-06: Commits & PR Descriptions|
| UC-03: Error Messages & System Alerts  | UC-07: AI Agent Instructions    |
| UC-04: Incident Reviews & Post-Mortems | UC-08: Translation Preparation  |
+--------------------------------------------------------------------------+
```

---

### Use Case 1: Software and API Documentation

#### Operational Context
API references, endpoint guides, SDK documentation, and developer setup manuals. Readers include engineers of diverse linguistic backgrounds, automated code generators, and LLM coding assistants.

#### Typical Pitfalls
- **Noun stacking:** Uncontrolled chaining of nouns describing endpoints or configurations (e.g., `user session token revocation endpoint handler configuration`).
- **Nominalization:** Turning actions into nouns (`perform validation of the request payload` instead of `validate the payload`).
- **Ambiguous prerequisites:** Placing authentication steps or token requirements after the command.
- **Inventing missing parameters:** Adding hypothetical API keys or parameters not specified in the schema.

#### Specific Rule Focus
- **[Rule 2.1](multi-word-nouns.md#2-rule-21-maximum-three-words-in-noun-clusters):** Maximum of three words in a noun cluster.
- **[Rule 3.7](verbs.md#8-rule-37-active-verb-preference-and-anti-nominalization):** Use approved verbs to express actions.
- **[Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions):** State conditions and prerequisites before instructions.
- **[Rule 8.6](punctuation-and-counting.md#7-rule-86-the-seven-special-counting-groups-1-word-each):** Protected counting for code identifiers, URLs, and HTTP methods.

#### Worked Scenario

*Original Text (Non-STE):*
> In order to authenticate your application, an HTTP POST request must be transmitted to the `/api/v1/auth/tokens` endpoint utilizing your previously provisioned client secret credentials, whereupon the server will provide an authentication bearer token in the JSON response payload.

*Identified Issues / Rule Violations:*
1. Passive voice with modal: `must be transmitted` ([Rule 3.6](verbs.md#7-rule-36-active-voice-and-the-unknown-agent-exception)).
2. Complex introductory phrase: `In order to authenticate your application` ([Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences)).
3. Complex multi-word nouns and phrasal packaging: `previously provisioned client secret credentials` ([Rule 2.1](multi-word-nouns.md#2-rule-21-maximum-three-words-in-noun-clusters)).
4. Sentence length: 41 words, far exceeding the 20-word procedural limit ([Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures)).
5. Archaic and formal connector: `whereupon` ([Rule 4.4](sentences.md#5-rule-44-approved-joining-words-and-logical-connectors)).

*Compliant STE Rewrite:*
> Send an HTTP POST request to the `/api/v1/auth/tokens` endpoint.  
> Use your client secret to authenticate the request.  
> The server returns a bearer token in the JSON response.

*Fidelity and Rule Analysis:*
- Sentence 1: 9 STE words (`/api/v1/auth/tokens` counts as 1 word under [Rule 8.6.4](punctuation-and-counting.md#4-alphanumeric-identifiers-and-part-numbers)). Imperative verb `Send` (approved core verb).
- Sentence 2: 8 STE words. Clear imperative command with direct object `client secret`.
- Sentence 3: 10 STE words. Descriptive statement of system behavior ([Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions) limit is 25 words).
- Preserves exact endpoints, methods, and data formats without inventing extra parameters.

---

### Use Case 2: Runbooks, Playbooks, and Standard Operating Procedures (SOPs)

#### Operational Context
Operational procedures executed during live infrastructure maintenance, failover drills, hardware servicing, or production outages. Operators often work under severe stress and time pressure.

#### Typical Pitfalls
- **Conditions after commands:** Putting "if the secondary database fails" at the end of a destructive step, causing operators to execute the command before reading the condition.
- **Coupled action splitting:** Splitting simultaneous commands into sequential steps, disrupting synchronization.
- **Detached conditions:** Letting an emergency condition expire while following steps continue unconditionally.
- **Advisory confusion:** Weakening mandatory emergency steps with "should" or strengthening recommendations into false obligations.

#### Specific Rule Focus
- **[Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures):** Maximum 20 words per procedural sentence.
- **[Rule 5.2](procedures.md#3-rule-52-one-instruction-per-sentence):** One instruction per sentence (except simultaneous/coupled actions).
- **[Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions):** Imperative mood for all instructions.
- **[Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions):** Conditions before instructions.
- **[Rules 7.1–7.3](safety.md):** Safety alerts (WARNING / CAUTION) placed immediately before the affected step.

#### Worked Scenario

*Original Text (Non-STE):*
> You should switch the traffic router to bypass mode by rotating the bypass dial clockwise, but make sure that you have verified that the replication lag is under 50 milliseconds first, otherwise active customer transactions will be permanently lost.

*Identified Issues / Rule Violations:*
1. Condition placed after command: `make sure that you have verified... first` ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)).
2. Recommendation word `should` used for an operational procedure ([Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions)).
3. Hazard warning buried at the end of a run-on sentence: `otherwise active customer transactions...` ([Rules 7.1, 7.2](safety.md)).
4. Compound sentence with multiple instructions: 38 words ([Rules 5.1, 5.2](procedures.md)).

*Compliant STE Rewrite:*
> **CAUTION: MAKE SURE THAT REPLICATION LAG IS LESS THAN 50 MS BEFORE YOU CONTINUE. IF LAG IS 50 MS OR MORE, SWITCHING TRAFFIC WILL CAUSE DATA LOSS.**  
> 1. Measure the replication lag on the metrics dashboard.  
> 2. If the replication lag is less than 50 ms, turn the bypass dial clockwise.  
> 3. Confirm that the router operates in bypass mode.

*Fidelity and Rule Analysis:*
- Hazard elevated into a standard CAUTION before the step ([Rules 7.1, 7.2](safety.md)).
- Prerequisite condition placed at the start of Step 2 ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)).
- Word count: Step 1 (8 words), Step 2 (14 words), Step 3 (8 words). All well within Rule 5.1 ceiling of 20 words.
- Coupled measurement limit preserved (`50 ms` counts as 1 word under [Rule 8.6.2](punctuation-and-counting.md#2-numbers-combined-with-units-of-measurement)).

---

### Use Case 3: Diagnostic Error Messages, Alerts, and Log Events

#### Operational Context
Structured log strings, terminal stderr alerts, monitoring thresholds, and user-facing diagnostic popups.

#### Typical Pitfalls
- **Inventing root causes:** Guessing that a network error was caused by a specific timeout or firewall when only connection refusal is known.
- **Inventing recovery commands:** Fabricating specific commands or service units (e.g., `systemctl restart master.service`) from vague advice like "Try rebooting".
- **Cut hedges:** Converting "connection may be throttled" into "connection was blocked," creating misleading troubleshooting records.
- **Unclear pronouns:** Emitting "It failed to do this" where the referent is indeterminate.

#### Specific Rule Focus
- **[Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences):** Short, unambiguous sentences.
- **[Rule 4.5](sentences.md#6-rule-45-articles-demonstratives-and-specific-noun-references):** Explicit articles and complete nouns (no dangling pronouns).
- **[Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions):** Imperative commands for operator recovery steps.
- **[Fidelity FP-01 & FP-08](fidelity.md#3-the-10-critical-failure-patterns):** Preserving uncertainty and never inventing speculative root causes or commands.

#### Worked Scenario

*Original Text (Non-STE):*
> Connection error! An unhandled network exception occurred while attempting to synchronize with the remote master node which might possibly indicate that the cluster network interface is malfunctioning or the master service went down. Try rebooting.

*Identified Issues / Rule Violations:*
1. Exclamation mark and colloquialism: `Connection error!` ([Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences)).
2. Stacked hedges: `might possibly indicate` ([Fidelity Section 2.3](fidelity.md#23-modality-confidence-and-hedges)).
3. Passive / complex subordinate clause with 37 words ([Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)).
4. Vague recovery instruction: `Try rebooting` ([Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions)).

*Compliant STE Rewrite:*
> Connection to the master node failed.  
> It is possible that the network interface is defective or the master service stopped.  
> Try to restart the system.

*Fidelity and Rule Analysis:*
- Sentence 1: 7 STE words. States the exact factual event in simple past ([Rule 3.2](verbs.md#3-rule-32-approved-verb-tenses-and-aspects)).
- Sentence 2: 15 STE words. Preserves the double diagnostic hypothesis (`possible that... or...`) without false certainty.
- Sentence 3: 6 STE words. Translates "Try rebooting" cleanly without inventing unverified system commands (such as `systemctl restart master.service`) or inventing specific service unit targets. Retaining the unresolved recovery target preserves technical truthfulness.

---

### Use Case 4: Technical Reports, Post-Mortems, and Incident Reviews

#### Operational Context
Root cause analysis (RCA) documents, safety investigation reports, aviation occurrence reports, and system post-mortems.

#### Typical Pitfalls
- **Erasing approximation:** Removing "approximately" from incident timestamps, creating false precision.
- **Present perfect timeline confusion:** Using "we have identified" or "the system has been failing," obscuring exact temporal sequence.
- **Passive voice hiding responsibility:** Writing "the database was deleted" without identifying the automated script or operator responsible.
- **Upgrading preliminary hypotheses:** Turning suspected contributing factors into definitive causal conclusions before testing is complete.

#### Specific Rule Focus
- **[Rule 3.2](verbs.md#3-rule-32-approved-verb-tenses-and-aspects):** Simple past tense for historical incident events.
- **[Rule 3.6](verbs.md#7-rule-36-active-voice-and-the-unknown-agent-exception):** Active voice identifying the explicit agent.
- **[Rules 6.1–6.6](descriptions.md):** Descriptive paragraph limits (≤6 sentences per paragraph, ≤25 words per sentence, one topic per paragraph).
- **[Fidelity FP-01](fidelity.md#fp-01-uncertainty-turned-into-certainty):** Maintaining exact epistemic modality for unconfirmed theories and retaining approximations.

#### Worked Scenario

*Original Text (Non-STE):*
> At approximately 03:15 UTC, performance degradation was observed by the operations team across all European worker nodes, which we believe could potentially have been triggered by an unannounced upstream DNS resolver outage that resulted in memory leaks in our worker proxy service.

*Identified Issues / Rule Violations:*
1. Passive voice: `performance degradation was observed by the operations team` ([Rule 3.6](verbs.md#7-rule-36-active-voice-and-the-unknown-agent-exception)).
2. Stacked modals: `we believe could potentially have been triggered` ([Fidelity Section 2.3](fidelity.md#23-modality-confidence-and-hedges)).
3. Sentence length: 42 words, exceeding the 25-word descriptive limit ([Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)).
4. Present perfect modal construction: `could potentially have been triggered` ([Rule 3.2](verbs.md#3-rule-32-approved-verb-tenses-and-aspects)).

*Compliant STE Rewrite:*
> At approximately 03:15 UTC, the operations team detected slow response times on all European worker nodes.  
> It is possible that an upstream DNS outage caused this problem.  
> The worker proxy service consumed excess memory when the DNS queries failed.

*Fidelity and Rule Analysis:*
- Sentence 1: 15 STE words. Active voice with clear actor (`the operations team`) and simple past verb `detected`. Crucially, **retains "approximately"** to prevent false precision. If the incident timestamp was approximate in engineering records, omitting it falsely claims exact synchronization.
- Sentence 2: 12 STE words. Preserves the causal hedge (`possible that`) without upgrading the theory to a proven fact.
- Sentence 3: 13 STE words. Describes the proxy memory behavior clearly and factually.
- All sentences comply with the 25-word descriptive limit ([Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)).

---

### Use Case 5: Release Notes and Changelogs

#### Operational Context
Customer-facing product updates, SDK release logs, breaking change notifications, and software migration manuals.

#### Typical Pitfalls
- **Inventing release version identifiers:** Adding unverified version numbers (e.g., `2.4.0`) that the source did not provide.
- **Marketing fluff:** Using empty adjectives like `cutting-edge`, `robust`, `seamless`, `lightning-fast`.
- **Hiding breaking changes:** Embedding migration requirements inside positive feature descriptions.
- **Nominalizations:** Using `provides support for` instead of `supports`.

#### Specific Rule Focus
- **[Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences):** Direct, short sentences without promotional adjectives.
- **[Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions) / [Rule 7.1](safety.md#2-rule-71-risk-level-identification-and-signal-words):** Breaking changes phrased as clear commands with explicit hazard/migration consequences.
- **[Rule 8.6](punctuation-and-counting.md#7-rule-86-the-seven-special-counting-groups-1-word-each):** Exact counting for versions, flags, and function identifiers.

#### Worked Scenario

*Original Text (Non-STE):*
> We are thrilled to announce our blazing-fast new authentication architecture! Notice: all deprecated v1 user profile endpoints have now been completely removed, so developers will need to immediately refactor their client code to query the `/api/v2/users` endpoint or their application requests will be rejected with an unauthorized status code.

*Identified Issues / Rule Violations:*
1. Emotional and marketing adjectives: `thrilled to announce`, `blazing-fast` ([Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences)).
2. Complex compound sentence with multiple clauses and 48 words ([Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences), [Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)).
3. Passive voice: `have now been completely removed`, `will be rejected` ([Rule 3.6](verbs.md#7-rule-36-active-voice-and-the-unknown-agent-exception)).
4. Buried breaking change.

*Compliant STE Rewrite:*
> ### User Profile API Release Notes
> 
> **BREAKING CHANGE:**  
> We removed all v1 user profile endpoints.  
> Update your client applications to use the `/api/v2/users` endpoint.  
> If you do not update your application, the server will reject API requests with HTTP status 401.

*Fidelity and Rule Analysis:*
- Heading: Contains no invented release version numbers (e.g., `2.4.0`). Uses a truthful, descriptive heading based strictly on the text provided.
- Removed all promotional marketing fluff.
- Breaking change highlighted with clear command and consequence.
- Sentence 1: 7 STE words. Direct statement in simple past.
- Sentence 2: 10 STE words. Direct imperative command.
- Sentence 3: 15 STE words. Clear condition-first consequence ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)).

---

### Use Case 6: Commit Messages and Pull Request Descriptions

#### Operational Context
Source code version control metadata, git commit summaries, pull request descriptions, and patch reviews.

#### Typical Pitfalls
- **Unclear pronouns:** `Fixed this bug where it broke after that update.`
- **Phrasal verbs:** `Spin down old worker`, `kick off build`, `clean up files`.
- **Run-on explanations:** Joining motivation, mechanism, and verification into one unpunctuated block.

#### Specific Rule Focus
- **[Rule 1.1](words.md#2-rule-11-use-approved-words-in-their-approved-senses):** Use approved verbs (`stop` instead of `spin down`; `remove` instead of `clean up`).
- **[Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions):** Imperative mood for the commit subject line.
- **[Rule 6.5](descriptions.md#6-rule-65-one-topic-per-paragraph):** One topic per paragraph in the commit body.

#### Worked Scenario

*Original Text (Non-STE):*
> Refactored the authentication middleware to speed things up and cleaned up the redundant session database query logic that was causing deadlocks when multiple workers were spun up simultaneously.

*Identified Issues / Rule Violations:*
1. Phrasal verbs: `cleaned up`, `spun up` ([Rule 9.3](writing-practices.md#4-rule-93-absolute-prohibition-on-unapproved-phrasal-verbs)).
2. Vague noun phrase: `speed things up` ([Rule 4.1](sentences.md#2-rule-41-short-clear-and-complete-sentences)).
3. Run-on sentence: 29 words ([Rule 6.3](descriptions.md#4-rule-63-maximum-sentence-length-in-descriptions)).
4. Passive continuous: `were spun up simultaneously` ([Rules 3.2, 3.6](verbs.md)).

*Compliant STE Rewrite:*
> Optimize authentication middleware and remove redundant session queries
> 
> Redundant database queries caused deadlocks when multiple worker processes started at the same time.  
> This change removes the redundant queries and improves request processing time.

*Fidelity and Rule Analysis:*
- Subject line: Conventional imperative summary.
- Body sentence 1: 15 STE words. Replaces phrasal `spun up simultaneously` with approved `started at the same time`.
- Body sentence 2: 11 STE words. States the exact technical modification without jargon.

---

### Use Case 7: Agent Instructions, System Prompts, and Tool Definitions

#### Operational Context
Prompt engineering, AI agent skill definitions, tool parameter descriptions, and runtime constraints for autonomous LLM agents.

#### Typical Pitfalls
- **Turning tentative hedges into authorization:** Converting tentative language ("it might be permissible") into permission to bypass safety or security checks.
- **Advisory "should":** LLMs treat "should" as optional advice and frequently bypass the instruction under edge cases.
- **Trailing conditions:** Models prioritize tokens at the start of clauses; placing conditions at the end leads to constraint violation.
- **Synonym rotation:** Using `verify`, `validate`, `check`, and `confirm` interchangeably, prompting the model to execute different subroutines.

#### Specific Rule Focus
- **[Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions):** Direct imperative commands (`must`, `do not`, `write`).
- **[Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions):** Condition first (`If the exit code is non-zero, stop the workflow`).
- **[Rule 1.11](words.md#12-rule-111-one-word--one-meaning-and-synonym-rotation) / [Rule 9.4](writing-practices.md#5-rule-94-terminological-and-stylistic-consistency):** One word, one meaning (consistent tool terminology).
- **[Rule 8.1](punctuation-and-counting.md#2-rule-81-prohibition-of-semicolons):** No semicolons in prompt rules.

#### Worked Scenario: Database Query Caching Policy

*Original Text (Non-STE):*
> The assistant should check whether cached query results are available in the Redis cache before querying the database, although if the client explicitly requests fresh telemetry it might be permissible to query the read replica directly; however, write queries must never be sent to the read replica.

*Identified Issues / Rule Violations:*
1. Advisory `should` creates indeterminate execution constraints ([Rule 5.3](procedures.md#4-rule-53-imperative-form-for-instructions)).
2. Trailing condition with tentative hedge: `although if the client explicitly requests fresh telemetry it might be permissible...` ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions), [Fidelity Section 2.4](fidelity.md#24-obligations-vs-recommendations-vs-permissions)).
3. Semicolon used as clause connector: prohibited in STE ([Rule 8.1](punctuation-and-counting.md#2-rule-81-prohibition-of-semicolons)).
4. Run-on structure: 41 words ([Rule 5.1](procedures.md#2-rule-51-maximum-sentence-length-in-procedures)).

*Compliant STE Rewrite:*
> 1. Find whether cached query results are available in the cache before you query the database.  
> 2. If the client explicitly requests fresh telemetry, find whether policy permits a direct query to the read replica.  
> 3. Never send write queries to the read replica.

*Fidelity and Rule Analysis:*
- **Preserves Security and Safety Boundaries:** Does **not** convert tentative permission ("it might be permissible") into an open authorization to bypass validation or caching. Step 2 requires verifying whether policy permits the exception, preserving the necessary safeguard.
- Step 1: 15 STE words. Clear imperative command.
- Step 2: 18 STE words. Condition placed first ([Rule 5.4](procedures.md#5-rule-54-conditions-preceding-instructions)).
- Step 3: 8 STE words. Absolute imperative prohibition.
- Eliminates model confusion by removing weak hedges and ambiguous semicolons.

---

### Use Case 8: Technical Copy Preparation for Translation

#### Operational Context
Enterprise documentation authored in English intended for automated machine translation (MT) or multi-language localization (e.g., German, French, Japanese, Spanish, Chinese).

#### Typical Pitfalls
- **Altering actions and device identities:** Renaming a "digital gauge" to a "thermometer" or assuming "controlled" means "checked" without source verification.
- **Unsupported guarantees:** Promising "100% deterministic translation" or zero MT hallucination.
- **Omitted relative pronouns:** Dropping "that" (`Ensure the valve the operator adjusted is closed`), leading translation parsers to misidentify the main verb.
- **Idiomatic expressions:** Phrases like `rule of thumb`, `ballpark figure`, `burn-in period`.
- **False friends:** Using words like `eventually` (often mistranslated into Romance languages as "possibly") or `control` (confused with "check").
- **Dangling noun chains:** German and Japanese translators cannot determine whether word A modifies B or C.

#### Specific Rule Focus
- **[GR-1](general-recommendations.md#2-gr-1-the-conjunction-that):** Use `that` to clarify clause boundaries in subordinate clauses.
- **[GR-2](general-recommendations.md#3-gr-2-the-preposition-with):** Resolve ambiguous `with` constructions.
- **[GR-5](general-recommendations.md#6-gr-5-false-friends-interlingual-cognates):** Avoid false friends in cross-language contexts.
- **[Rule 2.1](multi-word-nouns.md#2-rule-21-maximum-three-words-in-noun-clusters):** Maximum of three words in a noun stack.
- **[Rule 4.5](sentences.md#6-rule-45-articles-demonstratives-and-specific-noun-references):** Keep articles (`the`, `a`, `an`) explicit.

#### Worked Scenario

*Original Text (Non-STE):*
> The technician controlled the temperature with the digital gauge and eventually realized the high pressure hydraulic fluid return valve was malfunctioning.

*Identified Issues / Rule Violations:*
1. Potential false friend vs. physical action: `controlled` in English means regulated or commanded. In French/German it is frequently used mistakenly for `checked` ([GR-5](general-recommendations.md#6-gr-5-false-friends-interlingual-cognates)). However, an author must not arbitrarily assume "controlled" means "checked" if the technician was actually regulating the parameter. If ambiguous, flag the ambiguity.
2. Ambiguous preposition: `with the digital gauge`—was it the instrument used, or an association? ([GR-2](general-recommendations.md#3-gr-2-the-preposition-with)).
3. False friend: `eventually` (often mistranslated as "perhaps" or "possibly") ([GR-5](general-recommendations.md#6-gr-5-false-friends-interlingual-cognates)).
4. Missing relative pronoun: `realized [that] the... valve was malfunctioning` ([GR-1](general-recommendations.md#2-gr-1-the-conjunction-that)).
5. 6-word noun stack: `high pressure hydraulic fluid return valve` ([Rule 2.1](multi-word-nouns.md#2-rule-21-maximum-three-words-in-noun-clusters)).

*Compliant STE Rewrite:*
> The technician controlled the temperature with the digital gauge.  
> Later, the technician found that the return valve of the hydraulic system was defective.

*(Engineering Note: If engineering source review reveals that the technician only verified the temperature rather than regulating it, replace "controlled" with "measured" or "checked". Do not change "digital gauge" to "thermometer" without engineering source authority).*

*Fidelity and Rule Analysis:*
- Preserves the action verb `controlled` and the device identity `digital gauge` without unauthorized substitution.
- Resolved false friend `eventually` to chronological `Later`.
- Added explicit relative pronoun `that` ([GR-1](general-recommendations.md#2-gr-1-the-conjunction-that)), creating a clear clause boundary for human translators and machine translation parsers.
- Unpacked 6-word noun stack into: `the return valve of the hydraulic system` ([Rule 2.1](multi-word-nouns.md#2-rule-21-maximum-three-words-in-noun-clusters)).
- Substantially improves clarity, structure, and translation consistency without making unverified claims of "100% deterministic translation".
