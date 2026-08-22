import { spawn } from "node:child_process";
import { chmod, lstat, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const schema = "tailrocks.macos-visual-qa-operation/v1";
const args = Bun.argv.slice(2);
const command = args[0];
const separator = args[1];
const forwarded = args.slice(2);
const allowedStates = new Set([
  "increase-contrast",
  "reduce-transparency",
  "reduce-motion",
  "differentiate-without-color",
  "dark",
  "light",
]);
const timeoutOverride = process.env.TAILROCKS_VISUAL_QA_TIMEOUT_MILLISECONDS;
const timeoutMilliseconds = timeoutOverride === undefined ? undefined : Number(timeoutOverride);
const killGraceOverride = process.env.TAILROCKS_VISUAL_QA_KILL_GRACE_MILLISECONDS;
const killGraceMilliseconds = killGraceOverride === undefined ? 5_000 : Number(killGraceOverride);

function refusal(detail: string): never {
  console.log(
    JSON.stringify({
      schema,
      outcome: "refused",
      code: "invalid_arguments",
      command,
      mutations: [],
      system_mutations: [],
      recovery_artifacts: [],
      detail,
    }),
  );
  process.exit(2);
}

if ((command !== "capture" && command !== "state") || separator !== "--" || forwarded.length === 0)
  refusal("usage: bun run.ts capture|state -- ARGV...");
if (
  timeoutMilliseconds !== undefined &&
  (!Number.isSafeInteger(timeoutMilliseconds) || timeoutMilliseconds < 10)
)
  refusal("TAILROCKS_VISUAL_QA_TIMEOUT_MILLISECONDS must be an integer of at least 10");
if (!Number.isSafeInteger(killGraceMilliseconds) || killGraceMilliseconds < 10)
  refusal("TAILROCKS_VISUAL_QA_KILL_GRACE_MILLISECONDS must be an integer of at least 10");
if (command === "capture") {
  if (forwarded.length < 2) refusal("capture requires APP and OUT");
  let index = 2;
  if (forwarded[index] === "--window-title") {
    if (!forwarded[index + 1] || forwarded[index + 1] === "--") refusal("--window-title requires TITLE");
    index += 2;
  }
  if (index < forwarded.length) {
    if (forwarded[index] !== "--" || index + 1 >= forwarded.length)
      refusal("application arguments require an inner -- separator");
  }
}
if (command === "state" && !["snapshot", "recover", "with"].includes(forwarded[0]!))
  refusal("state requires snapshot, recover, or with");
if (command === "state" && forwarded[0] === "snapshot" && forwarded.length !== 2)
  refusal("state snapshot requires exactly one file");
if (command === "state" && forwarded[0] === "recover" && forwarded.length !== 3)
  refusal("state recover requires exactly two files");
if (command === "state" && forwarded[0] === "with") {
  if (!allowedStates.has(forwarded[1]!)) refusal("state with requires a known state");
  if (forwarded.length < 4 || forwarded[2] !== "--") refusal("state with requires STATE -- COMMAND...");
}

let recoveryDirectory: string | undefined;
let recoveryPaths: string[] = [];
try {
  const script = `${import.meta.dir}/${command === "capture" ? "capture.sh" : "state.sh"}`;
  const childEnvironment = { ...process.env };
  if (command === "state" && forwarded[0] === "with") {
    recoveryDirectory = await mkdtemp(path.join(tmpdir(), "tailrocks-state-"));
    await chmod(recoveryDirectory, 0o700);
    recoveryPaths = [path.join(recoveryDirectory, "before"), path.join(recoveryDirectory, "applied")];
    childEnvironment.TAILROCKS_STATE_BEFORE = recoveryPaths[0]!;
    childEnvironment.TAILROCKS_STATE_APPLIED = recoveryPaths[1]!;
  }
  const child = spawn("/bin/sh", [script, ...forwarded], {
    cwd: process.cwd(),
    env: childEnvironment,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let timedOut = false;
  let saturated = false;
  let forcePromise: Promise<void> | undefined;
  const output = { stdout: [] as Buffer[], stderr: [] as Buffer[], stdoutBytes: 0, stderrBytes: 0 };
  const signalTree = (signal: NodeJS.Signals): void => {
    if (!child.pid) return;
    try {
      process.kill(-child.pid, signal);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
    }
  };
  const stop = (): void => {
    signalTree("SIGTERM");
    forcePromise ??= new Promise((resolve) => setTimeout(resolve, killGraceMilliseconds)).then(async () => {
      signalTree("SIGKILL");
      if (!child.pid) return;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        try {
          process.kill(-child.pid, 0);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ESRCH") return;
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error("operation process group survived SIGKILL");
    });
  };
  const collect =
    (name: "stdout" | "stderr") =>
    (chunk: Buffer): void => {
      const bytesKey = `${name}Bytes` as const;
      output[bytesKey] += chunk.byteLength;
      if (output[bytesKey] > 5_000_000) {
        saturated = true;
        child.stdout.destroy();
        child.stderr.destroy();
        stop();
        return;
      }
      output[name].push(chunk);
    };
  child.stdout.on("data", collect("stdout"));
  child.stderr.on("data", collect("stderr"));
  const timeout = setTimeout(
    () => {
      timedOut = true;
      child.stdout.destroy();
      child.stderr.destroy();
      stop();
    },
    timeoutMilliseconds ?? (command === "capture" ? 120_000 : 600_000),
  );
  const exit = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => resolve(code ?? (signal ? 128 : 1)));
  });
  clearTimeout(timeout);
  if (forcePromise) await forcePromise;
  const stdout = Buffer.concat(output.stdout).toString();
  const stderr = Buffer.concat(output.stderr).toString();
  let data: unknown;
  try {
    data = stdout.trim() ? JSON.parse(stdout) : undefined;
  } catch {
    data = undefined;
  }
  const success = exit === 0 && !timedOut && !saturated && (command !== "capture" || data !== undefined);
  const mutations =
    success && command === "capture"
      ? [forwarded[1]!, `${forwarded[1]!}.json`]
      : success && command === "state" && forwarded[0] === "snapshot"
        ? [forwarded[1]!]
        : [];
  const preferenceKeys = [
    "com.apple.universalaccess.increaseContrast",
    "com.apple.universalaccess.reduceTransparency",
    "com.apple.universalaccess.reduceMotion",
    "com.apple.universalaccess.differentiateWithoutColor",
    "NSGlobalDomain.AppleInterfaceStyle",
    "NSGlobalDomain.AppleInterfaceStyleSwitchesAutomatically",
  ];
  const systemMutations =
    command === "state" && (forwarded[0] === "with" || forwarded[0] === "recover")
      ? preferenceKeys.map((key) => ({ key, restored: success }))
      : [];
  const recoveryMatch = stderr.match(/recovery snapshots retained:\s+(\S+)\s+(\S+)/);
  const retained = [
    ...new Set([
      ...(recoveryMatch ? recoveryMatch.slice(1) : []),
      ...(
        await Promise.all(
          recoveryPaths.map(async (file) =>
            lstat(file)
              .then(() => file)
              .catch(() => undefined),
          ),
        )
      ).filter((file): file is string => file !== undefined),
    ]),
  ];
  if (recoveryDirectory && retained.length === 0)
    await rm(recoveryDirectory, { recursive: true, force: true });
  console.log(
    JSON.stringify({
      schema,
      outcome: success ? "success" : "failed",
      code: success
        ? `${command}_completed`
        : timedOut
          ? "timeout"
          : saturated
            ? "output_saturated"
            : `${command}_failed`,
      command,
      exit_code: timedOut ? 124 : saturated ? 125 : exit,
      mutations,
      system_mutations: systemMutations,
      recovery_artifacts: retained,
      data,
      detail: success
        ? `${command} completed`
        : timedOut
          ? `${command} timed out`
          : saturated
            ? `${command} output exceeded limit`
            : stderr.trim() || "operation failed",
    }),
  );
  if (!success) process.exit(1);
} catch (error) {
  const retained = (
    await Promise.all(
      recoveryPaths.map(async (file) =>
        lstat(file)
          .then(() => file)
          .catch(() => undefined),
      ),
    )
  ).filter((file): file is string => file !== undefined);
  if (recoveryDirectory && retained.length === 0)
    await rm(recoveryDirectory, { recursive: true, force: true });
  console.log(
    JSON.stringify({
      schema,
      outcome: "failed",
      code: `${command}_failed`,
      command,
      mutations: [],
      system_mutations: [],
      recovery_artifacts: retained,
      detail: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(1);
}
