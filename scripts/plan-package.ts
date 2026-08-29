import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

const receiptSchema = "tailrocks.plan-package/v1";
const maximumInputBytes = 1_000_000;

async function verifyLoader(): Promise<void> {
  const args = process.argv.slice(2),
    script = path.resolve(process.argv[1]!);
  if (args.length !== 2 || args[0] !== "--skill-file" || !path.isAbsolute(args[1]!))
    throw new Error("usage: plan-package --skill-file <loader-provided-absolute-SKILL.md>");
  const plugin = path.dirname(script),
    expected = path.join(plugin, "..", "skills", "tailrocks-plan", "SKILL.md"),
    core = path.join(plugin, "plan-package-core.ts"),
    bounded = path.join(plugin, "bounded-command.ts"),
    resolver = path.join(plugin, "resolve-executable.ts"),
    checker = path.join(plugin, "..", "skills", "tailrocks-plan", "templates", "check.sh");
  if (path.normalize(args[1]!) !== path.normalize(expected))
    throw new Error("loader is not bound to tailrocks-plan owner");
  for (const candidate of [path.dirname(plugin), plugin]) {
    const info = await lstat(candidate);
    if (
      !info.isDirectory() ||
      info.isSymbolicLink() ||
      (await realpath(candidate)) !== path.normalize(candidate)
    )
      throw new Error("installed plan-package directory is unsafe");
  }
  for (const candidate of [script, core, bounded, resolver, expected, checker]) {
    const info = await lstat(candidate);
    if (!info.isFile() || info.isSymbolicLink() || (await realpath(candidate)) !== path.normalize(candidate))
      throw new Error("installed plan-package command is unsafe");
  }
}

async function stdin(): Promise<unknown> {
  const reader = Bun.stdin.stream().getReader(),
    chunks: Uint8Array[] = [];
  let bytes = 0,
    timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    void reader.cancel("stdin deadline exceeded");
  }, 5_000);
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > maximumInputBytes) throw new Error("stdin is too large");
      chunks.push(next.value);
    }
  } finally {
    clearTimeout(timer);
  }
  if (timedOut) throw new Error("stdin deadline exceeded");
  if (!bytes) throw new Error("stdin is empty");
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

if (import.meta.main) {
  try {
    await verifyLoader();
    const { runPlanPackage } = await import("./plan-package-core");
    await verifyLoader();
    const receipt = await runPlanPackage(await stdin());
    console.log(JSON.stringify(receipt));
    process.exit(
      [
        "PROVEN",
        "DEFERRED",
        "VALIDATED",
        "RESEARCH_REQUIRED",
        "START",
        "CONTINUE",
        "RECONCILE_REQUIRED",
        "REPLAN_REQUIRED",
        "BLOCKED",
        "COMPLETE",
      ].includes(String(receipt.outcome))
        ? 0
        : 2,
    );
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        operation: "unknown",
        outcome: "REFUSED",
        mutations: [],
        detail: error instanceof Error ? error.message : "plan package refused",
      }),
    );
    process.exit(2);
  }
}
