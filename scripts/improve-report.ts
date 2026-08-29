import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

const schema = "tailrocks.improve-report/v1";
const maximumInputBytes = 2_000_000;

async function verifyInstalled(entrypoint: string, skillFile: string): Promise<void> {
  const resolved = path.resolve(entrypoint);
  const scripts = path.dirname(resolved);
  const plugin = path.dirname(scripts);
  const expectedSkill = path.join(plugin, "skills", "tailrocks-improve", "SKILL.md");
  if (path.resolve(skillFile) !== expectedSkill) throw new Error("loader skill does not own improve report");
  for (const [candidate, kind] of [
    [plugin, "directory"],
    [scripts, "directory"],
    [resolved, "file"],
    [expectedSkill, "file"],
    [path.join(scripts, "improve-report-core.ts"), "file"],
    [path.join(scripts, "improve-route-resolver.ts"), "file"],
    [path.join(scripts, "improve-route-schema.ts"), "file"],
    [path.join(scripts, "bounded-command.ts"), "file"],
    [path.join(scripts, "resolve-executable.ts"), "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (
      info.isSymbolicLink() ||
      (kind === "file" ? !info.isFile() : !info.isDirectory()) ||
      (await realpath(candidate)) !== candidate
    )
      throw new Error("installed improve package is unsafe");
  }
}

async function stdin(): Promise<unknown> {
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
  if (!bytes) throw new Error("stdin is empty");
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
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== "--skill-file" || !path.isAbsolute(args[1]!))
      throw new Error("usage: improve-report --skill-file <absolute-SKILL.md>");
    await verifyInstalled(process.argv[1]!, args[1]!);
    const core = await import("./improve-report-core");
    receipt = (await core.finalizeImproveReport(process.cwd(), await stdin())) as unknown as Record<
      string,
      unknown
    >;
  } catch (error) {
    receipt = {
      schema,
      outcome: "refused",
      code: "invalid_input",
      root: "",
      revision: "",
      dirty_sha256: "",
      route: null,
      lanes: [],
      commands: [],
      defects: [],
      directions: [],
      rejected: [],
      candidate_count: 0,
      mutations: [],
      detail: error instanceof Error ? error.message : "CLI refused",
    };
  }
  console.log(JSON.stringify(receipt));
  process.exit(receipt.outcome === "reported" ? 0 : receipt.outcome === "routed" ? 3 : 2);
}
