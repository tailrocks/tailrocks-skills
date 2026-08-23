import { readFile } from "node:fs/promises";

import { atomicWriteFiles } from "../../scripts/atomic-file-transaction";

const schema = "tailrocks.finalize-static-site/v1";
const output = `${import.meta.dir}/../dist/client`;

async function current(file: string): Promise<Buffer | null> {
  try {
    return await readFile(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

try {
  if (Bun.argv.length !== 2) throw new Error("finalize-static-site takes no arguments");
  const shell = `${output}/_shell.html`;
  const html = await readFile(shell);
  const targets = [
    { file: `${output}/index.html`, content: html },
    { file: `${output}/404.html`, content: html },
    { file: `${output}/.nojekyll`, content: "" },
  ];
  await atomicWriteFiles(
    await Promise.all(targets.map(async (item) => ({ ...item, expected: await current(item.file) }))),
  );
  console.log(
    JSON.stringify({
      schema,
      outcome: "success",
      code: "finalized",
      mutations: targets.map((item) => item.file),
      detail: "static SPA shell promoted",
    }),
  );
} catch (error) {
  const refused = error instanceof Error && error.message === "finalize-static-site takes no arguments";
  console.log(
    JSON.stringify({
      schema,
      outcome: refused ? "refused" : "failed",
      code: refused ? "invalid_arguments" : "finalization_failed",
      mutations: [],
      recovery_artifacts: [],
      detail: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(refused ? 2 : 1);
}
