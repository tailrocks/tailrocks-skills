import { spawn, spawnSync } from "node:child_process";

export interface BoundedCommandOptions {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly stdin?: string | Uint8Array;
  readonly env?: Record<string, string>;
  readonly timeoutMilliseconds?: number;
  readonly killGraceMilliseconds?: number;
  readonly maximumOutputBytes?: number;
  readonly inheritEnvironment?: boolean;
}

export interface BoundedCommandResult {
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  readonly saturated: boolean;
}

export async function runBoundedCommand({
  command,
  cwd,
  stdin,
  env,
  timeoutMilliseconds = 30_000,
  killGraceMilliseconds = 5_000,
  maximumOutputBytes = 10_000_000,
  inheritEnvironment = true,
}: BoundedCommandOptions): Promise<BoundedCommandResult> {
  if (
    command.length === 0 ||
    !Number.isSafeInteger(timeoutMilliseconds) ||
    timeoutMilliseconds < 1 ||
    !Number.isSafeInteger(killGraceMilliseconds) ||
    killGraceMilliseconds < 1 ||
    !Number.isSafeInteger(maximumOutputBytes) ||
    maximumOutputBytes < 1 ||
    typeof inheritEnvironment !== "boolean"
  )
    throw new Error("bounded command options are invalid");

  const child = spawn(command[0]!, [...command.slice(1)], {
    cwd,
    env: inheritEnvironment ? (env ? { ...process.env, ...env } : process.env) : env,
    detached: process.platform !== "win32",
    stdio: [stdin === undefined ? "ignore" : "pipe", "pipe", "pipe"],
  });
  if (stdin !== undefined) child.stdin!.end(stdin);
  let timedOut = false;
  let saturated = false;
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];
  let stdoutBytes = 0;
  let stderrBytes = 0;
  let forcePromise: Promise<void> | undefined;
  const ownedProcesses = new Map<number, string>();
  const processTable = (): Array<{
    pid: number;
    parent: number;
    group: number;
    state: string;
    started: string;
  }> => {
    if (process.platform === "win32") return [];
    const processes = spawnSync("/bin/ps", ["-axo", "pid=,ppid=,pgid=,stat=,lstart="], {
      encoding: "utf8",
      timeout: 1_000,
    });
    if (processes.status !== 0 || processes.error) return [];
    return processes.stdout.split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(.+?)\s*$/);
      if (!match) return [];
      return [
        {
          pid: Number(match[1]),
          parent: Number(match[2]),
          group: Number(match[3]),
          state: match[4]!,
          started: match[5]!,
        },
      ];
    });
  };
  const captureTree = (rows = processTable()): void => {
    if (!child.pid) return;
    const selected = new Set<number>([child.pid]);
    for (let pass = 0; pass < rows.length; pass += 1) {
      let changed = false;
      for (const row of rows) {
        if (row.pid === process.pid || selected.has(row.pid)) continue;
        if (row.group === child.pid || selected.has(row.parent)) {
          selected.add(row.pid);
          changed = true;
        }
      }
      if (!changed) break;
    }
    for (const row of rows) if (selected.has(row.pid)) ownedProcesses.set(row.pid, row.started);
  };
  const stillOwned = (pid: number, started: string): boolean => {
    const row = processTable().find((candidate) => candidate.pid === pid);
    return row?.started === started && !row.state.startsWith("Z");
  };
  const signalTree = (signal: NodeJS.Signals): void => {
    if (!child.pid) return;
    const rows = processTable();
    captureTree(rows);
    if (process.platform === "win32") {
      child.kill(signal);
      return;
    }
    const childRow = rows.find((row) => row.pid === child.pid);
    if (childRow?.group === child.pid) {
      try {
        process.kill(-child.pid, signal);
      } catch (groupError) {
        const code = (groupError as NodeJS.ErrnoException).code;
        if (code !== "ESRCH" && code !== "EPERM" && stillOwned(child.pid, childRow.started)) throw groupError;
      }
    }
    for (const [pid, started] of [...ownedProcesses].sort(([left], [right]) => right - left)) {
      if (!stillOwned(pid, started)) continue;
      try {
        process.kill(pid, signal);
      } catch (memberError) {
        if ((memberError as NodeJS.ErrnoException).code !== "ESRCH" && stillOwned(pid, started))
          throw memberError;
      }
    }
  };
  const stop = (): void => {
    signalTree("SIGTERM");
    forcePromise ??= new Promise((resolve) => setTimeout(resolve, killGraceMilliseconds)).then(async () => {
      signalTree("SIGKILL");
      if (process.platform === "win32" || !child.pid) return;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        if ([...ownedProcesses].every(([pid, started]) => !stillOwned(pid, started))) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error("command process group survived SIGKILL");
    });
  };
  const collect =
    (target: Buffer[], stream: "stdout" | "stderr") =>
    (chunk: Buffer): void => {
      const next = (stream === "stdout" ? stdoutBytes : stderrBytes) + chunk.byteLength;
      if (next > maximumOutputBytes) {
        saturated = true;
        child.stdout?.destroy();
        child.stderr?.destroy();
        stop();
        return;
      }
      if (stream === "stdout") stdoutBytes = next;
      else stderrBytes = next;
      target.push(chunk);
    };
  child.stdout!.on("data", collect(stdout, "stdout"));
  child.stderr!.on("data", collect(stderr, "stderr"));
  const timeout = setTimeout(() => {
    timedOut = true;
    child.stdout?.destroy();
    child.stderr?.destroy();
    stop();
  }, timeoutMilliseconds);
  let code: number;
  try {
    code = await new Promise<number>((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (value, signal) => resolve(value ?? (signal ? 128 : 1)));
    });
  } finally {
    clearTimeout(timeout);
    if (forcePromise) await forcePromise;
  }
  return {
    code: timedOut ? 124 : saturated ? 125 : code,
    stdout: Buffer.concat(stdout).toString(),
    stderr: timedOut
      ? "command timed out"
      : saturated
        ? "command output exceeded limit"
        : Buffer.concat(stderr).toString(),
    timedOut,
    saturated,
  };
}
