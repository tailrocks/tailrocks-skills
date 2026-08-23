import { lstat, realpath } from "node:fs/promises";
import path from "node:path";

async function verifyLoader(): Promise<void> {
  const args = process.argv.slice(2),
    script = path.resolve(process.argv[1]!);
  if (args.length !== 2 || args[0] !== "--skill-file" || !path.isAbsolute(args[1]!))
    throw new Error("usage: macos-design-bless --skill-file <absolute-SKILL.md>");
  const plugin = path.dirname(path.dirname(script)),
    expected = path.join(plugin, "skills", "tailrocks-macos-design", "SKILL.md");
  if (args[1] !== expected) throw new Error("loader is not bound to design owner");
  for (const candidate of [
    script,
    expected,
    path.join(plugin, "scripts", "macos-design-contract.ts"),
    path.join(plugin, "scripts", "bounded-json-stdin.ts"),
    path.join(plugin, "scripts", "atomic-file-transaction.ts"),
  ]) {
    const info = await lstat(candidate);
    if (!info.isFile() || info.isSymbolicLink() || (await realpath(candidate)) !== candidate)
      throw new Error("installed bless command is unsafe");
  }
}
if (import.meta.main) {
  try {
    await verifyLoader();
    const { readBoundedJsonStdin } = await import("./bounded-json-stdin");
    const { blessMacosDesign } = await import("./macos-design-contract");
    const receipt = await blessMacosDesign(await readBoundedJsonStdin(1_000_000));
    console.log(JSON.stringify(receipt));
    process.exit(receipt.outcome === "BLESSED" ? 0 : 2);
  } catch (error) {
    console.log(
      JSON.stringify({
        schema: "tailrocks.macos-design-bless/v1",
        outcome: "REFUSED",
        paths: [],
        mutations: [],
        recovery_artifacts: [],
        review_sha256: "",
        signoff_sha256: "",
        signoff: null,
        ledger: [],
        partial_state: [],
        detail: error instanceof Error ? error.message : "blessing refused",
      }),
    );
    process.exit(2);
  }
}
