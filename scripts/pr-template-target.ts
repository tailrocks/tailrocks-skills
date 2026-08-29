import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

const receiptSchema = "tailrocks.pr-template-target/v1";

async function verifyLoader(): Promise<void> {
  const args = process.argv.slice(2);
  const entrypoint = path.resolve(process.argv[1]!);
  if (args.length !== 2 || args[0] !== "--skill-file" || !path.isAbsolute(args[1]!))
    throw new Error("usage: pr-template-target --skill-file <absolute-SKILL.md>");
  const scripts = path.dirname(entrypoint);
  const plugin = path.dirname(scripts);
  const skill = path.join(plugin, "skills/tailrocks-pr-template/SKILL.md");
  if (path.resolve(args[1]!) !== skill) throw new Error("loader is not bound to tailrocks-pr-template owner");
  for (const [candidate, kind] of [
    [plugin, "directory"],
    [scripts, "directory"],
    [entrypoint, "file"],
    [path.join(scripts, "pr-template-target-core.ts"), "file"],
    [path.join(scripts, "atomic-file-transaction.ts"), "file"],
    [path.join(scripts, "bounded-command.ts"), "file"],
    [path.join(scripts, "resolve-executable.ts"), "file"],
    [skill, "file"],
    [path.join(plugin, "skills/tailrocks-pr-template/references/PULL_REQUEST_TEMPLATE.md"), "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (
      info.isSymbolicLink() ||
      (kind === "file" ? !info.isFile() : !info.isDirectory()) ||
      (await realpath(candidate)) !== candidate
    )
      throw new Error("installed PR-template package is unsafe");
  }
}

async function readStdin(): Promise<unknown> {
  const reader = Bun.stdin.stream().getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  const timer = setTimeout(() => void reader.cancel("stdin deadline exceeded"), 5_000);
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      bytes += next.value.byteLength;
      if (bytes > 1_000_000) throw new Error("stdin is too large");
      chunks.push(next.value);
    }
  } finally {
    clearTimeout(timer);
  }
  if (!bytes) throw new Error("stdin is empty");
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function refusalReceipt(error: unknown): Record<string, unknown> {
  const structured = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
  const paths = (field: "mutations" | "recoveryArtifacts"): string[] => {
    const value = structured[field];
    return Array.isArray(value) && value.every((item) => typeof item === "string")
      ? [...new Set(value)].sort()
      : [];
  };
  return {
    schema: receiptSchema,
    outcome: "REFUSED",
    mutations: paths("mutations"),
    recovery_artifacts: paths("recoveryArtifacts"),
    detail: error instanceof Error ? error.message : String(error),
  };
}

if (import.meta.main) {
  try {
    await verifyLoader();
    const { runPrTemplateTarget } = await import("./pr-template-target-core");
    await verifyLoader();
    const receipt = await runPrTemplateTarget(await readStdin());
    console.log(JSON.stringify(receipt));
    process.exit(0);
  } catch (error) {
    console.log(JSON.stringify(refusalReceipt(error)));
    process.exit(2);
  }
}
