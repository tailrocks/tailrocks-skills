import { randomUUID } from "node:crypto";
import { lstat, opendir, readlink, realpath } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";

export const topologySchema = "tailrocks.agents-md-topology/v1";
const canonicalTarget = "AGENTS.md";
const builtInClients = ["CLAUDE.md", "GEMINI.md"] as const;

export type Mode = "discover" | "create" | "repair" | "verify";

export type EntryState =
  | { readonly kind: "missing" }
  | { readonly kind: "regular" }
  | {
      readonly kind: "symlink";
      readonly target: string;
      readonly canonical: boolean;
      readonly resolves_to_agents: boolean;
    }
  | { readonly kind: "other"; readonly file_type: string };

export type IssueCode =
  | "agents_missing"
  | "agents_not_regular"
  | "client_missing"
  | "client_not_symlink"
  | "client_wrong_target"
  | "client_unresolved"
  | "client_wrong_resolution";

export interface TopologyIssue {
  readonly code: IssueCode;
  readonly directory: string;
  readonly path: string;
  readonly detail: string;
}

export interface ClientObservation {
  readonly name: string;
  readonly required: boolean;
  readonly state: EntryState;
}

export interface DirectoryObservation {
  readonly directory: string;
  readonly agents: EntryState;
  readonly clients: readonly ClientObservation[];
}

export interface TopologyMutation {
  readonly operation: "create" | "repair";
  readonly path: string;
  readonly before: EntryState;
  readonly after: {
    readonly kind: "symlink";
    readonly target: "AGENTS.md";
    readonly resolves_to_agents: true;
  };
}

export interface TopologyReceipt {
  readonly schema: typeof topologySchema;
  readonly mode: Mode;
  readonly valid: boolean;
  readonly directories: readonly DirectoryObservation[];
  readonly issues: readonly TopologyIssue[];
  readonly mutations: readonly TopologyMutation[];
}

export interface TopologyIO {
  readonly beforeOperation?: (operation: "create" | "remove") => Promise<void>;
  readonly afterOperation?: (operation: "create" | "remove") => Promise<void>;
}

export class TopologyOperationError extends AggregateError {
  readonly mutationPaths: readonly string[];
  readonly recoveryArtifacts: readonly string[];

  constructor(
    errors: readonly unknown[],
    message: string,
    mutationPaths: readonly string[],
    recoveryArtifacts: readonly string[],
  ) {
    super(errors, message);
    this.name = "TopologyOperationError";
    this.mutationPaths = mutationPaths;
    this.recoveryArtifacts = recoveryArtifacts;
  }
}

const defaultIO: TopologyIO = {};

interface FileIdentity {
  readonly device: string;
  readonly inode: string;
}

async function identity(file: string): Promise<FileIdentity> {
  const stats = await lstat(file, { bigint: true });
  return { device: String(stats.dev), inode: String(stats.ino) };
}

function sameIdentity(left: FileIdentity, right: FileIdentity): boolean {
  return left.device === right.device && left.inode === right.inode;
}

async function requireIdentity(file: string, expected: FileIdentity, label: string): Promise<void> {
  if (!sameIdentity(await identity(file), expected)) throw new Error(`${label} identity changed: ${file}`);
}

const anchoredProgram = String.raw`
import { lstat, rename, symlink, unlink } from "node:fs/promises";
const [operation, expectedDevice, expectedInode, name, value, quarantine] = process.argv.slice(1);
const cwd = await lstat(".", { bigint: true });
if (String(cwd.dev) !== expectedDevice || String(cwd.ino) !== expectedInode)
  throw new Error("anchored directory identity changed");
if (operation === "create") {
  await symlink(value, name);
  const made = await lstat(name, { bigint: true });
  console.log(JSON.stringify({ device: String(made.dev), inode: String(made.ino) }));
} else if (operation === "remove") {
  await rename(name, quarantine);
  const moved = await lstat(quarantine, { bigint: true });
  if (String(moved.dev) !== value.split(":")[0] || String(moved.ino) !== value.split(":")[1]) {
    try { await lstat(name); }
    catch (error) {
      if (error.code === "ENOENT") await rename(quarantine, name);
    }
    throw new Error("quarantined entry identity changed");
  }
  await unlink(quarantine);
  console.log("{}");
} else throw new Error("unknown anchored operation");
`;

async function anchored(
  context: Awaited<ReturnType<typeof mutationContext>>,
  operation: "create" | "remove",
  name: string,
  value: string,
  quarantine: string,
  io: TopologyIO,
): Promise<FileIdentity | undefined> {
  await io.beforeOperation?.(operation);
  const result = await runBoundedCommand({
    command: [
      process.execPath,
      "-e",
      anchoredProgram,
      operation,
      context.directoryIdentity.device,
      context.directoryIdentity.inode,
      name,
      value,
      quarantine,
    ],
    cwd: context.directory,
  });
  if (result.code !== 0 || result.timedOut)
    throw new Error(result.stderr.trim() || `anchored ${operation} failed`);
  const identity = JSON.parse(result.stdout) as Partial<FileIdentity>;
  return identity.device && identity.inode ? { device: identity.device, inode: identity.inode } : undefined;
}

function codeUnitCompare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function relativeFile(directory: string, name: string): string {
  return directory === "." ? name : `${directory}/${name}`;
}

function fileType(stats: Awaited<ReturnType<typeof lstat>>): string {
  if (stats.isDirectory()) return "directory";
  if (stats.isFIFO()) return "fifo";
  if (stats.isSocket()) return "socket";
  if (stats.isBlockDevice()) return "block-device";
  if (stats.isCharacterDevice()) return "character-device";
  return "unknown";
}

async function state(file: string, agentsFile: string): Promise<EntryState> {
  let stats: Awaited<ReturnType<typeof lstat>>;
  try {
    stats = await lstat(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { kind: "missing" };
    throw error;
  }
  if (stats.isFile()) return { kind: "regular" };
  if (!stats.isSymbolicLink()) return { kind: "other", file_type: fileType(stats) };
  const target = await readlink(file);
  let resolvesToAgents = false;
  try {
    resolvesToAgents = (await realpath(file)) === (await realpath(agentsFile));
  } catch (error) {
    if (!new Set(["ELOOP", "ENOENT", "ENOTDIR"]).has((error as NodeJS.ErrnoException).code ?? ""))
      throw error;
  }
  return {
    kind: "symlink",
    target,
    canonical: target === canonicalTarget,
    resolves_to_agents: resolvesToAgents,
  };
}

function validateClientName(name: string): string {
  if (
    name === canonicalTarget ||
    name === "." ||
    name === ".." ||
    name.includes("/") ||
    name.includes("\\") ||
    name.includes("\0") ||
    path.basename(name) !== name ||
    !/^[A-Z][A-Z0-9_-]*\.md$/.test(name)
  ) {
    throw new Error(`invalid client instruction basename: ${JSON.stringify(name)}`);
  }
  return name;
}

function clientSets(extra: readonly string[]): { recognized: string[]; required: Set<string> } {
  const validated = extra.map(validateClientName);
  if (new Set(validated).size !== validated.length) throw new Error("client names must be unique");
  const recognized = [...new Set([...builtInClients, ...validated])].sort(codeUnitCompare);
  return { recognized, required: new Set(["CLAUDE.md", ...validated]) };
}

async function safeRoot(root: string): Promise<string> {
  const absolute = path.resolve(root);
  const stats = await lstat(absolute);
  if (stats.isSymbolicLink() || !stats.isDirectory())
    throw new Error("root must be a real directory, not a symlink");
  if ((await realpath(absolute)) !== absolute) throw new Error("root path may not traverse a symlink");
  return absolute;
}

function relativeDirectory(value: string): string {
  if (
    path.isAbsolute(value) ||
    value.includes("\0") ||
    value.includes("\\") ||
    value.split("/").some((segment) => segment === ".." || segment === "")
  ) {
    throw new Error(`invalid relative directory: ${JSON.stringify(value)}`);
  }
  return value === "." ? "." : value.replace(/\/$/, "");
}

async function safeDirectory(root: string, relative: string): Promise<string> {
  const normalized = relativeDirectory(relative);
  let current = root;
  if (normalized !== ".") {
    for (const segment of normalized.split("/")) {
      current = path.join(current, segment);
      const stats = await lstat(current);
      if (stats.isSymbolicLink()) throw new Error(`directory path contains symlink: ${normalized}`);
      if (!stats.isDirectory()) throw new Error(`directory path is not a directory: ${normalized}`);
    }
  }
  return current;
}

async function instructionDirectories(root: string, names: ReadonlySet<string>): Promise<string[]> {
  const found = new Set<string>();
  async function walk(directory: string, relative: string): Promise<void> {
    const handle = await opendir(directory);
    const entries = [];
    for await (const entry of handle) entries.push(entry);
    entries.sort((left, right) => codeUnitCompare(left.name, right.name));
    for (const entry of entries) {
      if (entry.name === ".git") continue;
      const childRelative = relative === "." ? entry.name : `${relative}/${entry.name}`;
      if (names.has(entry.name)) found.add(relative);
      if (entry.isDirectory()) await walk(path.join(directory, entry.name), childRelative);
    }
  }
  await walk(root, ".");
  return [...found].sort(codeUnitCompare);
}

async function observeDirectory(
  root: string,
  relative: string,
  recognized: readonly string[],
  required: ReadonlySet<string>,
): Promise<DirectoryObservation> {
  const directory = await safeDirectory(root, relative);
  const agentsFile = path.join(directory, canonicalTarget);
  const agents = await state(agentsFile, agentsFile);
  const clients: ClientObservation[] = [];
  for (const name of recognized) {
    const clientState = await state(path.join(directory, name), agentsFile);
    if (clientState.kind !== "missing" || required.has(name)) {
      clients.push({ name, required: required.has(name), state: clientState });
    }
  }
  return { directory: relative, agents, clients };
}

function issuesFor(observation: DirectoryObservation): TopologyIssue[] {
  const issues: TopologyIssue[] = [];
  if (observation.agents.kind === "missing") {
    issues.push({
      code: "agents_missing",
      directory: observation.directory,
      path: relativeFile(observation.directory, canonicalTarget),
      detail: "directory has a client instruction name but no AGENTS.md",
    });
  } else if (observation.agents.kind !== "regular") {
    issues.push({
      code: "agents_not_regular",
      directory: observation.directory,
      path: relativeFile(observation.directory, canonicalTarget),
      detail: `AGENTS.md is ${observation.agents.kind}`,
    });
  }
  for (const client of observation.clients) {
    const targetPath = relativeFile(observation.directory, client.name);
    if (client.state.kind === "missing") {
      if (client.required && observation.agents.kind !== "missing") {
        issues.push({
          code: "client_missing",
          directory: observation.directory,
          path: targetPath,
          detail: `${client.name} is required beside AGENTS.md`,
        });
      }
    } else if (client.state.kind !== "symlink") {
      issues.push({
        code: "client_not_symlink",
        directory: observation.directory,
        path: targetPath,
        detail: `${client.name} is ${client.state.kind}`,
      });
    } else if (!client.state.canonical) {
      issues.push({
        code: "client_wrong_target",
        directory: observation.directory,
        path: targetPath,
        detail: `raw target is ${JSON.stringify(client.state.target)}, expected "AGENTS.md"`,
      });
    } else if (!client.state.resolves_to_agents) {
      issues.push({
        code: observation.agents.kind === "regular" ? "client_wrong_resolution" : "client_unresolved",
        directory: observation.directory,
        path: targetPath,
        detail: `${client.name} does not resolve to its sibling regular AGENTS.md`,
      });
    }
  }
  return issues;
}

export async function discoverTopology(
  rootInput: string,
  extraClients: readonly string[] = [],
  mode: "discover" | "verify" = "discover",
): Promise<TopologyReceipt> {
  const root = await safeRoot(rootInput);
  const { recognized, required } = clientSets(extraClients);
  const directories = await instructionDirectories(root, new Set([canonicalTarget, ...recognized]));
  const observations: DirectoryObservation[] = [];
  for (const directory of directories) {
    observations.push(await observeDirectory(root, directory, recognized, required));
  }
  const issues = observations.flatMap(issuesFor);
  return {
    schema: topologySchema,
    mode,
    valid: issues.length === 0,
    directories: observations,
    issues,
    mutations: [],
  };
}

async function mutationContext(
  rootInput: string,
  relative: string,
  clientInput: string,
): Promise<{
  root: string;
  relative: string;
  directory: string;
  client: string;
  agents: string;
  destination: string;
  directoryIdentity: FileIdentity;
  agentsIdentity: FileIdentity;
}> {
  const root = await safeRoot(rootInput);
  const normalized = relativeDirectory(relative);
  const directory = await safeDirectory(root, normalized);
  const client = validateClientName(clientInput);
  const agents = path.join(directory, canonicalTarget);
  const agentsState = await state(agents, agents);
  if (agentsState.kind !== "regular")
    throw new Error(`sibling AGENTS.md must be regular, got ${agentsState.kind}`);
  return {
    root,
    relative: normalized,
    directory,
    client,
    agents,
    destination: path.join(directory, client),
    directoryIdentity: await identity(directory),
    agentsIdentity: await identity(agents),
  };
}

async function requireMutationContext(context: Awaited<ReturnType<typeof mutationContext>>): Promise<void> {
  await requireIdentity(context.directory, context.directoryIdentity, "directory");
  await requireIdentity(context.agents, context.agentsIdentity, "AGENTS.md");
}

async function mutationReceipt(
  mode: "create" | "repair",
  context: Awaited<ReturnType<typeof mutationContext>>,
  before: EntryState,
): Promise<TopologyReceipt> {
  const after = await state(context.destination, context.agents);
  if (
    after.kind !== "symlink" ||
    after.target !== canonicalTarget ||
    !after.canonical ||
    !after.resolves_to_agents
  ) {
    throw new Error("postcondition failed: client link is not canonical and resolved");
  }
  const observation = await observeDirectory(
    context.root,
    context.relative,
    [context.client],
    new Set([context.client]),
  );
  const issues = issuesFor(observation);
  return {
    schema: topologySchema,
    mode,
    valid: issues.length === 0,
    directories: [observation],
    issues,
    mutations: [
      {
        operation: mode,
        path: relativeFile(context.relative, context.client),
        before,
        after: { kind: "symlink", target: canonicalTarget, resolves_to_agents: true },
      },
    ],
  };
}

export async function createClientLink(
  root: string,
  directory: string,
  client: string,
  io: TopologyIO = defaultIO,
): Promise<TopologyReceipt> {
  const context = await mutationContext(root, directory, client);
  const before = await state(context.destination, context.agents);
  if (before.kind !== "missing") throw new Error(`create requires missing client, got ${before.kind}`);
  await requireMutationContext(context);
  let installedIdentity: FileIdentity | undefined;
  try {
    installedIdentity = (await anchored(context, "create", context.client, canonicalTarget, "unused", io))!;
    await io.afterOperation?.("create");
    await requireMutationContext(context);
    const receipt = await mutationReceipt("create", context, before);
    await requireIdentity(context.destination, installedIdentity, "created client");
    return receipt;
  } catch (error) {
    if (!installedIdentity) throw error;
    try {
      await requireMutationContext(context);
      await anchored(
        context,
        "remove",
        context.client,
        `${installedIdentity.device}:${installedIdentity.inode}`,
        `${context.client}.topology-${randomUUID()}.quarantine`,
        io,
      );
    } catch (rollbackError) {
      throw new TopologyOperationError(
        [error, rollbackError],
        `create proof failed; unowned path was retained at ${context.destination}`,
        [context.destination],
        [context.destination],
      );
    }
    throw error;
  }
}

export async function repairClientLink(
  root: string,
  directory: string,
  client: string,
  expectedTarget: string,
  io: TopologyIO = defaultIO,
): Promise<TopologyReceipt> {
  const context = await mutationContext(root, directory, client);
  const before = await state(context.destination, context.agents);
  if (before.kind !== "symlink") throw new Error(`repair requires a symlink client, got ${before.kind}`);
  if (before.target !== expectedTarget) {
    throw new Error(
      `repair precondition changed: expected raw target ${JSON.stringify(expectedTarget)}, got ${JSON.stringify(before.target)}`,
    );
  }
  if (before.canonical && before.resolves_to_agents)
    throw new Error("repair refuses an already canonical client link");
  const originalIdentity = await identity(context.destination);
  const transaction = randomUUID();
  const restoreName = `${context.client}.topology-${transaction}.restore`;
  const restore = path.join(context.directory, restoreName);
  const restoreIdentity = (await anchored(context, "create", restoreName, expectedTarget, "unused", io))!;
  let removedOriginal = false;
  let installed = false;
  let restorePresent = true;
  let installedIdentity: FileIdentity | undefined;
  try {
    await io.afterOperation?.("create");
    await requireMutationContext(context);
    await requireIdentity(context.destination, originalIdentity, "repair source");
    await anchored(
      context,
      "remove",
      context.client,
      `${originalIdentity.device}:${originalIdentity.inode}`,
      `${context.client}.topology-${transaction}.original`,
      io,
    );
    removedOriginal = true;
    await io.afterOperation?.("remove");
    installedIdentity = (await anchored(context, "create", context.client, canonicalTarget, "unused", io))!;
    installed = true;
    await io.afterOperation?.("create");
    await requireIdentity(context.destination, installedIdentity, "installed client");
    const receipt = await mutationReceipt("repair", context, before);
    await requireMutationContext(context);
    await requireIdentity(context.destination, installedIdentity, "installed client");
    await anchored(
      context,
      "remove",
      restoreName,
      `${restoreIdentity.device}:${restoreIdentity.inode}`,
      `${restoreName}.quarantine`,
      io,
    );
    restorePresent = false;
    await io.afterOperation?.("remove");
    await requireMutationContext(context);
    await requireIdentity(context.destination, installedIdentity, "installed client after cleanup");
    removedOriginal = false;
    return receipt;
  } catch (error) {
    const rollbackErrors: unknown[] = [];
    if (installed && installedIdentity) {
      try {
        await requireMutationContext(context);
        await anchored(
          context,
          "remove",
          context.client,
          `${installedIdentity.device}:${installedIdentity.inode}`,
          `${context.client}.topology-${transaction}.installed`,
          io,
        );
        installed = false;
        await io.afterOperation?.("remove");
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (removedOriginal && !installed) {
      try {
        await requireMutationContext(context);
        const destinationState = await state(context.destination, context.agents);
        if (destinationState.kind !== "missing")
          throw new Error("refusing to replace changed destination during rollback");
        await anchored(context, "create", context.client, expectedTarget, "unused", io);
        removedOriginal = false;
        await io.afterOperation?.("create");
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (!removedOriginal && restorePresent) {
      try {
        await anchored(
          context,
          "remove",
          restoreName,
          `${restoreIdentity.device}:${restoreIdentity.inode}`,
          `${restoreName}.quarantine`,
          io,
        );
        restorePresent = false;
        await io.afterOperation?.("remove");
      } catch (cleanupError) {
        rollbackErrors.push(cleanupError);
      }
    }
    if (removedOriginal && !restorePresent) {
      try {
        restorePresent = Boolean(
          await anchored(context, "create", restoreName, expectedTarget, "unused", io),
        );
        await io.afterOperation?.("create");
      } catch (recoveryError) {
        rollbackErrors.push(recoveryError);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new TopologyOperationError(
        [error, ...rollbackErrors],
        `repair failed; recovery artifact may remain at ${restore}`,
        [context.destination],
        [restore],
      );
    }
    throw error;
  }
}

interface ParsedCLI {
  readonly mode: Mode;
  readonly root: string;
  readonly clients: readonly string[];
  readonly directory?: string;
  readonly client?: string;
  readonly expectTarget?: string;
}

class UsageError extends Error {}
function usage(): never {
  throw new UsageError(
    "usage: agents-md-topology.ts <discover|verify> --root <repo> [--client-name <basename>]... | <create> --root <repo> --directory <relative> --client <basename> | <repair> --root <repo> --directory <relative> --client <basename> --expect-target <raw-target>",
  );
}

function parseCLI(args: readonly string[]): ParsedCLI {
  const mode = args[0] as Mode;
  if (!(["discover", "verify", "create", "repair"] as const).includes(mode)) usage();
  let root: string | undefined;
  let directory: string | undefined;
  let client: string | undefined;
  let expectTarget: string | undefined;
  const clients: string[] = [];
  for (let index = 1; index < args.length; index += 2) {
    const value = args[index + 1];
    if (value === undefined) usage();
    if (args[index] === "--root" && root === undefined) root = value;
    else if (args[index] === "--client-name") clients.push(value);
    else if (args[index] === "--directory" && directory === undefined) directory = value;
    else if (args[index] === "--client" && client === undefined) client = value;
    else if (args[index] === "--expect-target" && expectTarget === undefined) expectTarget = value;
    else usage();
  }
  if (!root) usage();
  if ((mode === "discover" || mode === "verify") && (directory || client || expectTarget)) usage();
  if ((mode === "create" || mode === "repair") && (!directory || !client || clients.length > 0)) usage();
  if (mode === "create" && expectTarget !== undefined) usage();
  if (mode === "repair" && expectTarget === undefined) usage();
  try {
    for (const name of clients) validateClientName(name);
    if (client) validateClientName(client);
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }
  return { mode, root, clients, directory, client, expectTarget };
}

async function main(args: readonly string[]): Promise<void> {
  const parsed = parseCLI(args);
  let receipt: TopologyReceipt;
  if (parsed.mode === "discover" || parsed.mode === "verify") {
    receipt = await discoverTopology(parsed.root, parsed.clients, parsed.mode);
  } else if (parsed.mode === "create") {
    receipt = await createClientLink(parsed.root, parsed.directory!, parsed.client!);
  } else {
    receipt = await repairClientLink(parsed.root, parsed.directory!, parsed.client!, parsed.expectTarget!);
  }
  console.log(JSON.stringify(receipt));
  if (parsed.mode === "verify" && !receipt.valid) process.exit(2);
}

export function topologyFailureReceipt(error: unknown): Record<string, unknown> {
  const causes = error instanceof AggregateError ? error.errors.map(String) : undefined;
  const refused = error instanceof UsageError;
  const operation = error instanceof TopologyOperationError ? error : undefined;
  return {
    schema: topologySchema,
    outcome: refused ? "refused" : "failed",
    code: refused ? "invalid_arguments" : "topology_operation_failed",
    mutations: operation?.mutationPaths ?? [],
    recovery_artifacts: operation?.recoveryArtifacts ?? [],
    detail: error instanceof Error ? error.message : String(error),
    ...(causes ? { causes } : {}),
  };
}

if (import.meta.main) {
  main(process.argv.slice(2)).catch((error) => {
    const refused = error instanceof UsageError;
    console.log(JSON.stringify(topologyFailureReceipt(error)));
    process.exit(refused ? 2 : 1);
  });
}
