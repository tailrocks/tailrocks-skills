/**
 * How each supported client is asked to run a skill. Verified per client in
 * INSTALL.md; the prose form is used by the clients that expose skills through
 * a tool rather than a slash command.
 */
export interface Agent {
  readonly id: string;
  readonly label: string;
  readonly invoke: (skill: string, args: string) => string;
}

const slash =
  (prefix: string) =>
  (skill: string, args: string): string =>
    args === "" ? `${prefix}${skill}` : `${prefix}${skill} ${args}`;

const prose = (skill: string, args: string): string =>
  args === "" ? `Use ${skill}.` : `Use ${skill}: ${args}`;

export const AGENTS: readonly Agent[] = [
  { id: "claude", label: "Claude Code", invoke: slash("/tailrocks-skills:") },
  { id: "codex", label: "Codex CLI", invoke: slash("$") },
  { id: "grok", label: "Grok Build", invoke: slash("/") },
  { id: "kimi", label: "Kimi Code", invoke: slash("/skill:") },
  { id: "antigravity", label: "Antigravity", invoke: slash("/") },
  { id: "opencode", label: "OpenCode", invoke: prose },
  { id: "amp", label: "Amp", invoke: prose },
];

export const DEFAULT_AGENT = AGENTS[0]!;

export function agentById(id: string | null): Agent {
  return AGENTS.find((agent) => agent.id === id) ?? DEFAULT_AGENT;
}

export const AGENT_STORAGE_KEY = "tailrocks-agent";
