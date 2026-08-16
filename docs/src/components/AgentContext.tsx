"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { AGENT_STORAGE_KEY, agentById, DEFAULT_AGENT, type Agent } from "@/lib/agents";

interface AgentSelection {
  readonly agent: Agent;
  readonly select: (id: string) => void;
}

const AgentContext = createContext<AgentSelection>({
  agent: DEFAULT_AGENT,
  select: () => undefined,
});

/**
 * Holds the reader's chosen client. The server renders the default so the
 * prerendered page shows a real invocation; the stored choice is applied after
 * hydration.
 */
export function AgentProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState(DEFAULT_AGENT.id);

  useEffect(() => {
    const stored = window.localStorage.getItem(AGENT_STORAGE_KEY);
    if (stored !== null) setId(agentById(stored).id);
  }, []);

  const value = useMemo<AgentSelection>(
    () => ({
      agent: agentById(id),
      select: (next: string) => {
        setId(agentById(next).id);
        window.localStorage.setItem(AGENT_STORAGE_KEY, agentById(next).id);
      },
    }),
    [id],
  );

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}

export function useAgent(): AgentSelection {
  return useContext(AgentContext);
}
