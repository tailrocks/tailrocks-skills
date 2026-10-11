# Technical Clarity in Rich Artifacts: HTML, Diagrams, and Narration

**Scope:** Applying Practical Technical English to interactive HTML, architecture diagrams, and multimedia scripts  
**Profile:** Practical Clarity  
**Principle:** Deliver clear, unambiguous human-facing prose while strictly preserving underlying code, markup, and interactive behavior

---

## 1. Overview: Communication Beyond Plain Text

Modern technical documentation and agent deliverables frequently incorporate rich artifacts: interactive HTML applications, dashboards, embedded SVG graphics, Mermaid sequence and flow diagrams, and spoken audio/video narration scripts.

The principles of ASD-STE100 and Practical Technical English apply directly to the **reader-facing prose** embedded within these media. Clear, direct language prevents operational errors in UI interfaces and diagrams just as effectively as in maintenance manuals.

Crucially, applying clarity to rich artifacts must never degrade their interactive functionality, break programmatic bindings, or reduce rich UI components into flattened plain text.

---

## 2. HTML Text and User Interfaces

When generating or reviewing HTML deliverables, dashboards, or web interfaces:

### Reader-Facing Surfaces Covered:
- **Headings & Titles:** `<h1>` through `<h6>`, modal dialog titles, card headers.
- **Body Prose:** `<p>`, `<span>`, callout containers, helper text.
- **Table Data:** `<caption>`, `<th>` header descriptions, `<td>` explanatory cells.
- **Form Controls:** `<label>` text, field instructions, button labels (`<button>Submit</button>`).
- **Accessibility & Metadata:** `alt` text on images, `aria-label`, `aria-description`, and title attributes.

### The Fundamental HTML Preservation Rule
**Preserve all markup structure, attributes, bindings, styles, and scripts verbatim.**

1. **Do not modify structural identifiers:** Never alter `id`, `class`, `data-*` attributes, or name tokens to satisfy vocabulary rules.
   - *Example:* If an element has `class="quick-action-dropdown"`, do not change the class name to `class="fast-action-menu"`.
2. **Do not modify executable script or style blocks:**
   - A semicolon inside `<style>` or `<script>` tags is a programming syntax delimiter, not a prohibited prose semicolon.
   - JavaScript variable names, functions, JSON payloads, and event listeners (`onclick="handleEvent()"`) are protected code.
3. **Do not flatten interactive deliverables:**
   - If the user requests an interactive HTML dashboard or calculator, return the complete, working HTML/CSS/JS deliverable inside a code fence.
   - Refactor only the user-visible string literals and prose content. Never replace the HTML artifact with a summary paragraph.

### HTML Example: Before and After Clarity Refactoring

#### Before (Wordy, Passive, Vague):
```html
<div class="alert-box" id="warning-container">
  <h3>Notice Regarding System Deprecation</h3>
  <p>Users are hereby advised that it is possible that this legacy API endpoint might potentially be discontinued in the near future. Care should be taken to ensure that authentication tokens are updated accordingly.</p>
  <button id="btn-ack" onclick="acknowledgeNotice()">Acknowledge</button>
</div>
```

#### After (Clear, Direct, Concrete — Code & IDs Preserved):
```html
<div class="alert-box" id="warning-container">
  <h3>API Deprecation Notice</h3>
  <p>The engineering team will retire this legacy API endpoint on 2026-12-31. Update your client configuration to use the v2 endpoint and refresh your authentication tokens before that date.</p>
  <button id="btn-ack" onclick="acknowledgeNotice()">Acknowledge Notice</button>
</div>
```

---

## 3. Architecture and Process Diagrams (Mermaid & SVG)

Diagrams visually communicate component relationships, chronological workflows, and causal logic. Ambiguity in node labels or edge descriptions causes system misunderstandings.

### Diagram Clarity Guidelines:
1. **Unambiguous Edge Direction & Meaning:** Ensure arrowheads accurately represent data flow, causal dependency, or chronological sequence. Label edges with specific actions, HTTP verbs, or data payloads rather than generic connectors.
   - *Vague:* `Client --> Server`
   - *Direct:* `Client -->|POST /api/v1/auth| Server`
2. **Concise, Consistent Node Labels:** Use the exact same technical nouns in diagram nodes as in the surrounding documentation (Principle 6).
   - If the documentation refers to the "Primary Ingestion Worker," do not label the node "Data Intake Box."
3. **Explicit Conditions and Decision Branches:** Make decision diamonds and branching edges explicit. Show both positive and negative branches with concrete conditions.
4. **Preserve Diagram Syntax:** Ensure quotes, bracket types (`[]`, `()`, `{}`), and node IDs adhere strictly to Mermaid/SVG grammar.

### Mermaid Flowchart Example

```mermaid
flowchart TD
    Start["Receive Webhook Event"] --> ValidateAuth{"Is Signature Valid?"}
    
    ValidateAuth -->|No| Reject["Return HTTP 401 Unauthorized"]
    ValidateAuth -->|Yes| CheckIdempotency{"Is Event ID in Cache?"}
    
    CheckIdempotency -->|Yes (Duplicate)| AckDuplicate["Return HTTP 200 (Already Processed)"]
    CheckIdempotency -->|No (New)| ProcessEvent["Enqueue Event to Kafka Topic 'orders'"]
    
    ProcessEvent --> AckSuccess["Return HTTP 202 Accepted"]
```

---

## 4. Narration and Audio/Video Scripts

When authoring narration scripts for technical demonstrations, product walkthroughs, or training videos:

### Script Guidelines:
1. **Chronological Temporal Flow:** Align spoken narration with visual actions on the screen. Describe the prerequisite or setup *before* showing the action.
2. **Direct, Spoken Cadence:** Keep spoken sentences short (under 20 words). Spoken complexity is harder to parse than written text; short declarative statements ensure listener retention.
3. **Preserve Technical Uncertainty and Limitations:** Do not overpromise or state hypotheses as guaranteed facts for dramatic or marketing effect. If a feature is experimental, say so directly.
4. **Visual and Spoken Cues Separation:** Clearly distinguish production stage directions from spoken voiceover lines.

### Narration Script Model

```markdown
### Video Tutorial: Configuring Rate Limiting

[Visual: Browser displays the API Gateway dashboard at settings/rate-limits]
**Voiceover:** Open the Rate Limits tab in the API Gateway dashboard.

[Visual: Mouse highlights the 'Default Request Ceiling' input box]
**Voiceover:** This field sets the maximum requests permitted per IP address per minute. The default value is 1,000.

[Visual: Cursor changes value to 250 and clicks 'Apply Changes']
**Voiceover:** For staging environments, reduce this value to 250 requests per minute. Then click Apply Changes.

[Visual: Green toast banner appears: 'Configuration successfully updated']
**Voiceover:** The gateway enforces the new limit within 5 seconds. No service restart is required.
```

---

## 5. Non-English Translation Boundaries

1. **English Source Discipline:** ASD-STE100 is explicitly an English-language standard designed to maximize clarity and eliminate ambiguity. Applying it to English text creates clean, predictable source material that drastically improves human translation throughput and neural machine translation (NMT) accuracy.
2. **Translation Scope:** Once text is translated from English into German, Japanese, Spanish, or Chinese, the resulting target text is no longer governed by ASD-STE100 rules (which are English lexical and grammatical rules).
3. **Do not claim non-English text is "STE":** Describe translated deliverables as *"Localized technical translation derived from ASD-STE100 English source text."*
