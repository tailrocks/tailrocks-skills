import { readdir } from "node:fs/promises";
import path from "node:path";

const schema = "tailrocks.check-static-site/v1";
try {
  if (Bun.argv.length !== 2) throw new Error("check-static-site takes no arguments");
  const root = path.resolve(import.meta.dir, "../..");
  const output = path.join(root, "docs/dist/client");

  const skills = (await readdir(path.join(root, "skills"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const required = [
    "index.html",
    "404.html",
    ".nojekyll",
    "CNAME",
    "docs/index.html",
    "docs/skills/index.html",
    "docs/delivery/index.html",
    "docs/delivery/macos-app/index.html",
    "docs/delivery/tanstack-feature/index.html",
  ];

  for (const relative of required) {
    if (!(await Bun.file(path.join(output, relative)).exists())) {
      throw new Error(`static docs output missing ${relative}`);
    }
  }

  // Every skill must reach the site; a page that fails to prerender is a silent gap.
  for (const skill of skills) {
    for (const leaf of ["index.html", "definition/index.html"]) {
      const nested = path.join(output, "docs/skills", skill, leaf);
      if (!(await Bun.file(nested).exists())) {
        throw new Error(
          `static docs output missing docs/skills/${skill}/${leaf} — prerender did not reach it`,
        );
      }
    }
    const page = path.join(output, "docs/skills", skill, "index.html");
    if (!(await Bun.file(page).exists())) {
      throw new Error(
        `static docs output missing docs/skills/${skill}/index.html — prerender did not reach it`,
      );
    }
  }

  const index = await Bun.file(path.join(output, "docs/skills/index.html")).text();
  if (!index.includes('href="/docs/skills/tailrocks-rust-best-practices"')) {
    throw new Error("skill index links do not use the custom-domain root");
  }
  if (index.includes("/tailrocks-skills/")) {
    throw new Error("project Pages base path remains in static output");
  }

  console.log(
    JSON.stringify({
      schema,
      outcome: "success",
      code: "checked",
      skill_pages: skills.length,
      mutations: [],
      detail: "static documentation output is complete",
    }),
  );
} catch (error) {
  const refused = error instanceof Error && error.message === "check-static-site takes no arguments";
  console.log(
    JSON.stringify({
      schema,
      outcome: refused ? "refused" : "failed",
      code: refused ? "invalid_arguments" : "check_failed",
      mutations: [],
      recovery_artifacts: [],
      detail: error instanceof Error ? error.message : String(error),
    }),
  );
  process.exit(refused ? 2 : 1);
}
