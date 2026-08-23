import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

const schema = "tailrocks.merge-pr/v1";

async function verifyInstalled(entrypoint: string, skillFile: string): Promise<void> {
  const resolved = path.resolve(entrypoint);
  const scripts = path.dirname(resolved);
  const plugin = path.dirname(scripts);
  const expectedSkill = path.join(plugin, "skills", "tailrocks-merge-pr", "SKILL.md");
  if (path.resolve(skillFile) !== expectedSkill)
    throw new Error("loader skill does not own merge transaction");
  for (const [candidate, kind] of [
    [plugin, "directory"],
    [scripts, "directory"],
    [resolved, "file"],
    [expectedSkill, "file"],
    [path.join(scripts, "merge-pr-core.ts"), "file"],
    [path.join(scripts, "merge-preflight.ts"), "file"],
    [path.join(scripts, "bounded-command.ts"), "file"],
    [path.join(scripts, "documentation-discovery.ts"), "file"],
  ] as const) {
    const info = await lstat(candidate);
    if (
      info.isSymbolicLink() ||
      (kind === "file" ? !info.isFile() : !info.isDirectory()) ||
      (await realpath(candidate)) !== candidate
    )
      throw new Error("installed merge package is unsafe");
  }
}

if (import.meta.main) {
  let receipt: Record<string, unknown>;
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== "--skill-file" || !path.isAbsolute(args[1]!))
      throw new Error("usage: merge-pr --skill-file <absolute-SKILL.md>");
    await verifyInstalled(process.argv[1]!, args[1]!);
    const core = await import("./merge-pr-core");
    let value: unknown;
    try {
      value = JSON.parse(await core.readMergeRequestStdin());
    } catch (error) {
      value = { parseError: error instanceof Error ? error.message : String(error) };
    }
    receipt = (await core.mergePullRequest(value)) as unknown as Record<string, unknown>;
  } catch (error) {
    receipt = {
      schema,
      outcome: "refused",
      code: "invalid_request",
      mergeAttempted: false,
      commands: [],
      detail: error instanceof Error ? error.message : String(error),
    };
  }
  console.log(JSON.stringify(receipt));
  process.exit(
    receipt.outcome === "success"
      ? 0
      : receipt.outcome === "blocked" || receipt.outcome === "refused"
        ? 2
        : receipt.outcome === "uncertain"
          ? 3
          : 1,
  );
}
