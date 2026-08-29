import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

const receiptSchema = "tailrocks.idea-capture/v1";
const maximumInputBytes = 1_000_000;

async function safeInstalledPackage(entrypoint: string, skillFile: string): Promise<void> {
  const resolved = path.resolve(entrypoint);
  const scripts = path.dirname(resolved);
  const plugin = path.dirname(scripts);
  const expectedSkill = path.join(plugin, "skills", "tailrocks-idea", "SKILL.md");
  if (path.resolve(skillFile) !== expectedSkill) throw new Error("loader skill does not own idea entrypoint");
  for (const [candidate, kind] of [
    [plugin, "directory"],
    [scripts, "directory"],
    [resolved, "file"],
    [expectedSkill, "file"],
    [path.join(scripts, "idea-capture-core.ts"), "file"],
    [path.join(scripts, "atomic-file-transaction.ts"), "file"],
    [path.join(scripts, "create-pr.ts"), "file"],
    [path.join(scripts, "bounded-command.ts"), "file"],
    [path.join(scripts, "resolve-executable.ts"), "file"],
    [path.join(scripts, "roadmap-item-state.ts"), "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (
      info.isSymbolicLink() ||
      (kind === "file" ? !info.isFile() : !info.isDirectory()) ||
      (await realpath(candidate)) !== candidate
    )
      throw new Error("installed idea package is unsafe");
  }
}

async function readStdin(): Promise<unknown> {
  const reader = Bun.stdin.stream().getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  const timer = setTimeout(() => reader.cancel("stdin deadline exceeded"), 5_000);
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > maximumInputBytes) throw new Error("stdin is too large");
      chunks.push(result.value);
    }
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
  if (bytes === 0) throw new Error("stdin is empty");
  return JSON.parse(
    new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.concat(
        chunks.map((chunk) => Buffer.from(chunk)),
        bytes,
      ),
    ),
  );
}

if (import.meta.main) {
  let receipt: Record<string, unknown>;
  try {
    const rawArgs = process.argv.slice(2);
    if (rawArgs.length !== 3 || rawArgs[0] !== "--skill-file")
      throw new Error("usage: idea-capture --skill-file <absolute-SKILL.md> <roadmap-slug>");
    await safeInstalledPackage(process.argv[1]!, rawArgs[1]!);
    const core = await import("./idea-capture-core");
    const args = core.parseIdeaCaptureArguments(rawArgs);
    receipt = (await core.captureIdea(process.cwd(), args.slug, await readStdin())) as unknown as Record<
      string,
      unknown
    >;
  } catch (error) {
    receipt = {
      schema: receiptSchema,
      outcome: "refused",
      code: "invalid_input",
      slug: "",
      branch: "",
      commit: "",
      pull_request: "",
      files: [],
      recovery_artifacts: [],
      external_actions: [],
      detail: error instanceof Error ? error.message : "CLI refused",
    };
  }
  console.log(JSON.stringify(receipt));
  process.exit(receipt.outcome === "captured" ? 0 : receipt.outcome === "refused" ? 2 : 1);
}
