import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

async function loaderSkill(): Promise<string> {
  const args = process.argv.slice(2),
    entrypoint = path.resolve(process.argv[1] ?? ""),
    skill = path.dirname(path.dirname(entrypoint));
  if (
    args.length !== 2 ||
    args[0] !== "--skill-file" ||
    !path.isAbsolute(args[1]!) ||
    path.resolve(args[1]!) !== path.join(skill, "SKILL.md")
  )
    throw new Error("loader skill does not own entrypoint");
  for (const [candidate, kind] of [
    [entrypoint, "file"],
    [args[1]!, "file"],
    [skill, "directory"],
  ] as const) {
    const info = await lstat(candidate);
    if (
      info.isSymbolicLink() ||
      (kind === "file" ? !info.isFile() : !info.isDirectory()) ||
      (await realpath(candidate)) !== candidate
    )
      throw new Error("loader contribution package is unsafe");
  }
  return args[1]!;
}
if (import.meta.main) {
  try {
    const skillFile = await loaderSkill();
    const { contributionStageCli } = await import("../../../scripts/contribution-stage-core");
    process.exit(await contributionStageCli("respond", process.argv[1]!, skillFile));
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({ schema: "tailrocks.contribution-stage/v1", stage: "respond", outcome: "refused", code: "invalid_input", contribution_id: "", repository: "", head: "", actions: [], mutations: [], partial_state: [], recovery_artifacts: [], runtime: null, detail: error instanceof Error ? error.message : "bootstrap refused" })}\n`,
    );
    process.exit(2);
  }
}
