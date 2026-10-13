# Practical Technical Writing Guide

**Profile:** Practical Clarity (Default)  
**Scope:** Everyday technical documentation, assistant answers, agent-to-agent communication, and rich artifacts  
**Relation to ASD-STE100 Issue 9:** High-value clarity subset; default operational mode

---

## 1. Overview of the Practical Clarity Profile

The **Practical Clarity profile** is the default operating mode of the `asd-ste100` skill. It captures the essential cognitive and communicative benefits of Simplified Technical English—unambiguous instructions, direct sentence structure, explicit actor-action relationships, and disciplined terminology—without enforcing mechanical lexical lockdown on modern technical domains.

When users request "clear English," "plain technical English," "less jargon," "STE-inspired writing," or "80% of the way to STE," they are asking for this profile. They want text that is immediately intelligible to international audiences, technical specialists, and downstream AI agents, without the rigidity of strict aeronautical dictionary limits.

### Practical Profile vs. Strict Issue 9

| Attribute | Practical Profile (Default) | Strict Issue 9 Profile (Explicit Only) |
|:---|:---|:---|
| **Lexicon** | Standard technical vocabulary permitted; domain terms preserved | Only approved words in Part 2 or authorized Technical Categories (TN/TV) |
| **Sentence Caps** | 20 words (procedural) / 25 words (descriptive) as **editorial guidelines** | Strict word-count ceiling enforced per Section 8 |
| **Punctuation** | Semicolons discouraged; standard markdown, colons, dashes permitted | Semicolons strictly prohibited; only 7 authorized parenthesis uses |
| **Formatting** | Full markdown flexibility (tables, callouts, lists, diagrams, code blocks) | Standard technical publication layout; list counting budgets |
| **Trigger** | Default for all requests mentioning clarity, STE, or documentation | Activated **only** when user explicitly requests "Strict Issue 9", "full conformity", or "audit" |
| **Compliance Claim** | Delivers clear, precise technical prose; makes no formal standard claim | Validates against all 53 rules and Part 2 dictionary entries |

---

## 2. In-Depth Breakdown of the 12 Practical Principles

### Principle 1: Answer the Actual Question First
State the direct answer, conclusion, or key result in the opening sentence. Avoid conversational filler ("Sure, I would be happy to explain...", "Great question!"), administrative meta-commentary, or extensive historical preambles before addressing the core inquiry.

- **Ineffective:** *When considering the problem of cache invalidation in distributed architectures, it is necessary to examine several competing strategies before determining which approach best satisfies your requirements. In this section, we will analyze Redis pub/sub...*
- **Practical:** *Use Redis keyspace notifications for real-time cache invalidation across distributed worker nodes. This approach avoids polling overhead and synchronizes cache drops within 5 ms.*

### Principle 2: Use Concrete Actors, Actions, and Objects
Identify clearly who or what performs the action (the actor), what the action is (the verb), and what entity receives the action (the object). Avoid passive constructions where the responsible component or agent is obscured.

- **Ineffective:** *It is recommended that the timeout setting be configured by the deployment administrator prior to traffic routing being initiated.*
- **Practical:** *The deployment administrator must set the timeout value before the load balancer routes incoming traffic.*

### Principle 3: Write Short, Complete Sentences
Structure sentences around one primary idea. Keep sentences concise: target 20 words or fewer for instructions and safety notices, and 25 words or fewer for descriptive explanations. When a thought is complex, split it into two or more complete sentences rather than dropping required articles, pronouns, or qualifying conditions.

- **Ineffective:** *After the database migration script finishes executing, verify that the schema version matches the release manifest, and if discrepancies are observed, immediately roll back the transaction and notify the on-call engineer.*
- **Practical:** *After the database migration script finishes, verify the schema version against the release manifest. If you observe discrepancies, roll back the transaction immediately and notify the on-call engineer.*

### Principle 4: Introduce Context and Terms Before Needed
Define unfamiliar terms, concepts, or prerequisite configurations before instructing the reader to use them. Do not assume the reader knows an internal acronym or unique architectural concept that has not yet been introduced.

- **Ineffective:** *Attach the sidecar envoy container to the pod spec, ensuring that mTLS is enforced across the mesh.*
- **Practical:** *Mutual TLS (mTLS) encrypts all traffic between services. To enforce mTLS across the mesh, add the Envoy sidecar container to the pod specification.*

### Principle 5: Put Prerequisites Before Actions
Sequence information chronologically. State conditions, prerequisites, warnings, and required system states *before* the action command. This ensures the operator does not execute a destructive or irreversible step before satisfying its safety requirements.

- **Ineffective:** *Press the emergency stop button if the motor casing temperature exceeds 85 °C.*
- **Practical:** *If the motor casing temperature exceeds 85 °C, press the emergency stop button.*
- **Ineffective:** *Restart the service after ensuring that all pending write transactions are flushed to disk.*
- **Practical:** *Make sure that all pending write transactions are flushed to disk. Then restart the service.*

### Principle 6: Use the Same Term for the Same Concept
Maintain rigorous lexical consistency. Do not alternate between synonyms (e.g., "folder", "directory", and "folder path", or "parameter", "argument", and "option") for stylistic variety. Conversely, do not use a single vague word (such as "handle" or "process") to describe genuinely different operations.

- **Ineffective:** *Create a new directory for the logs. In this folder, store all daily traces. Ensure the storage path is writable.*
- **Practical:** *Create a new directory for the logs. Store all daily traces in this directory. Make sure that the directory is writable.*

### Principle 7: Prefer Direct Verbs and Contextual Rewrites
Replace weak verb-noun combinations (nominalizations) with strong, direct verbs. Rewrite whole sentences to achieve natural clarity rather than mechanically swapping words while preserving convoluted sentence architecture.

- **Nominalization:** *Perform an examination of the circuit board.* -> **Direct:** *Examine the circuit board.*
- **Nominalization:** *Conduct an evaluation of the system latency.* -> **Direct:** *Measure the system latency.*
- **Nominalization:** *Make a determination regarding component replacement.* -> **Direct:** *Decide whether to replace the component.*

### Principle 8: Remove Empty Praise and Filler While Keeping Uncertainty and Recommendations
Eliminate marketing adjectives, empty superlatives, and corporate padding ("industry-leading", "seamless", "innovative", "blazing-fast", "robust"). However, **do not remove genuine technical uncertainty, engineering recommendations, or statistical approximations** as if they were filler.

- **Cut Filler:** *Our cutting-edge, ultra-robust architecture seamlessly guarantees effortless scalability.* -> *The distributed architecture scales horizontally up to 10,000 requests per second.*
- **Preserve Uncertainty:** *The benchmark results suggest that thread contention may cause the latency spike.* (Keep "suggest" and "may"; do not convert hypothesis into certainty).
- **Preserve Recommendation:** *We recommend allocating 4 GB of RAM for production workloads.* (Keep "recommend"; do not convert to a mandatory command unless required by system specification).

### Principle 9: Distinguish Facts, Hypotheses, and Completed Work
Clearly demarcate empirical observations from untested assumptions, and finished actions from proposed work:
- **Observed Fact:** *Unit test suite `auth_test.go` passed with 100% coverage.*
- **Hypothesis:** *The memory leak is likely caused by unclosed HTTP response bodies in worker routines.*
- **Completed Action:** *Applied patch v1.2.4 to the staging cluster.*
- **Planned / Untested Work:** *Integration tests against the payment gateway have not yet been executed.*

### Principle 10: Preserve Useful Structure and Formatting
Clarity is enhanced by visual organization. Use headings, tables, numbered sequences, bulleted items, code blocks, and diagrams where they aid comprehension. Do not reduce rich technical material into a monotonous block of plain prose.

- Use **numbered lists** for strict chronological sequences where step order is mandatory.
- Use **bulleted lists** for unordered collections, parallel options, or feature sets.
- Use **tables** for configuration parameters, matrix comparisons, or multi-field data.
- Use **callout blocks** (Notes, Cautions, Warnings) to isolate critical operational considerations.

### Principle 11: Preserve Source Facts, Numbers, Code, and Labels
Never alter technical parameters, identifiers, or quoted values to make prose look simpler. Maintain 100% fidelity to:
- Exact numbers, decimal points, units of measurement, and tolerance ranges (`12.5 ± 0.2 mm`, `500 ms`).
- Variable names, class names, function identifiers, and API routes (`UserService.Authenticate()`, `/v1/orders`).
- Terminal commands, configuration snippets, and shell flags (`systemctl status nginx`, `--max-connections=100`).
- Exact UI labels, button text, and literal error strings quoted from interfaces (`Click "Save Changes"`, `Error 404: Not Found`).
- Do not invent plausible causes, actors, or outcomes not supported by the source document.

### Principle 12: Deliver the Artifact Without Commentary
When tasked with writing or rewriting, output the completed deliverable directly. Do not surround the technical text with conversational chatter, explanations of which principles were applied, or unsolicited apologies.

- **Do Not Write:** *Here is the revised procedure rewritten according to practical clarity principles. I have simplified the sentence structure and removed passive voice as requested:*
- **Do Write:** Output the revised procedure directly, beginning with its title or first heading.

---

## 3. Sentence Length and Tense Simplification as Editing Guidelines

### Sentence Length as a Guide, Not a Truncation Scissors
In the Practical profile, the 20-word (procedural/safety) and 25-word (descriptive) caps serve as **editorial signals**. When a sentence exceeds these limits, it usually indicates compounding clauses, multiple actions, or buried conditions.

However:
- Do not truncate a sentence if doing so cuts out an essential safety condition or qualifying boundary.
- Do not introduce awkward fragments or omit necessary English articles (`a`, `an`, `the`) simply to reduce word count.
- If a sentence contains 24 words describing an integrated technical process, and splitting it would sever the immediate cause-and-effect relationship, keep the complete thought intact.

### Tense Discipline
Favor simple present tense, simple past tense, and direct imperative mood:
- **Present:** Describes system architecture, current states, and continuous properties (*"The service listens on port 8080."*).
- **Past:** Describes completed historical events or observed test outcomes (*"The test failed after 30 seconds."*).
- **Imperative:** Conveys procedural instructions and action steps (*"Disconnect the power source."*).
- **Avoid:** Complex compound tenses (*"would have been running"*, *"having had completed"*).
- **Preserve:** Necessary conditional forms (*"If the connection fails, the client will retry three times."*).

---

## 4. Preserving Natural Technical Vocabulary vs. Arbitrary Substitution

In strict ASD-STE100, words not listed in the standard dictionary must be justified under technical categories or replaced with approved synonyms. In the **Practical profile**, technical terms that are standard in their respective engineering domains are fully preserved.

### Rules for Technical Vocabulary in Practical Writing:
1. **Retain standard domain terms:** Words such as *authenticate*, *compile*, *serialize*, *cache*, *latency*, *idempotent*, *database*, *deployment*, and *middleware* are legitimate technical vocabulary. Do not replace them with awkward core words (e.g., do not rewrite "compile the code" into "make the code" or "cache the query" into "keep the question").
2. **Eliminate buzzwords and non-technical jargon:** Avoid corporate jargon that obscures meaning (*"synergize"*, *"leverage"*, *"paradigm shift"*, *"circle back"*, *"operationalize"*).
3. **Avoid arbitrary synonym swapping:** Do not change a clear, precise technical term simply because an aerospace dictionary prefers another word. Use the term that your engineering audience expects and understands without friction.

---

## 5. Formatting Flexibility in Technical Documentation

The Practical profile encourages the thoughtful use of structured formatting:

### Comparison Table Model
Use tables when contrasting options, configurations, or parameters:

```markdown
| Parameter | Type | Default | Description |
|:---|:---|:---|:---|
| `max_retries` | integer | `3` | Maximum number of reconnection attempts before failing. |
| `timeout_ms` | integer | `5000` | Socket read timeout in milliseconds. |
```

### Sequential Procedure Model
Use numbered steps for procedures, placing prerequisites and conditions first:

```markdown
### Upgrading the Primary Node

**Prerequisite:** The replica node must be fully synchronized (replication lag < 10 ms).

1. Stop application traffic to the primary node by redirecting the load balancer to the standby pool.
2. In the terminal, run the graceful shutdown command:
   ```bash
   db-admin shutdown --graceful
   ```
3. Verify that the daemon process has terminated before applying the update package.
```

### Callouts and Visual Hierarchy
Use standard callouts to separate critical operational warnings from normal procedural flow:

> [!WARNING]
> Do not cut power to the controller during flash memory programming. A power loss during this operation causes unrecoverable firmware corruption.
