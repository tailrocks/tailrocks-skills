"use client";

import { useAgent } from "@/components/AgentContext";
import { AGENTS } from "@/lib/agents";

/**
 * Chooses which client every invocation on the page is written for. The choice
 * persists across pages.
 */
export function AgentPicker() {
  const { agent, select } = useAgent();

  return (
    <div className="not-prose border-fd-border bg-fd-card my-6 rounded-lg border p-4">
      <p className="text-fd-muted-foreground mb-3 text-sm">Examples below are written for your client:</p>
      <div className="flex flex-wrap gap-2">
        {AGENTS.map((candidate) => {
          const active = candidate.id === agent.id;
          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => select(candidate.id)}
              aria-pressed={active}
              className={
                active
                  ? "bg-fd-primary text-fd-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium"
                  : "border-fd-border text-fd-muted-foreground hover:text-fd-foreground rounded-md border px-3 py-1.5 text-sm"
              }
            >
              {candidate.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
