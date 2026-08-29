import { lstat, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const receiptSchema = "tailrocks.prove-driver/v1";

async function verifyLoader(): Promise<void> {
  const args = process.argv.slice(2),
    script = path.resolve(process.argv[1]!);
  if (args.length !== 2 || args[0] !== "--skill-file" || !path.isAbsolute(args[1]!))
    throw new Error("usage: prove-driver --skill-file <loader-provided-absolute-SKILL.md>");
  const scripts = path.dirname(script),
    plugin = path.dirname(scripts),
    expected = path.join(plugin, "skills", "tailrocks-prove", "SKILL.md");
  if (args[1] !== expected) throw new Error("loader is not bound to tailrocks-prove owner");
  for (const candidate of [
    script,
    path.join(scripts, "prove-driver-core.ts"),
    path.join(scripts, "bounded-command.ts"),
    path.join(scripts, "resolve-executable.ts"),
    path.join(scripts, "bounded-json-stdin.ts"),
    expected,
  ]) {
    const info = await lstat(candidate);
    if (!info.isFile() || info.isSymbolicLink() || (await realpath(candidate)) !== candidate)
      throw new Error("installed prove-driver dependency is unsafe");
  }
}

if (import.meta.main) {
  let operation: unknown = "unknown";
  let recovery: string[] = [];
  try {
    await verifyLoader();
    const { readBoundedJsonStdin } = await import("./bounded-json-stdin");
    const input = await readBoundedJsonStdin(1_000_000, 5_000);
    operation = (input as Record<string, unknown>)?.operation;
    const manifest = (input as Record<string, unknown>)?.session_manifest;
    if (
      typeof manifest === "string" &&
      path.isAbsolute(manifest) &&
      manifest.startsWith(`${await realpath(tmpdir())}${path.sep}tailrocks-prove-`) &&
      path.basename(path.dirname(manifest)).startsWith("tailrocks-prove-")
    ) {
      recovery = [path.dirname(manifest)];
    }
    const { runProveDriver } = await import("./prove-driver-core");
    const receipt = await runProveDriver(input);
    console.log(JSON.stringify(receipt));
    process.exit(receipt.outcome === "REFUSED" || receipt.outcome === "FAILED" ? 2 : 0);
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: receiptSchema,
        operation,
        outcome: "REFUSED",
        mutations: [],
        recovery,
        detail: error instanceof Error ? error.message : "prove driver refused",
      }),
    );
    process.exit(2);
  }
}
