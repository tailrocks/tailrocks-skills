import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dir, "..");
const reports = [
  "content-movement-audit-retirement.md",
  "content-movement-design-pr.md",
  "content-movement-stack-authoring.md",
];

test("every final movement row carries a complete successful receipt", async () => {
  let rows = 0;
  for (const report of reports) {
    const source = await readFile(path.join(root, "skill-audits", report), "utf8");
    expect(source).toContain("Final-state ledger, not migration plan");
    expect(source).not.toContain("through the last");
    expect(source).not.toContain("compatibility window");
    expect(source).not.toContain("Frozen legacy");

    for (const line of source.split("\n")) {
      if (!/^\|.*\| (KEEP|MOVE|COPY|DELETE|SPLIT) \|/.test(line)) continue;
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      expect(cells).toHaveLength(5);
      expect(cells[0]?.length).toBeGreaterThan(0);
      expect(["KEEP", "MOVE", "COPY", "DELETE", "SPLIT"]).toContain(cells[1]);
      expect(cells[2]?.length).toBeGreaterThan(0);
      expect(cells[3]).toMatch(/scripts\/|ownership tests|reference\/version tests/);
      expect(cells[4]).toStartWith("PASS:");
      rows++;
    }
  }
  expect(rows).toBe(60);
});
