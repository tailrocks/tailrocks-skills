"use client";

import { useAgent } from "@/components/AgentContext";
import { AGENTS } from "@/lib/agents";

/**
 * Chooses the client every invocation on the site is written for. It lives in
 * the sidebar because the choice is made once and applies to every page.
 */
export function AgentSidebarPicker() {
  const { agent, select } = useAgent();

  return (
    <div className="border-fd-border bg-fd-card rounded-lg border p-3">
      <label htmlFor="tailrocks-agent" className="text-fd-muted-foreground mb-1.5 block text-xs">
        Your coding agent
      </label>
      <select
        id="tailrocks-agent"
        value={agent.id}
        onChange={(event) => select(event.target.value)}
        className="border-fd-border bg-fd-background text-fd-foreground w-full rounded-md border px-2 py-1.5 text-sm"
      >
        {AGENTS.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.label}
          </option>
        ))}
      </select>
      <p className="text-fd-muted-foreground mt-1.5 text-xs">Examples use its invocation syntax.</p>
    </div>
  );
}
