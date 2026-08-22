import { spawn } from "node:child_process";

export interface BoundedCommandOptions {
  readonly command: readonly string[];
  readonly cwd: string;
  readonly stdin?: string | Uint8Array;
  readonly env?: Record<string, string>;
  readonly timeoutMilliseconds?: number;
  readonly killGraceMilliseconds?: number;
  readonly maximumOutputBytes?: number;
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
}: BoundedCommandOptions): Promise<BoundedCommandResult> {
  if (
    command.length === 0 ||
    !Number.isSafeInteger(timeoutMilliseconds) ||
    timeoutMilliseconds < 1 ||
    !Number.isSafeInteger(killGraceMilliseconds) ||
    killGraceMilliseconds < 1 ||
    !Number.isSafeInteger(maximumOutputBytes) ||
    maximumOutputBytes < 1
  )
    throw new Error("bounded command options are invalid");

  const child = spawn(command[0]!, [...command.slice(1)], {
    cwd,
    env: env ? { ...process.env, ...env } : process.env,
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
  const signalTree = (signal: NodeJS.Signals): void => {
    if (!child.pid) return;
    try {
      if (process.platform === "win32") child.kill(signal);
      else process.kill(-child.pid, signal);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
    }
  };
  const stop = (): void => {
    signalTree("SIGTERM");
    forcePromise ??= new Promise((resolve) => setTimeout(resolve, killGraceMilliseconds)).then(async () => {
      signalTree("SIGKILL");
      if (process.platform === "win32" || !child.pid) return;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
          process.kill(-child.pid, 0);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ESRCH") return;
          throw error;
        }
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
