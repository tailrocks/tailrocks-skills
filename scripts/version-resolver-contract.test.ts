import { expect, test } from "bun:test";

import { parseCrates } from "../skills/tailrocks-rust-project-setup/scripts/resolve-crate-versions";
import { parseArguments } from "../skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions";
import { runBoundedCommand } from "./bounded-command";

test("resolver parsers reject duplicate, malformed, and trailing state", () => {
  expect(() => parseCrates([])).toThrow();
  expect(() => parseCrates(["serde", "serde"])).toThrow();
  expect(() => parseCrates(["--check"])).toThrow();
  expect(() => parseArguments(["--check-template", "package.json", "extra"])).toThrow();
  expect(() => parseArguments(["react", "react"])).toThrow();
  expect(parseArguments(["@tanstack/react-router"])).toEqual({ packages: ["@tanstack/react-router"] });
});

test("invalid resolver CLI calls emit one terminal refusal receipt", async () => {
  const root = import.meta.dir;
  const scripts = [
    "../skills/tailrocks-rust-project-setup/scripts/resolve-crate-versions.ts",
    "../skills/tailrocks-tanstack-project-setup/scripts/resolve-package-versions.ts",
  ];
  for (const script of scripts) {
    const result = await runBoundedCommand({ command: ["bun", script], cwd: root });
    expect(result.code).toBe(2);
    expect(result.stderr).toBe("");
    const lines = result.stdout.trim().split("\n");
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0]!)).toMatchObject({
      outcome: "refused",
      code: "invalid_arguments",
      mutations: [],
    });
  }
});
