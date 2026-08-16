"use client";

import { useAgent } from "@/components/AgentContext";

/**
 * One skill invocation, written in the syntax of the client the reader picked.
 * `skill` is the skill name; `args` is whatever that skill takes after it.
 */
export function Invoke({ skill, args = "" }: { skill: string; args?: string }) {
  const { agent } = useAgent();

  return (
    <figure className="not-prose border-fd-border bg-fd-secondary/40 my-4 rounded-lg border">
      <pre className="overflow-x-auto px-4 py-3 text-sm">
        <code>{agent.invoke(skill, args)}</code>
      </pre>
    </figure>
  );
}
