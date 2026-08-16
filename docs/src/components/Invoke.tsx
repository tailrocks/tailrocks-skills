"use client";

import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

import { useAgent } from "@/components/AgentContext";

/**
 * One skill invocation, written in the syntax of the client selected in the
 * sidebar. Rendered through Fumadocs' own code block so it looks like every
 * other command on the site and carries the same copy button.
 */
export function Invoke({ skill, args = "" }: { skill: string; args?: string }) {
  const { agent } = useAgent();

  return (
    <CodeBlock title={agent.label} allowCopy>
      <Pre>{agent.invoke(skill, args)}</Pre>
    </CodeBlock>
  );
}
