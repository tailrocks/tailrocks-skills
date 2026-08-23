import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

async function verifyLoader(): Promise<void> {
  const args = process.argv.slice(2),
    script = path.resolve(process.argv[1]!);
  if (args.length !== 2 || args[0] !== "--skill-file" || !path.isAbsolute(args[1]!))
    throw new Error("usage: macos-design-review-finalize --skill-file <absolute-SKILL.md>");
  const plugin = path.dirname(path.dirname(script)),
    expected = path.join(plugin, "skills", "tailrocks-macos-design-review", "SKILL.md");
  if (args[1] !== expected) throw new Error("loader is not bound to review owner");
  for (const candidate of [
    script,
    expected,
    path.join(plugin, "scripts", "macos-design-contract.ts"),
    path.join(plugin, "scripts", "bounded-json-stdin.ts"),
    path.join(plugin, "scripts", "atomic-file-transaction.ts"),
  ]) {
    const info = await lstat(candidate);
    if (!info.isFile() || info.isSymbolicLink() || (await realpath(candidate)) !== candidate)
      throw new Error("installed review command is unsafe");
  }
}
if (import.meta.main) {
  try {
    await verifyLoader();
    const { readBoundedJsonStdin } = await import("./bounded-json-stdin");
    const { finalizeMacosDesignReview } = await import("./macos-design-contract");
    const receipt = finalizeMacosDesignReview(await readBoundedJsonStdin(1_000_000));
    console.log(JSON.stringify(receipt));
    process.exit(receipt.outcome === "PASS" || receipt.outcome === "PRELIMINARY" ? 0 : 2);
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: "tailrocks.macos.design-review/v1",
        outcome: "REFUSED",
        subject_revision: "",
        package_sha256: "",
        reviewer: "",
        author: "",
        live_session_id: null,
        matrix: [],
        category_scores: [],
        score: 0,
        score_cap: 0,
        cap_triggers: [],
        hard_failure_checks: [],
        hard_failures: [],
        findings: [],
        mutations: [],
        detail: error instanceof Error ? error.message : "review refused",
      }),
    );
    process.exit(2);
  }
}
