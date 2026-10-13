# Agent Communication and Response Guidelines

**Scope:** Communication patterns for AI agents interacting with humans and other AI agents  
**Profile:** Practical Clarity  
**Standard Relevance:** ASD-STE100 principles applied to synthetic cognition, agentic workflows, and tool integration

---

## 1. Overview of Agent Communication Surfaces

AI agents generate prose across diverse surfaces: answering human developers, coordinating with peer agents, issuing instructions to subagents, describing tools, writing code reviews, and formulating system prompts.

In agentic systems, ambiguity causes costly compounding failures:
- Vague handoffs cause subagents to hallucinate requirements or execute out-of-scope modifications.
- Imprecise tool descriptions cause tool-call argument errors and execution loops.
- Softened status reports obscure unverified assumptions, leading teams to deploy broken code.

Applying Practical Technical English to agent communication ensures predictability, auditability, and semantic precision without conversational bloat.

---

## 2. Assistant Explanations

When answering questions from human developers or operators, structure explanations using a three-tier pattern:

```
[ 1. Direct Answer ]   ──► Immediate conclusion, resolution, or recommendation
        │
[ 2. Mechanism ]       ──► How and why the system functions in this manner
        │
[ 3. Example / Trade ] ──► Concrete code/command or engineering tradeoff
```

### Explanation Guidelines:
1. **Lead with the solution:** State the answer in the first sentence. Do not begin with a recap of the question or a historical disquisition.
2. **Explain the causal mechanism:** State the underlying technical reason directly. Use active voice to show which component triggers what event.
3. **Illustrate with an explicit tradeoff or example:** Show the code snippet, configuration, or architectural implication.

### Example: Explaining Connection Timeouts
- **Poor (Vague & Indirect):**  
  *It looks like your connection might be timing out because maybe the server is busy or there could be a network delay. You could try increasing the timeout settings if you think that might help resolve the issue.*
- **Clear (Structured & Direct):**  
  *The client connection aborts because the upstream gateway closes idle sockets after 15 seconds, while your database query requires 22 seconds to complete.*  
  *The database executes a full table scan on the `events` table because the `created_at` column lacks an index. When the query exceeds 15 seconds, Envoy drops the TCP stream with a `504 Gateway Timeout`.*  
  *To resolve this issue, add an index to `created_at` on the `events` table. If query optimization is insufficient, increase `idle_timeout` in `envoy.yaml` to 30 seconds.*

---

## 3. Status Reports and Progress Updates

Status reports must establish verifiable ground truth. They communicate what was observed, what evidence proves it, and what remains unknown or unverified.

### Status Report Pattern:
1. **Observed State:** State the actual condition of the system or task.
2. **Verifiable Evidence:** Provide concrete logs, test metrics, command exit codes, or file paths.
3. **Remaining Issues & Untested Scope:** Explicitly distinguish tested items from untested items.

### Critical Ground Rule: Tested vs. Untested
**Never summarize partial verification as "everything passed" or "all working."** If unit tests passed but integration tests were not run, state both facts explicitly.

### Example: Status Update
- **Poor:**  
  *All tasks completed successfully! Everything looks great and tests are passing.*
- **Clear:**  
  *Task completed: Refactored the authentication token parser in `auth/jwt.go`.*  
  *Evidence:*  
  *- Unit test suite `go test ./auth/...` passed (14/14 tests, 0 failures).*  
  *- Static check `golangci-lint run` reported 0 lint errors.*  
  *Untested Scope:*  
  *- End-to-end OAuth flow was not verified against the live identity provider because staging credentials were not configured in this environment.*

---

## 4. Tool Descriptions

Tool definitions and schema documentation tell calling models when and how to invoke functions. Vague tool descriptions cause model hesitation, parameter hallucinations, and unintended execution.

### Tool Description Pattern:
1. **Core Purpose:** Single-sentence summary of what the tool accomplishes.
2. **Inputs:** Purpose, required format, and boundary constraints of each argument.
3. **Outputs:** Structure and semantics of returned data.
4. **Preconditions:** System state or prerequisites required before invocation.
5. **Side Effects & Failure Modes:** State mutations, network calls, file edits, and specific errors returned upon failure.

### Example: Tool Specification
```yaml
name: restart_worker_node
description: >-
  Gracefully terminates and restarts a specific worker node in the cluster.
  Use when a worker process becomes unresponsive or exceeds memory limits.
parameters:
  node_id:
    type: string
    description: "Unique node identifier (e.g., 'worker-prod-04'). Must exist in cluster state."
  grace_period_seconds:
    type: integer
    default: 30
    description: "Time to allow in-flight jobs to drain before sending SIGKILL. Must be between 5 and 300."
preconditions:
  - Cluster must have at least one other active worker node in the same zone.
side_effects:
  - Drains active connections from the designated node.
  - Generates a cluster topology change event.
failure_modes:
  - Returns ErrNodeNotFound if node_id does not match an active or cordoned node.
  - Returns ErrInsufficientCapacity if no other healthy node can accept drained workloads.
```

---

## 5. Inter-Agent Instructions and Handoffs

When an orchestrating agent delegates a subtask to another agent, instructions must be strictly unambiguous.

### Handoff Requirements:
1. **Explicit Goal:** Define the single concrete objective.
2. **Owned Scope & Files:** Name the exact paths the subagent may inspect and modify.
3. **Explicit Constraints:** Specify forbidden modifications, libraries, or patterns.
4. **Expected Deliverable:** Define the exact schema, file format, or message format required on return.
5. **Eliminate Hedges:** Strictly prohibit phrases like:
   - *"as appropriate"*
   - *"if necessary"*
   - *"clean up the code"*
   - *"handle errors gracefully"*
   - *"do your best"*

### Example: Orchestrator to Subagent Handoff
- **Poor (Vague Handoff):**  
  *Please check the repository and fix any formatting or documentation issues in the skills folder as appropriate. Make sure everything looks clean and compliant.*
- **Clear (Bounded Handoff):**  
  *Task: Audit and correct frontmatter metadata across all files in `skills/asd-ste100/`.*  
  *Target files: `skills/asd-ste100/SKILL.md` and `skills/asd-ste100/agents/openai.yaml`.*  
  *Constraints:*  
  *- Do not edit files outside `skills/asd-ste100/`.*  
  *- Ensure `name` equals `asd-ste100`.*  
  *- Set `policy.allow_implicit_invocation: true` in `openai.yaml`.*  
  *- Do not introduce dependencies on external Python packages or linters.*  
  *Return format: Report the modified files and a 3-bullet summary of exact changes via send_message.*

---

## 6. Code Review Comments

Code review feedback should be technically rigorous, impersonal, and directly actionable.

### Code Review Comment Pattern:
1. **Location:** Specific file and line reference.
2. **Observed Behavior:** What the current code does and why it is deficient or dangerous.
3. **Proposed Fix:** Concrete replacement code or direct structural change.
4. **Technical Rationale:** The engineering risk, performance cost, or standards violation prevented by the fix.

### Example: Code Review Comment
- **Poor:**  
  *I don't think this is the best way to handle this error. You should probably change it to something better.*
- **Clear:**  
  *File: `pkg/transport/http.go#L84-L88`*  
  *Observed: The function discards the HTTP response error using `_ = resp.Body.Close()` without checking if `resp` is `nil`.*  
  *Risk: If the network request fails, `resp` is `nil`. Calling `resp.Body.Close()` will trigger a runtime panic (nil pointer dereference).*  
  *Proposed Fix:*  
  ```go
  if err != nil {
      return fmt.Errorf("transport request failed: %w", err)
  }
  defer resp.Body.Close()
  ```

---

## 7. Prompt Engineering and Agent System Prompts

System prompts govern model behavior. Unclear prompts containing decorative adjectives, emotional appeals, or conflicting instructions lead to erratic behavior.

### Principles for System Prompt Authoring:
1. **Replace adjectives with behavioral rules:** Instead of *"Be helpful, extremely thorough, and remarkably insightful,"* write *"Answer the user's question in the first paragraph. Provide relevant code examples for each recommendation. Cite file paths and line numbers when referencing repository content."*
2. **Avoid conflicting rules:** Do not combine *"Be as concise as possible"* with *"Provide exhaustive, comprehensive explanations of all possible edge cases."* Specify concrete length budgets or conditional triggers instead.
3. **Define negative constraints with alternatives:** When forbidding an action, state what the agent must do instead:
   - *"Do not install third-party packages. Use only the Go standard library (`net/http`, `encoding/json`)."*
4. **Use clear delimiters for data:** Use XML tags (`<source_code>`, `<context>`) or markdown code blocks to separate behavioral instructions from user-supplied data.
