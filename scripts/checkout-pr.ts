import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

import { runBoundedCommand } from "./bounded-command";

export const checkoutSchema = "tailrocks.checkout-pr/v1";

export type CheckoutCode =
  | "switched"
  | "already_current"
  | "invalid_arguments"
  | "invalid_identifier"
  | "not_git_repo"
  | "dirty_tree"
  | "no_match"
  | "ambiguous_match"
  | "closed_confirmation_required"
  | "lookup_changed"
  | "lookup_failed"
  | "checkout_failed"
  | "verification_failed"
  | "recovery_failed";

export interface CommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut?: boolean;
}

export type CommandRunner = (command: readonly string[], cwd: string) => Promise<CommandResult>;

interface PullRequest {
  readonly number: number;
  readonly state: "OPEN" | "CLOSED" | "MERGED";
  readonly headRefName: string;
  readonly headRefOid: string;
  readonly headRepository: string | null;
}

export interface CheckoutReceipt {
  readonly schema: typeof checkoutSchema;
  readonly outcome: "success" | "refused" | "failed";
  readonly code: CheckoutCode;
  readonly input: string;
  readonly root: string;
  readonly pr?: PullRequest;
  readonly candidates?: readonly PullRequest[];
  readonly before?: { readonly branch: string | null; readonly head: string };
  readonly after?: { readonly branch: string | null; readonly head: string };
  readonly recovery?: "not_needed" | "restored" | "refused_dirty" | "failed";
  readonly commands: readonly (readonly string[])[];
  readonly detail: string;
}

interface CheckoutOptions {
  readonly root: string;
  readonly input: string;
  readonly confirmClosed?: number;
}

class CommandFailure extends Error {
  constructor(
    readonly command: readonly string[],
    readonly result: CommandResult,
  ) {
    super(
      result.timedOut
        ? `command timed out: ${command.join(" ")}`
        : `command failed (${result.code}): ${command.join(" ")}`,
    );
  }
}

export const defaultRunner: CommandRunner = (command, cwd) => runBoundedCommand({ command, cwd });

function codeUnitCompare(left: PullRequest, right: PullRequest): number {
  return left.number - right.number || (left.headRefName < right.headRefName ? -1 : 1);
}

async function safeRoot(input: string): Promise<string> {
  const absolute = path.resolve(input);
  const stats = await lstat(absolute);
  if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error("root must be a real directory");
  if ((await realpath(absolute)) !== absolute) throw new Error("root path may not traverse a symlink");
  return absolute;
}

async function invoke(
  runner: CommandRunner,
  commands: (readonly string[])[],
  cwd: string,
  command: readonly string[],
): Promise<CommandResult> {
  commands.push(command);
  try {
    return await runner(command, cwd);
  } catch (error) {
    return { code: 127, stdout: "", stderr: error instanceof Error ? error.message : String(error) };
  }
}

async function requireCommand(
  runner: CommandRunner,
  commands: (readonly string[])[],
  cwd: string,
  command: readonly string[],
): Promise<string> {
  const result = await invoke(runner, commands, cwd, command);
  if (result.code !== 0 || result.timedOut) throw new CommandFailure(command, result);
  return result.stdout;
}

function parsePullRequest(value: unknown): PullRequest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("PR result must be an object");
  const record = value as Record<string, unknown>;
  if (
    !Number.isSafeInteger(record.number) ||
    (record.number as number) < 1 ||
    !(["OPEN", "CLOSED", "MERGED"] as const).includes(record.state as never) ||
    typeof record.headRefName !== "string" ||
    record.headRefName.length === 0 ||
    typeof record.headRefOid !== "string" ||
    !/^[0-9a-f]{40}$/i.test(record.headRefOid)
  )
    throw new Error("PR result has invalid number, state, or headRefName");
  let headRepository: string | null = null;
  if (record.headRepository !== null && record.headRepository !== undefined) {
    if (typeof record.headRepository === "string") headRepository = record.headRepository;
    else if (
      typeof record.headRepository === "object" &&
      !Array.isArray(record.headRepository) &&
      typeof (record.headRepository as Record<string, unknown>).nameWithOwner === "string"
    )
      headRepository = (record.headRepository as Record<string, string>).nameWithOwner;
    else throw new Error("PR result has invalid headRepository");
  }
  return {
    number: record.number as number,
    state: record.state as PullRequest["state"],
    headRefName: record.headRefName,
    headRefOid: record.headRefOid,
    headRepository,
  };
}

function parseJson(stdout: string): unknown {
  const parsed = JSON.parse(stdout) as unknown;
  return parsed;
}

type Identifier =
  | { readonly kind: "number"; readonly value: string }
  | { readonly kind: "url"; readonly value: string }
  | { readonly kind: "branch"; readonly value: string };

async function classifyIdentifier(
  input: string,
  root: string,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<Identifier> {
  if (/^[1-9][0-9]*$/.test(input)) {
    if (!Number.isSafeInteger(Number(input))) throw new Error("PR number exceeds safe integer range");
    return { kind: "number", value: input };
  }
  if (/^[0-9]+$/.test(input)) throw new Error("PR number must be positive without leading zeroes");
  if (input.includes("://")) {
    const url = new URL(input);
    const match = url.pathname.match(/^\/[^/]+\/[^/]+\/pull\/([1-9][0-9]*)\/?$/);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !match ||
      !Number.isSafeInteger(Number(match[1]))
    )
      throw new Error("PR URL must be exact HTTPS /owner/repository/pull/number");
    return { kind: "url", value: url.href.replace(/\/$/, "") };
  }
  if (input.length === 0 || input.startsWith("-") || input.trim() !== input || input.includes("\0"))
    throw new Error("invalid branch identifier");
  const checked = await invoke(runner, commands, root, ["git", "check-ref-format", "--branch", input]);
  if (checked.code !== 0 || checked.timedOut) throw new Error("invalid branch identifier");
  return { kind: "branch", value: input };
}

async function viewPr(
  selector: string,
  root: string,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<PullRequest> {
  const stdout = await requireCommand(runner, commands, root, [
    "gh",
    "pr",
    "view",
    selector,
    "--json",
    "number,state,headRefName,headRefOid,headRepository",
  ]);
  return parsePullRequest(parseJson(stdout));
}

async function resolvePr(
  identifier: Identifier,
  root: string,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<{ pr?: PullRequest; candidates?: PullRequest[]; code?: CheckoutCode; detail?: string }> {
  if (identifier.kind !== "branch") return { pr: await viewPr(identifier.value, root, runner, commands) };
  const stdout = await requireCommand(runner, commands, root, [
    "gh",
    "pr",
    "list",
    "--head",
    identifier.value,
    "--state",
    "all",
    "--limit",
    "101",
    "--json",
    "number,state,headRefName,headRefOid,headRepository",
  ]);
  const parsed = parseJson(stdout);
  if (!Array.isArray(parsed)) throw new Error("branch lookup must return an array");
  if (parsed.length >= 101)
    return { candidates: [], code: "ambiguous_match", detail: "branch lookup saturated its bounded limit" };
  const exact = parsed
    .map(parsePullRequest)
    .filter((pr) => pr.headRefName === identifier.value)
    .sort(codeUnitCompare);
  const open = exact.filter((pr) => pr.state === "OPEN");
  if (open.length === 1) return { pr: open[0] };
  if (open.length > 1 || exact.length > 1)
    return { candidates: exact, code: "ambiguous_match", detail: "branch matched multiple pull requests" };
  if (exact.length === 0)
    return { candidates: [], code: "no_match", detail: "branch matched no pull request" };
  return { pr: exact[0] };
}

async function gitState(
  root: string,
  runner: CommandRunner,
  commands: (readonly string[])[],
): Promise<{ branch: string | null; head: string; dirty: boolean }> {
  const [branch, head, status] = await Promise.all([
    requireCommand(runner, commands, root, ["git", "branch", "--show-current"]),
    requireCommand(runner, commands, root, ["git", "rev-parse", "HEAD"]),
    requireCommand(runner, commands, root, ["git", "status", "--porcelain=v1", "-z"]),
  ]);
  return { branch: branch.trim() || null, head: head.trim(), dirty: status.length > 0 };
}

function receipt(
  options: CheckoutOptions,
  root: string,
  commands: readonly (readonly string[])[],
  values: Omit<CheckoutReceipt, "schema" | "input" | "root" | "commands">,
): CheckoutReceipt {
  return { schema: checkoutSchema, input: options.input, root, commands, ...values };
}

export async function checkoutPr(
  options: CheckoutOptions,
  runner: CommandRunner = defaultRunner,
): Promise<CheckoutReceipt> {
  const commands: (readonly string[])[] = [];
  let root: string;
  try {
    root = await safeRoot(options.root);
  } catch (error) {
    return receipt(options, path.resolve(options.root), commands, {
      outcome: "failed",
      code: "not_git_repo",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  try {
    const top = (
      await requireCommand(runner, commands, root, ["git", "rev-parse", "--show-toplevel"])
    ).trim();
    if ((await realpath(top)) !== root) throw new Error("--root must be the repository top level");
  } catch (error) {
    return receipt(options, root, commands, {
      outcome: "failed",
      code: "not_git_repo",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  let identifier: Identifier;
  try {
    identifier = await classifyIdentifier(options.input, root, runner, commands);
  } catch (error) {
    return receipt(options, root, commands, {
      outcome: "refused",
      code: "invalid_identifier",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  let before: Awaited<ReturnType<typeof gitState>>;
  try {
    before = await gitState(root, runner, commands);
  } catch (error) {
    return receipt(options, root, commands, {
      outcome: "failed",
      code: "not_git_repo",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  const beforeReceipt = { branch: before.branch, head: before.head };
  if (before.dirty)
    return receipt(options, root, commands, {
      outcome: "refused",
      code: "dirty_tree",
      before: beforeReceipt,
      detail: "working tree is dirty; commit, stash, or discard explicitly",
    });
  let resolved: Awaited<ReturnType<typeof resolvePr>>;
  try {
    resolved = await resolvePr(identifier, root, runner, commands);
  } catch (error) {
    return receipt(options, root, commands, {
      outcome: "failed",
      code: "lookup_failed",
      before: beforeReceipt,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  if (!resolved.pr)
    return receipt(options, root, commands, {
      outcome: "refused",
      code: resolved.code!,
      candidates: resolved.candidates,
      before: beforeReceipt,
      detail: resolved.detail!,
    });
  const initial = resolved.pr;
  const selector = identifier.kind === "url" ? identifier.value : String(initial.number);
  let fresh: PullRequest;
  try {
    fresh = await viewPr(selector, root, runner, commands);
  } catch (error) {
    return receipt(options, root, commands, {
      outcome: "failed",
      code: "lookup_failed",
      pr: initial,
      before: beforeReceipt,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  if (
    fresh.number !== initial.number ||
    fresh.headRefName !== initial.headRefName ||
    fresh.headRefOid !== initial.headRefOid
  )
    return receipt(options, root, commands, {
      outcome: "refused",
      code: "lookup_changed",
      pr: fresh,
      before: beforeReceipt,
      detail: "pull request identity changed during resolution",
    });
  if (fresh.state !== "OPEN" && options.confirmClosed !== fresh.number)
    return receipt(options, root, commands, {
      outcome: "refused",
      code: "closed_confirmation_required",
      pr: fresh,
      before: beforeReceipt,
      detail: `PR #${fresh.number} is ${fresh.state}; rerun with --confirm-closed ${fresh.number}`,
    });
  let finalGuard: Awaited<ReturnType<typeof gitState>>;
  try {
    finalGuard = await gitState(root, runner, commands);
  } catch (error) {
    return receipt(options, root, commands, {
      outcome: "failed",
      code: "not_git_repo",
      pr: fresh,
      before: beforeReceipt,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  if (finalGuard.dirty || finalGuard.branch !== before.branch || finalGuard.head !== before.head)
    return receipt(options, root, commands, {
      outcome: "refused",
      code: "dirty_tree",
      pr: fresh,
      before: beforeReceipt,
      detail: "repository state changed before checkout",
    });
  if (before.branch === fresh.headRefName && before.head === fresh.headRefOid)
    return receipt(options, root, commands, {
      outcome: "success",
      code: "already_current",
      pr: fresh,
      before: beforeReceipt,
      after: beforeReceipt,
      recovery: "not_needed",
      detail: `already on PR #${fresh.number} branch ${fresh.headRefName}`,
    });
  const checkout = await invoke(runner, commands, root, ["gh", "pr", "checkout", selector]);
  let after: Awaited<ReturnType<typeof gitState>>;
  try {
    after = await gitState(root, runner, commands);
  } catch {
    after = { branch: null, head: "", dirty: true };
  }
  if (
    checkout.code === 0 &&
    !checkout.timedOut &&
    !after.dirty &&
    after.branch === fresh.headRefName &&
    after.head === fresh.headRefOid
  )
    return receipt(options, root, commands, {
      outcome: "success",
      code: "switched",
      pr: fresh,
      before: beforeReceipt,
      after: { branch: after.branch, head: after.head },
      recovery: "not_needed",
      detail: `switched to ${fresh.headRefName} for PR #${fresh.number}`,
    });

  let recovery: CheckoutReceipt["recovery"] = "not_needed";
  if (after.branch !== before.branch || after.head !== before.head) {
    if (after.dirty) recovery = "refused_dirty";
    else {
      let recovered: CommandResult;
      if (before.branch && after.branch === before.branch && after.head !== before.head) {
        const detached = await invoke(runner, commands, root, ["git", "switch", "--detach", before.head]);
        const updated =
          detached.code === 0 && !detached.timedOut
            ? await invoke(runner, commands, root, [
                "git",
                "update-ref",
                `refs/heads/${before.branch}`,
                before.head,
                after.head,
              ])
            : detached;
        recovered =
          updated.code === 0 && !updated.timedOut
            ? await invoke(runner, commands, root, ["git", "switch", "--", before.branch])
            : updated;
      } else {
        const recoveryCommand = before.branch
          ? (["git", "switch", "--", before.branch] as const)
          : (["git", "switch", "--detach", before.head] as const);
        recovered = await invoke(runner, commands, root, recoveryCommand);
      }
      let proof: Awaited<ReturnType<typeof gitState>> | null = null;
      if (recovered.code === 0 && !recovered.timedOut) {
        try {
          proof = await gitState(root, runner, commands);
        } catch {
          proof = null;
        }
      }
      recovery =
        proof && !proof.dirty && proof.branch === before.branch && proof.head === before.head
          ? "restored"
          : "failed";
    }
  }
  const failedCode: CheckoutCode =
    recovery === "failed" || recovery === "refused_dirty"
      ? "recovery_failed"
      : checkout.code !== 0 || checkout.timedOut
        ? "checkout_failed"
        : "verification_failed";
  return receipt(options, root, commands, {
    outcome: "failed",
    code: failedCode,
    pr: fresh,
    before: beforeReceipt,
    after: { branch: after.branch, head: after.head },
    recovery,
    detail: `checkout did not prove branch ${fresh.headRefName} at ${fresh.headRefOid}`,
  });
}

function parseCli(args: readonly string[]): CheckoutOptions {
  let root: string | undefined;
  let confirmClosed: number | undefined;
  let input: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--root" && root === undefined) root = args[++index];
    else if (arg === "--confirm-closed" && confirmClosed === undefined) {
      const raw = args[++index];
      if (!raw || !/^[1-9][0-9]*$/.test(raw) || !Number.isSafeInteger(Number(raw)))
        throw new Error("--confirm-closed requires a safe positive PR number");
      confirmClosed = Number(raw);
    } else if (!arg.startsWith("-") && input === undefined) input = arg;
    else
      throw new Error(
        "usage: checkout-pr.ts --root <repository> [--confirm-closed <number>] <number|URL|branch>",
      );
  }
  if (!root || !input)
    throw new Error(
      "usage: checkout-pr.ts --root <repository> [--confirm-closed <number>] <number|URL|branch>",
    );
  return { root, input, confirmClosed };
}

if (import.meta.main) {
  try {
    const result = await checkoutPr(parseCli(process.argv.slice(2)));
    console.log(JSON.stringify(result));
    process.exit(result.outcome === "success" ? 0 : result.outcome === "refused" ? 2 : 1);
  } catch (error) {
    const invalid: CheckoutReceipt = {
      schema: checkoutSchema,
      outcome: "refused",
      code: "invalid_arguments",
      input: "",
      root: "",
      commands: [],
      detail: error instanceof Error ? error.message : String(error),
    };
    console.log(JSON.stringify(invalid));
    process.exit(2);
  }
}
